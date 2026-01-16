package com.pfe.backend.service;

import com.pfe.backend.dto.UtilisateurDto;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;

    public Utilisateur getUtilisateurById(Long id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException("Utilisateur introuvable avec l'id " + id));
    }

    /**
     * Récupère tous les chercheurs enregistrés dans la base.
     *
     * @return liste des utilisateurs ayant le rôle "chercheur"
     */
    public List<UtilisateurDto> getChercheurs(){
        return utilisateurRepository.findByRoleName("chercheur")
                .stream()
                .map(UtilisateurDto::from)
                .toList();
    }
    /**
     * Récupère tous les médecins enregistrés dans la base.
     *
     * @return liste des utilisateurs ayant le rôle "medecin"
     */
    public List<UtilisateurDto> getMedecins(){
        return utilisateurRepository.findByRoleName("medecin")
                .stream()
                .map(UtilisateurDto::from)
                .toList();
    }
}
