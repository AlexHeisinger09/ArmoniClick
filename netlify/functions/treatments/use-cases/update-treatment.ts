import { TreatmentService } from "../../../services/treatment.service";
import { UpdateTreatmentDto } from "../dtos";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";

interface UpdateTreatmentUseCase {
  execute: (treatmentId: number, dto: UpdateTreatmentDto, doctorId: number) => Promise<HandlerResponse>;
}

export class UpdateTreatment implements UpdateTreatmentUseCase {
  constructor(private readonly treatmentService: TreatmentService = new TreatmentService()) {}

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
      
      if (dto.fecha_control !== undefined) updateData.fecha_control = dto.fecha_control;
      if (dto.hora_control !== undefined) updateData.hora_control = dto.hora_control;
      if (dto.fecha_proximo_control !== undefined) updateData.fecha_proximo_control = dto.fecha_proximo_control;
      if (dto.hora_proximo_control !== undefined) updateData.hora_proximo_control = dto.hora_proximo_control;
      if (dto.nombre_servicio !== undefined) updateData.nombre_servicio = dto.nombre_servicio;
      if (dto.producto !== undefined) updateData.producto = dto.producto;
      if (dto.lote_producto !== undefined) updateData.lote_producto = dto.lote_producto;
      if (dto.fecha_venc_producto !== undefined) updateData.fecha_venc_producto = dto.fecha_venc_producto;
      if (dto.dilucion !== undefined) updateData.dilucion = dto.dilucion;
      
      // ✅ IMPORTANTE: Permitir actualizar imágenes con valores null/vacíos
      if (dto.foto1 !== undefined) updateData.foto1 = dto.foto1 || null;
      if (dto.foto2 !== undefined) updateData.foto2 = dto.foto2 || null;
      
      if (dto.descripcion !== undefined) updateData.descripcion = dto.descripcion;

      const updatedTreatment = await this.treatmentService.update(treatmentId, updateData, doctorId);

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
