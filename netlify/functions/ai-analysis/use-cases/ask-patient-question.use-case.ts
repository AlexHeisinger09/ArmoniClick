import { db } from "../../../data/db";
import { patients, treatments, appointments, budgets, budgetItems, services } from "../../../data/schemas";
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

      // 2. Obtener datos del paciente (mismo código que en generate-patient-summary)
      const [patient] = await db
        .select()
        .from(patients)
        .where(
          and(
            eq(patients.id, patientId),
            eq(patients.doctorId, doctorId)
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
        .from(treatments)
        .where(eq(treatments.patientId, patientId))
        .orderBy(desc(treatments.createdAt))
        .limit(20);

      const patientAppointments = await db
        .select()
        .from(appointments)
        .where(eq(appointments.patientId, patientId))
        .orderBy(desc(appointments.startTime))
        .limit(10);

      const activeBudgets = await db
        .select()
        .from(budgets)
        .where(
          and(
            eq(budgets.patientId, patientId),
            eq(budgets.status, "pendiente")
          )
        )
        .orderBy(desc(budgets.createdAt))
        .limit(1);

      let activeBudgetData = undefined;
      if (activeBudgets.length > 0) {
        const budget = activeBudgets[0];
        const items = await db
          .select({
            itemName: budgetItems.itemName,
            serviceName: services.name,
          })
          .from(budgetItems)
          .leftJoin(services, eq(budgetItems.serviceId, services.id))
          .where(eq(budgetItems.budgetId, budget.id));

        activeBudgetData = {
          total: budget.total,
          status: budget.status,
          items: items.map(item => item.serviceName || item.itemName),
        };
      }

      // 4. Preparar contexto para la IA
      const aiRequest: PatientSummaryRequest = {
        patientName: patient.fullName,
        patientRut: patient.rut,
        patientAge: patient.birthDate
          ? Math.floor((Date.now() - new Date(patient.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365))
          : undefined,
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
        medicalHistory: patient.medicalHistory || undefined,
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
