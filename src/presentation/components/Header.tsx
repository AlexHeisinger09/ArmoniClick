import React from 'react';
import { Bell, Search, Settings , Stethoscope} from 'lucide-react';

const Header: React.FC = () => {
  const currentUser = {
    name: 'Dra. Camila Delgado',
    rut: '12345678-9',
    avatar: ''
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        {/* Título de la página actual */}
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-800 text-lg">ArmoniClick</span>
          </div>
        </div>
        
        {/* Acciones del header */}
        <div className="flex items-center space-x-4">
          {/* Buscador rápido */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Búsqueda rápida..."
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          
          {/* Notificaciones */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* Configuración */}
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          
          {/* Usuario */}
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
              <p className="text-xs text-gray-500">{currentUser.rut}</p>
            </div>
            
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">CD</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;