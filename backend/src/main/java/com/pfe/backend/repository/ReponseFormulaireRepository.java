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

    List<ReponseFormulaire> findByFormulaireMedecinIdAndPatientIdentifierHashAndDraft(
            Long formulaireMedecinId,
            String patientIdentifierHash,
            boolean draft
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
       AND (r.draft = false OR r.draft IS NULL)
       """)
    List<ReponseFormulaire> findAllWithOptions(@Param("id") Long formulaireMedecinId);

    @Query("""
       SELECT r
       FROM ReponseFormulaire r
       JOIN FETCH r.champ c
       WHERE r.formulaireMedecin.formulaire.id = :formulaireId
       """)
    List<ReponseFormulaire> findByFormulaireIdWithChamp(@Param("formulaireId") Long formulaireId);

    // Compter le nombre de patients distincts ayant des réponses pour un formulaire
    @Query("SELECT COUNT(DISTINCT r.patientIdentifierHash) FROM ReponseFormulaire r " +
           "WHERE r.formulaireMedecin.id = :formulaireMedecinId")
    long countDistinctPatients(@Param("formulaireMedecinId") Long formulaireMedecinId);

    // Récupérer les hashes de patients distincts
    @Query("SELECT DISTINCT r.patientIdentifierHash FROM ReponseFormulaire r " +
           "WHERE r.formulaireMedecin.id = :formulaireMedecinId")
    List<String> findDistinctPatientHashes(@Param("formulaireMedecinId") Long formulaireMedecinId);

    // Récupérer les hashes de patients distincts (brouillons uniquement)
    @Query("SELECT DISTINCT r.patientIdentifierHash FROM ReponseFormulaire r " +
           "WHERE r.formulaireMedecin.id = :formulaireMedecinId AND r.draft = true")
    List<String> findDistinctDraftPatientHashes(@Param("formulaireMedecinId") Long formulaireMedecinId);

    // Nouveauté: récupérer les ids distincts de formulaire (utilisé pour init compteur)
    @Query("SELECT DISTINCT r.formulaireMedecin.formulaire.id FROM ReponseFormulaire r")
    List<Long> findDistinctFormulaireIds();

    // Nouveau: récupérer toutes les réponses par formulaireId (pour export agrégé)
    @Query("""
       SELECT DISTINCT r
       FROM ReponseFormulaire r
       LEFT JOIN FETCH r.champ c
       LEFT JOIN FETCH c.listeValeur lv
       LEFT JOIN FETCH lv.options o
       WHERE r.formulaireMedecin.formulaire.id = :formulaireId
       AND (r.draft = false OR r.draft IS NULL)
       """)
    List<ReponseFormulaire> findAllWithOptionsByFormulaireId(@Param("formulaireId") Long formulaireId);
}

