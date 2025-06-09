import React from 'react';
import { 
  Wrench, 
  HardHat, 
  Hammer, 
  Settings, 
  ArrowLeft,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ConfigurationProps {}

export const Configuration: React.FC<ConfigurationProps> = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Animación de herramientas */}
        <div className="relative mb-12">
          {/* Contenedor principal con animación */}
          <div className="relative w-48 h-48 mx-auto">
            {/* Círculo de fondo */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full opacity-20 animate-pulse"></div>
            
            {/* Herramientas animadas */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Martillo rotando */}
                <div className="absolute -top-6 -left-6 animate-spin-slow">
                  <Hammer className="w-12 h-12 text-orange-500" style={{
                    animation: 'spin 4s linear infinite'
                  }} />
                </div>
                
                {/* Llave inglesa oscilando */}
                <div className="absolute -top-8 -right-4 animate-bounce">
                  <Wrench className="w-10 h-10 text-blue-600" style={{
                    animation: 'bounce 2s infinite'
                  }} />
                </div>
                
                {/* Casco central */}
                <div className="animate-pulse">
                  <HardHat className="w-20 h-20 text-yellow-500" />
                </div>
                
                {/* Engranaje rotando */}
                <div className="absolute -bottom-4 -left-8 animate-spin">
                  <Settings className="w-14 h-14 text-gray-500" style={{
                    animation: 'spin 3s linear infinite reverse'
                  }} />
                </div>
              </div>
            </div>
            
            {/* Partículas flotantes */}
            <div className="absolute inset-0">
              <div className="absolute top-4 left-8 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
              <div className="absolute top-16 right-6 w-1 h-1 bg-orange-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute bottom-12 left-12 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-6 right-10 w-1 h-1 bg-yellow-400 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            🚧 En Construcción 🚧
          </h1>
          
          <p className="text-xl text-gray-600 mb-2">
            Estamos trabajando duro para traerte esta funcionalidad
          </p>
          
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <Clock className="w-5 h-5" />
            <span className="text-lg">Muy pronto...</span>
          </div>
          
          {/* Barra de progreso animada */}
          <div className="w-full max-w-md mx-auto mt-8">
            <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse"
                style={{
                  width: '65%',
                  animation: 'progress 3s ease-in-out infinite alternate'
                }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Progreso: 65%</p>
          </div>
          
          {/* Botón de regreso */}
          <div className="mt-12">
            <Link 
              to="/"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver al Inicio</span>
            </Link>
          </div>
        </div>
        
        {/* Mensaje adicional */}
        <div className="mt-12 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
          <p className="text-gray-600">
            <strong>¿Necesitas ayuda?</strong><br />
            Mientras tanto, puedes explorar las otras secciones del sistema o contactarnos si tienes alguna pregunta.
          </p>
        </div>
      </div>

      {/* Estilos CSS en línea para TypeScript */}
      <style>
        {`
          @keyframes spin-slow {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          
          @keyframes progress {
            0% {
              width: 45%;
            }
            50% {
              width: 75%;
            }
            100% {
              width: 65%;
            }
          }
          
          .animate-spin-slow {
            animation: spin-slow 4s linear infinite;
          }
        `}
      </style>
    </div>
  );
};
