import React, { useState } from 'react';
import { Link, useLocation, useNavigate} from 'react-router-dom';
import {
  Menu,
  Users,
  Calendar,
  Settings,
  Notebook,
  LucideLogOut,
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
  const navigate = useNavigate();

  const menuItems: MenuItem[] = [
    {
      id: 'home',
      label: 'Inicio',
      icon: Notebook,
      href: '/dashboard'
    },
    {
      id: 'pacientes',
      label: 'Pacientes',
      icon: Users,
      href: '/dashboard/pacientes'
    },
    {
      id: 'calendario',
      label: 'Calendario',
      icon: Calendar,
      href: '/dashboard/calendario'
    },
    {
      id: 'configuracion',
      label: 'Configuración',
      icon: Settings,
      href: '/dashboard/configuracion'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth/login');
  };

  const handleMenuClick = () => {
    // Colapsar sidebar al seleccionar un menú
    setIsCollapsed(true);
  };

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

    return (
      <Link
        key={item.id}
        to={item.href}
        onClick={handleMenuClick}
        className={`
          w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 rounded-lg mx-2 my-1
          ${level > 0 ? 'pl-12' : ''}
          ${isActive
            ? 'bg-gradient-to-r from-aesthetic-lavanda to-aesthetic-rosa text-aesthetic-gris-profundo shadow-sm border-r-4 border-aesthetic-gris-profundo'
            : 'text-aesthetic-gris-medio hover:bg-gradient-to-r hover:from-aesthetic-lavanda/30 hover:to-aesthetic-rosa/30 hover:text-aesthetic-gris-profundo'
          }
          ${isCollapsed ? 'justify-center px-2 mx-1' : ''}
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
    <div className={`bg-white shadow-lg h-full ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 flex flex-col ${className}`}>
      {/* Header del Sidebar */}
      <div className="flex items-center justify-between p-4 flex-shrink-0">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-30 h-30 flex items-center justify-center">
              <img 
                src="/letras.PNG" 
                alt="Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-aesthetic-lavanda/30 hover:text-aesthetic-gris-profundo transition-all duration-200"
        >
          <Menu className="w-5 h-5 text-aesthetic-gris-medio hover:text-aesthetic-gris-profundo transition-colors" />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className={`flex-1 py-4 ${isCollapsed ? 'pr-1' : 'pr-2'}`}>
        <div className="space-y-1">
          {menuItems.map(item => renderMenuItem(item))}
        </div>
      </nav>

      {/* Footer del Sidebar - Minimalista */}
      {!isCollapsed && (
        <div className="p-4 flex-shrink-0">
          <div className="text-center">
            <button
              onClick={handleLogout}
              className="w-10 h-10 bg-gradient-to-r from-aesthetic-menta to-aesthetic-rosa rounded-full mx-auto mb-2 flex items-center justify-center hover:from-aesthetic-menta/70 hover:to-aesthetic-rosa/70 transition-all duration-200 focus:ring-4 focus:ring-aesthetic-lavanda/30 focus:outline-none shadow-sm"
              title="Cerrar sesión"
            >
              <LucideLogOut className="w-5 h-5 text-aesthetic-gris-profundo" />
            </button>
            <p className="text-xs text-aesthetic-gris-medio">Cerrar sesión</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;