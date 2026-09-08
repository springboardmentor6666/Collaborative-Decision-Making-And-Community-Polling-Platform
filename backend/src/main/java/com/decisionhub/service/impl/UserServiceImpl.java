package com.decisionhub.service.impl;

import com.decisionhub.common.response.PagedResponse;
import com.decisionhub.dto.request.ChangePasswordRequest;
import com.decisionhub.dto.request.UserPreferencesRequest;
import com.decisionhub.dto.request.UserRequest;
import com.decisionhub.dto.response.DecisionResponse;
import com.decisionhub.dto.response.UserDataExportResponse;
import com.decisionhub.dto.response.UserPreferencesResponse;
import com.decisionhub.dto.response.UserResponse;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.SavedDecision;
import com.decisionhub.entity.User;
import com.decisionhub.entity.UserPreference;
import com.decisionhub.exception.BusinessException;
import com.decisionhub.exception.DuplicateException;
import com.decisionhub.exception.EntityNotFoundException;
import com.decisionhub.mapper.DecisionMapper;
import com.decisionhub.mapper.UserMapper;
import com.decisionhub.repository.CommunityMemberRepository;
import com.decisionhub.repository.CommunityRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.SavedDecisionRepository;
import com.decisionhub.repository.UserPreferenceRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.NotificationService;
import com.decisionhub.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final DecisionRepository decisionRepository;
    private final SavedDecisionRepository savedDecisionRepository;
    private final CommunityRepository communityRepository;
    private final CommunityMemberRepository communityMemberRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final NotificationService notificationService;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final DecisionMapper decisionMapper;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", id));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User", "username", username));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(Long userId, UserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", userId));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getProfileImage() != null) user.setProfileImage(request.getProfileImage());
        if (request.getBio() != null) user.setBio(request.getBio());

        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", userId));
        
        List<com.decisionhub.entity.Community> communities = communityRepository.findAllByOwnerUserId(userId);
        if (!communities.isEmpty()) {
            communityRepository.deleteAll(communities);
        }
        
        userRepository.delete(user);
    }

    @Override
    @Transactional
    public UserResponse updateUserStatus(Long userId, com.decisionhub.common.enums.AccountStatus status, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", userId));

        user.setAccountStatus(status);
        User saved = userRepository.save(user);

        // Send notification to user
        String title = switch (status) {
            case SUSPENDED -> "Account Suspended";
            case INACTIVE -> "Account Deactivated";
            case ACTIVE -> "Account Reactivated";
            default -> "Account Status Updated";
        };

        String msg = (reason != null && !reason.trim().isEmpty())
                ? "Your account status has been updated to " + status + ". Reason: " + reason
                : "Your account status has been updated to " + status + " by administrators.";

        notificationService.sendNotification(userId, title, msg, com.decisionhub.common.enums.NotificationType.SYSTEM);

        return userMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getAllUsers(Pageable pageable) {
        Page<UserResponse> users = userRepository.findAll(pageable).map(userMapper::toResponse);
        return PagedResponse.fromPage(users);
    }



    @Override
    @Transactional
    public void saveDecision(Long userId, Long decisionId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", userId));
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new EntityNotFoundException("Decision", "id", decisionId));

        if (savedDecisionRepository.existsByUserUserIdAndDecisionDecisionId(userId, decisionId)) {
            throw new DuplicateException("Decision is already saved.");
        }

        savedDecisionRepository.save(SavedDecision.builder().user(user).decision(decision).build());
    }

    @Override
    @Transactional
    public void unsaveDecision(Long userId, Long decisionId) {
        savedDecisionRepository.deleteByUserUserIdAndDecisionDecisionId(userId, decisionId);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DecisionResponse> getSavedDecisions(Long userId, Pageable pageable) {
        Page<DecisionResponse> page = savedDecisionRepository.findByUserUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(saved -> decisionMapper.toResponse(saved.getDecision()));
        return PagedResponse.fromPage(page);
    }

    @Override
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", userId));

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException("New password and confirmation password do not match.");
        }

        if (user.getProvider() == com.decisionhub.common.enums.AuthProvider.LOCAL && user.getPassword() != null && !user.getPassword().isEmpty()) {
            if (request.getCurrentPassword() == null || request.getCurrentPassword().trim().isEmpty()) {
                throw new BusinessException("Current password is required.");
            }
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new BusinessException("Current password is incorrect.");
            }
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new BusinessException("New password cannot be the same as the current password.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        notificationService.sendNotification(userId, "Password Changed",
                "Your account password was successfully updated.",
                com.decisionhub.common.enums.NotificationType.SYSTEM);
    }

    @Override
    @Transactional
    public UserPreferencesResponse getPreferences(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", userId));

        UserPreference preference = userPreferenceRepository.findByUserUserId(userId)
                .orElseGet(() -> userPreferenceRepository.save(UserPreference.builder().user(user).build()));

        return mapPreferenceToResponse(preference);
    }

    @Override
    @Transactional
    public UserPreferencesResponse updatePreferences(Long userId, UserPreferencesRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", userId));

        UserPreference preference = userPreferenceRepository.findByUserUserId(userId)
                .orElseGet(() -> UserPreference.builder().user(user).build());

        if (request.getEmailDigest() != null) preference.setEmailDigest(request.getEmailDigest());
        if (request.getNotifyNewDecisions() != null) preference.setNotifyNewDecisions(request.getNotifyNewDecisions());
        if (request.getNotifyVoteDeadlines() != null) preference.setNotifyVoteDeadlines(request.getNotifyVoteDeadlines());
        if (request.getNotifyDecisionResults() != null) preference.setNotifyDecisionResults(request.getNotifyDecisionResults());
        if (request.getNotifyCommentsAndMentions() != null) preference.setNotifyCommentsAndMentions(request.getNotifyCommentsAndMentions());
        if (request.getNotifyElections() != null) preference.setNotifyElections(request.getNotifyElections());
        if (request.getInAppNotifications() != null) preference.setInAppNotifications(request.getInAppNotifications());

        if (request.getDefaultVotingMode() != null) preference.setDefaultVotingMode(request.getDefaultVotingMode());
        if (request.getActivityVisibility() != null) preference.setActivityVisibility(request.getActivityVisibility());
        if (request.getShowBadges() != null) preference.setShowBadges(request.getShowBadges());

        if (request.getTimezone() != null) preference.setTimezone(request.getTimezone());
        if (request.getTheme() != null) preference.setTheme(request.getTheme());
        if (request.getFeedDensity() != null) preference.setFeedDensity(request.getFeedDensity());

        UserPreference saved = userPreferenceRepository.save(preference);
        return mapPreferenceToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDataExportResponse exportUserData(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", userId));

        UserResponse userResponse = userMapper.toResponse(user);
        UserPreferencesResponse preferencesResponse = getPreferences(userId);

        long createdDecisionsCount = decisionRepository.countByCreatedByUserId(userId);
        long savedDecisionsCount = savedDecisionRepository.countByUserUserId(userId);
        long communitiesCount = communityMemberRepository.countByUserUserIdAndStatus(userId, com.decisionhub.common.enums.MemberStatus.ACTIVE);

        return UserDataExportResponse.builder()
                .profile(userResponse)
                .preferences(preferencesResponse)
                .totalCreatedDecisions(createdDecisionsCount)
                .totalSavedDecisions(savedDecisionsCount)
                .totalCommunitiesJoined(communitiesCount)
                .exportGeneratedAt(LocalDateTime.now())
                .exportNotice("This file contains all account information, configured preferences, and platform statistics exported per DecisionHub Data Portability standards.")
                .build();
    }

    private UserPreferencesResponse mapPreferenceToResponse(UserPreference p) {
        return UserPreferencesResponse.builder()
                .id(p.getId())
                .userId(p.getUser().getUserId())
                .emailDigest(p.getEmailDigest())
                .notifyNewDecisions(p.isNotifyNewDecisions())
                .notifyVoteDeadlines(p.isNotifyVoteDeadlines())
                .notifyDecisionResults(p.isNotifyDecisionResults())
                .notifyCommentsAndMentions(p.isNotifyCommentsAndMentions())
                .notifyElections(p.isNotifyElections())
                .inAppNotifications(p.isInAppNotifications())
                .defaultVotingMode(p.getDefaultVotingMode())
                .activityVisibility(p.getActivityVisibility())
                .showBadges(p.isShowBadges())
                .timezone(p.getTimezone())
                .theme(p.getTheme())
                .feedDensity(p.getFeedDensity())
                .build();
    }
}
