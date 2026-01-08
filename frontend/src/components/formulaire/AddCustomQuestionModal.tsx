import React, { useState } from 'react';
import { QuestionPersonnalisee } from '@/src/types';
import { ThemeMedical } from '@/src/constants/themes';
import { XMarkIcon, PlusIcon, TrashIcon, DocumentTextIcon, HashtagIcon, CalendarIcon, ListBulletIcon, CheckCircleIcon, MinusCircleIcon, BoltIcon } from '@heroicons/react/24/outline';

interface OptionInput {
    libelle: string;
    valeur: string;
}

interface AddCustomQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (question: QuestionPersonnalisee) => Promise<any>;
    theme: ThemeMedical | null;
    existingQuestions?: QuestionPersonnalisee[];
    onDelete?: (id: number) => Promise<void>;
}

export const AddCustomQuestionModal: React.FC<AddCustomQuestionModalProps> = ({
    isOpen,
    onClose,
    onSave,
    theme,
    existingQuestions = [],
    onDelete
}) => {
    const [label, setLabel] = useState('');
    const [nomVariable, setNomVariable] = useState('');
    const [type, setType] = useState('texte');

    // New state for structured options
    const [options, setOptions] = useState<OptionInput[]>([]);
    const [dateMin, setDateMin] = useState('');
    const [dateMax, setDateMax] = useState('');

    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Reset when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setLabel('');
            setNomVariable('');
            setType('texte');
            setOptions([]);
            setDateMin('');
            setDateMax('');
            setDeletingId(null);
        }
    }, [isOpen]);

    if (!isOpen || !theme) return null;

    const addOption = () => {
        setOptions([...options, { libelle: '', valeur: '' }]);
    };

    const removeOption = (index: number) => {
        const newOptions = [...options];
        newOptions.splice(index, 1);
        setOptions(newOptions);
    };

    const updateOption = (index: number, field: keyof OptionInput, value: string) => {
        const newOptions = [...options];
        newOptions[index][field] = value;
        setOptions(newOptions);
    };

    const applyPresetYesNo = () => {
        setOptions([
            { libelle: 'Oui', valeur: '1' },
            { libelle: 'Non', valeur: '0' }
        ]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const question: QuestionPersonnalisee = {
                label,
                nomVariable: nomVariable.toUpperCase(),
                type,
                themeNom: theme.nom,
                options: (type === 'choix_multiple' || type === 'choix_unique') && options.length > 0
                    ? JSON.stringify(options)
                    : undefined,
                dateMin: type === 'date' && dateMin ? dateMin : undefined,
                dateMax: type === 'date' && dateMax ? dateMax : undefined
            };
            await onSave(question);
            // Don't close immediately, just reset form to allow adding more
            setLabel('');
            setNomVariable('');
            setType('texte');
            setOptions([]);
            setDateMin('');
            setDateMax('');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!onDelete) return;
        setDeletingId(id);
        try {
            await onDelete(id);
        } finally {
            setDeletingId(null);
        }
    };

    const questionTypes = [
        { type: 'texte', label: 'Texte', icon: <DocumentTextIcon className="w-6 h-6" />, desc: 'Réponse libre' },
        { type: 'nombre', label: 'Nombre', icon: <HashtagIcon className="w-6 h-6" />, desc: 'Valeur numérique' },
        { type: 'date', label: 'Date', icon: <CalendarIcon className="w-6 h-6" />, desc: 'Date (JJ/MM/AAAA)' },
        { type: 'choix_unique', label: 'Choix Unique', icon: <CheckCircleIcon className="w-6 h-6" />, desc: 'Une seule réponse' },
        { type: 'choix_multiple', label: 'Choix Multiple', icon: <ListBulletIcon className="w-6 h-6" />, desc: 'Plusieurs réponses' },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose} aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6 overflow-hidden relative flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute top-4 right-4 z-10">
                    <button
                        type="button"
                        className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                        onClick={onClose}
                    >
                        <span className="sr-only">Fermer</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-6 flex-shrink-0" id="modal-title">
                    Gérer les questions de "{theme.nom}"
                </h3>

                <div className="flex-1 overflow-y-auto flex gap-8">
                    {/* Colonne Gauche : Formulaire d'ajout */}
                    <div className="flex-1 min-w-[300px]">
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Ajouter une question</h4>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Type de réponse</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {questionTypes.map((qType) => (
                                        <button
                                            key={qType.type}
                                            type="button"
                                            onClick={() => setType(qType.type)}
                                            className={`p-2 rounded-lg border text-left transition-all ${type === qType.type
                                                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className={`${type === qType.type ? 'text-blue-600' : 'text-gray-400'}`}>
                                                    {qType.icon}
                                                </span>
                                                <span className={`text-sm font-medium ${type === qType.type ? 'text-blue-700' : 'text-gray-700'}`}>
                                                    {qType.label}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Question</label>
                                <input
                                    type="text"
                                    required
                                    value={label}
                                    onChange={e => setLabel(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 bg-white"
                                    placeholder="Ex: Antécédents familiaux ?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nom Variable (Unique)</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <input
                                        type="text"
                                        required
                                        value={nomVariable}
                                        onChange={e => setNomVariable(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 bg-white"
                                        placeholder="Ex: ATCD_FAMILY"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Majuscules et underscores uniquement.</p>
                            </div>

                            {(type === 'choix_unique' || type === 'choix_multiple') && (
                                <div className="bg-gray-50 p-3 rounded-md border border-gray-200 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="block text-sm font-medium text-gray-700">Options de réponse</label>
                                        <button
                                            type="button"
                                            onClick={applyPresetYesNo}
                                            className="text-xs font-semibold bg-white text-blue-700 border border-blue-200 px-3 py-1.5 rounded-md shadow-sm hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center gap-2"
                                        >
                                            <BoltIcon className="w-4 h-4" /> Préréglage Oui/Non (1/0)
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {options.map((opt, idx) => (
                                            <div key={idx} className="flex gap-2 items-start">
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={opt.libelle}
                                                        onChange={e => updateOption(idx, 'libelle', e.target.value)}
                                                        placeholder="Libellé (ex: Oui)"
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                        required
                                                    />
                                                </div>
                                                <div className="w-24">
                                                    <input
                                                        type="text"
                                                        value={opt.valeur}
                                                        onChange={e => updateOption(idx, 'valeur', e.target.value)}
                                                        placeholder="Valeur (1)"
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono text-gray-600"
                                                        required
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeOption(idx)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                                >
                                                    <MinusCircleIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={addOption}
                                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium mt-2"
                                    >
                                        <PlusIcon className="w-4 h-4" /> Ajouter une option
                                    </button>
                                </div>
                            )}

                            {type === 'date' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Date Min</label>
                                        <input
                                            type="date"
                                            value={dateMin}
                                            onChange={e => setDateMin(e.target.value)}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Date Max</label>
                                        <input
                                            type="date"
                                            value={dateMax}
                                            onChange={e => setDateMax(e.target.value)}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 bg-white"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {loading ? 'Ajout...' : 'Ajouter la question'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Colonne Droite : Liste existante */}
                    <div className="flex-1 min-w-[300px] border-l border-gray-200 pl-8">
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                            Questions existantes ({existingQuestions.filter(q => q.themeNom === theme.nom).length})
                        </h4>

                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                            {existingQuestions.filter(q => q.themeNom === theme.nom).length === 0 ? (
                                <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                    <p>Aucune question personnalisée</p>
                                </div>
                            ) : (
                                existingQuestions
                                    .filter(q => q.themeNom === theme.nom)
                                    .map(q => (
                                        <div key={q.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 group hover:border-blue-200 transition-colors">
                                            <div className="flex justify-between items-start gap-2">
                                                <div>
                                                    <p className="font-medium text-gray-900 line-clamp-2">{q.label}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                            {q.type.replace('_', ' ')}
                                                        </span>
                                                        <span className="text-xs text-gray-500 font-mono">{q.nomVariable}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => q.id && handleDelete(q.id)}
                                                    disabled={deletingId === q.id}
                                                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Supprimer"
                                                >
                                                    {deletingId === q.id ? (
                                                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <TrashIcon className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
