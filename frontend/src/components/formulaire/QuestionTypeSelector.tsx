import React from 'react';
import {
    DocumentTextIcon,
    HashtagIcon,
    CalendarDaysIcon,
    CheckCircleIcon,
    RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { TypeChamp } from '@/src/components/form-builder/Question';

interface QuestionTypeSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectType: (type: TypeChamp) => void;
}

/**
 * Component for selecting the type of question to add to a form
 */
export const QuestionTypeSelector: React.FC<QuestionTypeSelectorProps> = ({
    isOpen,
    onClose,
    onSelectType
}) => {
    if (!isOpen) return null;

    const questionTypes = [
        {
            type: 'texte' as TypeChamp,
            icon: DocumentTextIcon,
            label: 'Texte',
            description: 'Réponse courte ou longue',
            color: 'blue'
        },
        {
            type: 'nombre' as TypeChamp,
            icon: HashtagIcon,
            label: 'Nombre',
            description: 'Valeur numérique avec limites',
            color: 'green'
        },
        {
            type: 'date' as TypeChamp,
            icon: CalendarDaysIcon,
            label: 'Date',
            description: 'Sélecteur de date',
            color: 'purple'
        },
        {
            type: 'choix_multiple' as TypeChamp,
            icon: CheckCircleIcon,
            label: 'Choix Multiple',
            description: 'Liste d\'options prédéfinies',
            color: 'orange'
        },
        {
            type: 'choix_unique' as TypeChamp,
            icon: CheckCircleIcon,
            label: 'Choix Unique',
            description: 'Boutons radio - un seul choix',
            color: 'purple'
        },
        {
            type: 'calcule' as TypeChamp,
            icon: RocketLaunchIcon,
            label: 'Champ Calculé',
            description: 'Calcul automatique (IMC, etc.)',
            color: 'orange'
        }
    ];

    const getColorClasses = (color: string) => {
        const colors: Record<string, string> = {
            blue: 'border-blue-400 bg-blue-100 group-hover:bg-blue-200 text-blue-600',
            green: 'border-green-400 bg-green-100 group-hover:bg-green-200 text-green-600',
            purple: 'border-purple-400 bg-purple-100 group-hover:bg-purple-200 text-purple-600',
            orange: 'border-orange-400 bg-orange-100 group-hover:bg-orange-200 text-orange-600'
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Choisissez le type de question :
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {questionTypes.map(({ type, icon: Icon, label, description, color }) => (
                    <button
                        key={type}
                        onClick={() => onSelectType(type)}
                        className={`group p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-${color}-400 hover:shadow-md text-left transition-all duration-200 transform hover:-translate-y-1`}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg transition-colors ${getColorClasses(color)}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="font-semibold text-gray-900">{label}</div>
                        </div>
                        <div className="text-xs text-gray-800">{description}</div>
                    </button>
                ))}
            </div>
            <div className="mt-4 text-center">
                <button
                    onClick={onClose}
                    className="text-sm text-gray-800 hover:text-gray-700 transition-colors"
                >
                    Annuler
                </button>
            </div>
        </div>
    );
};
