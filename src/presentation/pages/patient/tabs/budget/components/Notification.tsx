// src/presentation/pages/patient/tabs/budget/components/Notification.tsx
import React from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { NotificationProps } from '../types/budget.types';

const Notification: React.FC<NotificationProps> = ({ type, message, onClose }) => {
    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'error': return <AlertCircle className="w-5 h-5 text-red-600" />;
            default: return <AlertCircle className="w-5 h-5 text-blue-600" />;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'success': return 'bg-green-50 border-green-200 text-green-800';
            case 'error': return 'bg-red-50 border-red-200 text-red-800';
            default: return 'bg-blue-50 border-blue-200 text-blue-800';
        }
    };

    return (
        <div className={`fixed top-4 right-4 z-50 max-w-md w-full p-4 rounded-lg border shadow-lg ${getBgColor()}`}>
            <div className="flex items-start">
                <div className="flex-shrink-0">{getIcon()}</div>
                <div className="ml-3 flex-1">
                    <p className="text-sm font-medium">{message}</p>
                </div>
                <button onClick={onClose} className="ml-4 flex-shrink-0">
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export { Notification };