import React from 'react';
import { AlertCircle, Trash2, CheckCircle, AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
  details?: string[];
  icon?: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  variant = 'info',
  isLoading = false,
  details = [],
  icon
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          headerBg: 'bg-red-50 border-b border-red-200',
          headerText: 'text-red-900',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          buttonBg: 'bg-red-600 hover:bg-red-700',
          defaultIcon: <Trash2 className="w-6 h-6" />
        };
      case 'warning':
        return {
          headerBg: 'bg-amber-50 border-b border-amber-200',
          headerText: 'text-amber-900',
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
          buttonBg: 'bg-amber-600 hover:bg-amber-700',
          defaultIcon: <AlertTriangle className="w-6 h-6" />
        };
      case 'success':
        return {
          headerBg: 'bg-green-50 border-b border-green-200',
          headerText: 'text-green-900',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          buttonBg: 'bg-green-600 hover:bg-green-700',
          defaultIcon: <CheckCircle className="w-6 h-6" />
        };
      default:
        return {
          headerBg: 'bg-blue-50 border-b border-blue-200',
          headerText: 'text-blue-900',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          buttonBg: 'bg-blue-600 hover:bg-blue-700',
          defaultIcon: <AlertCircle className="w-6 h-6" />
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className={`${styles.headerBg} p-6 flex items-start justify-between`}>
            <div className="flex items-start gap-4">
              <div className={`${styles.iconBg} p-3 rounded-lg`}>
                <div className={styles.iconColor}>
                  {icon || styles.defaultIcon}
                </div>
              </div>
              <div className="flex-1">
                <h2 className={`${styles.headerText} font-semibold text-lg`}>
                  {title}
                </h2>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <p className="text-gray-700 leading-relaxed mb-4">
              {message}
            </p>

            {/* Details list if provided */}
            {details.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                <ul className="space-y-2">
                  {details.map((detail, index) => (
                    <li key={index} className="text-sm text-gray-700 flex gap-2">
                      <span className="text-gray-400 mt-0.5">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium text-white ${styles.buttonBg} transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              )}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export { ConfirmationModal };
