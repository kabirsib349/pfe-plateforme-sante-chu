import React, { FC } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface ToastContainerProps {
    toasts: Toast[];
    onRemoveToast: (id: string) => void;
}

export const ToastContainer: FC<ToastContainerProps> = ({ toasts, onRemoveToast }) => {
    if (toasts.length === 0) return null;

    const getToastStyles = (type: Toast['type']) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'info':
            default:
                return 'bg-blue-50 border-blue-200 text-blue-800';
        }
    };

    const getIcon = (type: Toast['type']) => {
        switch (type) {
            case 'success':
                return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
            case 'error':
                return <ExclamationCircleIcon className="w-5 h-5 text-red-600" />;
            case 'info':
            default:
                return <InformationCircleIcon className="w-5 h-5 text-blue-600" />;
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg max-w-sm transition-all duration-300 animate-slide-in-down ${getToastStyles(toast.type)}`}
                >
                    {getIcon(toast.type)}
                    <span className="flex-1 text-sm font-medium">{toast.message}</span>
                    <button
                        onClick={() => onRemoveToast(toast.id)}
                        className="flex-shrink-0 p-1 hover:bg-black/10 rounded transition-colors"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
};