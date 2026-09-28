package com.decisionhub.backend.security;

import com.decisionhub.backend.entity.Role;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.repository.UserRepository;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.beans.factory.annotation.Value;

import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
public class OAuth2LoginSuccessHandler
        implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    @Value("${app.frontend-url}")
    private String frontendUrl;

    public OAuth2LoginSuccessHandler(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oauthUser =
                (OAuth2User) authentication.getPrincipal();

        // Get Google user information
        String email =
                oauthUser.getAttribute("email");

        String name =
                oauthUser.getAttribute("name");

        if (email == null) {
            response.sendError(
                    HttpServletResponse.SC_BAD_REQUEST,
                    "Google account email not found"
            );
            return;
        }

        // Check whether user already exists
        User user =
                userRepository.findByEmail(email)
                        .orElseGet(() -> {

                            User newUser = User.builder()
                                    .name(
                                            name != null
                                                    ? name
                                                    : "Google User"
                                    )
                                    .email(email)

                                    /*
                                     * Google users don't use
                                     * our normal password login.
                                     * But password column is currently
                                     * NOT NULL, so store a random
                                     * encoded password.
                                     */
                                    .password(
                                            passwordEncoder.encode(
                                                    UUID.randomUUID().toString()
                                            )
                                    )

                                    .role(Role.USER)
                                    .build();

                            return userRepository.save(newUser);
                        });

        // Generate JWT
        String token =
                jwtService.generateToken(user.getEmail());

        // Redirect to React
        String redirectUrl =
                frontendUrl + "/oauth2/success"
                        + "?token=" + token
                        + "&email=" + email
                        + "&role=" + user.getRole().name();

        response.sendRedirect(redirectUrl);
    }
}