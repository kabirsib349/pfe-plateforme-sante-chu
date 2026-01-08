package com.pfe.backend.service;

import com.pfe.backend.model.QuestionTheme;
import com.pfe.backend.model.Theme;
import com.pfe.backend.repository.QuestionThemeRepository;
import com.pfe.backend.repository.ThemeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service de gestion des thèmes et des questions.
 * Permet de définir les catégories de questions réutilisables.
 */
@Service
@Transactional
@RequiredArgsConstructor
public class ThemeService {

    private final ThemeRepository themeRepository;
    private final QuestionThemeRepository questionThemeRepository;

    /**
     * Récupère tous les thèmes.
     * @return la liste de tous les thèmes.
     */
    public List<Theme> findAll() {
        return themeRepository.findAll();
    }

    /**
     * Crée un nouveau thème.
     * Les questions associées sont marquées comme personnalisées et donc supprimables.
     * @param theme le thème à créer.
     * @return le thème sauvegardé.
     */
    public Theme createTheme(Theme theme) {
        // S'assurer que les questions sont bien liées au thème
        theme.getQuestions().forEach(question -> {
            question.setTheme(theme);
            question.setEstSupprimable(true); // Toutes les questions d'un nouveau thème sont personnalisées
        });
        return themeRepository.save(theme);
    }

    /**
     * Ajoute une nouvelle question à un thème existant.
     * La question sera marquée comme supprimable.
     * @param themeId l'ID du thème.
     * @param question la question à ajouter.
     * @return la question sauvegardée.
     */
    public QuestionTheme addQuestion(Long themeId, QuestionTheme question) {
        Theme theme = themeRepository.findById(themeId)
                .orElseThrow(() -> new EntityNotFoundException("Thème non trouvé avec l'id : " + themeId));
        
        question.setTheme(theme);
        question.setEstSupprimable(true); // La nouvelle question est toujours personnalisée
        
        return questionThemeRepository.save(question);
    }

    /**
     * Supprime une question d'un thème, à condition qu'elle soit supprimable.
     * @param themeId l'ID du thème (pour vérification).
     * @param questionId l'ID de la question à supprimer.
     */
    public void deleteQuestion(Long themeId, Long questionId) {
        QuestionTheme question = questionThemeRepository.findById(questionId)
                .orElseThrow(() -> new EntityNotFoundException("Question non trouvée avec l'id : " + questionId));

        // Vérification de sécurité : la question appartient-elle bien au bon thème ?
        if (!question.getTheme().getId().equals(themeId)) {
            throw new IllegalArgumentException("La question " + questionId + " n'appartient pas au thème " + themeId);
        }

        // Règle métier cruciale : on ne peut supprimer que les questions personnalisées.
        if (!question.isEstSupprimable()) {
            throw new UnsupportedOperationException("Impossible de supprimer une question par défaut du thème.");
        }

        questionThemeRepository.delete(question);
    }
}
