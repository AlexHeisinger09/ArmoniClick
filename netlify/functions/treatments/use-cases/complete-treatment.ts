import { TreatmentService } from "../../../services/treatment.service";
import { AuditService } from "../../../services/AuditService";
import { db } from "../../../data/db";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";
import { AUDIT_ENTITY_TYPES, AUDIT_ACTIONS } from "../../../data/schemas";

interface CompleteTreatmentUseCase {
  execute: (treatmentId: number, doctorId: number, patientId?: number) => Promise<HandlerResponse>;
}

export class CompleteTreatment implements CompleteTreatmentUseCase {
  constructor(
    private readonly treatmentService: TreatmentService = new TreatmentService(),
    private readonly auditService: AuditService = new AuditService(db)
  ) {}

  public async execute(treatmentId: number, doctorId: number, patientId?: number): Promise<HandlerResponse> {
    try {
      // Verificar que el tratamiento existe
      const existingTreatment = await this.treatmentService.findById(treatmentId, doctorId);

      if (!existingTreatment) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: "Tratamiento no encontrado",
          }),
          headers: HEADERS.json,
        };
      }

      if (existingTreatment.status === 'completed') {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "El tratamiento ya está completado",
          }),
          headers: HEADERS.json,
        };
      }

      // Registrar el estado anterior
      const oldStatus = existingTreatment.status;

      await this.treatmentService.completeTreatment(treatmentId, doctorId);

      // 📝 Registrar en auditoría (cambio de estado)
      if (patientId) {
        await this.auditService.logChange({
          patientId: patientId,
          entityType: AUDIT_ENTITY_TYPES.TRATAMIENTO,
          entityId: treatmentId,
          action: AUDIT_ACTIONS.STATUS_CHANGED,
          oldValues: { status: oldStatus },
          newValues: { status: 'completed' },
          changedBy: doctorId,
          notes: `Tratamiento completado`,
        });
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Tratamiento completado exitosamente",
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al completar el tratamiento",
          error: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}