package com.decisionhub.controller;

import com.decisionhub.dto.request.NomineeRequest;
import com.decisionhub.dto.response.NomineeResponse;
import com.decisionhub.service.NomineeService;
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
@RequestMapping("/api")
@RequiredArgsConstructor
public class NomineeController {

    private final NomineeService nomineeService;

    @PostMapping("/categories/{categoryId}/nominations")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<NomineeResponse> submitNomination(
            @PathVariable Long categoryId,
            @Valid @RequestBody NomineeRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return new ResponseEntity<>(nomineeService.submitNomination(categoryId, currentUser.getId(), request), HttpStatus.CREATED);
    }

    @GetMapping("/categories/{categoryId}/nominees")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<NomineeResponse>> getNominees(
            @PathVariable Long categoryId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(nomineeService.getNomineesForCategory(categoryId, currentUser.getId()));
    }

    @PostMapping("/nominations/{nomineeId}/approve")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> approveNomination(
            @PathVariable Long nomineeId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        nomineeService.approveNomination(nomineeId, currentUser.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/nominations/{nomineeId}/reject")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> rejectNomination(
            @PathVariable Long nomineeId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        nomineeService.rejectNomination(nomineeId, currentUser.getId());
        return ResponseEntity.ok().build();
    }
}
