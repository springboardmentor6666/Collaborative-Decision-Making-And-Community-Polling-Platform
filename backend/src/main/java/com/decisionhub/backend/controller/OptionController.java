package com.decisionhub.backend.controller;

import com.decisionhub.backend.dto.OptionDTO;
import com.decisionhub.backend.service.OptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/options")
@CrossOrigin(origins = "*", maxAge = 3600)
public class OptionController {

    @Autowired
    private OptionService optionService;

    @GetMapping("/decision/{decisionId}")
    public ResponseEntity<List<OptionDTO>> getOptionsByDecision(@PathVariable Long decisionId) {
        return ResponseEntity.ok(optionService.getOptionsByDecisionId(decisionId));
    }

    @PostMapping("/decision/{decisionId}")
    public ResponseEntity<OptionDTO> addOption(@PathVariable Long decisionId, @RequestBody OptionDTO dto) {
        return ResponseEntity.ok(optionService.addOption(decisionId, dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OptionDTO> updateOption(@PathVariable Long id, @RequestBody OptionDTO dto) {
        return ResponseEntity.ok(optionService.updateOption(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOption(@PathVariable Long id) {
        optionService.deleteOption(id);
        return ResponseEntity.noContent().build();
    }
}
