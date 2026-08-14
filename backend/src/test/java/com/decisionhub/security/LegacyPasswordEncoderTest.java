package com.decisionhub.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertTrue;

class LegacyPasswordEncoderTest {

    @Test
    void shouldMatchPlaintextLegacyPasswords() {
        PasswordEncoder passwordEncoder = new LegacyPasswordEncoder();

        assertTrue(passwordEncoder.matches("Password123!", "Password123!"));
    }

    @Test
    void shouldMatchBcryptPasswords() {
        PasswordEncoder passwordEncoder = new LegacyPasswordEncoder();
        String encoded = passwordEncoder.encode("Password123!");

        assertTrue(passwordEncoder.matches("Password123!", encoded));
    }
}
