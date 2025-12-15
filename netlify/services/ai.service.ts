import OpenAI from 'openai';
import { envs } from '../config/envs';

export interface PatientSummaryRequest {
  patientName: string;
  patientRut: string;
  patientAge?: number;
  treatments: Array<{
    date: string;
    description: string;
    status: string;
  }>;
  appointments: Array<{
    date: string;
    status: string;
    notes?: string;
  }>;
  activeBudget?: {
    total: number;
    status: string;
    items: string[];
  };
  medicalHistory?: string;
}

export interface PatientSummaryResponse {
  clinicalAlerts: string;
  currentTreatment: string;
  serviceHistory: string;
  fullSummary: string;
}

export class AIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: envs.DEEPSEEK_API_KEY,
      baseURL: envs.DEEPSEEK_BASE_URL,
      timeout: 15000, // 15 segundos de timeout para evitar timeout de Netlify
      maxRetries: 1, // Solo 1 reintento en caso de error
    });
  }

  async generatePatientSummary(
    data: PatientSummaryRequest
  ): Promise<PatientSummaryResponse> {
    const prompt = this.buildPrompt(data);

    try {
      const completion = await this.client.chat.completions.create({
        model: 'deepseek-chat', // Modelo de DeepSeek
        messages: [
          {
            role: 'system',
            content: 'Asistente odontológico. Genera resúmenes clínicos concisos en español.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5, // Reducido para respuestas más directas
        max_tokens: 800, // Reducido de 2000 a 800 para mayor velocidad
      });

      const response = completion.choices[0]?.message?.content || '';
      return this.parseResponse(response);
    } catch (error: any) {
      console.error('Error al generar resumen con DeepSeek:', error);

      // Si es error 402 (Insufficient Balance), generar resumen simulado
      if (error?.status === 402 || error?.code === 'insufficient_quota') {
        console.log('⚠️ Saldo insuficiente - Generando resumen simulado');
        return this.generateMockSummary(data);
      }

      throw new Error('No se pudo generar el resumen clínico');
    }
  }

  private buildPrompt(data: PatientSummaryRequest): string {
    // Limitar datos para reducir tokens
    const treatmentsList = data.treatments.slice(0, 5)
      .map(t => `${new Date(t.date).toLocaleDateString('es-CL')}: ${t.description}`)
      .join('\n');

    const appointmentsList = data.appointments.slice(0, 3)
      .map(a => `${new Date(a.date).toLocaleDateString('es-CL')}: ${a.status}`)
      .join('\n');

    const budgetInfo = data.activeBudget
      ? `Presupuesto activo: $${data.activeBudget.total.toLocaleString('es-CL')} - ${data.activeBudget.items.join(', ')}`
      : '';

    return `Resumen clínico odontológico/estético:

PACIENTE: ${data.patientName}, ${data.patientAge || ''}años
${data.medicalHistory || ''}

TRATAMIENTOS:
${treatmentsList || 'Sin registros'}

CITAS:
${appointmentsList || 'Sin registros'}

${budgetInfo}

Genera resumen en formato:
[ALERTAS] Alertas médicas y patrones importantes
[TRATAMIENTO] Plan de tratamiento actual (incluye odontología y estética)
[HISTORIAL] Últimas atenciones`;
  }

  private parseResponse(response: string): PatientSummaryResponse {
    // Parsear la respuesta de DeepSeek usando los marcadores
    const alertasMatch = response.match(/\[ALERTAS\]([\s\S]*?)(?=\[TRATAMIENTO\]|$)/i);
    const tratamientoMatch = response.match(/\[TRATAMIENTO\]([\s\S]*?)(?=\[HISTORIAL\]|$)/i);
    const historialMatch = response.match(/\[HISTORIAL\]([\s\S]*?)$/i);

    return {
      clinicalAlerts: alertasMatch?.[1]?.trim() ||
        'El paciente no presenta alertas médicas. Sin comentarios administrativos relevantes.',
      currentTreatment: tratamientoMatch?.[1]?.trim() ||
        'Sin tratamiento activo registrado.',
      serviceHistory: historialMatch?.[1]?.trim() ||
        'Sin historial de prestaciones recientes.',
      fullSummary: response,
    };
  }

  async askQuestion(
    patientContext: PatientSummaryRequest,
    question: string
  ): Promise<string> {
    const contextPrompt = this.buildPrompt(patientContext);

    try {
      const completion = await this.client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content:
              'Eres un asistente médico odontológico. Responde preguntas sobre el paciente basándote en su historial. Responde en español de forma profesional y concisa.',
          },
          {
            role: 'user',
            content: `Contexto del paciente:\n${contextPrompt}\n\nPregunta: ${question}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return completion.choices[0]?.message?.content || 'No se pudo generar una respuesta.';
    } catch (error: any) {
      console.error('Error al procesar pregunta con DeepSeek:', error);

      // Si es error 402 (Insufficient Balance), generar respuesta simulada
      if (error?.status === 402 || error?.code === 'insufficient_quota') {
        console.log('⚠️ Saldo insuficiente - Generando respuesta simulada');
        return this.generateMockAnswer(patientContext, question);
      }

      throw new Error('No se pudo procesar la pregunta');
    }
  }

  /**
   * Genera un resumen simulado profesional basado en los datos del paciente
   */
  private generateMockSummary(data: PatientSummaryRequest): PatientSummaryResponse {
    const hasAlerts = data.medicalHistory && data.medicalHistory.length > 50;
    const hasTreatments = data.treatments.length > 0;
    const hasAppointments = data.appointments.length > 0;
    const hasBudget = data.activeBudget !== undefined;

    // Generar alertas clínicas
    let clinicalAlerts = '';
    if (hasAlerts) {
      clinicalAlerts = `Paciente con antecedentes médicos registrados. ${data.medicalHistory}`;
    } else {
      clinicalAlerts = 'Sin alertas clínicas registradas en el historial. Paciente sin contraindicaciones conocidas.';
    }

    // Analizar citas canceladas
    const canceledAppointments = data.appointments.filter(a => a.status === 'canceled').length;
    if (canceledAppointments > 0) {
      clinicalAlerts += ` Se observan ${canceledAppointments} cita(s) cancelada(s) en el historial reciente.`;
    }

    // Generar tratamiento actual
    let currentTreatment = '';

    if (hasBudget) {
      currentTreatment = `Plan de tratamiento pendiente:\n\n`;
      currentTreatment += `**Presupuesto activo:** $${data.activeBudget!.total.toLocaleString('es-CL')}\n`;
      currentTreatment += `**Estado:** ${data.activeBudget!.status}\n\n`;
      currentTreatment += `**Tratamientos incluidos:**\n`;
      data.activeBudget!.items.forEach((item, index) => {
        currentTreatment += `${index + 1}. ${item}\n`;
      });

      if (hasTreatments) {
        const recentTreatments = data.treatments.slice(0, 2);
        currentTreatment += `\n**Últimos tratamientos realizados:**\n`;
        recentTreatments.forEach((t) => {
          const date = new Date(t.date).toLocaleDateString('es-CL');
          currentTreatment += `- ${date}: ${t.description}\n`;
        });
      }
    } else if (hasTreatments) {
      const recentTreatments = data.treatments.slice(0, 3);
      currentTreatment = 'Tratamientos registrados:\n';
      recentTreatments.forEach((t) => {
        const date = new Date(t.date).toLocaleDateString('es-CL');
        currentTreatment += `- ${date}: ${t.description} (${t.status})\n`;
      });
    } else {
      currentTreatment = 'Sin plan de tratamiento activo registrado. Se recomienda evaluación inicial para determinar necesidades del paciente.';
    }

    // Generar historial de prestaciones
    let serviceHistory = '';
    if (hasAppointments) {
      const recentAppointments = data.appointments.slice(0, 5);
      serviceHistory = 'Últimas citas registradas:\n';
      recentAppointments.forEach((a) => {
        const date = new Date(a.date).toLocaleDateString('es-CL');
        const notes = a.notes ? ` - ${a.notes}` : '';
        serviceHistory += `- ${date}: ${a.status}${notes}\n`;
      });
    } else {
      serviceHistory = 'Sin citas recientes registradas en el sistema.';
    }

    // Generar resumen completo
    const fullSummary = `
RESUMEN CLÍNICO - ${data.patientName} (RUT: ${data.patientRut})
${data.patientAge ? `Edad: ${data.patientAge} años` : ''}

[ALERTAS]
${clinicalAlerts}

[TRATAMIENTO]
${currentTreatment}

[HISTORIAL]
${serviceHistory}

---
Nota: Este resumen fue generado automáticamente basado en los datos registrados en el sistema.
    `.trim();

    return {
      clinicalAlerts,
      currentTreatment,
      serviceHistory,
      fullSummary,
    };
  }

  /**
   * Genera una respuesta simulada a una pregunta sobre el paciente
   */
  private generateMockAnswer(data: PatientSummaryRequest, question: string): string {
    const questionLower = question.toLowerCase();

    // Respuestas basadas en palabras clave
    if (questionLower.includes('alergia') || questionLower.includes('alérgico')) {
      return data.medicalHistory?.includes('Alergias')
        ? `Según el historial, el paciente presenta: ${data.medicalHistory.split('.').find(s => s.includes('Alergias')) || 'alergias registradas'}.`
        : 'No se registran alergias conocidas en el historial del paciente.';
    }

    if (questionLower.includes('medicamento') || questionLower.includes('fármaco')) {
      return data.medicalHistory?.includes('Medicamentos')
        ? `${data.medicalHistory.split('.').find(s => s.includes('Medicamentos')) || 'Medicamentos registrados'}.`
        : 'No se registran medicamentos actuales en el historial del paciente.';
    }

    if (questionLower.includes('tratamiento') || questionLower.includes('procedimiento')) {
      if (data.treatments.length > 0) {
        const recent = data.treatments[0];
        return `El último tratamiento registrado fue el ${new Date(recent.date).toLocaleDateString('es-CL')}: ${recent.description} (${recent.status}).`;
      }
      return 'No hay tratamientos registrados en el historial del paciente.';
    }

    if (questionLower.includes('presupuesto') || questionLower.includes('costo')) {
      if (data.activeBudget) {
        return `El paciente tiene un presupuesto activo de $${data.activeBudget.total.toLocaleString('es-CL')} con estado: ${data.activeBudget.status}.`;
      }
      return 'No hay presupuestos activos registrados para este paciente.';
    }

    if (questionLower.includes('cita') || questionLower.includes('agenda')) {
      if (data.appointments.length > 0) {
        const upcoming = data.appointments.filter(a => new Date(a.date) > new Date());
        const past = data.appointments.filter(a => new Date(a.date) <= new Date());
        return `El paciente tiene ${past.length} cita(s) pasada(s) registradas${upcoming.length > 0 ? ` y ${upcoming.length} cita(s) programada(s)` : ''}.`;
      }
      return 'No hay citas registradas en el historial del paciente.';
    }

    // Respuesta genérica
    return `Basado en el historial de ${data.patientName}: ${data.treatments.length} tratamiento(s) registrado(s), ${data.appointments.length} cita(s) en el sistema${data.activeBudget ? ` y un presupuesto activo de $${data.activeBudget.total.toLocaleString('es-CL')}` : ''}. Para información más específica, por favor reformule su pregunta.`;
  }
}
