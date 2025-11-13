package com.pfe.backend.controller;

import com.pfe.backend.dto.EnvoiFormulaireRequest;
import com.pfe.backend.dto.FormulaireRequest;
import com.pfe.backend.model.Formulaire;
import com.pfe.backend.service.FormulaireMedecinService;
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
    private final FormulaireMedecinService formulaireMedecinService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('chercheur')")
    public Formulaire createFormulaire(@RequestBody FormulaireRequest request, Principal principal) {
        // Il suffit d'appeler le service. Les exceptions seront gérées par le GlobalExceptionHandler.
        return formulaireService.createFormulaire(request, principal.getName());
    }

    @PostMapping("/{formulaireId}/envoyer")
    @PreAuthorize("hasAuthority('chercheur')")
    public ResponseEntity<Void> envoyerFormulaire(@PathVariable Long formulaireId,@RequestBody EnvoiFormulaireRequest request, Principal principal) {
        formulaireMedecinService.envoyerFormulaire(formulaireId, request.getEmailMedecin(), principal.getName());
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<Formulaire>> getFormulaires(Principal principal) {
        List<Formulaire> formulaires = formulaireService.getFormulairesByChercheurEmail(principal.getName());
        return ResponseEntity.ok(formulaires);
    }

    @GetMapping("/recus")
    @PreAuthorize("hasAuthority('medecin')")
    public ResponseEntity<List<com.pfe.backend.dto.FormulaireRecuResponse>> getFormulairesRecus(Principal principal) {
        List<com.pfe.backend.model.FormulaireMedecin> formulairesRecus = formulaireMedecinService.getFormulairesRecus(principal.getName());
        List<com.pfe.backend.dto.FormulaireRecuResponse> response = formulairesRecus.stream()
                .map(com.pfe.backend.dto.FormulaireRecuResponse::fromEntity)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/recus/{id}")
    @PreAuthorize("hasAuthority('medecin')")
    public ResponseEntity<Formulaire> getFormulaireRecuById(@PathVariable Long id, Principal principal) {
        // L'autorisation est déjà vérifiée par PreAuthorize, mais on pourrait ajouter une vérification
        // supplémentaire pour s'assurer que le médecin qui demande est bien celui à qui le formulaire est assigné.
        // Pour l'instant, on fait confiance à l'ID unique de FormulaireMedecin.
        Formulaire formulaire = formulaireMedecinService.getFormulairePourRemplissage(id);
        return ResponseEntity.ok(formulaire);
    }

    @GetMapping("/envoyes")
    @PreAuthorize("hasAuthority('chercheur')")
    public ResponseEntity<List<com.pfe.backend.dto.FormulaireEnvoyeResponse>> getFormulairesEnvoyes(Principal principal) {
        List<com.pfe.backend.model.FormulaireMedecin> formulairesEnvoyes = formulaireMedecinService.getFormulairesEnvoyes(principal.getName());
        List<com.pfe.backend.dto.FormulaireEnvoyeResponse> response = formulairesEnvoyes.stream()
                .map(com.pfe.backend.dto.FormulaireEnvoyeResponse::fromEntity)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(response);
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

    @DeleteMapping("/recus/{formulaireMedecinId}")
    @PreAuthorize("hasAuthority('medecin')")
    public ResponseEntity<Void> masquerPourMedecin(
            @PathVariable Long formulaireMedecinId,
            Principal principal) {
        formulaireMedecinService.masquerPourMedecin(formulaireMedecinId, principal.getName());
        return ResponseEntity.ok().build();
    }
}
