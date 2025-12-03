// netlify/functions/public-booking/generate-link.ts
import { Handler, HandlerEvent } from "@netlify/functions";
import { HEADERS } from "../../config/utils";
import { JwtAdapter } from "../../config/adapters/jwt.adapter";

const handler: Handler = async (event: HandlerEvent) => {
  const { httpMethod } = event;

  // Manejar preflight OPTIONS
  if (httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: HEADERS.json,
    };
  }

  try {
    // POST /public-booking/generate-link
    // Cuerpo esperado: { doctorId: number, durations: number[] }
    if (httpMethod === "POST") {
      let data: any = {};

      if (event.body) {
        try {
          data = JSON.parse(event.body);
        } catch (e) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "JSON inválido" }),
            headers: HEADERS.json,
          };
        }
      }

      const { doctorId, durations } = data;

      if (!doctorId || !Array.isArray(durations) || durations.length === 0) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "doctorId y durations son requeridos",
          }),
          headers: HEADERS.json,
        };
      }

      // Validar que las duraciones sean válidas
      const validDurations = durations.filter(
        (d: number) => [30, 60, 90, 120].includes(d)
      );

      if (validDurations.length === 0) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Duraciones inválidas",
          }),
          headers: HEADERS.json,
        };
      }

      // Generar token firmado (válido por 1 año)
      const token = await JwtAdapter.generateToken(
        {
          doctorId: parseInt(doctorId),
          durations: validDurations.sort((a: number, b: number) => a - b),
        },
        "365d"
      );

      if (!token) {
        return {
          statusCode: 500,
          body: JSON.stringify({ message: "Error al generar token" }),
          headers: HEADERS.json,
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          token,
          link: `${process.env.FRONTEND_URL || "http://localhost:3000"}/book-appointment/${token}`,
        }),
        headers: HEADERS.json,
      };
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Método no permitido" }),
      headers: HEADERS.json,
    };
  } catch (error: any) {
    console.error("Error en generate-link:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error al procesar: " + error.message,
      }),
      headers: HEADERS.json,
    };
  }
};

export { handler };
