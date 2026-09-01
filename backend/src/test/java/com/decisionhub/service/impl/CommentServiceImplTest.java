package com.decisionhub.service.impl;

import com.decisionhub.dto.request.CommentRequest;
import com.decisionhub.dto.response.CommentResponse;
import com.decisionhub.entity.Comment;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.Role;
import com.decisionhub.entity.User;
import com.decisionhub.exception.ForbiddenException;
import com.decisionhub.mapper.CommentMapper;
import com.decisionhub.repository.CommentRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommentServiceImplTest {

    @Mock
    private CommentRepository commentRepository;
    @Mock
    private DecisionRepository decisionRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CommentMapper commentMapper;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private CommentServiceImpl commentService;

    private User author;
    private Decision decision;
    private Comment comment;

    @BeforeEach
    void setUp() {
        author = User.builder()
                .userId(1L)
                .username("author")
                .fullName("Author Name")
                .role(Role.builder().roleName(com.decisionhub.common.enums.RoleType.ROLE_USER).build())
                .build();

        decision = Decision.builder()
                .decisionId(10L)
                .title("Sample Decision")
                .createdBy(author)
                .build();

        comment = Comment.builder()
                .commentId(100L)
                .decision(decision)
                .user(author)
                .message("This is a great idea!")
                .edited(false)
                .build();
    }

    @Test
    @DisplayName("createComment - Successfully adds comment")
    void createComment_Success() {
        CommentRequest request = new CommentRequest();
        request.setDecisionId(10L);
        request.setMessage("This is a great idea!");

        when(decisionRepository.findById(10L)).thenReturn(Optional.of(decision));
        when(userRepository.findById(1L)).thenReturn(Optional.of(author));
        when(commentMapper.toEntity(request)).thenReturn(comment);
        when(commentRepository.save(any(Comment.class))).thenReturn(comment);
        when(commentMapper.toResponse(comment)).thenReturn(CommentResponse.builder().commentId(100L).message("This is a great idea!").build());

        CommentResponse response = commentService.createComment(1L, request);

        assertThat(response).isNotNull();
        assertThat(response.getCommentId()).isEqualTo(100L);
        verify(commentRepository, times(1)).save(any(Comment.class));
    }

    @Test
    @DisplayName("editComment - Author can edit comment")
    void editComment_Author_Success() {
        when(commentRepository.findById(100L)).thenReturn(Optional.of(comment));
        when(commentRepository.save(any(Comment.class))).thenReturn(comment);
        when(commentMapper.toResponse(comment)).thenReturn(CommentResponse.builder().commentId(100L).message("Updated message").edited(true).build());

        CommentResponse response = commentService.editComment(100L, 1L, "Updated message");

        assertThat(response).isNotNull();
        assertThat(response.isEdited()).isTrue();
        assertThat(comment.isEdited()).isTrue();
        assertThat(comment.getMessage()).isEqualTo("Updated message");
    }

    @Test
    @DisplayName("deleteComment - Admin can delete non-authored comment")
    void deleteComment_Admin_Success() {
        User adminUser = User.builder()
                .userId(99L)
                .role(Role.builder().roleName(com.decisionhub.common.enums.RoleType.ROLE_ADMIN).build())
                .build();

        when(commentRepository.findById(100L)).thenReturn(Optional.of(comment));
        when(userRepository.findById(99L)).thenReturn(Optional.of(adminUser));

        commentService.deleteComment(100L, 99L);

        verify(commentRepository, times(1)).delete(comment);
    }

    @Test
    @DisplayName("deleteComment - Non-author non-admin throws ForbiddenException")
    void deleteComment_UnauthorizedUser_ThrowsForbidden() {
        User regularUser = User.builder()
                .userId(55L)
                .role(Role.builder().roleName(com.decisionhub.common.enums.RoleType.ROLE_USER).build())
                .build();

        when(commentRepository.findById(100L)).thenReturn(Optional.of(comment));
        when(userRepository.findById(55L)).thenReturn(Optional.of(regularUser));

        assertThatThrownBy(() -> commentService.deleteComment(100L, 55L))
                .isInstanceOf(ForbiddenException.class);
    }
}
