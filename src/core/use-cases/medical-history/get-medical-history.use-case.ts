import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { Patient } from "../patients/get-patients.use-case";
import { Treatment, BudgetSummary } from "../treatments/types";
import { AppointmentResponse } from "@/infrastructure/interfaces/appointment.response";

export interface MedicalHistoryRecord {
  id: string;
  fecha: string; // Fecha de creación del registro (para ordenamiento cronológico)
  fechaEvento?: string; // Fecha del evento (cuando ocurre la cita/control)
  hora?: string;
  horaEvento?: string; // Hora del evento
  tipo: string;
  descripcion: string;
  medico: string;
  categoria: 'registro' | 'consulta' | 'examen' | 'tratamiento' | 'cirugia' | 'diagnostico' | 'presupuesto' | 'cita';
  estado?: 'completado' | 'pendiente' | 'cancelado' | 'aprobado' | 'rechazado';
  monto?: number;
  sourceType?: 'patient_base' | 'treatment' | 'appointment' | 'budget';
  sourceId?: number;
}

export interface MedicalHistoryResponse {
  patientBaseInfo: {
    alergias: string;
    medicamentos_actuales: string;
    enfermedades_cronicas: string;
    cirugias_previas: string;
    hospitalizaciones_previas: string;
    notas_medicas: string;
  };
  records: MedicalHistoryRecord[];
  total: number;
}

/**
 * Fetch medical history for a patient combining:
 * - Patient base medical info (allergies, medications, etc.)
 * - Treatment timeline (control appointments with doctors)
 * - Appointment history (citas agendadas)
 * - Budget/prescription information
 *
 * Uses same filtering logic as PatientAppointments component
 */
export const getMedicalHistoryUseCase = async (
  fetcher: HttpAdapter,
  patientId: number
): Promise<MedicalHistoryResponse> => {
  try {
    // 1. Fetch patient data to get base medical information
    const patientResponse = await fetcher.get<{ patient: Patient }>(
      `/patients/${patientId}`
    );
    const patient = patientResponse.patient;

    // 2. Fetch treatments for this patient (already filtered by endpoint)
    const treatmentsResponse = await fetcher.get<{ treatments: Treatment[] }>(
      `/treatments/patient/${patientId}`
    );
    const treatments = treatmentsResponse.treatments || [];

    // 3. Fetch ALL appointments and filter by patientId (same as PatientAppointments)
    const allAppointmentsResponse = await fetcher.get<AppointmentResponse[]>('/appointments');
    const allAppointments = allAppointmentsResponse || [];

    // Filter appointments by patientId - same logic as PatientAppointments component
    const patientAppointments = allAppointments.filter(
      (appointment: AppointmentResponse) => appointment.patientId === patientId
    );

    // 4. Fetch budgets for this patient
    const budgetsResponse = await fetcher.get<{ budgets?: BudgetSummary[] }>(
      `/treatments/patient/${patientId}/budgets`
    );
    const budgets = budgetsResponse.budgets || [];

    // Create medical records from different sources
    const records: MedicalHistoryRecord[] = [];

    // 1. Add patient registration record if patient has a creation date
    if (patient.createdat) {
      // Construir nombre del doctor: "Dr/Dra. Nombre Apellido"
      const doctorFullName = patient.doctor_name && patient.doctor_lastName
        ? `Dr/Dra. ${patient.doctor_name} ${patient.doctor_lastName}`
        : 'Profesional Médico';

      records.push({
        id: `patient-${patient.id}`,
        fecha: patient.createdat,
        tipo: 'Registro de Paciente',
        descripcion: `Registro inicial del paciente. Datos personales y antecedentes médicos recopilados.`,
        medico: doctorFullName,
        categoria: 'registro',
        estado: 'completado',
        sourceType: 'patient_base',
        sourceId: patient.id,
      });
    }

    // 2. Add treatment records (controles y procedimientos)
    treatments.forEach((treatment) => {
      if (treatment.fecha_control) {
        // Construir nombre del doctor: "Dr/Dra. Nombre Apellido"
        const doctorFullName = treatment.doctor_name && treatment.doctor_lastName
          ? `Dr/Dra. ${treatment.doctor_name} ${treatment.doctor_lastName}`
          : 'Profesional Médico';

        records.push({
          id: `treatment-${treatment.id_tratamiento}`,
          fecha: treatment.created_at, // Fecha de creación del registro para ordenamiento
          fechaEvento: treatment.fecha_control, // Fecha cuando ocurre el control
          hora: treatment.created_at ? new Date(treatment.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : undefined,
          horaEvento: treatment.hora_control, // Hora del control
          tipo: treatment.nombre_servicio || 'Tratamiento',
          descripcion: treatment.descripcion || `Control de ${treatment.nombre_servicio}`,
          medico: doctorFullName,
          categoria: 'tratamiento',
          estado: treatment.status === 'completed' ? 'completado' : 'pendiente',
          sourceType: 'treatment',
          sourceId: treatment.id_tratamiento,
        });
      }
    });

    // 3. Add appointment records (citas agendadas - filtradas por patientId)
    patientAppointments.forEach((appointment) => {
      // Extract hour from appointmentDate (ISO format: 2024-10-20T14:30:00)
      const appointmentDateTime = new Date(appointment.appointmentDate);
      const horaEvento = appointmentDateTime.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

      // Use createdAt, or updatedAt as fallback, or appointmentDate as last resort
      const fechaCreacion = appointment.createdAt || appointment.updatedAt || appointment.appointmentDate;
      const createdDateTime = new Date(fechaCreacion);
      const horaCreacion = createdDateTime.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

      records.push({
        id: `appointment-${appointment.id}`,
        fecha: fechaCreacion, // Fecha de creación del registro para ordenamiento (con fallback)
        fechaEvento: appointment.appointmentDate, // Fecha cuando está agendada la cita
        hora: horaCreacion, // Hora de creación del registro
        horaEvento: horaEvento, // Hora de la cita
        tipo: appointment.title || 'Cita',
        descripcion: appointment.description || appointment.notes || `Cita con ${appointment.doctorName || 'profesional'}`,
        medico: appointment.doctorName ? `Dr/Dra. ${appointment.doctorName}` : 'Profesional Médico',
        categoria: 'cita',
        estado: appointment.status === 'completed' ? 'completado' :
                 appointment.status === 'cancelled' ? 'cancelado' :
                 'pendiente',
        sourceType: 'appointment',
        sourceId: appointment.id,
      });
    });

    // 4. Add budget records (presupuestos creados)
    budgets.forEach((budget) => {
      if (budget.created_at) {
        // Construir nombre del doctor: "Dr/Dra. Nombre Apellido"
        const doctorFullName = budget.doctor_name && budget.doctor_lastName
          ? `Dr/Dra. ${budget.doctor_name} ${budget.doctor_lastName}`
          : 'Profesional Médico';

        records.push({
          id: `budget-${budget.id}`,
          fecha: budget.created_at,
          tipo: budget.budget_type || 'Presupuesto',
          descripcion: `Presupuesto de ${budget.budget_type || 'servicio'}`,
          medico: doctorFullName,
          categoria: 'presupuesto',
          estado: budget.status === 'aprobado' ? 'aprobado' :
                  budget.status === 'activo' ? 'aprobado' :
                  'pendiente',
          monto: budget.total_amount ? parseFloat(budget.total_amount) : undefined,
          sourceType: 'budget',
          sourceId: budget.id,
        });
      }
    });

    // Sort records by creation date and time (newest first)
    // 'fecha' ya contiene created_at para ordenamiento correcto
    const sortedRecords = records.sort((a, b) => {
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    });

    return {
      patientBaseInfo: {
        alergias: patient.alergias || '',
        medicamentos_actuales: patient.medicamentos_actuales || '',
        enfermedades_cronicas: patient.enfermedades_cronicas || '',
        cirugias_previas: patient.cirugias_previas || '',
        hospitalizaciones_previas: patient.hospitalizaciones_previas || '',
        notas_medicas: patient.notas_medicas || '',
      },
      records: sortedRecords,
      total: sortedRecords.length,
    };
  } catch (error) {
    console.error('Error fetching medical history:', error);
    throw new Error(`Error obteniendo historial médico: ${error}`);
  }
};
