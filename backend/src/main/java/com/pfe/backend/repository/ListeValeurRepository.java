package com.pfe.backend.repository;

import com.pfe.backend.model.ListeValeur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ListeValeurRepository extends JpaRepository<ListeValeur, Long> {
    @Query("SELECT DISTINCT lv FROM ListeValeur lv LEFT JOIN FETCH lv.options WHERE lv IN :listes")
    List<ListeValeur> findWithFetchedOptions(@Param("listes") List<ListeValeur> listes);
}
