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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: UserService
 * Architecture Tier: Business Service (Service Tier)
 * Package: com.decisionhub.service
 *
 * Purpose:
 *   Manages user account details, profile customization, avatar links, interest preferences, and saved decisions bookmarks.
 */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final com.decisionhub.repository.CategoryRepository categoryRepository;
    private final com.decisionhub.repository.DecisionRepository decisionRepository;
    private final DecisionService decisionService;
    private final com.decisionhub.service.AuditLogService auditLogService;
    private final com.decisionhub.repository.VoteRepository voteRepository;
    private final com.decisionhub.repository.CommentRepository commentRepository;
    private final com.decisionhub.repository.NotificationRepository notificationRepository;
    private final com.decisionhub.repository.CommunityMemberRepository communityMemberRepository;
    private final com.decisionhub.repository.PasswordResetTokenRepository passwordResetTokenRepository;
    private final com.decisionhub.security.oauth.GoogleAuthService googleAuthService;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       @Lazy AuthenticationManager authenticationManager,
                       JwtUtil jwtUtil,
                       com.decisionhub.repository.CategoryRepository categoryRepository,
                       com.decisionhub.repository.DecisionRepository decisionRepository,
                       @Lazy DecisionService decisionService,
                       com.decisionhub.service.AuditLogService auditLogService,
                       com.decisionhub.repository.VoteRepository voteRepository,
                       com.decisionhub.repository.CommentRepository commentRepository,
                       com.decisionhub.repository.NotificationRepository notificationRepository,
                       com.decisionhub.repository.CommunityMemberRepository communityMemberRepository,
                       com.decisionhub.repository.PasswordResetTokenRepository passwordResetTokenRepository,
                       @Lazy com.decisionhub.security.oauth.GoogleAuthService googleAuthService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.categoryRepository = categoryRepository;
        this.decisionRepository = decisionRepository;
        this.decisionService = decisionService;
        this.auditLogService = auditLogService;
        this.voteRepository = voteRepository;
        this.commentRepository = commentRepository;
        this.notificationRepository = notificationRepository;
        this.communityMemberRepository = communityMemberRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.googleAuthService = googleAuthService;
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

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + request.getEmail()));

        String token = jwtUtil.generateToken(authentication.getName());
        return new AuthResponse(token, mapToUserResponse(user));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
        return mapToUserResponse(user);
    }

    @Transactional(readOnly = true)
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
        if (user == null) {
            UserResponse fallback = new UserResponse(
                    null,
                    "Deleted User",
                    "deleted@community.local",
                    "USER",
                    "LOCAL",
                    false,
                    null,
                    "This account has been deleted.",
                    null,
                    false,
                    java.util.Collections.emptySet()
            );
            fallback.setAccountStatus("DELETED");
            return fallback;
        }

        String bio = null;
        String avatar = null;
        try {
            if (user.getProfile() != null) {
                bio = user.getProfile().getBio();
                avatar = user.getProfile().getAvatarUrl();
            }
        } catch (Exception ignored) {
        }
        if (avatar == null && user.getProfileImage() != null) {
            avatar = user.getProfileImage();
        }

        java.util.Set<String> interests = new java.util.HashSet<>();
        try {
            if (user.getInterests() != null) {
                for (com.decisionhub.entity.Category category : user.getInterests()) {
                    interests.add(category.getName());
                }
            }
        } catch (Exception ignored) {
        }

        UserResponse response = new UserResponse(
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
        response.setAccountStatus(user.getAccountStatus() != null ? user.getAccountStatus().name() : "ACTIVE");
        response.setDeactivatedAt(user.getDeactivatedAt());
        response.setDeactivateUntil(user.getDeactivateUntil());
        response.setDeletionRequestedAt(user.getDeletionRequestedAt());
        response.setScheduledDeletionAt(user.getScheduledDeletionAt());
        return response;
    }

    @Transactional
    public UserResponse updateUserProfile(Long id, UserProfileUpdateRequest request, String requesterEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));

        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + requesterEmail));

        // Check permission: must be self or ADMIN
        if (!requester.getId().equals(user.getId()) && !isAdmin(requester)) {
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
        if (!requester.getId().equals(user.getId()) && !isAdmin(requester)) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied. You can only delete your own account.");
        }

        executePermanentDeletion(user, "Requested by " + requesterEmail);
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

    @Transactional
    public UserResponse updateUserRole(Long id, String newRole, String adminEmail) {
        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + adminEmail));

        if (!isAdmin(admin)) {
            throw new org.springframework.security.access.AccessDeniedException("Only ADMIN users can modify roles");
        }

        String formattedRole = newRole != null ? newRole.trim().toUpperCase() : "USER";
        targetUser.setRole(formattedRole);
        User saved = userRepository.save(targetUser);
        return mapToUserResponse(saved);
    }

    @Transactional
    public UserResponse setUserActiveStatus(Long id, boolean isActive, String adminEmail) {
        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + adminEmail));

        if (!isModeratorOrAdmin(admin)) {
            throw new org.springframework.security.access.AccessDeniedException("Only ADMIN or MODERATOR users can ban/deactivate users");
        }

        targetUser.setIsActive(isActive);
        User saved = userRepository.save(targetUser);
        return mapToUserResponse(saved);
    }

    @Transactional
    public UserResponse scheduleAccountDeletion(String userEmail, DeleteAccountRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        if (request == null || request.getConfirmation() == null || !"DELETE".equalsIgnoreCase(request.getConfirmation().trim())) {
            throw new IllegalArgumentException("To confirm deletion, you must type DELETE.");
        }

        user.setAccountStatus(com.decisionhub.entity.AccountStatus.PENDING_DELETION);
        LocalDateTime now = LocalDateTime.now();
        user.setDeletionRequestedAt(now);
        user.setScheduledDeletionAt(now.plusDays(14));
        User saved = userRepository.save(user);

        auditLogService.logAction(userEmail, "SCHEDULE_DELETION", "USER", user.getId(),
                "Scheduled account deletion with 14-day hold until " + user.getScheduledDeletionAt());

        return mapToUserResponse(saved);
    }

    @Transactional
    public UserResponse cancelAccountDeletion(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        if (user.getAccountStatus() != com.decisionhub.entity.AccountStatus.PENDING_DELETION) {
            throw new IllegalStateException("Account is not currently scheduled for deletion.");
        }

        user.setAccountStatus(com.decisionhub.entity.AccountStatus.ACTIVE);
        user.setDeletionRequestedAt(null);
        user.setScheduledDeletionAt(null);
        User saved = userRepository.save(user);

        auditLogService.logAction(userEmail, "CANCEL_DELETION", "USER", user.getId(),
                "Cancelled scheduled account deletion; account restored to ACTIVE");

        return mapToUserResponse(saved);
    }

    @Transactional
    public UserResponse deactivateAccount(String userEmail, DeactivateAccountRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        LocalDateTime until = null;
        if (request != null && request.getCustomUntilDate() != null) {
            if (request.getCustomUntilDate().isBefore(java.time.LocalDate.now())) {
                throw new IllegalArgumentException("Deactivation end date must be in the future.");
            }
            until = request.getCustomUntilDate().atTime(23, 59, 59);
        } else if (request != null && request.getDurationDays() != null && request.getDurationDays() > 0) {
            until = LocalDateTime.now().plusDays(request.getDurationDays());
        } else {
            until = LocalDateTime.now().plusDays(14); // default 14 days
        }

        user.setAccountStatus(com.decisionhub.entity.AccountStatus.DEACTIVATED);
        user.setDeactivatedAt(LocalDateTime.now());
        user.setDeactivateUntil(until);
        User saved = userRepository.save(user);

        auditLogService.logAction(userEmail, "DEACTIVATE_ACCOUNT", "USER", user.getId(),
                "Account deactivated until " + until);

        return mapToUserResponse(saved);
    }

    @Transactional
    public UserResponse reactivateAccount(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        if (user.getAccountStatus() != com.decisionhub.entity.AccountStatus.DEACTIVATED) {
            throw new IllegalStateException("Account is not currently deactivated.");
        }

        user.setAccountStatus(com.decisionhub.entity.AccountStatus.ACTIVE);
        user.setDeactivatedAt(null);
        user.setDeactivateUntil(null);
        User saved = userRepository.save(user);

        auditLogService.logAction(userEmail, "REACTIVATE_ACCOUNT", "USER", user.getId(),
                "Account reactivated back to ACTIVE");

        return mapToUserResponse(saved);
    }

    @Transactional
    public void executePermanentDeletion(User user, String reason) {
        if (user == null || user.getId() == null) return;
        Long userId = user.getId();
        String originalEmail = user.getEmail();

        // 1. Detach collaborative public contributions (anonymize votes, comments, decisions)
        voteRepository.detachUserVotes(userId);
        commentRepository.detachUserComments(userId);
        decisionRepository.detachUserDecisions(userId);

        // 2. Clear private memberships, tokens, notifications
        notificationRepository.deleteByUserId(userId);
        communityMemberRepository.deleteByUserId(userId);
        passwordResetTokenRepository.deleteByUserId(userId);

        // 3. Clear private collections and profile
        if (user.getSavedDecisions() != null) {
            user.getSavedDecisions().clear();
        }
        if (user.getInterests() != null) {
            user.getInterests().clear();
        }
        user.setProfile(null);
        user.setFcmToken(null);
        user.setProfileImage(null);

        // 4. Wipe credentials and scramble email to release original email
        user.setFullName("Deleted User");
        user.setEmail("deleted_" + userId + "_" + UUID.randomUUID().toString().substring(0, 8) + "@deleted.local");
        user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setIsActive(false);
        user.setAccountStatus(com.decisionhub.entity.AccountStatus.DELETED);
        user.setDeletedAt(LocalDateTime.now());
        user.setDeletionRequestedAt(null);
        user.setScheduledDeletionAt(null);
        user.setDeactivatedAt(null);
        user.setDeactivateUntil(null);

        userRepository.save(user);

        auditLogService.logAction(originalEmail, "PERMANENT_DELETE_USER", "USER", userId,
                "Account permanently deleted and anonymized. Reason: " + reason);
    }

    @Transactional
    public void adminPermanentDeleteUser(Long userId, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new UserNotFoundException("Admin not found with email: " + adminEmail));
        if (!isAdmin(admin)) {
            throw new org.springframework.security.access.AccessDeniedException("Only ADMIN users can permanently delete accounts directly.");
        }

        User target = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        executePermanentDeletion(target, "Admin direct permanent deletion by " + adminEmail);
    }

    @Transactional
    public UserResponse adminCancelUserDeletion(Long userId, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new UserNotFoundException("Admin not found with email: " + adminEmail));
        if (!isAdmin(admin)) {
            throw new org.springframework.security.access.AccessDeniedException("Only ADMIN users can cancel deletion.");
        }

        User target = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        target.setAccountStatus(com.decisionhub.entity.AccountStatus.ACTIVE);
        target.setDeletionRequestedAt(null);
        target.setScheduledDeletionAt(null);
        User saved = userRepository.save(target);

        auditLogService.logAction(adminEmail, "ADMIN_CANCEL_DELETION", "USER", target.getId(),
                "Admin cancelled scheduled deletion for user ID: " + target.getId());

        return mapToUserResponse(saved);
    }

    @Transactional
    public void processScheduledDeletions() {
        List<User> pending = userRepository.findByAccountStatusAndScheduledDeletionAtLessThanEqual(
                com.decisionhub.entity.AccountStatus.PENDING_DELETION, LocalDateTime.now()
        );
        for (User u : pending) {
            try {
                executePermanentDeletion(u, "Scheduled 14-day hold period expired");
            } catch (Exception e) {
                // Ignore single failure to allow others to process
            }
        }
    }

    @Transactional
    public void processScheduledReactivations() {
        List<User> expired = userRepository.findByAccountStatusAndDeactivateUntilLessThanEqual(
                com.decisionhub.entity.AccountStatus.DEACTIVATED, LocalDateTime.now()
        );
        for (User u : expired) {
            try {
                u.setAccountStatus(com.decisionhub.entity.AccountStatus.ACTIVE);
                u.setDeactivatedAt(null);
                u.setDeactivateUntil(null);
                userRepository.save(u);
                auditLogService.logAction(u.getEmail(), "AUTO_REACTIVATE_ACCOUNT", "USER", u.getId(),
                        "Deactivation period expired; auto-reactivated to ACTIVE");
            } catch (Exception e) {
                // Ignore single failure
            }
        }
    }

    @Transactional
    public UserResponse connectGoogleAccount(String userEmail, String idToken, String providerId, String email) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        String resolvedProviderId = providerId;
        String resolvedEmail = email;

        if (idToken != null && !idToken.isBlank()) {
            com.decisionhub.dto.GoogleUserInfo info = googleAuthService.verifyToken(idToken);
            resolvedProviderId = info.getProviderId();
            resolvedEmail = info.getEmail();
        }

        if (resolvedProviderId == null || resolvedProviderId.isBlank()) {
            throw new IllegalArgumentException("Google account provider ID or valid Google ID token is required.");
        }

        // 1. Check if another user is already connected to this Google ID
        java.util.Optional<User> existingWithProviderId = userRepository.findByProviderAndProviderId("GOOGLE", resolvedProviderId);
        if (existingWithProviderId.isPresent() && !existingWithProviderId.get().getId().equals(user.getId())) {
            throw new IllegalArgumentException("This Google account is already linked to another DecisionHub account.");
        }

        // 2. Check if the Google email belongs to another user
        if (resolvedEmail != null && !resolvedEmail.isBlank() && !resolvedEmail.equalsIgnoreCase(user.getEmail())) {
            java.util.Optional<User> existingWithEmail = userRepository.findByEmail(resolvedEmail);
            if (existingWithEmail.isPresent() && !existingWithEmail.get().getId().equals(user.getId())) {
                throw new IllegalArgumentException("The email address of this Google account (" + resolvedEmail + ") belongs to another DecisionHub account.");
            }
        }

        user.setProviderId(resolvedProviderId);
        user.setProvider("GOOGLE");
        User saved = userRepository.save(user);

        auditLogService.logAction(userEmail, "CONNECT_GOOGLE", "USER", user.getId(),
                "Connected Google account ID: " + resolvedProviderId);

        return mapToUserResponse(saved);
    }

    private boolean isAdmin(User user) {
        if (user == null || user.getRole() == null) return false;
        String r = user.getRole().trim().toUpperCase();
        return r.contains("ADMIN");
    }

    private boolean isModeratorOrAdmin(User user) {
        if (user == null || user.getRole() == null) return false;
        String r = user.getRole().trim().toUpperCase();
        return r.contains("ADMIN") || r.contains("MODERATOR");
    }
}
