import { TreatmentService } from "../../../services/treatment.service";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";

interface GetTreatmentsUseCase {
  execute: (patientId: number, doctorId: number) => Promise<HandlerResponse>;
}

export class GetTreatments implements GetTreatmentsUseCase {
  constructor(private readonly treatmentService: TreatmentService = new TreatmentService()) {}

  public async execute(patientId: number, doctorId: number): Promise<HandlerResponse> {
    try {
      const treatments = await this.treatmentService.findByPatientId(patientId, doctorId);

      return {
        statusCode: 200,
        body: JSON.stringify({
          treatments,
          total: treatments.length,
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al obtener los tratamientos",
          error: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}