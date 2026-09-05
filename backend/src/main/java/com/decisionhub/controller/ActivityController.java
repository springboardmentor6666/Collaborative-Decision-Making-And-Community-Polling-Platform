package com.decisionhub.controller;

import com.decisionhub.dto.ActivityResponse;
import com.decisionhub.service.ActivityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/activities")
@Tag(name = "Activities Feed", description = "Endpoints for platform, community, and user recent activity feeds")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping("/recent")
    @Operation(summary = "Get global recent activities", description = "Fetches paginated platform activity feed with optional type filters")
    public ResponseEntity<Page<ActivityResponse>> getGlobalActivities(
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20", name = "limit") int limit,
            Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        Pageable pageable = PageRequest.of(page, Math.min(Math.max(limit, 1), 100));
        List<String> types = parseTypes(type);
        Page<ActivityResponse> activities = activityService.getGlobalRecentActivities(types, pageable, userEmail);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/communities/{communityId}")
    @Operation(summary = "Get community activities", description = "Fetches activity feed for a specific community")
    public ResponseEntity<Page<ActivityResponse>> getCommunityActivities(
            @PathVariable Long communityId,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20", name = "limit") int limit,
            Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        Pageable pageable = PageRequest.of(page, Math.min(Math.max(limit, 1), 100));
        List<String> types = parseTypes(type);
        Page<ActivityResponse> activities = activityService.getCommunityActivities(communityId, types, pageable, userEmail);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/users/{userId}")
    @Operation(summary = "Get user activities", description = "Fetches activity feed for a user profile")
    public ResponseEntity<Page<ActivityResponse>> getUserActivities(
            @PathVariable Long userId,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20", name = "limit") int limit,
            Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        Pageable pageable = PageRequest.of(page, Math.min(Math.max(limit, 1), 100));
        List<String> types = parseTypes(type);
        Page<ActivityResponse> activities = activityService.getUserActivities(userId, types, pageable, userEmail);
        return ResponseEntity.ok(activities);
    }

    private List<String> parseTypes(String typeParam) {
        if (typeParam == null || typeParam.isBlank()) {
            return null;
        }
        return Arrays.stream(typeParam.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }
}
