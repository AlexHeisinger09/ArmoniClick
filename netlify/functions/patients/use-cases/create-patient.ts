import { PatientService } from "../../../services/patient.service";
import { AuditService } from "../../../services/AuditService";
import { db } from "../../../data/db";
import { CreatePatientDto } from "../dtos";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";
import { AUDIT_ENTITY_TYPES, AUDIT_ACTIONS } from "../../../data/schemas";

interface CreatePatientUseCase {
  execute: (dto: CreatePatientDto, doctorId: number) => Promise<HandlerResponse>;
}

export class CreatePatient implements CreatePatientUseCase {
  constructor(
    private readonly patientService: PatientService = new PatientService(),
    private readonly auditService: AuditService = new AuditService(db)
  ) {}

  public async execute(dto: CreatePatientDto, doctorId: number): Promise<HandlerResponse> {
    try {
      // Verificar si el RUT ya existe para este doctor
      const existingPatient = await this.patientService.findByRut(dto.rut, doctorId);

      if (existingPatient) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Ya existe un paciente con este RUT",
          }),
          headers: HEADERS.json,
        };
      }

      const newPatient = await this.patientService.create({
        rut: dto.rut,
        nombres: dto.nombres,
        apellidos: dto.apellidos,
        fecha_nacimiento: dto.fecha_nacimiento,
        telefono: dto.telefono,
        email: dto.email,
        direccion: dto.direccion,
        ciudad: dto.ciudad,
        codigo_postal: dto.codigo_postal,
        alergias: dto.alergias,
        medicamentos_actuales: dto.medicamentos_actuales,
        enfermedades_cronicas: dto.enfermedades_cronicas,
        cirugias_previas: dto.cirugias_previas,
        hospitalizaciones_previas: dto.hospitalizaciones_previas,
        notas_medicas: dto.notas_medicas,
        id_doctor: doctorId,
      });

      // 📝 Registrar en auditoría
      await this.auditService.logChange({
        patientId: newPatient.id,
        entityType: AUDIT_ENTITY_TYPES.PACIENTE,
        entityId: newPatient.id,
        action: AUDIT_ACTIONS.CREATED,
        newValues: {
          rut: newPatient.rut,
          nombres: newPatient.nombres,
          apellidos: newPatient.apellidos,
          email: newPatient.email,
          telefono: newPatient.telefono,
        },
        changedBy: doctorId,
        notes: `Paciente ${newPatient.nombres} ${newPatient.apellidos} creado`,
      });

      return {
        statusCode: 201,
        body: JSON.stringify({
          message: "Paciente creado exitosamente",
          patient: newPatient,
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al crear el paciente",
          error: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}
