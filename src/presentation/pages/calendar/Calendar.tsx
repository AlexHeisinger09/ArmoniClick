import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, User, Calendar as CalendarIcon, Plus, X } from 'lucide-react';

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

// Cambiar el nombre del componente a Calendar para que coincida con el export
const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [appointments, setAppointments] = useState<AppointmentsData>({});
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  // Datos de ejemplo - esto vendría de tu backend
  const exampleAppointments: AppointmentsData = {
    '2025-06-09': [
      { id: 1, time: '09:00', duration: 60, patient: 'María García', service: 'Limpieza facial', status: 'confirmed' },
      { id: 2, time: '11:00', duration: 30, patient: 'Ana López', service: 'Depilación cejas', status: 'pending' },
      { id: 3, time: '14:30', duration: 60, patient: 'Carmen Silva', service: 'Tratamiento anti-edad', status: 'confirmed' }
    ],
    '2025-06-10': [
      { id: 4, time: '10:00', duration: 30, patient: 'Laura Martín', service: 'Manicura', status: 'confirmed' },
      { id: 5, time: '15:00', duration: 60, patient: 'Patricia Ruiz', service: 'Masaje facial', status: 'confirmed' }
    ],
    '2025-06-11': [
      { id: 6, time: '09:30', duration: 30, patient: 'Isabel Torres', service: 'Depilación', status: 'pending' },
      { id: 7, time: '13:00', duration: 60, patient: 'Sofía Mendoza', service: 'Tratamiento facial', status: 'confirmed' },
      { id: 8, time: '16:30', duration: 30, patient: 'Carla Vega', service: 'Depilación cejas', status: 'confirmed' }
    ],
    '2025-06-12': [
      { id: 9, time: '10:30', duration: 60, patient: 'Rosa Jiménez', service: 'Limpieza profunda', status: 'confirmed' },
      { id: 10, time: '14:00', duration: 30, patient: 'Elena Castro', service: 'Manicura', status: 'pending' }
    ],
    '2025-06-13': [
      { id: 11, time: '09:00', duration: 30, patient: 'Andrea Morales', service: 'Pedicura', status: 'confirmed' },
      { id: 12, time: '11:30', duration: 60, patient: 'Lucía Herrera', service: 'Masaje relajante', status: 'confirmed' }
    ]
  };

  // Horarios disponibles (9:00 AM a 6:00 PM)
  const timeSlots: string[] = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
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
    const startingDayOfWeek = firstDay.getDay();

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
    return date.toISOString().split('T')[0];
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

  const isTimeSlotAvailable = (date: Date, time: string, duration: number = 30): boolean => {
    const dateKey = formatDateKey(date);
    const dayAppointments = appointments[dateKey] || [];
    
    const [hours, minutes] = time.split(':').map(Number);
    const slotStart = hours * 60 + minutes;
    const slotEnd = slotStart + duration;
    
    return !dayAppointments.some(appointment => {
      const [appHours, appMinutes] = appointment.time.split(':').map(Number);
      const appStart = appHours * 60 + appMinutes;
      const appEnd = appStart + appointment.duration;
      
      return (slotStart < appEnd && slotEnd > appStart);
    });
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

  const handleNewAppointment = (timeSlot: string): void => {
    setSelectedTimeSlot(timeSlot);
    // Aquí abrirías un modal para crear nueva cita
    console.log('Nueva cita para:', selectedDate ? formatDateKey(selectedDate) : formatDateKey(currentDate), 'a las', timeSlot);
  };

  const getAppointmentsForDate = (date: Date): Appointment[] => {
    const dateKey = formatDateKey(date);
    return appointments[dateKey] || [];
  };

  const monthNames: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames: string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const today = new Date();
  const isToday = (date: Date): boolean => {
    return date.toDateString() === today.toDateString();
  };

  // Funciones para vista semanal
  const getWeekDays = (date: Date): Date[] => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
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

  // Función para renderizar cita en timeline
  const renderAppointmentBlock = (appointment: Appointment, date: Date): React.ReactElement  => {
    const [hours, minutes] = appointment.time.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const topPosition = ((startMinutes - 540) / 30) * 40; // 540 = 9:00 AM en minutos
    const height = (appointment.duration / 30) * 40;
    
    return (
      <div
        key={appointment.id}
        className={`
          absolute left-1 right-1 rounded-lg p-2 text-xs text-white shadow-md cursor-pointer
          ${appointment.status === 'confirmed' ? 'bg-purple-500 hover:bg-purple-600' : 'bg-yellow-500 hover:bg-yellow-600'}
        `}
        style={{
          top: `${topPosition}px`,
          height: `${height}px`,
          minHeight: '36px'
        }}
        onClick={() => console.log('Editar cita:', appointment)}
      >
        <div className="font-semibold truncate">{appointment.patient}</div>
        <div className="truncate opacity-90">{appointment.service}</div>
        <div className="text-xs opacity-75">{appointment.time} ({appointment.duration}min)</div>
      </div>
    );
  };

  return (
    <div className="h-full bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendario principal */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              {/* Header del calendario */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-bold text-gray-800">
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
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('day')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        viewMode === 'day' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Día
                    </button>
                    <button
                      onClick={() => setViewMode('week')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        viewMode === 'week' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Semana
                    </button>
                    <button
                      onClick={() => setViewMode('month')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        viewMode === 'month' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Mes
                    </button>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-purple-600" />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    Hoy
                  </button>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-purple-600" />
                  </button>
                </div>
              </div>

              {/* Vista por Mes */}
              {viewMode === 'month' && (
                <>
                  {/* Días de la semana */}
                  <div className="grid grid-cols-7 border-b border-gray-100">
                    {dayNames.map(day => (
                      <div key={day} className="p-4 text-center font-semibold text-gray-600 text-sm">
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
                            min-h-24 p-2 border-b border-r border-gray-100 cursor-pointer transition-colors
                            ${day.isCurrentMonth ? 'hover:bg-purple-50' : 'bg-gray-50 text-gray-400'}
                            ${isToday(day.date) ? 'bg-purple-100' : ''}
                          `}
                        >
                          <div className={`
                            text-sm font-medium mb-1
                            ${isToday(day.date) ? 'text-purple-700' : ''}
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
                                    ${appointment.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}
                                  `}
                                >
                                  {appointment.time} - {appointment.patient}
                                </div>
                              ))}
                              {dayAppointments.length > 2 && (
                                <div className="text-xs text-gray-500 text-center">
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
                  <div className="w-20 border-r border-gray-100">
                    <div className="h-12 border-b border-gray-100"></div>
                    {timeSlots.map(time => (
                      <div key={time} className="h-10 px-2 py-1 text-xs text-gray-500 border-b border-gray-50">
                        {time}
                      </div>
                    ))}
                  </div>
                  
                  {/* Columnas de días */}
                  {getWeekDays(currentDate).map((day, dayIndex) => {
                    const dayAppointments = getAppointmentsForDate(day);
                    
                    return (
                      <div key={dayIndex} className="flex-1 border-r border-gray-100 last:border-r-0">
                        {/* Header del día */}
                        <div className={`
                          h-12 p-2 text-center border-b border-gray-100 font-medium
                          ${isToday(day) ? 'bg-purple-100 text-purple-700' : 'text-gray-700'}
                        `}>
                          <div className="text-xs">{dayNames[day.getDay()]}</div>
                          <div className={`text-lg ${isToday(day) ? 'text-purple-700' : ''}`}>
                            {day.getDate()}
                          </div>
                        </div>
                        
                        {/* Timeline del día */}
                        <div className="relative">
                          {timeSlots.map((time, timeIndex) => (
                            <div
                              key={time}
                              className="h-10 border-b border-gray-50 hover:bg-purple-25 cursor-pointer"
                              onClick={() => {
                                setSelectedDate(day);
                                setSelectedTimeSlot(time);
                                handleNewAppointment(time);
                              }}
                            />
                          ))}
                          
                          {/* Citas del día */}
                          {dayAppointments.map(appointment => renderAppointmentBlock(appointment, day))}
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
                  <div className="w-20 border-r border-gray-100">
                    {timeSlots.map(time => (
                      <div key={time} className="h-16 px-2 py-2 text-sm text-gray-500 border-b border-gray-100">
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
                          className="h-16 border-b border-gray-100 hover:bg-purple-25 cursor-pointer px-4 flex items-center"
                          onClick={() => {
                            setSelectedDate(currentDate);
                            setSelectedTimeSlot(time);
                            handleNewAppointment(time);
                          }}
                        >
                          <div className="text-sm text-gray-400">Clic para agendar cita</div>
                        </div>
                      ))}
                      
                      {/* Citas del día */}
                      {getAppointmentsForDate(currentDate).map(appointment => {
                        const [hours, minutes] = appointment.time.split(':').map(Number);
                        const startMinutes = hours * 60 + minutes;
                        const topPosition = ((startMinutes - 540) / 30) * 32; // 540 = 9:00 AM en minutos
                        const height = (appointment.duration / 30) * 32;
                        
                        return (
                          <div
                            key={appointment.id}
                            className={`
                              absolute left-4 right-4 rounded-lg p-4 text-white shadow-lg cursor-pointer
                              ${appointment.status === 'confirmed' ? 'bg-purple-500 hover:bg-purple-600' : 'bg-yellow-500 hover:bg-yellow-600'}
                            `}
                            style={{
                              top: `${topPosition}px`,
                              height: `${height}px`,
                              minHeight: '60px'
                            }}
                            onClick={() => console.log('Editar cita:', appointment)}
                          >
                            <div className="font-bold text-lg">{appointment.patient}</div>
                            <div className="opacity-90">{appointment.service}</div>
                            <div className="text-sm opacity-75 mt-1">
                              {appointment.time} - {appointment.duration} minutos
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Panel lateral - Citas del día seleccionado */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-purple-600" />
                {viewMode === 'day' 
                  ? 'Citas de Hoy'
                  : `Citas del ${currentDate.toLocaleDateString('es-CL', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}`
                }
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {viewMode === 'day' && currentDate.toLocaleDateString('es-CL', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
                {viewMode !== 'day' && 'Clic en un día para ver sus citas'}
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
                        {/* Resumen del día */}
                        <div className="bg-purple-50 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-lg font-bold text-purple-700">
                                {selectedDayAppointments.length} cita{selectedDayAppointments.length !== 1 ? 's' : ''}
                              </span>
                              <div className="text-sm text-purple-600">
                                {selectedDayAppointments.filter(a => a.status === 'confirmed').length} confirmada{selectedDayAppointments.filter(a => a.status === 'confirmed').length !== 1 ? 's' : ''} · {' '}
                                {selectedDayAppointments.filter(a => a.status === 'pending').length} pendiente{selectedDayAppointments.filter(a => a.status === 'pending').length !== 1 ? 's' : ''}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-purple-600">Ingresos estimados</div>
                              <div className="font-bold text-purple-700">
                                ${selectedDayAppointments.length * 35000} {/* Promedio estimado */}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Lista de citas ordenadas por hora */}
                        {selectedDayAppointments
                          .sort((a, b) => a.time.localeCompare(b.time))
                          .map(appointment => (
                          <div key={appointment.id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-500 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-lg font-bold text-gray-800">
                                {appointment.time}
                              </span>
                              <span className={`
                                px-3 py-1 rounded-full text-xs font-medium
                                ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                              `}>
                                {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-700 mb-2">
                              <User className="w-4 h-4 mr-2" />
                              <span className="font-medium">{appointment.patient}</span>
                            </div>
                            <div className="text-gray-600 mb-2">
                              {appointment.service}
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                {appointment.duration} minutos
                              </span>
                              <div className="flex space-x-2">
                                <button className="text-purple-600 hover:text-purple-800 font-medium">
                                  Editar
                                </button>
                                <button className="text-red-500 hover:text-red-700 font-medium">
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Botón para agregar nueva cita */}
                        <button 
                          onClick={() => {
                            setSelectedDate(selectedDayDate);
                            setShowModal(true);
                          }}
                          className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar nueva cita
                        </button>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">No hay citas programadas para este día</p>
                        <button 
                          onClick={() => {
                            setSelectedDate(selectedDayDate);
                            setShowModal(true);
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center mx-auto"
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
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800">
                  Citas para {selectedDate.toLocaleDateString('es-CL', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6">
                {/* Citas existentes */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Citas programadas</h4>
                  {getAppointmentsForDate(selectedDate).length > 0 ? (
                    <div className="space-y-3">
                      {getAppointmentsForDate(selectedDate).map(appointment => (
                        <div key={appointment.id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-500">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-800">{appointment.time} - {appointment.patient}</div>
                              <div className="text-sm text-gray-600">{appointment.service} ({appointment.duration} min)</div>
                            </div>
                            <span className={`
                              px-3 py-1 rounded-full text-xs font-medium
                              ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                            `}>
                              {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No hay citas programadas para este día</p>
                  )}
                </div>

                {/* Horarios disponibles */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Horarios disponibles</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map(time => {
                      const available30 = isTimeSlotAvailable(selectedDate, time, 30);
                      const available60 = isTimeSlotAvailable(selectedDate, time, 60);
                      
                      return (
                        <div key={time} className="text-center">
                          <div className="text-sm font-medium text-gray-700 mb-1">{time}</div>
                          <div className="space-y-1">
                            <button
                              onClick={() => handleNewAppointment(time)}
                              disabled={!available30}
                              className={`
                                w-full px-2 py-1 text-xs rounded transition-colors
                                ${available30 
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }
                              `}
                            >
                              30min
                            </button>
                            <button
                              onClick={() => handleNewAppointment(time)}
                              disabled={!available60}
                              className={`
                                w-full px-2 py-1 text-xs rounded transition-colors
                                ${available60 
                                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }
                              `}
                            >
                              60min
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Servicios disponibles */}
                <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                  <h5 className="font-semibold text-purple-800 mb-2">Servicios disponibles</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {services.map(service => (
                      <div key={service.name} className="flex justify-between text-purple-700">
                        <span>{service.name} ({service.duration}min)</span>
                        <span className="font-medium">{service.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export  {Calendar};