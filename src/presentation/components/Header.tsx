import React from 'react';
import { LogOut } from 'lucide-react';
import { useLoginMutation, useProfile } from '@/presentation/hooks';

const Header: React.FC = () => {
  const { token, logout } = useLoginMutation();
  const { queryProfile } = useProfile(token || '');

  const userData = queryProfile.data;

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="p-4 sm:p-6 pb-0">
      <div className="bg-white rounded-xl shadow-lg border border-cyan-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          {/* Logo y mensaje de bienvenida */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Logo con tamaño responsivo */}
            <div className="flex-shrink-0">
              <img 
                src="/letras.PNG" 
                alt="ArmoniClick Logo" 
                className="h-8 sm:h-12 w-auto object-contain max-w-[120px] sm:max-w-none"
              />
            </div>
          </div>

          {/* Perfil del usuario y logout */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {/* Información del usuario - oculta en móvil */}
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-slate-700">
                {userData ? `${userData.name} ${userData.lastName}` : 'Cargando...'}
              </p>
              <p className="text-xs text-slate-500">
                {userData?.rut ? userData.rut : 'Profesional de la salud'}
              </p>
            </div>
            
            {/* Foto de perfil con tamaño responsivo */}
            <div className="relative flex-shrink-0">
              {userData?.img ? (
                <img
                  src={userData.img}
                  alt="Foto de perfil"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-cyan-200 shadow-sm hover:border-cyan-300 transition-colors"
                />
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center shadow-sm border-2 border-cyan-200 hover:border-cyan-300 transition-colors">
                  <span className="text-white font-semibold text-sm sm:text-lg">
                    {userData?.name?.[0]?.toUpperCase() || 'U'}
                    {userData?.lastName?.[0]?.toUpperCase() || 'S'}
                  </span>
                </div>
              )}
              
              {/* Indicador de estado activo - más pequeño en móvil */}
              <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
            </div>
            
            {/* Botón de cerrar sesión más compacto en móvil */}
            <button
              onClick={handleLogout}
              className="group p-2 sm:p-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200 border border-transparent hover:border-red-200 shadow-sm hover:shadow-md flex-shrink-0"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;