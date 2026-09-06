package com.decisionhub.service;

import com.decisionhub.dto.*;
import com.decisionhub.entity.PasswordResetToken;
import com.decisionhub.entity.User;
import com.decisionhub.exception.UserNotFoundException;
import com.decisionhub.repository.PasswordResetTokenRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.security.JwtUtil;
import com.decisionhub.security.oauth.GoogleAuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Locale;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final GoogleAuthService googleAuthService;
    private final JwtUtil jwtUtil;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${app.password-reset.expiry-minutes:30}")
    private long passwordResetExpiryMinutes;

    public AuthService(
            UserService userService,
            UserRepository userRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            GoogleAuthService googleAuthService,
            JwtUtil jwtUtil
    ) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.googleAuthService = googleAuthService;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest request) {
        return userService.register(request);
    }

    public AuthResponse login(LoginRequest request) {
        return userService.login(request);
    }

    @Transactional
    public ApiResponse forgotPassword(ForgotPasswordRequest request) {
        if (request == null || request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }

        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

        userRepository.findByEmail(email).ifPresent(user -> {
            try {
                // 1. Invalidate previous active reset tokens for this user
                passwordResetTokenRepository.deleteByUserId(user.getId());

                // 2. Generate a cryptographically secure random token
                byte[] randomBytes = new byte[32];
                secureRandom.nextBytes(randomBytes);
                String rawToken = HexFormat.of().formatHex(randomBytes);
                String tokenHash = hashToken(rawToken);

                // 3. Save the token hash with expiration
                LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(passwordResetExpiryMinutes);
                PasswordResetToken resetToken = new PasswordResetToken(user, tokenHash, expiresAt);
                passwordResetTokenRepository.save(resetToken);

                // 4. Send password reset email
                String cleanFrontendUrl = frontendUrl.endsWith("/") ? frontendUrl.substring(0, frontendUrl.length() - 1) : frontendUrl;
                String resetLink = cleanFrontendUrl + "/reset-password?token=" + rawToken;
                String subject = "DecisionHub - Password Reset Request";
                String htmlBody = buildPasswordResetEmail(user.getFullName(), resetLink, passwordResetExpiryMinutes);
                emailService.sendHtmlEmail(user.getEmail(), subject, htmlBody);

                log.info("Password reset token generated and email dispatched for user id: {}", user.getId());
            } catch (Exception e) {
                log.error("Failed to process password reset email for user {}: {}", email, e.getMessage());
            }
        });

        // Always return generic response to prevent account enumeration
        return new ApiResponse(true, "If an account exists with this email, a password reset link has been sent.");
    }

    @Transactional
    public ApiResponse resetPassword(ResetPasswordRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Reset password request is required");
        }
        if (request.getToken() == null || request.getToken().isBlank()) {
            throw new IllegalArgumentException("Reset token is required");
        }
        if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {
            throw new IllegalArgumentException("New password is required");
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        String rawToken = request.getToken().trim();
        String tokenHash = hashToken(rawToken);

        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new IllegalArgumentException("Invalid password reset token"));

        if (Boolean.TRUE.equals(resetToken.getUsed())) {
            throw new IllegalArgumentException("Password reset token has already been used");
        }

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Password reset token has expired");
        }

        User user = resetToken.getUser();

        // Prevent reusing the same password
        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("New password cannot be the same as the old password");
        }

        // Update password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Mark token used and clean up all reset tokens for user
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
        passwordResetTokenRepository.deleteByUserId(user.getId());

        log.info("Password reset successfully completed for user id: {}", user.getId());
        return new ApiResponse(true, "Password has been reset successfully.");
    }

    @Transactional
    public ApiResponse changePassword(ChangePasswordRequest request, String userEmail) {
        if (userEmail == null || userEmail.isBlank()) {
            throw new AccessDeniedException("Authentication required");
        }
        if (request == null) {
            throw new IllegalArgumentException("Change password request is required");
        }
        if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
            throw new IllegalArgumentException("Current password is required");
        }
        if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {
            throw new IllegalArgumentException("New password is required");
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        // Prevent reusing the same password
        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("New password cannot be the same as the current password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password changed successfully for user id: {}", user.getId());
        return new ApiResponse(true, "Password changed successfully");
    }

    @Transactional
    public ApiResponse setPassword(SetPasswordRequest request, String userEmail) {
        if (userEmail == null || userEmail.isBlank()) {
            throw new AccessDeniedException("Authentication required");
        }
        if (request == null) {
            throw new IllegalArgumentException("Set password request is required");
        }
        if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {
            throw new IllegalArgumentException("New password is required");
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password set successfully for user id: {}", user.getId());
        return new ApiResponse(true, "Password set successfully");
    }

    @Transactional
    public AuthResponse googleLogin(GoogleLoginRequest request) {
        if (request == null || request.getIdToken() == null || request.getIdToken().isBlank()) {
            throw new IllegalArgumentException("Google ID token is required");
        }

        GoogleUserInfo googleInfo = googleAuthService.verifyToken(request.getIdToken());
        return userService.processOAuthLogin(
                "GOOGLE",
                googleInfo.getProviderId(),
                googleInfo.getEmail(),
                googleInfo.getFullName(),
                googleInfo.getProfileImage()
        );
    }

    @Transactional
    public AuthResponse googleLoginByTokenString(String tokenString) {
        if (tokenString == null || tokenString.isBlank()) {
            throw new IllegalArgumentException("Google ID token is required");
        }
        return googleLogin(new GoogleLoginRequest(tokenString));
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }

    private String buildPasswordResetEmail(String recipientName, String resetUrl, long expiryMinutes) {
        String name = (recipientName != null && !recipientName.isBlank()) ? recipientName : "DecisionHub User";
        return String.format("""
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
                <div style="margin-bottom: 24px;">
                    <h2 style="color: #0f172a; margin: 0 0 8px 0; font-size: 24px; font-weight: 800;">DecisionHub</h2>
                    <p style="color: #64748b; font-size: 14px; margin: 0;">Collaborative Decision-Making Platform</p>
                </div>
                <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
                <h3 style="color: #1e293b; font-size: 18px; font-weight: 700; margin-top: 0;">Password Reset Request</h3>
                <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hello %s,</p>
                <p style="color: #334155; font-size: 15px; line-height: 1.6;">We received a request to reset your password. Click the button below to choose a new password. This link is valid for <strong>%d minutes</strong>.</p>
                <div style="text-align: center; margin: 32px 0;">
                    <a href="%s" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-weight: 700; font-size: 15px; display: inline-block;">Reset Password</a>
                </div>
                <p style="color: #64748b; font-size: 13px; line-height: 1.5;">If the button above does not work, copy and paste the following link into your browser:<br />
                <a href="%s" style="color: #2563eb; word-break: break-all;">%s</a></p>
                <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-top: 24px;">If you did not request a password reset, you can safely ignore this email. Your password will not change.</p>
                <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 16px 0;" />
                <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">&copy; 2026 DecisionHub. All rights reserved.</p>
            </div>
            """, name, expiryMinutes, resetUrl, resetUrl, resetUrl);
    }
}
