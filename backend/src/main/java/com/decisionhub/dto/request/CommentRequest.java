package com.decisionhub.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentRequest {

    @NotNull(message = "Decision ID is required")
    private Long decisionId;

    private Long parentCommentId;

    @NotBlank(message = "Message cannot be empty")
    private String message;
}
