package com.pfe.backend.controller;

import com.pfe.backend.model.Message;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.service.MessageService;
import com.pfe.backend.service.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Contrôleur pour la gestion des messages entre médecin et chercheur.
 */
@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final UtilisateurService utilisateurService;

    /**
     * Envoie un message entre chercheur et médecin.
     *
     * @param request contient le contenu du message, l'id de l'émetteur et du destinataire
     * @return le message envoyé ou une erreur
     */
    @PostMapping("/envoyer")
    public ResponseEntity<?> envoyerMessage(@RequestBody Map<String, String> request) {
        try {
            Long emetteurId = Long.parseLong(request.get("emetteurId"));
            Long destinataireId = Long.parseLong(request.get("destinataireId"));
            String contenu = request.get("contenu");

            if (contenu == null || contenu.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Le contenu du message est obligatoire."));
            }

            Utilisateur emetteur = utilisateurService.getUtilisateurById(emetteurId);
            Utilisateur destinataire = utilisateurService.getUtilisateurById(destinataireId);

            Message message = messageService.envoyerMessage(emetteur, destinataire, contenu);
            return ResponseEntity.ok(message);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Erreur lors de l’envoi du message : " + e.getMessage()));
        }
    }

    /**
     * Récupère tous les messages reçus par un chercheur.
     *
     * @param idChercheur identifiant du chercheur
     * @return liste des messages reçus
     */
    @GetMapping("/recus/chercheur/{idChercheur}")
    public ResponseEntity<List<Message>> getMessagesRecusParChercheur(@PathVariable Long idChercheur) {
        Utilisateur chercheur = utilisateurService.getUtilisateurById(idChercheur);
        List<Message> messages = messageService.getMessagesRecus(chercheur);
        return ResponseEntity.ok(messages);
    }

    /**
     * Récupère tous les messages envoyés par un chercheur.
     *
     * @param idChercheur identifiant du chercheur
     * @return liste des messages envoyés
     */
    @GetMapping("/envoyes/chercheur/{idChercheur}")
    public ResponseEntity<List<Message>> getMessagesEnvoyesParChercheur(@PathVariable Long idChercheur) {
        List<Message> messages = messageService.getMessagesEnvoyesParChercheur(idChercheur);
        return ResponseEntity.ok(messages);
    }

    /**
     * Récupère tous les messages envoyés par un médecin.
     *
     * @param idMedecin identifiant du médecin
     * @return liste des messages envoyés
     */
    @GetMapping("/envoyes/medecin/{idMedecin}")
    public ResponseEntity<List<Message>> getMessagesEnvoyesParMedecin(@PathVariable Long idMedecin) {
        List<Message> messages = messageService.getMessagesEnvoyesParMedecin(idMedecin);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/conversation/{chercheurId}/{medecinId}")
    public ResponseEntity<List<Message>> getConversation(
            @PathVariable Long chercheurId,
            @PathVariable Long medecinId
    ) {
        List<Message> conversation = messageService.getConversation(chercheurId, medecinId);
        return ResponseEntity.ok(conversation);
    }
    /**
     * Marque comme lus les messages dont le destinataire est le chercheur.
     */
    @PutMapping("/conversation/lire/chercheur/{chercheurId}/{medecinId}")
    public ResponseEntity<?> marquerCommeLusPourChercheur(
            @PathVariable Long chercheurId,
            @PathVariable Long medecinId
    ) {
        messageService.marquerCommeLus(chercheurId, medecinId);
        return ResponseEntity.ok("Messages mis à jour comme lus (côté chercheur).");
    }
    /**
     * Marque comme lus les messages dont le destinataire est le médecin.
     */
    @PutMapping("/conversation/lire/medecin/{chercheurId}/{medecinId}")
    public ResponseEntity<?> marquerCommeLusPourMedecin(
            @PathVariable Long chercheurId,
            @PathVariable Long medecinId
    ) {
        messageService.marquerCommeLusPourMedecin(chercheurId, medecinId);
        return ResponseEntity.ok("Messages mis à jour comme lus (côté médecin).");
    }



    @GetMapping("/non-lus/chercheur/{idChercheur}")
    public ResponseEntity<Long> getNombreNonLusPourChercheur(@PathVariable Long idChercheur) {
        long count = messageService.countMessagesNonLusPourChercheur(idChercheur);
        return ResponseEntity.ok(count);
    }

    /**
     * Compte les messages non lus envoyés par emetteurId vers destinataireId.
     *
     * @param destinataireId ID de l'utilisateur qui reçoit les messages
     * @param emetteurId ID de l'utilisateur qui envoie les messages
     * @return le nombre de messages non lus
     */
    @GetMapping("/nonlus/{destinataireId}/{emetteurId}")
    public ResponseEntity<Integer> countUnread(
            @PathVariable Long destinataireId,
            @PathVariable Long emetteurId
    ) {
        return ResponseEntity.ok(
                messageService.countUnreadForConversation(destinataireId, emetteurId)
        );
    }

    @GetMapping("/non-lus/medecin/{idMedecin}")
    public ResponseEntity<Long> getNombreNonLusPourMedecin(@PathVariable Long idMedecin) {
        long count = messageService.countMessagesNonLusPourMedecin(idMedecin);
        return ResponseEntity.ok(count);
    }

}
