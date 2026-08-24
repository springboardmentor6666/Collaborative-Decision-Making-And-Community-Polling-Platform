package com.decisionhub.service;

import com.decisionhub.dto.SuggestionRequest;
import com.decisionhub.dto.SuggestionResponse;
import com.decisionhub.entity.Category;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.Suggestion;
import com.decisionhub.entity.User;
import com.decisionhub.exception.DecisionNotFoundException;
import com.decisionhub.repository.CategoryRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.SuggestionRepository;
import com.decisionhub.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class SuggestionServiceTest {

    @Autowired
    private SuggestionService suggestionService;

    @Autowired
    private SuggestionRepository suggestionRepository;

    @Autowired
    private DecisionRepository decisionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private User testUser;
    private Decision testDecision;
    private Category categoryTech;

    @BeforeEach
    void setUp() {
        suggestionRepository.deleteAll();
        decisionRepository.deleteAll();
        userRepository.deleteAll();
        categoryRepository.deleteAll();
        categoryRepository.flush();

        categoryTech = new Category();
        categoryTech.setName("Technology");
        categoryRepository.save(categoryTech);

        testUser = new User();
        testUser.setEmail("voter@example.com");
        testUser.setPasswordHash("pass123");
        testUser.setFullName("Voter User");
        userRepository.save(testUser);

        testDecision = new Decision();
        testDecision.setTitle("Which cloud provider should we use?");
        testDecision.setDescription("AWS vs GCP");
        testDecision.setOwner(testUser);
        testDecision.setCategory(categoryTech);
        testDecision.setStatus("OPEN");
        testDecision.setVisibility("PUBLIC");
        decisionRepository.save(testDecision);
    }

    @Test
    void createSuggestion_Success() {
        SuggestionRequest request = new SuggestionRequest(testDecision.getId(), "How about Azure?");
        SuggestionResponse response = suggestionService.createSuggestion(request, testUser.getEmail());

        assertNotNull(response);
        assertNotNull(response.getId());
        assertEquals("How about Azure?", response.getContent());
        assertEquals(testUser.getEmail(), response.getUser().getEmail());
    }

    @Test
    void createSuggestion_DecisionNotFound_ThrowsException() {
        SuggestionRequest request = new SuggestionRequest(999L, "How about Azure?");
        assertThrows(DecisionNotFoundException.class, () ->
                suggestionService.createSuggestion(request, testUser.getEmail()));
    }

    @Test
    void getSuggestionsByDecisionId_Success() {
        Suggestion suggestion = new Suggestion();
        suggestion.setDecision(testDecision);
        suggestion.setUser(testUser);
        suggestion.setContent("Consider hybrid cloud");
        suggestionRepository.save(suggestion);

        List<SuggestionResponse> suggestions = suggestionService.getSuggestionsByDecisionId(testDecision.getId());
        assertEquals(1, suggestions.size());
        assertEquals("Consider hybrid cloud", suggestions.get(0).getContent());
    }
}
