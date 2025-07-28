import { TreatmentService } from "../../../services/treatment.service";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";

interface DeleteTreatmentUseCase {
  execute: (treatmentId: number, doctorId: number) => Promise<HandlerResponse>;
}

export class DeleteTreatment implements DeleteTreatmentUseCase {
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

      await this.treatmentService.delete(treatmentId, doctorId);

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Tratamiento eliminado exitosamente",
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al eliminar el tratamiento",
          error: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}