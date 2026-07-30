package com.monika.usermanagement.controller;

import com.monika.usermanagement.dto.JwtAuthResponse;
import com.monika.usermanagement.dto.LoginRequest;
import com.monika.usermanagement.dto.RefreshTokenRequest;
import com.monika.usermanagement.dto.UserRequest;
import com.monika.usermanagement.response.ApiResponse;
import com.monika.usermanagement.service.AuthService;
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
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
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

    @PostMapping("/register")
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

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest refreshTokenRequest) {
        log.info("REST request to refresh access token");
        JwtAuthResponse jwtResponse = authService.refreshToken(refreshTokenRequest.getRefreshToken());
        return new ResponseEntity<>(
                ApiResponse.builder()
                        .success(true)
                        .message("Token refreshed successfully")
                        .data(jwtResponse)
                        .build(),
                HttpStatus.OK
        );
    }
}