export interface AuthResponse {
  token: string;
  user: UserResponse;
}

export interface UserResponse {
  id: number;
  rut?: string;
  email: string;
  emailValidated: boolean;
  lastName: string;
  username: string;
  name: string;
  role: string[];
  img: string | null;
  signature?: string | null; // ✅ HACER OPCIONAL CON undefined O null
  logo?: string | null; // ✅ LOGO DEL DOCTOR
  profession?: string | null; // ✅ PROFESIÓN DEL DOCTOR
  specialty?: string | null; // ✅ ESPECIALIDAD DEL DOCTOR
  country: string;
}

export interface ProfileResponse extends UserResponse {
  createdAt: string;
  updatedAt: string;
  // Propiedades adicionales del perfil de usuario
  phone?: string;
  address?: string;
  zipCode?: string;
  city?: string;
}