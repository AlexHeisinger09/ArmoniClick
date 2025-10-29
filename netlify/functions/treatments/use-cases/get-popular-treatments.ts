import { sql } from "drizzle-orm";
import { db } from "../../data/db";
import { HandlerResponse } from "@netlify/functions";
import { HEADERS } from "../../../config/utils";

interface TreatmentCount {
  nombre_servicio: string;
  frecuencia: number | string | bigint;
}

interface PopularTreatment {
  nombre_servicio: string;
  frecuencia: number;
}

export class GetPopularTreatments {
  constructor() {}

  public async execute(doctorId: number): Promise<HandlerResponse> {
    try {
      console.log('🎯 GetPopularTreatments: Obteniendo tratamientos populares para doctor:', doctorId);

      // ✅ QUERY: obtener TOP 4 tratamientos por nombre_servicio (TODOS los tratamientos, no solo completados)
      const treatmentResults = await db.execute(sql`
        SELECT
          nombre_servicio,
          COUNT(id_tratamiento) AS frecuencia
        FROM treatments
        WHERE id_doctor = ${doctorId}
          AND is_active = true
        GROUP BY nombre_servicio
        ORDER BY frecuencia DESC
        LIMIT 4
      `) as unknown as { rows: TreatmentCount[] };

      const rows = treatmentResults.rows || [];

      console.log('🔍 Respuesta cruda de la BD:', treatmentResults);
      console.log('📋 Rows extraídas:', rows);

      // ✅ Convertir frecuencia a número
      const data: PopularTreatment[] = rows.map(row => ({
        nombre_servicio: row.nombre_servicio,
        frecuencia: typeof row.frecuencia === 'string'
          ? parseInt(row.frecuencia, 10)
          : Number(row.frecuencia)
      }));

      console.log(`📊 Tratamientos populares encontrados: ${data.length}`, data);

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          data,
        }),
        headers: HEADERS.json,
      };
    } catch (error) {
      console.error("❌ Error en GetPopularTreatments:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Error al obtener tratamientos populares",
          details: (error as any).message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}
