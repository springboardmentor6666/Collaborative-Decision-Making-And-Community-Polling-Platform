package com.decisionhub.controller;

import com.decisionhub.dto.request.VotingEventRequest;
import com.decisionhub.dto.response.VotingEventResponse;
import com.decisionhub.service.VotingEventService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.decisionhub.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class VotingEventController {

    private final VotingEventService votingEventService;

    @PostMapping("/communities/{communityId}/elections")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<VotingEventResponse> createElection(
            @PathVariable Long communityId,
            @Valid @RequestBody VotingEventRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        VotingEventResponse response = votingEventService.createVotingEvent(communityId, currentUser.getId(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/communities/{communityId}/elections")
    public ResponseEntity<List<VotingEventResponse>> getCommunityElections(
            @PathVariable Long communityId) {
        return ResponseEntity.ok(votingEventService.getCommunityEvents(communityId));
    }

    @GetMapping("/elections/{eventId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<VotingEventResponse> getElection(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(votingEventService.getVotingEvent(eventId, currentUser.getId()));
    }

    @PutMapping("/elections/{eventId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<VotingEventResponse> updateElection(
            @PathVariable Long eventId,
            @Valid @RequestBody VotingEventRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(votingEventService.updateVotingEvent(eventId, currentUser.getId(), request));
    }

    @PostMapping("/elections/{eventId}/publish")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> publishElection(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        votingEventService.publishEvent(eventId, currentUser.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/elections/{eventId}/start")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> startElection(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        votingEventService.startEvent(eventId, currentUser.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/elections/{eventId}/close")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> closeElection(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        votingEventService.closeEvent(eventId, currentUser.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/elections/{eventId}/publish-results")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> publishResults(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        votingEventService.publishResults(eventId, currentUser.getId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/elections/{eventId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> deleteElection(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        votingEventService.deleteVotingEvent(eventId, currentUser.getId());
        return ResponseEntity.ok().build();
    }
}
