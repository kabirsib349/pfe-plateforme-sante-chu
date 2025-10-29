package com.pfe.backend.controller;

import com.pfe.backend.dto.FormulaireRequest;
import com.pfe.backend.model.Formulaire;
import com.pfe.backend.service.FormulaireService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

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
}
