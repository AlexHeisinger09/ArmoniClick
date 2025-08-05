// components/AppointmentModal.tsx
import React from 'react';
import { X } from 'lucide-react';
import { AppointmentsData } from '../types/calendar';
import { timeSlots } from '../constants/calendar';
import { isTimeSlotAvailable, hasOverlap } from '../utils/calendar';

interface AppointmentModalProps {
  selectedDate: Date;
  appointments: AppointmentsData;
  onClose: () => void;
  onNewAppointment: (time: string, date: Date) => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  selectedDate,
  appointments,
  onClose,
  onNewAppointment
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl w-full max-w-xs sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-cyan-200">
          <h3 className="text-base sm:text-xl font-bold text-slate-700">
            Citas para {selectedDate.toLocaleDateString('es-CL', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <div>
            <h4 className="font-semibold text-slate-700 mb-3 text-sm sm:text-base">Horarios disponibles</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {timeSlots.map(time => {
                const available = isTimeSlotAvailable(appointments, selectedDate, time);
                const isOverlap = hasOverlap(appointments, selectedDate, time);

                return (
                  <div key={time} className="text-center">
                    <div className="text-xs sm:text-sm font-medium text-slate-700 mb-1">{time}</div>
                    <div className="space-y-1">
                      <button
                        onClick={() => onNewAppointment(time, selectedDate)}
                        disabled={!available}
                        className={`
                          w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded transition-colors
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
  );
};