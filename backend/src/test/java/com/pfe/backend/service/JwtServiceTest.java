package com.pfe.backend.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    @InjectMocks
    private JwtService jwtService;

    private String secretKey = "ma_cle_secrete_tres_longue_pour_les_tests_unitaires_backend_pfe";
    private long expiration = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(jwtService, "secretKey", secretKey);
        ReflectionTestUtils.setField(jwtService, "expiration", expiration);
    }

    @Test
    void extractUsername_ShouldReturnCorrectUsername() {
        UserDetails userDetails = new User("test@example.com", "password", Collections.emptyList());
        String token = jwtService.generateToken(userDetails);

        String username = jwtService.extractUsername(token);

        assertEquals("test@example.com", username);
    }

    @Test
    void isTokenValid_ShouldReturnTrue_WhenTokenIsValid() {
        UserDetails userDetails = new User("test@example.com", "password", Collections.emptyList());
        String token = jwtService.generateToken(userDetails);

        boolean isValid = jwtService.isTokenValid(token, userDetails);

        assertTrue(isValid);
    }

    @Test
    void isTokenValid_ShouldReturnFalse_WhenUsernameDoesNotMatch() {
        UserDetails userDetails = new User("test@example.com", "password", Collections.emptyList());
        String token = jwtService.generateToken(userDetails);

        UserDetails otherUser = new User("other@example.com", "password", Collections.emptyList());

        boolean isValid = jwtService.isTokenValid(token, otherUser);

        assertFalse(isValid);
    }

    @Test
    void isTokenValid_ShouldThrowException_WhenTokenExpired() {
        // Generate an already expired token directly using JJWT
        // Avoids Thread.sleep() which is flagged by SonarQube (java:S2925)
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
        
        Date now = new Date();
        Date expiredDate = new Date(now.getTime() - 1000); // 1 second in the past
        
        String expiredToken = Jwts.builder()
                .subject("test@example.com")
                .issuedAt(new Date(now.getTime() - 2000)) // issued 2 seconds ago
                .expiration(expiredDate) // expired 1 second ago
                .signWith(key)
                .compact();

        UserDetails userDetails = new User("test@example.com", "password", Collections.emptyList());

        assertThrows(io.jsonwebtoken.ExpiredJwtException.class, () -> {
            jwtService.isTokenValid(expiredToken, userDetails);
        });
    }

    @Test
    void generateToken_ShouldGenerateTokenWithExtraClaims() {
        UserDetails userDetails = new User("test@example.com", "password", Collections.emptyList());
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", "ADMIN");
        
        String token = jwtService.generateToken(extraClaims, userDetails);
        
        assertNotNull(token);
        String username = jwtService.extractUsername(token);
        assertEquals("test@example.com", username);
       
        String role = jwtService.extractClaim(token, claims -> claims.get("role", String.class));
        assertEquals("ADMIN", role);
    }
}

