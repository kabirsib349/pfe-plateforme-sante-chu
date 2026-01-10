import React from 'react';
import { ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'info' | 'success' | 'warning';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    variant = 'info'
}) => {
    if (!isOpen) return null;

    // Define colors/icons based on variant
    const getVariantStyles = () => {
        switch (variant) {
            case 'danger':
                return {
                    iconBg: 'bg-red-100',
                    iconColor: 'text-red-600',
                    buttonBg: 'bg-red-600',
                    buttonHover: 'hover:bg-red-700',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                };
            case 'success':
                return {
                    iconBg: 'bg-green-100',
                    iconColor: 'text-green-600',
                    buttonBg: 'bg-green-600',
                    buttonHover: 'hover:bg-green-700',
                    icon: <CheckCircleIcon className="w-6 h-6 text-green-600" />
                };
            case 'warning':
                return {
                    iconBg: 'bg-amber-100',
                    iconColor: 'text-amber-600',
                    buttonBg: 'bg-amber-600',
                    buttonHover: 'hover:bg-amber-700',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
                };
            default: // info
                return {
                    iconBg: 'bg-blue-100',
                    iconColor: 'text-blue-600',
                    buttonBg: 'bg-blue-600',
                    buttonHover: 'hover:bg-blue-700',
                    icon: <InformationCircleIcon className="w-6 h-6 text-blue-600" />
                };
        }
    };

    const styles = getVariantStyles();

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-100 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start gap-4 mb-6">
                    <div className={`flex-shrink-0 w-12 h-12 ${styles.iconBg} rounded-full flex items-center justify-center`}>
                        {styles.icon}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                        <div className="mt-2">
                            <p className="text-gray-600 text-base leading-relaxed">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 px-4 py-2.5 ${styles.buttonBg} text-white rounded-lg ${styles.buttonHover} transition-colors font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
