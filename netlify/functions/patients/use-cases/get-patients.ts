import { PatientService } from "../../../services/patient.service";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";

interface GetPatientsUseCase {
  execute: (doctorId: number, searchTerm?: string) => Promise<HandlerResponse>;
}

export class GetPatients implements GetPatientsUseCase {
  constructor(private readonly patientService: PatientService = new PatientService()) {}

  public async execute(doctorId: number, searchTerm?: string): Promise<HandlerResponse> {
    try {
      let patients;

      if (searchTerm && searchTerm.trim()) {
        patients = await this.patientService.searchByName(doctorId, searchTerm.trim());
      } else {
        patients = await this.patientService.findByDoctorId(doctorId);
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          patients,
          total: patients.length,
          searchTerm: searchTerm || null,
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al obtener los pacientes",
          error: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}