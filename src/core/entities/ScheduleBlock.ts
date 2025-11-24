// src/core/entities/ScheduleBlock.ts
export interface ScheduleBlock {
  id: number;
  doctorId: number;
  blockType: 'single_date' | 'recurring';
  blockDate: string; // ISO format YYYY-MM-DD
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  recurringPattern?: string; // daily, weekly, monday, etc
  recurringEndDate?: string; // ISO format YYYY-MM-DD
  reason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ScheduleBlockFormData {
  blockType: 'single_date' | 'recurring';
  blockDate: string;
  startTime: string;
  endTime: string;
  recurringPattern?: 'daily' | 'weekly' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  recurringEndDate?: string;
  reason?: string;
}
