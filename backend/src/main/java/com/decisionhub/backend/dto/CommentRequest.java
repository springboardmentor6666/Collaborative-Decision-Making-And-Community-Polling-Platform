package com.decisionhub.backend.dto;

import jakarta.validation.constraints.NotBlank;

import lombok.Data;

@Data
public class CommentRequest {

    @NotBlank(message = "Comment cannot be empty")
    private String content;
}