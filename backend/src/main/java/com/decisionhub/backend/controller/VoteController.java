package com.decisionhub.backend.controller;

import com.decisionhub.backend.dto.VoteRequest;
import com.decisionhub.backend.service.VoteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/decisions/{decisionId}/vote")
public class VoteController {

    @Autowired private VoteService voteService;

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> castVote(@PathVariable Long decisionId, @Valid @RequestBody VoteRequest req) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        voteService.castVote(decisionId, req, email);
        return ResponseEntity.ok().body("Vote registered successfully");
    }

    @DeleteMapping
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteVote(@PathVariable Long decisionId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        voteService.deleteVote(decisionId, email);
        return ResponseEntity.ok().body("Vote removed successfully");
    }

    @GetMapping("/status")
    public ResponseEntity<?> getVoteStatus(@PathVariable Long decisionId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getPrincipal().toString();
        
        // Handle anonymous or unauthenticated users
        if ("anonymousUser".equals(email)) {
            Map<String, Object> anonymousRes = new HashMap<>();
            anonymousRes.put("voted", false);
            anonymousRes.put("votedOptionId", null);
            return ResponseEntity.ok(anonymousRes);
        }
        
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Map<String, Object> res = new HashMap<>();
        res.put("voted", voteService.hasUserVoted(decisionId, userEmail));
        res.put("votedOptionId", voteService.getUserVotedOptionId(decisionId, userEmail));
        return ResponseEntity.ok(res);
    }
}
