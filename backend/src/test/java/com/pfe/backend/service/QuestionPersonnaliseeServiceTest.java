package com.pfe.backend.service;

import com.pfe.backend.exception.ResourceNotFoundException;
import com.pfe.backend.model.QuestionPersonnalisee;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.repository.QuestionPersonnaliseeRepository;
import com.pfe.backend.repository.UtilisateurRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuestionPersonnaliseeServiceTest {

    @Mock
    private QuestionPersonnaliseeRepository questionRepository;

    @Mock
    private UtilisateurRepository userRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private QuestionPersonnaliseeService questionPersonnaliseeService;

    private static final String TEST_EMAIL = "chercheur@test.com";

    @BeforeEach
    void setUp() {
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn(TEST_EMAIL);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getQuestionsForCurrentUser_ShouldReturnQuestions() {
        // Arrange
        QuestionPersonnalisee question1 = new QuestionPersonnalisee();
        question1.setId(1L);
        question1.setLabel("Question 1");

        when(questionRepository.findByChercheurEmail(TEST_EMAIL)).thenReturn(List.of(question1));

        // Act
        List<QuestionPersonnalisee> result = questionPersonnaliseeService.getQuestionsForCurrentUser();

        // Assert
        assertEquals(1, result.size());
        assertEquals("Question 1", result.get(0).getLabel());
        verify(questionRepository).findByChercheurEmail(TEST_EMAIL);
    }

    @Test
    void getQuestionsForCurrentUser_ShouldReturnEmptyList_WhenNoQuestions() {
        // Arrange
        when(questionRepository.findByChercheurEmail(TEST_EMAIL)).thenReturn(Collections.emptyList());

        // Act
        List<QuestionPersonnalisee> result = questionPersonnaliseeService.getQuestionsForCurrentUser();

        // Assert
        assertTrue(result.isEmpty());
    }

    @Test
    void addQuestion_ShouldSaveQuestion_WhenUserExists() {
        // Arrange
        Utilisateur chercheur = new Utilisateur();
        chercheur.setId(1L);
        chercheur.setEmail(TEST_EMAIL);

        QuestionPersonnalisee question = new QuestionPersonnalisee();
        question.setLabel("Nouvelle Question");

        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(chercheur));
        when(questionRepository.save(any(QuestionPersonnalisee.class))).thenAnswer(i -> {
            QuestionPersonnalisee q = (QuestionPersonnalisee) i.getArguments()[0];
            q.setId(1L);
            return q;
        });

        // Act
        QuestionPersonnalisee result = questionPersonnaliseeService.addQuestion(question);

        // Assert
        assertNotNull(result);
        assertEquals(chercheur, result.getChercheur());
        assertEquals("Nouvelle Question", result.getLabel());
        verify(questionRepository).save(question);
    }

    @Test
    void addQuestion_ShouldThrowException_WhenUserNotFound() {
        // Arrange
        QuestionPersonnalisee question = new QuestionPersonnalisee();
        question.setLabel("Test Question");

        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, 
            () -> questionPersonnaliseeService.addQuestion(question));
        verify(questionRepository, never()).save(any(QuestionPersonnalisee.class));
    }

    @Test
    void deleteQuestion_ShouldDelete_WhenUserIsOwner() {
        // Arrange
        Long questionId = 1L;

        Utilisateur chercheur = new Utilisateur();
        chercheur.setId(1L);
        chercheur.setEmail(TEST_EMAIL);

        QuestionPersonnalisee question = new QuestionPersonnalisee();
        question.setId(questionId);
        question.setChercheur(chercheur);

        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));

        // Act
        questionPersonnaliseeService.deleteQuestion(questionId);

        // Assert
        verify(questionRepository).delete(question);
    }

    @Test
    void deleteQuestion_ShouldThrowException_WhenNotOwner() {
        // Arrange
        Long questionId = 1L;

        Utilisateur otherUser = new Utilisateur();
        otherUser.setId(2L);
        otherUser.setEmail("other@test.com");

        QuestionPersonnalisee question = new QuestionPersonnalisee();
        question.setId(questionId);
        question.setChercheur(otherUser);

        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> questionPersonnaliseeService.deleteQuestion(questionId));
        verify(questionRepository, never()).delete(any(QuestionPersonnalisee.class));
    }

    @Test
    void deleteQuestion_ShouldThrowException_WhenQuestionNotFound() {
        // Arrange
        Long questionId = 999L;

        when(questionRepository.findById(questionId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, 
            () -> questionPersonnaliseeService.deleteQuestion(questionId));
    }
}
