// src/presentation/hooks/notifications/useNotifications.ts
import { useState } from 'react';
import { toast } from 'sonner';

interface NotificationState {
  emailSent: boolean;
  emailError: string | null;
  isProcessing: boolean;
}

export const useNotifications = () => {
  const [state, setState] = useState<NotificationState>({
    emailSent: false,
    emailError: null,
    isProcessing: false
  });

  // 📧 Mostrar notificación cuando se envía email de confirmación
  const notifyEmailSent = (type: 'confirmation' | 'reminder' | 'cancellation') => {
    const messages = {
      confirmation: {
        title: '📧 Email de Confirmación Enviado',
        description: 'El paciente recibirá un email con los detalles de la cita y botones para confirmar o cancelar.'
      },
      reminder: {
        title: '🔔 Recordatorio Programado',
        description: 'Se enviará un recordatorio automático 24 horas antes de la cita.'
      },
      cancellation: {
        title: '❌ Cancelación Confirmada',
        description: 'El paciente ha sido notificado sobre la cancelación de la cita.'
      }
    };

    const message = messages[type];
    
    toast.success(message.title, {
      description: message.description,
      duration: 4000,
      action: {
        label: 'Entendido',
        onClick: () => {}
      }
    });

    setState(prev => ({
      ...prev,
      emailSent: true,
      emailError: null
    }));
  };

  // ❌ Mostrar error de email
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
        onClick: () => {
          // TODO: Implementar reintento
        }
      }
    });

    setState(prev => ({
      ...prev,
      emailSent: false,
      emailError: error
    }));
  };

  // 🎯 Mostrar notificación completa de creación de cita
  const notifyAppointmentCreated = (patientName: string, hasEmail: boolean) => {
    if (hasEmail) {
      toast.success('🎉 Cita Creada Exitosamente', {
        description: `Cita agendada para ${patientName}. Se ha enviado un email de confirmación.`,
        duration: 4000,
        action: {
          label: '📧 Ver Email',
          onClick: () => {
            toast.info('📱 Revisa la bandeja de entrada', {
              description: 'El email puede tardar unos minutos en llegar. Revisa también la carpeta de spam.'
            });
          }
        }
      });
    } else {
      toast.success('🎉 Cita Creada', {
        description: `Cita agendada para ${patientName}. No se proporcionó email para notificaciones.`,
        duration: 3000
      });
    }

    setState(prev => ({
      ...prev,
      emailSent: hasEmail,
      emailError: null
    }));
  };

  // 🔔 Mostrar información sobre recordatorios automáticos
  const notifyReminderInfo = () => {
    toast.info('🔔 Recordatorio Automático', {
      description: 'El paciente recibirá un recordatorio por email 24 horas antes de la cita.',
      duration: 3000
    });
  };

  // ✅ Mostrar confirmación desde email
  const notifyEmailConfirmation = (action: 'confirmed' | 'cancelled', patientName: string) => {
    const messages = {
      confirmed: {
        title: '✅ Cita Confirmada por Email',
        description: `${patientName} confirmó su asistencia desde el email.`,
        icon: '✅'
      },
      cancelled: {
        title: '❌ Cita Cancelada por Email', 
        description: `${patientName} canceló la cita desde el email.`,
        icon: '❌'
      }
    };

    const message = messages[action];
    
    if (action === 'confirmed') {
      toast.success(message.title, {
        description: message.description,
        duration: 4000
      });
    } else {
      toast.warning(message.title, {
        description: message.description,
        duration: 4000
      });
    }
  };

  // 🚀 Función helper para mostrar estadísticas de emails
  const showEmailStats = (stats: {
    sent: number;
    failed: number;
    total: number;
  }) => {
    if (stats.failed > 0) {
      toast.warning(`📊 Emails Enviados: ${stats.sent}/${stats.total}`, {
        description: `${stats.failed} emails fallaron. Revisa la configuración de email.`,
        duration: 5000
      });
    } else if (stats.sent > 0) {
      toast.success(`📧 ${stats.sent} Emails Enviados`, {
        description: 'Todas las notificaciones fueron enviadas exitosamente.',
        duration: 3000
      });
    }
  };

  return {
    // Estado
    ...state,
    
    // Funciones de notificación
    notifyEmailSent,
    notifyEmailError,
    notifyAppointmentCreated,
    notifyReminderInfo,
    notifyEmailConfirmation,
    showEmailStats,

    // Funciones de control
    clearEmailState: () => setState({
      emailSent: false,
      emailError: null,
      isProcessing: false
    }),
    
    setProcessing: (processing: boolean) => setState(prev => ({
      ...prev,
      isProcessing: processing
    }))
  };
};