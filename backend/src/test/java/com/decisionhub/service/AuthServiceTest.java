package com.decisionhub.service;

import com.decisionhub.dto.*;
import com.decisionhub.entity.PasswordResetToken;
import com.decisionhub.entity.User;
import com.decisionhub.exception.UserNotFoundException;
import com.decisionhub.repository.PasswordResetTokenRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.security.JwtUtil;
import com.decisionhub.security.oauth.GoogleAuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @Mock
    private GoogleAuthService googleAuthService;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "frontendUrl", "http://localhost:3000");
        ReflectionTestUtils.setField(authService, "passwordResetExpiryMinutes", 30L);

        sampleUser = new User();
        sampleUser.setId(10L);
        sampleUser.setEmail("alice@example.com");
        sampleUser.setFullName("Alice User");
        sampleUser.setPasswordHash("hashed_old_password");
        sampleUser.setRole("USER");
        sampleUser.setProvider("LOCAL");
    }

    // ==========================================
    // FORGOT PASSWORD TESTS
    // ==========================================

    @Test
    void testForgotPasswordValidEmailUserExists() {
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordResetTokenRepository.save(any(PasswordResetToken.class))).thenAnswer(inv -> inv.getArgument(0));

        ForgotPasswordRequest request = new ForgotPasswordRequest("alice@example.com");
        ApiResponse response = authService.forgotPassword(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("If an account exists with this email, a password reset link has been sent.", response.getMessage());

        verify(passwordResetTokenRepository, times(1)).deleteByUserId(sampleUser.getId());
        verify(passwordResetTokenRepository, times(1)).save(any(PasswordResetToken.class));
        verify(emailService, times(1)).sendHtmlEmail(eq("alice@example.com"), anyString(), anyString());
    }

    @Test
    void testForgotPasswordUnknownEmailReturnsGenericSuccessWithoutLeaking() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        ForgotPasswordRequest request = new ForgotPasswordRequest("unknown@example.com");
        ApiResponse response = authService.forgotPassword(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("If an account exists with this email, a password reset link has been sent.", response.getMessage());

        verify(passwordResetTokenRepository, never()).save(any());
        verify(emailService, never()).sendHtmlEmail(anyString(), anyString(), anyString());
    }

    @Test
    void testForgotPasswordEmptyEmailThrowsException() {
        ForgotPasswordRequest request = new ForgotPasswordRequest("");
        assertThrows(IllegalArgumentException.class, () -> authService.forgotPassword(request));
    }

    @Test
    void testForgotPasswordMultipleRequestsInvalidatesPreviousTokens() {
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(sampleUser));

        authService.forgotPassword(new ForgotPasswordRequest("alice@example.com"));
        authService.forgotPassword(new ForgotPasswordRequest("alice@example.com"));

        verify(passwordResetTokenRepository, times(2)).deleteByUserId(sampleUser.getId());
        verify(passwordResetTokenRepository, times(2)).save(any(PasswordResetToken.class));
    }

    // ==========================================
    // RESET PASSWORD TESTS
    // ==========================================

    @Test
    void testResetPasswordValidTokenSuccess() {
        String rawToken = "my-secure-reset-token-123456789";
        String tokenHash = (String) ReflectionTestUtils.invokeMethod(authService, "hashToken", rawToken);

        PasswordResetToken resetToken = new PasswordResetToken(sampleUser, tokenHash, LocalDateTime.now().plusMinutes(20));
        when(passwordResetTokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(resetToken));
        when(passwordEncoder.matches("NewPass@123", "hashed_old_password")).thenReturn(false);
        when(passwordEncoder.encode("NewPass@123")).thenReturn("hashed_new_password");

        ResetPasswordRequest request = new ResetPasswordRequest(rawToken, "NewPass@123", "NewPass@123");
        ApiResponse response = authService.resetPassword(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("Password has been reset successfully.", response.getMessage());

        assertEquals("hashed_new_password", sampleUser.getPasswordHash());
        assertTrue(resetToken.getUsed());
        verify(userRepository, times(1)).save(sampleUser);
        verify(passwordResetTokenRepository, times(1)).deleteByUserId(sampleUser.getId());
    }

    @Test
    void testResetPasswordInvalidTokenThrowsException() {
        when(passwordResetTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.empty());

        ResetPasswordRequest request = new ResetPasswordRequest("invalid-token", "NewPass@123", "NewPass@123");
        assertThrows(IllegalArgumentException.class, () -> authService.resetPassword(request));
    }

    @Test
    void testResetPasswordExpiredTokenThrowsException() {
        String rawToken = "expired-token";
        String tokenHash = (String) ReflectionTestUtils.invokeMethod(authService, "hashToken", rawToken);

        PasswordResetToken expiredToken = new PasswordResetToken(sampleUser, tokenHash, LocalDateTime.now().minusMinutes(5));
        when(passwordResetTokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(expiredToken));

        ResetPasswordRequest request = new ResetPasswordRequest(rawToken, "NewPass@123", "NewPass@123");
        assertThrows(IllegalArgumentException.class, () -> authService.resetPassword(request));
    }

    @Test
    void testResetPasswordUsedTokenThrowsException() {
        String rawToken = "already-used-token";
        String tokenHash = (String) ReflectionTestUtils.invokeMethod(authService, "hashToken", rawToken);

        PasswordResetToken usedToken = new PasswordResetToken(sampleUser, tokenHash, LocalDateTime.now().plusMinutes(20));
        usedToken.setUsed(true);
        when(passwordResetTokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(usedToken));

        ResetPasswordRequest request = new ResetPasswordRequest(rawToken, "NewPass@123", "NewPass@123");
        assertThrows(IllegalArgumentException.class, () -> authService.resetPassword(request));
    }

    @Test
    void testResetPasswordMismatchThrowsException() {
        ResetPasswordRequest request = new ResetPasswordRequest("token", "NewPass@123", "DifferentPass@123");
        assertThrows(IllegalArgumentException.class, () -> authService.resetPassword(request));
    }

    @Test
    void testResetPasswordSameAsOldPasswordThrowsException() {
        String rawToken = "token";
        String tokenHash = (String) ReflectionTestUtils.invokeMethod(authService, "hashToken", rawToken);

        PasswordResetToken resetToken = new PasswordResetToken(sampleUser, tokenHash, LocalDateTime.now().plusMinutes(20));
        when(passwordResetTokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(resetToken));
        when(passwordEncoder.matches("OldPass@123", "hashed_old_password")).thenReturn(true);

        ResetPasswordRequest request = new ResetPasswordRequest(rawToken, "OldPass@123", "OldPass@123");
        assertThrows(IllegalArgumentException.class, () -> authService.resetPassword(request));
    }

    // ==========================================
    // CHANGE PASSWORD TESTS
    // ==========================================

    @Test
    void testChangePasswordSuccess() {
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("CurrentPass@123", "hashed_old_password")).thenReturn(true);
        when(passwordEncoder.matches("NewPass@123", "hashed_old_password")).thenReturn(false);
        when(passwordEncoder.encode("NewPass@123")).thenReturn("hashed_new_password");

        ChangePasswordRequest request = new ChangePasswordRequest("CurrentPass@123", "NewPass@123", "NewPass@123");
        ApiResponse response = authService.changePassword(request, "alice@example.com");

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("Password changed successfully", response.getMessage());
        assertEquals("hashed_new_password", sampleUser.getPasswordHash());
        verify(userRepository, times(1)).save(sampleUser);
    }

    @Test
    void testChangePasswordWrongCurrentPasswordThrowsBadCredentials() {
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("WrongPass@123", "hashed_old_password")).thenReturn(false);

        ChangePasswordRequest request = new ChangePasswordRequest("WrongPass@123", "NewPass@123", "NewPass@123");
        assertThrows(BadCredentialsException.class, () -> authService.changePassword(request, "alice@example.com"));
    }

    @Test
    void testChangePasswordMismatchThrowsException() {
        ChangePasswordRequest request = new ChangePasswordRequest("CurrentPass@123", "NewPass@123", "Mismatch@123");
        assertThrows(IllegalArgumentException.class, () -> authService.changePassword(request, "alice@example.com"));
    }

    @Test
    void testChangePasswordSameAsOldThrowsException() {
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("OldPass@123", "hashed_old_password")).thenReturn(true);

        ChangePasswordRequest request = new ChangePasswordRequest("OldPass@123", "OldPass@123", "OldPass@123");
        assertThrows(IllegalArgumentException.class, () -> authService.changePassword(request, "alice@example.com"));
    }

    @Test
    void testChangePasswordUnauthenticatedThrowsAccessDenied() {
        ChangePasswordRequest request = new ChangePasswordRequest("CurrentPass@123", "NewPass@123", "NewPass@123");
        assertThrows(AccessDeniedException.class, () -> authService.changePassword(request, null));
    }

    // ==========================================
    // SET PASSWORD TESTS
    // ==========================================

    @Test
    void testSetPasswordSuccess() {
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.encode("SetNewPass@123")).thenReturn("hashed_set_password");

        SetPasswordRequest request = new SetPasswordRequest("SetNewPass@123", "SetNewPass@123");
        ApiResponse response = authService.setPassword(request, "alice@example.com");

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("Password set successfully", response.getMessage());
        assertEquals("hashed_set_password", sampleUser.getPasswordHash());
        verify(userRepository, times(1)).save(sampleUser);
    }

    @Test
    void testSetPasswordMismatchThrowsException() {
        SetPasswordRequest request = new SetPasswordRequest("SetNewPass@123", "DifferentPass@123");
        assertThrows(IllegalArgumentException.class, () -> authService.setPassword(request, "alice@example.com"));
    }

    // ==========================================
    // GOOGLE LOGIN TESTS
    // ==========================================

    @Test
    void testGoogleLoginSuccess() {
        GoogleUserInfo googleInfo = new GoogleUserInfo("google-999", "googleuser@example.com", "Google User", "https://img.test/pic", true);
        when(googleAuthService.verifyToken("valid-id-token")).thenReturn(googleInfo);

        UserResponse userResponse = new UserResponse(99L, "Google User", "googleuser@example.com", "USER", "GOOGLE", true, LocalDateTime.now(), null, "https://img.test/pic", true, java.util.Set.of());
        AuthResponse mockAuthResponse = new AuthResponse("jwt-google-token", userResponse);

        when(userService.processOAuthLogin("GOOGLE", "google-999", "googleuser@example.com", "Google User", "https://img.test/pic"))
                .thenReturn(mockAuthResponse);

        GoogleLoginRequest request = new GoogleLoginRequest("valid-id-token");
        AuthResponse result = authService.googleLogin(request);

        assertNotNull(result);
        assertEquals("jwt-google-token", result.getToken());
        assertEquals("googleuser@example.com", result.getUser().getEmail());
    }

    @Test
    void testGoogleLoginEmptyTokenThrowsException() {
        GoogleLoginRequest request = new GoogleLoginRequest("");
        assertThrows(IllegalArgumentException.class, () -> authService.googleLogin(request));
    }
}
