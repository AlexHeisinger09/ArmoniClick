import { TreatmentService } from "../../../services/treatment.service";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";

interface GetTreatmentByIdUseCase {
  execute: (treatmentId: number, doctorId: number) => Promise<HandlerResponse>;
}

export class GetTreatmentById implements GetTreatmentByIdUseCase {
  constructor(private readonly treatmentService: TreatmentService = new TreatmentService()) {}

  public async execute(treatmentId: number, doctorId: number): Promise<HandlerResponse> {
    try {
      const treatment = await this.treatmentService.findById(treatmentId, doctorId);

      if (!treatment) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: "Tratamiento no encontrado",
          }),
          headers: HEADERS.json,
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          treatment,
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al obtener el tratamiento",
          error: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}