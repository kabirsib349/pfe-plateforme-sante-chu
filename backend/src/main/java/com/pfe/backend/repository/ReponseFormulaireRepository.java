package com.pfe.backend.repository;

import com.pfe.backend.model.ReponseFormulaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReponseFormulaireRepository extends JpaRepository<ReponseFormulaire, Long> {
    
    List<ReponseFormulaire> findByFormulaireMedecinId(Long formulaireMedecinId);
    
    // Méthodes pour chercher par hash
    List<ReponseFormulaire> findByFormulaireMedecinIdAndPatientIdentifierHash(
            Long formulaireMedecinId,
            String patientIdentifierHash
    );
    
    // La méthode findDistinctPatientIdentifiersByFormulaireMedecinId a été supprimée
    // car une requête DISTINCT n'est pas possible sur une colonne chiffrée.
    
    @Modifying
    void deleteByFormulaireMedecinId(Long formulaireMedecinId);
    
    // Méthode pour supprimer par hash
    @Modifying
    void deleteByFormulaireMedecinIdAndPatientIdentifierHash(
            Long formulaireMedecinId,
            String patientIdentifierHash
    );

    @Query("""
       SELECT DISTINCT r
       FROM ReponseFormulaire r
       LEFT JOIN FETCH r.champ c
       LEFT JOIN FETCH c.listeValeur lv
       LEFT JOIN FETCH lv.options o
       WHERE r.formulaireMedecin.id = :id
       """)
    List<ReponseFormulaire> findAllWithOptions(@Param("id") Long formulaireMedecinId);

    @Query("""
       SELECT r
       FROM ReponseFormulaire r
       JOIN FETCH r.champ c
       WHERE r.formulaireMedecin.formulaire.id = :formulaireId
       """)
    List<ReponseFormulaire> findByFormulaireIdWithChamp(@Param("formulaireId") Long formulaireId);
}

