/**
 * Utilitaire pour calculer les champs calculés dans les formulaires
 */

interface CalculatedField {
  formula: string;
  requiredFields: string[];
}

/**
 * Parse l'unité d'un champ pour extraire la formule de calcul
 * Format attendu: "CALCULE:POIDS/(TAILLE^2)|POIDS,TAILLE"
 */
export const parseCalculatedField = (unite: string | undefined): CalculatedField | null => {
  if (!unite || !unite.startsWith('CALCULE:')) {
    return null;
  }

  const parts = unite.replace('CALCULE:', '').split('|');
  if (parts.length !== 2) {
    return null;
  }

  return {
    formula: parts[0],
    requiredFields: parts[1].split(',').map(f => f.trim()),
  };
};

/**
 * Évalue une formule mathématique avec les valeurs fournies
 * Exemple: "POIDS/((TAILLE/100)^2)" avec {POIDS: 70, TAILLE: 175}
 */
export const evaluateFormula = (
  formula: string,
  values: Record<string, number>
): number | null => {
  try {
    // Remplacer les variables par leurs valeurs
    let expression = formula;

    for (const [variable, value] of Object.entries(values)) {
      if (value === undefined || value === null || isNaN(value)) {
        return null;
      }
      // Remplacer la variable par sa valeur
      expression = expression.replace(new RegExp(variable, 'g'), value.toString());
    }

    // Remplacer ^ par ** pour l'exponentiation JavaScript
    expression = expression.replace(/\^/g, '**');

    // Évaluer l'expression de manière sécurisée
    // eslint-disable-next-line no-new-func
    const result = new Function(`return ${expression}`)();

    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return result;
    }

    return null;
  } catch (error) {
    console.error('Erreur lors du calcul de la formule:', error);
    return null;
  }
};

/**
 * Calcule la valeur d'un champ calculé
 */
export const calculateFieldValue = (
  unite: string | undefined,
  allResponses: Record<string, any>,
  champsMap: Map<string, string> // Map de label -> nomVariable
): number | null => {
  const calculatedField = parseCalculatedField(unite);

  if (!calculatedField) {
    return null;
  }

  // Récupérer les valeurs des champs requis
  const values: Record<string, number> = {};

  for (const requiredField of calculatedField.requiredFields) {
    // Trouver le champId correspondant à la variable
    let foundValue: number | null = null;

    for (const [champId, response] of Object.entries(allResponses)) {
      const nomVariable = champsMap.get(champId);
      if (nomVariable === requiredField) {
        const numValue = parseFloat(response);
        if (!isNaN(numValue)) {
          foundValue = numValue;
          break;
        }
      }
    }

    if (foundValue === null) {
      return null; // Valeur manquante
    }

    values[requiredField] = foundValue;
  }

  return evaluateFormula(calculatedField.formula, values);
};

/**
 * Formate un nombre calculé pour l'affichage
 */
export const formatCalculatedValue = (value: number | null, decimals: number = 2): string => {
  if (value === null) {
    return '';
  }
  return value.toFixed(decimals);
};
