import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu,
  Users,
  Calendar,
  Settings,
  Stethoscope,
  Home,
  Bell,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  className?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  children?: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed, className = '' }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();

  const menuItems: MenuItem[] = [
    {
      id: 'home',
      label: 'Inicio',
      icon: Home,
      href: '/dashboard' // Correcto - coincide con la ruta index del dashboard
    },
    {
      id: 'pacientes',
      label: 'Pacientes',
      icon: Users,
      href: '/dashboard/pacientes' // Correcto - ruta anidada
    },
    {
      id: 'calendario',
      label: 'Calendario',
      icon: Calendar,
      href: '/dashboard/calendario' // Correcto - ruta anidada
    },
    {
      id: 'configuracion',
      label: 'Configuración',
      icon: Settings,
      href: '/dashboard/configuracion' // Correcto - ruta anidada
    }
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isActive = location.pathname === item.href;
    const Icon = item.icon;

    if (hasChildren) {
      return (
        <div key={item.id}>
          <button
            onClick={() => toggleExpanded(item.id)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200
              ${level > 0 ? 'pl-12' : ''}
              ${isActive 
                ? 'bg-gradient-to-r from-cyan-50 to-cyan-100 text-cyan-700 border-r-4 border-cyan-500' 
                : 'text-gray-600 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-cyan-100 hover:text-cyan-600'
              }
              ${isCollapsed ? 'justify-center px-2' : ''}
            `}
          >
            <Icon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} flex-shrink-0`} />
            
            {!isCollapsed && (
              <>
                <span className="font-medium text-sm flex-1">{item.label}</span>
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              </>
            )}
          </button>

          {isExpanded && !isCollapsed && (
            <div className="bg-gray-50">
              {item.children?.map(child => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        to={item.href}
        className={`
          w-full flex items-center gap-3 px-4 py-3 transition-all duration-200
          ${level > 0 ? 'pl-12' : ''}
          ${isActive 
            ? 'bg-gradient-to-r from-cyan-50 to-cyan-100 text-cyan-700 border-r-4 border-cyan-500' 
            : 'text-gray-600 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-cyan-100 hover:text-cyan-600'
          }
          ${isCollapsed ? 'justify-center px-2' : ''}
        `}
      >
        <Icon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} flex-shrink-0`} />
        
        {!isCollapsed && (
          <span className="font-medium text-sm flex-1">{item.label}</span>
        )}
      </Link>
    );
  };

  return (
    <div className={`bg-white shadow-lg border-r border-gray-200 ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 flex flex-col ${className}`}>
      {/* Header del Sidebar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gradient-to-r hover:from-cyan-50 hover:to-cyan-100 hover:text-cyan-600 transition-all duration-200"
        >
          <Menu className="w-5 h-5 text-gray-600 hover:text-cyan-600 transition-colors" />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto">
        <div className="py-2">
          {menuItems.map(item => renderMenuItem(item))}
        </div>
      </nav>

      {/* Footer del Sidebar */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-100 to-cyan-200 rounded-full mx-auto mb-2 flex items-center justify-center">
              <Bell className="w-6 h-6 text-cyan-500" />
            </div>
            <p className="text-xs text-gray-500">Sistema de Gestión Médica</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;