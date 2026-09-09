package com.decisionhub.controller;

import com.decisionhub.dto.*;
import com.decisionhub.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: AuthController
 * Architecture Tier: REST API Controller (Presentation Tier)
 * Package: com.decisionhub.controller
 *
 * Purpose:
 *   Handles user authentication, including registration, login credential verification, JWT issuance, silent session refresh, Google OAuth2, and password reset flows.
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user registration, authentication, password management, and OAuth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a new user account and returns a JWT token")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user", description = "Validates user credentials and returns a JWT token")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Forgot password", description = "Sends a password reset link to the email if an account exists")
    public ResponseEntity<ApiResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        ApiResponse response = authService.forgotPassword(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password", description = "Resets the user password using a valid reset token")
    public ResponseEntity<ApiResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        ApiResponse response = authService.resetPassword(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Change password", description = "Changes the password for the authenticated user")
    public ResponseEntity<ApiResponse> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication != null ? authentication.getName() : null;
        ApiResponse response = authService.changePassword(request, userEmail);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/set-password")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Set password", description = "Sets a password for an authenticated user (e.g. OAuth-only accounts)")
    public ResponseEntity<ApiResponse> setPassword(
            @Valid @RequestBody SetPasswordRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication != null ? authentication.getName() : null;
        ApiResponse response = authService.setPassword(request, userEmail);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/google")
    @Operation(summary = "Authenticate with Google", description = "Validates Google ID token and returns JWT token")
    public ResponseEntity<AuthResponse> google(
            @RequestBody(required = false) GoogleLoginRequest bodyRequest,
            @RequestParam(required = false) String token,
            HttpServletResponse response
    ) {
        if (bodyRequest != null && bodyRequest.getIdToken() != null && !bodyRequest.getIdToken().isBlank()) {
            AuthResponse authResponse = authService.googleLogin(bodyRequest);
            return ResponseEntity.ok(authResponse);
        }

        if (token != null && !token.isBlank()) {
            AuthResponse authResponse = authService.googleLoginByTokenString(token);
            return ResponseEntity.ok(authResponse);
        }

        throw new IllegalArgumentException("Google ID token is required");
    }
}
