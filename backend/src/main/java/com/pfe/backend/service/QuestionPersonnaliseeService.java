package com.pfe.backend.service;

import com.pfe.backend.model.QuestionPersonnalisee;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.repository.QuestionPersonnaliseeRepository;
import com.pfe.backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import com.pfe.backend.exception.ResourceNotFoundException;

@Service
@RequiredArgsConstructor
public class QuestionPersonnaliseeService {

    private final QuestionPersonnaliseeRepository questionRepository;
    private final UtilisateurRepository userRepository;

    public List<QuestionPersonnalisee> getQuestionsForCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return questionRepository.findByChercheurEmail(email);
    }

    @Transactional
    public QuestionPersonnalisee addQuestion(QuestionPersonnalisee question) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Utilisateur chercheur = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        question.setChercheur(chercheur);
        return questionRepository.save(question);
    }

    @Transactional
    public void deleteQuestion(Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        QuestionPersonnalisee question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question non trouvée"));
        
        if (!question.getChercheur().getEmail().equals(email)) {
            throw new IllegalArgumentException("Accès refusé : Vous ne pouvez supprimer que vos propres questions");
        }

        questionRepository.delete(question);
    }
}
