import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Users,
  Calendar,
  Settings,
  Notebook,
  Calculator
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const location = useLocation();

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
      id: 'presupuestos',
      label: 'Planes',
      icon: Calculator,
      href: '/dashboard/presupuestos'
    },
    {
      id: 'calendario',
      label: 'Agenda',
      icon: Calendar,
      href: '/dashboard/calendario'
    },
    {
      id: 'configuracion',
      label: 'Config',
      icon: Settings,
      href: '/dashboard/configuracion'
    }
  ];

  const renderDesktopMenuItem = (item: MenuItem) => {
    const isActive = location.pathname === item.href;
    const Icon = item.icon;

    return (
      <Link
        key={item.id}
        to={item.href}
        className={`
          w-full flex flex-col items-center gap-1 px-2 py-3 transition-all duration-200 rounded-lg my-1
          ${isActive
            ? 'bg-cyan-500 text-white shadow-sm'
            : 'text-slate-600 hover:bg-cyan-100 hover:text-slate-700'
          }
        `}
      >
        <Icon className="w-6 h-6 flex-shrink-0" />
        <span className="font-medium text-xs text-center leading-tight">{item.label}</span>
      </Link>
    );
  };

  const renderMobileMenuItem = (item: MenuItem) => {
    const isActive = location.pathname === item.href;
    const Icon = item.icon;

    return (
      <Link
        key={item.id}
        to={item.href}
        className={`
          flex flex-col items-center justify-center px-2 py-1.5 rounded-lg transition-all duration-200 min-w-0 flex-1 text-center
          ${isActive 
            ? 'bg-cyan-500 text-white shadow-sm' 
            : 'text-slate-600 hover:bg-cyan-100 hover:text-slate-700'
          }
        `}
      >
        <Icon className="w-4 h-4 mb-0.5 flex-shrink-0" />
        <span className="text-xs font-medium truncate w-full">{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* MOBILE TOP BAR - Barra horizontal con navegación */}
      <div className="md:hidden bg-white shadow-lg border-b border-cyan-200 relative z-50">
        {/* Navegación horizontal */}
        <nav className="px-2 py-2">
          <div className="flex items-center justify-between space-x-1 overflow-x-auto">
            {menuItems.map(item => renderMobileMenuItem(item))}
          </div>
        </nav>
      </div>

      {/* DESKTOP SIDEBAR - Siempre colapsado con texto */}
      <div className={`
        hidden md:flex bg-white shadow-lg h-full flex-col border-r border-cyan-200 w-20
        ${className}
      `}>
        {/* Navigation Menu */}
        <nav className="flex-1 py-4 px-1">
          <div className="space-y-2">
            {menuItems.map(item => renderDesktopMenuItem(item))}
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;