import { db } from "../../../data/db";
import { patientsTable } from "../../../data/schemas/patient.schema";
import { treatmentsTable } from "../../../data/schemas/treatment.schema";
import { appointmentsTable } from "../../../data/schemas/appointment.schema";
import { budgetsTable, budgetItemsTable } from "../../../data/schemas/budget.schema";
import { servicesTable } from "../../../data/schemas/service.schema";
import { eq, and, desc } from "drizzle-orm";
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

      // 3. Obtener contexto del paciente
      const patientTreatments = await db
        .select()
        .from(treatmentsTable)
        .where(eq(treatmentsTable.patientId, patientId))
        .orderBy(desc(treatmentsTable.createdAt))
        .limit(20);

      const patientAppointments = await db
        .select()
        .from(appointmentsTable)
        .where(eq(appointmentsTable.patientId, patientId))
        .orderBy(desc(appointmentsTable.startTime))
        .limit(10);

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
        const items = await db
          .select({
            itemName: budgetItemsTable.itemName,
            serviceName: servicesTable.name,
          })
          .from(budgetItemsTable)
          .leftJoin(servicesTable, eq(budgetItemsTable.serviceId, servicesTable.id))
          .where(eq(budgetItemsTable.budgetId, budget.id));

        activeBudgetData = {
          total: budget.total,
          status: budget.status,
          items: items.map(item => item.serviceName || item.itemName),
        };
      }

      // 4. Preparar contexto para la IA
      const fullName = `${patient.nombres} ${patient.apellidos}`;
      const age = patient.fecha_nacimiento
        ? Math.floor((Date.now() - new Date(patient.fecha_nacimiento).getTime()) / (1000 * 60 * 60 * 24 * 365))
        : undefined;

      const aiRequest: PatientSummaryRequest = {
        patientName: fullName,
        patientRut: patient.rut,
        patientAge: age,
        treatments: patientTreatments.map(t => ({
          date: t.createdAt.toISOString(),
          description: t.description,
          status: t.status,
        })),
        appointments: patientAppointments.map(a => ({
          date: a.startTime.toISOString(),
          status: a.status,
          notes: a.notes || undefined,
        })),
        activeBudget: activeBudgetData,
        medicalHistory: patient.notas_medicas || undefined,
      };

      // 5. Hacer la pregunta a la IA
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
