import { db } from "../../../data/db";
import { patientsTable } from "../../../data/schemas/patient.schema";
import { auditLogsTable, AUDIT_ENTITY_TYPES } from "../../../data/schemas/audit.schema";
import { appointmentsTable } from "../../../data/schemas/appointment.schema";
import { budgetsTable } from "../../../data/schemas/budget.schema";
import { eq, and, desc, gte } from "drizzle-orm";
import { AIService, PatientSummaryRequest } from "../../../services";
import { HEADERS } from "../../../config/utils";

export class AskPatientQuestion {
  async execute(patientId: number, doctorId: number, question: string) {
    try {
      // 1. Validar que la pregunta no esté vacía
      if (!question || question.trim().length === 0) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "La pregunta no puede estar vacía" }),
          headers: HEADERS.json,
        };
      }

      // 2. Obtener datos del paciente
      const [patient] = await db
        .select()
        .from(patientsTable)
        .where(
          and(
            eq(patientsTable.id, patientId),
            eq(patientsTable.id_doctor, doctorId)
          )
        );

      if (!patient) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Paciente no encontrado" }),
          headers: HEADERS.json,
        };
      }

      // 3. Obtener historial de auditoría
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const auditHistory = await db
        .select()
        .from(auditLogsTable)
        .where(
          and(
            eq(auditLogsTable.patient_id, patientId),
            gte(auditLogsTable.created_at, sixMonthsAgo)
          )
        )
        .orderBy(desc(auditLogsTable.created_at))
        .limit(50);

      // 4. Obtener citas recientes
      const patientAppointments = await db
        .select()
        .from(appointmentsTable)
        .where(eq(appointmentsTable.patientId, patientId))
        .orderBy(desc(appointmentsTable.startTime))
        .limit(10);

      // 5. Obtener presupuesto activo
      const activeBudgets = await db
        .select()
        .from(budgetsTable)
        .where(
          and(
            eq(budgetsTable.patientId, patientId),
            eq(budgetsTable.status, "pendiente")
          )
        )
        .orderBy(desc(budgetsTable.createdAt))
        .limit(1);

      let activeBudgetData = undefined;
      if (activeBudgets.length > 0) {
        const budget = activeBudgets[0];
        activeBudgetData = {
          total: budget.total,
          status: budget.status,
          items: [`Presupuesto #${budget.id}`],
        };
      }

      // 6. Preparar datos del historial
      const treatmentHistory = auditHistory
        .filter(log => log.entity_type === AUDIT_ENTITY_TYPES.TRATAMIENTO)
        .map(log => ({
          date: log.created_at.toISOString(),
          action: log.action,
          description: JSON.stringify(log.new_values),
          status: 'registrado'
        }));

      const budgetHistory = auditHistory
        .filter(log => log.entity_type === AUDIT_ENTITY_TYPES.PRESUPUESTO)
        .map(log => ({
          date: log.created_at.toISOString(),
          action: log.action,
          description: JSON.stringify(log.new_values),
          status: 'registrado'
        }));

      const combinedTreatments = [
        ...treatmentHistory,
        ...budgetHistory
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // 7. Preparar contexto para la IA
      const fullName = `${patient.nombres} ${patient.apellidos}`;
      const age = patient.fecha_nacimiento
        ? Math.floor((Date.now() - new Date(patient.fecha_nacimiento).getTime()) / (1000 * 60 * 60 * 24 * 365))
        : undefined;

      const aiRequest: PatientSummaryRequest = {
        patientName: fullName,
        patientRut: patient.rut,
        patientAge: age,
        treatments: combinedTreatments,
        appointments: patientAppointments.map(a => ({
          date: a.startTime.toISOString(),
          status: a.status,
          notes: a.notes || undefined,
        })),
        activeBudget: activeBudgetData,
        medicalHistory: [
          patient.alergias ? `Alergias: ${patient.alergias}` : null,
          patient.medicamentos_actuales ? `Medicamentos: ${patient.medicamentos_actuales}` : null,
          patient.enfermedades_cronicas ? `Enfermedades crónicas: ${patient.enfermedades_cronicas}` : null,
          patient.cirugias_previas ? `Cirugías previas: ${patient.cirugias_previas}` : null,
          patient.notas_medicas ? `Notas: ${patient.notas_medicas}` : null,
        ].filter(Boolean).join('. '),
      };

      // 8. Hacer la pregunta a la IA
      const aiService = new AIService();
      const answer = await aiService.askQuestion(aiRequest, question);

      return {
        statusCode: 200,
        body: JSON.stringify({
          question,
          answer,
          answeredAt: new Date().toISOString(),
        }),
        headers: HEADERS.json,
      };

    } catch (error) {
      console.error("Error al procesar pregunta:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al procesar la pregunta",
          error: error instanceof Error ? error.message : "Error desconocido"
        }),
        headers: HEADERS.json,
      };
    }
  }
}
