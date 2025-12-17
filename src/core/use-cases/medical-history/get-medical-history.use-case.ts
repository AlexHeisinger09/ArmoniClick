import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { Patient } from "../patients/get-patients.use-case";
import { Treatment, BudgetSummary } from "../treatments/types";
import { AppointmentResponse } from "@/infrastructure/interfaces/appointment.response";

// ✅ Nuevo: Interface para audit logs
export interface AuditLogRecord {
  id: number;
  patient_id: number;
  entity_type: string;
  entity_id: number;
  action: string;
  old_values: any;
  new_values: any;
  changed_by: number;
  created_at: string;
  notes: string | null;
  doctor_name: string;
  doctor_lastName: string;
}

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
  sourceType?: 'patient_base' | 'treatment' | 'appointment' | 'budget' | 'audit_log';
  sourceId?: number;
  action?: string; // ✅ Nuevo: Para distinguir acciones en audit logs
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

    // 2. ✅ NUEVO: Fetch audit logs para obtener el historial de eventos
    const auditLogsResponse = await fetcher.get<{ auditLogs: AuditLogRecord[] }>(
      `/audit-logs/patient/${patientId}`
    );
    const auditLogs = auditLogsResponse.auditLogs || [];

    // 3. Fetch ALL appointments and filter by patientId (same as PatientAppointments)
    const allAppointmentsResponse = await fetcher.get<AppointmentResponse[]>('/appointments');
    const allAppointments = allAppointmentsResponse || [];

    // Filter appointments by patientId - same logic as PatientAppointments component
    const patientAppointments = allAppointments.filter(
      (appointment: AppointmentResponse) => appointment.patientId === patientId
    );

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

    // 2. ✅ NUEVO: Add records from audit logs
    auditLogs.forEach((auditLog) => {
      const doctorFullName = auditLog.doctor_name && auditLog.doctor_lastName
        ? `Dr/Dra. ${auditLog.doctor_name} ${auditLog.doctor_lastName}`
        : 'Profesional Médico';

      const createdAt = new Date(auditLog.created_at);
      const hora = createdAt.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

      // ✅ TRATAMIENTOS: Mostrar solo cuando se CREAN (action = 'created')
      if (auditLog.entity_type === 'tratamiento' && auditLog.action === 'created') {
        const newValues = auditLog.new_values || {};

        // ✅ Construir nombre del tratamiento desde los datos guardados
        const nombreServicio = newValues.nombre_servicio ||
                              (newValues.accion ? `${newValues.accion}${newValues.pieza ? ` - Pieza ${newValues.pieza}` : ''}` : null);

        const tipo = nombreServicio || 'Sesión de Tratamiento';
        const descripcion = newValues.descripcion || auditLog.notes || 'Nueva sesión registrada';
        const fechaControl = newValues.fecha || newValues.fecha_control;

        records.push({
          id: `audit-treatment-${auditLog.id}`,
          fecha: auditLog.created_at,
          fechaEvento: fechaControl,
          hora: hora,
          horaEvento: newValues.hora || newValues.hora_control,
          tipo: tipo,
          descripcion: descripcion,
          medico: doctorFullName,
          categoria: 'tratamiento',
          estado: 'completado',
          sourceType: 'audit_log',
          sourceId: auditLog.entity_id,
          action: auditLog.action,
        });
      }

      // ✅ PRESUPUESTOS: Mostrar cuando cambia de estado
      if (auditLog.entity_type === 'presupuesto' && auditLog.action === 'status_changed') {
        const newValues = auditLog.new_values || {};
        const oldValues = auditLog.old_values || {};

        // Traducir el estado al español
        const statusTranslations: Record<string, string> = {
          'activo': 'Activo',
          'completado': 'Completado',
          'borrador': 'Borrador',
          'cancelado': 'Cancelado'
        };

        const newStatus = newValues.status || '';
        const translatedStatus = statusTranslations[newStatus] || newStatus;

        // Mostrar cualquier cambio de estado (no solo de borrador a activo)
        records.push({
          id: `audit-budget-${auditLog.id}`,
          fecha: auditLog.created_at,
          hora: hora,
          tipo: `Presupuesto ${translatedStatus}`,
          descripcion: auditLog.notes || `Presupuesto cambiado a ${translatedStatus.toLowerCase()}`,
          medico: doctorFullName,
          categoria: 'presupuesto',
          estado: newStatus === 'activo' ? 'aprobado' : (newStatus === 'completado' ? 'completado' : 'pendiente'),
          sourceType: 'audit_log',
          sourceId: auditLog.entity_id,
          action: auditLog.action,
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
