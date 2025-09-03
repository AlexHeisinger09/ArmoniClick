// src/presentation/pages/patient/components/PatientAppointmentModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, FileText, Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import { Patient } from '@/core/use-cases/patients';
import { timeSlots } from '@/presentation/pages/calendar/constants/calendar';
import { isTimeSlotAvailable, hasOverlap } from '@/presentation/pages/calendar/utils/calendar';
import { AppointmentsData } from '@/presentation/pages/calendar/types/calendar';

interface PatientAppointmentForm {
  date: Date;
  time: string;
  service: string;
  description: string;
  duration: number;
}

interface PatientAppointmentModalProps {
  isOpen: boolean;
  patient: Patient;
  appointments: AppointmentsData;
  onClose: () => void;
  onSubmit: (appointmentData: PatientAppointmentForm) => void;
  isCreating?: boolean;
}

export const PatientAppointmentModal: React.FC<PatientAppointmentModalProps> = ({
  isOpen,
  patient,
  appointments,
  onClose,
  onSubmit,
  isCreating = false
}) => {
  // Estado del formulario específico para pacientes
  const [appointmentForm, setAppointmentForm] = useState<PatientAppointmentForm>({
    date: new Date(),
    time: '',
    service: '',
    description: '',
    duration: 60
  });

  // Estados para navegación de fecha
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Resetear formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setAppointmentForm({
        date: new Date(),
        time: '',
        service: '',
        description: '',
        duration: 60
      });
      setSelectedMonth(new Date());
    }
  }, [isOpen]);

  const handleFormChange = (updates: Partial<PatientAppointmentForm>) => {
    setAppointmentForm(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = () => {
    if (isCreating) return;
    onSubmit(appointmentForm);
  };

  const isFormValid = () => {
    return appointmentForm.date && appointmentForm.time && appointmentForm.service.trim();
  };

  // Generar días del mes para el selector
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white w-full h-[95vh] sm:h-auto sm:w-full sm:max-w-2xl sm:max-h-[85vh] sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Nueva Cita</h3>
              <p className="text-xs opacity-90 mt-0.5">
                Paciente: {patient.nombres} {patient.apellidos}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isCreating}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          
          {/* Selector de Fecha */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Seleccionar Fecha *
            </label>
            
            {/* Navegador de mes */}
            <div className="flex items-center justify-between mb-4 bg-slate-50 rounded-lg p-3">
              <button
                onClick={() => navigateMonth(-1)}
                disabled={isCreating}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <h3 className="text-lg font-semibold text-slate-800">
                {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
              </h3>
              
              <button
                onClick={() => navigateMonth(1)}
                disabled={isCreating}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Calendario */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              {/* Días de la semana */}
              <div className="grid grid-cols-7 bg-slate-50">
                {dayNames.map(day => (
                  <div key={day} className="p-2 text-center text-xs font-medium text-slate-600">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Días del mes */}
              <div className="grid grid-cols-7">
                {getDaysInMonth().map((day, index) => {
                  const isCurrentMonth = day.getMonth() === selectedMonth.getMonth();
                  const isSelected = isSelectedDate(day);
                  const isCurrentDay = isToday(day);
                  const isPast = isPastDate(day);
                  
                  return (
                    <button
                      key={index}
                      onClick={() => !isPast && !isCreating && handleFormChange({ date: day })}
                      disabled={isPast || isCreating}
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
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {appointmentForm.date && (
              <div className="mt-3 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                <p className="text-sm text-cyan-800 font-medium">
                  Fecha seleccionada: {appointmentForm.date.toLocaleDateString('es-CL', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Selector de Horario */}
          {appointmentForm.date && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Horario * (60 min)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {timeSlots.map(time => {
                  const available = isTimeSlotAvailable(appointments, appointmentForm.date, time);
                  const isOverlap = hasOverlap(appointments, appointmentForm.date, time);

                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => !isCreating && handleFormChange({ time })}
                      disabled={!available || isCreating}
                      className={`
                        p-2.5 text-sm rounded-lg transition-all border-2 font-medium relative disabled:cursor-not-allowed
                        ${appointmentForm.time === time
                          ? 'bg-cyan-500 text-white border-cyan-500 shadow-lg scale-105'
                          : available && !isCreating
                            ? isOverlap
                              ? 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                            : 'bg-slate-100 text-slate-400 border-slate-200 opacity-50'
                        }
                      `}
                    >
                      <div className="flex items-center justify-center">
                        <Clock className="w-4 h-4 mr-1.5" />
                        {time}
                      </div>
                      {isOverlap && available && (
                        <div className="text-xs font-semibold mt-1">Sobrecupo</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tratamiento */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tratamiento/Servicio *
            </label>
            <input
              type="text"
              value={appointmentForm.service}
              onChange={(e) => handleFormChange({ service: e.target.value })}
              disabled={isCreating}
              className="w-full p-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm disabled:opacity-50"
              placeholder="Ej: Limpieza dental, Control ortodóntico, Consulta general..."
            />
          </div>

          {/* Descripción/Notas */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notas o Descripción
            </label>
            <textarea
              value={appointmentForm.description}
              onChange={(e) => handleFormChange({ description: e.target.value })}
              disabled={isCreating}
              className="w-full p-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 h-20 resize-none transition-all text-sm disabled:opacity-50"
              placeholder="Motivo de la consulta, observaciones, instrucciones especiales..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-4 py-3 flex-shrink-0 bg-slate-50">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isCreating}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid() || isCreating}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center justify-center ${
                isFormValid() && !isCreating
                  ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isCreating ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Programar Cita
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};