export class CreateTreatmentDto {
  private constructor(
    public readonly id_paciente: number,
    public readonly fecha_control: string,
    public readonly hora_control: string,
    public readonly fecha_proximo_control: string | undefined,
    public readonly hora_proximo_control: string | undefined,
    public readonly nombre_servicio: string,
    public readonly producto: string | undefined,
    public readonly lote_producto: string | undefined,
    public readonly fecha_venc_producto: string | undefined,
    public readonly dilucion: string | undefined,
    public readonly foto1: string | undefined,
    public readonly foto2: string | undefined,
    public readonly descripcion: string | undefined,
  ) {}

  static create(object: { [key: string]: any }): [string?, CreateTreatmentDto?] {
    const { 
      id_paciente,
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

    // Validaciones requeridas
    if (!id_paciente) return ["ID del paciente es requerido"];
    if (isNaN(Number(id_paciente))) return ["ID del paciente debe ser un número"];
    
    if (!fecha_control?.trim()) return ["Fecha de control es requerida"];
    if (!hora_control?.trim()) return ["Hora de control es requerida"];
    if (!nombre_servicio?.trim()) return ["Nombre del servicio es requerido"];

    // Validaciones de formato
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^\d{2}:\d{2}$/;

    if (!dateRegex.test(fecha_control)) {
      return ["Formato de fecha de control inválido (YYYY-MM-DD)"];
    }

    if (!timeRegex.test(hora_control)) {
      return ["Formato de hora de control inválido (HH:MM)"];
    }

    // Validar fecha próximo control si se proporciona
    if (fecha_proximo_control && !dateRegex.test(fecha_proximo_control)) {
      return ["Formato de fecha próximo control inválido (YYYY-MM-DD)"];
    }

    // Validar hora próximo control si se proporciona
    if (hora_proximo_control && !timeRegex.test(hora_proximo_control)) {
      return ["Formato de hora próximo control inválido (HH:MM)"];
    }

    // Validar fecha de vencimiento si se proporciona
    if (fecha_venc_producto && !dateRegex.test(fecha_venc_producto)) {
      return ["Formato de fecha de vencimiento inválido (YYYY-MM-DD)"];
    }

    // Validar que la fecha de control no sea futura
    const controlDate = new Date(fecha_control);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (controlDate > today) {
      return ["La fecha de control no puede ser futura"];
    }

    // Validar que la fecha próximo control sea posterior a la fecha de control
    if (fecha_proximo_control) {
      const proximoControlDate = new Date(fecha_proximo_control);
      if (proximoControlDate <= controlDate) {
        return ["La fecha próximo control debe ser posterior a la fecha de control"];
      }
    }

    return [undefined, new CreateTreatmentDto(
      Number(id_paciente),
      fecha_control.trim(),
      hora_control.trim(),
      fecha_proximo_control?.trim() || undefined,
      hora_proximo_control?.trim() || undefined,
      nombre_servicio.trim(),
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