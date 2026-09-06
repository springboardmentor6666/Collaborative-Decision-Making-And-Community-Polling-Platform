package com.decisionhub.security.oauth;

import com.decisionhub.dto.GoogleUserInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

class GoogleAuthServiceTest {

    private GoogleAuthService googleAuthService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        googleAuthService = new GoogleAuthService("test-client-id", objectMapper);
    }

    private String createMockJwt(String sub, String email, String name, String picture, boolean emailVerified, long expEpochSeconds) {
        String header = Base64.getUrlEncoder().withoutPadding().encodeToString("{\"alg\":\"RS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));
        String payloadJson = String.format(
                "{\"sub\":\"%s\",\"email\":\"%s\",\"name\":\"%s\",\"picture\":\"%s\",\"email_verified\":%b,\"exp\":%d}",
                sub, email, name, picture, emailVerified, expEpochSeconds
        );
        String payload = Base64.getUrlEncoder().withoutPadding().encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));
        String signature = "mockSignature";
        return header + "." + payload + "." + signature;
    }

    @Test
    void testVerifyValidMockToken() {
        long futureExp = Instant.now().getEpochSecond() + 3600;
        String token = createMockJwt("google-12345", "test@google.com", "Google Tester", "https://photo.com/1", true, futureExp);

        GoogleUserInfo info = googleAuthService.verifyToken(token);

        assertNotNull(info);
        assertEquals("google-12345", info.getProviderId());
        assertEquals("test@google.com", info.getEmail());
        assertEquals("Google Tester", info.getFullName());
        assertEquals("https://photo.com/1", info.getProfileImage());
        assertTrue(info.isEmailVerified());
    }

    @Test
    void testVerifyExpiredTokenThrowsException() {
        long pastExp = Instant.now().getEpochSecond() - 3600;
        String token = createMockJwt("google-12345", "test@google.com", "Google Tester", "https://photo.com/1", true, pastExp);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> googleAuthService.verifyToken(token));
        assertTrue(ex.getMessage().contains("expired") || ex.getMessage().contains("Invalid"));
    }

    @Test
    void testVerifyUnverifiedEmailThrowsException() {
        long futureExp = Instant.now().getEpochSecond() + 3600;
        String token = createMockJwt("google-12345", "unverified@google.com", "Google Tester", "https://photo.com/1", false, futureExp);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> googleAuthService.verifyToken(token));
        assertTrue(ex.getMessage().contains("not verified"));
    }

    @Test
    void testVerifyBlankTokenThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> googleAuthService.verifyToken(""));
        assertThrows(IllegalArgumentException.class, () -> googleAuthService.verifyToken(null));
    }

    @Test
    void testVerifyGarbageTokenThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> googleAuthService.verifyToken("not-a-jwt-token"));
    }
}
