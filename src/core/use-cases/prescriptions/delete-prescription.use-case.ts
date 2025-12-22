// src/core/use-cases/prescriptions/delete-prescription.use-case.ts
import { HttpAdapter } from "@/config/adapters/http/http.adapter";

interface DeletePrescriptionResponse {
  message: string;
}

export const deletePrescriptionUseCase = async (
  httpAdapter: HttpAdapter,
  prescriptionId: number
): Promise<DeletePrescriptionResponse> => {
  try {
    const response = await httpAdapter.delete<DeletePrescriptionResponse>(
      `/prescriptions/${prescriptionId}`
    );
    return response;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error al eliminar la receta");
  }
};
