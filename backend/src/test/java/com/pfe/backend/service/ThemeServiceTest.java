package com.pfe.backend.service;

import com.pfe.backend.model.Theme;
import com.pfe.backend.repository.ThemeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ThemeServiceTest {

    @Mock
    private ThemeRepository themeRepository;

    @InjectMocks
    private ThemeService themeService;

    @Test
    void findAll_ShouldReturnAllThemes() {
        // Arrange
        Theme theme1 = new Theme();
        theme1.setId(1L);
        theme1.setNom("Cardiologie");

        Theme theme2 = new Theme();
        theme2.setId(2L);
        theme2.setNom("Neurologie");

        when(themeRepository.findAll()).thenReturn(List.of(theme1, theme2));

        // Act
        List<Theme> result = themeService.findAll();

        // Assert
        assertEquals(2, result.size());
        verify(themeRepository).findAll();
    }

    @Test
    void findAll_ShouldReturnEmptyList_WhenNoThemes() {
        // Arrange
        when(themeRepository.findAll()).thenReturn(Collections.emptyList());

        // Act
        List<Theme> result = themeService.findAll();

        // Assert
        assertTrue(result.isEmpty());
    }

    @Test
    void createTheme_ShouldSaveAndReturnTheme() {
        // Arrange
        Theme theme = new Theme();
        theme.setNom("Pneumologie");

        Theme savedTheme = new Theme();
        savedTheme.setId(1L);
        savedTheme.setNom("Pneumologie");

        when(themeRepository.save(any(Theme.class))).thenReturn(savedTheme);

        // Act
        Theme result = themeService.createTheme(theme);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Pneumologie", result.getNom());
        verify(themeRepository).save(theme);
    }
}
