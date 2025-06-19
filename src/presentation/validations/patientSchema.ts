import { z } from "zod";

// Función auxiliar para validar RUT chileno
const validateRut = (rut: string): boolean => {
  if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(rut)) {
    return false;
  }

  const parts = rut.split('-');
  const number = parseInt(parts[0]);
  const verifier = parts[1].toUpperCase();

  let sum = 0;
  let multiplier = 2;

  for (let i = number.toString().length - 1; i >= 0; i--) {
    sum += parseInt(number.toString().charAt(i)) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = sum % 11;
  const calculatedVerifier = remainder < 2 ? remainder.toString() : (11 - remainder === 10 ? 'K' : (11 - remainder).toString());

  return verifier === calculatedVerifier;
};

// Función para validar edad (debe ser mayor a 0 y menor a 120 años)
const validateAge = (birthDate: string): boolean => {
  const birth = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  let finalAge = age;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    finalAge--;
  }

  return finalAge >= 0 && finalAge <= 120;
};

export const patientSchema = z.object({
  rut: z
    .string()
    .min(8, "El RUT debe tener al menos 8 caracteres")
    .max(12, "El RUT no puede tener más de 12 caracteres")
    .refine((rut) => validateRut(rut), {
      message: "El RUT ingresado no es válido",
    }),
  nombres: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede tener más de 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras"),
  apellidos: z
    .string()
    .min(2, "Los apellidos deben tener al menos 2 caracteres")
    .max(50, "Los apellidos no pueden tener más de 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Los apellidos solo pueden contener letras"),
  fechaNacimiento: z
    .string()
    .min(1, "La fecha de nacimiento es obligatoria")
    .refine((date) => {
      const birthDate = new Date(date);
      return birthDate <= new Date();
    }, "La fecha de nacimiento no puede ser futura")
    .refine((date) => validateAge(date), {
      message: "La edad debe estar entre 0 y 120 años",
    }),
  telefono: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone || phone.trim() === "") return true;
      // Validar formato chileno: +56912345678 o 912345678
      return /^(\+?56)?[0-9]{8,9}$/.test(phone.replace(/\s/g, ""));
    }, "El teléfono debe tener un formato válido"),
  email: z
    .string()
    .optional()
    .refine((email) => {
      if (!email || email.trim() === "") return true;
      return z.string().email().safeParse(email).success;
    }, "El email debe tener un formato válido"),
  direccion: z
    .string()
    .optional()
    .refine((address) => {
      if (!address || address.trim() === "") return true;
      return address.length <= 100;
    }, "La dirección no puede tener más de 100 caracteres"),
  ciudad: z
    .string()
    .optional()
    .refine((city) => {
      if (!city || city.trim() === "") return true;
      return city.length <= 50 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(city);
    }, "La ciudad debe contener solo letras y no más de 50 caracteres"),
  codigoPostal: z
    .string()
    .optional()
    .refine((zip) => {
      if (!zip || zip.trim() === "") return true;
      return /^[0-9]{7}$/.test(zip);
    }, "El código postal debe tener 7 dígitos"),
});

export type PatientFormData = z.infer<typeof patientSchema>;