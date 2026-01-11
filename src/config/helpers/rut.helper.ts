/**
 * Formatea un RUT chileno agregando el guión antes del dígito verificador
 * @param value - El valor del RUT ingresado por el usuario
 * @returns El RUT formateado (ej: 17539138-k)
 */
export const formatRut = (value: string): string => {
  // Remover todo lo que no sea número o k/K
  const cleanValue = value.replace(/[^\dkK]/g, '');

  // Si está vacío, retornar vacío
  if (!cleanValue) return '';

  // Si solo tiene un carácter, retornarlo sin formato
  if (cleanValue.length === 1) return cleanValue;

  // Limitar a máximo 9 caracteres (8 dígitos + 1 verificador)
  const limitedValue = cleanValue.slice(0, 9);

  // Separar el cuerpo del RUT del dígito verificador
  const body = limitedValue.slice(0, -1);
  const verifier = limitedValue.slice(-1).toLowerCase();

  // Retornar con formato: 12345678-9
  return `${body}-${verifier}`;
};

/**
 * Valida si un RUT chileno tiene el formato correcto
 * @param rut - El RUT a validar (ej: 17539138-k)
 * @returns true si el formato es válido, false en caso contrario
 */
export const isValidRutFormat = (rut: string): boolean => {
  return /^\d{7,8}-[\dkK]$/.test(rut);
};
