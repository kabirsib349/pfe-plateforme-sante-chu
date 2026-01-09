package com.pfe.backend.controller;

import com.pfe.backend.model.Theme;
import com.pfe.backend.service.ThemeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Contrôleur REST pour la gestion des thèmes.
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
}
