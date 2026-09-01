package com.decisionhub.controller;

import com.decisionhub.common.enums.DecisionStatus;
import com.decisionhub.common.enums.DecisionVisibility;
import com.decisionhub.common.enums.VoteType;
import com.decisionhub.common.response.ApiResponse;
import com.decisionhub.common.response.PagedResponse;
import com.decisionhub.dto.request.DecisionRequest;
import com.decisionhub.dto.response.DecisionResponse;
import com.decisionhub.security.UserPrincipal;
import com.decisionhub.service.DecisionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/decisions")
@RequiredArgsConstructor
@Tag(name = "Decision Board Management", description = "Endpoints for creating, updating, searching, and managing decision boards")
public class DecisionController {

    private final DecisionService decisionService;

    @PostMapping
    @Operation(summary = "Create a new decision board with comparison options")
    public ResponseEntity<ApiResponse<DecisionResponse>> createDecision(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody DecisionRequest request) {
        DecisionResponse response = decisionService.createDecision(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Decision board published successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update decision board details (Author only)")
    public ResponseEntity<ApiResponse<DecisionResponse>> updateDecision(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody DecisionRequest request) {
        DecisionResponse response = decisionService.updateDecision(id, currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Decision board updated successfully", response));
    }

    @GetMapping
    @Operation(summary = "Search and filter decision boards")
    public ResponseEntity<ApiResponse<PagedResponse<DecisionResponse>>> searchDecisions(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long communityId,
            @RequestParam(required = false) DecisionVisibility visibility,
            @RequestParam(required = false) DecisionStatus status,
            @RequestParam(required = false) VoteType voteType,
            @RequestParam(required = false) Long createdById,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Long userId = currentUser != null ? currentUser.getId() : null;
        PagedResponse<DecisionResponse> response = decisionService.searchDecisions(
                query, communityId, visibility, status, voteType, createdById, userId, pageable
        );
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/trending")
    @Operation(summary = "Get trending public decisions")
    public ResponseEntity<ApiResponse<PagedResponse<DecisionResponse>>> getTrending(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        PagedResponse<DecisionResponse> response = decisionService.getTrendingDecisions(userId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/popular")
    @Operation(summary = "Get popular decisions by view count")
    public ResponseEntity<ApiResponse<PagedResponse<DecisionResponse>>> getPopular(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        PagedResponse<DecisionResponse> response = decisionService.getPopularDecisions(userId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/latest")
    @Operation(summary = "Get latest published public decisions")
    public ResponseEntity<ApiResponse<PagedResponse<DecisionResponse>>> getLatest(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        PagedResponse<DecisionResponse> response = decisionService.getLatestDecisions(userId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get decision board details by ID")
    public ResponseEntity<ApiResponse<DecisionResponse>> getDecisionById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        DecisionResponse response = decisionService.getDecisionById(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete decision board (Author only)")
    public ResponseEntity<ApiResponse<Void>> deleteDecision(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        decisionService.deleteDecision(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Decision board deleted successfully", null));
    }
}
