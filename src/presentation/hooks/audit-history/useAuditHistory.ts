import { useQuery } from '@tanstack/react-query';
import { apiFetcher } from '@/config/adapters/api.adapter';
import { getAuditHistoryUseCase } from '@/core/use-cases/audit-history';

export interface AuditLog {
  id: number;
  patient_id: number;
  entity_type: string; // 'PACIENTE', 'PRESUPUESTO', 'TRATAMIENTO', 'CITA', 'DOCUMENTO'
  entity_id: number;
  action: string; // 'CREATED', 'UPDATED', 'STATUS_CHANGED', 'DELETED'
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  changed_by: number;
  created_at: string;
  notes?: string;
}

export interface AuditHistoryResponse {
  patientId: number;
  totalLogs: number;
  logs: AuditLog[];
}

export function useAuditHistory(patientId: number) {
  return useQuery({
    queryKey: ['auditHistory', patientId],
    queryFn: async () => {
      if (!patientId) {
        throw new Error('Patient ID is required');
      }
      return getAuditHistoryUseCase(apiFetcher, patientId);
    },
    enabled: !!patientId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
