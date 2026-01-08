export interface Notification {
  id: number;
  type: 'appointment_confirmed' | 'appointment_cancelled';
  doctorId: number;
  appointmentId: number | null;
  title: string;
  message: string;
  patientName: string | null;
  appointmentDate: Date | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
