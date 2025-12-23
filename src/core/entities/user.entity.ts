export interface User {
  id: number;
  rut?: string;
  name: string;
  lastName: string;
  username: string;
  email: string;
  img: string | null;
  signature: string | null; // ✅ NUEVO CAMPO PARA LA FIRMA
  logo: string | null; // ✅ NUEVO CAMPO PARA EL LOGO
  profession: string | null; // ✅ PROFESIÓN DEL DOCTOR
  specialty: string | null; // ✅ ESPECIALIDAD DEL DOCTOR
  phone: string;
  address: string;
  zipCode: string;
  city: string;
  country: string;
}