// src/presentation/utils/dateHelpers.ts
/**
 * Formatea una fecha en formato ISO (YYYY-MM-DD) a formato legible en español chileno
 *
 * IMPORTANTE: Parsea la fecha como LOCAL, no como UTC, para evitar desfases de zona horaria.
 * Cuando PostgreSQL devuelve "2025-12-16", queremos mostrarlo como 16-12-2025, no 15-12-2025.
 *
 * @param dateString - Fecha en formato ISO (YYYY-MM-DD) o ISO completo
 * @returns Fecha formateada (ej: "16-12-2025")
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '';

  // Si la fecha está en formato ISO (YYYY-MM-DD), parsearla como LOCAL
  const isoDateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (isoDateOnlyRegex.test(dateString)) {
    // Parsear como fecha local (sin conversión UTC)
    const [year, month, day] = dateString.split('-').map(Number);
    const localDate = new Date(year, month - 1, day); // month es 0-indexed

    return localDate.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  // Para fechas con hora (ISO 8601 completo), usar el comportamiento normal
  return new Date(dateString).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Formatea una hora en formato HH:MM:SS a HH:MM
 * @param timeString - Hora en formato HH:MM:SS o HH:MM
 * @returns Hora formateada (ej: "14:30")
 */
export const formatTime = (timeString: string | null | undefined): string => {
  if (!timeString) return '';
  return timeString.slice(0, 5); // Truncar a HH:MM
};
