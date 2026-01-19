package com.pfe.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfe.backend.model.QuestionPersonnalisee;
import com.pfe.backend.service.QuestionPersonnaliseeService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class QuestionPersonnaliseeControllerTest {

    private MockMvc mockMvc;

    @Mock
    private QuestionPersonnaliseeService questionService;

    @InjectMocks
    private QuestionPersonnaliseeController questionController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(questionController).build();
    }

    // ==================== GET /api/questions-perso ====================

    @Test
    void getMyQuestions_ShouldReturnListOfQuestions() throws Exception {
        QuestionPersonnalisee q1 = new QuestionPersonnalisee();
        q1.setId(1L);
        q1.setLabel("Question 1");

        QuestionPersonnalisee q2 = new QuestionPersonnalisee();
        q2.setId(2L);
        q2.setLabel("Question 2");

        when(questionService.getQuestionsForCurrentUser()).thenReturn(List.of(q1, q2));

        mockMvc.perform(get("/api/questions-perso"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].label").value("Question 1"))
                .andExpect(jsonPath("$[1].label").value("Question 2"));

        verify(questionService).getQuestionsForCurrentUser();
    }

    @Test
    void getMyQuestions_ShouldReturnEmptyList_WhenNoQuestions() throws Exception {
        when(questionService.getQuestionsForCurrentUser()).thenReturn(List.of());

        mockMvc.perform(get("/api/questions-perso"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // ==================== POST /api/questions-perso ====================

    @Test
    void createQuestion_ShouldReturnCreatedQuestion() throws Exception {
        QuestionPersonnalisee inputQuestion = new QuestionPersonnalisee();
        inputQuestion.setLabel("Nouvelle question");

        QuestionPersonnalisee savedQuestion = new QuestionPersonnalisee();
        savedQuestion.setId(3L);
        savedQuestion.setLabel("Nouvelle question");

        when(questionService.addQuestion(any(QuestionPersonnalisee.class))).thenReturn(savedQuestion);

        mockMvc.perform(post("/api/questions-perso")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inputQuestion)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(3))
                .andExpect(jsonPath("$.label").value("Nouvelle question"));

        verify(questionService).addQuestion(any(QuestionPersonnalisee.class));
    }

    // ==================== DELETE /api/questions-perso/{id} ====================

    @Test
    void deleteQuestion_ShouldReturnNoContent() throws Exception {
        doNothing().when(questionService).deleteQuestion(1L);

        mockMvc.perform(delete("/api/questions-perso/1"))
                .andExpect(status().isNoContent());

        verify(questionService).deleteQuestion(1L);
    }
}
