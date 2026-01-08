package com.pfe.backend.service;

import com.pfe.backend.model.Message;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service de gestion de la messagerie interne.
 * Permet l'envoi, la réception et la consultation des messages entre médecins et chercheurs.
 */
@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    /**
     * Envoie un message entre médecin et chercheur avec contrôle strict des rôles.
     *
     * @param emetteur utilisateur émetteur
     * @param destinataire utilisateur destinataire
     * @param contenu contenu du message
     * @return message persistant
     */
    public Message envoyerMessage(Utilisateur emetteur, Utilisateur destinataire, String contenu) {

        Message message = new Message();
        message.setContenu(contenu);
        message.setDateEnvoi(LocalDateTime.now());
        message.setEmetteur(emetteur);
        message.setDestinataire(destinataire);
        message.setLu(false);

        return messageRepository.save(message);
    }

    /**
     * Récupère tous les messages envoyés par un utilisateur.
     *
     * @param emetteur utilisateur émetteur
     * @return liste des messages envoyés
     */
    public List<Message> getMessagesEnvoyes(Utilisateur emetteur) {
        return messageRepository.findByEmetteur(emetteur);
    }

    /**
     * Récupère tous les messages reçus par un utilisateur.
     *
     * @param destinataire utilisateur destinataire
     * @return liste des messages reçus
     */
    public List<Message> getMessagesRecus(Utilisateur destinataire) {
        return messageRepository.findByDestinataire(destinataire);
    }

    /**
     * Récupère les messages envoyés par un chercheur par ordre chronologique inverse.
     *
     * @param idChercheur ID du chercheur
     * @return liste des messages
     */
    public List<Message> getMessagesEnvoyesParChercheur(Long idChercheur) {
        return messageRepository.findByEmetteurIdOrderByDateEnvoiDesc(idChercheur);
    }

    /**
     * Récupère les messages envoyés par un médecin par ordre chronologique inverse.
     *
     * @param idMedecin ID du médecin
     * @return liste des messages
     */
    public List<Message> getMessagesEnvoyesParMedecin(Long idMedecin) {
        return messageRepository.findByEmetteurIdOrderByDateEnvoiDesc(idMedecin);
    }

    public List<Message> getConversation(Long chercheurId, Long medecinId) {
        return messageRepository.findConversation(medecinId, chercheurId);
    }

    /**
     * Marque comme lus seulement les messages dont le destinataire est le chercheur.
     */
    public void marquerCommeLus(Long chercheurId, Long medecinId) {
        List<Message> messages = messageRepository
                .findConversation(medecinId, chercheurId)
                .stream()
                .filter(m -> !m.isLu() && m.getDestinataire().getId().equals(chercheurId))
                .toList();

        messages.forEach(m -> m.setLu(true));
        messageRepository.saveAll(messages);
    }
    /**
     * Marque comme lus seulement les messages dont le destinataire est le médecin.
     */
    public void marquerCommeLusPourMedecin(Long chercheurId, Long medecinId) {
        List<Message> messages = messageRepository
                .findConversation(medecinId, chercheurId)
                .stream()
                .filter(m -> !m.isLu() && m.getDestinataire().getId().equals(medecinId))
                .toList();

        messages.forEach(m -> m.setLu(true));
        messageRepository.saveAll(messages);
    }

    public long countMessagesNonLusPourChercheur(Long chercheurId) {
        return messageRepository.countByDestinataireIdAndLuFalse(chercheurId);
    }



    /**
     * Compte les messages non lus envoyés par emetteurId vers destinataireId.
     */
    public int countUnreadForConversation(Long destinataireId, Long emetteurId) {
        return messageRepository.countUnreadMessages(destinataireId, emetteurId);
    }

    public long countMessagesNonLusPourMedecin(Long idMedecin) {
        return messageRepository.countByDestinataireIdAndLuFalse(idMedecin);
    }





}