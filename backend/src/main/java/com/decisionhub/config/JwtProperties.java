package com.decisionhub.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Type-safe configuration properties for JWT (JSON Web Token) Security.
 * Binds properties from 'application.security.jwt' in application.yml.
 */
@Configuration
@ConfigurationProperties(prefix = "application.security.jwt")
@Getter
@Setter
public class JwtProperties {

    /**
     * HMAC-SHA512 Secret key used to sign and verify JWT tokens.
     */
    private String secretKey;

    /**
     * Access token validity duration in milliseconds.
     */
    private long expirationMs;

    /**
     * Refresh token validity duration in milliseconds.
     */
    private long refreshTokenExpirationMs;

    /**
     * Token issuer identifier.
     */
    private String issuer;
}
