package com.pfe.backend.controller;

import com.pfe.backend.dto.ReponseFormulaireRequest;
import com.pfe.backend.model.ReponseFormulaire;
import com.pfe.backend.service.ReponseFormulaireService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/reponses")
@RequiredArgsConstructor
public class ReponseFormulaireController {

    private final ReponseFormulaireService reponseFormulaireService;

    @PostMapping
    @PreAuthorize("hasAuthority('medecin')")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Void> sauvegarderReponses(
            @RequestBody ReponseFormulaireRequest request,
            Principal principal) {
        reponseFormulaireService.sauvegarderReponses(request, principal.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/marquer-lu/{formulaireMedecinId}")
    @PreAuthorize("hasAuthority('medecin')")
    public ResponseEntity<Void> marquerCommeLu(
            @PathVariable Long formulaireMedecinId,
            Principal principal) {
        reponseFormulaireService.marquerCommeLu(formulaireMedecinId, principal.getName());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{formulaireMedecinId}")
    public ResponseEntity<List<ReponseFormulaire>> getReponses(@PathVariable Long formulaireMedecinId) {
        List<ReponseFormulaire> reponses = reponseFormulaireService.getReponses(formulaireMedecinId);
        return ResponseEntity.ok(reponses);
    }
    
    @GetMapping("/{formulaireMedecinId}/patient/{patientIdentifier}")
    public ResponseEntity<List<ReponseFormulaire>> getReponsesByPatient(
            @PathVariable Long formulaireMedecinId,
            @PathVariable String patientIdentifier) {
        List<ReponseFormulaire> reponses = reponseFormulaireService.getReponsesByPatient(
                formulaireMedecinId, 
                patientIdentifier
        );
        return ResponseEntity.ok(reponses);
    }
    
    @GetMapping("/{formulaireMedecinId}/patients")
    public ResponseEntity<List<String>> getPatientIdentifiers(@PathVariable Long formulaireMedecinId) {
        List<String> patients = reponseFormulaireService.getPatientIdentifiers(formulaireMedecinId);
        return ResponseEntity.ok(patients);
    }
    
    @DeleteMapping("/{formulaireMedecinId}/patient/{patientIdentifier}")
    @PreAuthorize("hasAuthority('medecin')")
    public ResponseEntity<Void> supprimerReponsesPatient(
            @PathVariable Long formulaireMedecinId,
            @PathVariable String patientIdentifier,
            Principal principal) {
        reponseFormulaireService.supprimerReponsesPatient(
                formulaireMedecinId, 
                patientIdentifier, 
                principal.getName()
        );
        return ResponseEntity.ok().build();
    }
}
