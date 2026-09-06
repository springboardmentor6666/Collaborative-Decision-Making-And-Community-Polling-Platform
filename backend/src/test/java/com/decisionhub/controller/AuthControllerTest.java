package com.decisionhub.controller;

import com.decisionhub.dto.*;
import com.decisionhub.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthController authController;

    private UserResponse sampleUserResponse;
    private AuthResponse sampleAuthResponse;

    @BeforeEach
    void setUp() {
        sampleUserResponse = new UserResponse(
                1L, "Alice User", "alice@example.com", "USER", "LOCAL", true, LocalDateTime.now(), null, null, true, Set.of()
        );
        sampleAuthResponse = new AuthResponse("jwt-token-xyz", sampleUserResponse);
    }

    @Test
    void testRegisterEndpoint() {
        RegisterRequest request = new RegisterRequest("Alice User", "alice@example.com", "Password@123");
        when(authService.register(any(RegisterRequest.class))).thenReturn(sampleAuthResponse);

        ResponseEntity<AuthResponse> response = authController.register(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("jwt-token-xyz", response.getBody().getToken());
    }

    @Test
    void testLoginEndpoint() {
        LoginRequest request = new LoginRequest("alice@example.com", "Password@123");
        when(authService.login(any(LoginRequest.class))).thenReturn(sampleAuthResponse);

        ResponseEntity<AuthResponse> response = authController.login(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("jwt-token-xyz", response.getBody().getToken());
    }

    @Test
    void testForgotPasswordEndpoint() {
        ForgotPasswordRequest request = new ForgotPasswordRequest("alice@example.com");
        ApiResponse apiResponse = new ApiResponse(true, "If an account exists with this email, a password reset link has been sent.");
        when(authService.forgotPassword(any(ForgotPasswordRequest.class))).thenReturn(apiResponse);

        ResponseEntity<ApiResponse> response = authController.forgotPassword(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
    }

    @Test
    void testResetPasswordEndpoint() {
        ResetPasswordRequest request = new ResetPasswordRequest("token123", "NewPass@123", "NewPass@123");
        ApiResponse apiResponse = new ApiResponse(true, "Password has been reset successfully.");
        when(authService.resetPassword(any(ResetPasswordRequest.class))).thenReturn(apiResponse);

        ResponseEntity<ApiResponse> response = authController.resetPassword(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
    }

    @Test
    void testChangePasswordEndpoint() {
        when(authentication.getName()).thenReturn("alice@example.com");
        ChangePasswordRequest request = new ChangePasswordRequest("OldPass@123", "NewPass@123", "NewPass@123");
        ApiResponse apiResponse = new ApiResponse(true, "Password changed successfully");
        when(authService.changePassword(any(ChangePasswordRequest.class), eq("alice@example.com"))).thenReturn(apiResponse);

        ResponseEntity<ApiResponse> response = authController.changePassword(request, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
    }

    @Test
    void testSetPasswordEndpoint() {
        when(authentication.getName()).thenReturn("alice@example.com");
        SetPasswordRequest request = new SetPasswordRequest("NewPass@123", "NewPass@123");
        ApiResponse apiResponse = new ApiResponse(true, "Password set successfully");
        when(authService.setPassword(any(SetPasswordRequest.class), eq("alice@example.com"))).thenReturn(apiResponse);

        ResponseEntity<ApiResponse> response = authController.setPassword(request, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
    }

    @Test
    void testGoogleLoginWithRequestBody() {
        GoogleLoginRequest request = new GoogleLoginRequest("google-id-token");
        when(authService.googleLogin(any(GoogleLoginRequest.class))).thenReturn(sampleAuthResponse);

        ResponseEntity<AuthResponse> response = authController.google(request, null, null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("jwt-token-xyz", response.getBody().getToken());
    }

    @Test
    void testGoogleLoginWithQueryParamToken() {
        when(authService.googleLoginByTokenString("token-query")).thenReturn(sampleAuthResponse);

        ResponseEntity<AuthResponse> response = authController.google(null, "token-query", null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("jwt-token-xyz", response.getBody().getToken());
    }

    @Test
    void testGoogleLoginWithoutTokenThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> authController.google(null, null, null));
    }
}
