package com.pfe.backend.controller;

import com.pfe.backend.model.QuestionTheme;
import com.pfe.backend.model.Theme;
import com.pfe.backend.service.ThemeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Contrôleur REST pour la gestion des thèmes et des questions associées.
 * Permet de définir les catégories de questions réutilisables dans les formulaires.
 */
@RestController
@RequestMapping("/api/themes")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ThemeController {

    private final ThemeService themeService;

    /**
     * Récupère la liste de tous les thèmes.
     *
     * @return liste des thèmes
     */
    @GetMapping
    public List<Theme> getAllThemes() {
        return themeService.findAll();
    }

    @PostMapping
    public ResponseEntity<Theme> createTheme(@RequestBody Theme theme) {
        Theme nouveauTheme = themeService.createTheme(theme);
        return new ResponseEntity<>(nouveauTheme, HttpStatus.CREATED);
    }

    /**
     * Ajoute une nouvelle question à un thème existant.
     *
     * @param themeId identifiant du thème
     * @param question question à ajouter
     * @return question créée
     */
    @PostMapping("/{themeId}/questions")
    public ResponseEntity<QuestionTheme> addQuestionToTheme(@PathVariable Long themeId, @RequestBody QuestionTheme question) {
        QuestionTheme nouvelleQuestion = themeService.addQuestion(themeId, question);
        return new ResponseEntity<>(nouvelleQuestion, HttpStatus.CREATED);
    }

    @DeleteMapping("/{themeId}/questions/{questionId}")
    public ResponseEntity<Void> deleteQuestionFromTheme(@PathVariable Long themeId, @PathVariable Long questionId) {
        try {
            themeService.deleteQuestion(themeId, questionId);
            return ResponseEntity.noContent().build();
        } catch (UnsupportedOperationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
}
