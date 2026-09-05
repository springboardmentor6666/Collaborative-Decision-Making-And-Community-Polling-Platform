package com.decisionhub.controller;

import com.decisionhub.dto.VoteRequest;
import com.decisionhub.dto.VoteResponse;
import com.decisionhub.dto.VoteResultResponse;
import com.decisionhub.service.VoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/votes")
@Tag(name = "Votes", description = "Endpoints for casting votes and retrieving poll results")
@SecurityRequirement(name = "bearerAuth")
public class VoteController {

    private final VoteService voteService;

    public VoteController(VoteService voteService) {
        this.voteService = voteService;
    }

    @PostMapping
    @Operation(summary = "Cast a vote", description = "Records a user's vote for a poll option")
    public ResponseEntity<VoteResponse> castVote(
            @Valid @RequestBody VoteRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest) {

        String clientIp = null;
        if (servletRequest != null) {
            String forwarded = servletRequest.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) {
                clientIp = forwarded.split(",")[0].trim();
            } else {
                clientIp = servletRequest.getRemoteAddr();
            }
        }

        String email = authentication != null ? authentication.getName() : null;
        VoteResponse response = voteService.castVote(request, email, clientIp);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/result/{pollId}")
    @Operation(summary = "Get vote results", description = "Retrieves live vote tallies, total votes, and current winner for a poll")
    public ResponseEntity<VoteResultResponse> getVoteResults(@PathVariable Long pollId) {
        return ResponseEntity.ok(voteService.getVoteResults(pollId));
    }

    @GetMapping("/rating-summary/{pollId}")
    @Operation(summary = "Get rating summary", description = "Retrieves average ratings and counts per option for a rating poll")
    public ResponseEntity<com.decisionhub.dto.PollRatingSummaryResponse> getRatingSummary(@PathVariable Long pollId) {
        return ResponseEntity.ok(voteService.getRatingSummary(pollId));
    }
}
