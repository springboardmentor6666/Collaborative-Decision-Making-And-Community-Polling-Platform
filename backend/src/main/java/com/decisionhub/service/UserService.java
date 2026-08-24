package com.decisionhub.service;

import com.decisionhub.dto.*;
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
    private final com.decisionhub.repository.CategoryRepository categoryRepository;
    private final com.decisionhub.repository.DecisionRepository decisionRepository;
    private final DecisionService decisionService;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       @Lazy AuthenticationManager authenticationManager,
                       JwtUtil jwtUtil,
                       com.decisionhub.repository.CategoryRepository categoryRepository,
                       com.decisionhub.repository.DecisionRepository decisionRepository,
                       @Lazy DecisionService decisionService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.categoryRepository = categoryRepository;
        this.decisionRepository = decisionRepository;
        this.decisionService = decisionService;
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
        String bio = null;
        String avatar = null;
        if (user.getProfile() != null) {
            bio = user.getProfile().getBio();
            avatar = user.getProfile().getAvatarUrl();
        } else if (user.getProfileImage() != null) {
            avatar = user.getProfileImage();
        }

        java.util.Set<String> interests = new java.util.HashSet<>();
        if (user.getInterests() != null) {
            for (com.decisionhub.entity.Category category : user.getInterests()) {
                interests.add(category.getName());
            }
        }

        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getProvider(),
                user.getIsActive(),
                user.getCreatedAt(),
                bio,
                avatar,
                user.getIsPublic(),
                interests
        );
    }

    @Transactional
    public UserResponse updateUserProfile(Long id, UserProfileUpdateRequest request, String requesterEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));

        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + requesterEmail));

        // Check permission: must be self or ADMIN
        if (!requester.getId().equals(user.getId()) && !"ADMIN".equalsIgnoreCase(requester.getRole())) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied. You can only update your own profile.");
        }

        if (request.getName() != null) {
            user.setFullName(request.getName().trim());
        }

        com.decisionhub.entity.UserProfile profile = user.getProfile();
        if (profile == null) {
            profile = new com.decisionhub.entity.UserProfile();
            profile.setUser(user);
            user.setProfile(profile);
        }

        if (request.getBio() != null) {
            profile.setBio(request.getBio());
        }

        if (request.getAvatar() != null) {
            profile.setAvatarUrl(request.getAvatar());
        }

        User saved = userRepository.save(user);
        return mapToUserResponse(saved);
    }

    @Transactional
    public void deleteUser(Long id, String requesterEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));

        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + requesterEmail));

        // Check permission: must be self or ADMIN
        if (!requester.getId().equals(user.getId()) && !"ADMIN".equalsIgnoreCase(requester.getRole())) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied. You can only delete your own account.");
        }

        userRepository.delete(user);
    }

    @Transactional(readOnly = true)
    public java.util.Set<com.decisionhub.entity.Category> getUserInterests(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));
        return user.getInterests();
    }

    @Transactional
    public java.util.Set<com.decisionhub.entity.Category> updateUserInterests(java.util.List<Long> categoryIds, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        java.util.Set<com.decisionhub.entity.Category> newInterests = new java.util.HashSet<>();
        for (Long id : categoryIds) {
            com.decisionhub.entity.Category category = categoryRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + id));
            newInterests.add(category);
        }

        user.setInterests(newInterests);
        User saved = userRepository.save(user);
        return saved.getInterests();
    }

    @Transactional
    public boolean toggleProfileVisibility(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        boolean nextVal = !Boolean.TRUE.equals(user.getIsPublic());
        user.setIsPublic(nextVal);
        userRepository.save(user);
        return nextVal;
    }

    @Transactional(readOnly = true)
    public java.util.List<DecisionResponse> getSavedDecisions(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        return user.getSavedDecisions().stream()
                .map(decisionService::mapToDecisionResponse)
                .toList();
    }

    @Transactional
    public java.util.List<DecisionResponse> saveDecision(Long decisionId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        com.decisionhub.entity.Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new com.decisionhub.exception.DecisionNotFoundException("Decision not found with id: " + decisionId));

        user.getSavedDecisions().add(decision);
        User saved = userRepository.save(user);
        return saved.getSavedDecisions().stream()
                .map(decisionService::mapToDecisionResponse)
                .toList();
    }

    @Transactional
    public java.util.List<DecisionResponse> unsaveDecision(Long decisionId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        com.decisionhub.entity.Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new com.decisionhub.exception.DecisionNotFoundException("Decision not found with id: " + decisionId));

        user.getSavedDecisions().remove(decision);
        User saved = userRepository.save(user);
        return saved.getSavedDecisions().stream()
                .map(decisionService::mapToDecisionResponse)
                .toList();
    }
}
