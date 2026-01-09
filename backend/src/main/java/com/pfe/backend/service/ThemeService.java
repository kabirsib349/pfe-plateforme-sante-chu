package com.pfe.backend.service;

import com.pfe.backend.model.Theme;
import com.pfe.backend.repository.ThemeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service de gestion des thèmes.
 * Les catégories de questions par défaut sont gérées par le frontend.
 */
@Service
@Transactional
@RequiredArgsConstructor
public class ThemeService {

    private final ThemeRepository themeRepository;

    /**
     * Récupère tous les thèmes.
     * @return la liste de tous les thèmes.
     */
    public List<Theme> findAll() {
        return themeRepository.findAll();
    }

    /**
     * Crée un nouveau thème.
     * @param theme le thème à créer.
     * @return le thème sauvegardé.
     */
    public Theme createTheme(Theme theme) {
        return themeRepository.save(theme);
    }
}
