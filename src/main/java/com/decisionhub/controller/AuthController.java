package com.decisionhub.controller;

import com.decisionhub.dto.JwtAuthResponse;
import com.decisionhub.dto.LoginRequest;
import com.decisionhub.dto.UserRequest;
import com.decisionhub.response.ApiResponse;
import com.decisionhub.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Authentication endpoints including login, register, and OAuth2")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a new user account with email, password, first name, and last name",
            responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "User registered successfully",
                            content = @Content(schema = @Schema(implementation = JwtAuthResponse.class))),
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error or user already exists")
            })
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody UserRequest userRequest) {
        log.info("REST request to register user: {}", userRequest.getEmail());
        JwtAuthResponse jwtResponse = authService.register(userRequest);
        return new ResponseEntity<>(
                ApiResponse.builder()
                        .success(true)
                        .message("Registration successful")
                        .data(jwtResponse)
                        .build(),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password", description = "Authenticates a user with email and password and returns JWT access token",
            responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Authentication successful",
                            content = @Content(schema = @Schema(implementation = JwtAuthResponse.class))),
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error or invalid credentials")
            })
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("REST request for authentication: {}", loginRequest.getEmail());
        JwtAuthResponse jwtResponse = authService.login(loginRequest);
        return new ResponseEntity<>(
                ApiResponse.builder()
                        .success(true)
                        .message("Authentication successful")
                        .data(jwtResponse)
                        .build(),
                HttpStatus.OK
        );
    }
}