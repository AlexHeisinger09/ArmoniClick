import React from 'react';
import { User } from 'lucide-react'; // Importamos el ícono de usuario de Lucide

interface UserInfo {
  name: string;
  rut: string;
  avatar?: string; // URL de la imagen de perfil (opcional)
}

interface HeaderProps {
  logo: string | React.ReactNode; // Puede ser una URL o un componente SVG
  user: UserInfo;
}

const Header: React.FC<HeaderProps> = ({ logo, user }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo de la aplicación */}
          <div className="flex-shrink-0 flex items-center">
            {typeof logo === 'string' ? (
              <img className="h-8 w-auto" src={logo} alt="Logo de la aplicación" />
            ) : (
              logo
            )}
          </div>
          
          {/* Información del usuario */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.rut}</p>
            </div>
            
            {/* Avatar del usuario */}
            <div className="flex-shrink-0">
              {user.avatar ? (
                <img
                  className="h-8 w-8 rounded-full"
                  src={user.avatar}
                  alt={`Avatar de ${user.name}`}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-500" />
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