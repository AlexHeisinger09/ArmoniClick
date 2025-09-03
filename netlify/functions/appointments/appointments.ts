// netlify/functions/appointments/appointments.ts
import { Handler, HandlerEvent } from "@netlify/functions";
import { validateJWT } from "../../middlewares";
import { HEADERS, fromBodyToObject } from "../../config/utils";
import * as AppointmentServiceNS from "../../services/appointment.service";
const AppointmentService: any = AppointmentServiceNS as any;

// Normaliza "YYYY-MM-DD HH:mm" o ISO a Date, sin agregar offsets (-04:00/Z)
function parseIncomingDate(input?: string): Date | null {
  if (!input) return null;
  const normalized = input.includes("T") ? input : input.replace(" ", "T");
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Soporta validateJWT con firma (token) o (event)
async function getAuth(event: HandlerEvent): Promise<{ user: any } | { statusCode: number; body: string; headers: any }> {
  const token = (event.headers?.authorization ?? event.headers?.Authorization ?? "") as string;
  try {
    const res = await (validateJWT as any)(token || event);
    if (res && typeof res === "object" && "statusCode" in res) return res as any;
    if (res && typeof res === "object" && ("ok" in res || "user" in res)) {
      const ok = (res as any).ok ?? true;
      if (!ok) {
        return { statusCode: 401, body: JSON.stringify({ message: (res as any).message ?? "No autorizado" }), headers: HEADERS.json };
      }
      return { user: (res as any).user };
    }
    if ((res as any)?.user) return { user: (res as any).user };
  } catch {}
  return { statusCode: 401, body: JSON.stringify({ message: "No autorizado" }), headers: HEADERS.json };
}

// Adaptadores por si los nombres/firmas del service varían
async function svcList(params: any) {
  if (typeof (AppointmentService as any).findMany === "function") return (AppointmentService as any).findMany(params);
  if (typeof (AppointmentService as any).list === "function") return (AppointmentService as any).list(params);
  if (typeof (AppointmentService as any).getAll === "function") return (AppointmentService as any).getAll(params);
  throw new Error("AppointmentService: no se encontró método de listado.");
}
async function svcGetById(id: number, userId?: number) {
  if (typeof (AppointmentService as any).findById === "function") return (AppointmentService as any).findById(id, userId);
  if (typeof (AppointmentService as any).getById === "function") return (AppointmentService as any).getById(id, userId);
  if (typeof (AppointmentService as any).get === "function") return (AppointmentService as any).get(id, userId);
  throw new Error("AppointmentService: no se encontró método findById/getById/get.");
}
async function svcCreate(userId: number, data: any) {
  if (typeof (AppointmentService as any).create !== "function") throw new Error("AppointmentService: no se encontró create.");
  try {
    if ((AppointmentService as any).create.length >= 2) return (AppointmentService as any).create(userId, data);
    return (AppointmentService as any).create({ ...data, userId });
  } catch {
    return (AppointmentService as any).create(userId, data);
  }
}
async function svcUpdate(userId: number, id: number, data: any) {
  if (typeof (AppointmentService as any).update !== "function") throw new Error("AppointmentService: no se encontró update.");
  try {
    if ((AppointmentService as any).update.length >= 3) return (AppointmentService as any).update(userId, id, data);
    if ((AppointmentService as any).update.length === 2) return (AppointmentService as any).update(id, data);
    return (AppointmentService as any).update({ id, userId, ...data });
  } catch {
    return (AppointmentService as any).update(id, data);
  }
}
async function svcDelete(userId: number, id: number) {
  if (typeof (AppointmentService as any).delete === "function") {
    try {
      if ((AppointmentService as any).delete.length >= 2) return (AppointmentService as any).delete(userId, id);
      return (AppointmentService as any).delete(id);
    } catch {
      return (AppointmentService as any).delete(id);
    }
  }
  if (typeof (AppointmentService as any).remove === "function") return (AppointmentService as any).remove(id);
  throw new Error("AppointmentService: no se encontró delete/remove.");
}

const handler: Handler = async (event) => {
  try {
    if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: HEADERS.json };

    const auth = await getAuth(event);
    if ("statusCode" in auth) return auth;
    const userData = auth.user || { id: undefined };

    const { httpMethod, queryStringParameters } = event;
    const body = event.body ? fromBodyToObject(event.body) : {};
    const idParam = queryStringParameters?.id ?? body?.id;
    const hasId = idParam != null;
    const id = hasId ? Number(idParam) : undefined;

    if (httpMethod === "GET") {
      if (hasId) {
        if (!Number.isFinite(id!) || (id as number) <= 0) return { statusCode: 400, body: JSON.stringify({ message: "ID inválido" }), headers: HEADERS.json };
        const item = await svcGetById(id as number, userData?.id);
        if (!item) return { statusCode: 404, body: JSON.stringify({ message: "Cita no encontrada" }), headers: HEADERS.json };
        return { statusCode: 200, body: JSON.stringify(item), headers: HEADERS.json };
      }
      const startDateRaw = queryStringParameters?.startDate;
      const endDateRaw = queryStringParameters?.endDate;
      const doctorId = queryStringParameters?.doctorId ? Number(queryStringParameters.doctorId) : undefined;

      let start: Date | undefined;
      let end: Date | undefined;
      if (startDateRaw) {
        const d = parseIncomingDate(startDateRaw);
        if (!d) return { statusCode: 400, body: JSON.stringify({ message: "startDate inválida" }), headers: HEADERS.json };
        start = d;
      }
      if (endDateRaw) {
        const d = parseIncomingDate(endDateRaw);
        if (!d) return { statusCode: 400, body: JSON.stringify({ message: "endDate inválida" }), headers: HEADERS.json };
        end = d;
      }

      const items = await svcList({ userId: userData?.id, doctorId, startDate: start, endDate: end });
      return { statusCode: 200, body: JSON.stringify(items), headers: HEADERS.json };
    }

    if (httpMethod === "POST") {
      const appointmentDateRaw = body.appointmentDate ?? body.date ?? body.start ?? body.startDate;
      const appointmentDate = parseIncomingDate(appointmentDateRaw);
      if (!appointmentDate) return { statusCode: 400, body: JSON.stringify({ message: "appointmentDate inválida" }), headers: HEADERS.json };

      const data = {
        doctorId: Number(body.doctorId),
        patientId: body.patientId ? Number(body.patientId) : null,
        guestName: body.guestName ?? null,
        guestEmail: body.guestEmail ?? null,
        guestPhone: body.guestPhone ?? null,
        title: body.title ?? "Consulta",
        notes: body.notes ?? null,
        duration: body.duration ? Number(body.duration) : 60,
        appointmentDate, // ✅ Date real, sin "-04:00"
      };

      const created = await svcCreate(userData?.id, data);
      return { statusCode: 201, body: JSON.stringify(created), headers: HEADERS.json };
    }

    if (httpMethod === "PUT" && hasId) {
      if (!Number.isFinite(id!) || (id as number) <= 0) return { statusCode: 400, body: JSON.stringify({ message: "ID inválido" }), headers: HEADERS.json };

      const update: any = {};
      if (body.title != null) update.title = String(body.title);
      if (body.notes != null) update.notes = String(body.notes);
      if (body.duration != null) update.duration = Number(body.duration);

      if (body.appointmentDate || body.date || body.start || body.startDate) {
        const raw = body.appointmentDate ?? body.date ?? body.start ?? body.startDate;
        const d = parseIncomingDate(raw);
        if (!d) return { statusCode: 400, body: JSON.stringify({ message: "appointmentDate inválida" }), headers: HEADERS.json };
        update.appointmentDate = d; // ✅ Date real
      }

      const updated = await svcUpdate(userData?.id, id as number, update);
      return { statusCode: 200, body: JSON.stringify(updated), headers: HEADERS.json };
    }

    if (httpMethod === "DELETE" && hasId) {
      if (!Number.isFinite(id!) || (id as number) <= 0) return { statusCode: 400, body: JSON.stringify({ message: "ID inválido" }), headers: HEADERS.json };
      await svcDelete(userData?.id, id as number);
      return { statusCode: 204, body: "", headers: HEADERS.json };
    }

    return { statusCode: 405, body: JSON.stringify({ message: "Método no permitido" }), headers: HEADERS.json };
  } catch (error: any) {
    console.error("❌ Error in appointments handler:", error);
    return { statusCode: 500, body: JSON.stringify({ message: error?.message ?? "Error interno del servidor" }), headers: HEADERS.json };
  }
};

export { handler };
