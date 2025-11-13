package com.pfe.backend.repository;

import com.pfe.backend.model.Formulaire;
import com.pfe.backend.model.StatutFormulaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FormulaireRepository extends JpaRepository<Formulaire, Long> {
    List<Formulaire> findAllByChercheurEmail(String email);
    
    @Query("SELECT DISTINCT f FROM Formulaire f " +
           "LEFT JOIN FETCH f.champs c " +
           "LEFT JOIN FETCH c.listeValeur " +
           "WHERE f.chercheur.email = :email")
    List<Formulaire> findAllWithChampsByChercheurEmail(@Param("email") String email);

    @Query("SELECT f FROM Formulaire f " +
           "LEFT JOIN FETCH f.champs c " +
           "LEFT JOIN FETCH c.listeValeur " +
           "WHERE f.idFormulaire = :id")
    Optional<Formulaire> findByIdWithChamps(@Param("id") Long id);

    @Query("SELECT COUNT(f) FROM Formulaire f WHERE f.chercheur.email = :email")
    long countByUserEmail(@Param("email") String email);
    
    @Query("SELECT COUNT(f) FROM Formulaire f WHERE f.chercheur.email = :email AND f.statut = :statut")
    long countByUserEmailAndStatut(@Param("email") String email, @Param("statut") StatutFormulaire statut);
    
    @Query("SELECT COUNT(DISTINCT f.etude) FROM Formulaire f WHERE f.chercheur.email = :email")
    long countEtudesByUserEmail(@Param("email") String email);
}
