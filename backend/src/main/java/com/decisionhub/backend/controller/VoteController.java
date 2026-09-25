package com.decisionhub.backend.controller;

import com.decisionhub.backend.dto.VoteRequest;
import com.decisionhub.backend.dto.VoteResponse;
import com.decisionhub.backend.service.VoteService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/votes")
public class VoteController {

    private final VoteService voteService;

    public VoteController(VoteService voteService) {
        this.voteService = voteService;
    }

    @PostMapping
    public VoteResponse castVote(@Valid @RequestBody VoteRequest request) {
        return voteService.castVote(request);
    }

    @GetMapping("/result/{decisionId}")
    public Map<String, Long> getResults(@PathVariable Long decisionId) {
        return voteService.getVoteResults(decisionId);
    }
}
