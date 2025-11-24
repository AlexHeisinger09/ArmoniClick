// src/core/use-cases/schedule-blocks/getScheduleBlocks.usecase.ts
import { ScheduleBlock } from "@/core/entities/ScheduleBlock";
import { apiFetcher } from "@/config/adapters/api.adapter";

interface GetScheduleBlocksResponse {
  blocks: ScheduleBlock[];
  total: number;
}

export const getScheduleBlocksUseCase = async (
  doctorId: number
): Promise<GetScheduleBlocksResponse> => {
  const response = await apiFetcher.get<GetScheduleBlocksResponse>(
    `/schedule-blocks?doctorId=${doctorId}`
  );
  return response;
};

export const getScheduleBlockByIdUseCase = async (
  blockId: number
): Promise<{ block: ScheduleBlock }> => {
  const response = await apiFetcher.get<{ block: ScheduleBlock }>(
    `/schedule-blocks/${blockId}`
  );
  return response;
};
