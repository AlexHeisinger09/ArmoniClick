// src/core/use-cases/appointments/update-appointment-status.use-case.ts - CORREGIDO
import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { AppointmentResponse } from "@/infrastructure/interfaces/appointment.response";

interface UpdateStatusRequest {
  status: string;
  reason?: string;
}

interface UpdateStatusResponse {
  message: string;
  appointment: AppointmentResponse;
}

export const updateAppointmentStatusUseCase = async (
  fetcher: HttpAdapter,
  id: number,
  statusData: UpdateStatusRequest
): Promise<UpdateStatusResponse> => {
  console.log('📤 updateAppointmentStatusUseCase called:', {
    id,
    idType: typeof id,
    statusData,
    url: `/appointments/status?id=${id}`
  });

  // ✅ CAMBIO: Usar query parameter en lugar de path parameter
  const response = await fetcher.put<UpdateStatusResponse>(
    `/appointments/status?id=${id}`,
    statusData
  );
  
  console.log('✅ Status update response:', response);
  
  return response;
};