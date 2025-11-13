package com.pfe.backend.repository;

import com.pfe.backend.model.FormulaireMedecin;
import com.pfe.backend.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FormulaireMedecinRepository extends JpaRepository<FormulaireMedecin, Long> {

    //Récupération des formulaires envoyés à un médecin (non masqués pour lui)
    @Query("SELECT DISTINCT fm FROM FormulaireMedecin fm " +
            "JOIN FETCH fm.formulaire f " +
            "LEFT JOIN FETCH f.etude " +
            "LEFT JOIN FETCH f.champs " +
            "JOIN FETCH fm.chercheur " +
            "WHERE fm.medecin.email = :emailMedecin " +
            "AND fm.masquePourMedecin = false " +
            "ORDER BY fm.dateEnvoi DESC")
    List<FormulaireMedecin> findByMedecinEmail(@Param("emailMedecin") String emailMedecin);

    //Récupération des formulaires envoyés par un chercheur (non masqués pour lui)
    @Query("SELECT fm FROM FormulaireMedecin fm " +
            "JOIN FETCH fm.formulaire f " +
            "JOIN FETCH fm.medecin " +
            "WHERE fm.chercheur.email = :emailChercheur " +
            "AND fm.masquePourChercheur = false")
    List<FormulaireMedecin> findByChercheurEmail(@Param("emailChercheur") String emailChercheur);

    Optional<FormulaireMedecin> findByFormulaireIdFormulaireAndMedecinEmail(Long formulaireId, String medecinEmail);

}
