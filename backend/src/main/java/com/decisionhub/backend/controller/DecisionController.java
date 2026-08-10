package com.decisionhub.backend.controller;

import com.decisionhub.backend.dto.DecisionRequest;
import com.decisionhub.backend.dto.DecisionResponse;
import com.decisionhub.backend.service.DecisionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/decisions")
public class DecisionController {

    private final DecisionService decisionService;

    public DecisionController(DecisionService decisionService) {
        this.decisionService = decisionService;
    }

    @PostMapping
    public DecisionResponse createDecision(@Valid @RequestBody DecisionRequest request) {
        return decisionService.createDecision(request);
    }

    @GetMapping
    public List<DecisionResponse> getAllDecisions() {
        return decisionService.getAllDecisions();
    }

    @GetMapping("/{id}")
    public DecisionResponse getDecisionById(@PathVariable Long id) {
        return decisionService.getDecisionById(id);
    }

    @PutMapping("/{id}")
    public DecisionResponse updateDecision(@PathVariable Long id,
                                           @Valid @RequestBody DecisionRequest request) {
        return decisionService.updateDecision(id, request);
    }

    @DeleteMapping("/{id}")
    public String deleteDecision(@PathVariable Long id) {
        decisionService.deleteDecision(id);
        return "Decision Deleted Successfully";
    }
}