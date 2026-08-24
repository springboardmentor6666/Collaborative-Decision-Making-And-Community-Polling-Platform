package com.decisionhub.service;

import com.decisionhub.dto.RecommendationRequest;
import com.decisionhub.dto.RecommendationResponse;
import com.decisionhub.entity.Category;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.DecisionOption;
import com.decisionhub.entity.User;
import com.decisionhub.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class RecommendationServiceTest {

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private RecommendationRepository recommendationRepository;

    @Autowired
    private DecisionRepository decisionRepository;

    @Autowired
    private DecisionOptionRepository decisionOptionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private User expertUser;
    private User normalUser;
    private Decision testDecision;
    private DecisionOption testOption;
    private Category categoryTech;

    @BeforeEach
    void setUp() {
        recommendationRepository.deleteAll();
        decisionOptionRepository.deleteAll();
        decisionRepository.deleteAll();
        userRepository.deleteAll();
        categoryRepository.deleteAll();
        categoryRepository.flush();

        categoryTech = new Category();
        categoryTech.setName("Technology");
        categoryRepository.save(categoryTech);

        expertUser = new User();
        expertUser.setEmail("expert@example.com");
        expertUser.setPasswordHash("pass123");
        expertUser.setFullName("Expert User");
        expertUser.setRole("EXPERT");
        userRepository.save(expertUser);

        normalUser = new User();
        normalUser.setEmail("normal@example.com");
        normalUser.setPasswordHash("pass123");
        normalUser.setFullName("Normal User");
        normalUser.setRole("USER");
        userRepository.save(normalUser);

        testDecision = new Decision();
        testDecision.setTitle("Which cloud provider should we use?");
        testDecision.setDescription("AWS vs GCP");
        testDecision.setOwner(normalUser);
        testDecision.setCategory(categoryTech);
        testDecision.setStatus("OPEN");
        testDecision.setVisibility("PUBLIC");
        decisionRepository.save(testDecision);

        testOption = new DecisionOption();
        testOption.setDecision(testDecision);
        testOption.setLabel("AWS");
        testOption.setDescription("Amazon Web Services");
        decisionOptionRepository.save(testOption);
    }

    @Test
    void createRecommendation_ByExpert_Success() {
        RecommendationRequest request = new RecommendationRequest(testDecision.getId(), testOption.getId(), "AWS has better pricing and support.");
        RecommendationResponse response = recommendationService.createRecommendation(request, expertUser.getEmail());

        assertNotNull(response);
        assertNotNull(response.getId());
        assertEquals("AWS has better pricing and support.", response.getJustification());
        assertEquals("AWS", response.getRecommendedOptionLabel());
        assertEquals(expertUser.getEmail(), response.getExpert().getEmail());
    }

    @Test
    void createRecommendation_ByNormalUser_ThrowsAccessDenied() {
        RecommendationRequest request = new RecommendationRequest(testDecision.getId(), testOption.getId(), "AWS is cool.");
        assertThrows(AccessDeniedException.class, () ->
                recommendationService.createRecommendation(request, normalUser.getEmail()));
    }

    @Test
    void getRecommendationsByDecisionId_Success() {
        RecommendationRequest request = new RecommendationRequest(testDecision.getId(), testOption.getId(), "AWS is best.");
        recommendationService.createRecommendation(request, expertUser.getEmail());

        List<RecommendationResponse> list = recommendationService.getRecommendationsByDecisionId(testDecision.getId());
        assertEquals(1, list.size());
        assertEquals("AWS is best.", list.get(0).getJustification());
    }
}
