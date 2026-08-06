package com.decisionhub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {

    private Long commentId;
    private Long decisionId;
    private UserResponse user;
    private Long parentCommentId;
    private String message;
    private boolean edited;
    private List<CommentResponse> replies;
    private LocalDateTime createdAt;
}
