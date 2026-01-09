import React from 'react';
import { RocketLaunchIcon, PlusIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { themesMedicaux, ThemeMedical } from '@/src/constants/themes';

interface ThemeSelectorProps {
    themes: ThemeMedical[];
    rechercheTheme: string;
    onRechercheChange: (value: string) => void;
    onThemeSelect: (theme: ThemeMedical) => void;
    onCustomizeTheme: (theme: ThemeMedical) => void;
    champsCount: number;
}

/**
 * Component for selecting and adding medical themes to a form
 */
export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
    themes,
    rechercheTheme,
    onRechercheChange,
    onThemeSelect,
    onCustomizeTheme,
    champsCount
}) => {
    const filteredThemes = themes.filter(theme =>
        theme.nom.toLowerCase().includes(rechercheTheme.toLowerCase()) ||
        theme.description.toLowerCase().includes(rechercheTheme.toLowerCase())
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
                <RocketLaunchIcon className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Ajouter des thèmes médicaux</h2>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="text-sm text-blue-900 flex items-start gap-2">
                    <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                    </svg>
                    <span>
                        <strong>Astuce :</strong> Cliquez sur une carte pour ajouter toutes ses questions.
                        Cliquez sur <strong>"Personnaliser"</strong> pour ajouter vos propres questions à un thème.
                    </span>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
                <div className="relative">
                    <input
                        type="text"
                        value={rechercheTheme}
                        onChange={(e) => onRechercheChange(e.target.value)}
                        placeholder="Rechercher un thème médical..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {rechercheTheme && (
                        <button
                            onClick={() => onRechercheChange('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Themes Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredThemes.map((theme, index) => (
                    <div
                        key={index}
                        className="group relative border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer transform hover:scale-105 active:scale-95"
                        onClick={() => onThemeSelect(theme)}
                    >
                        <div className="text-center">
                            <div className="flex justify-center mb-2">
                                <theme.icon className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="font-medium text-gray-900 mb-2">{theme.nom}</h3>
                            <p className="text-xs text-gray-800 mb-2">{theme.description}</p>
                            <div className="flex items-center justify-center gap-1 text-xs text-blue-600">
                                <PlusIcon className="w-3 h-3" />
                                <span>+{theme.champs.length} questions</span>
                            </div>
                        </div>

                        {/* Customize Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onCustomizeTheme(theme);
                            }}
                            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Ajouter une question personnalisée à ce thème"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>

            {/* No Results Message */}
            {rechercheTheme && filteredThemes.length === 0 && (
                <div className="text-center py-8">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500 text-sm">Aucun thème ne correspond à &quot;{rechercheTheme}&quot;</p>
                    <button
                        onClick={() => onRechercheChange('')}
                        className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                        Effacer la recherche
                    </button>
                </div>
            )}

            {/* Success Message */}
            {champsCount > 0 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-green-800">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span><strong>{champsCount}</strong> question(s) ajoutée(s) au formulaire</span>
                    </div>
                </div>
            )}
        </div>
    );
};
