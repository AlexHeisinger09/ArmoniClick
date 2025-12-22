// src/core/use-cases/prescriptions/save-prescription.use-case.ts
import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { Prescription } from "../prescriptions";

interface SavePrescriptionData {
  patientId: number;
  medications: string;
}

interface SavePrescriptionResponse {
  message: string;
  prescription: Prescription;
}

export const savePrescriptionUseCase = async (
  httpAdapter: HttpAdapter,
  data: SavePrescriptionData
): Promise<SavePrescriptionResponse> => {
  try {
    const response = await httpAdapter.post<SavePrescriptionResponse>(
      "/prescriptions",
      data
    );
    return response;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error al guardar la receta");
  }
};
