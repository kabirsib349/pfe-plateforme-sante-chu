package com.pfe.backend.repository;

import com.pfe.backend.model.QuestionPersonnalisee;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuestionPersonnaliseeRepository extends JpaRepository<QuestionPersonnalisee, Long> {
    List<QuestionPersonnalisee> findByChercheurId(Long chercheurId);
    List<QuestionPersonnalisee> findByChercheurEmail(String email);
}
