package com.decisionhub.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/oauth")
@Tag(name = "OAuth", description = "OAuth2 authentication endpoints for Google login")
public class OAuthController {

    @GetMapping("/login")
    @Operation(summary = "Initiate Google OAuth2 login", description = "Redirects the user to Google's OAuth2 consent screen for authentication")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "302", description = "Redirects to Google OAuth2 consent screen")
    public ResponseEntity<Void> initiateGoogleLogin() {
        return ResponseEntity.status(302).header("Location", "/oauth2/authorization/google").build();
    }
}
