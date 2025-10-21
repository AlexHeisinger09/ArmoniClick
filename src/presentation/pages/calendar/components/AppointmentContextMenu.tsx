import React, { useState, useEffect, useRef } from 'react';
import { 
  Play,
  CheckCircle,
  Users,
  Check,
  ExternalLink,
  Edit,
  X,
  ChevronRight,
  Clock,
  Calendar,
  Phone,
  Mail,
  User
} from 'lucide-react';
import { CalendarAppointment, AppointmentStatus } from '../types/calendar';

// Tipos
interface Appointment {
  id: string;
  title: string;
  time: string;
  duration: number;
  patient: string;
  service: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'no-show' | 'completed';
  type?: string;
  notes?: string;
  email?: string;
  phone?: string;
  patientId?: number;
  start?: Date;
  end?: Date;
  patientName?: string;
  guestName?: string;
}

interface AppointmentContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: CalendarAppointment | null;
  position: { x: number; y: number };
  onUpdateStatus: (appointmentId: string, status: string, reason?: string) => Promise<void>;
  onNavigateToPatient?: (patientId: number) => void;
  onEditAppointment?: (appointment: CalendarAppointment) => void;
}

// Opciones del menú con sus estados
const STATUS_OPTIONS = [
  {
    id: 'start',
    label: 'Iniciar Consulta',
    icon: Play,
    color: 'text-blue-600',
    bgColor: 'hover:bg-blue-50',
    status: 'in-progress',
    iconBg: 'bg-blue-100'
  },
  {
    id: 'confirmed',
    label: 'Paciente Confirmado',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'hover:bg-green-50',
    status: 'confirmed',
    iconBg: 'bg-green-100'
  },
  {
    id: 'arrived',
    label: 'Paciente Llegó',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'hover:bg-purple-50',
    status: 'arrived',
    iconBg: 'bg-purple-100'
  },
  {
    id: 'complete',
    label: 'Completar Consulta',
    icon: Check,
    color: 'text-emerald-600',
    bgColor: 'hover:bg-emerald-50',
    status: 'completed',
    iconBg: 'bg-emerald-100'
  }
];

export const AppointmentContextMenu: React.FC<AppointmentContextMenuProps> = ({
  isOpen,
  onClose,
  appointment,
  position,
  onUpdateStatus,
  onNavigateToPatient,
  onEditAppointment
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Cerrar el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
        setShowCancelConfirm(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Ajustar posición del menú para no salirse de la pantalla
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const menu = menuRef.current;
      const menuRect = menu.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let adjustedX = position.x;
      let adjustedY = position.y;

      // Ajustar horizontalmente
      if (position.x + menuRect.width > windowWidth - 20) {
        adjustedX = position.x - menuRect.width;
      }

      // Ajustar verticalmente
      if (position.y + menuRect.height > windowHeight - 20) {
        adjustedY = position.y - menuRect.height;
      }

      menu.style.left = `${adjustedX}px`;
      menu.style.top = `${adjustedY}px`;
    }
  }, [isOpen, position]);

  if (!isOpen || !appointment) return null;

  const handleStatusClick = async (status: string) => {
    try {
      setIsUpdating(true);
      await onUpdateStatus(appointment.id, status);
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = async () => {
    try {
      setIsUpdating(true);
      await onUpdateStatus(appointment.id, 'cancelled', 'Cancelada por el doctor');
      onClose();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    } finally {
      setIsUpdating(false);
      setShowCancelConfirm(false);
    }
  };

  const handleViewProfile = () => {
    if (appointment.patientId && onNavigateToPatient) {
      onNavigateToPatient(appointment.patientId);
      onClose();
    }
  };

  const handleEdit = () => {
    if (onEditAppointment) {
      onEditAppointment(appointment);
      onClose();
    }
  };

  const formatTime = (date: Date | undefined) => {
    if (!date) return appointment.time;
    return date.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Overlay transparente */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* Menú contextual */}
      <div
        ref={menuRef}
        className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        style={{
          left: position.x,
          top: position.y,
          minWidth: '320px'
        }}
      >
        {/* Header con información de la cita */}
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">
                {appointment.patient || appointment.guestName || 'Paciente'}
              </h3>
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTime(appointment.start)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{appointment.duration} min</span>
                </div>
              </div>
              {appointment.phone && (
                <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{appointment.phone}</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Opciones del menú */}
        <div className="py-2">
          {!showCancelConfirm ? (
            <>
              {/* Opciones de estado */}
              {STATUS_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isActive = appointment.status === option.status;
                
                return (
                  <button
                    key={option.id}
                    onClick={() => handleStatusClick(option.status)}
                    disabled={isUpdating || isActive}
                    className={`
                      w-full px-4 py-3 flex items-center gap-3 transition-all
                      ${option.bgColor} ${isActive ? 'bg-gray-50' : 'hover:bg-gray-50'}
                      ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center
                      ${isActive ? 'bg-gray-200' : option.iconBg}
                    `}>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-gray-500' : option.color}`} />
                    </div>
                    <span className={`text-sm font-medium ${isActive ? 'text-gray-400' : 'text-gray-700'}`}>
                      {option.label}
                    </span>
                    {isActive && (
                      <div className="ml-auto">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      </div>
                    )}
                  </button>
                );
              })}

              {/* Separador */}
              <div className="h-px bg-gray-100 my-2 mx-4" />

              {/* Ver perfil del paciente */}
              {appointment.patientId && (
                <button
                  onClick={handleViewProfile}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <ExternalLink className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Ver Perfil del Paciente</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                </button>
              )}

              {/* Editar cita */}
              <button
                onClick={handleEdit}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Edit className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Editar</span>
              </button>

              {/* Cancelar cita */}
              <button
                onClick={handleCancelClick}
                disabled={isUpdating || appointment.status === 'cancelled'}
                className={`
                  w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 transition-all
                  ${appointment.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <X className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-sm font-medium text-red-600">Cancelar</span>
              </button>
            </>
          ) : (
            /* Confirmación de cancelación */
            <div className="px-4 py-3">
              <p className="text-sm text-gray-700 mb-4">
                ¿Estás seguro de que deseas cancelar esta cita?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  No
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={isUpdating}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isUpdating ? 'Cancelando...' : 'Sí, cancelar'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Estado actual */}
        {!showCancelConfirm && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Estado actual:</span>
              <span className={`
                px-2 py-1 rounded-full font-medium
                ${appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' : ''}
                ${appointment.status === 'completed' ? 'bg-blue-100 text-blue-700' : ''}
                ${appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
                ${appointment.status === 'no-show' ? 'bg-orange-100 text-orange-700' : ''}
              `}>
                {appointment.status === 'pending' && 'Pendiente'}
                {appointment.status === 'confirmed' && 'Confirmada'}
                {appointment.status === 'completed' && 'Completada'}
                {appointment.status === 'cancelled' && 'Cancelada'}
                {appointment.status === 'no-show' && 'No asistió'}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};