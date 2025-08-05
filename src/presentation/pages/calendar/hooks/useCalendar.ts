// hooks/useCalendar.ts
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

  const navigateDate = (direction: number): void => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewMode === 'month') {
        newDate.setMonth(prev.getMonth() + direction);
      } else if (viewMode === 'week') {
        newDate.setDate(prev.getDate() + (direction * 7));
      } else if (viewMode === 'day') {
        // En vista diaria, las flechas cambian semana completa
        newDate.setDate(prev.getDate() + (direction * 7));
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

  const handleDateSelect = (date: Date): void => {
    setCurrentDate(date);
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
    navigateDate,
    goToToday,
    handleDateClick,
    handleNewAppointment,
    handleCreateAppointment,
    handleAppointmentEdit,
    handleDateSelect,
    closeModal,
    closeNewAppointmentModal
  };
};