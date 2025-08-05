// components/NewAppointmentModal.tsx
import React from 'react';
import { X } from 'lucide-react';
import { NewAppointmentForm, AppointmentsData } from '../types/calendar';
import { timeSlots, services } from '../constants/calendar';
import { isTimeSlotAvailable, hasOverlap } from '../utils/calendar';

interface NewAppointmentModalProps {
  isOpen: boolean;
  newAppointment: NewAppointmentForm;
  appointments: AppointmentsData;
  onClose: () => void;
  onChange: (appointment: NewAppointmentForm) => void;
  onSubmit: () => void;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  newAppointment,
  appointments,
  onClose,
  onChange,
  onSubmit
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl w-full max-w-sm sm:max-w-lg max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-cyan-200">
          <h3 className="text-base sm:text-lg font-bold text-slate-700">
            {newAppointment.date
              ? `${newAppointment.date.toLocaleDateString('es-CL', {
                day: 'numeric',
                month: 'short'
              })}`
              : 'Nueva Cita'
            }
          </h3>
          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-3 sm:p-4 space-y-3">
          {/* Paciente */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
              Paciente *
            </label>
            <input
              type="text"
              value={newAppointment.patient}
              onChange={(e) => onChange({ ...newAppointment, patient: e.target.value })}
              className="w-full p-2 sm:p-2.5 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-slate-500 text-slate-700 text-sm"
              placeholder="Nombre del paciente"
            />
          </div>

          {/* Tratamiento */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
              Tratamiento *
            </label>
            <select
              value={newAppointment.service}
              onChange={(e) => onChange({ ...newAppointment, service: e.target.value })}
              className="w-full p-2 sm:p-2.5 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700 text-sm"
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
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
              Descripción
            </label>
            <textarea
              value={newAppointment.description}
              onChange={(e) => onChange({ ...newAppointment, description: e.target.value })}
              className="w-full p-2 sm:p-2.5 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent h-12 sm:h-16 resize-none placeholder-slate-500 text-slate-700 text-sm"
              placeholder="Detalles adicionales..."
            />
          </div>

          {/* Horario */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
              Horario * (60 min)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-1.5 sm:gap-2 border border-cyan-200 rounded-lg p-2 sm:p-3">
              {timeSlots.map(time => {
                const available = newAppointment.date ?
                  isTimeSlotAvailable(appointments, newAppointment.date, time) : false;
                const isOverlap = newAppointment.date ?
                  hasOverlap(appointments, newAppointment.date, time) : false;

                return (
                  <button
                    key={time}
                    onClick={() => onChange({ ...newAppointment, time })}
                    disabled={!available}
                    className={`
                      p-1.5 sm:p-2 text-xs rounded-md transition-colors border font-medium
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
              onClick={onClose}
              className="flex-1 px-3 py-2 text-xs sm:text-sm text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onSubmit}
              className="flex-1 px-3 py-2 text-xs sm:text-sm bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors shadow-sm"
            >
              Crear Cita
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};