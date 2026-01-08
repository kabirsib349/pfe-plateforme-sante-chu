package com.pfe.backend.controller;

import com.pfe.backend.dto.EnvoiFormulaireRequest;
import com.pfe.backend.dto.FormulaireMedecinCreatedResponse;
import com.pfe.backend.dto.FormulaireEnvoyeResponse;
import com.pfe.backend.dto.FormulaireRecuResponse;
import com.pfe.backend.dto.FormulaireRecuResponse;
import com.pfe.backend.dto.FormulaireRequest;
import com.pfe.backend.dto.FormulaireResponse;
import com.pfe.backend.model.Formulaire;
import com.pfe.backend.model.FormulaireMedecin;
import com.pfe.backend.service.FormulaireMedecinService;
import com.pfe.backend.service.FormulaireService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Contrôleur REST pour la gestion des formulaires.
 * Permet aux chercheurs de créer, modifier, lister et supprimer des formulaires.
 */
@RestController
@RequestMapping("/api/formulaires")
@RequiredArgsConstructor
public class FormulaireController {

    private final FormulaireService formulaireService;
    private final FormulaireMedecinService formulaireMedecinService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('chercheur')")
    public FormulaireResponse createFormulaire(@Valid @RequestBody FormulaireRequest request, Principal principal) {
        Formulaire formulaire = formulaireService.createFormulaire(request, principal.getName());
        return FormulaireResponse.fromEntity(formulaire);
    }

    @PostMapping("/{formulaireId}/envoyer")
    @PreAuthorize("hasAuthority('chercheur')")
    public ResponseEntity<Void> envoyerFormulaire(@PathVariable Long formulaireId,@RequestBody EnvoiFormulaireRequest request, Principal principal) {
        formulaireMedecinService.envoyerFormulaire(formulaireId, request.getEmailMedecin(), principal.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{formulaireId}/create-envoi")
    @PreAuthorize("hasAuthority('chercheur')")
    public ResponseEntity<FormulaireMedecinCreatedResponse> createEnvoiParChercheur(@PathVariable Long formulaireId, Principal principal) {
        FormulaireMedecin fm = formulaireMedecinService.createEnvoiParChercheur(formulaireId, principal.getName());
        String dateStr = fm.getDateEnvoi() != null ? fm.getDateEnvoi().toString() : null;
        FormulaireMedecinCreatedResponse dto = new FormulaireMedecinCreatedResponse(
                fm.getId(),
                fm.getFormulaire() != null ? fm.getFormulaire().getIdFormulaire() : null,
                dateStr,
                null
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping
    public ResponseEntity<List<FormulaireResponse>> getFormulaires(Principal principal) {
        List<Formulaire> formulaires = formulaireService.getFormulairesByChercheurEmail(principal.getName());
        List<FormulaireResponse> response = formulaires.stream()
                .map(FormulaireResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/recus")
    @PreAuthorize("hasAuthority('medecin')")
    public ResponseEntity<List<FormulaireRecuResponse>> getFormulairesRecus(Principal principal) {
        List<FormulaireMedecin> formulairesRecus = formulaireMedecinService.getFormulairesRecus(principal.getName());
        List<FormulaireRecuResponse> response = formulairesRecus.stream()
                .map(FormulaireRecuResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/recus/{id}")
    @PreAuthorize("hasAuthority('medecin')")
    public ResponseEntity<FormulaireResponse> getFormulaireRecuById(@PathVariable Long id, Principal principal) {
        Formulaire formulaire = formulaireMedecinService.getFormulairePourRemplissage(id);
        return ResponseEntity.ok(FormulaireResponse.fromEntity(formulaire));
    }

    @GetMapping("/envoyes")
    @PreAuthorize("hasAuthority('chercheur')")
    public ResponseEntity<List<FormulaireEnvoyeResponse>> getFormulairesEnvoyes(Principal principal) {
        List<FormulaireMedecin> formulairesEnvoyes = formulaireMedecinService.getFormulairesEnvoyes(principal.getName());
        List<FormulaireEnvoyeResponse> response = formulairesEnvoyes.stream()
                .map(FormulaireEnvoyeResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FormulaireResponse> getFormulaire(@PathVariable Long id) {
        Formulaire formulaire = formulaireService.getFormulaireById(id);
        return ResponseEntity.ok(FormulaireResponse.fromEntity(formulaire));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('chercheur')")
    public ResponseEntity<FormulaireResponse> updateFormulaire(@PathVariable Long id, @Valid @RequestBody FormulaireRequest request, Principal principal) {
        Formulaire formulaire = formulaireService.updateFormulaire(id, request, principal.getName());
        return ResponseEntity.ok(FormulaireResponse.fromEntity(formulaire));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(Principal principal) {
        Map<String, Object> stats = formulaireService.getStatsByUser(principal.getName());
        return ResponseEntity.ok(stats);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('chercheur')")
    public void deleteFormulaire(@PathVariable Long id, Principal principal) {
        formulaireService.deleteFormulaire(id, principal.getName());
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
