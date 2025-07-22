export class UpdatePatientDto {
  private constructor(
    public readonly rut?: string,
    public readonly nombres?: string,
    public readonly apellidos?: string,
    public readonly fecha_nacimiento?: string,
    public readonly telefono?: string,
    public readonly email?: string,
    public readonly direccion?: string,
    public readonly ciudad?: string,
    public readonly codigo_postal?: string,
    public readonly alergias?: string,
    public readonly medicamentos_actuales?: string,
    public readonly enfermedades_cronicas?: string,
    public readonly cirugias_previas?: string,
    public readonly hospitalizaciones_previas?: string,
    public readonly notas_medicas?: string,
  ) {}

  static create(object: { [key: string]: any }): [string?, UpdatePatientDto?] {
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

    // Validaciones solo si los campos están presentes
    if (rut !== undefined) {
      if (!rut?.trim()) return ["RUT no puede estar vacío"];
      const rutRegex = /^\d{7,8}-[\dkK]$/;
      if (!rutRegex.test(rut)) {
        return ["Formato de RUT inválido (ej: 12345678-9)"];
      }
    }

    if (nombres !== undefined && !nombres?.trim()) {
      return ["Nombres no puede estar vacío"];
    }

    if (apellidos !== undefined && !apellidos?.trim()) {
      return ["Apellidos no puede estar vacío"];
    }

    if (fecha_nacimiento !== undefined) {
      if (!fecha_nacimiento?.trim()) return ["Fecha de nacimiento no puede estar vacía"];
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(fecha_nacimiento)) {
        return ["Formato de fecha inválido (YYYY-MM-DD)"];
      }
      
      const birthDate = new Date(fecha_nacimiento);
      const today = new Date();
      if (birthDate > today) {
        return ["La fecha de nacimiento no puede ser futura"];
      }
    }

    if (telefono !== undefined && !telefono?.trim()) {
      return ["Teléfono no puede estar vacío"];
    }

    if (email !== undefined) {
      if (!email?.trim()) return ["Email no puede estar vacío"];
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return ["Email no es válido"];
      }
    }

    if (direccion !== undefined && !direccion?.trim()) {
      return ["Dirección no puede estar vacía"];
    }

    if (ciudad !== undefined && !ciudad?.trim()) {
      return ["Ciudad no puede estar vacía"];
    }

    return [undefined, new UpdatePatientDto(
      rut?.trim(),
      nombres?.trim(),
      apellidos?.trim(),
      fecha_nacimiento?.trim(),
      telefono?.trim(),
      email?.trim().toLowerCase(),
      direccion?.trim(),
      ciudad?.trim(),
      codigo_postal?.trim(),
      alergias?.trim(),
      medicamentos_actuales?.trim(),
      enfermedades_cronicas?.trim(),
      cirugias_previas?.trim(),
      hospitalizaciones_previas?.trim(),
      notas_medicas?.trim(),
    )];
  }
}