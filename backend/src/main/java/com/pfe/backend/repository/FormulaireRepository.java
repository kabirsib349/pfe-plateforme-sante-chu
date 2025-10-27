package com.pfe.backend.repository;

import com.pfe.backend.model.Formulaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FormulaireRepository extends JpaRepository<Formulaire, Long> {
}
