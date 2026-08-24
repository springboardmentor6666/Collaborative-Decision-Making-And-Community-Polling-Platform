package com.decisionhub.controller;

import com.decisionhub.dto.RecommendationRequest;
import com.decisionhub.dto.RecommendationResponse;
import com.decisionhub.service.RecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@Tag(name = "Recommendations", description = "Endpoints for creating and retrieving expert recommendations")
@SecurityRequirement(name = "bearerAuth")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @PostMapping
    @Operation(summary = "Create an expert recommendation", description = "Allows experts and advisors to submit options recommendations")
    public ResponseEntity<RecommendationResponse> createRecommendation(@Valid @RequestBody RecommendationRequest request, Authentication authentication) {
        RecommendationResponse response = recommendationService.createRecommendation(request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/decision/{decisionId}")
    @Operation(summary = "Get recommendations by decision ID", description = "Retrieves all expert recommendations for a specific decision")
    public ResponseEntity<List<RecommendationResponse>> getRecommendationsByDecisionId(@PathVariable Long decisionId) {
        return ResponseEntity.ok(recommendationService.getRecommendationsByDecisionId(decisionId));
    }

    @GetMapping
    @Operation(summary = "Get recommendations (query param)", description = "Retrieves expert recommendations using a query parameter for decision ID")
    public ResponseEntity<List<RecommendationResponse>> getRecommendations(@RequestParam Long decisionId) {
        return ResponseEntity.ok(recommendationService.getRecommendationsByDecisionId(decisionId));
    }
}
