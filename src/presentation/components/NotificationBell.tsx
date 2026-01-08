import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, X, Calendar, Clock, List } from 'lucide-react';
import { useAppointmentNotifications } from '@/presentation/hooks/notifications/useAppointmentNotifications';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface NotificationBellProps {
  isMinimized?: boolean;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ isMinimized = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    markAllAsRead,
    isMarkingAsRead,
    isLoading
  } = useAppointmentNotifications();

  // Cerrar panel al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOpenPanel = () => {
    setIsOpen(!isOpen);

    // Marcar como leídas cuando se abre el panel
    if (!isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_confirmed':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'appointment_cancelled':
        return <X className="w-5 h-5 text-red-600" />;
      default:
        return <Calendar className="w-5 h-5 text-cyan-600" />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'appointment_confirmed':
        return 'bg-green-50 border-green-200';
      case 'appointment_cancelled':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-cyan-50 border-cyan-200';
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    try {
      // Asegurar que la fecha se trata como UTC para evitar problemas de zona horaria
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return formatDistanceToNow(dateObj, { addSuffix: true, locale: es });
    } catch {
      return '';
    }
  };

  // Mostrar solo las últimas 5 notificaciones en el panel
  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="relative" ref={panelRef}>
      {/* Botón de notificaciones */}
      <button
        onClick={handleOpenPanel}
        className={`group relative text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-full transition-all duration-200 border border-transparent hover:border-cyan-200 shadow-sm hover:shadow-md flex-shrink-0 ${
          isMinimized ? 'p-1.5' : 'p-2 sm:p-3'
        }`}
        title="Notificaciones"
      >
        <Bell className={`group-hover:scale-110 transition-all duration-300 ${
          isMinimized ? 'w-4 h-4' : 'w-4 h-4 sm:w-5 sm:h-5'
        }`} />

        {/* Badge de notificaciones sin leer */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50 animate-in fade-in-0 zoom-in-95 duration-200 max-h-[500px] flex flex-col">
          {/* Header del panel */}
          <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-cyan-50 to-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-cyan-600" />
                <h3 className="font-semibold text-slate-800">Notificaciones</h3>
              </div>
              {unreadCount > 0 && (
                <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full font-medium">
                  {unreadCount} nuevas
                </span>
              )}
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
                <p className="mt-2 text-sm text-slate-500">Cargando notificaciones...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">No hay notificaciones</p>
                <p className="text-xs text-slate-400 mt-1">
                  Te notificaremos cuando un paciente confirme o cancele una cita
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer border-l-4 ${
                      getNotificationBgColor(notification.type)
                    } ${!notification.isRead ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icono */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0 ml-2 mt-1.5"></div>
                          )}
                        </div>

                        <p className="text-sm text-slate-600 mt-1">
                          {notification.message}
                        </p>

                        {/* Información adicional */}
                        {notification.appointmentDate && (
                          <div className="flex items-center space-x-1 mt-2 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(notification.appointmentDate).toLocaleDateString('es-CL', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        )}

                        {/* Tiempo transcurrido */}
                        <p className="text-xs text-slate-400 mt-1">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/dashboard/notificaciones');
                  }}
                  className="flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
                >
                  <List className="w-4 h-4" />
                  Ver todas ({notifications.length})
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAllAsRead();
                    }}
                    disabled={isMarkingAsRead}
                    className="text-xs text-slate-600 hover:text-slate-700 font-medium transition-colors disabled:opacity-50"
                  >
                    {isMarkingAsRead ? 'Marcando...' : 'Marcar leídas'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
