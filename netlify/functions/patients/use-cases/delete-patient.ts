import { PatientService } from "../../../services/patient.service";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";

interface DeletePatientUseCase {
  execute: (patientId: number, doctorId: number) => Promise<HandlerResponse>;
}

export class DeletePatient implements DeletePatientUseCase {
  constructor(private readonly patientService: PatientService = new PatientService()) {}

  public async execute(patientId: number, doctorId: number): Promise<HandlerResponse> {
    try {
      // Verificar que el paciente existe
      const existingPatient = await this.patientService.findById(patientId, doctorId);
      
      if (!existingPatient) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: "Paciente no encontrado",
          }),
          headers: HEADERS.json,
        };
      }

      await this.patientService.delete(patientId, doctorId);

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Paciente eliminado exitosamente",
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al eliminar el paciente",
          error: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}