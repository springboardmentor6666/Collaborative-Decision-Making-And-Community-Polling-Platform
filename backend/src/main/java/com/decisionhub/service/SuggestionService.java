package com.decisionhub.service;

import com.decisionhub.dto.SuggestionRequest;
import com.decisionhub.dto.SuggestionResponse;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.Suggestion;
import com.decisionhub.entity.User;
import com.decisionhub.exception.DecisionNotFoundException;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.SuggestionRepository;
import com.decisionhub.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SuggestionService {

    private final SuggestionRepository suggestionRepository;
    private final DecisionRepository decisionRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public SuggestionService(SuggestionRepository suggestionRepository,
                             DecisionRepository decisionRepository,
                             UserRepository userRepository,
                             UserService userService) {
        this.suggestionRepository = suggestionRepository;
        this.decisionRepository = decisionRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @Transactional
    public SuggestionResponse createSuggestion(SuggestionRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));

        Decision decision = decisionRepository.findById(request.getDecisionId())
                .orElseThrow(() -> new DecisionNotFoundException("Decision not found with id: " + request.getDecisionId()));

        Suggestion suggestion = new Suggestion();
        suggestion.setDecision(decision);
        suggestion.setUser(user);
        suggestion.setContent(request.getContent());

        Suggestion saved = suggestionRepository.save(suggestion);
        return mapToSuggestionResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<SuggestionResponse> getSuggestionsByDecisionId(Long decisionId) {
        if (!decisionRepository.existsById(decisionId)) {
            throw new DecisionNotFoundException("Decision not found with id: " + decisionId);
        }
        return suggestionRepository.findByDecisionId(decisionId).stream()
                .map(this::mapToSuggestionResponse)
                .collect(Collectors.toList());
    }

    public SuggestionResponse mapToSuggestionResponse(Suggestion suggestion) {
        return new SuggestionResponse(
                suggestion.getId(),
                suggestion.getDecision().getId(),
                userService.mapToUserResponse(suggestion.getUser()),
                suggestion.getContent(),
                suggestion.getCreatedAt()
        );
    }
}
