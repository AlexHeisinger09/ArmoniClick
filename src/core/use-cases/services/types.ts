
export interface Service {
  id: number;
  user_id: number;
  nombre: string;
  tipo: 'odontologico' | 'estetica';
  valor: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface CreateServiceData {
  nombre: string;
  tipo: string;
  valor: string;
}

export interface UpdateServiceData {
  nombre: string;
  tipo: string;
  valor: string;
}

export interface GetServicesResponse {
  services: Service[];
  total: number;
}

export interface ServiceResponse {
  service: Service;
  message?: string;
}

export interface DeleteServiceResponse {
  message: string;
}