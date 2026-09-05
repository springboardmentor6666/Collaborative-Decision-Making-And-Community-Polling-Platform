package com.decisionhub.service;

import com.decisionhub.dto.ActivityResponse;
import com.decisionhub.dto.UserSummaryDto;
import com.decisionhub.entity.Activity;
import com.decisionhub.entity.Community;
import com.decisionhub.entity.CommunityMember;
import com.decisionhub.entity.User;
import com.decisionhub.exception.CommunityNotFoundException;
import com.decisionhub.exception.UserNotFoundException;
import com.decisionhub.repository.ActivityRepository;
import com.decisionhub.repository.CommunityMemberRepository;
import com.decisionhub.repository.CommunityRepository;
import com.decisionhub.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final CommunityRepository communityRepository;
    private final CommunityMemberRepository communityMemberRepository;
    private final ObjectMapper objectMapper;

    public ActivityService(ActivityRepository activityRepository,
                           UserRepository userRepository,
                           CommunityRepository communityRepository,
                           CommunityMemberRepository communityMemberRepository,
                           ObjectMapper objectMapper) {
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
        this.communityRepository = communityRepository;
        this.communityMemberRepository = communityMemberRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "recentActivities", key = "(#types != null ? #types.toString() : 'ALL') + ':' + #pageable.pageNumber + ':' + #pageable.pageSize + ':' + (#currentUserEmail != null ? #currentUserEmail : 'ANON')")
    public Page<ActivityResponse> getGlobalRecentActivities(List<String> types, Pageable pageable, String currentUserEmail) {
        User currentUser = currentUserEmail != null && !currentUserEmail.isBlank()
                ? userRepository.findByEmail(currentUserEmail).orElse(null)
                : null;

        boolean isPlatformAdmin = currentUser != null && "ADMIN".equalsIgnoreCase(currentUser.getRole());

        Page<Activity> activities;
        boolean hasTypeFilter = types != null && !types.isEmpty();

        if (isPlatformAdmin) {
            if (hasTypeFilter) {
                activities = activityRepository.findByVisibilityAndActivityTypeInOrderByCreatedAtDesc("PUBLIC", types, pageable);
            } else {
                activities = activityRepository.findAll(pageable);
            }
        } else if (currentUser != null) {
            List<CommunityMember> memberships = communityMemberRepository.findByUserId(currentUser.getId());
            Set<Long> communityIds = memberships.stream()
                    .map(m -> m.getCommunity().getId())
                    .collect(Collectors.toSet());

            if (!communityIds.isEmpty()) {
                if (hasTypeFilter) {
                    activities = activityRepository.findGlobalForUserWithCommunitiesAndTypes(communityIds, types, pageable);
                } else {
                    activities = activityRepository.findGlobalForUserWithCommunities(communityIds, pageable);
                }
            } else {
                if (hasTypeFilter) {
                    activities = activityRepository.findByVisibilityAndActivityTypeInOrderByCreatedAtDesc("PUBLIC", types, pageable);
                } else {
                    activities = activityRepository.findByVisibilityOrderByCreatedAtDesc("PUBLIC", pageable);
                }
            }
        } else {
            if (hasTypeFilter) {
                activities = activityRepository.findByVisibilityAndActivityTypeInOrderByCreatedAtDesc("PUBLIC", types, pageable);
            } else {
                activities = activityRepository.findByVisibilityOrderByCreatedAtDesc("PUBLIC", pageable);
            }
        }

        return activities.map(this::mapToActivityResponse);
    }

    @Transactional(readOnly = true)
    public Page<ActivityResponse> getCommunityActivities(Long communityId, List<String> types, Pageable pageable, String currentUserEmail) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new CommunityNotFoundException("Community not found with id: " + communityId));

        User currentUser = currentUserEmail != null && !currentUserEmail.isBlank()
                ? userRepository.findByEmail(currentUserEmail).orElse(null)
                : null;

        boolean isPlatformAdmin = currentUser != null && "ADMIN".equalsIgnoreCase(currentUser.getRole());

        if ("PRIVATE".equalsIgnoreCase(community.getVisibility())) {
            if (currentUser == null) {
                throw new AccessDeniedException("Access denied to private community activities");
            }
            if (!isPlatformAdmin && !communityMemberRepository.existsByCommunityIdAndUserId(communityId, currentUser.getId())) {
                throw new AccessDeniedException("Access denied to private community activities");
            }
        }

        Page<Activity> activities;
        if (types != null && !types.isEmpty()) {
            activities = activityRepository.findByCommunityIdAndActivityTypeInOrderByCreatedAtDesc(communityId, types, pageable);
        } else {
            activities = activityRepository.findByCommunityIdOrderByCreatedAtDesc(communityId, pageable);
        }

        return activities.map(this::mapToActivityResponse);
    }

    @Transactional(readOnly = true)
    public Page<ActivityResponse> getUserActivities(Long userId, List<String> types, Pageable pageable, String currentUserEmail) {
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        User currentUser = currentUserEmail != null && !currentUserEmail.isBlank()
                ? userRepository.findByEmail(currentUserEmail).orElse(null)
                : null;

        boolean isSelfOrAdmin = currentUser != null && (currentUser.getId().equals(userId) || "ADMIN".equalsIgnoreCase(currentUser.getRole()));

        Page<Activity> activities;
        boolean hasTypeFilter = types != null && !types.isEmpty();

        if (isSelfOrAdmin) {
            if (hasTypeFilter) {
                activities = activityRepository.findByActorIdAndActivityTypeInOrderByCreatedAtDesc(userId, types, pageable);
            } else {
                activities = activityRepository.findByActorIdOrderByCreatedAtDesc(userId, pageable);
            }
        } else {
            if (hasTypeFilter) {
                activities = activityRepository.findByActorIdAndVisibilityAndActivityTypeInOrderByCreatedAtDesc(userId, "PUBLIC", types, pageable);
            } else {
                activities = activityRepository.findByActorIdAndVisibilityOrderByCreatedAtDesc(userId, "PUBLIC", pageable);
            }
        }

        return activities.map(this::mapToActivityResponse);
    }

    private ActivityResponse mapToActivityResponse(Activity activity) {
        UserSummaryDto actorDto = mapToUserSummaryDto(activity.getActor());
        Map<String, Object> metadataMap = parseMetadata(activity.getMetadata());

        return new ActivityResponse(
                activity.getId(),
                actorDto,
                activity.getActivityType(),
                activity.getEntityType(),
                activity.getEntityId(),
                activity.getCommunity() != null ? activity.getCommunity().getId() : null,
                activity.getCommunity() != null ? activity.getCommunity().getName() : null,
                activity.getTitle(),
                metadataMap,
                activity.getCreatedAt()
        );
    }

    private UserSummaryDto mapToUserSummaryDto(User user) {
        if (user == null) {
            return null;
        }
        return new UserSummaryDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getProfileImage()
        );
    }

    private Map<String, Object> parseMetadata(String json) {
        if (json == null || json.isBlank()) {
            return new HashMap<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return new HashMap<>();
        }
    }
}
