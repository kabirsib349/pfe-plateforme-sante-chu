package com.pfe.backend.service;

import com.pfe.backend.model.Message;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;
    /**
     * @brief Méthode permettant d'envoyer un message entre médecin et chercheur avec contrôle strict des rôles.
     * @param contenu : contenu du message.
     * @return Message : message persistant.
     * @date 07/11/2025
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

    public List<Message> getMessagesEnvoyes(Utilisateur emetteur) {
        return messageRepository.findByEmetteur(emetteur);
    }

    public List<Message> getMessagesRecus(Utilisateur destinataire) {
        return messageRepository.findByDestinataire(destinataire);
    }

    public List<Message> getMessagesEnvoyesParChercheur(Long idChercheur) {
        return messageRepository.findByEmetteurIdOrderByDateEnvoiDesc(idChercheur);
    }

    public List<Message> getMessagesEnvoyesParMedecin(Long idMedecin) {
        return messageRepository.findByEmetteurIdOrderByDateEnvoiDesc(idMedecin);
    }

    public List<Message> getConversation(Long chercheurId, Long medecinId) {
        return messageRepository.findConversation(medecinId, chercheurId);
    }

//marquer comme lus seulement les messages dont le destinataire est le chercheur
    public void marquerCommeLus(Long chercheurId, Long medecinId) {
        List<Message> messages = messageRepository
                .findConversation(medecinId, chercheurId)
                .stream()
                .filter(m -> !m.isLu() && m.getDestinataire().getId().equals(chercheurId))
                .toList();

        messages.forEach(m -> m.setLu(true));
        messageRepository.saveAll(messages);
    }
    //marquer comme lus seulement les messages dont le destinataire est le medecin
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



    // Compte les messages non lus envoyés par emetteurId vers destinataireId
    public int countUnreadForConversation(Long destinataireId, Long emetteurId) {
        return messageRepository.countUnreadMessages(destinataireId, emetteurId);
    }

    public long countMessagesNonLusPourMedecin(Long idMedecin) {
        return messageRepository.countByDestinataireIdAndLuFalse(idMedecin);
    }





}