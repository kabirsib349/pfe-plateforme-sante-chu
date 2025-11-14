package com.pfe.backend.service;

import com.pfe.backend.dto.UtilisateurDto;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class UtilisateurService {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    public Utilisateur getUtilisateurById(Long id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException("Utilisateur introuvable avec l'id " + id));
    }

    /**
            * @brief Récupère tous les chercheurs enregistrés dans la base.
            * @return Liste des utilisateurs ayant le rôle "chercheur"
            * @date 06/11/2025
            */
    public List<UtilisateurDto> getChercheurs(){
        return utilisateurRepository.findByRoleName("chercheur")
                .stream()
                .map(UtilisateurDto::from)
                .collect(Collectors.toList());
    }
    /**
     * @brief Récupère tous les médecins enregistrés dans la base.
     * @return Liste des utilisateurs ayant le rôle "medecin"
     * @date 06/11/2025
     */
    public List<UtilisateurDto> getMedecins(){
        return utilisateurRepository.findByRoleName("medecin")
                .stream()
                .map(UtilisateurDto::from)
                .collect(Collectors.toList());
    }
}
