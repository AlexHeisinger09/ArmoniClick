import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { AppointmentResponse } from "@/infrastructure/interfaces/appointment.response";

/**
 * Fetch appointments for a specific patient
 * Filters by patientId to get only appointments related to this patient
 */
export const getAppointmentsByPatientUseCase = async (
  fetcher: HttpAdapter,
  patientId: number
): Promise<AppointmentResponse[]> => {
  try {
    // Fetch all appointments
    const allAppointments = await fetcher.get<AppointmentResponse[]>('/appointments');

    // Filter by patient ID
    const patientAppointments = (allAppointments || []).filter(
      (appointment: AppointmentResponse) => appointment.patientId === patientId
    );

    return patientAppointments;
  } catch (error) {
    console.error('Error fetching appointments for patient:', error);
    throw new Error(`Error obteniendo citas del paciente: ${error}`);
  }
};
