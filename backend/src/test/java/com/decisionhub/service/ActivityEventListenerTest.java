package com.decisionhub.service;

import com.decisionhub.entity.Activity;
import com.decisionhub.entity.Community;
import com.decisionhub.entity.User;
import com.decisionhub.event.ActivityEvent;
import com.decisionhub.repository.ActivityRepository;
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
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ActivityEventListenerTest {

    @Mock
    private ActivityRepository activityRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CommunityRepository communityRepository;

    @Mock
    private CacheManager cacheManager;

    @Mock
    private Cache cache;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private ActivityEventListener listener;

    private User sampleUser;
    private Community sampleCommunity;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(10L);
        sampleUser.setEmail("alice@example.com");

        sampleCommunity = new Community();
        sampleCommunity.setId(100L);
        sampleCommunity.setName("Java Devs");
    }

    @Test
    void testHandleActivityEventSuccess() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(sampleUser));
        when(communityRepository.findById(100L)).thenReturn(Optional.of(sampleCommunity));
        when(cacheManager.getCache("recentActivities")).thenReturn(cache);

        ActivityEvent event = new ActivityEvent(
                10L,
                "DECISION_CREATED",
                "DECISION",
                50L,
                100L,
                "Created decision: Architecture choice",
                Map.of("decisionId", 50L),
                "PUBLIC"
        );

        listener.handleActivityEvent(event);

        verify(activityRepository, times(1)).save(any(Activity.class));
        verify(cache, times(1)).clear();
    }

    @Test
    void testHandleActivityEventNullEventOrActor() {
        listener.handleActivityEvent(null);
        listener.handleActivityEvent(new ActivityEvent());

        verifyNoInteractions(activityRepository);
    }

    @Test
    void testHandleActivityEventActorNotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        ActivityEvent event = new ActivityEvent(
                999L,
                "VOTE_CAST",
                "VOTE",
                1L,
                null,
                "Voted",
                null,
                "PUBLIC"
        );

        listener.handleActivityEvent(event);

        verifyNoInteractions(activityRepository);
    }

    @Test
    void testHandleActivityEventResilientToRepositoryFailure() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(sampleUser));
        when(activityRepository.save(any(Activity.class))).thenThrow(new RuntimeException("DB Connection Timeout"));

        ActivityEvent event = new ActivityEvent(
                10L,
                "COMMENT_ADDED",
                "COMMENT",
                5L,
                null,
                "Commented",
                null,
                "PUBLIC"
        );

        // Listener must NOT throw exception out
        assertDoesNotThrow(() -> listener.handleActivityEvent(event));
    }
}
