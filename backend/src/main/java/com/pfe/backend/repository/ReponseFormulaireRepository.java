package com.pfe.backend.repository;

import com.pfe.backend.model.ReponseFormulaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReponseFormulaireRepository extends JpaRepository<ReponseFormulaire, Long> {
    
    List<ReponseFormulaire> findByFormulaireMedecinId(Long formulaireMedecinId);
    
    List<ReponseFormulaire> findByFormulaireMedecinIdAndPatientIdentifier(
            Long formulaireMedecinId, 
            String patientIdentifier
    );
    
    @Query("SELECT DISTINCT r.patientIdentifier FROM ReponseFormulaire r " +
           "WHERE r.formulaireMedecin.id = :formulaireMedecinId " +
           "AND r.patientIdentifier IS NOT NULL " +
           "ORDER BY r.dateSaisie DESC")
    List<String> findDistinctPatientIdentifiersByFormulaireMedecinId(
            @Param("formulaireMedecinId") Long formulaireMedecinId
    );
    
    @Modifying
    void deleteByFormulaireMedecinId(Long formulaireMedecinId);
    
    @Modifying
    void deleteByFormulaireMedecinIdAndPatientIdentifier(
            Long formulaireMedecinId, 
            String patientIdentifier
    );
}
