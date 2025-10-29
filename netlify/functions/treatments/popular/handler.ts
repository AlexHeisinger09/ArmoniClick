import { Handler } from "@netlify/functions";
import { sql } from "drizzle-orm";
import { db } from "../../data/db";
import { validateJWT } from "../../../config/jwt";
import { HEADERS } from "../../../config/utils";

interface TreatmentCount {
  nombre_servicio: string;
  frecuencia: number | string | bigint;
}

const handler: Handler = async (event) => {
  // Validar JWT
  const user = await validateJWT(event.headers.authorization || "");
  if (user.statusCode !== 200) return user;

  try {
    const userData = JSON.parse(user.body);
    const doctorId = Number(userData.id);

    console.log('🎯 Obteniendo tratamientos populares para doctor:', doctorId);

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

    // ✅ Convertir frecuencia a número
    const data = rows.map(row => ({
      nombre_servicio: row.nombre_servicio,
      frecuencia: typeof row.frecuencia === 'string'
        ? parseInt(row.frecuencia, 10)
        : Number(row.frecuencia)
    }));

    console.log(`📊 Tratamientos encontrados: ${data.length}`, data);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data,
      }),
      headers: HEADERS.json,
    };
  } catch (error) {
    console.error("❌ Error fetching popular treatments:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error al obtener tratamientos populares",
        details: (error as any).message,
      }),
      headers: HEADERS.json,
    };
  }
};

export { handler };
