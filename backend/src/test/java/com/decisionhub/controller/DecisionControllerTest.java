package com.decisionhub.controller;

import com.decisionhub.dto.*;
import com.decisionhub.service.DecisionService;
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

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DecisionControllerTest {

    @Mock
    private DecisionService decisionService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private DecisionController decisionController;

    private DecisionResponse sampleResponse;

    @BeforeEach
    void setUp() {
        sampleResponse = new DecisionResponse();
        sampleResponse.setId(1L);
        sampleResponse.setTitle("Architecture Decision");
        sampleResponse.setStatus("OPEN");
    }

    @Test
    void testGetDecisions_Paginated() {
        Page<DecisionResponse> page = new PageImpl<>(List.of(sampleResponse));
        when(decisionService.getDecisions(isNull(), isNull(), isNull(), any(Pageable.class))).thenReturn(page);

        ResponseEntity<Page<DecisionResponse>> response = decisionController.getDecisions(null, null, null, 0, 10, "createdAt", "desc");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getTotalElements());
        assertEquals("Architecture Decision", response.getBody().getContent().get(0).getTitle());
    }

    @Test
    void testGetDecisionById() {
        when(decisionService.getDecisionById(1L)).thenReturn(sampleResponse);

        ResponseEntity<DecisionResponse> response = decisionController.getDecisionById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Architecture Decision", response.getBody().getTitle());
    }

    @Test
    void testCreateDecision() {
        when(authentication.getName()).thenReturn("creator@example.com");
        DecisionRequest request = new DecisionRequest();
        request.setTitle("New Decision");

        when(decisionService.createDecision(any(DecisionRequest.class), eq("creator@example.com"))).thenReturn(sampleResponse);

        ResponseEntity<DecisionResponse> response = decisionController.createDecision(request, authentication);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void testUpdateDecision() {
        when(authentication.getName()).thenReturn("owner@example.com");
        DecisionRequest request = new DecisionRequest();
        request.setTitle("Updated Decision");

        when(decisionService.updateDecision(eq(1L), any(DecisionRequest.class), eq("owner@example.com"))).thenReturn(sampleResponse);

        ResponseEntity<DecisionResponse> response = decisionController.updateDecision(1L, request, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testDeleteDecision() {
        when(authentication.getName()).thenReturn("owner@example.com");
        doNothing().when(decisionService).deleteDecision(1L, "owner@example.com");

        ResponseEntity<Void> response = decisionController.deleteDecision(1L, authentication);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    }

    @Test
    void testAddOption() {
        when(authentication.getName()).thenReturn("owner@example.com");
        OptionRequest request = new OptionRequest("Option A", "Description A");
        OptionDto optionDto = new OptionDto(10L, "Option A", "Description A", 0L);

        when(decisionService.addOption(eq(1L), any(OptionRequest.class), eq("owner@example.com"))).thenReturn(optionDto);

        ResponseEntity<OptionDto> response = decisionController.addOption(1L, request, authentication);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Option A", response.getBody().getLabel());
    }

    @Test
    void testCloseDecision() {
        when(authentication.getName()).thenReturn("owner@example.com");
        sampleResponse.setStatus("CLOSED");
        when(decisionService.closeDecision(eq(1L), eq("owner@example.com"))).thenReturn(sampleResponse);

        ResponseEntity<DecisionResponse> response = decisionController.closeDecision(1L, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("CLOSED", response.getBody().getStatus());
    }
}
