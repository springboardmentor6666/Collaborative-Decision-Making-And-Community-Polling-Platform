package com.decisionhub.controller;

import com.decisionhub.dto.*;
import com.decisionhub.service.CommunityService;
import com.decisionhub.service.DecisionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommunityControllerTest {

    @Mock
    private CommunityService communityService;

    @Mock
    private DecisionService decisionService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private CommunityController communityController;

    private CommunityResponse sampleResponse;

    @BeforeEach
    void setUp() {
        sampleResponse = new CommunityResponse();
        sampleResponse.setId(1L);
        sampleResponse.setName("Developers Hub");
        sampleResponse.setDescription("Community for devs");
        sampleResponse.setVisibility("PUBLIC");
    }

    @Test
    void testCreateCommunity() {
        when(authentication.getName()).thenReturn("user@example.com");
        CommunityRequest request = new CommunityRequest("Developers Hub", "Community for devs", "PUBLIC", null);
        when(communityService.createCommunity(any(CommunityRequest.class), eq("user@example.com")))
                .thenReturn(sampleResponse);

        ResponseEntity<CommunityResponse> response = communityController.createCommunity(request, authentication);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Developers Hub", response.getBody().getName());
        verify(communityService, times(1)).createCommunity(any(CommunityRequest.class), eq("user@example.com"));
    }

    @Test
    void testGetAllCommunities() {
        when(authentication.getName()).thenReturn("user@example.com");
        when(communityService.getAllCommunities(eq("Dev"), eq("user@example.com")))
                .thenReturn(List.of(sampleResponse));

        ResponseEntity<List<CommunityResponse>> response = communityController.getAllCommunities("Dev", authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        verify(communityService, times(1)).getAllCommunities("Dev", "user@example.com");
    }

    @Test
    void testGetCommunityById() {
        when(authentication.getName()).thenReturn("user@example.com");
        when(communityService.getCommunityById(1L, "user@example.com")).thenReturn(sampleResponse);

        ResponseEntity<CommunityResponse> response = communityController.getCommunityById(1L, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Developers Hub", response.getBody().getName());
    }

    @Test
    void testJoinCommunity() {
        when(authentication.getName()).thenReturn("user@example.com");
        when(communityService.joinCommunity(1L, "user@example.com")).thenReturn(sampleResponse);

        ResponseEntity<CommunityResponse> response = communityController.joinCommunity(1L, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(communityService, times(1)).joinCommunity(1L, "user@example.com");
    }

    @Test
    void testLeaveCommunity() {
        when(authentication.getName()).thenReturn("user@example.com");
        doNothing().when(communityService).leaveCommunity(1L, "user@example.com");

        ResponseEntity<Void> response = communityController.leaveCommunity(1L, authentication);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(communityService, times(1)).leaveCommunity(1L, "user@example.com");
    }

    @Test
    void testTransferOwnership() {
        when(authentication.getName()).thenReturn("owner@example.com");
        TransferOwnershipRequest request = new TransferOwnershipRequest(2L);
        when(communityService.transferOwnership(eq(1L), any(TransferOwnershipRequest.class), eq("owner@example.com")))
                .thenReturn(sampleResponse);

        ResponseEntity<CommunityResponse> response = communityController.transferOwnership(1L, request, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(communityService, times(1)).transferOwnership(eq(1L), any(TransferOwnershipRequest.class), eq("owner@example.com"));
    }

    @Test
    void testGetCommunityDecisions() {
        when(authentication.getName()).thenReturn("user@example.com");
        DecisionResponse decisionResponse = new DecisionResponse();
        decisionResponse.setId(100L);
        decisionResponse.setTitle("Group Decision");

        when(decisionService.getDecisionsByCommunityId(1L, "user@example.com"))
                .thenReturn(List.of(decisionResponse));

        ResponseEntity<List<DecisionResponse>> response = communityController.getCommunityDecisions(1L, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals("Group Decision", response.getBody().get(0).getTitle());
    }
}
