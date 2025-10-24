// src/presentation/hooks/notifications/useNotification.ts
import { toast } from 'sonner';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  description?: string;
}

/**
 * Universal notification hook using Sonner
 * Provides a single interface for all notifications across the app
 */
export const useNotification = () => {
  const show = (
    message: string,
    type: NotificationType = 'info',
    options: NotificationOptions = {}
  ) => {
    const { duration = 4000, action, description } = options;

    const baseOptions = {
      description,
      duration,
      action,
    };

    switch (type) {
      case 'success':
        return toast.success(message, baseOptions);
      case 'error':
        return toast.error(message, baseOptions);
      case 'warning':
        return toast.warning(message, baseOptions);
      case 'info':
        return toast.info(message, baseOptions);
      default:
        return toast(message, baseOptions);
    }
  };

  const success = (message: string, options: NotificationOptions = {}) =>
    show(message, 'success', { duration: 3000, ...options });

  const error = (message: string, options: NotificationOptions = {}) =>
    show(message, 'error', { duration: 5000, ...options });

  const warning = (message: string, options: NotificationOptions = {}) =>
    show(message, 'warning', { duration: 4000, ...options });

  const info = (message: string, options: NotificationOptions = {}) =>
    show(message, 'info', { duration: 3000, ...options });

  // Specific appointment notifications (keep for backward compatibility)
  const notifyEmailSent = (type: 'confirmation' | 'reminder' | 'cancellation') => {
    const messages = {
      confirmation: {
        message: 'Confirmación de Cita Enviada',
        description: 'El paciente recibirá un email con los detalles de la cita.'
      },
      reminder: {
        message: 'Recordatorio Programado',
        description: 'Se enviará un recordatorio 24 horas antes de la cita.'
      },
      cancellation: {
        message: 'Cancelación Confirmada',
        description: 'El paciente ha sido notificado sobre la cancelación.'
      }
    };

    const msg = messages[type];
    success(msg.message, { description: msg.description, duration: 4000 });
  };

  const notifyEmailError = (error: string, type: 'confirmation' | 'reminder' | 'cancellation') => {
    const titles = {
      confirmation: 'Error al Enviar Confirmación',
      reminder: 'Error al Enviar Recordatorio',
      cancellation: 'Error al Enviar Cancelación'
    };

    toast.error(titles[type], {
      description: `No se pudo enviar el email: ${error}`,
      duration: 6000,
      action: {
        label: 'Reintentar',
        onClick: () => {}
      }
    });
  };

  const notifyAppointmentCreated = (patientName: string, hasEmail: boolean) => {
    if (hasEmail) {
      success('Cita Creada Exitosamente', {
        description: `Cita agendada para ${patientName}. Se ha enviado un email de confirmación.`,
        duration: 4000
      });
    } else {
      success('Cita Creada', {
        description: `Cita agendada para ${patientName}.`,
        duration: 3000
      });
    }
  };

  const notifyReminderInfo = () => {
    info('Recordatorio Automático', {
      description: 'El paciente recibirá un recordatorio por email 24 horas antes de la cita.',
      duration: 3000
    });
  };

  const notifyEmailConfirmation = (action: 'confirmed' | 'cancelled', patientName: string) => {
    if (action === 'confirmed') {
      success('Cita Confirmada por Email', {
        description: `${patientName} confirmó su asistencia.`,
        duration: 4000
      });
    } else {
      warning('Cita Cancelada por Email', {
        description: `${patientName} canceló la cita.`,
        duration: 4000
      });
    }
  };

  const showEmailStats = (stats: { sent: number; failed: number; total: number }) => {
    if (stats.failed > 0) {
      warning(`Emails Enviados: ${stats.sent}/${stats.total}`, {
        description: `${stats.failed} emails fallaron. Revisa la configuración.`,
        duration: 5000
      });
    } else if (stats.sent > 0) {
      success(`${stats.sent} Emails Enviados`, {
        description: 'Todas las notificaciones fueron enviadas exitosamente.',
        duration: 3000
      });
    }
  };

  return {
    show,
    success,
    error,
    warning,
    info,
    // Backward compatibility
    notifyEmailSent,
    notifyEmailError,
    notifyAppointmentCreated,
    notifyReminderInfo,
    notifyEmailConfirmation,
    showEmailStats
  };
};
