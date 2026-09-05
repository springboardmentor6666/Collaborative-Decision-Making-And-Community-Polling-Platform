package com.decisionhub;

import com.decisionhub.dto.*;
import com.decisionhub.entity.*;
import com.decisionhub.event.ActivityEvent;
import com.decisionhub.repository.*;
import com.decisionhub.service.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class ActivityIntegrationTest {

    @Autowired
    private ActivityService activityService;

    @Autowired
    private ActivityEventListener activityEventListener;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommunityRepository communityRepository;

    @Autowired
    private CommunityMemberRepository communityMemberRepository;

    @Autowired
    private CommunityService communityService;

    private User alice;
    private User bob;
    private Community techCommunity;

    @BeforeEach
    void setUp() {
        activityRepository.deleteAll();
        communityMemberRepository.deleteAll();
        communityRepository.deleteAll();
        userRepository.deleteAll();

        alice = new User();
        alice.setEmail("alice_act@test.com");
        alice.setPasswordHash("pass");
        alice.setFullName("Alice Act");
        alice = userRepository.save(alice);

        bob = new User();
        bob.setEmail("bob_act@test.com");
        bob.setPasswordHash("pass");
        bob.setFullName("Bob Act");
        bob = userRepository.save(bob);

        techCommunity = new Community();
        techCommunity.setName("Tech Act Community");
        techCommunity.setVisibility("PUBLIC");
        techCommunity.setCreatedBy(alice);
        techCommunity = communityRepository.save(techCommunity);

        CommunityMember aliceMember = new CommunityMember();
        aliceMember.setCommunity(techCommunity);
        aliceMember.setUser(alice);
        aliceMember.setRole("OWNER");
        communityMemberRepository.save(aliceMember);
    }

    @AfterEach
    void tearDown() {
        activityRepository.deleteAll();
        communityMemberRepository.deleteAll();
        communityRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void testDirectEventProcessingAndRetrieval() throws InterruptedException {
        ActivityEvent event = new ActivityEvent(
                alice.getId(),
                "DECISION_CREATED",
                "DECISION",
                999L,
                techCommunity.getId(),
                "Created Cloud Migration Proposal",
                Map.of("decisionId", 999L),
                "PUBLIC"
        );

        activityEventListener.handleActivityEvent(event);

        // Wait up to 2 seconds for async execution to write to DB
        Page<ActivityResponse> feed = null;
        for (int i = 0; i < 20; i++) {
            Thread.sleep(100);
            feed = activityService.getGlobalRecentActivities(null, PageRequest.of(0, 10), null);
            if (!feed.isEmpty()) {
                break;
            }
        }

        assertNotNull(feed);
        assertFalse(feed.isEmpty());
        ActivityResponse latest = feed.getContent().get(0);
        assertEquals("DECISION_CREATED", latest.getActivityType());
        assertEquals("Created Cloud Migration Proposal", latest.getTitle());
        assertEquals(techCommunity.getId(), latest.getCommunityId());
        assertEquals("Tech Act Community", latest.getCommunityName());
    }

    @Test
    void testEndToEndCommunityJoinPublishesActivity() throws InterruptedException {
        communityService.joinCommunity(techCommunity.getId(), bob.getEmail());

        // Wait for async listener to persist
        Page<ActivityResponse> communityFeed = null;
        for (int i = 0; i < 20; i++) {
            Thread.sleep(100);
            communityFeed = activityService.getCommunityActivities(
                    techCommunity.getId(), List.of("COMMUNITY_JOINED"), PageRequest.of(0, 10), bob.getEmail());
            if (!communityFeed.isEmpty()) {
                break;
            }
        }

        assertNotNull(communityFeed);
        assertFalse(communityFeed.isEmpty());
        assertEquals("COMMUNITY_JOINED", communityFeed.getContent().get(0).getActivityType());
    }
}
