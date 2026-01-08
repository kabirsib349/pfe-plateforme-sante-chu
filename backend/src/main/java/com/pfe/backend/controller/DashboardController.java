package com.pfe.backend.controller;

import com.pfe.backend.model.Activite;
import com.pfe.backend.repository.ActiviteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final ActiviteRepository activiteRepository;

    @GetMapping("/activity")
    public ResponseEntity<List<Activite>> getRecentActivity(
            Principal principal,
            @RequestParam(defaultValue = "10") int limit) {
        List<Activite> activities = activiteRepository.findRecentByUserEmail(principal.getName(), limit);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/activity/all")
    public ResponseEntity<List<Activite>> getAllActivity(Principal principal) {
        List<Activite> activities = activiteRepository.findByUserEmailOrderByDateDesc(principal.getName());
        return ResponseEntity.ok(activities);
    }
}