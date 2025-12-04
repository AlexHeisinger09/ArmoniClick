export const fromBodyToObject = (body: string) => {
  try {
    // Intentar parsear como JSON primero
    return JSON.parse(body);
  } catch (e) {
    // Si falla, intentar como URLSearchParams (formularios)
    try {
      const params = new URLSearchParams(body);
      const obj = Object.fromEntries(params);
      return obj;
    } catch (err) {
      console.error('❌ Error parseando body:', err);
      return {};
    }
  }
}