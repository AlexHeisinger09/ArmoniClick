// src/presentation/pages/appointment/CancelAppointment.tsx - SIMPLIFICADO COMO CONFIRM
import React, { useState, useEffect } from 'react';
import { XCircle, CheckCircle, Clock, Calendar, User, AlertTriangle, Loader2 } from 'lucide-react';

interface AppointmentData {
  id: number;
  title: string;
  appointmentDate: string;
  status: string;
  cancellationReason?: string;
}

interface ApiResponse {
  message: string;
  appointment?: AppointmentData;
}

const CancelAppointment: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  // Obtener token desde URL
  const getTokenFromUrl = () => {
    const path = window.location.pathname;
    const pathParts = path.split('/');
    const cancelIndex = pathParts.findIndex(part => part === 'cancel-appointment');
    return pathParts[cancelIndex + 1] || null;
  };

  useEffect(() => {
    const token = getTokenFromUrl();
    if (token) {
      // No cancelamos automáticamente, mostramos la confirmación primero
      setLoading(false);
    } else {
      setError('Token de cancelación no válido');
      setLoading(false);
    }
  }, []);

  const cancelAppointment = async () => {
    const token = getTokenFromUrl();
    if (!token) {
      setError('Token no válido');
      return;
    }

    try {
      setLoading(true);
      
      console.log('🔍 Token:', token);
      
      // ✅ SIMPLIFICADO - Solo una URL como en confirm
      const url = `/.netlify/functions/cancel-appointment?token=${token}`;
      
      console.log('🌐 Calling:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Status:', response.status);
      console.log('📡 Content-Type:', response.headers.get('content-type'));

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.log('📡 HTML Response:', textResponse.substring(0, 200));
        throw new Error('La función no está disponible. Por favor contacta al administrador.');
      }

      const data: ApiResponse = await response.json();
      console.log('📦 Data:', data);

      if (response.ok) {
        setSuccess(true);
        setAppointment(data.appointment || null);
        setError(null);
        console.log('✅ Appointment cancelled successfully');
      } else {
        throw new Error(data.message || 'Error del servidor');
      }
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message || 'Error de conexión. Por favor intenta más tarde.');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="flex items-center justify-center mb-6">
            <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Procesando cancelación...
          </h2>
          <p className="text-slate-600">
            Por favor espera mientras procesamos tu solicitud
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
              <CheckCircle className="w-12 h-12 text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-4">
              Cita Cancelada
            </h1>
            <p className="text-lg text-slate-600">
              Tu cita ha sido cancelada exitosamente
            </p>
          </div>

          {appointment && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200 mb-6">
              <h3 className="font-semibold text-orange-800 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Cita cancelada
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <User className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-orange-800">Tratamiento:</span>
                    <p className="text-orange-700">{appointment.title}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-orange-800">Fecha y hora:</span>
                    <p className="text-orange-700">{formatDate(appointment.appointmentDate)}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <XCircle className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-orange-800">Estado:</span>
                    <p className="text-orange-700 capitalize">Cancelada</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mb-6">
            <h4 className="font-semibold text-blue-800 mb-2">¿Necesitas reagendar?</h4>
            <p className="text-blue-700 text-sm">
              Si cambias de opinión o necesitas una nueva cita, no dudes en contactarnos. 
              Estaremos encantados de encontrar un nuevo horario que se ajuste a tus necesidades.
            </p>
          </div>

        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-4">
              No se pudo cancelar
            </h1>
            <p className="text-lg text-red-600 mb-6">
              {error}
            </p>
          </div>

          <div className="bg-red-50 rounded-xl p-6 border border-red-200">
            <h4 className="font-semibold text-red-800 mb-2">Posibles causas:</h4>
            <ul className="text-red-700 space-y-2 text-sm">
              <li>• El enlace de cancelación ha expirado</li>
              <li>• La cita ya fue cancelada anteriormente</li>
              <li>• La cita ya se realizó</li>
              <li>• El enlace no es válido</li>
            </ul>
            
            <div className="mt-4 pt-4 border-t border-red-200">
              <p className="text-red-700 text-sm">
                <strong>¿Necesitas ayuda?</strong> Contacta directamente con nosotros para resolver este problema.
              </p>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Pantalla de confirmación antes de cancelar
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6">
            <AlertTriangle className="w-12 h-12 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            ¿Cancelar cita?
          </h1>
          <p className="text-lg text-slate-600">
            Estás a punto de cancelar tu cita programada
          </p>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            ¡Atención!
          </h3>
          <p className="text-yellow-700 text-sm">
            Una vez que canceles tu cita, <strong>no podrás deshacer esta acción</strong>. 
            Si cambias de opinión, tendrás que contactarnos para programar una nueva cita.
          </p>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mb-6">
          <h4 className="font-semibold text-blue-800 mb-3">Antes de cancelar, considera:</h4>
          <ul className="text-blue-700 space-y-2 text-sm">
            <li>• ¿Necesitas reprogramar en lugar de cancelar?</li>
            <li>• ¿Puedes contactar directamente para cambios de horario?</li>
            <li>• ¿Es posible que alguien más pueda asistir en tu lugar?</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            Volver sin cancelar
          </button>
          <button
            onClick={cancelAppointment}
            className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Sí, cancelar cita
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Al cancelar, liberarás este horario para otros pacientes
          </p>
        </div>
      </div>
    </div>
  );
};

export default CancelAppointment;