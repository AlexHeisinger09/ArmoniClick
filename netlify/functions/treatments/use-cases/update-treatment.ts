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

      // ✅ Actualizar el audit log original en lugar de crear uno nuevo
      // Esto mantiene el historial limpio mostrando solo la versión más reciente
      if (Object.keys(changedFields).length > 0 || Object.keys(updateData).length > 0) {
        // Construir los nuevos valores completos con toda la información actualizada
        const completeNewValues: any = {
          budget_item_id: updatedTreatment.budget_item_id,
          nombre_servicio: updatedTreatment.nombre_servicio,
          fecha: updatedTreatment.fecha_control,
          hora: updatedTreatment.hora_control,
          descripcion: updatedTreatment.descripcion,
          foto1: updatedTreatment.foto1 || null,
          foto2: updatedTreatment.foto2 || null,
          producto: updatedTreatment.producto || null,
          lote_producto: updatedTreatment.lote_producto || null,
          fecha_venc_producto: updatedTreatment.fecha_venc_producto || null,
          dilucion: updatedTreatment.dilucion || null,
        };

        const wasUpdated = await this.auditService.updateAuditLog({
          entityType: AUDIT_ENTITY_TYPES.TRATAMIENTO,
          entityId: treatmentId,
          action: AUDIT_ACTIONS.CREATED, // Buscar el registro 'created' original
          newValues: completeNewValues,
          notes: `Evolución actualizada: ${updatedTreatment.nombre_servicio}${changedFields.foto1 || changedFields.foto2 ? ' (con fotos)' : ''}`,
        });

        if (!wasUpdated) {
          console.log('⚠️ No se pudo actualizar audit log, posiblemente no existe registro de creación');
        }
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
