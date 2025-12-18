// src/core/entities/location.entity.ts
export interface Location {
  id: number;
  user_id: number;
  name: string;
  address: string;
  city: string;
  google_calendar_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}
