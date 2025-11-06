import { PatientService } from "../../../services/patient.service";
import { AuditService } from "../../../services/AuditService";
import { db } from "../../../data/db";
import { UpdatePatientDto } from "../dtos";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";
import { AUDIT_ENTITY_TYPES, AUDIT_ACTIONS } from "../../../data/schemas";

interface UpdatePatientUseCase {
  execute: (patientId: number, dto: UpdatePatientDto, doctorId: number) => Promise<HandlerResponse>;
}

export class UpdatePatient implements UpdatePatientUseCase {
  constructor(
    private readonly patientService: PatientService = new PatientService(),
    private readonly auditService: AuditService = new AuditService(db)
  ) {}

  public async execute(patientId: number, dto: UpdatePatientDto, doctorId: number): Promise<HandlerResponse> {
    try {
      // Verificar que el paciente existe
      const existingPatient = await this.patientService.findById(patientId, doctorId);

      if (!existingPatient) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: "Paciente no encontrado",
          }),
          headers: HEADERS.json,
        };
      }

      // Si se está actualizando el RUT, verificar que no exista otro paciente con ese RUT
      if (dto.rut && dto.rut !== existingPatient.rut) {
        const patientWithRut = await this.patientService.findByRut(dto.rut, doctorId, patientId);

        if (patientWithRut) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "Ya existe otro paciente con este RUT",
            }),
            headers: HEADERS.json,
          };
        }
      }

      // Preparar datos para actualizar (solo los campos que no son undefined)
      const updateData: any = {};
      const changedFields: any = {};

      if (dto.rut !== undefined) {
        updateData.rut = dto.rut;
        changedFields.rut = dto.rut;
      }
      if (dto.nombres !== undefined) {
        updateData.nombres = dto.nombres;
        changedFields.nombres = dto.nombres;
      }
      if (dto.apellidos !== undefined) {
        updateData.apellidos = dto.apellidos;
        changedFields.apellidos = dto.apellidos;
      }
      if (dto.fecha_nacimiento !== undefined) {
        updateData.fecha_nacimiento = dto.fecha_nacimiento;
        changedFields.fecha_nacimiento = dto.fecha_nacimiento;
      }
      if (dto.telefono !== undefined) {
        updateData.telefono = dto.telefono;
        changedFields.telefono = dto.telefono;
      }
      if (dto.email !== undefined) {
        updateData.email = dto.email;
        changedFields.email = dto.email;
      }
      if (dto.direccion !== undefined) {
        updateData.direccion = dto.direccion;
        changedFields.direccion = dto.direccion;
      }
      if (dto.ciudad !== undefined) {
        updateData.ciudad = dto.ciudad;
        changedFields.ciudad = dto.ciudad;
      }
      if (dto.codigo_postal !== undefined) {
        updateData.codigo_postal = dto.codigo_postal;
        changedFields.codigo_postal = dto.codigo_postal;
      }
      if (dto.alergias !== undefined) {
        updateData.alergias = dto.alergias;
        changedFields.alergias = dto.alergias;
      }
      if (dto.medicamentos_actuales !== undefined) {
        updateData.medicamentos_actuales = dto.medicamentos_actuales;
        changedFields.medicamentos_actuales = dto.medicamentos_actuales;
      }
      if (dto.enfermedades_cronicas !== undefined) {
        updateData.enfermedades_cronicas = dto.enfermedades_cronicas;
        changedFields.enfermedades_cronicas = dto.enfermedades_cronicas;
      }
      if (dto.cirugias_previas !== undefined) {
        updateData.cirugias_previas = dto.cirugias_previas;
        changedFields.cirugias_previas = dto.cirugias_previas;
      }
      if (dto.hospitalizaciones_previas !== undefined) {
        updateData.hospitalizaciones_previas = dto.hospitalizaciones_previas;
        changedFields.hospitalizaciones_previas = dto.hospitalizaciones_previas;
      }
      if (dto.notas_medicas !== undefined) {
        updateData.notas_medicas = dto.notas_medicas;
        changedFields.notas_medicas = dto.notas_medicas;
      }

      const updatedPatient = await this.patientService.update(patientId, updateData, doctorId);

      // 📝 Registrar en auditoría
      await this.auditService.logChange({
        patientId: patientId,
        entityType: AUDIT_ENTITY_TYPES.PACIENTE,
        entityId: patientId,
        action: AUDIT_ACTIONS.UPDATED,
        oldValues: {
          rut: existingPatient.rut,
          nombres: existingPatient.nombres,
          apellidos: existingPatient.apellidos,
          email: existingPatient.email,
          telefono: existingPatient.telefono,
        },
        newValues: changedFields,
        changedBy: doctorId,
        notes: `Paciente ${existingPatient.nombres} ${existingPatient.apellidos} actualizado`,
      });

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Paciente actualizado exitosamente",
          patient: updatedPatient,
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al actualizar el paciente",
          error: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}