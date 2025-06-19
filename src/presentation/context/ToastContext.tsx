// src/presentation/context/ToastContext.tsx (CONFLICTO DE NOMBRES SOLUCIONADO)
import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Componente Toast individual - renombrado para evitar conflictos
interface ToastItemProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ 
  id, 
  type, 
  title, 
  description, 
  duration = 5000, 
  onClose 
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          containerClass: 'bg-green-50 border-green-200 text-green-800',
          iconClass: 'text-green-600'
        };
      case 'error':
        return {
          icon: AlertCircle,
          containerClass: 'bg-red-50 border-red-200 text-red-800',
          iconClass: 'text-red-600'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          containerClass: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          iconClass: 'text-yellow-600'
        };
      case 'info':
        return {
          icon: Info,
          containerClass: 'bg-blue-50 border-blue-200 text-blue-800',
          iconClass: 'text-blue-600'
        };
      default:
        return {
          icon: Info,
          containerClass: 'bg-gray-50 border-gray-200 text-gray-800',
          iconClass: 'text-gray-600'
        };
    }
  };

  const { icon: Icon, containerClass, iconClass } = getTypeStyles();

  return (
    <div
      className={`relative flex items-start p-4 border rounded-lg shadow-lg transition-all duration-300 ease-in-out ${containerClass}`}
      style={{
        transform: 'translateX(0)',
        animation: 'slideInFromRight 0.3s ease-out'
      }}
    >
      <Icon className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${iconClass}`} />
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold">{title}</h4>
        {description && (
          <p className="text-sm mt-1 opacity-90">{description}</p>
        )}
      </div>

      <button
        onClick={() => onClose(id)}
        className="ml-3 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Provider del contexto
interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((title: string, description?: string) => {
    addToast({ type: 'success', title, description });
  }, [addToast]);

  const error = useCallback((title: string, description?: string) => {
    addToast({ type: 'error', title, description });
  }, [addToast]);

  const warning = useCallback((title: string, description?: string) => {
    addToast({ type: 'warning', title, description });
  }, [addToast]);

  const info = useCallback((title: string, description?: string) => {
    addToast({ type: 'info', title, description });
  }, [addToast]);

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Container con estilos CSS en línea para animaciones */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm w-full">
        <style>{`
          @keyframes slideInFromRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}</style>
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            id={toast.id}
            type={toast.type}
            title={toast.title}
            description={toast.description}
            duration={toast.duration}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};