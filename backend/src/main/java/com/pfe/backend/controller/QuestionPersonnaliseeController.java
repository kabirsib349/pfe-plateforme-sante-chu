package com.pfe.backend.controller;

import com.pfe.backend.model.QuestionPersonnalisee;
import com.pfe.backend.service.QuestionPersonnaliseeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions-perso")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // A ajuster selon la conf de sécurité
public class QuestionPersonnaliseeController {

    private final QuestionPersonnaliseeService questionService;

    @GetMapping
    public List<QuestionPersonnalisee> getMyQuestions() {
        return questionService.getQuestionsForCurrentUser();
    }

    @PostMapping
    public ResponseEntity<QuestionPersonnalisee> createQuestion(@RequestBody QuestionPersonnalisee question) {
        return ResponseEntity.ok(questionService.addQuestion(question));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }
}
