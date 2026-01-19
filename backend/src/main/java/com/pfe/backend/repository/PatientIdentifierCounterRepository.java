package com.pfe.backend.repository;

import com.pfe.backend.model.PatientIdentifierCounter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.util.Optional;

public interface PatientIdentifierCounterRepository extends JpaRepository<PatientIdentifierCounter, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM PatientIdentifierCounter p WHERE p.formulaireId = :formulaireId")
    Optional<PatientIdentifierCounter> findByFormulaireIdForUpdate(@Param("formulaireId") Long formulaireId);

    Optional<PatientIdentifierCounter> findByFormulaireId(Long formulaireId);
}
