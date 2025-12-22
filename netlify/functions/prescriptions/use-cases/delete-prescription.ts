// netlify/functions/prescriptions/use-cases/delete-prescription.ts
import { eq, and } from "drizzle-orm";
import { db } from "../../../data/db";
import { prescriptionsTable } from "../../../data/schemas/prescription.schema";
import { HEADERS } from "../../../config/utils";

export class DeletePrescription {
  async execute(prescriptionId: number, userId: number) {
    try {
      // Verificar que la receta existe y pertenece al usuario
      const [prescription] = await db
        .select()
        .from(prescriptionsTable)
        .where(
          and(
            eq(prescriptionsTable.id, prescriptionId),
            eq(prescriptionsTable.user_id, userId)
          )
        );

      if (!prescription) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: "Receta no encontrada",
          }),
          headers: HEADERS.json,
        };
      }

      // Eliminar la receta
      await db
        .delete(prescriptionsTable)
        .where(eq(prescriptionsTable.id, prescriptionId));

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Receta eliminada exitosamente",
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: error.message || "Error al eliminar la receta",
        }),
        headers: HEADERS.json,
      };
    }
  }
}
