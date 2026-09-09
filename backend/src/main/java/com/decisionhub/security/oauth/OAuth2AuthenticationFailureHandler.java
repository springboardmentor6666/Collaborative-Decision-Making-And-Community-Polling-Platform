package com.decisionhub.security.oauth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: OAuth2AuthenticationFailureHandler
 * Architecture Tier: Security & Authentication (Security Tier)
 * Package: com.decisionhub.security.oauth
 *
 * Purpose:
 *   Spring Security OAuth2 failure handler handling authentication errors during Google OAuth2 login and redirecting with error query params.
 */
@Component
public class OAuth2AuthenticationFailureHandler implements AuthenticationFailureHandler {

    private static final Logger log = LoggerFactory.getLogger(OAuth2AuthenticationFailureHandler.class);

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException {
        log.error("OAuth2 authentication failed: {}", exception.getMessage(), exception);
        response.sendRedirect(frontendUrl + "/login?error=oauth_failed");
    }
}
