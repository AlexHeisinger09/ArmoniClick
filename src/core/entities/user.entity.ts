export interface User {
  id: number;
  rut?: string;
  name: string;
  lastName: string;
  username: string;
  email: string;
  img: string | null;
  phone: string;
  address: string;
  zipCode: string;
  city: string;
  country: string;
}