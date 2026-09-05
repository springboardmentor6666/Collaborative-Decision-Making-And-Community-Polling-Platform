package com.decisionhub.service;

import com.decisionhub.dto.ActivityResponse;
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
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ActivityServiceTest {

    @Mock
    private ActivityRepository activityRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CommunityRepository communityRepository;

    @Mock
    private CommunityMemberRepository communityMemberRepository;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private ActivityService activityService;

    private User sampleUser;
    private User otherUser;
    private Community publicCommunity;
    private Community privateCommunity;
    private Activity sampleActivity;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setEmail("user@example.com");
        sampleUser.setFullName("Sample User");
        sampleUser.setRole("USER");

        otherUser = new User();
        otherUser.setId(2L);
        otherUser.setEmail("stranger@example.com");
        otherUser.setFullName("Stranger");
        otherUser.setRole("USER");

        publicCommunity = new Community();
        publicCommunity.setId(10L);
        publicCommunity.setName("Public Tech");
        publicCommunity.setVisibility("PUBLIC");

        privateCommunity = new Community();
        privateCommunity.setId(20L);
        privateCommunity.setName("Private Group");
        privateCommunity.setVisibility("PRIVATE");

        sampleActivity = new Activity();
        sampleActivity.setId(100L);
        sampleActivity.setActor(sampleUser);
        sampleActivity.setActivityType("DECISION_CREATED");
        sampleActivity.setEntityType("DECISION");
        sampleActivity.setEntityId(50L);
        sampleActivity.setCommunity(publicCommunity);
        sampleActivity.setTitle("Created Decision");
        sampleActivity.setMetadata("{\"decisionId\":50}");
        sampleActivity.setVisibility("PUBLIC");
        sampleActivity.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void testGetGlobalRecentActivitiesAnonymous() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<Activity> page = new PageImpl<>(List.of(sampleActivity));
        when(activityRepository.findByVisibilityOrderByCreatedAtDesc("PUBLIC", pageable)).thenReturn(page);

        Page<ActivityResponse> result = activityService.getGlobalRecentActivities(null, pageable, null);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("DECISION_CREATED", result.getContent().get(0).getActivityType());
        assertEquals(50, ((Number) result.getContent().get(0).getMetadata().get("decisionId")).intValue());
    }

    @Test
    void testGetGlobalRecentActivitiesWithUserCommunities() {
        Pageable pageable = PageRequest.of(0, 20);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(sampleUser));

        CommunityMember member = new CommunityMember();
        member.setCommunity(privateCommunity);
        when(communityMemberRepository.findByUserId(1L)).thenReturn(List.of(member));

        Page<Activity> page = new PageImpl<>(List.of(sampleActivity));
        when(activityRepository.findGlobalForUserWithCommunities(anySet(), eq(pageable))).thenReturn(page);

        Page<ActivityResponse> result = activityService.getGlobalRecentActivities(null, pageable, "user@example.com");

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void testGetCommunityActivitiesPublicCommunity() {
        Pageable pageable = PageRequest.of(0, 20);
        when(communityRepository.findById(10L)).thenReturn(Optional.of(publicCommunity));

        Page<Activity> page = new PageImpl<>(List.of(sampleActivity));
        when(activityRepository.findByCommunityIdOrderByCreatedAtDesc(10L, pageable)).thenReturn(page);

        Page<ActivityResponse> result = activityService.getCommunityActivities(10L, null, pageable, null);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void testGetCommunityActivitiesPrivateCommunityNonMemberThrows() {
        Pageable pageable = PageRequest.of(0, 20);
        when(communityRepository.findById(20L)).thenReturn(Optional.of(privateCommunity));
        when(userRepository.findByEmail("stranger@example.com")).thenReturn(Optional.of(otherUser));
        when(communityMemberRepository.existsByCommunityIdAndUserId(20L, 2L)).thenReturn(false);

        assertThrows(AccessDeniedException.class, () ->
                activityService.getCommunityActivities(20L, null, pageable, "stranger@example.com")
        );
    }

    @Test
    void testGetUserActivitiesSelfSeesAll() {
        Pageable pageable = PageRequest.of(0, 20);
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(sampleUser));

        Page<Activity> page = new PageImpl<>(List.of(sampleActivity));
        when(activityRepository.findByActorIdOrderByCreatedAtDesc(1L, pageable)).thenReturn(page);

        Page<ActivityResponse> result = activityService.getUserActivities(1L, null, pageable, "user@example.com");

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void testGetUserActivitiesStrangerSeesOnlyPublic() {
        Pageable pageable = PageRequest.of(0, 20);
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(userRepository.findByEmail("stranger@example.com")).thenReturn(Optional.of(otherUser));

        Page<Activity> page = new PageImpl<>(List.of(sampleActivity));
        when(activityRepository.findByActorIdAndVisibilityOrderByCreatedAtDesc(1L, "PUBLIC", pageable)).thenReturn(page);

        Page<ActivityResponse> result = activityService.getUserActivities(1L, null, pageable, "stranger@example.com");

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }
}
