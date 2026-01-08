package com.pfe.backend.controller;

import com.pfe.backend.model.QuestionTheme;
import com.pfe.backend.model.Theme;
import com.pfe.backend.service.ThemeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/themes")
@CrossOrigin(origins = "*") // A ajuster pour plus de sécurité en production
public class ThemeController {

    @Autowired
    private ThemeService themeService;

    // GET /api/themes -> Récupérer tous les thèmes
    @GetMapping
    public List<Theme> getAllThemes() {
        return themeService.findAll();
    }

    // POST /api/themes -> Créer un nouveau thème
    @PostMapping
    public ResponseEntity<Theme> createTheme(@RequestBody Theme theme) {
        Theme nouveauTheme = themeService.createTheme(theme);
        return new ResponseEntity<>(nouveauTheme, HttpStatus.CREATED);
    }

    // POST /api/themes/{id}/questions -> Ajouter une question à un thème
    @PostMapping("/{themeId}/questions")
    public ResponseEntity<QuestionTheme> addQuestionToTheme(@PathVariable Long themeId, @RequestBody QuestionTheme question) {
        QuestionTheme nouvelleQuestion = themeService.addQuestion(themeId, question);
        return new ResponseEntity<>(nouvelleQuestion, HttpStatus.CREATED);
    }

    // DELETE /api/themes/{themeId}/questions/{questionId} -> Supprimer une question d'un thème
    @DeleteMapping("/{themeId}/questions/{questionId}")
    public ResponseEntity<Void> deleteQuestionFromTheme(@PathVariable Long themeId, @PathVariable Long questionId) {
        try {
            themeService.deleteQuestion(themeId, questionId);
            return ResponseEntity.noContent().build(); // Succès, pas de contenu à retourner
        } catch (UnsupportedOperationException e) {
            // Tentative de suppression d'une question par défaut
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
}
