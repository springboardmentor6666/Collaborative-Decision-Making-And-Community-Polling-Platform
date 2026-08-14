package com.decisionhub.backend.controller;

import com.decisionhub.backend.dto.DecisionRequest;
import com.decisionhub.backend.dto.DecisionResponse;
import com.decisionhub.backend.dto.VoteResponse;
import com.decisionhub.backend.service.DecisionService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/decisions")
public class DecisionController {

    private final DecisionService decisionService;

    public DecisionController(
            DecisionService decisionService) {

        this.decisionService = decisionService;
    }

    // =========================================================
    // CREATE
    // =========================================================

    @PostMapping
    public DecisionResponse createDecision(
            @Valid @RequestBody DecisionRequest request) {

        return decisionService.createDecision(request);
    }

    // =========================================================
    // MY DECISIONS
    // =========================================================

    @GetMapping
    public List<DecisionResponse> getMyDecisions() {

        return decisionService.getMyDecisions();
    }

    // =========================================================
    // ACTIVE PUBLIC POLLS - ALL USERS
    // =========================================================

    @GetMapping("/public")
    public List<DecisionResponse>
    getActivePublicDecisions() {

        return decisionService
                .getActivePublicDecisions();
    }

    // =========================================================
    // SINGLE DECISION
    // =========================================================

    @GetMapping("/{id}")
    public DecisionResponse getDecisionById(
            @PathVariable Long id) {

        return decisionService
                .getDecisionById(id);
    }

    // =========================================================
    // UPDATE
    // =========================================================

    @PutMapping("/{id}")
    public DecisionResponse updateDecision(
            @PathVariable Long id,
            @Valid @RequestBody DecisionRequest request) {

        return decisionService
                .updateDecision(id, request);
    }

    // =========================================================
    // DELETE
    // =========================================================

    @DeleteMapping("/{id}")
    public String deleteDecision(
            @PathVariable Long id) {

        decisionService.deleteDecision(id);

        return "Decision Deleted Successfully";
    }

    // =========================================================
    // VOTE
    // =========================================================

    @PostMapping("/{decisionId}/vote/{optionId}")
    public VoteResponse vote(
            @PathVariable Long decisionId,
            @PathVariable Long optionId) {

        return decisionService.vote(
                decisionId,
                optionId
        );
    }
}