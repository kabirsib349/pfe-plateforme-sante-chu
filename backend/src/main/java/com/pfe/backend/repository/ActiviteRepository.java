package com.pfe.backend.repository;

import com.pfe.backend.model.Activite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActiviteRepository extends JpaRepository<Activite, Long> {
    
    @Query("SELECT a FROM Activite a WHERE a.utilisateur.email = :email ORDER BY a.dateCreation DESC")
    List<Activite> findByUserEmailOrderByDateDesc(@Param("email") String email);
    
    @Query("SELECT a FROM Activite a WHERE a.utilisateur.email = :email ORDER BY a.dateCreation DESC LIMIT :limit")
    List<Activite> findRecentByUserEmail(@Param("email") String email, @Param("limit") int limit);
}