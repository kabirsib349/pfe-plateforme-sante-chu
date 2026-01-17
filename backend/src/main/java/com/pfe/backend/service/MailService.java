package com.pfe.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * Service d'envoi d'emails HTML pour la réinitialisation de mot de passe.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from:noreply@meddatacollect.com}")
    private String fromAddress;

    /**
     * Envoie un email HTML avec le code de vérification.
     *
     * @param to              adresse email du destinataire
     * @param verificationCode code de vérification à 6 chiffres
     * @param expiryMinutes   durée de validité du code en minutes
     */
    public void sendVerificationCodeEmail(String to, String verificationCode, int expiryMinutes) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject("Réinitialisation de votre mot de passe - MedDataCollect");

            String htmlContent = buildPasswordResetEmailHtml(verificationCode, expiryMinutes);
            helper.setText(htmlContent, true);

            mailSender.send(mimeMessage);

            log.info("Email de réinitialisation envoyé avec succès à : {}", to);

        } catch (MessagingException e) {
            log.error("Erreur lors de la création du message email pour {}", to, e);
            throw new RuntimeException("Impossible de créer l'email de réinitialisation", e);
        } catch (Exception e) {
            log.error("Erreur lors de l'envoi du mail de réinitialisation vers {}", to, e);
            throw new RuntimeException("Impossible d'envoyer l'email de réinitialisation", e);
        }
    }

    /**
     * Génère le template HTML de l'email de réinitialisation.
     */
    private String buildPasswordResetEmailHtml(String verificationCode, int expiryMinutes) {
        return String.format(
                """
                        <!DOCTYPE html>
                        <html lang="fr">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Réinitialisation de mot de passe</title>
                        </head>
                        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; line-height: 1.6;">
                            <table role="presentation" style="width: 100%%; border-collapse: collapse; background-color: #f3f4f6;">
                                <tr>
                                    <td align="center" style="padding: 40px 20px;">
                                        <table role="presentation" style="max-width: 600px; width: 100%%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

                                            <!-- Header -->
                                            <tr>
                                                <td style="background: linear-gradient(135deg, #10b981 0%%, #3b82f6 50%%, #6366f1 100%%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
                                                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                                        MedDataCollect
                                                    </h1>
                                                    <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                                                        Plateforme de Collecte de Données Médicales
                                                    </p>
                                                </td>
                                            </tr>

                                            <!-- Body -->
                                            <tr>
                                                <td style="padding: 40px 30px;">
                                                    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: 600;">
                                                        Réinitialisation de votre mot de passe
                                                    </h2>

                                                    <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px;">
                                                        Bonjour,
                                                    </p>

                                                    <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px;">
                                                        Vous avez demandé la réinitialisation de votre mot de passe.
                                                        Utilisez le code de vérification ci-dessous pour continuer :
                                                    </p>

                                                    <!-- Code -->
                                                    <table role="presentation" style="width: 100%%; border-collapse: collapse; margin: 0 0 30px 0;">
                                                        <tr>
                                                            <td align="center" style="padding: 30px; background: linear-gradient(135deg, #ecfdf5 0%%, #dbeafe 100%%); border-radius: 12px; border: 2px solid #10b981;">
                                                                <div style="font-size: 14px; color: #059669; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                                                                    Votre code de vérification
                                                                </div>
                                                                <div style="font-size: 42px; font-weight: 700; color: #047857; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                                                    %s
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>

                                                    <!-- Warning -->
                                                    <table role="presentation" style="width: 100%%; border-collapse: collapse; margin: 0 0 20px 0; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
                                                        <tr>
                                                            <td style="padding: 16px 20px;">
                                                                <p style="margin: 0; color: #92400e; font-size: 14px;">
                                                                    <strong>Ce code est valable pendant %d minutes.</strong>
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    </table>

                                                    <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px;">
                                                        Après avoir saisi ce code, vous pourrez définir un nouveau mot de passe pour votre compte.
                                                    </p>
                                                </td>
                                            </tr>

                                            <!-- Security -->
                                            <tr>
                                                <td style="padding: 0 30px 40px 30px;">
                                                    <table role="presentation" style="width: 100%%; border-collapse: collapse; background-color: #fef2f2; border-radius: 8px; border: 1px solid #fecaca;">
                                                        <tr>
                                                            <td style="padding: 20px;">
                                                                <p style="margin: 0 0 10px 0; color: #991b1b; font-size: 14px; font-weight: 600;">
                                                                    Mesures de sécurité
                                                                </p>
                                                                <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                                                                    Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer ce message en toute sécurité.
                                                                    Votre mot de passe actuel restera inchangé.
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>

                                            <!-- Footer -->
                                            <tr>
                                                <td style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 16px 16px; border-top: 1px solid #e5e7eb;">
                                                    <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; text-align: center;">
                                                        Cet email a été envoyé par <strong>MedDataCollect</strong>
                                                    </p>
                                                    <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                                                        Plateforme sécurisée de collecte de données médicales pour la recherche clinique
                                                    </p>
                                                </td>
                                            </tr>

                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </body>
                        </html>
                        """,
                verificationCode, expiryMinutes);
    }
}
