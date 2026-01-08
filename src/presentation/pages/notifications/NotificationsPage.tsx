import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Check, X, Calendar, Trash2, CheckCheck } from 'lucide-react';
import { useAppointmentNotifications } from '@/presentation/hooks/notifications/useAppointmentNotifications';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAllAsRead, isMarkingAsRead, isLoading } = useAppointmentNotifications();

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

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'appointment_confirmed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Confirmada</span>;
      case 'appointment_cancelled':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">Cancelada</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-cyan-100 text-cyan-700">Otro</span>;
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, "dd 'de' MMMM yyyy, HH:mm", { locale: es });
    } catch {
      return '-';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/20 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-cyan-600 transition-colors mb-4 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Volver</span>
          </button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-100 rounded-xl">
                <Bell className="w-7 h-7 text-cyan-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                  Notificaciones
                </h1>
                <p className="text-slate-600 mt-1">
                  Historial de confirmaciones y cancelaciones de citas
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                disabled={isMarkingAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCheck className="w-4 h-4" />
                {isMarkingAsRead ? 'Marcando...' : `Marcar todas como leídas (${unreadCount})`}
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mb-4"></div>
              <p className="text-slate-600">Cargando notificaciones...</p>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <Bell className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No hay notificaciones</h3>
            <p className="text-slate-600">
              Te notificaremos cuando un paciente confirme o cancele una cita
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Paciente
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Mensaje
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Fecha de Cita
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Notificado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {notifications.map((notification) => (
                    <tr
                      key={notification.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        !notification.isRead ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getNotificationIcon(notification.type)}
                          {getNotificationBadge(notification.type)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">
                          {notification.patientName || 'Sin nombre'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600 max-w-md">
                          {notification.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">
                          {notification.appointmentDate
                            ? format(new Date(notification.appointmentDate), "dd/MM/yyyy HH:mm", { locale: es })
                            : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">
                          {formatDate(notification.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {!notification.isRead && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-cyan-100 text-cyan-700">
                            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                            Nueva
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getNotificationIcon(notification.type)}
                      {getNotificationBadge(notification.type)}
                    </div>
                    {!notification.isRead && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-cyan-100 text-cyan-700">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                        Nueva
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-slate-500">Paciente:</span>
                      <p className="font-medium text-slate-800">
                        {notification.patientName || 'Sin nombre'}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-slate-500">Mensaje:</span>
                      <p className="text-sm text-slate-600">{notification.message}</p>
                    </div>

                    {notification.appointmentDate && (
                      <div>
                        <span className="text-xs font-medium text-slate-500">Fecha de cita:</span>
                        <p className="text-sm text-slate-600">
                          {format(new Date(notification.appointmentDate), "dd/MM/yyyy HH:mm", { locale: es })}
                        </p>
                      </div>
                    )}

                    <div>
                      <span className="text-xs font-medium text-slate-500">Notificado:</span>
                      <p className="text-sm text-slate-600">{formatDate(notification.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                Mostrando <span className="font-semibold">{notifications.length}</span> notificaciones
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
