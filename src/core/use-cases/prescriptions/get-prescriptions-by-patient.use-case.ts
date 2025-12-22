// src/core/use-cases/prescriptions/get-prescriptions-by-patient.use-case.ts
import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { Prescription } from "../prescriptions";

interface GetPrescriptionsResponse {
  prescriptions: Prescription[];
  total: number;
}

export const getPrescriptionsByPatientUseCase = async (
  httpAdapter: HttpAdapter,
  patientId: number
): Promise<GetPrescriptionsResponse> => {
  try {
    const response = await httpAdapter.get<GetPrescriptionsResponse>(
      `/prescriptions/patient/${patientId}`
    );
    return response;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error al obtener las recetas");
  }
};
