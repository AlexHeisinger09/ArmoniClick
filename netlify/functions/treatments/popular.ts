import { Handler } from "@netlify/functions";
import { sql } from "drizzle-orm";
import { db } from "../data/db";
import { validateJWT } from "../../config/jwt";
import { HEADERS } from "../../config/utils";

interface TreatmentCount {
  nombre_servicio: string;
  frecuencia: number;
}

const handler: Handler = async (event) => {
  // Validar JWT
  const user = await validateJWT(event.headers.authorization || "");
  if (user.statusCode !== 200) return user;

  try {
    const userData = JSON.parse(user.body);
    const doctorId = Number(userData.id);

    // Query para obtener los 4 tratamientos más populares
    const treatments = await db.execute(sql`
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

    const data = treatments.rows || [];

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data,
      }),
      headers: HEADERS.json,
    };
  } catch (error) {
    console.error("Error fetching popular treatments:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error al obtener tratamientos populares",
      }),
      headers: HEADERS.json,
    };
  }
};

export { handler };
