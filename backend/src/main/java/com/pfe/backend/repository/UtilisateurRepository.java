package com.pfe.backend.repository;

import com.pfe.backend.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
    Optional<Utilisateur> findByEmail(String email);
    
    @Query("SELECT u FROM Utilisateur u WHERE u.role.nom = :roleName")
    List<Utilisateur> findByRoleName(@Param("roleName") String roleName);
}
