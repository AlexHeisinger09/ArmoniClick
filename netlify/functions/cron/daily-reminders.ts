import { Handler } from "@netlify/functions";
import { AppointmentService } from "../../services/appointment.service";
import { HEADERS } from "../../config/utils";

export const handler: Handler = async (event, context) => {
  const userAgent = event.headers["user-agent"] || "";
  const isCronJob = userAgent.includes("Netlify") || event.headers["x-netlify-scheduled"];

  const authToken = event.headers["authorization"];
  const isManualTest = authToken === "Bearer test-cron-token";

  if (!isCronJob && !isManualTest) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Unauthorized - This endpoint is for scheduled jobs only" }),
      headers: HEADERS.json,
    };
  }

  try {
    const result = await AppointmentService.sendBatchReminders();
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Daily reminders processed successfully",
        timestamp: new Date().toISOString(),
        results: { sent: result.sent, failed: result.failed, total: result.sent + result.failed },
      }),
      headers: HEADERS.json,
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "Error processing daily reminders",
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      headers: HEADERS.json,
    };
  }
};
