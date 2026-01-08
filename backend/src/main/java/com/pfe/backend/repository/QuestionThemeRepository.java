package com.pfe.backend.repository;

import com.pfe.backend.model.QuestionTheme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionThemeRepository extends JpaRepository<QuestionTheme, Long> {
}
