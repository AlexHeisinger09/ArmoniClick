import { PatientService } from "../../../services/patient.service";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";

interface GetPatientByIdUseCase {
  execute: (patientId: number, doctorId: number) => Promise<HandlerResponse>;
}

export class GetPatientById implements GetPatientByIdUseCase {
  constructor(private readonly patientService: PatientService = new PatientService()) {}

  public async execute(patientId: number, doctorId: number): Promise<HandlerResponse> {
    try {
      const patient = await this.patientService.findById(patientId, doctorId);

      if (!patient) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: "Paciente no encontrado",
          }),
          headers: HEADERS.json,
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          patient,
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al obtener el paciente",
          error: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}