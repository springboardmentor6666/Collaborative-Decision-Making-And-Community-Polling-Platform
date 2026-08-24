package com.decisionhub.service;

import com.decisionhub.dto.DecisionResponse;
import com.decisionhub.entity.Category;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.User;
import com.decisionhub.repository.CategoryRepository;
import com.decisionhub.repository.DecisionRepository;
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
public class SavedDecisionsServiceTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DecisionRepository decisionRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private User testUser;
    private Decision testDecision;
    private Category categoryTech;

    @BeforeEach
    void setUp() {
        decisionRepository.deleteAll();
        userRepository.deleteAll();
        categoryRepository.deleteAll();
        categoryRepository.flush();

        categoryTech = new Category();
        categoryTech.setName("Technology");
        categoryRepository.save(categoryTech);

        testUser = new User();
        testUser.setEmail("user@example.com");
        testUser.setPasswordHash("pass");
        testUser.setFullName("User Saved Decisions");
        userRepository.save(testUser);

        testDecision = new Decision();
        testDecision.setTitle("AWS vs GCP");
        testDecision.setDescription("Cloud choices");
        testDecision.setOwner(testUser);
        testDecision.setCategory(categoryTech);
        testDecision.setStatus("OPEN");
        testDecision.setVisibility("PUBLIC");
        decisionRepository.save(testDecision);
    }

    @Test
    void saveAndUnsaveDecision_Success() {
        // Save
        List<DecisionResponse> savedList = userService.saveDecision(testDecision.getId(), testUser.getEmail());
        assertEquals(1, savedList.size());
        assertEquals(testDecision.getId(), savedList.get(0).getId());

        // Get saved list
        List<DecisionResponse> list = userService.getSavedDecisions(testUser.getEmail());
        assertEquals(1, list.size());

        // Unsave
        List<DecisionResponse> afterUnsaveList = userService.unsaveDecision(testDecision.getId(), testUser.getEmail());
        assertEquals(0, afterUnsaveList.size());
    }
}
