package com.pfe.backend.repository;

import com.pfe.backend.model.ListeValeur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ListeValeurRepository extends JpaRepository<ListeValeur, Long> {
}
