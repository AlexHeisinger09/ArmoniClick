// netlify/functions/treatments/use-cases/add-session.ts
import { db } from "../../../data/db";
import { treatmentsTable } from "../../../data/schemas/treatment.schema";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";
import { AuditService } from "../../../services/AuditService";
import { AUDIT_ENTITY_TYPES, AUDIT_ACTIONS } from "../../../data/schemas";
import { eq } from "drizzle-orm";

interface AddSessionData {
  budget_item_id: number;
  fecha_control: string;
  hora_control: string;
  descripcion?: string;
  producto?: string;
  lote_producto?: string;
  fecha_venc_producto?: string;
  dilucion?: string;
  foto1?: string;
  foto2?: string;
  fecha_proximo_control?: string;
  hora_proximo_control?: string;
}

export class AddTreatmentSession {
  constructor(
    private readonly auditService: AuditService = new AuditService(db)
  ) {}

  public async execute(
    sessionData: AddSessionData,
    userId: number,
    patientId: number
  ): Promise<HandlerResponse> {
    try {
      // 1. Obtener el tratamiento principal para verificar y obtener datos
      const mainTreatment = await db
        .select()
        .from(treatmentsTable)
        .where(eq(treatmentsTable.budget_item_id, sessionData.budget_item_id))
        .limit(1);

      if (!mainTreatment || mainTreatment.length === 0) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: "Tratamiento principal no encontrado",
          }),
          headers: HEADERS.json,
        };
      }

      const treatment = mainTreatment[0];

      // 2. Crear nueva sesión/evolución
      const [newSession] = await db
        .insert(treatmentsTable)
        .values({
          id_paciente: patientId,
          id_doctor: userId,
          budget_item_id: sessionData.budget_item_id,
          nombre_servicio: `${treatment.nombre_servicio} - Sesión`,
          fecha_control: sessionData.fecha_control,
          hora_control: sessionData.hora_control,
          descripcion: sessionData.descripcion || '',
          producto: sessionData.producto,
          lote_producto: sessionData.lote_producto,
          fecha_venc_producto: sessionData.fecha_venc_producto,
          dilucion: sessionData.dilucion,
          foto1: sessionData.foto1,
          foto2: sessionData.foto2,
          fecha_proximo_control: sessionData.fecha_proximo_control,
          hora_proximo_control: sessionData.hora_proximo_control,
          status: 'en_proceso', // Sesión registrada = en proceso
          created_at: new Date(),
          is_active: true,
        })
        .returning();

      // 3. Actualizar estado del tratamiento principal a 'en_proceso' si estaba 'planificado'
      if (treatment.status === 'planificado') {
        await db
          .update(treatmentsTable)
          .set({
            status: 'en_proceso',
            updated_at: new Date(),
          })
          .where(eq(treatmentsTable.id_tratamiento, treatment.id_tratamiento));
      }

      // 4. Registrar en auditoría
      await this.auditService.logChange({
        patientId: patientId,
        entityType: AUDIT_ENTITY_TYPES.TRATAMIENTO,
        entityId: newSession.id_tratamiento,
        action: AUDIT_ACTIONS.CREATED,
        oldValues: {},
        newValues: {
          budget_item_id: sessionData.budget_item_id,
          fecha: sessionData.fecha_control,
          descripcion: sessionData.descripcion,
        },
        changedBy: userId,
        notes: `Nueva sesión registrada para tratamiento`,
      });

      return {
        statusCode: 201,
        body: JSON.stringify({
          message: "Sesión registrada exitosamente",
          session: newSession,
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      console.error("Error al agregar sesión:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al agregar sesión",
          error: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}
