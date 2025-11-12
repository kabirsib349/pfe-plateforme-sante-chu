package com.pfe.backend.repository;

import com.pfe.backend.model.ReponseFormulaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.List;

public interface ReponseFormulaireRepository extends JpaRepository<ReponseFormulaire, Long> {
    
    List<ReponseFormulaire> findByFormulaireMedecinId(Long formulaireMedecinId);
    
    @Modifying
    void deleteByFormulaireMedecinId(Long formulaireMedecinId);
}
