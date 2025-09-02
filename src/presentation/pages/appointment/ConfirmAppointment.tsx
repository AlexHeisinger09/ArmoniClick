// src/presentation/pages/appointment/ConfirmAppointment.tsx - MEJORADO
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Calendar, User, FileText, Loader2 } from 'lucide-react';

interface AppointmentData {
  id: number;
  title: string;
  appointmentDate: string;
  status: string;
  confirmedAt?: string;
}

interface ApiResponse {
  message: string;
  appointment?: AppointmentData;
}

const ConfirmAppointment: React.FC = () => {
  // Estados con nombres únicos
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [appointmentData, setAppointmentData] = useState<AppointmentData | null>(null);

  // Obtener token desde URL
  const getTokenFromUrl = () => {
    const path = window.location.pathname;
    const pathParts = path.split('/');
    const confirmIndex = pathParts.findIndex(part => part === 'confirm-appointment');
    return pathParts[confirmIndex + 1] || null;
  };

  useEffect(() => {
    const token = getTokenFromUrl();
    if (token) {
      confirmAppointment(token);
    } else {
      setErrorMessage('Token de confirmación no válido');
      setIsLoading(false);
    }
  }, []);

  const confirmAppointment = async (confirmationToken: string) => {
    try {
      setIsLoading(true);
      
      console.log('🔍 Attempting to confirm appointment with token:', confirmationToken);
      
      // ✅ MEJORADO - Múltiples intentos con diferentes rutas
      const urls = [
        `/.netlify/functions/appointments-confirm-appointment/${confirmationToken}`,
        `/api/appointments/confirm/${confirmationToken}` // fallback por si las redirecciones funcionan
      ];

      let lastError = null;
      
      for (const url of urls) {
        try {
          console.log('🌐 Trying URL:', url);
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          console.log('📡 Response status:', response.status);
          console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
          console.log('📡 Response URL:', response.url);

          // Verificar el content-type
          const contentType = response.headers.get('content-type');
          console.log('📡 Content-Type:', contentType);

          if (!contentType || !contentType.includes('application/json')) {
            // Si no es JSON, obtener el texto para debug
            const textResponse = await response.text();
            console.log('📡 Non-JSON Response (first 500 chars):', textResponse.substring(0, 500));
            
            // Si es HTML, probablemente es una página de error 404
            if (textResponse.includes('<!doctype') || textResponse.includes('<html>')) {
              console.log('❌ Received HTML instead of JSON - function might not exist');
              lastError = `Función no encontrada en ${url}`;
              continue; // Probar la siguiente URL
            }
            
            throw new Error(`Respuesta no válida: ${contentType}`);
          }

          const data: ApiResponse = await response.json();
          console.log('📦 Response data:', data);

          if (response.ok) {
            setIsSuccess(true);
            setAppointmentData(data.appointment || null);
            setErrorMessage(null);
            console.log('✅ Appointment confirmed successfully');
            return; // Éxito, salir del bucle
          } else {
            throw new Error(data.message || 'Error del servidor');
          }
        } catch (fetchError: any) {
          console.log(`❌ Error with URL ${url}:`, fetchError.message);
          lastError = fetchError.message;
          continue; // Probar la siguiente URL
        }
      }

      // Si llegamos aquí, todos los intentos fallaron
      throw new Error(lastError || 'No se pudo conectar con el servidor');

    } catch (err: any) {
      console.error('❌ Final error:', err);
      setErrorMessage(err.message || 'Error de conexión. Por favor intenta más tarde.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="flex items-center justify-center mb-6">
            <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Confirmando tu cita...
          </h2>
          <p className="text-slate-600">
            Por favor espera mientras procesamos tu confirmación
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        {isSuccess ? (
          <>
            {/* Éxito */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-4">
                ¡Cita Confirmada!
              </h1>
              <p className="text-lg text-slate-600">
                Tu cita ha sido confirmada exitosamente
              </p>
            </div>

            {appointmentData && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 mb-6">
                <h3 className="font-semibold text-green-800 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Detalles de tu cita
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <User className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-green-800">Tratamiento:</span>
                      <p className="text-green-700">{appointmentData.title}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-green-800">Fecha y hora:</span>
                      <p className="text-green-700">{formatDate(appointmentData.appointmentDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-green-800">Estado:</span>
                      <p className="text-green-700 capitalize">{appointmentData.status}</p>
                    </div>
                  </div>

                  {appointmentData.confirmedAt && (
                    <div className="flex items-start">
                      <FileText className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-green-800">Confirmado el:</span>
                        <p className="text-green-700">{formatDate(appointmentData.confirmedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Información importante:</h4>
              <ul className="text-blue-700 space-y-2 text-sm">
                <li>• Te recomendamos llegar 10 minutos antes de tu cita</li>
                <li>• Si necesitas cancelar o reprogramar, contacta con anticipación</li>
                <li>• Recibirás una confirmación adicional si es necesario</li>
              </ul>
            </div>
          </>
        ) : (
          <>
            {/* Error */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-4">
                No se pudo confirmar
              </h1>
              <p className="text-lg text-red-600 mb-6">
                {errorMessage}
              </p>
            </div>

            <div className="bg-red-50 rounded-xl p-6 border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">Posibles causas:</h4>
              <ul className="text-red-700 space-y-2 text-sm">
                <li>• El enlace de confirmación ha expirado</li>
                <li>• La cita ya fue confirmada anteriormente</li>
                <li>• La cita fue cancelada</li>
                <li>• El enlace no es válido</li>
                <li>• Error temporal del servidor</li>
              </ul>
              
              <div className="mt-4 pt-4 border-t border-red-200">
                <p className="text-red-700 text-sm">
                  <strong>¿Necesitas ayuda?</strong> Contacta directamente con nosotros para resolver este problema.
                </p>
              </div>
            </div>
          </>
        )}

        <div className="mt-8 text-center space-y-3">
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            Volver al inicio
          </button>
          
          {/* Botón de debug solo en desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => console.log('Current URL:', window.location.href)}
              className="ml-3 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm"
            >
              Debug URL
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmAppointment;