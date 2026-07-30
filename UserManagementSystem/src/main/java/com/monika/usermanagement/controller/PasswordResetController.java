package com.monika.usermanagement.controller;

import com.monika.usermanagement.dto.ForgotPasswordRequest;
import com.monika.usermanagement.dto.ResetPasswordRequest;
import com.monika.usermanagement.response.ApiResponse;
import com.monika.usermanagement.service.PasswordResetService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class PasswordResetController {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetController.class);

    @Autowired
    private PasswordResetService passwordResetService;

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest forgotPasswordRequest) {
        log.info("REST request to initiate password reset for: {}", forgotPasswordRequest.getEmail());
        passwordResetService.initiatePasswordReset(forgotPasswordRequest);
        return new ResponseEntity<>(
                ApiResponse.builder()
                        .success(true)
                        .message("If an account with that email exists, we have sent a password reset link.")
                        .data(null)
                        .build(),
                HttpStatus.OK
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest resetPasswordRequest) {
        log.info("REST request to reset password with token");
        passwordResetService.resetPassword(resetPasswordRequest);
        return new ResponseEntity<>(
                ApiResponse.builder()
                        .success(true)
                        .message("Password reset successfully")
                        .data(null)
                        .build(),
                HttpStatus.OK
        );
    }
}
