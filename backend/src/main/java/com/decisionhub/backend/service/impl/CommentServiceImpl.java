package com.decisionhub.backend.service.impl;

import com.decisionhub.backend.dto.*;
import com.decisionhub.backend.entity.*;
import com.decisionhub.backend.repository.*;
import com.decisionhub.backend.service.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CommentServiceImpl implements CommentService {
  private final CommentRepository comments; private final DecisionRepository decisions; private final CurrentUserService current; private final DecisionService decisionService;
  public CommentServiceImpl(CommentRepository comments, DecisionRepository decisions, CurrentUserService current, DecisionService decisionService) { this.comments=comments; this.decisions=decisions; this.current=current; this.decisionService=decisionService; }
  public List<CommentResponse> list(Long decisionId) { Decision decision=findDecision(decisionId); decisionService.toResponse(decision); User user=current.get(); return comments.findByDecisionIdOrderByCreatedAtAsc(decisionId).stream().map(c->response(c,user)).toList(); }
  public CommentResponse add(Long decisionId, CommentRequest request) { Decision decision=findDecision(decisionId); decisionService.toResponse(decision); User user=current.get(); Comment saved=comments.save(Comment.builder().comment(request.getContent().trim()).user(user).decision(decision).build()); return response(saved,user); }
  public void delete(Long id) { User user=current.get(); Comment comment=comments.findById(id).orElseThrow(()->new java.util.NoSuchElementException("Comment not found")); if(!comment.getUser().getId().equals(user.getId())) throw new AccessDeniedException("You can only delete your own comments"); comments.delete(comment); }
  private Decision findDecision(Long id) { return decisions.findById(id).orElseThrow(()->new java.util.NoSuchElementException("Decision not found")); }
  private CommentResponse response(Comment c, User user) { return CommentResponse.builder().id(c.getId()).content(c.getComment()).userId(c.getUser().getId()).userName(c.getUser().getName()).createdAt(c.getCreatedAt()).canDelete(c.getUser().getId().equals(user.getId())).build(); }
}
