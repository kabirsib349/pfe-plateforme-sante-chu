'use client';

import React, { useState, useEffect } from 'react';
import { TrashIcon, ExclamationTriangleIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { validateNomVariable } from '@/src/lib/validation';

// Ce type est maintenant aligné avec l'énumération TypeChamp du backend
export type TypeChamp = 'texte' | 'nombre' | 'choix_multiple' |'choix_unique' | 'date' | 'calcule';

// Interface pour une seule option de choix
export interface Option {
  libelle: string;
  valeur: string;
}

export interface ChampFormulaire {
  id: string;
  type: TypeChamp;
  nomVariable: string;
  question: string;
  obligatoire: boolean;
  options?: Option[]; // Structure de données mise à jour
  unite?: string;
  valeurMin?: number;
  valeurMax?: number;
  formuleCalcul?: string;
  champsRequis?: string[];
}

interface QuestionProps {
  champ: ChampFormulaire;
  index: number;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ChampFormulaire>) => void;
  isActive: boolean;
  existingVariables?: string[]; // Pour vérifier l'unicité
  // Props pour le drag & drop
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetId: string) => void;
}

const Question: React.FC<QuestionProps> = ({ 
  champ, 
  index, 
  onDelete, 
  onUpdate, 
  isActive, 
  existingVariables = [],
  isDragging = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop
}) => {
  const [validationError, setValidationError] = useState<string | null>(null);

  // Validation en temps réel du nom de variable
  useEffect(() => {
    if (champ.nomVariable && isActive) {
      const otherVariables = existingVariables.filter(v => v !== champ.nomVariable);
      const error = validateNomVariable(champ.nomVariable, otherVariables);
      setValidationError(error);
    } else {
      setValidationError(null);
    }
  }, [champ.nomVariable, existingVariables, isActive]);

  const handleNomVariableChange = (value: string) => {
    const upperValue = value.toUpperCase();
    onUpdate(champ.id, { nomVariable: upperValue });
  };
  
  const handleOptionChange = (optionIndex: number, field: 'libelle' | 'valeur', value: string) => {
    const newOptions = champ.options?.map((option, i) => {
      if (i === optionIndex) {
        return { ...option, [field]: value };
      }
      return option;
    });
    onUpdate(champ.id, { options: newOptions });
  };

  const addOption = () => {
    const newOptions = [...(champ.options || []), { libelle: `Option ${ (champ.options?.length || 0) + 1}`, valeur: `${ (champ.options?.length || 0) + 1}` }];
    onUpdate(champ.id, { options: newOptions });
  };

  const removeOption = (optionIndex: number) => {
    const newOptions = champ.options?.filter((_, i) => i !== optionIndex);
    onUpdate(champ.id, { options: newOptions });
  };

  const commonFields = (
    <>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-800 mb-1">Nom de la variable (unique, majuscules)</label>
        <div className="relative">
          <input
            type="text"
            value={champ.nomVariable}
            onChange={(e) => handleNomVariableChange(e.target.value)}
            placeholder="EX: POIDS_PATIENT"
            className={`w-full bg-gray-50 px-3 py-2 border rounded-lg focus:ring-1 text-sm font-mono ${
              validationError 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
            }`}
            maxLength={25}
          />
          {validationError && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
            </div>
          )}
        </div>
        {validationError && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <ExclamationTriangleIcon className="w-4 h-4" />
            {validationError}
          </p>
        )}
      </div>
    </>
  );

  const renderOptions = () => {
    switch (champ.type) {
      case 'nombre':
        return (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Valeur Min</label>
                <input
                  type="number"
                  value={champ.valeurMin ?? ''}
                  onChange={(e) => onUpdate(champ.id, { valeurMin: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="Min (optionnel)"
                  step="any"
                  className="w-full bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Valeur Max</label>
                <input
                  type="number"
                  value={champ.valeurMax ?? ''}
                  onChange={(e) => onUpdate(champ.id, { valeurMax: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="Max (optionnel)"
                  step="any"
                  className="w-full bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Unité de mesure</label>
              <input
                type="text"
                value={champ.unite || ''}
                onChange={(e) => onUpdate(champ.id, { unite: e.target.value })}
                placeholder="Ex: kg, cm, années, mmHg, °C"
                className="w-full bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800 flex items-start gap-2">
              <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
              <div>
                <strong>Conseil :</strong> Définissez des valeurs min/max pour éviter les erreurs de saisie. 
                Par exemple, pour l&apos;âge : min=0, max=120 ; pour une échelle de douleur : min=0, max=10.
              </div>
            </div>
          </div>
        );
      case 'choix_multiple':
        return (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-800 mb-2">Options de réponse</label>
            <div className="space-y-2">
              <div className="grid grid-cols-10 gap-2 text-xs text-gray-800 font-medium">
                  <div className="col-span-5">Libellé (vu par l'utilisateur)</div>
                  <div className="col-span-4">Valeur (stockée)</div>
              </div>
              {(champ.options || []).map((option, i) => (
                <div key={i} className="grid grid-cols-10 items-center gap-2">
                  <input
                    type="text"
                    value={option.libelle}
                    onChange={(e) => handleOptionChange(i, 'libelle', e.target.value)}
                    className="col-span-5 bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    value={option.valeur}
                    onChange={(e) => handleOptionChange(i, 'valeur', e.target.value)}
                    className="col-span-4 bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                  <button onClick={() => removeOption(i)} className="col-span-1 p-1 text-gray-400 hover:text-red-500 justify-self-center">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button onClick={addOption} className="text-sm text-blue-600 hover:text-blue-800 pt-2">
                Ajouter une option
              </button>
            </div>
          </div>
      );
      case 'choix_unique': 
        return (
          <div className="mt-4">
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Options de réponse (choix unique)
          </label>
          <div className="space-y-2">
            <div className="grid grid-cols-10 gap-2 text-xs text-gray-800 font-medium">
              <div className="col-span-5">Libellé (vu par l'utilisateur)</div>
              <div className="col-span-4">Valeur (stockée)</div>
            </div>
            {(champ.options || []).map((option, i) => (
              <div key={i} className="grid grid-cols-10 items-center gap-2">
                <input
                  type="text"
                  value={option.libelle}
                  onChange={(e) => handleOptionChange(i, 'libelle', e.target.value)}
                  className="col-span-5 bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
                <input
                  type="text"
                  value={option.valeur}
                  onChange={(e) => handleOptionChange(i, 'valeur', e.target.value)}
                  className="col-span-4 bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
                <button onClick={() => removeOption(i)} className="col-span-1 p-1 text-gray-400 hover:text-red-500 justify-self-center">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button onClick={addOption} className="text-sm text-blue-600 hover:text-blue-800 pt-2">
              Ajouter une option
            </button>
          </div>
        </div>
        );
    
      case 'calcule':
        return (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Formule de calcul</label>
              <input
                type="text"
                value={champ.formuleCalcul || ''}
                onChange={(e) => onUpdate(champ.id, { formuleCalcul: e.target.value })}
                placeholder="Ex: POIDS/(TAILLE^2) pour l'IMC"
                className="w-full bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Variables requises (séparées par des virgules)</label>
              <input
                type="text"
                value={champ.champsRequis?.join(', ') || ''}
                onChange={(e) => {
                  const variables = e.target.value.split(',').map(v => v.trim().toUpperCase()).filter(v => v);
                  onUpdate(champ.id, { champsRequis: variables });
                }}
                placeholder="Ex: POIDS, TAILLE"
                className="w-full bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
              />
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
              <strong>Information :</strong> Ce champ sera calculé automatiquement lors du remplissage du formulaire. 
              Il sera en lecture seule pour les utilisateurs.
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className={`border rounded-lg p-4 transition-all duration-200 ${
        isDragging ? 'opacity-50 transform rotate-2' : ''
      } ${isActive ? 'bg-white border-blue-500 shadow-lg' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}
      draggable
      onDragStart={(e) => onDragStart?.(e, champ.id)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop?.(e, champ.id)}
    >
      <div className="flex items-start gap-4">
        {/* Poignée de drag & drop */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <div className="cursor-move p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <Bars3Icon className="w-4 h-4" />
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
            {index + 1}
          </div>
        </div>

        <div className="flex-1">
          <input
            type="text"
            value={champ.question}
            onChange={(e) => onUpdate(champ.id, { question: e.target.value })}
            placeholder="Saisissez votre question..."
            className={`w-full text-base font-medium border-b-2 outline-none bg-transparent transition-colors ${isActive ? 'text-gray-900 border-gray-200 focus:border-blue-500' : 'text-gray-700 border-transparent'}`}
          />
          {!isActive && <p className="text-sm text-gray-800 mt-1">{champ.nomVariable || "Aucun nom de variable"}</p>}
        </div>
      </div>

      {isActive && (
        <div className="pl-16 mt-4">
          {commonFields}
          {renderOptions()}
          <hr className="my-4" />
          <div className="flex items-center justify-end gap-4">
             <label className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
              <input
                type="checkbox"
                checked={champ.obligatoire}
                onChange={(e) => onUpdate(champ.id, { obligatoire: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Obligatoire
            </label>
            <button
              onClick={() => onDelete(champ.id)}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Supprimer la question"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Question;