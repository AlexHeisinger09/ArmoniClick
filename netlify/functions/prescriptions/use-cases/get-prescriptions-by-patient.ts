// netlify/functions/prescriptions/use-cases/get-prescriptions-by-patient.ts
import { eq, and, desc } from "drizzle-orm";
import { db } from "../../../data/db";
import { prescriptionsTable } from "../../../data/schemas/prescription.schema";
import { HEADERS } from "../../../config/utils";

export class GetPrescriptionsByPatient {
  async execute(patientId: number, userId: number) {
    try {
      const prescriptions = await db
        .select()
        .from(prescriptionsTable)
        .where(
          and(
            eq(prescriptionsTable.patient_id, patientId),
            eq(prescriptionsTable.user_id, userId)
          )
        )
        .orderBy(desc(prescriptionsTable.created_at));

      return {
        statusCode: 200,
        body: JSON.stringify({
          prescriptions,
          total: prescriptions.length,
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: error.message || "Error al obtener las recetas",
        }),
        headers: HEADERS.json,
      };
    }
  }
}
