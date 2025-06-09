import React, { useState } from 'react';
import { 
  Menu,
  Users,
  Calendar,
  Settings,
  Stethoscope,
  Home,
  Bell ,
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
  href?: string;
  active?: boolean;
  children?: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed, className = '' }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(['atenciones']);
  const [activeItem, setActiveItem] = useState('pacientes');

  const menuItems: MenuItem[] = [
    {
      id: 'home',
      label: 'Inicio',
      icon: Home,
      href: '/'
    },
    {
      id: 'pacientes',
      label: 'Pacientes',
      icon: Users,
      href: '/calendario'
    },
    {
      id: 'calendario',
      label: 'Calendario',
      icon: Calendar,
      href: '/calendario'
    },
    {
      id: 'configuracion',
      label: 'Configuración',
      icon: Settings,
      href: '/configuracion'
    }
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleItemClick = (itemId: string, hasChildren = false) => {
    if (hasChildren) {
      toggleExpanded(itemId);
    } else {
      setActiveItem(itemId);
    }
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isActive = activeItem === item.id;
    const Icon = item.icon;

    return (
      <div key={item.id}>
        <button
          onClick={() => handleItemClick(item.id, hasChildren)}
          className={`
            w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200
            ${level > 0 ? 'pl-12' : ''}
            ${isActive 
              ? 'bg-blue-50 text-blue-700 border-r-3 border-blue-600' 
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }
            ${isCollapsed ? 'justify-center px-2' : ''}
          `}
        >
          <Icon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} flex-shrink-0`} />
          
          {!isCollapsed && (
            <>
              <span className="font-medium text-sm flex-1">{item.label}</span>
              {hasChildren && (
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              )}
            </>
          )}
        </button>

        {/* Submenu */}
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="bg-gray-50">
            {item.children?.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white shadow-lg border-r border-gray-200 ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 flex flex-col ${className}`}>
      {/* Header del Sidebar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            {/* <span className="font-bold text-gray-800 text-lg">ArmoniClick</span> */}
          </div>
        )}
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-600" />
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
            <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-2 flex items-center justify-center">
              <Bell className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500">Sistema de Gestión Médica</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;