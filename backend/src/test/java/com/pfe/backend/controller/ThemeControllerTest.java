package com.pfe.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfe.backend.model.Theme;
import com.pfe.backend.service.ThemeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ThemeControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ThemeService themeService;

    @InjectMocks
    private ThemeController themeController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(themeController).build();
    }

    // ==================== GET /api/themes ====================

    @Test
    void getAllThemes_ShouldReturnListOfThemes() throws Exception {
        Theme theme1 = new Theme();
        theme1.setId(1L);
        theme1.setNom("Cardiologie");

        Theme theme2 = new Theme();
        theme2.setId(2L);
        theme2.setNom("Neurologie");

        when(themeService.findAll()).thenReturn(List.of(theme1, theme2));

        mockMvc.perform(get("/api/themes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].nom").value("Cardiologie"))
                .andExpect(jsonPath("$[1].nom").value("Neurologie"));

        verify(themeService).findAll();
    }

    @Test
    void getAllThemes_ShouldReturnEmptyList_WhenNoThemes() throws Exception {
        when(themeService.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/themes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // ==================== POST /api/themes ====================

    @Test
    void createTheme_ShouldReturnCreatedTheme() throws Exception {
        Theme inputTheme = new Theme();
        inputTheme.setNom("Oncologie");

        Theme savedTheme = new Theme();
        savedTheme.setId(3L);
        savedTheme.setNom("Oncologie");

        when(themeService.createTheme(any(Theme.class))).thenReturn(savedTheme);

        mockMvc.perform(post("/api/themes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inputTheme)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(3))
                .andExpect(jsonPath("$.nom").value("Oncologie"));

        verify(themeService).createTheme(any(Theme.class));
    }
}
