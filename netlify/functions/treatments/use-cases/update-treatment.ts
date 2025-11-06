import { TreatmentService } from "../../../services/treatment.service";
import { AuditService } from "../../../services/AuditService";
import { db } from "../../../data/db";
import { UpdateTreatmentDto } from "../dtos";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";
import { AUDIT_ENTITY_TYPES, AUDIT_ACTIONS } from "../../../data/schemas";

interface UpdateTreatmentUseCase {
  execute: (treatmentId: number, dto: UpdateTreatmentDto, doctorId: number) => Promise<HandlerResponse>;
}

export class UpdateTreatment implements UpdateTreatmentUseCase {
  constructor(
    private readonly treatmentService: TreatmentService = new TreatmentService(),
    private readonly auditService: AuditService = new AuditService(db)
  ) {}

  public async execute(treatmentId: number, dto: UpdateTreatmentDto, doctorId: number): Promise<HandlerResponse> {
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

      // Preparar datos para actualizar (incluir TODOS los campos que vienen en el DTO)
      const updateData: any = {};
      const changedFields: any = {};

      if (dto.fecha_control !== undefined) {
        updateData.fecha_control = dto.fecha_control;
        if (existingTreatment.fecha_control !== dto.fecha_control) changedFields.fecha_control = dto.fecha_control;
      }
      if (dto.hora_control !== undefined) {
        updateData.hora_control = dto.hora_control;
        if (existingTreatment.hora_control !== dto.hora_control) changedFields.hora_control = dto.hora_control;
      }
      if (dto.fecha_proximo_control !== undefined) {
        updateData.fecha_proximo_control = dto.fecha_proximo_control;
        if (existingTreatment.fecha_proximo_control !== dto.fecha_proximo_control) changedFields.fecha_proximo_control = dto.fecha_proximo_control;
      }
      if (dto.hora_proximo_control !== undefined) {
        updateData.hora_proximo_control = dto.hora_proximo_control;
        if (existingTreatment.hora_proximo_control !== dto.hora_proximo_control) changedFields.hora_proximo_control = dto.hora_proximo_control;
      }
      if (dto.nombre_servicio !== undefined) {
        updateData.nombre_servicio = dto.nombre_servicio;
        if (existingTreatment.nombre_servicio !== dto.nombre_servicio) changedFields.nombre_servicio = dto.nombre_servicio;
      }
      if (dto.producto !== undefined) {
        updateData.producto = dto.producto;
        if (existingTreatment.producto !== dto.producto) changedFields.producto = dto.producto;
      }
      if (dto.lote_producto !== undefined) {
        updateData.lote_producto = dto.lote_producto;
        if (existingTreatment.lote_producto !== dto.lote_producto) changedFields.lote_producto = dto.lote_producto;
      }
      if (dto.fecha_venc_producto !== undefined) {
        updateData.fecha_venc_producto = dto.fecha_venc_producto;
        if (existingTreatment.fecha_venc_producto !== dto.fecha_venc_producto) changedFields.fecha_venc_producto = dto.fecha_venc_producto;
      }
      if (dto.dilucion !== undefined) {
        updateData.dilucion = dto.dilucion;
        if (existingTreatment.dilucion !== dto.dilucion) changedFields.dilucion = dto.dilucion;
      }

      // ✅ IMPORTANTE: Permitir actualizar imágenes con valores null/vacíos
      if (dto.foto1 !== undefined) {
        updateData.foto1 = dto.foto1 || null;
        if (existingTreatment.foto1 !== (dto.foto1 || null)) changedFields.foto1 = dto.foto1 || null;
      }
      if (dto.foto2 !== undefined) {
        updateData.foto2 = dto.foto2 || null;
        if (existingTreatment.foto2 !== (dto.foto2 || null)) changedFields.foto2 = dto.foto2 || null;
      }

      if (dto.descripcion !== undefined) {
        updateData.descripcion = dto.descripcion;
        if (existingTreatment.descripcion !== dto.descripcion) changedFields.descripcion = dto.descripcion;
      }

      const updatedTreatment = await this.treatmentService.update(treatmentId, updateData, doctorId);

      // 📝 Registrar en auditoría (actualización)
      // Si pasó de pending → completed, es la "iniciación" del tratamiento (se muestra en historial)
      const isFirstUpdate = existingTreatment.status === 'pending' && updatedTreatment.status === 'completed';

      if (isFirstUpdate) {
        // Cambio de estado: es la iniciación
        await this.auditService.logChange({
          patientId: existingTreatment.id_paciente,
          entityType: AUDIT_ENTITY_TYPES.TRATAMIENTO,
          entityId: treatmentId,
          action: AUDIT_ACTIONS.STATUS_CHANGED,
          oldValues: { status: "pending" },
          newValues: {
            status: "completed",
            nombre_servicio: updatedTreatment.nombre_servicio,
            fecha_control: updatedTreatment.fecha_control,
          },
          changedBy: doctorId,
          notes: `Tratamiento ${updatedTreatment.nombre_servicio} iniciado`,
        });
      } else if (Object.keys(changedFields).length > 0) {
        // Actualización posterior (solo si hay cambios)
        const oldValuesForAudit: any = {};
        Object.keys(changedFields).forEach(key => {
          oldValuesForAudit[key] = (existingTreatment as any)[key];
        });

        await this.auditService.logChange({
          patientId: existingTreatment.id_paciente,
          entityType: AUDIT_ENTITY_TYPES.TRATAMIENTO,
          entityId: treatmentId,
          action: AUDIT_ACTIONS.UPDATED,
          oldValues: oldValuesForAudit,
          newValues: changedFields,
          changedBy: doctorId,
          notes: `Tratamiento ${updatedTreatment.nombre_servicio} actualizado${changedFields.foto1 || changedFields.foto2 ? ' (con fotos)' : ''}`,
        });
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Tratamiento actualizado exitosamente",
          treatment: updatedTreatment,
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al actualizar el tratamiento",
          error: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}
