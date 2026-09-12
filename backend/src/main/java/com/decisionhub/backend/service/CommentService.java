package com.decisionhub.backend.service;

import com.decisionhub.backend.dto.CommentDTO;
import com.decisionhub.backend.entity.Comment;
import com.decisionhub.backend.entity.Decision;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.repository.CommentRepository;
import com.decisionhub.backend.repository.DecisionRepository;
import com.decisionhub.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private DecisionRepository decisionRepository;

    @Autowired
    private UserRepository userRepository;

    public List<CommentDTO> getCommentsByDecisionId(Long decisionId) {
        return commentRepository.findByDecisionIdOrderByCreatedAtDesc(decisionId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CommentDTO addComment(Long decisionId, String commentText, String username) {
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new RuntimeException("Decision not found: " + decisionId));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Comment comment = new Comment(user, decision, commentText);
        Comment saved = commentRepository.save(comment);
        return convertToDTO(saved);
    }

    public void deleteComment(Long commentId) {
        commentRepository.deleteById(commentId);
    }

    private CommentDTO convertToDTO(Comment comment) {
        return new CommentDTO(
                comment.getId(),
                comment.getDecision().getId(),
                comment.getUser().getId(),
                comment.getUser().getUsername(),
                comment.getCommentText(),
                comment.getCreatedAt()
        );
    }
}
