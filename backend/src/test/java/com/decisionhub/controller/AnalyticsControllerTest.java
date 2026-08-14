package com.decisionhub.controller;

import com.decisionhub.dto.*;
import com.decisionhub.service.AnalyticsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnalyticsControllerTest {

    @Mock
    private AnalyticsService analyticsService;

    @Mock
    private Authentication authentication;

    @Mock
    private HttpServletRequest servletRequest;

    @InjectMocks
    private AnalyticsController analyticsController;

    @BeforeEach
    void setUp() {
    }

    @Test
    void testGetMyVotesAnalysis() {
        when(authentication.getName()).thenReturn("user@example.com");
        MyVoteAnalysisDto dto = new MyVoteAnalysisDto();
        dto.setDecisionId(1L);

        when(analyticsService.getMyVotesAnalysis("user@example.com")).thenReturn(List.of(dto));

        ResponseEntity<List<MyVoteAnalysisDto>> response = analyticsController.getMyVotesAnalysis(authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        verify(analyticsService, times(1)).getMyVotesAnalysis("user@example.com");
    }

    @Test
    void testGetCreatorAnalytics() {
        when(authentication.getName()).thenReturn("creator@example.com");
        CreatorAnalyticsResponse analyticsResponse = new CreatorAnalyticsResponse();
        analyticsResponse.setTotalDecisionsPublished(5);

        when(analyticsService.getCreatorAnalytics("creator@example.com")).thenReturn(analyticsResponse);

        ResponseEntity<CreatorAnalyticsResponse> response = analyticsController.getCreatorAnalytics(authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(5, response.getBody().getTotalDecisionsPublished());
        verify(analyticsService, times(1)).getCreatorAnalytics("creator@example.com");
    }

    @Test
    void testRecordImpression() {
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("user@example.com");
        when(servletRequest.getHeader("X-Forwarded-For")).thenReturn("192.168.1.1");

        ImpressionRequest request = new ImpressionRequest("REACH");

        ResponseEntity<Map<String, String>> response = analyticsController.recordImpression(10L, request, authentication, servletRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Impression recorded successfully", response.getBody().get("message"));

        verify(analyticsService, times(1)).recordImpression(10L, "REACH", "user@example.com", "192.168.1.1");
    }
}
