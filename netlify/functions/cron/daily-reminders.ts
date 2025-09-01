// netlify/functions/cron/daily-reminders.ts
import { Handler, HandlerEvent } from "@netlify/functions";
import { AppointmentService } from "../../services/appointment.service";
import { HEADERS } from "../../config/utils";

const handler: Handler = async (event: HandlerEvent) => {
  // Permitir ejecución por Netlify Scheduler o manual con token
  const userAgent = event.headers["user-agent"] || "";
  const isCronJob = userAgent.includes("Netlify") || !!event.headers["x-netlify-scheduled"];

  const authToken = event.headers["authorization"];
  const isManualTest = authToken === "Bearer test-cron-token";

  if (!isCronJob && !isManualTest) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        message: "Unauthorized - This endpoint is for scheduled jobs only",
      }),
      headers: HEADERS.json,
    };
  }

  try {
    console.log("🔔 Starting daily reminder cron job...");
    console.log("⏰ Current time:", new Date().toISOString());

    // Ejecutar envío de recordatorios
    const result = await AppointmentService.sendBatchReminders();

    const response = {
      success: true,
      message: "Daily reminders processed successfully",
      timestamp: new Date().toISOString(),
      results: {
        sent: result.sent,
        failed: result.failed,
        total: result.sent + result.failed,
      },
    };

    console.log("✅ Cron job completed:", response);

    return {
      statusCode: 200,
      body: JSON.stringify(response),
      headers: HEADERS.json,
    };
  } catch (error: any) {
    console.error("❌ Error in daily reminders cron:", error);

    const errorResponse = {
      success: false,
      message: "Error processing daily reminders",
      error: error.message,
      timestamp: new Date().toISOString(),
    };

    return {
      statusCode: 500,
      body: JSON.stringify(errorResponse),
      headers: HEADERS.json,
    };
  }
};

export { handler };
