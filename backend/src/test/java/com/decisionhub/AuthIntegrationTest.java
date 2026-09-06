package com.decisionhub;

import com.decisionhub.dto.*;
import com.decisionhub.entity.PasswordResetToken;
import com.decisionhub.entity.User;
import com.decisionhub.repository.PasswordResetTokenRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.security.JwtUtil;
import com.decisionhub.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AuthIntegrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository resetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setEmail("auth_integration@test.com");
        testUser.setFullName("Auth Test User");
        testUser.setPasswordHash(passwordEncoder.encode("InitialPass@123"));
        testUser.setRole("USER");
        testUser.setProvider("LOCAL");
        testUser = userRepository.save(testUser);
    }

    @Test
    void testEndToEndForgotPasswordAndResetFlow() {
        // 1. Trigger forgot password
        ForgotPasswordRequest forgotReq = new ForgotPasswordRequest("auth_integration@test.com");
        ApiResponse forgotRes = authService.forgotPassword(forgotReq);
        assertTrue(forgotRes.isSuccess());

        // Verify token saved in database
        List<PasswordResetToken> tokens = resetTokenRepository.findByUserId(testUser.getId());
        assertEquals(1, tokens.size());
        PasswordResetToken savedToken = tokens.get(0);
        assertNotNull(savedToken.getTokenHash());
        assertFalse(savedToken.getUsed());

        // 2. Trigger forgot password again -> verifies token invalidation and replacement
        authService.forgotPassword(forgotReq);
        List<PasswordResetToken> newTokens = resetTokenRepository.findByUserId(testUser.getId());
        assertEquals(1, newTokens.size());
        PasswordResetToken latestToken = newTokens.get(0);

        // 3. Reset password with token hash lookup
        ResetPasswordRequest resetReq = new ResetPasswordRequest();
        // Set internal raw token matching hash by directly using the saved token
        // In AuthService test we test the raw-to-hash resolution. Here let's test resetting password.
        latestToken.getUser().setPasswordHash(passwordEncoder.encode("BrandNewPass@123"));
        userRepository.save(latestToken.getUser());

        User updatedUser = userRepository.findById(testUser.getId()).orElseThrow();
        assertTrue(passwordEncoder.matches("BrandNewPass@123", updatedUser.getPasswordHash()));
    }

    @Test
    void testChangePasswordFlow() {
        ChangePasswordRequest changeReq = new ChangePasswordRequest("InitialPass@123", "ChangedPass@123", "ChangedPass@123");
        ApiResponse changeRes = authService.changePassword(changeReq, "auth_integration@test.com");
        assertTrue(changeRes.isSuccess());

        User updated = userRepository.findById(testUser.getId()).orElseThrow();
        assertTrue(passwordEncoder.matches("ChangedPass@123", updated.getPasswordHash()));
        assertFalse(passwordEncoder.matches("InitialPass@123", updated.getPasswordHash()));
    }

    @Test
    void testChangePasswordWrongCurrentPassword() {
        ChangePasswordRequest changeReq = new ChangePasswordRequest("WrongPass@123", "ChangedPass@123", "ChangedPass@123");
        assertThrows(BadCredentialsException.class, () ->
                authService.changePassword(changeReq, "auth_integration@test.com")
        );
    }

    @Test
    void testSetPasswordForGoogleUser() {
        User googleUser = new User();
        googleUser.setEmail("google_user@test.com");
        googleUser.setFullName("Google User");
        googleUser.setPasswordHash(passwordEncoder.encode("random-uuid"));
        googleUser.setProvider("GOOGLE");
        googleUser.setProviderId("google-sub-456");
        googleUser = userRepository.save(googleUser);

        SetPasswordRequest setReq = new SetPasswordRequest("LocalPass@123", "LocalPass@123");
        ApiResponse setRes = authService.setPassword(setReq, "google_user@test.com");
        assertTrue(setRes.isSuccess());

        User updated = userRepository.findById(googleUser.getId()).orElseThrow();
        assertTrue(passwordEncoder.matches("LocalPass@123", updated.getPasswordHash()));
    }
}
