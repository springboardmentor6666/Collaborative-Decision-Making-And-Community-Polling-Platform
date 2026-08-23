package com.decisionhub.backend.controller;

import com.decisionhub.backend.dto.DecisionRequest;
import com.decisionhub.backend.dto.DecisionResponse;
import com.decisionhub.backend.service.DecisionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/decisions")
public class DecisionController {

    @Autowired private DecisionService decisionService;

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<DecisionResponse> createDecision(@Valid @RequestBody DecisionRequest req) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(decisionService.createDecision(req, email));
    }

    @GetMapping
    public ResponseEntity<List<DecisionResponse>> getAllPublicDecisions() {
        return ResponseEntity.ok(decisionService.getAllPublicDecisions());
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<List<DecisionResponse>> getMyDecisions() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(decisionService.getMyDecisions(email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DecisionResponse> getDecisionById(@PathVariable Long id) {
        return ResponseEntity.ok(decisionService.getDecisionById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<DecisionResponse> updateDecision(@PathVariable Long id, @Valid @RequestBody DecisionRequest req) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(decisionService.updateDecision(id, req, email));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteDecision(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        decisionService.deleteDecision(id, email);
        return ResponseEntity.ok().body("Decision deleted successfully");
    }
}
