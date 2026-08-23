package com.decisionhub.backend.controller;

import com.decisionhub.backend.dto.OptionRequest;
import com.decisionhub.backend.dto.OptionResponse;
import com.decisionhub.backend.service.OptionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class OptionController {

    @Autowired private OptionService optionService;

    @PostMapping("/decisions/{decisionId}/options")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<OptionResponse> addOption(
            @PathVariable Long decisionId, 
            @Valid @RequestBody OptionRequest req) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(optionService.addOption(decisionId, req, email));
    }

    @GetMapping("/decisions/{decisionId}/options")
    public ResponseEntity<List<OptionResponse>> getOptionsByDecision(@PathVariable Long decisionId) {
        return ResponseEntity.ok(optionService.getOptionsByDecision(decisionId));
    }

    @PutMapping("/options/{optionId}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<OptionResponse> updateOption(
            @PathVariable Long optionId, 
            @Valid @RequestBody OptionRequest req) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(optionService.updateOption(optionId, req, email));
    }

    @DeleteMapping("/options/{optionId}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteOption(@PathVariable Long optionId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        optionService.deleteOption(optionId, email);
        return ResponseEntity.ok().body("Option deleted successfully");
    }
}
