import * as React from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/presentation/lib/utils";

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ 
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
          styles: 'bg-green-50 border-green-200 text-green-800',
          iconColor: 'text-green-600'
        };
      case 'error':
        return {
          icon: AlertCircle,
          styles: 'bg-red-50 border-red-200 text-red-800',
          iconColor: 'text-red-600'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          styles: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          iconColor: 'text-yellow-600'
        };
      case 'info':
        return {
          icon: Info,
          styles: 'bg-blue-50 border-blue-200 text-blue-800',
          iconColor: 'text-blue-600'
        };
      default:
        return {
          icon: Info,
          styles: 'bg-gray-50 border-gray-200 text-gray-800',
          iconColor: 'text-gray-600'
        };
    }
  };

  const { icon: Icon, styles, iconColor } = getTypeStyles();

  return (
    <div
      className={cn(
        "relative flex items-start p-4 border rounded-lg shadow-lg transition-all duration-300 ease-in-out transform animate-in slide-in-from-right-full",
        styles
      )}
    >
      <Icon className={cn("w-5 h-5 mt-0.5 mr-3 flex-shrink-0", iconColor)} />
      
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