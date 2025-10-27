import { HttpAdapter } from '@/config/adapters/http/http.adapter';

export interface Patient {
  id: number;
  nombres: string;
  apellidos: string;
  rut: string;
  email: string;
}

export interface GetPatientsResponse {
  patients: Patient[];
  total: number;
}

export async function getPatientsUseCase(httpAdapter: HttpAdapter): Promise<Patient[]> {
  try {
    const response = await httpAdapter.get<GetPatientsResponse>('/patients');
    return response.patients;
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
}
