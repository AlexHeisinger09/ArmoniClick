import { TreatmentService } from "../../../services/treatment.service";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";

interface CompleteTreatmentUseCase {
  execute: (treatmentId: number, doctorId: number) => Promise<HandlerResponse>;
}

export class CompleteTreatment implements CompleteTreatmentUseCase {
  constructor(private readonly treatmentService: TreatmentService = new TreatmentService()) {}

  public async execute(treatmentId: number, doctorId: number): Promise<HandlerResponse> {
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

      await this.treatmentService.completeTreatment(treatmentId, doctorId);

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