package com.pfe.backend.config.converter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Convertisseur JPA pour chiffrer/déchiffrer automatiquement les colonnes sensibles
 * Utilise AES-256-GCM (mode sécurisé avec authentification)
 * Thread-safe : crée un nouveau Cipher pour chaque opération
 */
@Converter(autoApply = false)
@Component
public class StringCryptoConverter implements AttributeConverter<String, String> {

    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12; // 96 bits recommandé pour GCM
    private static final int GCM_TAG_LENGTH = 128; // 128 bits pour l'authentification

    @Value("${app.encryption.key}")
    private String secretKey;

    private SecretKeySpec keySpec;

    @PostConstruct
    public void init() {
        try {
            // Vérifier que la clé fait 32 bytes (256 bits) pour AES-256
            byte[] keyBytes = secretKey.getBytes();
            if (keyBytes.length != 32) {
                throw new IllegalStateException(
                    "La clé de chiffrement doit faire exactement 32 caractères (256 bits). " +
                    "Longueur actuelle: " + keyBytes.length
                );
            }
            keySpec = new SecretKeySpec(keyBytes, ALGORITHM);
        } catch (Exception e) {
            throw new IllegalStateException("Erreur lors de l'initialisation du convertisseur de chiffrement", e);
        }
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return attribute;
        }
        try {
            // Générer un IV aléatoire pour chaque chiffrement (sécurité GCM)
            byte[] iv = new byte[GCM_IV_LENGTH];
            SecureRandom random = new SecureRandom();
            random.nextBytes(iv);

            // Créer un nouveau Cipher pour cette opération (thread-safe)
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec, parameterSpec);

            // Chiffrer les données
            byte[] encryptedData = cipher.doFinal(attribute.getBytes());

            // Combiner IV + données chiffrées
            ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + encryptedData.length);
            byteBuffer.put(iv);
            byteBuffer.put(encryptedData);

            // Encoder en Base64 pour stockage en BDD
            return Base64.getEncoder().encodeToString(byteBuffer.array());
        } catch (Exception e) {
            throw new IllegalStateException("Impossible de chiffrer l'attribut: " + e.getMessage(), e);
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return dbData;
        }
        try {
            // Décoder depuis Base64
            byte[] decodedData = Base64.getDecoder().decode(dbData);

            // Extraire IV et données chiffrées
            ByteBuffer byteBuffer = ByteBuffer.wrap(decodedData);
            byte[] iv = new byte[GCM_IV_LENGTH];
            byteBuffer.get(iv);
            byte[] encryptedData = new byte[byteBuffer.remaining()];
            byteBuffer.get(encryptedData);

            // Créer un nouveau Cipher pour cette opération (thread-safe)
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, keySpec, parameterSpec);

            // Déchiffrer
            byte[] decryptedData = cipher.doFinal(encryptedData);
            return new String(decryptedData);
        } catch (Exception e) {
            throw new IllegalStateException("Impossible de déchiffrer la donnée de la base: " + e.getMessage(), e);
        }
    }
}

