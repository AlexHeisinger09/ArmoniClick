// src/core/use-cases/appointments/get-appointments.use-case.ts - CON DEBUG
import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { AppointmentResponse } from "@/infrastructure/interfaces/appointment.response";

export const getAppointmentsUseCase = async (
  fetcher: HttpAdapter,
  params?: {
    startDate?: string;
    endDate?: string;
    upcoming?: boolean;
  }
): Promise<AppointmentResponse[]> => {
  let url = '/appointments';
  
  console.log('🌐 getAppointmentsUseCase called with params:', params);
  
  if (params) {
    const searchParams = new URLSearchParams();
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);
    if (params.upcoming) searchParams.append('upcoming', 'true');
    
    if (searchParams.toString()) {
      url += `?${searchParams.toString()}`;
    }
  }
  
  console.log('🔗 Final URL for appointments:', url);
  
  try {
    const appointments = await fetcher.get<AppointmentResponse[]>(url);
    console.log('✅ Appointments received from API:', {
      url,
      count: appointments?.length || 0,
      appointments
    });
    
    return appointments;
  } catch (error) {
    console.error('❌ Error in getAppointmentsUseCase:', {
      url,
      error,
      errorMessage: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
};