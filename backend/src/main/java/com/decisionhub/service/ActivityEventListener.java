package com.decisionhub.service;

import com.decisionhub.entity.Activity;
import com.decisionhub.entity.Community;
import com.decisionhub.entity.User;
import com.decisionhub.event.ActivityEvent;
import com.decisionhub.repository.ActivityRepository;
import com.decisionhub.repository.CommunityRepository;
import com.decisionhub.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class ActivityEventListener {

    private static final Logger log = LoggerFactory.getLogger(ActivityEventListener.class);

    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final CommunityRepository communityRepository;
    private final CacheManager cacheManager;
    private final ObjectMapper objectMapper;

    public ActivityEventListener(ActivityRepository activityRepository,
                                 UserRepository userRepository,
                                 CommunityRepository communityRepository,
                                 CacheManager cacheManager,
                                 ObjectMapper objectMapper) {
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
        this.communityRepository = communityRepository;
        this.cacheManager = cacheManager;
        this.objectMapper = objectMapper;
    }

    @Async
    @EventListener
    public void handleActivityEvent(ActivityEvent event) {
        if (event == null || event.getActorId() == null) {
            return;
        }

        try {
            User actor = userRepository.findById(event.getActorId()).orElse(null);
            if (actor == null) {
                log.warn("Cannot log activity: Actor not found with id {}", event.getActorId());
                return;
            }

            Community community = null;
            if (event.getCommunityId() != null) {
                community = communityRepository.findById(event.getCommunityId()).orElse(null);
            }

            String metadataJson = null;
            if (event.getMetadata() != null && !event.getMetadata().isEmpty()) {
                try {
                    metadataJson = objectMapper.writeValueAsString(event.getMetadata());
                } catch (Exception e) {
                    log.error("Failed to serialize activity metadata: {}", e.getMessage());
                }
            }

            Activity activity = new Activity();
            activity.setActor(actor);
            activity.setActivityType(event.getActivityType());
            activity.setEntityType(event.getEntityType());
            activity.setEntityId(event.getEntityId());
            activity.setCommunity(community);
            activity.setTitle(event.getTitle());
            activity.setMetadata(metadataJson);
            activity.setVisibility(event.getVisibility() != null && !event.getVisibility().isBlank() ? event.getVisibility() : "PUBLIC");

            activityRepository.save(activity);
            log.debug("Successfully logged activity: [{}] {} by user {}", event.getActivityType(), event.getTitle(), event.getActorId());

            // Invalidate recent activities cache
            if (cacheManager != null) {
                Cache cache = cacheManager.getCache("recentActivities");
                if (cache != null) {
                    cache.clear();
                }
            }
        } catch (Exception ex) {
            log.error("Asynchronous activity logging failed for event [{}]: {}", event.getActivityType(), ex.getMessage(), ex);
        }
    }
}
