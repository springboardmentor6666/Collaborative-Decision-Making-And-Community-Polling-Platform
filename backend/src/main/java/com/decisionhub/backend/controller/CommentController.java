package com.decisionhub.backend.controller;

import com.decisionhub.backend.dto.CommentRequest;
import com.decisionhub.backend.dto.CommentResponse;
import com.decisionhub.backend.service.CommentService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CommentController {

    private final CommentService service;

    public CommentController(
            CommentService service
    ) {
        this.service = service;
    }


    @GetMapping("/decisions/{decisionId}/comments")
    public List<CommentResponse> list(
            @PathVariable Long decisionId
    ) {

        return service.list(decisionId);
    }


    @PostMapping("/decisions/{decisionId}/comments")
    public CommentResponse add(
            @PathVariable Long decisionId,
            @Valid @RequestBody CommentRequest request
    ) {

        return service.add(
                decisionId,
                request
        );
    }


    @DeleteMapping("/comments/{id}")
    public void delete(
            @PathVariable Long id
    ) {

        service.delete(id);
    }
}