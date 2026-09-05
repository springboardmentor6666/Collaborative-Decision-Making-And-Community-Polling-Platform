package com.decisionhub.controller;

import com.decisionhub.dto.SearchResponse;
import com.decisionhub.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@Tag(name = "Search", description = "Endpoints for unified global full-text search across platform")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping
    @Operation(summary = "Unified global search", description = "Searches across decisions, communities, and comments with privacy filtering")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<SearchResponse> search(
            @RequestParam(name = "q", required = false, defaultValue = "") String query,
            @RequestParam(name = "type", required = false, defaultValue = "all") String type,
            @RequestParam(name = "page", required = false, defaultValue = "0") int page,
            @RequestParam(name = "size", required = false, defaultValue = "20") int size,
            Authentication authentication) {

        String email = authentication != null ? authentication.getName() : null;
        SearchResponse response = searchService.search(query, type, page, size, email);
        return ResponseEntity.ok(response);
    }
}
