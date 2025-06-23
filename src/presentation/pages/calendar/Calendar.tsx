import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, User, Calendar as CalendarIcon, Plus, X, Edit2, Trash2 } from 'lucide-react';

// Tipos TypeScript
interface Appointment {
  id: number;
  time: string;
  duration: 30 | 60;
  patient: string;
  service: string;
  status: 'confirmed' | 'pending';
}

interface AppointmentsData {
  [key: string]: Appointment[];
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
}

interface Service {
  name: string;
  duration: 30 | 60;
  price: string;
}

type ViewMode = 'month' | 'week' | 'day';

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState<boolean>(false);
  const [appointments, setAppointments] = useState<AppointmentsData>({});
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('week');

  // Estados para el formulario de nueva cita
  const [newAppointment, setNewAppointment] = useState({
    patient: '',
    service: '',
    description: '',
    time: '',
    duration: 60 as 30 | 60,
    date: null as Date | null
  });

  // Datos de ejemplo - esto vendría de tu backend
  const exampleAppointments: AppointmentsData = {
    '2025-06-10': [
      { id: 1, time: '09:00', duration: 60, patient: 'María García', service: 'Limpieza facial', status: 'confirmed' },
      { id: 2, time: '11:00', duration: 30, patient: 'Ana López', service: 'Depilación cejas', status: 'pending' },
      { id: 3, time: '14:30', duration: 60, patient: 'Carmen Silva', service: 'Tratamiento anti-edad', status: 'confirmed' }
    ],
    '2025-06-11': [
      { id: 4, time: '10:00', duration: 30, patient: 'Laura Martín', service: 'Manicura', status: 'confirmed' },
      { id: 5, time: '15:00', duration: 60, patient: 'Patricia Ruiz', service: 'Masaje facial', status: 'confirmed' }
    ],
    '2025-06-17': [
      { id: 6, time: '09:00', duration: 60, patient: 'Isabel Torres', service: 'Depilación', status: 'pending' },
      { id: 7, time: '10:00', duration: 60, patient: 'Sofía Mendoza', service: 'Tratamiento facial', status: 'confirmed' },
      { id: 13, time: '16:00', duration: 60, patient: 'Carla Vega', service: 'Depilación cejas', status: 'confirmed' },
      { id: 14, time: '17:00', duration: 60, patient: 'Carla Vega', service: 'Depilación cejas', status: 'confirmed' }
    ],
    '2025-06-18': [
      { id: 15, time: '10:30', duration: 60, patient: 'Rosa Jiménez', service: 'Limpieza profunda', status: 'confirmed' },
      { id: 16, time: '14:00', duration: 30, patient: 'Elena Castro', service: 'Manicura', status: 'pending' }
    ],
    '2025-06-19': [
      { id: 17, time: '09:00', duration: 30, patient: 'Andrea Morales', service: 'Pedicura', status: 'confirmed' },
      { id: 18, time: '11:30', duration: 60, patient: 'Lucía Herrera', service: 'Masaje relajante', status: 'confirmed' }
    ]
  };

  // Horarios disponibles (solo horas en punto de 9:00 AM a 5:00 PM)
  const timeSlots: string[] = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const services: Service[] = [
    { name: 'Limpieza facial', duration: 60, price: '$45.000' },
    { name: 'Tratamiento anti-edad', duration: 60, price: '$65.000' },
    { name: 'Masaje facial', duration: 60, price: '$35.000' },
    { name: 'Depilación cejas', duration: 30, price: '$15.000' },
    { name: 'Depilación facial', duration: 30, price: '$20.000' },
    { name: 'Manicura', duration: 30, price: '$18.000' },
    { name: 'Pedicura', duration: 60, price: '$25.000' }
  ];

  useEffect(() => {
    setAppointments(exampleAppointments);
  }, []);

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    // Ajustar para que lunes sea el primer día (0) en lugar de domingo
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

    const days: CalendarDay[] = [];

    // Días del mes anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }

    // Días del siguiente mes
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false });
    }

    return days;
  };

  const formatDateKey = (date: Date): string => {
    // Asegurar formato consistente YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const navigateMonth = (direction: number): void => {
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

  const isTimeSlotAvailable = (date: Date, time: string): boolean => {
    const dateKey = formatDateKey(date);
    const dayAppointments = appointments[dateKey] || [];

    const conflictingAppointments = dayAppointments.filter(appointment => appointment.time === time);

    // Permitir hasta 2 citas en el mismo horario (1 principal + 1 sobrecupo)
    return conflictingAppointments.length < 2;
  };

  const hasOverlap = (date: Date, time: string): boolean => {
    const dateKey = formatDateKey(date);
    const dayAppointments = appointments[dateKey] || [];
    const conflictingAppointments = dayAppointments.filter(appointment => appointment.time === time);
    return conflictingAppointments.length >= 1;
  };

  const handleDateClick = (day: CalendarDay): void => {
    if (day.isCurrentMonth) {
      setSelectedDate(day.date);
      if (viewMode === 'month') {
        // En vista mensual, solo actualizar la fecha seleccionada para el panel lateral
        // No abrir modal automáticamente
      } else {
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
    setSelectedDate(dateToUse); // Asegurar que la fecha seleccionada se actualice
    setShowNewAppointmentModal(true);
  };

  const handleCreateAppointment = (): void => {
    if (!newAppointment.patient || !newAppointment.service || !newAppointment.time || !newAppointment.date) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    const dateKey = formatDateKey(newAppointment.date);
    const newId = Math.max(...Object.values(appointments).flat().map(a => a.id), 0) + 1;

    // Verificar si es sobrecupo
    const existingAppointments = appointments[dateKey] || [];
    const conflictingAppointments = existingAppointments.filter(appointment => appointment.time === newAppointment.time);
    const isOverbook = conflictingAppointments.length >= 1;

    const appointment: Appointment = {
      id: newId,
      time: newAppointment.time,
      duration: isOverbook ? 30 : 60, // Sobrecupo = 30min, normal = 60min
      patient: newAppointment.patient,
      service: newAppointment.service,
      status: 'pending' // Todas las citas nuevas quedan pendientes
    };

    // Actualizar el estado de appointments
    setAppointments(prev => {
      const updated = {
        ...prev,
        [dateKey]: [...(prev[dateKey] || []), appointment]
      };
      console.log('Citas actualizadas:', updated); // Debug
      return updated;
    });

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

    // Mensaje de confirmación
    alert(`Cita creada exitosamente para ${newAppointment.patient} el ${newAppointment.date.toLocaleDateString('es-CL')} a las ${newAppointment.time}`);
  };

  const openNewAppointmentModal = (date: Date): void => {
    setSelectedDate(date); // Asegurar que la fecha se seleccione primero
    setNewAppointment({
      ...newAppointment,
      date: date,
      time: ''
    });
    setShowNewAppointmentModal(true);
  };

  const getAppointmentsForDate = (date: Date): Appointment[] => {
    const dateKey = formatDateKey(date);
    return appointments[dateKey] || [];
  };

  const monthNames: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames: string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const today = new Date();
  const isToday = (date: Date): boolean => {
    return date.toDateString() === today.toDateString();
  };

  // Funciones para vista semanal
  const getWeekDays = (date: Date): Date[] => {
    const startOfWeek = new Date(date);
    // Ajustar para que lunes sea el primer día de la semana
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - ((day + 6) % 7);
    startOfWeek.setDate(diff);

    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  const getWeekRange = (date: Date): string => {
    const weekDays = getWeekDays(date);
    const start = weekDays[0];
    const end = weekDays[6];

    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} ${monthNames[start.getMonth()]} ${start.getFullYear()}`;
    } else {
      return `${start.getDate()} ${monthNames[start.getMonth()]} - ${end.getDate()} ${monthNames[end.getMonth()]} ${start.getFullYear()}`;
    }
  };

  // Función para renderizar cita en timeline con manejo de sobrecupos
  const renderAppointmentBlock = (appointment: Appointment, date: Date, viewType: 'week' | 'day' = 'week'): React.ReactElement => {
    const dateKey = formatDateKey(date);
    const dayAppointments = appointments[dateKey] || [];
    const sameTimeAppointments = dayAppointments.filter(app => app.time === appointment.time);
    const appointmentIndex = sameTimeAppointments.findIndex(app => app.id === appointment.id);
    const isOverbook = sameTimeAppointments.length > 1;

    const [hours, minutes] = appointment.time.split(':').map(Number);

    // Configuración según la vista
    const config = viewType === 'day' ? {
      slotHeight: 72, // Altura de cada slot de tiempo en vista día
      leftOffset: 6,
      rightOffset: 6,
      textSize: 'text-sm',
      padding: 'p-2'
    } : {
      slotHeight: 65, // Altura de cada slot de tiempo en vista semana
      leftOffset: 2,
      rightOffset: 2,
      textSize: 'text-xs',
      padding: 'p-1'
    };

    // Encontrar el slot correcto basado en la hora de la cita
    const getSlotIndex = (time: string) => {
      const [hour] = time.split(':').map(Number);
      return hour - 9; // 9 AM es el primer slot (índice 0)
    };

    const slotIndex = getSlotIndex(appointment.time);
    const topOffset = slotIndex * config.slotHeight + 2; // +2 para margen superior
    const blockHeight = config.slotHeight - 4; // -4 para margen

    let positionStyle: React.CSSProperties = {
      top: `${topOffset}px`,
      height: `${blockHeight}px`,
      maxHeight: `${blockHeight}px`,
      overflow: 'hidden'
    };

    if (isOverbook) {
      if (appointmentIndex === 0) {
        // Cita principal - ocupa el 70% izquierdo
        positionStyle = {
          ...positionStyle,
          left: `${config.leftOffset}px`,
          width: '70%',
          right: 'auto'
        };
      } else {
        // Sobrecupo - línea delgada del 25% derecho
        positionStyle = {
          ...positionStyle,
          right: `${config.rightOffset}px`,
          width: '25%',
          left: 'auto'
        };
      }
    } else {
      // Cita única, ocupa todo el ancho
      positionStyle = {
        ...positionStyle,
        left: `${config.leftOffset}px`,
        right: `${config.rightOffset}px`
      };
    }

    return (
      <div
        key={appointment.id}
        className={`
          absolute rounded-lg text-white shadow-md cursor-pointer transition-all
          ${appointment.status === 'confirmed'
            ? 'bg-cyan-600 hover:bg-cyan-700'
            : 'bg-cyan-400 hover:bg-cyan-500'}
          ${isOverbook && appointmentIndex > 0 ? 'p-1' : config.padding}
        `}
        style={positionStyle}
        onClick={() => console.log('Editar cita:', appointment)}
      >
        {isOverbook && appointmentIndex > 0 ? (
          // Sobrecupo - vista compacta
          <div className="text-xs h-full flex flex-col justify-center">
            <div className="font-semibold truncate">{appointment.patient.split(' ')[0]}</div>
            <div className="text-xs opacity-90 truncate">Sobrecupo</div>
            <div className="text-xs opacity-75">{appointment.time}</div>
          </div>
        ) : (
          // Cita normal - vista completa
          <div className="h-full flex flex-col justify-center">
            <div className={`font-semibold truncate ${config.textSize}`}>
              {appointment.patient}
            </div>
            <div className={`truncate opacity-90 ${config.textSize === 'text-sm' ? 'text-xs' : 'text-xs'}`}>
              {appointment.service}
            </div>
            <div className={`opacity-75 ${config.textSize === 'text-sm' ? 'text-xs' : 'text-xs'}`}>
              {appointment.time} ({appointment.duration}min)
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendario principal */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg border border-cyan-200">
              {/* Header del calendario */}
              <div className="flex items-center justify-between p-6 border-b border-cyan-200">
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-bold text-slate-700">
                    {viewMode === 'month' && `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                    {viewMode === 'week' && getWeekRange(currentDate)}
                    {viewMode === 'day' && currentDate.toLocaleDateString('es-CL', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h2>

                  {/* Selector de vista */}
                  <div className="flex bg-slate-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('day')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'day'
                        ? 'bg-white text-slate-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                      Día
                    </button>
                    <button
                      onClick={() => setViewMode('week')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'week'
                        ? 'bg-white text-slate-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                      Semana
                    </button>
                    <button
                      onClick={() => setViewMode('month')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'month'
                        ? 'bg-white text-slate-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                      Mes
                    </button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-cyan-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-700" />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-cyan-100 rounded-lg transition-colors"
                  >
                    Hoy
                  </button>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-cyan-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-700" />
                  </button>
                </div>
              </div>

              {/* Vista por Mes */}
              {viewMode === 'month' && (
                <>
                  {/* Días de la semana */}
                  <div className="grid grid-cols-7 border-b border-cyan-200">
                    {dayNames.map(day => (
                      <div key={day} className="p-4 text-center font-semibold text-slate-500 text-sm">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Días del mes */}
                  <div className="grid grid-cols-7">
                    {getDaysInMonth(currentDate).map((day, index) => {
                      const dayAppointments = getAppointmentsForDate(day.date);
                      const hasAppointments = dayAppointments.length > 0;

                      return (
                        <div
                          key={index}
                          onClick={() => handleDateClick(day)}
                          className={`
                            min-h-24 p-2 border-b border-r border-cyan-100 cursor-pointer transition-colors
                            ${day.isCurrentMonth ? 'hover:bg-cyan-50' : 'bg-slate-100 text-slate-400'}
                            ${isToday(day.date) ? 'bg-cyan-100' : ''}
                          `}
                        >
                          <div className={`
                            text-sm font-medium mb-1
                            ${isToday(day.date) ? 'text-slate-700 font-bold' : ''}
                          `}>
                            {day.date.getDate()}
                          </div>
                          {hasAppointments && (
                            <div className="space-y-1">
                              {dayAppointments.slice(0, 2).map(appointment => (
                                <div
                                  key={appointment.id}
                                  className={`
                                    text-xs px-2 py-1 rounded text-white truncate
                                    ${appointment.status === 'confirmed' ? 'bg-cyan-600' : 'bg-cyan-400'}
                                  `}
                                >
                                  {appointment.time} - {appointment.patient}
                                </div>
                              ))}
                              {dayAppointments.length > 2 && (
                                <div className="text-xs text-slate-500 text-center">
                                  +{dayAppointments.length - 2} más
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Vista por Semana */}
              {viewMode === 'week' && (
                <div className="flex">
                  {/* Columna de horarios */}
                  <div className="w-20 border-r border-cyan-200">
                    <div className="h-16 border-b border-cyan-200"></div>
                    {timeSlots.map(time => (
                      <div
                        key={time}
                        className="px-2 py-4 text-sm text-slate-500 border-b border-cyan-100 flex items-center justify-center"
                        style={{ height: '65px' }}
                      >
                        {time}
                      </div>
                    ))}
                  </div>

                  {/* Columnas de días */}
                  {getWeekDays(currentDate).map((day, dayIndex) => {
                    const dayAppointments = getAppointmentsForDate(day);

                    return (
                      <div key={dayIndex} className="flex-1 border-r border-cyan-200 last:border-r-0">
                        {/* Header del día */}
                        <div
                          className={`
                            h-16 p-3 text-center border-b border-cyan-200 font-medium cursor-pointer hover:bg-cyan-50 transition-colors
                            ${isToday(day) ? 'bg-cyan-100 text-slate-700' : 'text-slate-500'}
                          `}
                          onClick={() => setSelectedDate(day)}
                        >
                          <div className="text-xs">{dayNames[(day.getDay() + 6) % 7]}</div>
                          <div className={`text-lg ${isToday(day) ? 'text-slate-700 font-bold' : ''}`}>
                            {day.getDate()}
                          </div>
                        </div>

                        {/* Timeline del día */}
                        <div className="relative">
                          {timeSlots.map((time, timeIndex) => (
                            <div
                              key={time}
                              className="border-b border-cyan-100 hover:bg-cyan-50 cursor-pointer"
                              style={{ height: '65px' }}
                              onClick={() => {
                                handleNewAppointment(time, day);
                              }}
                            />
                          ))}

                          {/* Citas del día */}
                          {dayAppointments.map(appointment => renderAppointmentBlock(appointment, day, 'week'))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Vista por Día */}
              {viewMode === 'day' && (
                <div className="flex">
                  {/* Columna de horarios */}
                  <div className="w-24 border-r border-cyan-200">
                    {timeSlots.map(time => (
                      <div
                        key={time}
                        className="px-3 py-3 text-base text-slate-500 border-b border-cyan-200 flex items-center justify-center font-medium"
                        style={{ height: '72px' }}
                      >
                        {time}
                      </div>
                    ))}
                  </div>

                  {/* Columna del día */}
                  <div className="flex-1">
                    <div className="relative">
                      {timeSlots.map((time, timeIndex) => (
                        <div
                          key={time}
                          className="border-b border-cyan-200 hover:bg-cyan-50 cursor-pointer px-6 flex items-center"
                          style={{ height: '72px' }}
                          onClick={() => {
                            handleNewAppointment(time, currentDate);
                          }}
                        >
                          <div className="text-sm text-slate-500">Clic para agendar cita</div>
                        </div>
                      ))}

                      {/* Citas del día */}
                      {getAppointmentsForDate(currentDate).map(appointment => renderAppointmentBlock(appointment, currentDate, 'day'))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Panel lateral - Citas del día seleccionado */}
          <div className="bg-white rounded-xl shadow-lg border border-cyan-200">
            <div className="p-6 border-b border-cyan-200">
              <h3 className="text-xl font-bold text-slate-700 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-slate-700" />
                {(() => {
                  let displayDate: Date;
                  if (viewMode === 'day') {
                    displayDate = currentDate;
                    return 'Citas de Hoy';
                  } else if (selectedDate) {
                    displayDate = selectedDate;
                    return `Citas del ${selectedDate.toLocaleDateString('es-CL', {
                      day: 'numeric',
                      month: 'short'
                    })}`;
                  } else {
                    displayDate = new Date();
                    return `Citas del ${displayDate.toLocaleDateString('es-CL', {
                      day: 'numeric',
                      month: 'short'
                    })}`;
                  }
                })()}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {(() => {
                  if (viewMode === 'day') {
                    return currentDate.toLocaleDateString('es-CL', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    });
                  } else if (selectedDate) {
                    return selectedDate.toLocaleDateString('es-CL', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    });
                  } else {
                    return 'Clic en un día para ver sus citas';
                  }
                })()}
              </p>
            </div>
            <div className="p-6">
              {(() => {
                let selectedDayDate: Date;
                if (viewMode === 'day') {
                  selectedDayDate = currentDate;
                } else if (selectedDate) {
                  selectedDayDate = selectedDate;
                } else {
                  selectedDayDate = new Date();
                }

                const selectedDayAppointments = getAppointmentsForDate(selectedDayDate);

                return (
                  <div className="space-y-4">
                    {selectedDayAppointments.length > 0 ? (
                      <>
                        <>
                          {/* Lista de citas ordenadas por hora - Versión compacta */}
                          {selectedDayAppointments
                            .sort((a, b) => a.time.localeCompare(b.time))
                            .map(appointment => (
                              <div key={appointment.id} className="bg-slate-50 rounded-lg p-3 border-l-4 border-cyan-500 hover:shadow-sm transition-shadow mb-2">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center space-x-3">
                                    <span className="text-sm font-bold text-slate-700 min-w-[50px]">
                                      {appointment.time}
                                    </span>
                                    <span className="font-medium text-slate-700 text-sm">
                                      {appointment.patient}
                                    </span>
                                  </div>
                                  <span className={`
            px-2 py-0.5 rounded-full text-xs font-medium
            ${appointment.status === 'confirmed' ? 'bg-cyan-100 text-cyan-700' : 'bg-orange-100 text-orange-700'}
          `}>
                                    {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between text-xs text-slate-500">
                                  <div className="flex items-center space-x-4">
                                    <span className="truncate max-w-[120px]">{appointment.service}</span>
                                    <span className="flex items-center text-slate-500">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {appointment.duration}min
                                    </span>
                                  </div>
                                  <div className="flex space-x-1">
                                    <button
                                      className="text-slate-700 hover:text-slate-900 p-1 rounded hover:bg-cyan-100 transition-colors"
                                      title="Editar cita"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100 transition-colors"
                                      title="Cancelar cita"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}

                          {/* Botón para agregar nueva cita - más compacto */}
                          <button
                            onClick={() => openNewAppointmentModal(selectedDayDate)}
                            className="w-full mt-3 bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center text-sm shadow-sm"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Agregar nueva cita
                          </button>
                        </>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <CalendarIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-500 mb-4">No hay citas programadas para este día</p>
                        <button
                          onClick={() => openNewAppointmentModal(selectedDayDate)}
                          className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center mx-auto shadow-sm"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Programar primera cita
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Modal para ver/crear citas */}
        {showModal && selectedDate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-cyan-200">
                <h3 className="text-xl font-bold text-slate-700">
                  Citas para {selectedDate.toLocaleDateString('es-CL', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-6">
                {/* Horarios disponibles */}
                <div>
                  <h4 className="font-semibold text-slate-700 mb-3">Horarios disponibles</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map(time => {
                      const available = isTimeSlotAvailable(selectedDate, time);
                      const isOverlap = hasOverlap(selectedDate, time);

                      return (
                        <div key={time} className="text-center">
                          <div className="text-sm font-medium text-slate-700 mb-1">{time}</div>
                          <div className="space-y-1">
                            <button
                              onClick={() => handleNewAppointment(time, selectedDate)}
                              disabled={!available}
                              className={`
                                w-full px-3 py-2 text-sm rounded transition-colors
                                ${available
                                  ? isOverlap
                                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                                    : 'bg-cyan-500 text-white hover:bg-cyan-600'
                                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                }
                              `}
                            >
                              60min
                              {isOverlap && available && (
                                <div className="text-xs">Sobrecupo</div>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal para crear nueva cita - Versión Compacta */}
        {showNewAppointmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[95vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-cyan-200">
                <h3 className="text-lg font-bold text-slate-700">
                  {newAppointment.date
                    ? `${newAppointment.date.toLocaleDateString('es-CL', {
                      day: 'numeric',
                      month: 'short'
                    })}`
                    : 'Nueva Cita'
                  }
                </h3>
                <button
                  onClick={() => setShowNewAppointmentModal(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                {/* Paciente */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Paciente *
                  </label>
                  <input
                    type="text"
                    value={newAppointment.patient}
                    onChange={(e) => setNewAppointment({ ...newAppointment, patient: e.target.value })}
                    className="w-full p-2.5 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-slate-500 text-slate-700 text-sm"
                    placeholder="Nombre del paciente"
                  />
                </div>

                {/* Tratamiento */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tratamiento *
                  </label>
                  <select
                    value={newAppointment.service}
                    onChange={(e) => {
                      setNewAppointment({
                        ...newAppointment,
                        service: e.target.value
                      });
                    }}
                    className="w-full p-2.5 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700 text-sm"
                  >
                    <option value="">Seleccionar tratamiento</option>
                    {services.map(service => (
                      <option key={service.name} value={service.name}>
                        {service.name} - {service.price}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={newAppointment.description}
                    onChange={(e) => setNewAppointment({ ...newAppointment, description: e.target.value })}
                    className="w-full p-2.5 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent h-16 resize-none placeholder-slate-500 text-slate-700 text-sm"
                    placeholder="Detalles adicionales..."
                  />
                </div>

                {/* Horario */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Horario * (60 min)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border border-cyan-200 rounded-lg p-3">
                    {timeSlots.map(time => {
                      const available = newAppointment.date ?
                        isTimeSlotAvailable(newAppointment.date, time) : false;
                      const isOverlap = newAppointment.date ?
                        hasOverlap(newAppointment.date, time) : false;

                      return (
                        <button
                          key={time}
                          onClick={() => setNewAppointment({ ...newAppointment, time: time })}
                          disabled={!available}
                          className={`
                    p-2 text-xs rounded-md transition-colors border font-medium
                    ${newAppointment.time === time
                              ? 'bg-cyan-500 text-white border-cyan-500'
                              : available
                                ? isOverlap
                                  ? 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200'
                                  : 'bg-cyan-100 text-cyan-700 border-cyan-300 hover:bg-cyan-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                            }
                  `}
                        >
                          {time}
                          {isOverlap && available && (
                            <div className="text-[10px] leading-tight">Sobrecupo</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Azul: Disponible | Naranja: Sobrecupo | Gris: No disponible
                  </p>
                </div>

                {/* Botones */}
                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => setShowNewAppointmentModal(false)}
                    className="flex-1 px-3 py-2 text-sm text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateAppointment}
                    className="flex-1 px-3 py-2 text-sm bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors shadow-sm"
                  >
                    Crear Cita
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { Calendar };