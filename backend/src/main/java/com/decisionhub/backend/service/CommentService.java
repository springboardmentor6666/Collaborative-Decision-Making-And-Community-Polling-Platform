package com.decisionhub.backend.service;

import com.decisionhub.backend.dto.CommentRequest;
import com.decisionhub.backend.dto.CommentResponse;

import java.util.List;

public interface CommentService {

    List<CommentResponse> list(
            Long decisionId
    );

    CommentResponse add(
            Long decisionId,
            CommentRequest request
    );

    void delete(
            Long id
    );
}