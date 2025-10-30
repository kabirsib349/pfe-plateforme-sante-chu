/**
 * Valide un mot de passe en fonction d'un ensemble de règles.
 * @param password Le mot de passe à valider
 * @returns Une chaine de caractères avec le message d'erreur si la validation échoue, sinon null
 */

export const validatePassword = (password: string): string | null => {
    if(password.length<12){
        return "Le mot de passe doit contenir au moins 12 caractères."
    }
    if(!/[A-Z]/.test(password)){
        return "Le mot de passe doit contenir au moins une majuscule"
    }
    if(!/[a-z]/.test(password)){
        return "Le mot de passe doit contenir au moins une minuscule"
    }
    if(!/[0-9]/.test(password)){
        return "Le mot de passe doit contenir au moins un chiffre"
    }
    if(!/[!@#$%^&*§]/.test(password)){
        return "Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*§)"
    }
    return null
};

/**
 * Valide un nom de variable selon les règles du dictionnaire de données
 * @param nomVariable Le nom de variable à valider
 * @param existingVariables Liste des noms de variables existants pour vérifier l'unicité
 * @returns Un message d'erreur si la validation échoue, sinon null
 */
export const validateNomVariable = (nomVariable: string, existingVariables: string[] = []): string | null => {
    if (!nomVariable.trim()) {
        return "Le nom de variable est obligatoire";
    }
    
    if (nomVariable.length > 25) {
        return "Le nom de variable ne doit pas dépasser 25 caractères";
    }
    
    if (!/^[A-Z0-9_]+$/.test(nomVariable)) {
        return "Le nom de variable doit contenir uniquement des majuscules, chiffres et underscores";
    }
    
    if (nomVariable !== nomVariable.toUpperCase()) {
        return "Le nom de variable doit être en majuscules";
    }
    
    if (existingVariables.includes(nomVariable)) {
        return "Ce nom de variable existe déjà";
    }
    
    return null;
};