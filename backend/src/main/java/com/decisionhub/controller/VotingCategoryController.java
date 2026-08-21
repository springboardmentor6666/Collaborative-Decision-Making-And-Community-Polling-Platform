package com.decisionhub.controller;

import com.decisionhub.dto.request.VotingCategoryRequest;
import com.decisionhub.dto.response.VotingCategoryResponse;
import com.decisionhub.service.VotingCategoryService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.decisionhub.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/elections/{eventId}/categories")
@RequiredArgsConstructor
public class VotingCategoryController {

    private final VotingCategoryService votingCategoryService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<VotingCategoryResponse> createCategory(
            @PathVariable Long eventId,
            @Valid @RequestBody VotingCategoryRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return new ResponseEntity<>(votingCategoryService.createCategory(eventId, currentUser.getId(), request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<VotingCategoryResponse>> getCategories(@PathVariable Long eventId) {
        return ResponseEntity.ok(votingCategoryService.getCategoriesForEvent(eventId));
    }

    @PutMapping("/{categoryId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<VotingCategoryResponse> updateCategory(
            @PathVariable Long categoryId,
            @Valid @RequestBody VotingCategoryRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(votingCategoryService.updateCategory(categoryId, currentUser.getId(), request));
    }

    @DeleteMapping("/{categoryId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable Long categoryId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        votingCategoryService.deleteCategory(categoryId, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
