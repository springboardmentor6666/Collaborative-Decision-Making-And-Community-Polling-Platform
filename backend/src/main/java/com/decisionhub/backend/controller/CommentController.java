package com.decisionhub.backend.controller;

import com.decisionhub.backend.dto.CommentDTO;
import com.decisionhub.backend.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CommentController {

    @Autowired
    private CommentService commentService;

    @GetMapping("/decision/{decisionId}")
    public ResponseEntity<List<CommentDTO>> getCommentsByDecision(@PathVariable Long decisionId) {
        return ResponseEntity.ok(commentService.getCommentsByDecisionId(decisionId));
    }

    @PostMapping("/decision/{decisionId}")
    public ResponseEntity<CommentDTO> addComment(
            @PathVariable Long decisionId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {

        String username = (authentication != null && authentication.isAuthenticated()) ? authentication.getName() : "user";
        String text = body.get("commentText");

        return ResponseEntity.ok(commentService.addComment(decisionId, text, username));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }
}
