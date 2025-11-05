// src/presentation/pages/calendar/hooks/useCalendar.ts - CON MENÚ CONTEXTUAL
import { useState, useEffect } from 'react';
import { 
  AppointmentsCalendarData, 
  CalendarAppointment, 
  NewAppointmentForm, 
  ViewMode, 
  CalendarDay 
} from '../types/calendar';
import { formatDateKey } from '../utils/calendar';
import { useCalendarAppointments } from '@/presentation/hooks/appointments/useCalendarAppointments';
import { useNotification } from '@/presentation/hooks/notifications/useNotification';
import { useNavigate } from 'react-router-dom';

export const useCalendar = () => {
  const navigate = useNavigate();
  
  // Estados locales para la UI
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState<boolean>(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('day');

  // Estados para menú contextual
  const [showContextMenu, setShowContextMenu] = useState<boolean>(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointment | null>(null);

  // Hook de notificaciones
  const notification = useNotification();

  const [newAppointment, setNewAppointment] = useState<NewAppointmentForm>({
    patient: '',
    service: '',
    description: '',
    time: '',
    duration: 30,  // Duración por defecto: 30 minutos
    date: null,
    patientId: undefined,
    guestName: undefined,
    guestEmail: undefined,
    guestPhone: undefined,
    guestRut: undefined
  });

  // Hook del backend
  const {
    appointments,
    isLoading,
    error,
    isCreating,
    isUpdatingStatus,
    createAppointment,
    updateAppointmentStatus,
    refetch
  } = useCalendarAppointments(currentDate, viewMode);

  // Debug logs
  useEffect(() => {
    console.log('🔍 useCalendar - appointments changed:', {
      currentDate: currentDate.toISOString(),
      viewMode,
      appointmentsKeys: Object.keys(appointments),
      appointmentsCount: Object.keys(appointments).reduce((total, key) => total + appointments[key].length, 0)
    });
  }, [appointments, currentDate, viewMode]);

  // Navegación por fechas
  const navigateDate = (direction: number): void => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewMode === 'month') {
        newDate.setMonth(prev.getMonth() + direction);
      } else if (viewMode === 'week') {
        newDate.setDate(prev.getDate() + (direction * 7));
      } else if (viewMode === 'day') {
        newDate.setDate(prev.getDate() + direction);
      }
      return newDate;
    });
  };

  const goToToday = (): void => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (day: CalendarDay): void => {
    if (day.isCurrentMonth) {
      if (viewMode === 'month') {
        setSelectedDate(day.date);
        setNewAppointment({
          patient: '',
          service: '',
          description: '',
          time: '',
          duration: 30,  // Duración por defecto: 30 minutos
          date: day.date,
          patientId: undefined,
          guestName: undefined,
          guestEmail: undefined,
          guestPhone: undefined,
          guestRut: undefined
        });
        setShowNewAppointmentModal(true);
      } else {
        setSelectedDate(day.date);
        setShowModal(true);
      }
    }
  };

  const handleNewAppointment = (timeSlot: string, targetDate?: Date): void => {
    const dateToUse = targetDate || selectedDate || currentDate;
    
    setSelectedTimeSlot(timeSlot);
    setNewAppointment(prev => ({
      ...prev,
      time: timeSlot,
      date: dateToUse
    }));
    setSelectedDate(dateToUse);
    setShowNewAppointmentModal(true);
  };

  const handleCreateAppointment = async (): Promise<void> => {
    const hasPatient = newAppointment.patientId || newAppointment.guestName || newAppointment.patient;

    if (!hasPatient || !newAppointment.service || !newAppointment.time || !newAppointment.date) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    const isEditing = !!(window as any).__editingAppointmentId;

    try {
      if (isEditing) {
        // Modo edición: hacer PUT en lugar de POST
        const appointmentId = (window as any).__editingAppointmentId;
        const numericId = Number(appointmentId);

        if (isNaN(numericId)) {
          throw new Error('ID de cita inválido para edición');
        }

        // Validar que tenemos token
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No hay token de autenticación. Por favor inicia sesión nuevamente');
        }

        // Construir la fecha y hora en el formato que espera el backend
        if (!newAppointment.date) {
          throw new Error('Fecha de cita es obligatoria');
        }

        const appointmentDate = new Date(newAppointment.date);
        const [hours, mins] = newAppointment.time.split(':').map(Number);
        appointmentDate.setHours(hours, mins, 0, 0);

        // Convertir a ISO string con timezone
        const isoDateTime = appointmentDate.toISOString();

        const updatePayload = {
          title: `${newAppointment.patient} - ${newAppointment.service}`,
          description: newAppointment.description || null,
          appointmentDate: isoDateTime,
          duration: newAppointment.duration || 30,
          notes: newAppointment.description || null
        };

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments/${numericId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updatePayload)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Error al actualizar la cita');
        }

        console.log('✅ Appointment updated successfully');
        notification.success('Cita actualizada exitosamente');

        // Limpiar flag de edición
        delete (window as any).__editingAppointmentId;
      } else {
        // Modo creación: usar el flujo normal
        await createAppointment(newAppointment);

        const patientName = newAppointment.patientId
          ? newAppointment.patient
          : newAppointment.guestName || newAppointment.patient;

        const hasEmail = newAppointment.patientId
          ? true
          : !!(newAppointment.guestEmail?.trim());

        notification.notifyAppointmentCreated(patientName, hasEmail);

        if (hasEmail) {
          setTimeout(() => {
            notification.notifyReminderInfo();
          }, 2000);
        }
      }

      setNewAppointment({
        patient: '',
        service: '',
        description: '',
        time: '',
        duration: 30,  // Duración por defecto: 30 minutos
        date: null,
        patientId: undefined,
        guestName: undefined,
        guestEmail: undefined,
        guestPhone: undefined,
        guestRut: undefined
      });
      setShowNewAppointmentModal(false);

      // Recargar citas
      refetch();

    } catch (error: any) {
      console.error('❌ Error:', error);

      if (error.message?.includes('email')) {
        notification.notifyEmailError(error.message, 'confirmation');
      } else {
        notification.error(error.message || 'Error al guardar la cita');
      }
    }
  };

  const closeModal = (): void => {
    setShowModal(false);
  };

  const closeNewAppointmentModal = (): void => {
    setShowNewAppointmentModal(false);
    setNewAppointment({
      patient: '',
      service: '',
      description: '',
      time: '',
      duration: 30,  // Duración por defecto: 30 minutos
      date: null,
      patientId: undefined,
      guestName: undefined,
      guestEmail: undefined,
      guestPhone: undefined,
      guestRut: undefined
    });
  };

  const handleDateSelect = (date: Date): void => {
    setCurrentDate(date);
  };

  // Handlers del menú contextual
  const handleAppointmentClick = (appointment: CalendarAppointment, event: React.MouseEvent): void => {
    event.preventDefault();
    
    console.log('🖱️ Appointment clicked:', {
      id: appointment.id,
      idType: typeof appointment.id,
      patient: appointment.patient,
      status: appointment.status,
      fullAppointment: appointment
    });
    
    setSelectedAppointment(appointment);
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setShowContextMenu(true);
  };

  const closeContextMenu = (): void => {
    setShowContextMenu(false);
    setSelectedAppointment(null);
  };

  const handleUpdateStatus = async (appointmentId: string, status: string, reason?: string): Promise<void> => {
    console.log('🔄 handleUpdateStatus called with:', {
      appointmentId,
      appointmentIdType: typeof appointmentId,
      status,
      reason,
      parsedId: Number(appointmentId),
      isValidNumber: !isNaN(Number(appointmentId))
    });

    if (!appointmentId || appointmentId === 'null' || appointmentId === 'undefined') {
      console.error('❌ Invalid appointment ID:', appointmentId);
      throw new Error('ID de cita inválido');
    }

    const numericId = Number(appointmentId);
    
    if (isNaN(numericId)) {
      console.error('❌ Cannot parse appointment ID to number:', appointmentId);
      throw new Error('ID de cita no es un número válido');
    }

    try {
      console.log('📤 Calling updateAppointmentStatus with:', {
        id: numericId,
        status,
        reason
      });

      await updateAppointmentStatus({
        id: numericId,
        status,
        reason
      });
      
      console.log('✅ Status updated successfully');
    } catch (error) {
      console.error('❌ Error updating appointment status:', error);
      throw error;
    }
  };

  const handleNavigateToPatient = (patientId: number): void => {
    navigate(`/dashboard/pacientes?id=${patientId}`);
  };

  const handleAppointmentEdit = (appointment: CalendarAppointment): void => {
    console.log('✏️ Edit appointment:', appointment);

    // Convertir la cita a formato de edición
    const appointmentDate = appointment.start ? new Date(appointment.start) : currentDate;

    setNewAppointment({
      patient: appointment.patient || '',
      service: appointment.service || '',
      description: appointment.notes || '',
      time: appointment.time,
      duration: appointment.duration,
      date: appointmentDate,
      patientId: appointment.patientId,
      guestName: appointment.guestName,
      guestEmail: appointment.email,
      guestPhone: appointment.phone,
      guestRut: undefined
    });

    setSelectedDate(appointmentDate);
    setSelectedTimeSlot(appointment.time);

    // Agregar un flag para indicar que es edición
    (window as any).__editingAppointmentId = appointment.id;

    setShowNewAppointmentModal(true);
    closeContextMenu();
  };

  const handleDeleteAppointment = async (appointmentId: string): Promise<void> => {
    console.log('🗑️ Delete appointment:', appointmentId);

    const numericId = Number(appointmentId);

    if (isNaN(numericId)) {
      throw new Error('ID de cita no es un número válido');
    }

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Llamar a la API para eliminar la cita
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments/${numericId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        throw new Error('No autorizado. Por favor inicia sesión nuevamente');
      }

      if (response.status === 404) {
        throw new Error('La cita no existe');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Error al eliminar la cita');
      }

      console.log('✅ Appointment deleted successfully');
      notification.success('Cita eliminada exitosamente');

      // Recargar las citas
      refetch();
    } catch (error: any) {
      console.error('❌ Error deleting appointment:', error);
      throw error;
    }
  };

  return {
    // Estado
    currentDate,
    selectedDate,
    showModal,
    showNewAppointmentModal,
    appointments,
    selectedTimeSlot,
    viewMode,
    newAppointment,
    
    // Estados del menú contextual
    showContextMenu,
    contextMenuPosition,
    selectedAppointment,
    
    // Estados del backend
    isLoading,
    error,
    isCreating,
    isUpdatingStatus,

    // Acciones
    setViewMode,
    setSelectedDate,
    setShowModal,
    setNewAppointment,
    navigateDate,
    goToToday,
    handleDateClick,
    handleNewAppointment,
    handleCreateAppointment,
    handleAppointmentClick,
    handleDateSelect,
    closeModal,
    closeNewAppointmentModal,
    
    // Acciones del menú contextual
    closeContextMenu,
    handleUpdateStatus,
    handleNavigateToPatient,
    handleAppointmentEdit,
    handleDeleteAppointment,

    // Funciones del backend
    refetch
  };
};