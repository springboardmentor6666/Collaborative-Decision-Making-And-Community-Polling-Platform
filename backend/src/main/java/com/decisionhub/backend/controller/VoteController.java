package com.decisionhub.backend.controller;

import com.decisionhub.backend.dto.VoteDTO;
import com.decisionhub.backend.service.VoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/votes")
@CrossOrigin(origins = "*", maxAge = 3600)
public class VoteController {

    @Autowired
    private VoteService voteService;

    @PostMapping("/decision/{decisionId}/option/{optionId}")
    public ResponseEntity<VoteDTO> castVote(
            @PathVariable Long decisionId,
            @PathVariable Long optionId,
            @RequestBody(required = false) Map<String, String> body,
            Authentication authentication) {

        String username = (authentication != null && authentication.isAuthenticated()) ? authentication.getName() : "user";
        String voteType = (body != null && body.containsKey("voteType")) ? body.get("voteType") : "SINGLE";

        return ResponseEntity.ok(voteService.castVote(decisionId, optionId, username, voteType));
    }

    @GetMapping("/decision/{decisionId}/my-vote")
    public ResponseEntity<VoteDTO> getMyVote(@PathVariable Long decisionId, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.ok(null);
        }
        return ResponseEntity.ok(voteService.getUserVoteForDecision(decisionId, authentication.getName()));
    }
}
