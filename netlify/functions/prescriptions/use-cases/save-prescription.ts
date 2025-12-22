// netlify/functions/prescriptions/use-cases/save-prescription.ts
import { db } from "../../../data/db";
import { prescriptionsTable } from "../../../data/schemas/prescription.schema";
import { patientsTable } from "../../../data/schemas/patient.schema";
import { usersTable } from "../../../data/schemas/user.schema";
import { SavePrescriptionDto } from "../dtos";
import { HEADERS } from "../../../config/utils";
import { AuditService } from "../../../services/AuditService";
import { AUDIT_ENTITY_TYPES, AUDIT_ACTIONS } from "../../../data/schemas";
import { generatePrescriptionPDF } from "../../../services/pdfService";
import { eq } from "drizzle-orm";

export class SavePrescription {
  async execute(dto: SavePrescriptionDto, userId: number) {
    try {
      const [newPrescription] = await db
        .insert(prescriptionsTable)
        .values({
          patient_id: dto.patientId,
          user_id: userId,
          medications: dto.medications,
        })
        .returning();

      // Obtener datos del paciente para el PDF
      const [patient] = await db
        .select()
        .from(patientsTable)
        .where(eq(patientsTable.id, dto.patientId))
        .limit(1);

      // Obtener datos del doctor para el PDF
      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .limit(1);

      let pdfBase64 = '';

      // Generar PDF si tenemos los datos del paciente
      if (patient) {
        try {
          const pdfBuffer = await generatePrescriptionPDF({
            prescription: newPrescription,
            patientName: `${patient.nombres} ${patient.apellidos}`,
            patientRut: patient.rut,
            patientPhone: patient.telefono || 'Sin teléfono',
            doctorName: user ? `${user.name} ${user.lastName}` : undefined,
            doctorRut: user?.rut || undefined,
            doctorSignature: user?.signature || null,
          });

          pdfBase64 = pdfBuffer.toString('base64');
          console.log(`✅ PDF base64 generated, size: ${pdfBase64.length} characters`);
        } catch (pdfError) {
          console.error('❌ Error generating prescription PDF for audit:', pdfError);
          // Continue without PDF if generation fails
        }
      } else {
        console.log('⚠️ Patient not found, skipping PDF generation');
      }

      // 📝 Registrar en auditoría (creación de receta) con PDF
      const auditService = new AuditService(db);
      await auditService.logChange({
        patientId: dto.patientId,
        entityType: AUDIT_ENTITY_TYPES.RECETA,
        entityId: newPrescription.id,
        action: AUDIT_ACTIONS.CREATED,
        newValues: {
          medications: newPrescription.medications,
          pdf_base64: pdfBase64, // Incluir PDF en base64
        },
        changedBy: userId,
        notes: `Receta médica creada`,
      });

      return {
        statusCode: 201,
        body: JSON.stringify({
          message: "Receta creada exitosamente",
          prescription: newPrescription,
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: error.message || "Error al crear la receta",
        }),
        headers: HEADERS.json,
      };
    }
  }
}
