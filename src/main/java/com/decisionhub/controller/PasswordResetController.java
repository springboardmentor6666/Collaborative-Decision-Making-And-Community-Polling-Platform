package com.decisionhub.controller;

import com.decisionhub.dto.ForgotPasswordRequest;
import com.decisionhub.dto.ResetPasswordRequest;
import com.decisionhub.response.ApiResponse;
import com.decisionhub.service.PasswordResetService;
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
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/password")
@Tag(name = "Password", description = "Password reset and management endpoints")
public class PasswordResetController {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetController.class);

    @Autowired
    private PasswordResetService passwordResetService;

    @PostMapping("/forgot")
    @Operation(summary = "Request password reset", description = "Sends a password reset link to the user's email if the account exists",
            responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Reset email sent (if account exists)"),
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request")
            })
    public ResponseEntity<ApiResponse> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        log.info("REST request for password reset: {}", request.getEmail());
        passwordResetService.initiatePasswordReset(request);
        return new ResponseEntity<>(
                ApiResponse.builder().success(true).message("If an account with that email exists, we have sent a password reset link.").build(),
                HttpStatus.OK
        );
    }

    @PostMapping("/reset")
    @Operation(summary = "Reset password with token", description = "Resets the user password using a valid reset token")
@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Password reset successful")
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid or expired token")
    public ResponseEntity<ApiResponse> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        log.info("REST request to reset password");
        passwordResetService.resetPassword(request);
        return new ResponseEntity<>(
                ApiResponse.builder().success(true).message("Password reset successfully").build(),
                HttpStatus.OK
        );
    }
}
