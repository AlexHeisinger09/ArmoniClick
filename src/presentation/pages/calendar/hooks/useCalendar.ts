// hooks/useCalendar.ts - Corrección para navegación por días
import { useState, useEffect } from 'react';
import { 
  AppointmentsData, 
  Appointment, 
  NewAppointmentForm, 
  ViewMode, 
  CalendarDay 
} from '../types/calendar';
import { exampleAppointments } from '../constants/calendar';
import { formatDateKey } from '../utils/calendar';

export const useCalendar = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState<boolean>(false);
  const [appointments, setAppointments] = useState<AppointmentsData>({});
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('week');

  const [newAppointment, setNewAppointment] = useState<NewAppointmentForm>({
    patient: '',
    service: '',
    description: '',
    time: '',
    duration: 60,
    date: null
  });

  useEffect(() => {
    setAppointments(exampleAppointments);
  }, []);

  // NAVEGACIÓN CORREGIDA - Diferente lógica según la vista
  const navigateDate = (direction: number): void => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewMode === 'month') {
        // Navegación por mes
        newDate.setMonth(prev.getMonth() + direction);
      } else if (viewMode === 'week') {
        // Navegación por semana (7 días)
        newDate.setDate(prev.getDate() + (direction * 7));
      } else if (viewMode === 'day') {
        // NAVEGACIÓN POR DÍA (1 día) - CORRECCIÓN AQUÍ
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
      // En vista mensual, ir directo al modal de nueva cita
      if (viewMode === 'month') {
        setSelectedDate(day.date);
        setNewAppointment({
          ...newAppointment,
          date: day.date,
          time: ''
        });
        setShowNewAppointmentModal(true);
      } else {
        // En otras vistas, mostrar el modal de horarios
        setSelectedDate(day.date);
        setShowModal(true);
      }
    }
  };

  const handleNewAppointment = (timeSlot: string, targetDate?: Date): void => {
    setSelectedTimeSlot(timeSlot);
    const dateToUse = targetDate || selectedDate || currentDate;
    setNewAppointment({
      ...newAppointment,
      time: timeSlot,
      date: dateToUse
    });
    setSelectedDate(dateToUse);
    setShowNewAppointmentModal(true);
  };

  const handleCreateAppointment = (): void => {
    if (!newAppointment.patient || !newAppointment.service || !newAppointment.time || !newAppointment.date) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    const dateKey = formatDateKey(newAppointment.date);
    const newId = Math.max(...Object.values(appointments).flat().map(a => a.id), 0) + 1;

    const existingAppointments = appointments[dateKey] || [];
    const conflictingAppointments = existingAppointments.filter(appointment => appointment.time === newAppointment.time);
    const isOverbook = conflictingAppointments.length >= 1;

    const appointment: Appointment = {
      id: newId,
      time: newAppointment.time,
      duration: isOverbook ? 30 : 60,
      patient: newAppointment.patient,
      service: newAppointment.service,
      status: 'pending'
    };

    setAppointments(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), appointment]
    }));

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

    alert(`Cita creada exitosamente para ${newAppointment.patient} el ${newAppointment.date.toLocaleDateString('es-CL')} a las ${newAppointment.time}`);
  };

  const closeModal = (): void => {
    setShowModal(false);
  };

  const closeNewAppointmentModal = (): void => {
    setShowNewAppointmentModal(false);
  };

  // NUEVA FUNCIÓN PARA SELECCIONAR FECHA ESPECÍFICA EN VISTA DIARIA
  const handleDateSelect = (date: Date): void => {
    if (viewMode === 'day') {
      // En vista diaria, cambiar directamente la fecha actual
      setCurrentDate(date);
    } else {
      // En otras vistas, solo cambiar la fecha actual para navegación
      setCurrentDate(date);
    }
  };

  const handleAppointmentEdit = (appointment: Appointment): void => {
    console.log('Editar cita:', appointment);
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

    // Acciones
    setViewMode,
    setSelectedDate,
    setShowModal,
    setNewAppointment,
    navigateDate, // Ahora navega por días en vista diaria
    goToToday,
    handleDateClick,
    handleNewAppointment,
    handleCreateAppointment,
    handleAppointmentEdit,
    handleDateSelect, // Función mejorada para selección de fecha
    closeModal,
    closeNewAppointmentModal
  };
};