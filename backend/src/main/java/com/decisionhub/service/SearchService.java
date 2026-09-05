package com.decisionhub.service;

import com.decisionhub.dto.*;
import com.decisionhub.entity.Comment;
import com.decisionhub.entity.Community;
import com.decisionhub.entity.Decision;
import com.decisionhub.repository.CommentRepository;
import com.decisionhub.repository.CommunityRepository;
import com.decisionhub.repository.DecisionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SearchService {

    private final DecisionRepository decisionRepository;
    private final CommunityRepository communityRepository;
    private final CommentRepository commentRepository;
    private final DecisionService decisionService;
    private final CommunityService communityService;
    private final CommentService commentService;

    public SearchService(DecisionRepository decisionRepository,
                         CommunityRepository communityRepository,
                         CommentRepository commentRepository,
                         DecisionService decisionService,
                         CommunityService communityService,
                         CommentService commentService) {
        this.decisionRepository = decisionRepository;
        this.communityRepository = communityRepository;
        this.commentRepository = commentRepository;
        this.decisionService = decisionService;
        this.communityService = communityService;
        this.commentService = commentService;
    }

    @Transactional(readOnly = true)
    public SearchResponse search(String query, String type, int page, int size, String userEmail) {
        String cleanQuery = (query != null) ? query.trim() : "";
        String cleanType = (type != null && !type.isBlank()) ? type.toLowerCase().trim() : "all";
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));

        List<DecisionResponse> decisionResponses = new ArrayList<>();
        List<CommunityResponse> communityResponses = new ArrayList<>();
        List<CommentResponse> commentResponses = new ArrayList<>();

        long totalDecisions = 0;
        long totalCommunities = 0;
        long totalComments = 0;

        // Search Decisions
        if ("all".equals(cleanType) || "decisions".equals(cleanType)) {
            Page<Decision> decisionsPage = decisionRepository.searchDecisions(cleanQuery, userEmail, pageable);
            totalDecisions = decisionsPage.getTotalElements();
            decisionResponses = decisionsPage.getContent().stream()
                    .map(decisionService::mapToDecisionResponse)
                    .collect(Collectors.toList());
        }

        // Search Communities
        if ("all".equals(cleanType) || "communities".equals(cleanType)) {
            Page<Community> communitiesPage = communityRepository.searchCommunitiesPaged(cleanQuery, userEmail, pageable);
            totalCommunities = communitiesPage.getTotalElements();
            communityResponses = communitiesPage.getContent().stream()
                    .map(c -> communityService.mapToCommunityResponse(c, userEmail))
                    .collect(Collectors.toList());
        }

        // Search Comments
        if ("all".equals(cleanType) || "comments".equals(cleanType)) {
            Page<Comment> commentsPage = commentRepository.searchCommentsPaged(cleanQuery, userEmail, pageable);
            totalComments = commentsPage.getTotalElements();
            commentResponses = commentsPage.getContent().stream()
                    .map(c -> commentService.mapToCommentResponse(c, userEmail))
                    .collect(Collectors.toList());
        }

        return new SearchResponse(
                cleanQuery,
                cleanType,
                decisionResponses,
                communityResponses,
                commentResponses,
                totalDecisions,
                totalCommunities,
                totalComments
        );
    }
}
