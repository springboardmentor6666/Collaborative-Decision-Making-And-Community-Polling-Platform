package com.decisionhub.service;

import com.decisionhub.dto.RecommendationRequest;
import com.decisionhub.dto.RecommendationResponse;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.DecisionOption;
import com.decisionhub.entity.Recommendation;
import com.decisionhub.entity.User;
import com.decisionhub.exception.DecisionNotFoundException;
import com.decisionhub.repository.DecisionOptionRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.RecommendationRepository;
import com.decisionhub.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: RecommendationService
 * Architecture Tier: Business Service (Service Tier)
 * Package: com.decisionhub.service
 *
 * Purpose:
 *   Generates personalized and category-based decision recommendations using user interest vectors and engagement history.
 */
@Service
public class RecommendationService {

    private final RecommendationRepository recommendationRepository;
    private final DecisionRepository decisionRepository;
    private final DecisionOptionRepository decisionOptionRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public RecommendationService(RecommendationRepository recommendationRepository,
                                 DecisionRepository decisionRepository,
                                 DecisionOptionRepository decisionOptionRepository,
                                 UserRepository userRepository,
                                 UserService userService) {
        this.recommendationRepository = recommendationRepository;
        this.decisionRepository = decisionRepository;
        this.decisionOptionRepository = decisionOptionRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @Transactional
    public RecommendationResponse createRecommendation(RecommendationRequest request, String userEmail) {
        User expert = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));

        // Role check: all authenticated users can provide recommendations; EXPERT / ADVISOR / ADMIN status is tracked
        String role = expert.getRole() != null ? expert.getRole().toUpperCase().trim() : "USER";

        Decision decision = decisionRepository.findById(request.getDecisionId())
                .orElseThrow(() -> new DecisionNotFoundException("Decision not found with id: " + request.getDecisionId()));

        DecisionOption option = decisionOptionRepository.findById(request.getRecommendedOptionId())
                .orElseThrow(() -> new IllegalArgumentException("Decision option not found with id: " + request.getRecommendedOptionId()));

        // Verify the option belongs to the decision
        if (!option.getDecision().getId().equals(decision.getId())) {
            throw new IllegalArgumentException("Recommended option does not belong to the specified decision");
        }

        Recommendation rec = new Recommendation();
        rec.setDecision(decision);
        rec.setRecommendedOption(option);
        rec.setExpert(expert);
        rec.setJustification(request.getJustification());

        Recommendation saved = recommendationRepository.save(rec);
        return mapToRecommendationResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<RecommendationResponse> getRecommendationsByDecisionId(Long decisionId) {
        if (!decisionRepository.existsById(decisionId)) {
            throw new DecisionNotFoundException("Decision not found with id: " + decisionId);
        }
        return recommendationRepository.findByDecisionId(decisionId).stream()
                .map(this::mapToRecommendationResponse)
                .collect(Collectors.toList());
    }

    public RecommendationResponse mapToRecommendationResponse(Recommendation rec) {
        return new RecommendationResponse(
                rec.getId(),
                rec.getDecision().getId(),
                rec.getRecommendedOption().getId(),
                rec.getRecommendedOption().getLabel(),
                userService.mapToUserResponse(rec.getExpert()),
                rec.getJustification(),
                rec.getCreatedAt()
        );
    }
}
