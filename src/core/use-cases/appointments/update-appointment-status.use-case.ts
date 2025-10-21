// src/core/use-cases/appointments/update-appointment-status.use-case.ts
import { HttpAdapter } from "@/config/adapters/http/http.adapter";

interface UpdateStatusData {
  status: string;
  reason?: string;
}

interface UpdateStatusResponse {
  message: string;
  appointment: any;
}

export const updateAppointmentStatusUseCase = async (
  fetcher: HttpAdapter,
  id: number,
  data: UpdateStatusData
): Promise<UpdateStatusResponse> => {
  console.log('📤 updateAppointmentStatusUseCase called with:', {
    id,
    idType: typeof id,
    data
  });

  // Validar ID
  if (!id || isNaN(id) || id <= 0) {
    throw new Error(`ID de cita inválido: ${id}`);
  }

  try {
    // ✅ OPCIÓN 1: Enviar ID en la URL (recomendado)
    const url = `/appointments/status/${id}`;
    
    console.log('🌐 Making PUT request to:', url);
    console.log('📦 Request body:', data);

    const response = await fetcher.put<UpdateStatusResponse>(
      url,
      data
    );

    console.log('✅ Status update response:', response);
    return response;

  } catch (error: any) {
    console.error('❌ Error in updateAppointmentStatusUseCase:', error);
    
    // Mejorar el mensaje de error
    if (error.statusCode === 405) {
      throw new Error('Método no permitido. Verifica la configuración del endpoint.');
    }
    
    if (error.statusCode === 404) {
      throw new Error('Cita no encontrada o no tienes permisos para modificarla.');
    }
    
    if (error.statusCode === 400) {
      throw new Error(error.message || 'Datos inválidos para actualizar la cita.');
    }

    throw error;
  }
};