// src/presentation/pages/calendar/hooks/useCalendar.ts - CON DEBUG MEJORADO
import { useState, useEffect, useMemo } from 'react';
import { 
  AppointmentsCalendarData, 
  CalendarAppointment, 
  NewAppointmentForm, 
  ViewMode, 
  CalendarDay 
} from '../types/calendar';
import { formatDateKey } from '../utils/calendar';
import { useCalendarAppointments } from '@/presentation/hooks/appointments/useCalendarAppointments';

export const useCalendar = () => {
  // Estados locales para la UI
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState<boolean>(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('day'); // ✅ Cambiar a 'day' por defecto para debugging

  const [newAppointment, setNewAppointment] = useState<NewAppointmentForm>({
    patient: '',
    service: '',
    description: '',
    time: '',
    duration: 60,
    date: null
  });

  // Hook del backend - datos reales
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

  // 🔥 DEBUG: Log de appointments cada vez que cambian
  useEffect(() => {
    console.log('🔍 useCalendar - appointments changed:', {
      currentDate: currentDate.toISOString(),
      viewMode,
      appointmentsKeys: Object.keys(appointments),
      appointmentsCount: Object.keys(appointments).reduce((total, key) => total + appointments[key].length, 0),
      appointments: appointments
    });

    // Debug específico para el día actual
    const todayKey = formatDateKey(currentDate);
    const todayAppointments = appointments[todayKey];
    console.log('📅 Today appointments:', {
      todayKey,
      todayAppointments,
      count: todayAppointments?.length || 0
    });

    // Debug para todos los días con citas
    Object.keys(appointments).forEach(dateKey => {
      const dayAppts = appointments[dateKey];
      console.log(`📆 ${dateKey}:`, dayAppts.length, 'appointments');
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
      
      console.log('🔄 Date navigation:', {
        direction,
        viewMode,
        oldDate: prev.toISOString(),
        newDate: newDate.toISOString(),
        newDateKey: formatDateKey(newDate)
      });
      
      return newDate;
    });
  };

  const goToToday = (): void => {
    const today = new Date();
    console.log('🏠 Go to today:', today.toISOString());
    setCurrentDate(today);
  };

  const handleDateClick = (day: CalendarDay): void => {
    if (day.isCurrentMonth) {
      console.log('📅 Date clicked:', day.date.toISOString());
      if (viewMode === 'month') {
        setSelectedDate(day.date);
        setNewAppointment({
          ...newAppointment,
          date: day.date,
          time: ''
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
    console.log('📝 New appointment:', {
      timeSlot,
      targetDate: targetDate?.toISOString(),
      selectedDate: selectedDate?.toISOString(),
      currentDate: currentDate.toISOString(),
      dateToUse: dateToUse.toISOString()
    });
    
    setSelectedTimeSlot(timeSlot);
    setNewAppointment({
      ...newAppointment,
      time: timeSlot,
      date: dateToUse
    });
    setSelectedDate(dateToUse);
    setShowNewAppointmentModal(true);
  };

  const handleCreateAppointment = async (): Promise<void> => {
    if (!newAppointment.patient || !newAppointment.service || !newAppointment.time || !newAppointment.date) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    console.log('✍️ Creating appointment:', newAppointment);

    try {
      await createAppointment(newAppointment);
      
      console.log('✅ Appointment created successfully');
      
      // Limpiar formulario y cerrar modal
      setNewAppointment({
        patient: '',
        service: '',
        description: '',
        time: '',
        duration: 60,
        date: null
      });
      setShowNewAppointmentModal(false);
    } catch (error: any) {
      console.error('❌ Error creating appointment:', error);
    }
  };

  const closeModal = (): void => {
    setShowModal(false);
  };

  const closeNewAppointmentModal = (): void => {
    setShowNewAppointmentModal(false);
  };

  const handleDateSelect = (date: Date): void => {
    console.log('📆 Date selected:', date.toISOString());
    if (viewMode === 'day') {
      setCurrentDate(date);
    } else {
      setCurrentDate(date);
    }
  };

  const handleAppointmentEdit = (appointment: CalendarAppointment): void => {
    console.log('✏️ Edit appointment:', appointment);
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
    handleAppointmentEdit,
    handleDateSelect,
    closeModal,
    closeNewAppointmentModal,
    
    // Funciones del backend
    updateAppointmentStatus,
    refetch
  };
};