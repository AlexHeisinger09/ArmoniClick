export const fromBodyToObject = (body: string) => { 
  try {
    // Intentar parsear como JSON primero
    return JSON.parse(body);
  } catch {
    // Fallback a URLSearchParams para compatibilidad
    const params = new URLSearchParams(body);
    return Object.fromEntries(params);
  }
}