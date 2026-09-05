package com.decisionhub.controller;

import com.decisionhub.dto.ActivityResponse;
import com.decisionhub.dto.UserSummaryDto;
import com.decisionhub.service.ActivityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ActivityControllerTest {

    @Mock
    private ActivityService activityService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ActivityController activityController;

    private ActivityResponse sampleResponse;

    @BeforeEach
    void setUp() {
        sampleResponse = new ActivityResponse(
                1L,
                new UserSummaryDto(10L, "alice@example.com", "Alice", null),
                "DECISION_CREATED",
                "DECISION",
                100L,
                5L,
                "Tech Community",
                "Created decision",
                Map.of("decisionId", 100L),
                LocalDateTime.now()
        );
    }

    @Test
    void testGetGlobalActivities() {
        when(authentication.getName()).thenReturn("alice@example.com");
        Page<ActivityResponse> page = new PageImpl<>(List.of(sampleResponse));
        when(activityService.getGlobalRecentActivities(any(), any(Pageable.class), eq("alice@example.com")))
                .thenReturn(page);

        ResponseEntity<Page<ActivityResponse>> response = activityController.getGlobalActivities(
                "DECISION_CREATED,VOTE_CAST", 0, 20, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getTotalElements());
        verify(activityService, times(1)).getGlobalRecentActivities(
                eq(List.of("DECISION_CREATED", "VOTE_CAST")), any(Pageable.class), eq("alice@example.com"));
    }

    @Test
    void testGetCommunityActivities() {
        when(authentication.getName()).thenReturn("alice@example.com");
        Page<ActivityResponse> page = new PageImpl<>(List.of(sampleResponse));
        when(activityService.getCommunityActivities(eq(5L), any(), any(Pageable.class), eq("alice@example.com")))
                .thenReturn(page);

        ResponseEntity<Page<ActivityResponse>> response = activityController.getCommunityActivities(
                5L, null, 0, 20, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getTotalElements());
        verify(activityService, times(1)).getCommunityActivities(
                eq(5L), isNull(), any(Pageable.class), eq("alice@example.com"));
    }

    @Test
    void testGetUserActivities() {
        when(authentication.getName()).thenReturn("alice@example.com");
        Page<ActivityResponse> page = new PageImpl<>(List.of(sampleResponse));
        when(activityService.getUserActivities(eq(10L), any(), any(Pageable.class), eq("alice@example.com")))
                .thenReturn(page);

        ResponseEntity<Page<ActivityResponse>> response = activityController.getUserActivities(
                10L, null, 0, 20, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getTotalElements());
        verify(activityService, times(1)).getUserActivities(
                eq(10L), isNull(), any(Pageable.class), eq("alice@example.com"));
    }
}
