import { db } from "../../../../data/postgres.db";
import { patients, treatments, appointments, budgets, budgetItems, services } from "../../../../data/schemas";
import { eq, and, desc } from "drizzle-orm";
import { AIService, PatientSummaryRequest } from "../../../services";
import { HEADERS } from "../../../config/utils";

export class GeneratePatientSummary {
  async execute(patientId: number, doctorId: number) {
    try {
      // 1. Obtener datos del paciente
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

      // 2. Obtener tratamientos recientes (últimos 6 meses)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const patientTreatments = await db
        .select()
        .from(treatments)
        .where(eq(treatments.patientId, patientId))
        .orderBy(desc(treatments.createdAt))
        .limit(20);

      // 3. Obtener citas recientes
      const patientAppointments = await db
        .select()
        .from(appointments)
        .where(eq(appointments.patientId, patientId))
        .orderBy(desc(appointments.startTime))
        .limit(10);

      // 4. Obtener presupuesto activo
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

        // Obtener items del presupuesto
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

      // 5. Preparar datos para el servicio de IA
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

      // 6. Generar resumen con IA
      const aiService = new AIService();
      const summary = await aiService.generatePatientSummary(aiRequest);

      return {
        statusCode: 200,
        body: JSON.stringify({
          patientId: patient.id,
          patientName: patient.fullName,
          summary,
          generatedAt: new Date().toISOString(),
        }),
        headers: HEADERS.json,
      };

    } catch (error) {
      console.error("Error al generar resumen del paciente:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al generar el resumen clínico",
          error: error instanceof Error ? error.message : "Error desconocido"
        }),
        headers: HEADERS.json,
      };
    }
  }
}
