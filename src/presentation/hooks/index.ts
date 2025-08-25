// src/presentation/hooks/index.ts - ACTUALIZADO
export * from "./auth/useRegisterMutation";
export * from "./auth/useConfirmAccount";
export * from "./auth/useResetPasswordMutation";
export * from "./auth/useChangePasswordMutation";
export * from "./auth/useCheckUserToken";
export * from "./auth/useLoginMutation";

export * from "./user/useProfile";
export * from "./user/useUpdateProfile";
export * from "./user/useUploadProfileImage";

export * from "./patients/usePatients";
export * from "./treatments/useTreatments"; 
export * from "./treatments/useTreatmentUpload"; 

export * from './budgets/useBudgets';

// Hooks de citas - exportaciones individuales
export * from './appointments/useAppointment';
export * from './appointments/useAppointments';
export * from './appointments/useAppointmentsCalendar';
// Explicitly re-export to avoid ambiguity
export { useCalendarAppointments } from './appointments/useCalendarAppointments';
export * from './appointments/useCheckAvailability';
export * from './appointments/useCreateAppointment';
export * from './appointments/useDeleteAppointment';
export * from './appointments/useUpdateAppointment';
export * from './appointments/useUpdateAppointmentStatus';