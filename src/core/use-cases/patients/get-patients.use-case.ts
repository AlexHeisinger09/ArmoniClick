import { HttpAdapter } from "@/config/adapters/http/http.adapter";

export interface PatientAppointment {
  id: number;
  appointmentDate: string;
  title: string;
  status: string;
}

export interface PatientBudget {
  id: number;
  total_amount: string;
  status: string;
  paid_amount: number;
}

export interface Patient {
  id: number;
  rut: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  codigo_postal: string;
  alergias: string;
  medicamentos_actuales: string;
  enfermedades_cronicas: string;
  cirugias_previas: string;
  hospitalizaciones_previas: string;
  notas_medicas: string;
  id_doctor: number;
  createdat: string;
  updatedat: string;
  isactive: boolean;
  // Datos del doctor que registró al paciente
  doctor_name?: string;
  doctor_lastName?: string;
  // Información adicional de citas y presupuestos
  lastAppointment?: PatientAppointment | null;
  nextAppointment?: PatientAppointment | null;
  activeBudget?: PatientBudget | null;
}

export interface GetPatientsResponse {
  patients: Patient[];
  total: number;
  searchTerm?: string;
}

export const getPatientsUseCase = async (
  fetcher: HttpAdapter,
  searchTerm?: string
): Promise<GetPatientsResponse> => {
  const params = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
  const response = await fetcher.get<GetPatientsResponse>(`/patients${params}`);
  return response;
};
