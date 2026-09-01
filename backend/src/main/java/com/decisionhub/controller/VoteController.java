package com.decisionhub.controller;

import com.decisionhub.common.response.ApiResponse;
import com.decisionhub.common.response.PagedResponse;
import com.decisionhub.dto.request.VoteRequest;
import com.decisionhub.dto.response.VoteResponse;
import com.decisionhub.dto.response.VoteResultResponse;
import com.decisionhub.security.UserPrincipal;
import com.decisionhub.service.VoteService;
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
@RequestMapping("/api/votes")
@RequiredArgsConstructor
@Tag(name = "Voting & Polling Engine", description = "Endpoints for casting votes, rating-scale votes, anonymous votes, and poll analytics")
public class VoteController {

    private final VoteService voteService;

    @PostMapping
    @Operation(summary = "Cast a vote on an option")
    public ResponseEntity<ApiResponse<VoteResponse>> castVote(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody VoteRequest request) {
        VoteResponse response = voteService.castVote(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vote recorded successfully", response));
    }

    @PostMapping("/anonymous")
    @Operation(summary = "Cast an anonymous vote (No authentication required)")
    public ResponseEntity<ApiResponse<VoteResponse>> castAnonymousVote(@Valid @RequestBody VoteRequest request) {
        VoteResponse response = voteService.castAnonymousVote(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Anonymous vote recorded successfully", response));
    }

    @PutMapping("/{voteId}")
    @Operation(summary = "Change or update a previously cast vote")
    public ResponseEntity<ApiResponse<VoteResponse>> changeVote(
            @PathVariable Long voteId,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody VoteRequest request) {
        VoteResponse response = voteService.changeVote(currentUser.getId(), voteId, request);
        return ResponseEntity.ok(ApiResponse.success("Vote updated successfully", response));
    }


    @GetMapping("/decision/{decisionId}/me")
    @Operation(summary = "Get the current user's vote for a decision")
    public ResponseEntity<ApiResponse<VoteResponse>> getUserVote(
            @PathVariable Long decisionId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        VoteResponse response = voteService.getUserVote(currentUser.getId(), decisionId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/decision/{decisionId}/results")
    @Operation(summary = "Get aggregated poll vote counts, percentages, and winning option")
    public ResponseEntity<ApiResponse<VoteResultResponse>> getVoteResults(@PathVariable Long decisionId) {
        VoteResultResponse response = voteService.getVoteResults(decisionId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/my")
    @Operation(summary = "Get all votes cast by the current user (recent votes / voting history)")
    public ResponseEntity<ApiResponse<PagedResponse<VoteResponse>>> getMyVotes(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<VoteResponse> response = voteService.getUserVotesHistory(currentUser.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
