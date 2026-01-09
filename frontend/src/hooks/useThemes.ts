import { useState, useEffect } from "react";
import { themesMedicaux, ThemeMedical, ChampTemplate } from "@/src/constants/themes";
import { QuestionPersonnalisee } from "@/src/types";
import { getCustomQuestions, addCustomQuestion, deleteCustomQuestion } from "@/src/lib/api";
import { useToast } from "@/src/hooks/useToast";
import { useAuth } from "@/src/hooks/useAuth";
import { TypeChamp } from "@/src/components/form-builder/Question";

export const useThemes = () => {
    const { token } = useAuth();
    const { showToast } = useToast();
    const [themes, setThemes] = useState<ThemeMedical[]>(themesMedicaux);
    const [customQuestions, setCustomQuestions] = useState<QuestionPersonnalisee[]>([]);
    const [loading, setLoading] = useState(false);

    // Charger les questions personnalisées au montage
    useEffect(() => {
        if (token) {
            loadCustomQuestions();
        }
    }, [token]);

    // Fusionner les questions personnalisées avec les thèmes existants
    useEffect(() => {
        if (customQuestions.length === 0) {
            setThemes(themesMedicaux);
            return;
        }

        const mergedThemes = themesMedicaux.map(theme => {
            // Trouver les questions perso pour ce thème
            const themeQuestions = customQuestions.filter(q => q.themeNom === theme.nom);

            if (themeQuestions.length === 0) return theme;

            // Convertir QuestionPersonnalisee en ChampTemplate
            const customChamps: ChampTemplate[] = themeQuestions.map(q => ({
                type: q.type as TypeChamp,
                question: q.label,
                nomVariable: q.nomVariable,
                obligatoire: false, // Par défaut
                options: q.options ? JSON.parse(q.options) : undefined,
                id: q.id, // Garder l'ID pour la suppression potentielle
                estPerso: true
            }));

            return {
                ...theme,
                champs: [...theme.champs, ...customChamps]
            };
        });

        setThemes(mergedThemes);
    }, [customQuestions]);

    const loadCustomQuestions = async () => {
        try {
            setLoading(true);
            if (!token) return;
            const questions = await getCustomQuestions(token);
            setCustomQuestions(questions);
        } catch (error) {
            console.error("Erreur chargement questions perso:", error);
            showToast("Impossible de charger vos questions personnalisées", "error");
        } finally {
            setLoading(false);
        }
    };

    const addQuestion = async (question: QuestionPersonnalisee) => {
        try {
            if (!token) return;
            const newQuestion = await addCustomQuestion(token, question);
            setCustomQuestions([...customQuestions, newQuestion]);
            showToast("Question personnalisée ajoutée", "success");
            return newQuestion;
        } catch (error) {
            console.error("Erreur ajout question:", error);
            showToast("Erreur lors de l'ajout de la question", "error");
            throw error;
        }
    };

    const deleteQuestion = async (id: number) => {
        try {
            if (!token) return;
            await deleteCustomQuestion(token, id);
            setCustomQuestions(customQuestions.filter(q => q.id !== id));
            showToast("Question personnalisée supprimée", "success");
        } catch (error) {
            console.error("Erreur suppression question:", error);
            showToast("Erreur lors de la suppression de la question", "error");
            throw error;
        }
    };

    return {
        themes,
        loading,
        addQuestion,
        deleteQuestion,
        refresh: loadCustomQuestions,
        customQuestions
    };
};
