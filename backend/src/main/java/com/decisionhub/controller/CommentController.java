package com.decisionhub.controller;

import com.decisionhub.common.response.ApiResponse;
import com.decisionhub.common.response.PagedResponse;
import com.decisionhub.dto.request.CommentRequest;
import com.decisionhub.dto.response.CommentResponse;
import com.decisionhub.security.UserPrincipal;
import com.decisionhub.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@Tag(name = "Discussion & Threaded Comments", description = "Endpoints for posting comments, creating nested replies, editing, and deleting comments")
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    @Operation(summary = "Post a new top-level comment or threaded reply")
    public ResponseEntity<ApiResponse<CommentResponse>> createComment(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody CommentRequest request) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        CommentResponse response = commentService.createComment(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comment posted successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Edit an existing comment (Author only)")
    public ResponseEntity<ApiResponse<CommentResponse>> editComment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam String message) {
        CommentResponse response = commentService.editComment(id, currentUser.getId(), message);
        return ResponseEntity.ok(ApiResponse.success("Comment updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a comment (Author only)")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        commentService.deleteComment(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Comment deleted successfully", null));
    }

    @GetMapping("/decision/{decisionId}")
    @Operation(summary = "Get comments and nested reply tree for a decision board")
    public ResponseEntity<ApiResponse<PagedResponse<CommentResponse>>> getCommentsByDecision(
            @PathVariable Long decisionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<CommentResponse> response = commentService.getCommentsByDecision(decisionId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
