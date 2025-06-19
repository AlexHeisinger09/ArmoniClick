export interface Patient {
  id: number;
  rut: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  codigoPostal?: string;
  idDoctor: number;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
}