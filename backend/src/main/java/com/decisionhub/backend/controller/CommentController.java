package com.decisionhub.backend.controller;

import com.decisionhub.backend.dto.CommentRequest;
import com.decisionhub.backend.dto.CommentResponse;
import com.decisionhub.backend.service.CommentService;
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
public class CommentController {

    @Autowired private CommentService commentService;

    @PostMapping("/decisions/{decisionId}/comments")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long decisionId, 
            @Valid @RequestBody CommentRequest req) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(commentService.addComment(decisionId, req, email));
    }

    @GetMapping("/decisions/{decisionId}/comments")
    public ResponseEntity<List<CommentResponse>> getCommentsByDecision(@PathVariable Long decisionId) {
        return ResponseEntity.ok(commentService.getCommentsByDecision(decisionId));
    }

    @DeleteMapping("/comments/{commentId}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        commentService.deleteComment(commentId, email);
        return ResponseEntity.ok().body("Comment deleted successfully");
    }
}
