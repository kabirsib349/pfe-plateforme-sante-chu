package com.pfe.backend.repository;

import com.pfe.backend.model.Etude;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EtudeRepository extends JpaRepository<Etude, Long> {
}
