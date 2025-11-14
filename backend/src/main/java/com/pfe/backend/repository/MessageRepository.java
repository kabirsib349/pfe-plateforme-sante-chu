package com.pfe.backend.repository;

import com.pfe.backend.model.Message;
import com.pfe.backend.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByEmetteur(Utilisateur emetteur);

    List<Message> findByDestinataire(Utilisateur destinataire);

    List<Message> findByDestinataireIdOrderByDateEnvoiDesc(Long destinataireId);

    List<Message> findByEmetteurIdOrderByDateEnvoiDesc(Long emetteurId);

    long countByDestinataireIdAndLuFalse(Long destinataireId);

    @Query("SELECT m FROM Message m WHERE " +
            "(m.emetteur.id = :medecinId AND m.destinataire.id = :chercheurId) OR " +
            "(m.emetteur.id = :chercheurId AND m.destinataire.id = :medecinId) " +
            "ORDER BY m.dateEnvoi ASC")
    List<Message> findConversation(@Param("medecinId") Long medecinId,
                                   @Param("chercheurId") Long chercheurId);

    @Query("""
    SELECT COUNT(m)
    FROM Message m
    WHERE m.destinataire.id = :chercheurId
      AND m.emetteur.id = :medecinId
      AND m.lu = false
""")
    int countUnreadMessages(Long chercheurId, Long medecinId);

}
