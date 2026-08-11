package com.decisionhub.service;

import com.decisionhub.dto.AuthResponse;
import com.decisionhub.dto.LoginRequest;
import com.decisionhub.dto.RegisterRequest;
import com.decisionhub.dto.UserResponse;
import com.decisionhub.entity.User;
import com.decisionhub.exception.UserNotFoundException;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.security.JwtUtil;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       @Lazy AuthenticationManager authenticationManager,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already in use: " + request.getEmail());
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");
        user.setProvider("LOCAL");

        User savedUser = userRepository.save(user);
        String token = jwtUtil.generateToken(savedUser.getEmail());

        return new AuthResponse(token, mapToUserResponse(savedUser));
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + request.getEmail()));

        String token = jwtUtil.generateToken(authentication.getName());
        return new AuthResponse(token, mapToUserResponse(user));
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .toList();
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
        return mapToUserResponse(user);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
    }

    @Transactional
    public AuthResponse processOAuthLogin(String provider, String providerId, String email, String fullName, String profileImage) {
        String normalizedProvider = provider == null ? "LOCAL" : provider.toUpperCase(Locale.ROOT);
        String normalizedEmail = email == null ? null : email.trim().toLowerCase(Locale.ROOT);

        if (normalizedEmail == null || normalizedEmail.isBlank()) {
            throw new IllegalArgumentException("Email not available from provider: " + normalizedProvider);
        }

        User user = userRepository.findByProviderAndProviderId(normalizedProvider, providerId)
                .orElseGet(() -> userRepository.findByEmail(normalizedEmail).orElse(null));

        if (user == null) {
            user = new User();
            user.setEmail(normalizedEmail);
            user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
            user.setRole("USER");
            user.setProvider(normalizedProvider);
        }

        if (user.getProvider() == null || user.getProvider().isBlank()) {
            user.setProvider(normalizedProvider);
        }

        if (user.getProviderId() == null || user.getProviderId().isBlank()) {
            user.setProviderId(providerId);
        } else if (!user.getProviderId().equals(providerId)) {
            user.setProviderId(providerId);
        }

        if (user.getProvider().equalsIgnoreCase("LOCAL") && !normalizedProvider.equalsIgnoreCase("LOCAL")) {
            user.setProvider(normalizedProvider);
        }

        if (user.getFullName() == null || user.getFullName().isBlank()) {
            user.setFullName(fullName);
        }

        if (fullName != null && !fullName.isBlank() && (user.getFullName() == null || user.getFullName().isBlank())) {
            user.setFullName(fullName);
        }

        if (profileImage != null && !profileImage.isBlank()) {
            user.setProfileImage(profileImage);
        }

        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("USER");
        }

        if (user.getIsActive() == null) {
            user.setIsActive(true);
        }

        User savedUser = userRepository.save(user);
        String token = jwtUtil.generateToken(savedUser.getEmail());
        return new AuthResponse(token, mapToUserResponse(savedUser));
    }

    public UserResponse mapToUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getProvider(),
                user.getIsActive(),
                user.getCreatedAt()
        );
    }
}
