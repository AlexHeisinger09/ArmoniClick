import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation, useProfile } from '@/presentation/hooks';

interface HeaderProps {
  isMinimized?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isMinimized = false }) => {
  const { token, logout } = useLoginMutation();
  const { queryProfile } = useProfile(token || '');
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const userData = queryProfile.data;

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const handleGoToConfiguration = () => {
    navigate('/dashboard/configuracion');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={`
      transition-all duration-300
      ${isMinimized ? 'hidden md:block md:p-2 md:pb-0' : 'p-4 sm:p-6 pb-0'}
    `}>
      <div className={`
        bg-white rounded-xl shadow-lg border border-cyan-200 transition-all duration-300
        ${isMinimized ? 'px-3 py-2' : 'px-4 sm:px-6 py-3 sm:py-4'}
      `}>
        <div className="flex justify-between items-center">
          {/* Logo y mensaje de bienvenida */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Logo con tamaño responsivo */}
            <div className="flex-shrink-0">
              <img
                src="/letras.PNG"
                alt="ArmoniClick Logo"
                className={`w-auto object-contain transition-all duration-300 ${
                  isMinimized ? 'h-6 max-w-[80px]' : 'h-8 sm:h-12 max-w-[120px] sm:max-w-none'
                }`}
              />
            </div>
          </div>

          {/* Perfil del usuario y menú de opciones */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {/* Información del usuario - oculta en móvil, siempre visible en desktop */}
            <div className="text-right hidden md:block">
              <p className={`font-medium text-slate-700 transition-all duration-300 ${
                isMinimized ? 'text-xs' : 'text-sm'
              }`}>
                {userData ? `${userData.name} ${userData.lastName}` : 'Cargando...'}
              </p>
              <p className={`text-slate-500 transition-all duration-300 ${
                isMinimized ? 'text-[10px]' : 'text-xs'
              }`}>
                {userData?.rut ? userData.rut : 'Profesional de la salud'}
              </p>
            </div>

            {/* Foto de perfil con tamaño responsivo */}
            <div className="relative flex-shrink-0">
              {userData?.img ? (
                <img
                  src={userData.img}
                  alt="Foto de perfil"
                  className={`rounded-full object-cover border-2 border-cyan-200 shadow-sm hover:border-cyan-300 transition-all duration-300 ${
                    isMinimized ? 'w-8 h-8' : 'w-10 h-10 sm:w-12 sm:h-12'
                  }`}
                />
              ) : (
                <div className={`bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center shadow-sm border-2 border-cyan-200 hover:border-cyan-300 transition-all duration-300 ${
                  isMinimized ? 'w-8 h-8' : 'w-10 h-10 sm:w-12 sm:h-12'
                }`}>
                  <span className={`text-white font-semibold ${
                    isMinimized ? 'text-xs' : 'text-sm sm:text-lg'
                  }`}>
                    {userData?.name?.[0]?.toUpperCase() || 'U'}
                    {userData?.lastName?.[0]?.toUpperCase() || 'S'}
                  </span>
                </div>
              )}

              {/* Indicador de estado activo */}
              <div className={`absolute bottom-0 right-0 bg-green-500 border-2 border-white rounded-full shadow-sm transition-all duration-300 ${
                isMinimized ? 'w-2.5 h-2.5' : 'w-3 h-3 sm:w-4 sm:h-4'
              }`}></div>
            </div>

            {/* Menú de configuración */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={toggleMenu}
                className={`group text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-full transition-all duration-200 border border-transparent hover:border-cyan-200 shadow-sm hover:shadow-md flex-shrink-0 ${
                  isMinimized ? 'p-1.5' : 'p-2 sm:p-3'
                }`}
                title="Opciones"
              >
                <Settings className={`group-hover:scale-110 group-hover:rotate-90 transition-all duration-300 ${
                  isMinimized ? 'w-4 h-4' : 'w-4 h-4 sm:w-5 sm:h-5'
                }`} />
              </button>

              {/* Menú desplegable */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                  {/* Opción de configuración */}
                  <button
                    onClick={handleGoToConfiguration}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-cyan-700 transition-colors duration-200"
                  >
                    <User className="w-4 h-4" />
                    <span>Configuración</span>
                  </button>

                  {/* Separador */}
                  <div className="my-1 h-px bg-slate-200"></div>

                  {/* Opción de cerrar sesión */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;