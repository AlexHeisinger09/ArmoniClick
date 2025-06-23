import React from 'react';
import { Bell, Search, Settings , Stethoscope} from 'lucide-react';

const Header: React.FC = () => {
  const currentUser = {
    name: 'Dra. Camila Delgado',
    rut: '12345678-9',
    avatar: ''
  };

  return (
    <header className="bg-white border-b border-cyan-200 px-6 py-4 shadow-sm">
      <div className="flex justify-between items-center">
        {/* Título de la página actual */}
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center shadow-sm">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-700 text-lg">ArmoniClick</span>
          </div>
        </div>
        
        {/* Acciones del header */}
        <div className="flex items-center space-x-4">
          {/* Buscador rápido */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Búsqueda rápida..."
              className="pl-10 pr-4 py-2 w-64 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm bg-white placeholder-slate-500 text-slate-700"
            />
          </div>
          
          {/* Notificaciones */}
          <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-cyan-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* Configuración */}
          <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-cyan-100 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          
          {/* Usuario */}
          <div className="flex items-center space-x-3 pl-4 border-l border-cyan-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-700">{currentUser.name}</p>
              <p className="text-xs text-slate-500">{currentUser.rut}</p>
            </div>
            
            <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-semibold text-sm">CD</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;