import { HttpAdapter } from '@/config/adapters/http/index';

export interface AuditLog {
  id: number;
  patient_id: number;
  entity_type: string;
  entity_id: number;
  action: string;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  changed_by: number;
  created_at: string;
  notes?: string;
  doctor_name?: string;
}

export interface AuditHistoryResponse {
  patientId: number;
  totalLogs: number;
  logs: AuditLog[];
}

export async function getAuditHistoryUseCase(
  httpAdapter: HttpAdapter,
  patientId: number
): Promise<AuditHistoryResponse> {
  try {
    const response = await httpAdapter.get<AuditHistoryResponse>(
      `/patient-history/${patientId}`
    );
    return response;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Error obtaining patient audit history'
    );
  }
}
