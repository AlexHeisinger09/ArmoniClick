// src/core/use-cases/schedule-blocks/updateScheduleBlock.usecase.ts
import { ScheduleBlock } from "@/core/entities/ScheduleBlock";
import { apiFetcher } from "@/config/adapters/api.adapter";

export interface UpdateScheduleBlockData {
  blockType?: 'single_date' | 'recurring';
  blockDate?: string;
  startTime?: string;
  endTime?: string;
  recurringPattern?: 'daily' | 'weekly' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  recurringEndDate?: string | null;
  reason?: string | null;
}

interface UpdateScheduleBlockResponse {
  message: string;
  block: ScheduleBlock;
}

export const updateScheduleBlockUseCase = async (
  blockId: number,
  data: UpdateScheduleBlockData
): Promise<UpdateScheduleBlockResponse> => {
  const response = await apiFetcher.put<UpdateScheduleBlockResponse>(
    `/schedule-blocks/${blockId}`,
    data
  );
  return response;
};
