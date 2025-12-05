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
            content:
              'Eres un asistente médico especializado en odontología. Tu tarea es generar resúmenes clínicos profesionales basados en el historial del paciente. Responde en español de forma clara y profesional.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content || '';
      return this.parseResponse(response);
    } catch (error) {
      console.error('Error al generar resumen con DeepSeek:', error);
      throw new Error('No se pudo generar el resumen clínico');
    }
  }

  private buildPrompt(data: PatientSummaryRequest): string {
    const treatmentsList = data.treatments
      .map(
        (t) =>
          `- ${new Date(t.date).toLocaleDateString('es-CL')}: ${t.description} (${t.status})`
      )
      .join('\n');

    const appointmentsList = data.appointments
      .map(
        (a) =>
          `- ${new Date(a.date).toLocaleDateString('es-CL')}: ${a.status}${a.notes ? ` - ${a.notes}` : ''}`
      )
      .join('\n');

    const budgetInfo = data.activeBudget
      ? `
Presupuesto activo: $${data.activeBudget.total.toLocaleString('es-CL')} (${data.activeBudget.status})
Items: ${data.activeBudget.items.join(', ')}`
      : 'Sin presupuesto activo';

    return `Genera un resumen clínico profesional para el siguiente paciente odontológico:

DATOS DEL PACIENTE:
- Nombre: ${data.patientName}
- RUT: ${data.patientRut}
${data.patientAge ? `- Edad: ${data.patientAge} años` : ''}

HISTORIAL DE TRATAMIENTOS:
${treatmentsList || 'Sin tratamientos registrados'}

CITAS RECIENTES:
${appointmentsList || 'Sin citas registradas'}

PRESUPUESTO:
${budgetInfo}

${data.medicalHistory ? `HISTORIAL MÉDICO ADICIONAL:\n${data.medicalHistory}` : ''}

Por favor, genera un resumen estructurado en las siguientes secciones:

1. ALERTAS CLÍNICAS Y ANTECEDENTES: Identifica alertas médicas, patrones de comportamiento (ej: citas anuladas), y antecedentes relevantes.

2. TRATAMIENTO ACTUAL: Resume el plan de tratamiento actual incluyendo procedimientos pendientes y completados.

3. HISTORIAL DE PRESTACIONES: Resume las atenciones más recientes y su estado.

Formato de respuesta:
[ALERTAS]
Tu análisis aquí

[TRATAMIENTO]
Tu análisis aquí

[HISTORIAL]
Tu análisis aquí`;
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
    } catch (error) {
      console.error('Error al procesar pregunta con DeepSeek:', error);
      throw new Error('No se pudo procesar la pregunta');
    }
  }
}
