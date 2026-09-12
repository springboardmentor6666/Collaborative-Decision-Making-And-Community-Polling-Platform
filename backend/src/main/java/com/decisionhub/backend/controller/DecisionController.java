package com.decisionhub.backend.controller;

import com.decisionhub.backend.dto.DecisionDTO;
import com.decisionhub.backend.service.DecisionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/decisions")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DecisionController {

    @Autowired
    private DecisionService decisionService;

    @GetMapping
    public ResponseEntity<List<DecisionDTO>> getAllDecisions(@RequestParam(required = false) String category) {
        if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(decisionService.getDecisionsByCategory(category));
        }
        return ResponseEntity.ok(decisionService.getPublicDecisions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DecisionDTO> getDecisionById(@PathVariable Long id) {
        return ResponseEntity.ok(decisionService.getDecisionById(id));
    }

    @PostMapping
    public ResponseEntity<DecisionDTO> createDecision(@RequestBody DecisionDTO dto, Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "user";
        return ResponseEntity.ok(decisionService.createDecision(dto, username));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DecisionDTO> updateDecision(@PathVariable Long id, @RequestBody DecisionDTO dto) {
        return ResponseEntity.ok(decisionService.updateDecision(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDecision(@PathVariable Long id) {
        decisionService.deleteDecision(id);
        return ResponseEntity.noContent().build();
    }
}
