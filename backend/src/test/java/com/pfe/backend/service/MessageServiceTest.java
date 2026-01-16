package com.pfe.backend.service;

import com.pfe.backend.model.Message;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.repository.MessageRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MessageServiceTest {

    @Mock
    private MessageRepository messageRepository;

    @InjectMocks
    private MessageService messageService;

    @Test
    void envoyerMessage_ShouldSaveAndReturnMessage() {
        // Arrange
        Utilisateur emetteur = createUtilisateur(1L, "emetteur@test.com");
        Utilisateur destinataire = createUtilisateur(2L, "destinataire@test.com");
        String contenu = "Bonjour, ceci est un message test";

        when(messageRepository.save(any(Message.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        Message result = messageService.envoyerMessage(emetteur, destinataire, contenu);

        // Assert
        assertNotNull(result);
        assertEquals(contenu, result.getContenu());
        assertEquals(emetteur, result.getEmetteur());
        assertEquals(destinataire, result.getDestinataire());
        assertFalse(result.isLu());
        assertNotNull(result.getDateEnvoi());
    }

    @Test
    void getMessagesEnvoyes_ShouldReturnList() {
        // Arrange
        Utilisateur emetteur = createUtilisateur(1L, "emetteur@test.com");
        Message message = new Message();
        message.setEmetteur(emetteur);

        when(messageRepository.findByEmetteur(emetteur)).thenReturn(List.of(message));

        // Act
        List<Message> result = messageService.getMessagesEnvoyes(emetteur);

        // Assert
        assertEquals(1, result.size());
        verify(messageRepository).findByEmetteur(emetteur);
    }

    @Test
    void getMessagesRecus_ShouldReturnList() {
        // Arrange
        Utilisateur destinataire = createUtilisateur(1L, "destinataire@test.com");
        Message message = new Message();
        message.setDestinataire(destinataire);

        when(messageRepository.findByDestinataire(destinataire)).thenReturn(List.of(message));

        // Act
        List<Message> result = messageService.getMessagesRecus(destinataire);

        // Assert
        assertEquals(1, result.size());
        verify(messageRepository).findByDestinataire(destinataire);
    }

    @Test
    void getMessagesEnvoyesParChercheur_ShouldReturnOrderedList() {
        // Arrange
        Long idChercheur = 1L;
        Message message = new Message();

        when(messageRepository.findByEmetteurIdOrderByDateEnvoiDesc(idChercheur)).thenReturn(List.of(message));

        // Act
        List<Message> result = messageService.getMessagesEnvoyesParChercheur(idChercheur);

        // Assert
        assertEquals(1, result.size());
        verify(messageRepository).findByEmetteurIdOrderByDateEnvoiDesc(idChercheur);
    }

    @Test
    void getMessagesEnvoyesParMedecin_ShouldReturnOrderedList() {
        // Arrange
        Long idMedecin = 1L;
        Message message = new Message();

        when(messageRepository.findByEmetteurIdOrderByDateEnvoiDesc(idMedecin)).thenReturn(List.of(message));

        // Act
        List<Message> result = messageService.getMessagesEnvoyesParMedecin(idMedecin);

        // Assert
        assertEquals(1, result.size());
        verify(messageRepository).findByEmetteurIdOrderByDateEnvoiDesc(idMedecin);
    }

    @Test
    void getConversation_ShouldReturnMessages() {
        // Arrange
        Long chercheurId = 1L;
        Long medecinId = 2L;
        Message message = new Message();

        when(messageRepository.findConversation(medecinId, chercheurId)).thenReturn(List.of(message));

        // Act
        List<Message> result = messageService.getConversation(chercheurId, medecinId);

        // Assert
        assertEquals(1, result.size());
        verify(messageRepository).findConversation(medecinId, chercheurId);
    }

    @Test
    void marquerCommeLus_ShouldMarkUnreadMessagesAsRead() {
        // Arrange
        Long chercheurId = 1L;
        Long medecinId = 2L;

        Utilisateur chercheur = createUtilisateur(chercheurId, "chercheur@test.com");
        Utilisateur medecin = createUtilisateur(medecinId, "medecin@test.com");

        Message unreadMessage = new Message();
        unreadMessage.setLu(false);
        unreadMessage.setDestinataire(chercheur);

        Message readMessage = new Message();
        readMessage.setLu(true);
        readMessage.setDestinataire(chercheur);

        Message messageFromChercheur = new Message();
        messageFromChercheur.setLu(false);
        messageFromChercheur.setDestinataire(medecin); // Not for chercheur

        when(messageRepository.findConversation(medecinId, chercheurId))
                .thenReturn(List.of(unreadMessage, readMessage, messageFromChercheur));

        // Act
        messageService.marquerCommeLus(chercheurId, medecinId);

        // Assert
        assertTrue(unreadMessage.isLu());
        verify(messageRepository).saveAll(anyList());
    }

    @Test
    void marquerCommeLusPourMedecin_ShouldMarkUnreadMessagesAsRead() {
        // Arrange
        Long chercheurId = 1L;
        Long medecinId = 2L;

        Utilisateur medecin = createUtilisateur(medecinId, "medecin@test.com");

        Message unreadMessage = new Message();
        unreadMessage.setLu(false);
        unreadMessage.setDestinataire(medecin);

        when(messageRepository.findConversation(medecinId, chercheurId))
                .thenReturn(List.of(unreadMessage));

        // Act
        messageService.marquerCommeLusPourMedecin(chercheurId, medecinId);

        // Assert
        assertTrue(unreadMessage.isLu());
        verify(messageRepository).saveAll(anyList());
    }

    @Test
    void countMessagesNonLusPourChercheur_ShouldReturnCount() {
        // Arrange
        Long chercheurId = 1L;
        when(messageRepository.countByDestinataireIdAndLuFalse(chercheurId)).thenReturn(5L);

        // Act
        long result = messageService.countMessagesNonLusPourChercheur(chercheurId);

        // Assert
        assertEquals(5L, result);
    }

    @Test
    void countMessagesNonLusPourMedecin_ShouldReturnCount() {
        // Arrange
        Long medecinId = 1L;
        when(messageRepository.countByDestinataireIdAndLuFalse(medecinId)).thenReturn(3L);

        // Act
        long result = messageService.countMessagesNonLusPourMedecin(medecinId);

        // Assert
        assertEquals(3L, result);
    }

    @Test
    void countUnreadForConversation_ShouldReturnCount() {
        // Arrange
        Long destinataireId = 1L;
        Long emetteurId = 2L;
        when(messageRepository.countUnreadMessages(destinataireId, emetteurId)).thenReturn(2);

        // Act
        int result = messageService.countUnreadForConversation(destinataireId, emetteurId);

        // Assert
        assertEquals(2, result);
    }

    @Test
    void supprimerMessage_ShouldDelete_WhenUserIsEmetteur() {
        // Arrange
        Long messageId = 1L;
        Long userId = 10L;

        Utilisateur emetteur = createUtilisateur(userId, "emetteur@test.com");

        Message message = new Message();
        message.setEmetteur(emetteur);

        when(messageRepository.findById(messageId)).thenReturn(Optional.of(message));

        // Act
        messageService.supprimerMessage(messageId, userId);

        // Assert
        verify(messageRepository).delete(message);
    }

    @Test
    void supprimerMessage_ShouldThrowException_WhenUserIsNotEmetteur() {
        // Arrange
        Long messageId = 1L;
        Long userId = 10L;
        Long differentUserId = 20L;

        Utilisateur emetteur = createUtilisateur(differentUserId, "emetteur@test.com");

        Message message = new Message();
        message.setEmetteur(emetteur);

        when(messageRepository.findById(messageId)).thenReturn(Optional.of(message));

        // Act & Assert
        assertThrows(AccessDeniedException.class, 
            () -> messageService.supprimerMessage(messageId, userId));
        verify(messageRepository, never()).delete(any(Message.class));
    }

    @Test
    void supprimerMessage_ShouldThrowException_WhenMessageNotFound() {
        // Arrange
        Long messageId = 999L;
        Long userId = 10L;

        when(messageRepository.findById(messageId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, 
            () -> messageService.supprimerMessage(messageId, userId));
    }

    @Test
    void marquerCommeLus_ShouldHandleEmptyConversation() {
        // Arrange
        Long chercheurId = 1L;
        Long medecinId = 2L;

        when(messageRepository.findConversation(medecinId, chercheurId))
                .thenReturn(Collections.emptyList());

        // Act
        messageService.marquerCommeLus(chercheurId, medecinId);

        // Assert
        verify(messageRepository).saveAll(Collections.emptyList());
    }

    private Utilisateur createUtilisateur(Long id, String email) {
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setId(id);
        utilisateur.setEmail(email);
        return utilisateur;
    }

    @Test
    void marquerCommeLus_ShouldNotMarkAlreadyReadMessages() {
        // Arrange - Test the branch where m.isLu() is true
        Long chercheurId = 1L;
        Long medecinId = 2L;

        Utilisateur chercheur = createUtilisateur(chercheurId, "chercheur@test.com");

        Message alreadyReadMessage = new Message();
        alreadyReadMessage.setLu(true); // Already read
        alreadyReadMessage.setDestinataire(chercheur);

        when(messageRepository.findConversation(medecinId, chercheurId))
                .thenReturn(List.of(alreadyReadMessage));

        // Act
        messageService.marquerCommeLus(chercheurId, medecinId);

        // Assert - Already read message should remain read, empty list saved
        assertTrue(alreadyReadMessage.isLu());
        verify(messageRepository).saveAll(Collections.emptyList());
    }

    @Test
    void marquerCommeLus_ShouldNotMarkMessagesForOtherDestinataire() {
        // Arrange - Test the branch where destinataire != chercheurId
        Long chercheurId = 1L;
        Long medecinId = 2L;
        Long autreId = 3L;

        Utilisateur autreDestinataire = createUtilisateur(autreId, "autre@test.com");

        Message messageForOther = new Message();
        messageForOther.setLu(false);
        messageForOther.setDestinataire(autreDestinataire); // Different destinataire

        when(messageRepository.findConversation(medecinId, chercheurId))
                .thenReturn(List.of(messageForOther));

        // Act
        messageService.marquerCommeLus(chercheurId, medecinId);

        // Assert - Message for other destinataire should NOT be marked as read
        assertFalse(messageForOther.isLu());
        verify(messageRepository).saveAll(Collections.emptyList());
    }

    @Test
    void marquerCommeLusPourMedecin_ShouldNotMarkAlreadyReadMessages() {
        // Arrange - Test the branch where m.isLu() is true
        Long chercheurId = 1L;
        Long medecinId = 2L;

        Utilisateur medecin = createUtilisateur(medecinId, "medecin@test.com");

        Message alreadyReadMessage = new Message();
        alreadyReadMessage.setLu(true); // Already read
        alreadyReadMessage.setDestinataire(medecin);

        when(messageRepository.findConversation(medecinId, chercheurId))
                .thenReturn(List.of(alreadyReadMessage));

        // Act
        messageService.marquerCommeLusPourMedecin(chercheurId, medecinId);

        // Assert - Already read message should remain read, empty list saved
        assertTrue(alreadyReadMessage.isLu());
        verify(messageRepository).saveAll(Collections.emptyList());
    }

    @Test
    void marquerCommeLusPourMedecin_ShouldNotMarkMessagesForOtherDestinataire() {
        // Arrange - Test the branch where destinataire != medecinId
        Long chercheurId = 1L;
        Long medecinId = 2L;
        Long autreId = 3L;

        Utilisateur autreDestinataire = createUtilisateur(autreId, "autre@test.com");

        Message messageForOther = new Message();
        messageForOther.setLu(false);
        messageForOther.setDestinataire(autreDestinataire); // Different destinataire

        when(messageRepository.findConversation(medecinId, chercheurId))
                .thenReturn(List.of(messageForOther));

        // Act
        messageService.marquerCommeLusPourMedecin(chercheurId, medecinId);

        // Assert - Message for other destinataire should NOT be marked as read
        assertFalse(messageForOther.isLu());
        verify(messageRepository).saveAll(Collections.emptyList());
    }

    @Test
    void marquerCommeLusPourMedecin_ShouldHandleEmptyConversation() {
        // Arrange
        Long chercheurId = 1L;
        Long medecinId = 2L;

        when(messageRepository.findConversation(medecinId, chercheurId))
                .thenReturn(Collections.emptyList());

        // Act
        messageService.marquerCommeLusPourMedecin(chercheurId, medecinId);

        // Assert
        verify(messageRepository).saveAll(Collections.emptyList());
    }

    @Test
    void marquerCommeLus_ShouldMarkOnlyUnreadMessagesForChercheur() {
        // Arrange - Mix of read and unread messages for different destinataires
        Long chercheurId = 1L;
        Long medecinId = 2L;

        Utilisateur chercheur = createUtilisateur(chercheurId, "chercheur@test.com");
        Utilisateur medecin = createUtilisateur(medecinId, "medecin@test.com");

        // Unread message for chercheur - should be marked
        Message unreadForChercheur = new Message();
        unreadForChercheur.setLu(false);
        unreadForChercheur.setDestinataire(chercheur);

        // Read message for chercheur - should NOT be in the list
        Message readForChercheur = new Message();
        readForChercheur.setLu(true);
        readForChercheur.setDestinataire(chercheur);

        // Unread message for medecin - should NOT be in the list (wrong destinataire)
        Message unreadForMedecin = new Message();
        unreadForMedecin.setLu(false);
        unreadForMedecin.setDestinataire(medecin);

        when(messageRepository.findConversation(medecinId, chercheurId))
                .thenReturn(List.of(unreadForChercheur, readForChercheur, unreadForMedecin));

        // Act
        messageService.marquerCommeLus(chercheurId, medecinId);

        // Assert
        assertTrue(unreadForChercheur.isLu()); // Should be marked as read
        assertTrue(readForChercheur.isLu()); // Was already read
        assertFalse(unreadForMedecin.isLu()); // Should NOT be marked (different destinataire)
    }

    @Test
    void marquerCommeLusPourMedecin_ShouldMarkOnlyUnreadMessagesForMedecin() {
        // Arrange - Mix of read and unread messages for different destinataires
        Long chercheurId = 1L;
        Long medecinId = 2L;

        Utilisateur chercheur = createUtilisateur(chercheurId, "chercheur@test.com");
        Utilisateur medecin = createUtilisateur(medecinId, "medecin@test.com");

        // Unread message for medecin - should be marked
        Message unreadForMedecin = new Message();
        unreadForMedecin.setLu(false);
        unreadForMedecin.setDestinataire(medecin);

        // Read message for medecin - should NOT be in the list
        Message readForMedecin = new Message();
        readForMedecin.setLu(true);
        readForMedecin.setDestinataire(medecin);

        // Unread message for chercheur - should NOT be in the list (wrong destinataire)
        Message unreadForChercheur = new Message();
        unreadForChercheur.setLu(false);
        unreadForChercheur.setDestinataire(chercheur);

        when(messageRepository.findConversation(medecinId, chercheurId))
                .thenReturn(List.of(unreadForMedecin, readForMedecin, unreadForChercheur));

        // Act
        messageService.marquerCommeLusPourMedecin(chercheurId, medecinId);

        // Assert
        assertTrue(unreadForMedecin.isLu()); // Should be marked as read
        assertTrue(readForMedecin.isLu()); // Was already read
        assertFalse(unreadForChercheur.isLu()); // Should NOT be marked (different destinataire)
    }
}
