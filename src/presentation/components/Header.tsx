import React from 'react';
import { LogOut } from 'lucide-react';
import { useLoginMutation, useProfile } from '@/presentation/hooks'; // ✅ IMPORTAR LOS HOOKS REALES

const Header: React.FC = () => {
  // ✅ USAR DATOS REALES DE TU APLICACIÓN
  const { token, logout } = useLoginMutation();
  const { queryProfile } = useProfile(token || '');

  const userData = queryProfile.data;

  const handleLogout = () => {
    logout(); // ✅ FUNCIÓN REAL DE LOGOUT
  };

  return (
    <header className="p-6 pb-0 sticky top-0 z-50">
      <div className="bg-white rounded-xl shadow-lg border border-cyan-200 px-6 py-4">
      <div className="flex justify-between items-center">
        {/* Mensaje de bienvenida */}
         <div className="flex-shrink-0">
            <img 
              src="/letras.PNG" 
              alt="ArmoniClick Logo" 
              className="h-12 w-auto object-contain"
            />
          </div>

        {/* Perfil del usuario y logout */}
        <div className="flex items-center space-x-4">
          {/* Información del usuario */}
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-700">
              {userData ? `${userData.name} ${userData.lastName}` : 'Cargando...'}
            </p>
            <p className="text-xs text-slate-500">
              {userData?.rut ? userData.rut : 'Profesional de la salud'}
            </p>
          </div>
          
          {/* Foto de perfil */}
          <div className="relative">
            {userData?.img ? (
              <img
                src={userData.img}
                alt="Foto de perfil"
                className="w-12 h-12 rounded-full object-cover border-2 border-cyan-200 shadow-sm hover:border-cyan-300 transition-colors"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center shadow-sm border-2 border-cyan-200 hover:border-cyan-300 transition-colors">
                <span className="text-white font-semibold text-lg">
                  {userData?.name?.[0]?.toUpperCase() || 'U'}
                  {userData?.lastName?.[0]?.toUpperCase() || 'S'}
                </span>
              </div>
            )}
            
            {/* Indicador de estado activo */}
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
          </div>
          
          {/* Botón de cerrar sesión */}
          <button
            onClick={handleLogout}
            className="group p-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200 border border-transparent hover:border-red-200 shadow-sm hover:shadow-md"
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          </button>
        </div>
        </div>
      </div>
    </header>
  );
};

export default Header;