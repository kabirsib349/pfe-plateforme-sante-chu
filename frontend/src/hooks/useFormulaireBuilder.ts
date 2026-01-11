import { useState, useCallback } from "react";
import { Champ, TypeChamp, OptionValeur } from "@/src/types";
import { ThemeMedical, ChampTemplate } from "@/src/constants/themes";

// Extension locale pour le builder si nécessaire, sinon on utilise Champ
export type ChampBuilder = Champ & {
    // Ajouts spécifiques UI si besoin, pour l'instant Champ couvre l'essentiel
    // idChamp est optionnel dans Champ, mais ici on manipule souvent un 'id' string (temp)
    id: string; // On force la présence d'un ID (souvent généré temporairement)
};

/**
 * Hook personnalisé pour gérer la logique de construction de formulaire.
 * Gère l'état des champs, l'historique (undo), le drag & drop et la validation.
 * Agnostique de l'opération API (Création ou Mise à jour).
 * 
 * @param initialChamps Liste initiale des champs (pour l'édition)
 */
export const useFormulaireBuilder = (initialChamps: ChampBuilder[] = []) => {
    const [champs, setChamps] = useState<ChampBuilder[]>(initialChamps);
    const [activeChampId, setActiveChampId] = useState<string | null>(null);
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [historique, setHistorique] = useState<ChampBuilder[][]>([]);

    // -- BASIC ACTIONS --

    /**
     * Ajoute un nouveau champ au formulaire.
     * @param type Le type de champ à ajouter (TEXTE, NOMBRE, DATE, etc.)
     */
    const ajouterChamp = useCallback((type: TypeChamp) => {
        const nouveauChamp: ChampBuilder = {
            id: Date.now().toString(),
            label: '', // Sera mappé vers 'question' dans l'UI
            type,
            obligatoire: false,
            options: type === TypeChamp.CHOIX_MULTIPLE || type === TypeChamp.CHOIX_UNIQUE
                ? [{ libelle: 'Oui', valeur: '1' }, { libelle: 'Non', valeur: '0' }]
                : undefined,
            unite: type === TypeChamp.NOMBRE ? '' : undefined,
            // Note: mapping 'question' <-> 'label' à gérer dans l'UI ou adaptateur
        } as ChampBuilder;

        // Adaptations spécifiques (legacy mapping du composant Page)
        // Le composant page actuel utilise 'question' au lieu de 'label' et 'nomVariable'
        // Je vais adapter le hook pour supporter ce que le composant attend ou refactorer le composant.
        // Pour l'instant, je structure pour être compatible avec les types existants, 
        // mais le composant Question attend peut-être 'question'.
        // On va utiliser 'any' ou étendre le type pour la transition.

        // Pour ne pas casser le composant View, je vais retourner des objets qui matchent ce qu'il attend.
        // Mais idéalement on devrait utiliser le type Champ strict.

        setChamps(prev => {
            const newChamps = [...prev, {
                ...nouveauChamp,
                question: '',
                nomVariable: '',
                formuleCalcul: type === TypeChamp.CALCULE ? 'POIDS/(TAILLE^2)' : undefined,
                champsRequis: type === TypeChamp.CALCULE ? ['POIDS', 'TAILLE'] : undefined
            } as any]; // Cast as any pour flexibilité temporaire pendant refactor UI
            setActiveChampId(nouveauChamp.id);
            return newChamps;
        });
    }, []);

    const supprimerChamp = useCallback((id: string) => {
        setChamps(prev => prev.filter(c => c.id !== id));
    }, []);

    const modifierChamp = useCallback((id: string, modifications: Partial<ChampBuilder>) => {
        setChamps(prev => prev.map(c => c.id === id ? { ...c, ...modifications } : c));
    }, []);

    // -- THEMES --

    /**
     * Ajoute tous les champs d'un thème médical pré-défini.
     * Enregistre l'état actuel dans l'historique avant modification.
     * @param theme Le thème sélectionné
     * @returns La liste des IDs des nouveaux champs ajoutés (pour l'animation)
     */
    const ajouterTheme = useCallback((theme: ThemeMedical) => {
        setHistorique(prev => [...prev, champs]); // Save history

        const nouveauxChamps = theme.champs.map((champ: ChampTemplate) => ({
            // Start with all properties from the template
            ...champ,
            // Add builder-specific properties
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            label: champ.question,
            type: champ.type.toUpperCase(),
            categorie: theme.nom,
            // Legacy props support (keep original values)
            question: champ.question,
            nomVariable: champ.nomVariable,
            // Explicitly preserve all optional fields from template
            options: champ.options || undefined,
            unite: champ.unite || undefined,
            valeurMin: champ.valeurMin,
            valeurMax: champ.valeurMax,
            formuleCalcul: champ.formuleCalcul || undefined,
            champsRequis: champ.champsRequis || undefined,
            obligatoire: champ.obligatoire
        }));

        // Cast for compatibility
        setChamps(prev => [...prev, ...nouveauxChamps as any]);
        return nouveauxChamps.map((c: any) => c.id); // Retourne les IDs pour animation
    }, [champs]);

    // -- HISTORY --

    const annulerDernierAjout = useCallback(() => {
        if (historique.length > 0) {
            const dernierEtat = historique[historique.length - 1];
            setChamps(dernierEtat);
            setHistorique(prev => prev.slice(0, -1));
            return true;
        }
        return false;
    }, [historique]);

    const toutSupprimer = useCallback(() => {
        if (champs.length > 0) {
            setHistorique(prev => [...prev, champs]);
            setChamps([]);
        }
    }, [champs]);

    // -- DRAG & DROP --

    /**
     * Commence l'opération de glisser-déposer.
     */
    const handleDragStart = useCallback((id: string) => {
        setDraggedItemId(id);
    }, []);

    const handleDragEnd = useCallback(() => {
        setDraggedItemId(null);
    }, []);

    const handleDrop = useCallback((targetId: string) => {
        setChamps(prev => {
            if (!draggedItemId || draggedItemId === targetId) return prev;

            const currentIndex = prev.findIndex(c => c.id === draggedItemId);
            const targetIndex = prev.findIndex(c => c.id === targetId);

            if (currentIndex === -1 || targetIndex === -1) return prev;

            const newArr = [...prev];
            const [item] = newArr.splice(currentIndex, 1);
            newArr.splice(targetIndex, 0, item);
            return newArr;
        });
        setDraggedItemId(null);
    }, [draggedItemId]);

    // -- VALIDATION --

    /**
     * Valide les données du formulaire avant soumission.
     * @param titreEtude Le titre de l'étude (obligatoire)
     * @returns Liste des messages d'erreur (tableau vide si valide)
     */
    const validateForm = useCallback((titreEtude: string) => {
        const errors: string[] = [];
        if (!titreEtude.trim()) errors.push("Titre de l'étude requis");

        const champsInvalides = champs.filter((c: any) => !c.question?.trim() || !c.nomVariable?.trim());
        if (champsInvalides.length > 0) {
            errors.push(`${champsInvalides.length} question(s) incomplètes`);
        }
        return errors;
    }, [champs]);

    return {
        champs,
        activeChampId,
        draggedItemId,
        historique,
        // Actions
        setChamps, // Rarement utilisé direct, mais utile pour init
        setActiveChampId,
        ajouterChamp,
        supprimerChamp,
        modifierChamp,
        ajouterTheme,
        annulerDernierAjout,
        toutSupprimer,
        // DnD
        handleDragStart,
        handleDragEnd,
        handleDrop,
        // Validation
        validateForm
    };
};
