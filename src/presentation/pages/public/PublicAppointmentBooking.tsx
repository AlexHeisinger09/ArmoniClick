// src/presentation/pages/public/PublicAppointmentBooking.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { X, Clock, Calendar, Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTimeSlotsForDuration } from '@/presentation/pages/calendar/constants/calendar';
import { isTimeSlotAvailable } from '@/presentation/pages/calendar/utils/calendar';
import { AppointmentsData } from '@/presentation/pages/calendar/types/calendar';
import { ScheduleBlock } from '@/core/entities/ScheduleBlock';

interface PublicAppointmentForm {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  date: Date;
  time: string;
  duration: number;
}

export const PublicAppointmentBooking: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Doctor data
  const [doctorName, setDoctorName] = useState('');
  const [availableDurations, setAvailableDurations] = useState<number[]>([30, 60]);
  const [appointments, setAppointments] = useState<AppointmentsData>({});
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]);

  // Form state
  const [appointmentForm, setAppointmentForm] = useState<PublicAppointmentForm>({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    date: new Date(),
    time: '',
    duration: 30
  });

  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Fetch doctor info and availability on mount
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setIsLoading(true);

        // Construir URL con parámetros de query
        let url = `/public-booking-info/${doctorId}`;
        if (location.search) {
          url += location.search; // Incluye ?durations=30,60,90
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Doctor no encontrado o link inválido');
        }

        const data = await response.json();
        setDoctorName(data.doctorName || 'Doctor');
        setAvailableDurations(data.availableDurations || [30, 60]);
        setAppointments(data.appointments || {});
        setScheduleBlocks(data.scheduleBlocks || []);

        // Set default duration from available durations
        if (data.availableDurations && data.availableDurations.length > 0) {
          setAppointmentForm(prev => ({
            ...prev,
            duration: data.availableDurations[0]
          }));
        }
      } catch (error: any) {
        setErrorMessage(error.message || 'Error al cargar la información del doctor');
      } finally {
        setIsLoading(false);
      }
    };

    if (doctorId) {
      fetchDoctorData();
    }
  }, [doctorId, location.search]);

  const handleFormChange = (updates: Partial<PublicAppointmentForm>) => {
    setAppointmentForm(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!appointmentForm.patientName || !appointmentForm.patientEmail || !appointmentForm.patientPhone) {
      setErrorMessage('Por favor completa todos los campos de información personal');
      return;
    }

    if (!appointmentForm.date || !appointmentForm.time) {
      setErrorMessage('Por favor selecciona fecha y horario');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const response = await fetch(
        `/public-booking/create-appointment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            doctorId: parseInt(doctorId || '0'),
            patientName: appointmentForm.patientName,
            patientEmail: appointmentForm.patientEmail,
            patientPhone: appointmentForm.patientPhone,
            appointmentDate: appointmentForm.date.toISOString().split('T')[0],
            startTime: appointmentForm.time,
            duration: appointmentForm.duration
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear la cita');
      }

      const result = await response.json();
      setSuccessMessage('Cita agendada exitosamente. Te enviaremos un email de confirmación.');
      setAppointmentForm({
        patientName: '',
        patientEmail: '',
        patientPhone: '',
        date: new Date(),
        time: '',
        duration: availableDurations[0] || 30
      });
    } catch (error: any) {
      setErrorMessage(error.message || 'Error al crear la cita');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDaysInMonth = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - ((firstDay.getDay() + 6) % 7));

    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const navigateMonth = (direction: number) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(selectedMonth.getMonth() + direction);
    setSelectedMonth(newMonth);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelectedDate = (date: Date) => {
    return date.toDateString() === appointmentForm.date.toDateString();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 animate-spin text-cyan-500" />
          <p className="text-slate-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header Profesional */}
        <div className="text-center mb-10 pt-4">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <img
              src="https://res.cloudinary.com/drfvhhrck/image/upload/v1764792657/letras_o42jqi.png"
              alt="ArmoniClick Logo"
              className="h-16 object-contain"
            />
          </div>

          {/* Título Principal */}
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-3">
            Reservar Cita
          </h1>

          {/* Doctor Name */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl p-4 inline-block mb-2">
            <p className="text-sm text-slate-600 font-medium">Agendando con</p>
            <p className="text-xl font-bold text-slate-800">
              {doctorName}
            </p>
          </div>

          <p className="text-slate-500 mt-4 text-sm max-w-md mx-auto">
            Selecciona la fecha y horario que mejor se adapte a tu disponibilidad
          </p>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {successMessage}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                👤 Información Personal
              </h3>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={appointmentForm.patientName}
                  onChange={(e) => handleFormChange({ patientName: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all bg-white"
                  placeholder="Tu nombre completo"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={appointmentForm.patientEmail}
                    onChange={(e) => handleFormChange({ patientEmail: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all bg-white"
                    placeholder="tu@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={appointmentForm.patientPhone}
                    onChange={(e) => handleFormChange({ patientPhone: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all bg-white"
                    placeholder="+56 9 XXXX XXXX"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Appointment Selection */}
            <div className="space-y-4 pt-2">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                📅 Seleccionar Cita
              </h3>

              {/* Date Selector */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Fecha *
                </label>

                {/* Month Navigator */}
                <div className="flex items-center justify-between mb-3 bg-slate-50 rounded-lg p-2">
                  <button
                    type="button"
                    onClick={() => navigateMonth(-1)}
                    disabled={isSubmitting}
                    className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <h3 className="text-lg font-semibold text-slate-800">
                    {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
                  </h3>

                  <button
                    type="button"
                    onClick={() => navigateMonth(1)}
                    disabled={isSubmitting}
                    className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Calendar */}
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                  {/* Day headers */}
                  <div className="grid grid-cols-7 bg-slate-50">
                    {dayNames.map(day => (
                      <div key={day} className="p-2 text-center text-xs font-medium text-slate-600">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Days */}
                  <div className="grid grid-cols-7">
                    {getDaysInMonth().map((day, index) => {
                      const isCurrentMonth = day.getMonth() === selectedMonth.getMonth();
                      const isSelected = isSelectedDate(day);
                      const isCurrentDay = isToday(day);
                      const isPast = isPastDate(day);

                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => !isPast && !isSubmitting && handleFormChange({ date: day })}
                          disabled={isPast || isSubmitting}
                          className={`
                            h-10 text-sm transition-colors relative
                            ${isCurrentMonth ? 'hover:bg-cyan-50' : 'text-slate-400'}
                            ${isSelected ? 'bg-cyan-500 text-white' : ''}
                            ${isCurrentDay && !isSelected ? 'bg-blue-50 text-blue-600 font-semibold' : ''}
                            ${isPast ? 'text-slate-300 cursor-not-allowed' : 'cursor-pointer'}
                            ${!isPast && !isSelected && isCurrentMonth ? 'hover:bg-slate-100' : ''}
                          `}
                        >
                          {day.getDate()}
                          {isCurrentDay && !isSelected && (
                            <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {appointmentForm.date && (
                  <div className="mt-2 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                    <p className="text-sm text-cyan-800 font-medium">
                      {appointmentForm.date.toLocaleDateString('es-CL', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Duration Selector */}
              {appointmentForm.date && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Duración de la Cita *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {availableDurations.map(duration => (
                      <button
                        key={duration}
                        type="button"
                        onClick={() => !isSubmitting && handleFormChange({ duration, time: '' })}
                        disabled={isSubmitting}
                        className={`
                          p-2.5 text-sm rounded-lg transition-all border-2 font-medium disabled:cursor-not-allowed flex items-center justify-center
                          ${appointmentForm.duration === duration
                            ? 'bg-cyan-500 text-white border-cyan-500 shadow-lg scale-105'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-50'
                          }
                        `}
                      >
                        <Clock className="w-4 h-4 mr-1" />
                        {duration} min
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Selector - Only available times */}
              {appointmentForm.date && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Horario * ({appointmentForm.duration} min)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {getTimeSlotsForDuration(appointmentForm.duration)
                      .filter(time => {
                        // Filter: only show available times
                        return isTimeSlotAvailable(
                          appointments,
                          appointmentForm.date,
                          time,
                          appointmentForm.duration,
                          scheduleBlocks
                        );
                      })
                      .map(time => {
                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => {
                              if (!isSubmitting) {
                                handleFormChange({ time });
                              }
                            }}
                            disabled={isSubmitting}
                            className={`
                              p-3 text-sm rounded-lg transition-all border-2 font-medium flex items-center justify-center
                              ${appointmentForm.time === time
                                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-cyan-600 shadow-lg scale-105'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-cyan-400 hover:shadow-md'
                              }
                            `}
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            {time}
                          </button>
                        );
                      })}
                  </div>
                  {getTimeSlotsForDuration(appointmentForm.duration).filter(time =>
                    isTimeSlotAvailable(
                      appointments,
                      appointmentForm.date,
                      time,
                      appointmentForm.duration,
                      scheduleBlocks
                    )
                  ).length === 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-700">
                        No hay horarios disponibles para esta fecha y duración. Intenta con otra fecha.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button
                type="submit"
                disabled={isSubmitting || !appointmentForm.patientName || !appointmentForm.patientEmail || !appointmentForm.patientPhone || !appointmentForm.date || !appointmentForm.time}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed text-white rounded-xl transition-all font-bold text-lg flex items-center justify-center gap-2 shadow-lg disabled:shadow-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Agendando...
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    Confirmar Cita
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-slate-500">
            ¿Necesitas ayuda? Contacta directamente con el consultorio
          </p>
        </div>
      </div>
    </div>
  );
};
