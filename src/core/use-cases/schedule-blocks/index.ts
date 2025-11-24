// src/core/use-cases/schedule-blocks/index.ts
export * from './getScheduleBlocks.usecase';
export * from './createScheduleBlock.usecase';
export * from './updateScheduleBlock.usecase';
export * from './deleteScheduleBlock.usecase';

export type ScheduleBlock = {
  id: number;
  doctorId: number;
  blockType: 'single_date' | 'recurring';
  blockDate: string;
  startTime: string;
  endTime: string;
  recurringPattern?: string;
  recurringEndDate?: string;
  reason?: string;
  createdAt: string;
  updatedAt?: string;
};
