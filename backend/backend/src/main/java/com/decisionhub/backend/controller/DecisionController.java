package com.decisionhub.backend.controller;

import com.decisionhub.backend.dto.DecisionRequest;
import com.decisionhub.backend.entity.Decision;
import com.decisionhub.backend.service.DecisionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/decisions")
public class DecisionController {

    @Autowired
    private DecisionService decisionService;

    // Create Decision
    @PostMapping
    public String createDecision(@RequestBody DecisionRequest request) {
        return decisionService.createDecision(request);
    }

    // Get All Decisions
    @GetMapping
    public List<Decision> getAllDecisions() {
        return decisionService.getAllDecisions();
    }

    // Get Decision By Id
    @GetMapping("/{id}")
    public Decision getDecisionById(@PathVariable Long id) {
        return decisionService.getDecisionById(id);
    }

    // Delete Decision
    @DeleteMapping("/{id}")
    public String deleteDecision(@PathVariable Long id) {
        return decisionService.deleteDecision(id);
    }

}