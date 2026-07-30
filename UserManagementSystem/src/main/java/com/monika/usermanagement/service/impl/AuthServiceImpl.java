package com.monika.usermanagement.service.impl;

import com.monika.usermanagement.dto.JwtAuthResponse;
import com.monika.usermanagement.dto.LoginRequest;
import com.monika.usermanagement.dto.UserRequest;
import com.monika.usermanagement.entity.RefreshToken;
import com.monika.usermanagement.entity.Role;
import com.monika.usermanagement.entity.User;
import com.monika.usermanagement.exception.BadRequestException;
import com.monika.usermanagement.repository.RefreshTokenRepository;
import com.monika.usermanagement.repository.RoleRepository;
import com.monika.usermanagement.repository.UserRepository;
import com.monika.usermanagement.security.JwtService;
import com.monika.usermanagement.service.AuthService;
import com.monika.usermanagement.util.AppConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    @Autowired
    private JwtService jwtService;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public JwtAuthResponse login(LoginRequest loginRequest) {
        log.info("Authenticating user with email: {}", loginRequest.getEmail());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = (User) authentication.getPrincipal();
        String accessToken = jwtService.generateAccessToken(user, user.getEmail());
        String refreshToken = generateAndSaveRefreshToken(user);

        Set<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        log.info("User authenticated successfully with email: {}", loginRequest.getEmail());

        return JwtAuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .email(user.getEmail())
                .roles(roles)
                .build();
    }

    @Override
    public JwtAuthResponse register(UserRequest userRequest) {
        log.info("Registering new user with email: {}", userRequest.getEmail());

        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new BadRequestException(AppConstants.USER_ALREADY_EXISTS);
        }

        User user = new User();
        user.setFirstName(userRequest.getFirstName());
        user.setLastName(userRequest.getLastName());
        user.setEmail(userRequest.getEmail());
        user.setPhone(userRequest.getPhone());
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        user.setProvider("LOCAL");
        user.setEnabled(true);
        user.setAccountLocked(false);

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException(AppConstants.ROLE_NOT_FOUND));
        user.setRoles(java.util.Collections.singletonList(userRole));

        User savedUser = userRepository.save(user);
        log.info("User registered successfully with id: {}", savedUser.getId());

        String accessToken = jwtService.generateAccessToken(savedUser, savedUser.getEmail());
        String refreshToken = generateAndSaveRefreshToken(savedUser);

        Set<String> userRoles = savedUser.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        return JwtAuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .email(savedUser.getEmail())
                .roles(userRoles)
                .build();
    }

    public JwtAuthResponse refreshToken(String refreshToken) {
        log.info("Refreshing access token");

        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BadRequestException("Refresh token is required");
        }

        RefreshToken storedToken = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        if (storedToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(storedToken);
            throw new BadRequestException("Refresh token expired. Please login again.");
        }

        User user = storedToken.getUser();
        String newAccessToken = jwtService.generateAccessToken(user, user.getEmail());
        String newRefreshToken = generateAndSaveRefreshToken(user);

        Set<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        return JwtAuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .email(user.getEmail())
                .roles(roles)
                .build();
    }

    private String generateAndSaveRefreshToken(User user) {
        String rawToken = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();

        RefreshToken refreshToken = RefreshToken.builder()
                .token(rawToken)
                .user(user)
                .expiryDate(LocalDateTime.now().plusSeconds(jwtService.getRefreshTokenExpirationMs() / 1000))
                .build();

        Optional<RefreshToken> existing = refreshTokenRepository.findByUser(user);
        if (existing.isPresent()) {
            refreshTokenRepository.delete(existing.get());
        }

        refreshTokenRepository.save(refreshToken);
        return rawToken;
    }
}