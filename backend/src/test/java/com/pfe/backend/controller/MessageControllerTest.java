package com.pfe.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfe.backend.model.Message;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.service.MessageService;
import com.pfe.backend.service.UtilisateurService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class MessageControllerTest {

    private MockMvc mockMvc;

    @Mock
    private MessageService messageService;

    @Mock
    private UtilisateurService utilisateurService;

    @InjectMocks
    private MessageController messageController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private Utilisateur chercheur;
    private Utilisateur medecin;
    private Message testMessage;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(messageController).build();
        
        chercheur = new Utilisateur();
        chercheur.setId(1L);
        chercheur.setNom("Dr. Chercheur");
        chercheur.setEmail("chercheur@test.com");

        medecin = new Utilisateur();
        medecin.setId(2L);
        medecin.setNom("Dr. Medecin");
        medecin.setEmail("medecin@test.com");

        testMessage = new Message("Test message content", LocalDateTime.now(), chercheur, medecin);
        testMessage.setLu(false);
    }

    // ==================== POST /api/messages/envoyer ====================

    @Test
    void envoyerMessage_ShouldReturnMessage_WhenSuccess() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("emetteurId", "1");
        request.put("destinataireId", "2");
        request.put("contenu", "Bonjour, ceci est un test");

        when(utilisateurService.getUtilisateurById(1L)).thenReturn(chercheur);
        when(utilisateurService.getUtilisateurById(2L)).thenReturn(medecin);
        when(messageService.envoyerMessage(any(), any(), anyString())).thenReturn(testMessage);

        mockMvc.perform(post("/api/messages/envoyer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contenu").value("Test message content"));
    }

    @Test
    void envoyerMessage_ShouldReturnBadRequest_WhenContenuIsEmpty() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("emetteurId", "1");
        request.put("destinataireId", "2");
        request.put("contenu", "");

        mockMvc.perform(post("/api/messages/envoyer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Le contenu du message est obligatoire."));
    }

    @Test
    void envoyerMessage_ShouldReturnBadRequest_WhenContenuIsNull() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("emetteurId", "1");
        request.put("destinataireId", "2");
        request.put("contenu", null);

        mockMvc.perform(post("/api/messages/envoyer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Le contenu du message est obligatoire."));
    }

    @Test
    void envoyerMessage_ShouldReturnBadRequest_WhenExceptionThrown() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("emetteurId", "1");
        request.put("destinataireId", "2");
        request.put("contenu", "Test");

        when(utilisateurService.getUtilisateurById(1L)).thenThrow(new RuntimeException("User not found"));

        mockMvc.perform(post("/api/messages/envoyer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    // ==================== GET /api/messages/recus/chercheur/{id} ====================

    @Test
    void getMessagesRecusParChercheur_ShouldReturnMessages() throws Exception {
        when(utilisateurService.getUtilisateurById(1L)).thenReturn(chercheur);
        when(messageService.getMessagesRecus(chercheur)).thenReturn(List.of(testMessage));

        mockMvc.perform(get("/api/messages/recus/chercheur/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // ==================== GET /api/messages/envoyes/chercheur/{id} ====================

    @Test
    void getMessagesEnvoyesParChercheur_ShouldReturnMessages() throws Exception {
        when(messageService.getMessagesEnvoyesParChercheur(1L)).thenReturn(List.of(testMessage));

        mockMvc.perform(get("/api/messages/envoyes/chercheur/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // ==================== GET /api/messages/envoyes/medecin/{id} ====================

    @Test
    void getMessagesEnvoyesParMedecin_ShouldReturnMessages() throws Exception {
        when(messageService.getMessagesEnvoyesParMedecin(2L)).thenReturn(List.of(testMessage));

        mockMvc.perform(get("/api/messages/envoyes/medecin/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // ==================== GET /api/messages/conversation/{chercheurId}/{medecinId} ====================

    @Test
    void getConversation_ShouldReturnConversation() throws Exception {
        when(messageService.getConversation(1L, 2L)).thenReturn(List.of(testMessage));

        mockMvc.perform(get("/api/messages/conversation/1/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // ==================== PUT /api/messages/conversation/lire/chercheur/{chercheurId}/{medecinId} ====================

    @Test
    void marquerCommeLusPourChercheur_ShouldReturnOk() throws Exception {
        doNothing().when(messageService).marquerCommeLus(1L, 2L);

        mockMvc.perform(put("/api/messages/conversation/lire/chercheur/1/2"))
                .andExpect(status().isOk())
                .andExpect(content().string("Messages mis à jour comme lus (côté chercheur)."));
    }

    // ==================== PUT /api/messages/conversation/lire/medecin/{chercheurId}/{medecinId} ====================

    @Test
    void marquerCommeLusPourMedecin_ShouldReturnOk() throws Exception {
        doNothing().when(messageService).marquerCommeLusPourMedecin(1L, 2L);

        mockMvc.perform(put("/api/messages/conversation/lire/medecin/1/2"))
                .andExpect(status().isOk())
                .andExpect(content().string("Messages mis à jour comme lus (côté médecin)."));
    }

    // ==================== GET /api/messages/non-lus/chercheur/{id} ====================

    @Test
    void getNombreNonLusPourChercheur_ShouldReturnCount() throws Exception {
        when(messageService.countMessagesNonLusPourChercheur(1L)).thenReturn(5L);

        mockMvc.perform(get("/api/messages/non-lus/chercheur/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("5"));
    }

    // ==================== GET /api/messages/nonlus/{destinataireId}/{emetteurId} ====================

    @Test
    void countUnread_ShouldReturnCount() throws Exception {
        when(messageService.countUnreadForConversation(1L, 2L)).thenReturn(3);

        mockMvc.perform(get("/api/messages/nonlus/1/2"))
                .andExpect(status().isOk())
                .andExpect(content().string("3"));
    }

    // ==================== GET /api/messages/non-lus/medecin/{id} ====================

    @Test
    void getNombreNonLusPourMedecin_ShouldReturnCount() throws Exception {
        when(messageService.countMessagesNonLusPourMedecin(2L)).thenReturn(7L);

        mockMvc.perform(get("/api/messages/non-lus/medecin/2"))
                .andExpect(status().isOk())
                .andExpect(content().string("7"));
    }

    // ==================== DELETE /api/messages/{id} ====================

    @Test
    void supprimerMessage_ShouldReturnOk_WhenSuccess() throws Exception {
        doNothing().when(messageService).supprimerMessage(1L, 1L);

        mockMvc.perform(delete("/api/messages/1").param("userId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Message supprimé avec succès."));
    }

    @Test
    void supprimerMessage_ShouldReturnForbidden_WhenAccessDenied() throws Exception {
        doThrow(new AccessDeniedException("Vous ne pouvez pas supprimer ce message."))
                .when(messageService).supprimerMessage(1L, 2L);

        mockMvc.perform(delete("/api/messages/1").param("userId", "2"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Vous ne pouvez pas supprimer ce message."));
    }

    @Test
    void supprimerMessage_ShouldReturnBadRequest_WhenOtherException() throws Exception {
        doThrow(new RuntimeException("Message not found"))
                .when(messageService).supprimerMessage(1L, 1L);

        mockMvc.perform(delete("/api/messages/1").param("userId", "1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }
}
