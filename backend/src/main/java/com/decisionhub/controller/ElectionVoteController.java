package com.decisionhub.controller;

import com.decisionhub.dto.request.ElectionVoteRequest;
import com.decisionhub.dto.response.ElectionResultsResponse;
import com.decisionhub.service.ElectionVotingService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.decisionhub.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ElectionVoteController {

    private final ElectionVotingService electionVotingService;

    @PostMapping("/categories/{categoryId}/vote")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> submitVote(
            @PathVariable Long categoryId,
            @Valid @RequestBody ElectionVoteRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        electionVotingService.submitVote(categoryId, currentUser.getId(), request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/elections/{eventId}/results")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ElectionResultsResponse> getResults(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(electionVotingService.getResults(eventId, currentUser.getId()));
    }
}
