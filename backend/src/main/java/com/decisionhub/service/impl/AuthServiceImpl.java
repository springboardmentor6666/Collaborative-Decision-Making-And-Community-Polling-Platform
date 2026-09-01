package com.decisionhub.service.impl;

import com.decisionhub.common.enums.AccountStatus;
import com.decisionhub.common.enums.AuthProvider;
import com.decisionhub.common.enums.RoleType;
import com.decisionhub.dto.request.AuthRequest;
import com.decisionhub.dto.request.ForgotPasswordRequest;
import com.decisionhub.dto.request.RegisterRequest;
import com.decisionhub.dto.request.ResetPasswordRequest;
import com.decisionhub.dto.request.TokenRefreshRequest;
import com.decisionhub.dto.response.AuthResponse;
import com.decisionhub.dto.response.UserResponse;
import com.decisionhub.entity.Role;
import com.decisionhub.entity.User;
import com.decisionhub.exception.DuplicateException;
import com.decisionhub.exception.EntityNotFoundException;
import com.decisionhub.exception.UnauthorizedException;
import com.decisionhub.mapper.UserMapper;
import com.decisionhub.repository.RoleRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.security.UserPrincipal;
import com.decisionhub.security.jwt.JwtTokenProvider;
import com.decisionhub.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserMapper userMapper;
    private final com.decisionhub.repository.BlacklistedTokenRepository blacklistedTokenRepository;

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        String trimmedUsername = request.getUsername().trim();
        String trimmedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByUsernameIncludingDeleted(trimmedUsername)) {
            throw new DuplicateException("Username '" + trimmedUsername + "' is already taken. Please choose another username.");
        }
        if (userRepository.existsByEmailIncludingDeleted(trimmedEmail)) {
            throw new DuplicateException("Email '" + trimmedEmail + "' is already registered. Please sign in or use a different email.");
        }

        Role userRole = roleRepository.findByRoleName(RoleType.ROLE_USER)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .roleName(RoleType.ROLE_USER)
                        .description("Standard User Role")
                        .build()));

        User user = userMapper.toEntity(request);
        user.setUsername(trimmedUsername);
        user.setEmail(trimmedEmail);
        user.setFullName(request.getFullName().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(userRole);
        user.setProvider(AuthProvider.LOCAL);
        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setEmailVerified(false);

        User savedUser = userRepository.save(user);
        log.info("Successfully registered new user with ID: {}", savedUser.getUserId());
        return userMapper.toResponse(savedUser);
    }

    @Override
    @Transactional
    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsernameOrEmail(), request.getPassword())
        );

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String accessToken = jwtTokenProvider.generateAccessToken(userPrincipal);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userPrincipal);

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new EntityNotFoundException("User", "id", userPrincipal.getId()));

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(userMapper.toResponse(user))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse refreshToken(TokenRefreshRequest request) {
        if (!jwtTokenProvider.validateToken(request.getRefreshToken())) {
            throw new UnauthorizedException("Invalid or expired refresh token.");
        }

        String username = jwtTokenProvider.getUsernameFromToken(request.getRefreshToken());
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User", "username", username));

        UserPrincipal userPrincipal = UserPrincipal.create(
                user.getUserId(), user.getUsername(), user.getEmail(), user.getPassword(),
                user.getRole().getRoleName().name(), user.getAccountStatus() == AccountStatus.ACTIVE, user.isEmailVerified()
        );

        String newAccessToken = jwtTokenProvider.generateAccessToken(userPrincipal);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(userPrincipal);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .user(userMapper.toResponse(user))
                .build();
    }



    @Override
    @Transactional
    public void logout(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        if (org.springframework.util.StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {
            java.util.Date expirationDate = jwtTokenProvider.getExpirationDateFromToken(token);
            com.decisionhub.entity.BlacklistedToken blacklistedToken = com.decisionhub.entity.BlacklistedToken.builder()
                    .token(token)
                    .expiryDate(expirationDate)
                    .build();
            blacklistedTokenRepository.save(blacklistedToken);
            log.info("Token has been blacklisted for logout.");
        }
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("User", "email", request.getEmail()));
        log.info("Password reset request initiated for email: {}", user.getEmail());
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        log.info("Resetting password with provided reset token");
    }
}
