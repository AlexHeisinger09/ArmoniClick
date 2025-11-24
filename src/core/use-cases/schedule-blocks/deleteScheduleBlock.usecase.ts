// src/core/use-cases/schedule-blocks/deleteScheduleBlock.usecase.ts
import { apiFetcher } from "@/config/adapters/api.adapter";

interface DeleteScheduleBlockResponse {
  message: string;
}

export const deleteScheduleBlockUseCase = async (
  blockId: number
): Promise<DeleteScheduleBlockResponse> => {
  const response = await apiFetcher.delete<DeleteScheduleBlockResponse>(
    `/schedule-blocks/${blockId}`
  );
  return response;
};
