export class CreatePatientDto {
  private constructor(
    public readonly rut: string,
    public readonly nombres: string,
    public readonly apellidos: string,
    public readonly fecha_nacimiento: string,
    public readonly telefono: string,
    public readonly email: string,
    public readonly direccion: string,
    public readonly ciudad: string,
    public readonly codigo_postal?: string,
    public readonly alergias?: string,
    public readonly medicamentos_actuales?: string,
    public readonly enfermedades_cronicas?: string,
    public readonly cirugias_previas?: string,
    public readonly hospitalizaciones_previas?: string,
    public readonly notas_medicas?: string,
  ) {}

  static create(object: { [key: string]: any }): [string?, CreatePatientDto?] {
    const { 
      rut, 
      nombres, 
      apellidos, 
      fecha_nacimiento, 
      telefono, 
      email, 
      direccion, 
      ciudad,
      codigo_postal,
      alergias,
      medicamentos_actuales,
      enfermedades_cronicas,
      cirugias_previas,
      hospitalizaciones_previas,
      notas_medicas
    } = object;

    // Validaciones requeridas
    if (!rut?.trim()) return ["RUT es requerido"];
    if (!nombres?.trim()) return ["Nombres es requerido"];
    if (!apellidos?.trim()) return ["Apellidos es requerido"];
    if (!fecha_nacimiento?.trim()) return ["Fecha de nacimiento es requerida"];
    if (!telefono?.trim()) return ["Teléfono es requerido"];
    if (!email?.trim()) return ["Email es requerido"];
    if (!direccion?.trim()) return ["Dirección es requerida"];
    if (!ciudad?.trim()) return ["Ciudad es requerida"];

    // Validaciones de formato
    const rutRegex = /^\d{7,8}-[\dkK]$/;
    if (!rutRegex.test(rut)) {
      return ["Formato de RUT inválido (ej: 12345678-9)"];
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return ["Email no es válido"];
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fecha_nacimiento)) {
      return ["Formato de fecha inválido (YYYY-MM-DD)"];
    }

    // Validar que la fecha no sea futura
    const birthDate = new Date(fecha_nacimiento);
    const today = new Date();
    if (birthDate > today) {
      return ["La fecha de nacimiento no puede ser futura"];
    }

    return [undefined, new CreatePatientDto(
      rut.trim(),
      nombres.trim(),
      apellidos.trim(),
      fecha_nacimiento.trim(),
      telefono.trim(),
      email.trim().toLowerCase(),
      direccion.trim(),
      ciudad.trim(),
      codigo_postal?.trim() || undefined,
      alergias?.trim() || undefined,
      medicamentos_actuales?.trim() || undefined,
      enfermedades_cronicas?.trim() || undefined,
      cirugias_previas?.trim() || undefined,
      hospitalizaciones_previas?.trim() || undefined,
      notas_medicas?.trim() || undefined,
    )];
  }
}