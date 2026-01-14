import React from 'react';
import { Champ } from '@/src/types';
import { ChampTexte } from './ChampTexte';
import { ChampNombre } from './ChampNombre';
import { ChampDate } from './ChampDate';
import { ChampChoixUnique } from './ChampChoixUnique';
import { ChampChoixMultiple } from './ChampChoixMultiple';
import { ChampCalcule } from './ChampCalcule';
import { parseCalculatedField } from '@/src/lib/formulaCalculator';

/**
 * Props for the ChampRenderer component.
 */
export interface ChampRendererProps {
    /** The field definition */
    champ: Champ;
    /** Current field value */
    value: any;
    /** Change handler */
    onChange?: (value: any) => void;
    /** Whether the field is read-only */
    readOnly?: boolean;
    /** Field index for display */
    index?: number;
    /** Whether to show the label */
    showLabel?: boolean;
}

/**
 * Universal field renderer that selects the appropriate component based on field type.
 * Centralizes the switch logic found in remplir/page.tsx and PatientDetailsModal.tsx.
 * 
 * @example
 * ```tsx
 * <ChampRenderer
 *   champ={field}
 *   value={reponses[field.idChamp]}
 *   onChange={(val) => handleChange(field.idChamp, val)}
 *   index={0}
 * />
 * ```
 */
export const ChampRenderer: React.FC<ChampRendererProps> = ({
    champ,
    value,
    onChange,
    readOnly = false,
    index,
    showLabel = true
}) => {
    const champType = champ.type?.toUpperCase();
    const champId = champ.idChamp?.toString() || '';

    // Parse options for choice fields
    const options = champ.listeValeur?.options || [];

    // Check if this is a calculated text field
    const calculatedField = parseCalculatedField(champ.unite);

    const renderField = () => {
        // Handle calculated text fields (stored in unite field)
        if (champType === 'TEXTE' && calculatedField) {
            return (
                <ChampCalcule
                    value={value}
                    formula={calculatedField.formula}
                    champsRequis={calculatedField.requiredFields}
                />
            );
        }

        switch (champType) {
            case 'TEXTE':
                return (
                    <ChampTexte
                        value={value}
                        onChange={onChange}
                        readOnly={readOnly}
                        required={champ.obligatoire}
                    />
                );

            case 'NOMBRE':
                return (
                    <ChampNombre
                        value={value}
                        onChange={onChange}
                        readOnly={readOnly}
                        required={champ.obligatoire}
                        valeurMin={champ.valeurMin}
                        valeurMax={champ.valeurMax}
                        unite={champ.unite}
                    />
                );

            case 'DATE':
                return (
                    <ChampDate
                        value={value}
                        onChange={onChange}
                        readOnly={readOnly}
                        required={champ.obligatoire}
                        dateMin={champ.dateMin}
                        dateMax={champ.dateMax}
                    />
                );

            case 'CHOIX_UNIQUE':
            case 'RADIO':
                return (
                    <ChampChoixUnique
                        champId={champId}
                        options={options}
                        value={value}
                        onChange={onChange}
                        readOnly={readOnly}
                        required={champ.obligatoire}
                    />
                );

            case 'CHOIX_MULTIPLE':
            case 'CASE_A_COCHER':
            case 'CHECKBOX':
                return (
                    <ChampChoixMultiple
                        champId={champId}
                        options={options}
                        value={value}
                        onChange={onChange}
                        readOnly={readOnly}
                        required={champ.obligatoire}
                    />
                );

            case 'CALCULE':
                const uniteData = champ.unite?.split(':')[1] || '';
                const [formule, champsRequisStr] = uniteData.split('|');
                const champsRequis = champsRequisStr?.split(',') || [];

                return (
                    <ChampCalcule
                        value={value}
                        formula={formule}
                        champsRequis={champsRequis}
                    />
                );

            default:
                return (
                    <div className="text-gray-500 italic">
                        Type de champ non supporté: {champType}
                    </div>
                );
        }
    };

    if (!showLabel) {
        return renderField();
    }

    return (
        <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
            <label className="block text-sm font-medium text-gray-900 mb-2">
                {index !== undefined && `${index + 1}. `}{champ.label}
                {champ.obligatoire && <span className="text-red-600 ml-1">*</span>}
            </label>
            {renderField()}
        </div>
    );
};

// Re-export individual components for direct use
export { ChampTexte } from './ChampTexte';
export { ChampNombre } from './ChampNombre';
export { ChampDate } from './ChampDate';
export { ChampChoixUnique } from './ChampChoixUnique';
export { ChampChoixMultiple } from './ChampChoixMultiple';
export { ChampCalcule } from './ChampCalcule';
