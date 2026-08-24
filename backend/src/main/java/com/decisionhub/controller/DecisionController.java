package com.decisionhub.controller;

import com.decisionhub.dto.DecisionRequest;
import com.decisionhub.dto.DecisionResponse;
import com.decisionhub.dto.OptionDto;
import com.decisionhub.dto.OptionRequest;
import com.decisionhub.service.DecisionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/decisions")
@Tag(name = "Decisions", description = "Endpoints for managing collaborative decisions")
@SecurityRequirement(name = "bearerAuth")
public class DecisionController {

    private final DecisionService decisionService;

    public DecisionController(DecisionService decisionService) {
        this.decisionService = decisionService;
    }

    @GetMapping
    @Operation(summary = "Get decisions with pagination, sorting, and filtering",
               description = "Retrieves decisions with optional category, status, and search filters, plus sorting and pagination")
    public ResponseEntity<Page<DecisionResponse>> getDecisions(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = "asc".equalsIgnoreCase(sortDir) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<DecisionResponse> response = decisionService.getDecisions(categoryId, status, search, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    @Operation(summary = "Get all decisions unpaged", description = "Retrieves all decisions created on the platform as a list")
    public ResponseEntity<List<DecisionResponse>> getAllDecisions() {
        return ResponseEntity.ok(decisionService.getAllDecisions());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get decision by ID", description = "Retrieves a single decision by its ID")
    public ResponseEntity<DecisionResponse> getDecisionById(@PathVariable Long id) {
        return ResponseEntity.ok(decisionService.getDecisionById(id));
    }

    @PostMapping
    @Operation(summary = "Create a decision", description = "Creates a new decision along with an optional embedded poll")
    public ResponseEntity<DecisionResponse> createDecision(@Valid @RequestBody DecisionRequest request, Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        DecisionResponse response = decisionService.createDecision(request, email);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a decision", description = "Updates an existing decision by ID (Decision owner/admin only)")
    public ResponseEntity<DecisionResponse> updateDecision(@PathVariable Long id, @Valid @RequestBody DecisionRequest request, Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        DecisionResponse response = decisionService.updateDecision(id, request, email);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a decision", description = "Deletes a decision by ID (Decision owner/admin/moderator only)")
    public ResponseEntity<Void> deleteDecision(@PathVariable Long id, Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        decisionService.deleteDecision(id, email);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/options")
    @Operation(summary = "Add an option to an existing decision", description = "Adds a new standalone option to an existing decision and links it to active polls (Owner/admin only)")
    public ResponseEntity<OptionDto> addOption(@PathVariable Long id, @Valid @RequestBody OptionRequest request, Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        OptionDto response = decisionService.addOption(id, request, email);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/close")
    @Operation(summary = "Close a decision", description = "Manually transitions decision status to CLOSED (Owner/admin only)")
    public ResponseEntity<DecisionResponse> closeDecision(@PathVariable Long id, Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        DecisionResponse response = decisionService.closeDecision(id, email);
        return ResponseEntity.ok(response);
    }
}
