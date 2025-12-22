// netlify/functions/prescriptions/dtos/save-prescription.dto.ts
export class SavePrescriptionDto {
  private constructor(
    public readonly patientId: number,
    public readonly medications: string
  ) {}

  static create(object: { [key: string]: any }): [string?, SavePrescriptionDto?] {
    const { patientId, medications } = object;

    // Validar patientId
    if (!patientId) {
      return ["ID del paciente es requerido"];
    }
    if (isNaN(Number(patientId))) {
      return ["ID del paciente debe ser un número"];
    }

    // Validar medications
    if (!medications) {
      return ["Las medicaciones son requeridas"];
    }
    if (typeof medications !== 'string') {
      return ["Las medicaciones deben ser texto"];
    }
    if (medications.trim().length === 0) {
      return ["Las medicaciones no pueden estar vacías"];
    }

    return [undefined, new SavePrescriptionDto(
      Number(patientId),
      medications.trim()
    )];
  }
}
