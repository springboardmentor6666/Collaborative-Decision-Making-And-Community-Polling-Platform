package com.decisionhub.backend.controller;

import com.decisionhub.backend.dto.OptionRequest;
import com.decisionhub.backend.dto.OptionResponse;
import com.decisionhub.backend.service.OptionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/options")
public class OptionController {

    private final OptionService optionService;

    public OptionController(OptionService optionService) {
        this.optionService = optionService;
    }

    @PostMapping
    public OptionResponse createOption(@Valid @RequestBody OptionRequest request) {
        return optionService.createOption(request);
    }

    @GetMapping("/decision/{decisionId}")
    public List<OptionResponse> getOptions(@PathVariable Long decisionId) {
        return optionService.getOptionsByDecision(decisionId);
    }

    @PutMapping("/{id}")
    public OptionResponse updateOption(@PathVariable Long id,
                                       @Valid @RequestBody OptionRequest request) {
        return optionService.updateOption(id, request);
    }

    @DeleteMapping("/{id}")
    public String deleteOption(@PathVariable Long id) {
        optionService.deleteOption(id);
        return "Option Deleted Successfully";
    }
}