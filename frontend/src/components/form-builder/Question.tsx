'use client';

import React, { useState, useEffect } from 'react';
import { TrashIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { validateNomVariable } from '@/src/lib/validation';
import {
  VariableNameInput,
  NumberOptions,
  ChoiceOptions,
  DateOptions,
  CalculatedOptions
} from './question-options';

// Ce type est maintenant aligné avec l'énumération TypeChamp du backend
export type TypeChamp = 'texte' | 'nombre' | 'choix_multiple' | 'choix_unique' | 'date' | 'calcule';

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
  options?: Option[];
  unite?: string;
  valeurMin?: number;
  valeurMax?: number;
  dateMin?: string;
  dateMax?: string;
  formuleCalcul?: string;
  champsRequis?: string[];
}

interface QuestionProps {
  champ: ChampFormulaire;
  index: number;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ChampFormulaire>) => void;
  isActive: boolean;
  existingVariables?: string[];
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetId: string) => void;
}

/**
 * Component for rendering and editing a single form question.
 * Refactored to use sub-components for type-specific options.
 */
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

  const renderTypeOptions = () => {
    switch (champ.type) {
      case 'nombre':
        return (
          <NumberOptions
            valeurMin={champ.valeurMin}
            valeurMax={champ.valeurMax}
            unite={champ.unite}
            onValeurMinChange={(v) => onUpdate(champ.id, { valeurMin: v })}
            onValeurMaxChange={(v) => onUpdate(champ.id, { valeurMax: v })}
            onUniteChange={(v) => onUpdate(champ.id, { unite: v })}
          />
        );
      case 'choix_multiple':
        return (
          <ChoiceOptions
            options={champ.options || []}
            onOptionsChange={(opts) => onUpdate(champ.id, { options: opts })}
            label="Options de réponse"
          />
        );
      case 'choix_unique':
        return (
          <ChoiceOptions
            options={champ.options || []}
            onOptionsChange={(opts) => onUpdate(champ.id, { options: opts })}
            label="Options de réponse (choix unique)"
          />
        );
      case 'date':
        return (
          <DateOptions
            dateMin={champ.dateMin}
            dateMax={champ.dateMax}
            onDateMinChange={(v) => onUpdate(champ.id, { dateMin: v })}
            onDateMaxChange={(v) => onUpdate(champ.id, { dateMax: v })}
          />
        );
      case 'calcule':
        return (
          <CalculatedOptions
            formuleCalcul={champ.formuleCalcul}
            champsRequis={champ.champsRequis}
            onFormuleChange={(v) => onUpdate(champ.id, { formuleCalcul: v })}
            onChampsRequisChange={(v) => onUpdate(champ.id, { champsRequis: v })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`border rounded-lg p-4 transition-all duration-200 ${isDragging ? 'opacity-50 transform rotate-2' : ''
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
          {/* Variable name input */}
          <VariableNameInput
            value={champ.nomVariable}
            onChange={(v) => onUpdate(champ.id, { nomVariable: v })}
            validationError={validationError}
          />

          {/* Type-specific options */}
          {renderTypeOptions()}

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