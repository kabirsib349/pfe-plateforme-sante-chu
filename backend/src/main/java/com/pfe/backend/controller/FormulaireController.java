package com.pfe.backend.controller;

import com.pfe.backend.dto.FormulaireRequest;
import com.pfe.backend.model.Formulaire;
import com.pfe.backend.service.FormulaireService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/formulaires")
@RequiredArgsConstructor
public class FormulaireController {

    private final FormulaireService formulaireService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('chercheur')")
    public Formulaire createFormulaire(@RequestBody FormulaireRequest request, Principal principal) {
        // Il suffit d'appeler le service. Les exceptions seront gérées par le GlobalExceptionHandler.
        return formulaireService.createFormulaire(request, principal.getName());
    }

    @GetMapping
    public ResponseEntity<List<Formulaire>> getFormulaires(Principal principal) {
        List<Formulaire> formulaires = formulaireService.getFormulairesByChercheurEmail(principal.getName());
        return ResponseEntity.ok(formulaires);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Formulaire> getFormulaire(@PathVariable Long id) {
        Formulaire formulaire = formulaireService.getFormulaireById(id);
        return ResponseEntity.ok(formulaire);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('chercheur')")
    public ResponseEntity<Formulaire> updateFormulaire(@PathVariable Long id, @RequestBody FormulaireRequest request, Principal principal) {
        Formulaire formulaire = formulaireService.updateFormulaire(id, request, principal.getName());
        return ResponseEntity.ok(formulaire);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(Principal principal) {
        Map<String, Object> stats = formulaireService.getStatsByUser(principal.getName());
        return ResponseEntity.ok(stats);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('chercheur')")
    public void deleteFormulaire(@PathVariable Long id) {
        formulaireService.deleteFormulaire(id);
    }
}
