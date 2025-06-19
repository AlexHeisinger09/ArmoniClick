import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './ui/spinner';
import { Shield, AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { user, token, isLoading, isAuthenticated } = useAuth();

  console.log('ProtectedRoute - token:', token); // Debug
  console.log('ProtectedRoute - user:', user); // Debug
  console.log('ProtectedRoute - isLoading:', isLoading); // Debug
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated); // Debug

  // Si estamos cargando, mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-aesthetic flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg border border-aesthetic-lavanda/20 p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-aesthetic-lavanda to-aesthetic-rosa rounded-full mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-8 h-8 text-aesthetic-gris-profundo" />
            </div>
            <Spinner size="large" show={true} className="text-aesthetic-gris-profundo mb-4" />
            <h3 className="text-lg font-semibold text-aesthetic-gris-profundo mb-2">
              Validando credenciales
            </h3>
            <p className="text-aesthetic-gris-medio text-sm">
              Verificando tu sesión activa...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay token, redirigir al login
  if (!token) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Si hay token pero no hay usuario (error de autenticación), limpiar y redirigir
  if (token && !user && !isLoading) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Si no está autenticado, mostrar mensaje de error
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-aesthetic flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg border border-aesthetic-lavanda/20 p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-aesthetic-gris-profundo mb-2">
              Sesión no válida
            </h3>
            <p className="text-aesthetic-gris-medio text-sm mb-4">
              Tu sesión ha expirado o no es válida.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/auth/login';
              }}
              className="bg-aesthetic-lavanda hover:bg-aesthetic-lavanda-hover text-aesthetic-gris-profundo font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
            >
              Iniciar sesión nuevamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si todo está bien, renderizar el contenido protegido
  return <>{children}</>;
};