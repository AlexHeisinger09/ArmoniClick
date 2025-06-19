import { Patient } from "../../core/entities/patient.entity";
import { PatientResponse, PatientsListResponse } from "../interfaces/patient.response";

export class PatientMapper {
  static fromResponseToEntity(response: PatientResponse): Patient {
    return {
      id: response.id,
      rut: response.rut,
      nombres: response.nombres,
      apellidos: response.apellidos,
      fechaNacimiento: response.fechaNacimiento,
      telefono: response.telefono,
      email: response.email,
      direccion: response.direccion,
      ciudad: response.ciudad,
      codigoPostal: response.codigoPostal,
      idDoctor: response.idDoctor,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
      isActive: response.isActive,
    };
  }

  static fromResponseListToEntityList(response: PatientsListResponse): Patient[] {
    return response.patients.map(this.fromResponseToEntity);
  }
}