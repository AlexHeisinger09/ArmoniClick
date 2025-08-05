import { TreatmentService } from "../../../services/treatment.service";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";

interface GetBudgetsByPatientUseCase {
  execute: (patientId: number, doctorId: number) => Promise<HandlerResponse>;
}

export class GetBudgetsByPatient implements GetBudgetsByPatientUseCase {
  constructor(private readonly treatmentService: TreatmentService = new TreatmentService()) {}

  public async execute(patientId: number, doctorId: number): Promise<HandlerResponse> {
    try {
      const budgets = await this.treatmentService.getBudgetsByPatient(patientId, doctorId);

      return {
        statusCode: 200,
        body: JSON.stringify({
          budgets,
          total: budgets.length,
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al obtener los presupuestos del paciente",
          error: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}
