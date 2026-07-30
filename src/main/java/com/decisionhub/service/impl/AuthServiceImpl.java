package com.decisionhub.service.impl;

import com.decisionhub.dto.JwtAuthResponse;
import com.decisionhub.dto.LoginRequest;
import com.decisionhub.dto.UserRequest;
import com.decisionhub.entity.Role;
import com.decisionhub.entity.User;
import com.decisionhub.exception.BadRequestException;
import com.decisionhub.exception.ConflictException;
import com.decisionhub.repository.RoleRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.security.JwtService;
import com.decisionhub.service.AuthService;
import com.decisionhub.util.AppConstants;
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

import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    @Autowired
    private JwtService jwtService;

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

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found: " + loginRequest.getEmail()));

        String accessToken = jwtService.generateAccessToken(user, user.getEmail());

        Set<String> roles = user.getRoles() != null ? user.getRoles().stream()
                .map(role -> role.getName())
                .collect(Collectors.toSet()) : Collections.emptySet();

        log.info("User authenticated successfully with email: {}", loginRequest.getEmail());

        return JwtAuthResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .email(user.getEmail())
                .roles(roles)
                .build();
    }

    @Override
    public JwtAuthResponse register(UserRequest userRequest) {
        log.info("Registering new user with email: {}", userRequest.getEmail());

        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new ConflictException(AppConstants.USER_ALREADY_EXISTS);
        }

        User user = new User();
        user.setFirstName(userRequest.getFirstName());
        user.setLastName(userRequest.getLastName());
        user.setEmail(userRequest.getEmail());
        user.setPhone(userRequest.getPhone());
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        user.setProvider(AppConstants.PROVIDER_LOCAL);
        user.setEnabled(true);
        user.setAccountLocked(false);

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException(AppConstants.ROLE_NOT_FOUND));
        user.setRoles(Collections.singletonList(userRole));

        User savedUser = userRepository.save(user);
        log.info("User registered successfully with id: {}", savedUser.getId());

        String accessToken = jwtService.generateAccessToken(savedUser, savedUser.getEmail());

        Set<String> userRoles = savedUser.getRoles().stream()
                .map(role -> role.getName())
                .collect(Collectors.toSet());

        return JwtAuthResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .email(savedUser.getEmail())
                .roles(userRoles)
                .build();
    }
}