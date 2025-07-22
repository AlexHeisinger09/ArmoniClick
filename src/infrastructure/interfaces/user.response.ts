export interface AuthResponse {
  token: string;
  user: UserResponse;
}

export interface UserResponse {
  id: number;
  rut?: string; // ✅ NUEVO CAMPO RUT
  email: string;
  emailValidated: boolean;
  lastName: string;
  username: string;
  name: string;
  role: string[];
  img: string | null;
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