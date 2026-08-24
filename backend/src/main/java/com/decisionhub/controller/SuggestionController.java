package com.decisionhub.controller;

import com.decisionhub.dto.SuggestionRequest;
import com.decisionhub.dto.SuggestionResponse;
import com.decisionhub.service.SuggestionService;
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
@RequestMapping("/api/suggestions")
@Tag(name = "Suggestions", description = "Endpoints for creating and retrieving alternatives/suggestions for decisions")
@SecurityRequirement(name = "bearerAuth")
public class SuggestionController {

    private final SuggestionService suggestionService;

    public SuggestionController(SuggestionService suggestionService) {
        this.suggestionService = suggestionService;
    }

    @PostMapping
    @Operation(summary = "Create a suggestion", description = "Adds a new feedback suggestion to a decision board")
    public ResponseEntity<SuggestionResponse> createSuggestion(@Valid @RequestBody SuggestionRequest request, Authentication authentication) {
        SuggestionResponse response = suggestionService.createSuggestion(request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/decision/{decisionId}")
    @Operation(summary = "Get suggestions by decision ID", description = "Retrieves all suggestions submitted for a specific decision")
    public ResponseEntity<List<SuggestionResponse>> getSuggestionsByDecisionId(@PathVariable Long decisionId) {
        return ResponseEntity.ok(suggestionService.getSuggestionsByDecisionId(decisionId));
    }

    @GetMapping
    @Operation(summary = "Get suggestions (query param)", description = "Retrieves suggestions using a query parameter for decision ID")
    public ResponseEntity<List<SuggestionResponse>> getSuggestions(@RequestParam Long decisionId) {
        return ResponseEntity.ok(suggestionService.getSuggestionsByDecisionId(decisionId));
    }
}
