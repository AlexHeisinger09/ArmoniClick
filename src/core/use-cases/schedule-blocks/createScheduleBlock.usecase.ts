// src/core/use-cases/schedule-blocks/createScheduleBlock.usecase.ts
import { ScheduleBlock } from "@/core/entities/ScheduleBlock";
import { apiFetcher } from "@/config/adapters/api.adapter";

export interface CreateScheduleBlockData {
  blockType: 'single_date' | 'recurring';
  blockDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  recurringPattern?: 'daily' | 'weekly' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  recurringEndDate?: string; // YYYY-MM-DD
  reason?: string;
}

interface CreateScheduleBlockResponse {
  message: string;
  block: ScheduleBlock;
}

export const createScheduleBlockUseCase = async (
  data: CreateScheduleBlockData
): Promise<CreateScheduleBlockResponse> => {
  const response = await apiFetcher.post<CreateScheduleBlockResponse>(
    '/schedule-blocks',
    data
  );
  return response;
};
