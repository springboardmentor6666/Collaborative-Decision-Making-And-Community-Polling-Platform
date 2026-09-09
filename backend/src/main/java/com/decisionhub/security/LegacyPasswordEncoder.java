package com.decisionhub.security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: LegacyPasswordEncoder
 * Architecture Tier: Security & Authentication (Security Tier)
 * Package: com.decisionhub.security
 *
 * Purpose:
 *   Password encoder adapter providing BCrypt hashing and backward compatibility with existing password formats.
 */

public class LegacyPasswordEncoder implements PasswordEncoder {

    private final PasswordEncoder bcrypt = new BCryptPasswordEncoder();

    @Override
    public String encode(CharSequence rawPassword) {
        return bcrypt.encode(rawPassword);
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        if (rawPassword == null || encodedPassword == null) {
            return false;
        }

        if (encodedPassword.equals(rawPassword.toString())) {
            return true;
        }

        if (encodedPassword.startsWith("$2a$") || encodedPassword.startsWith("$2b$") || encodedPassword.startsWith("$2y$")) {
            try {
                return bcrypt.matches(rawPassword, encodedPassword);
            } catch (Exception ignored) {
                return false;
            }
        }

        return false;
    }
}
