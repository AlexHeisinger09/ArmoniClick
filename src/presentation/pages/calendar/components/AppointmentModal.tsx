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
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md sm:max-w-2xl">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-white">
                    Citas para {selectedDate.toLocaleDateString('es-CL', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 sm:p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors flex-shrink-0 ml-2"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
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
      </div>
    </>
  );
};