import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle,
  Clock,
  XCircle,
  UserX,
  Edit,
  X,
  ChevronRight,
  AlertCircle,
  User
} from 'lucide-react';

// Tipos
interface CalendarAppointment {
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
  patientId?: number | null;
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
  onDeleteAppointment?: (appointmentId: string) => Promise<void>;
}

// Estados disponibles (sin "completed")
const STATUS_OPTIONS = [
  {
    id: 'confirmed',
    label: 'Confirmar',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'hover:bg-green-50',
    status: 'confirmed',
    iconBg: 'bg-green-100'
  },
  {
    id: 'no-show',
    label: 'No asistió',
    icon: UserX,
    color: 'text-orange-600',
    bgColor: 'hover:bg-orange-50',
    status: 'no-show',
    iconBg: 'bg-orange-100'
  },
  {
    id: 'pending',
    label: 'Pendiente',
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'hover:bg-blue-50',
    status: 'pending',
    iconBg: 'bg-blue-100'
  }
];

const STATUS_LABELS = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  'no-show': 'No asistió',
  completed: 'Completada'
};

const STATUS_STYLES = {
  pending: { bg: 'bg-blue-100', text: 'text-blue-700' },
  confirmed: { bg: 'bg-green-100', text: 'text-green-700' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
  'no-show': { bg: 'bg-orange-100', text: 'text-orange-700' },
  completed: { bg: 'bg-emerald-100', text: 'text-emerald-700' }
};

export const AppointmentContextMenu: React.FC<AppointmentContextMenuProps> = ({
  isOpen,
  onClose,
  appointment,
  position,
  onUpdateStatus,
  onNavigateToPatient,
  onEditAppointment,
  onDeleteAppointment
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState(position);

  // Cerrar menú al hacer clic fuera o al hacer scroll
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleScroll = () => {
      onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, onClose]);

  // Ajustar posición del menú para que no se salga de la pantalla
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const menu = menuRef.current;
      const menuRect = menu.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      let adjustedX = position.x;
      let adjustedY = position.y;

      // Ajustar horizontalmente
      if (position.x + menuRect.width > windowWidth - 10) {
        adjustedX = Math.max(10, position.x - menuRect.width);
      }

      // Ajustar verticalmente
      if (position.y + menuRect.height > windowHeight - 10) {
        adjustedY = Math.max(10, position.y - menuRect.height);
      }

      setMenuPosition({ x: adjustedX, y: adjustedY });
    }
  }, [isOpen, position]);

  if (!isOpen || !appointment) return null;

  const handleStatusClick = async (status: string) => {
    console.log('🔄 Updating status to:', status, 'for appointment:', appointment.id);
    
    try {
      setIsUpdating(true);
      setUpdateError(null);
      await onUpdateStatus(appointment.id, status);
      console.log('✅ Status updated successfully');
      onClose();
    } catch (error: any) {
      console.error('❌ Error updating status:', error);
      setUpdateError(error.message || 'Error al actualizar');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmCancel = async () => {
    try {
      setIsUpdating(true);
      setUpdateError(null);
      await onUpdateStatus(appointment.id, 'cancelled', 'Cancelada por el doctor');
      onClose();
    } catch (error: any) {
      console.error('❌ Error cancelling:', error);
      setUpdateError(error.message || 'Error al cancelar');
    } finally {
      setIsUpdating(false);
      setShowCancelConfirm(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setIsUpdating(true);
      setUpdateError(null);
      if (onDeleteAppointment) {
        await onDeleteAppointment(appointment.id);
      }
      onClose();
    } catch (error: any) {
      console.error('❌ Error deleting:', error);
      setUpdateError(error.message || 'Error al eliminar');
    } finally {
      setIsUpdating(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleViewProfile = () => {
    if (appointment.patientId && onNavigateToPatient) {
      console.log('🔗 Navigating to patient:', appointment.patientId);
      onNavigateToPatient(appointment.patientId);
      onClose();
    }
  };

  // ✅ Verificar si es paciente registrado
  const isRegisteredPatient = appointment.patientId != null && appointment.patientId > 0;
  
  console.log('🔍 Patient check:', {
    patientId: appointment.patientId,
    isRegisteredPatient,
    patientName: appointment.patientName,
    guestName: appointment.guestName
  });

  const currentStatusStyle = STATUS_STYLES[appointment.status] || STATUS_STYLES.pending;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* Menú contextual compacto */}
      <div
        ref={menuRef}
        className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden w-[200px] sm:w-[240px]"
        style={{
          left: `${menuPosition.x}px`,
          top: `${menuPosition.y}px`,
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Header compacto */}
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 px-2 py-1.5 sm:px-3 sm:py-2 border-b border-gray-200">
          <div className="flex items-start justify-between gap-1.5 sm:gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                {appointment.patient || appointment.guestName || 'Paciente'}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-600 truncate">{appointment.service}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{appointment.time}</p>
            </div>
            <button
              onClick={onClose}
              className="p-0.5 sm:p-1 hover:bg-white/50 rounded transition-colors flex-shrink-0"
            >
              <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Error */}
        {updateError && (
          <div className="mx-1.5 mt-1.5 p-1.5 sm:mx-2 sm:mt-2 sm:p-2 bg-red-50 border border-red-200 rounded flex items-start gap-1 sm:gap-1.5">
            <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] sm:text-xs text-red-600">{updateError}</p>
          </div>
        )}

        {/* Opciones */}
        <div className="py-1">
          {!showCancelConfirm && !showDeleteConfirm ? (
            <>
              {/* ✅ Ver perfil - SOLO si patientId existe y es > 0 */}
              {isRegisteredPatient && (
                <button
                  onClick={handleViewProfile}
                  disabled={isUpdating}
                  className="w-full px-2 py-1.5 sm:px-3 sm:py-2 flex items-center gap-1.5 sm:gap-2 hover:bg-cyan-50 transition-all disabled:opacity-50 text-left"
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-600" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-medium text-gray-700 flex-1">Ver Perfil</span>
                  <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 flex-shrink-0" />
                </button>
              )}

              {/* Separador si hay perfil */}
              {isRegisteredPatient && <div className="h-px bg-gray-100 my-1" />}

              {/* Estados */}
              {STATUS_OPTIONS.map((option) => {
                const Icon = option.icon;
                if (appointment.status === option.status) return null;
                
                return (
                  <button
                    key={option.id}
                    onClick={() => handleStatusClick(option.status)}
                    disabled={isUpdating}
                    className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 flex items-center gap-1.5 sm:gap-2 transition-all disabled:opacity-50 text-left ${option.bgColor}`}
                  >
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${option.iconBg}`}>
                      <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${option.color}`} />
                    </div>
                    <span className="text-[11px] sm:text-xs font-medium text-gray-700">{option.label}</span>
                  </button>
                );
              })}

              <div className="h-px bg-gray-100 my-1" />

              {/* Editar */}
              <button
                onClick={() => {
                  if (onEditAppointment) onEditAppointment(appointment);
                  onClose();
                }}
                disabled={isUpdating}
                className="w-full px-2 py-1.5 sm:px-3 sm:py-2 flex items-center gap-1.5 sm:gap-2 hover:bg-gray-50 transition-all disabled:opacity-50 text-left"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-600" />
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-gray-700">Editar</span>
              </button>

              {/* Cancelar */}
              {appointment.status !== 'cancelled' && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={isUpdating}
                  className="w-full px-2 py-1.5 sm:px-3 sm:py-2 flex items-center gap-1.5 sm:gap-2 hover:bg-red-50 transition-all disabled:opacity-50 text-left"
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                    <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-600" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-medium text-red-600">Cancelar</span>
                </button>
              )}

              {/* Eliminar */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isUpdating}
                className="w-full px-2 py-1.5 sm:px-3 sm:py-2 flex items-center gap-1.5 sm:gap-2 hover:bg-red-50 transition-all disabled:opacity-50 text-left"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-600" />
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-red-600">Eliminar</span>
              </button>
            </>
          ) : showCancelConfirm ? (
            /* Confirmación de cancelar */
            <div className="px-2 py-1.5 sm:px-3 sm:py-2">
              <div className="mb-2 sm:mb-3">
                <p className="text-[11px] sm:text-xs font-semibold text-gray-900 mb-0.5 sm:mb-1">¿Cancelar cita?</p>
                <p className="text-[10px] sm:text-xs text-gray-600">No se puede deshacer</p>
              </div>
              <div className="flex gap-1.5 sm:gap-2">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={isUpdating}
                  className="flex-1 px-2 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
                >
                  No
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={isUpdating}
                  className="flex-1 px-2 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded transition-colors disabled:opacity-50"
                >
                  {isUpdating ? '...' : 'Sí'}
                </button>
              </div>
            </div>
          ) : (
            /* Confirmación de eliminar */
            <div className="px-2 py-1.5 sm:px-3 sm:py-2">
              <div className="mb-2 sm:mb-3">
                <p className="text-[11px] sm:text-xs font-semibold text-gray-900 mb-0.5 sm:mb-1">¿Eliminar cita?</p>
                <p className="text-[10px] sm:text-xs text-gray-600">Esta acción no se puede deshacer</p>
              </div>
              <div className="flex gap-1.5 sm:gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isUpdating}
                  className="flex-1 px-2 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
                >
                  No
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isUpdating}
                  className="flex-1 px-2 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors disabled:opacity-50"
                >
                  {isUpdating ? '...' : 'Eliminar'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Estado actual */}
        {!showCancelConfirm && !showDeleteConfirm && (
          <div className="px-2 py-1.5 sm:px-3 sm:py-2 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs text-gray-500">Estado:</span>
              <span className={`px-1.5 py-0.5 sm:px-2 rounded-full text-[10px] sm:text-xs font-semibold ${currentStatusStyle.bg} ${currentStatusStyle.text}`}>
                {STATUS_LABELS[appointment.status]}
              </span>
            </div>
          </div>
        )}

        {/* Loading */}
        {isUpdating && (
          <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-xl">
            <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </>
  );
};