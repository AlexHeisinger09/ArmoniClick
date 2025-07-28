import { TreatmentService } from "../../../services/treatment.service";
import { CreateTreatmentDto } from "../dtos";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";

interface CreateTreatmentUseCase {
  execute: (dto: CreateTreatmentDto, doctorId: number) => Promise<HandlerResponse>;
}

export class CreateTreatment implements CreateTreatmentUseCase {
  constructor(private readonly treatmentService: TreatmentService = new TreatmentService()) {}

  public async execute(dto: CreateTreatmentDto, doctorId: number): Promise<HandlerResponse> {
    try {
      const newTreatment = await this.treatmentService.create({
        id_paciente: dto.id_paciente,
        id_doctor: doctorId,
        fecha_control: dto.fecha_control,
        hora_control: dto.hora_control,
        fecha_proximo_control: dto.fecha_proximo_control,
        hora_proximo_control: dto.hora_proximo_control,
        nombre_servicio: dto.nombre_servicio,
        producto: dto.producto,
        lote_producto: dto.lote_producto,
        fecha_venc_producto: dto.fecha_venc_producto,
        dilucion: dto.dilucion,
        foto1: dto.foto1,
        foto2: dto.foto2,
        descripcion: dto.descripcion,
      });

      return {
        statusCode: 201,
        body: JSON.stringify({
          message: "Tratamiento creado exitosamente",
          treatment: newTreatment,
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al crear el tratamiento",
          error: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}