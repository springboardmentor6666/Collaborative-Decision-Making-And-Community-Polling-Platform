package com.decisionhub.service.impl;

import com.decisionhub.dto.ForgotPasswordRequest;
import com.decisionhub.dto.ResetPasswordRequest;
import com.decisionhub.entity.PasswordResetToken;
import com.decisionhub.entity.User;
import com.decisionhub.exception.BadRequestException;
import com.decisionhub.exception.ResourceNotFoundException;
import com.decisionhub.repository.PasswordResetTokenRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.EmailService;
import com.decisionhub.service.PasswordResetService;
import com.decisionhub.util.AppConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional
public class PasswordResetServiceImpl implements PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetServiceImpl.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${password.reset.token.expiry-minutes:15}")
    private int tokenExpiryMinutes;

    @Override
    public void initiatePasswordReset(ForgotPasswordRequest forgotPasswordRequest) {
        log.info("Initiating password reset for email: {}", forgotPasswordRequest.getEmail());

        userRepository.findByEmail(forgotPasswordRequest.getEmail()).ifPresent(user -> {
            passwordResetTokenRepository.deleteByUser(user);

            String token = generateSecureToken();

            PasswordResetToken passwordResetToken = PasswordResetToken.builder()
                    .token(token)
                    .user(user)
                    .expiryDate(LocalDateTime.now().plusMinutes(tokenExpiryMinutes))
                    .build();

            passwordResetTokenRepository.save(passwordResetToken);

            emailService.sendPasswordResetEmail(user.getEmail(), "Reset token: " + token);

            log.info("Password reset token generated for email: {}", forgotPasswordRequest.getEmail());
        });
    }

    @Override
    public void resetPassword(ResetPasswordRequest resetPasswordRequest) {
        log.info("Resetting password with token");

        PasswordResetToken passwordResetToken = passwordResetTokenRepository.findByToken(resetPasswordRequest.getToken())
                .orElseThrow(() -> new BadRequestException(AppConstants.INVALID_RESET_TOKEN));

        if (passwordResetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(passwordResetToken);
            throw new BadRequestException(AppConstants.RESET_TOKEN_EXPIRED);
        }

        User user = passwordResetToken.getUser();
        user.setPassword(passwordEncoder.encode(resetPasswordRequest.getNewPassword()));
        userRepository.save(user);

        passwordResetTokenRepository.delete(passwordResetToken);

        log.info("Password reset successfully for user: {}", user.getEmail());
    }

    private String generateSecureToken() {
        SecureRandom secureRandom = new SecureRandom();
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return UUID.nameUUIDFromBytes(bytes).toString();
    }
}
