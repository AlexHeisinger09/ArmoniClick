export class UpdateTreatmentDto {
  private constructor(
    public readonly fecha_control?: string,
    public readonly hora_control?: string,
    public readonly fecha_proximo_control?: string,
    public readonly hora_proximo_control?: string,
    public readonly nombre_servicio?: string,
    public readonly producto?: string,
    public readonly lote_producto?: string,
    public readonly fecha_venc_producto?: string,
    public readonly dilucion?: string,
    public readonly foto1?: string,
    public readonly foto2?: string,
    public readonly descripcion?: string,
  ) {}

  static create(object: { [key: string]: any }): [string?, UpdateTreatmentDto?] {
    const { 
      fecha_control,
      hora_control,
      fecha_proximo_control,
      hora_proximo_control,
      nombre_servicio,
      producto,
      lote_producto,
      fecha_venc_producto,
      dilucion,
      foto1,
      foto2,
      descripcion
    } = object;

    // Validaciones solo si los campos están presentes
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^\d{2}:\d{2}$/;

    if (fecha_control !== undefined) {
      if (!fecha_control?.trim()) return ["Fecha de control no puede estar vacía"];
      if (!dateRegex.test(fecha_control)) {
        return ["Formato de fecha de control inválido (YYYY-MM-DD)"];
      }
      
      const controlDate = new Date(fecha_control);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (controlDate > today) {
        return ["La fecha de control no puede ser futura"];
      }
    }

    if (hora_control !== undefined) {
      if (!hora_control?.trim()) return ["Hora de control no puede estar vacía"];
      if (!timeRegex.test(hora_control)) {
        return ["Formato de hora de control inválido (HH:MM)"];
      }
    }

    if (nombre_servicio !== undefined && !nombre_servicio?.trim()) {
      return ["Nombre del servicio no puede estar vacío"];
    }

    if (fecha_proximo_control !== undefined && fecha_proximo_control?.trim()) {
      if (!dateRegex.test(fecha_proximo_control)) {
        return ["Formato de fecha próximo control inválido (YYYY-MM-DD)"];
      }
    }

    if (hora_proximo_control !== undefined && hora_proximo_control?.trim()) {
      if (!timeRegex.test(hora_proximo_control)) {
        return ["Formato de hora próximo control inválido (HH:MM)"];
      }
    }

    if (fecha_venc_producto !== undefined && fecha_venc_producto?.trim()) {
      if (!dateRegex.test(fecha_venc_producto)) {
        return ["Formato de fecha de vencimiento inválido (YYYY-MM-DD)"];
      }
    }

    return [undefined, new UpdateTreatmentDto(
      fecha_control?.trim(),
      hora_control?.trim(),
      fecha_proximo_control?.trim() || undefined,
      hora_proximo_control?.trim() || undefined,
      nombre_servicio?.trim(),
      producto?.trim() || undefined,
      lote_producto?.trim() || undefined,
      fecha_venc_producto?.trim() || undefined,
      dilucion?.trim() || undefined,
      foto1?.trim() || undefined,
      foto2?.trim() || undefined,
      descripcion?.trim() || undefined,
    )];
  }
}