package com.decisionhub.controller;

import com.decisionhub.dto.CommentRequest;
import com.decisionhub.dto.CommentResponse;
import com.decisionhub.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@Tag(name = "Comments", description = "Endpoints for threaded comments on decisions")
@SecurityRequirement(name = "bearerAuth")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    @Operation(summary = "Create a comment", description = "Creates a top-level comment on a decision")
    public ResponseEntity<CommentResponse> createComment(
            @Valid @RequestBody CommentRequest request,
            Authentication authentication) {
        CommentResponse response = commentService.createComment(request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/reply")
    @Operation(summary = "Reply to a comment", description = "Creates a reply to an existing comment")
    public ResponseEntity<CommentResponse> replyToComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest request,
            Authentication authentication) {
        CommentResponse response = commentService.replyToComment(id, request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/decision/{decisionId}")
    @Operation(summary = "Get decision comments", description = "Retrieves all top-level comments for a decision")
    public ResponseEntity<List<CommentResponse>> getCommentsByDecisionId(@PathVariable Long decisionId) {
        return ResponseEntity.ok(commentService.getCommentsByDecisionId(decisionId));
    }

    @GetMapping("/{id}/replies")
    @Operation(summary = "Get comment replies", description = "Retrieves all replies for a specific comment")
    public ResponseEntity<List<CommentResponse>> getRepliesByCommentId(@PathVariable Long id) {
        return ResponseEntity.ok(commentService.getRepliesByCommentId(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a comment", description = "Updates an existing comment (only author allowed)")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(commentService.updateComment(id, request, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a comment", description = "Deletes an existing comment (only author allowed)")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            Authentication authentication) {
        commentService.deleteComment(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
