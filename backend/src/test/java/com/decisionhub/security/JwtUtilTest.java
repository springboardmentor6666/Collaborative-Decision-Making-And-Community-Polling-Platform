package com.decisionhub.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class JwtUtilTest {

    @Test
    void shouldCreateTokenWithPlaintextSecret() {
        JwtUtil jwtUtil = new JwtUtil();

        assertDoesNotThrow(() -> {
            java.lang.reflect.Field secretField = JwtUtil.class.getDeclaredField("secret");
            secretField.setAccessible(true);
            secretField.set(jwtUtil, "plain-text-secret");

            java.lang.reflect.Field expirationField = JwtUtil.class.getDeclaredField("expiration");
            expirationField.setAccessible(true);
            expirationField.set(jwtUtil, 86400000L);

            String token = jwtUtil.generateToken("demo@decisionhub.com");
            assertNotNull(token);
        });
    }
}
