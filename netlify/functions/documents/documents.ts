// netlify/functions/documents/documents.ts
import type { HandlerEvent, Handler } from "@netlify/functions";
import { db } from "../../data/db";
import { documentsTable } from "../../data/schemas";
import { patientsTable } from "../../data/schemas";
import { eq } from "drizzle-orm";
import { validateJWT } from "../../middlewares";
import { fromBodyToObject, HEADERS } from "../../config/utils";
import { DocumentEmailService } from "../../services/documentEmailService";
import { EmailService } from "../../services/email.service";
import { generateDocumentPDF } from "../../services/pdfService";
import { AuditService } from "../../services/AuditService";
import { AUDIT_ENTITY_TYPES, AUDIT_ACTIONS } from "../../data/schemas";
import { envs } from "../../config/envs";

const handler: Handler = async (event: HandlerEvent) => {
  const { httpMethod, path } = event;

  // Manejar preflight CORS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: HEADERS.json,
    };
  }

  // Validar autenticación
  const user = await validateJWT(event.headers.authorization!);
  if (user.statusCode !== 200) return user;

  const userData = JSON.parse(user.body);
  const doctorId = userData.id;

  // Extraer ID del documento de la URL si existe
  const pathParts = path.split('/');
  const documentsIndex = pathParts.findIndex(part => part === 'documents');
  const documentId = pathParts[documentsIndex + 1] ? parseInt(pathParts[documentsIndex + 1]) : null;
  const action = pathParts[documentsIndex + 2]; // 'sign' si existe

  try {
    // GET /documents - Obtener TODOS los documentos del doctor actual
    if (httpMethod === "GET" && !documentId && !pathParts.includes('patient')) {
      const documents = await db
        .select()
        .from(documentsTable)
        .where(eq(documentsTable.id_doctor, doctorId));

      return {
        statusCode: 200,
        body: JSON.stringify(documents),
        headers: HEADERS.json,
      };
    }

    // GET /documents/patient/:patientId - Obtener documentos de un paciente específico
    if (httpMethod === "GET" && pathParts.includes('patient')) {
      const patientIndex = pathParts.findIndex(part => part === 'patient');
      const patientId = pathParts[patientIndex + 1] ? parseInt(pathParts[patientIndex + 1]) : null;

      if (!patientId || isNaN(patientId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Patient ID is required' }),
          headers: HEADERS.json,
        };
      }

      const documents = await db
        .select()
        .from(documentsTable)
        .where(eq(documentsTable.id_patient, patientId));

      return {
        statusCode: 200,
        body: JSON.stringify(documents),
        headers: HEADERS.json,
      };
    }

    // POST /documents - Crear documento
    if (httpMethod === "POST" && !documentId) {
      const body = event.body ? fromBodyToObject(event.body) : {};

      if (!body.id_patient || !body.document_type || !body.title || !body.content) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Missing required fields' }),
          headers: HEADERS.json,
        };
      }

      try {
        const [document] = await db
          .insert(documentsTable)
          .values({
            id_patient: Number(body.id_patient),
            id_doctor: doctorId,
            document_type: body.document_type,
            title: body.title,
            content: body.content,
            patient_name: body.patient_name || '',
            patient_rut: body.patient_rut || '',
            status: 'pendiente',
          })
          .returning();

        // 📝 Registrar en auditoría (creación de documento)
        const auditService = new AuditService(db);
        await auditService.logChange({
          patientId: Number(body.id_patient),
          entityType: AUDIT_ENTITY_TYPES.DOCUMENTO,
          entityId: document.id,
          action: AUDIT_ACTIONS.CREATED,
          newValues: {
            title: document.title,
            document_type: document.document_type,
            status: document.status,
          },
          changedBy: doctorId,
          notes: `Documento "${document.title}" creado (tipo: ${document.document_type})`,
        });

        return {
          statusCode: 201,
          body: JSON.stringify(document),
          headers: HEADERS.json,
        };
      } catch (error: any) {
        console.error('Error creating document:', error);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Internal server error' }),
          headers: HEADERS.json,
        };
      }
    }

    // PUT /documents/:documentId/sign - Firmar documento
    if (httpMethod === "PUT" && documentId && action === 'sign') {
      const body = event.body ? fromBodyToObject(event.body) : {};

      if (!body.signature_data) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Signature data is required' }),
          headers: HEADERS.json,
        };
      }

      try {
        // Obtener documento CON datos del paciente
        const [documentWithPatient] = await db
          .select({
            id: documentsTable.id,
            id_patient: documentsTable.id_patient,
            id_doctor: documentsTable.id_doctor,
            document_type: documentsTable.document_type,
            title: documentsTable.title,
            content: documentsTable.content,
            signature_data: documentsTable.signature_data,
            signed_date: documentsTable.signed_date,
            patient_name: documentsTable.patient_name,
            patient_rut: documentsTable.patient_rut,
            status: documentsTable.status,
            createdAt: documentsTable.createdAt,
            updatedAt: documentsTable.updatedAt,
            patientEmail: patientsTable.email,
          })
          .from(documentsTable)
          .leftJoin(patientsTable, eq(documentsTable.id_patient, patientsTable.id))
          .where(eq(documentsTable.id, documentId));

        if (!documentWithPatient) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Document not found' }),
            headers: HEADERS.json,
          };
        }

        // Actualizar documento con firma
        const [updatedDocument] = await db
          .update(documentsTable)
          .set({
            signature_data: body.signature_data,
            status: 'firmado',
            signed_date: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(documentsTable.id, documentId))
          .returning();

        // 📝 Generar PDF y guardar en auditoría
        let pdfBase64 = '';
        try {
          const pdfBuffer = await generateDocumentPDF(updatedDocument);
          pdfBase64 = pdfBuffer.toString('base64');
          console.log(`✅ PDF generated and converted to base64, size: ${pdfBase64.length} characters`);
        } catch (pdfError) {
          console.error('⚠️ Error generating PDF for audit log:', pdfError);
          // Continuar sin el PDF en el audit log
        }

        // 📝 Registrar en auditoría (cambio de estado: pendiente → firmado)
        const auditService = new AuditService(db);
        await auditService.logChange({
          patientId: documentWithPatient.id_patient,
          entityType: AUDIT_ENTITY_TYPES.DOCUMENTO,
          entityId: documentId,
          action: AUDIT_ACTIONS.STATUS_CHANGED,
          oldValues: { status: documentWithPatient.status },
          newValues: {
            status: updatedDocument.status,
            signed_date: updatedDocument.signed_date,
            title: updatedDocument.title,
            signature_data: updatedDocument.signature_data,
            pdf_base64: pdfBase64
          },
          changedBy: doctorId,
          notes: `Documento "${updatedDocument.title}" firmado`,
        });

        // Solo obtener email del paciente si se solicita envío de email
        const shouldSendEmail = body.send_email === true || body.send_email === 'true';
        const patientEmail = shouldSendEmail ? (body.patient_email || documentWithPatient.patientEmail) : null;

        console.log('🔍 Sign document debug:', {
          send_email: body.send_email,
          shouldSendEmail: shouldSendEmail,
          patientEmailFromDB: documentWithPatient.patientEmail,
          patientEmailFromBody: body.patient_email,
          finalPatientEmail: patientEmail,
          SEND_EMAIL_ENV: envs.SEND_EMAIL,
          MAILER_HOST: envs.MAILER_HOST ? '***' : 'NOT SET',
          MAILER_USER: envs.MAILER_USER ? '***' : 'NOT SET',
        });

        // Enviar email si se solicita explícitamente
        if (shouldSendEmail && patientEmail) {
          try {
            console.log(`📧 Starting email send process for patient: ${patientEmail}`);

            // Generar PDF con firma
            const pdfBuffer = await generateDocumentPDF(updatedDocument);
            console.log(`✅ PDF generated, size: ${pdfBuffer.length} bytes`);

            // Inicializar servicio de email - siguiendo el patrón de appointments
            const emailService = new EmailService({
              mailerHost: envs.MAILER_HOST,
              mailerPort: envs.MAILER_PORT,
              mailerUser: envs.MAILER_USER,
              senderEmailPassword: envs.MAILER_SECRET_KEY,
              postToProvider: envs.SEND_EMAIL,
            });

            const documentEmailService = new DocumentEmailService(emailService, envs.MAILER_EMAIL || envs.MAILER_USER);

            // Enviar email con PDF
            const emailSent = await documentEmailService.sendDocumentEmail({
              to: patientEmail,
              documentTitle: updatedDocument.title,
              pdfBuffer,
              patientName: updatedDocument.patient_name || '',
            });

            console.log(`📧 Document email sent result: ${emailSent} to ${patientEmail} for document: ${updatedDocument.title}`);
          } catch (emailError) {
            console.error('❌ Error sending document email:', {
              error: emailError instanceof Error ? emailError.message : String(emailError),
              patientEmail,
              documentTitle: updatedDocument.title
            });
            // No fallar si el email falla, el documento ya está firmado
          }
        } else {
          console.log('⏭️ Email not sent:', {
            send_email: body.send_email,
            patientEmail: patientEmail ? 'exists' : 'missing'
          });
        }

        return {
          statusCode: 200,
          body: JSON.stringify(updatedDocument),
          headers: HEADERS.json,
        };
      } catch (error: any) {
        console.error('Error signing document:', error);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Internal server error' }),
          headers: HEADERS.json,
        };
      }
    }

    // PUT /documents/:documentId/send-email - Enviar documento por email (sin firmar)
    if (httpMethod === "PUT" && documentId && action === 'send-email') {
      const body = event.body ? fromBodyToObject(event.body) : {};

      if (!body.patient_email) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Patient email is required' }),
          headers: HEADERS.json,
        };
      }

      try {
        // Obtener documento
        const [document] = await db
          .select()
          .from(documentsTable)
          .where(eq(documentsTable.id, documentId));

        if (!document) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Document not found' }),
            headers: HEADERS.json,
          };
        }

        // Enviar email con el documento - siguiendo el patrón de appointments
        try {
          // Generar PDF
          const pdfBuffer = await generateDocumentPDF(document);

          // Inicializar servicio de email
          const emailService = new EmailService({
            mailerHost: envs.MAILER_HOST,
            mailerPort: envs.MAILER_PORT,
            mailerUser: envs.MAILER_USER,
            senderEmailPassword: envs.MAILER_SECRET_KEY,
            postToProvider: envs.SEND_EMAIL,
          });

          const documentEmailService = new DocumentEmailService(emailService, envs.MAILER_EMAIL || envs.MAILER_USER);

          // Enviar email con PDF
          await documentEmailService.sendDocumentEmail({
            to: body.patient_email,
            documentTitle: document.title,
            pdfBuffer,
            patientName: document.patient_name || '',
          });

          console.log(`📧 Document email sent to ${body.patient_email} for document: ${document.title}`);
        } catch (emailError) {
          console.error('❌ Error sending document email:', emailError);
          // No fallar si el email falla, devolver el documento igual
        }

        return {
          statusCode: 200,
          body: JSON.stringify(document),
          headers: HEADERS.json,
        };
      } catch (error: any) {
        console.error('Error sending document email:', error);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Internal server error' }),
          headers: HEADERS.json,
        };
      }
    }

    // DELETE /documents/:documentId - Eliminar documento
    if (httpMethod === "DELETE" && documentId && !action) {
      try {
        // Verificar que el documento existe
        const [document] = await db
          .select()
          .from(documentsTable)
          .where(eq(documentsTable.id, documentId));

        if (!document) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Document not found' }),
            headers: HEADERS.json,
          };
        }

        // Eliminar documento
        await db
          .delete(documentsTable)
          .where(eq(documentsTable.id, documentId));

        return {
          statusCode: 204,
          body: '',
          headers: HEADERS.json,
        };
      } catch (error: any) {
        console.error('Error deleting document:', error);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Internal server error' }),
          headers: HEADERS.json,
        };
      }
    }

    // Ruta no encontrada
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Not found' }),
      headers: HEADERS.json,
    };
  } catch (error: any) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
      headers: HEADERS.json,
    };
  }
};

export { handler };
