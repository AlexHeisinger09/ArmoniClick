import { HttpAdapter } from "@/config/adapters/http/http.adapter";

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
