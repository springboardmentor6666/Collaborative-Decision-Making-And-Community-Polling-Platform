package com.decisionhub.service;

import com.decisionhub.dto.ModerationFlagRequest;
import com.decisionhub.dto.ModerationFlagResponse;
import com.decisionhub.entity.Category;
import com.decisionhub.entity.Decision;
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
public class ModerationServiceTest {

    @Autowired
    private ModerationService moderationService;

    @Autowired
    private ModerationFlagRepository moderationFlagRepository;

    @Autowired
    private DecisionRepository decisionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private User admin;
    private User moderator;
    private User normalUser;
    private Decision testDecision;
    private Category categoryTech;

    @BeforeEach
    void setUp() {
        moderationFlagRepository.deleteAll();
        decisionRepository.deleteAll();
        userRepository.deleteAll();
        categoryRepository.deleteAll();
        categoryRepository.flush();

        categoryTech = new Category();
        categoryTech.setName("Technology");
        categoryRepository.save(categoryTech);

        admin = new User();
        admin.setEmail("admin@example.com");
        admin.setPasswordHash("pass");
        admin.setFullName("Admin");
        admin.setRole("ADMIN");
        userRepository.save(admin);

        moderator = new User();
        moderator.setEmail("mod@example.com");
        moderator.setPasswordHash("pass");
        moderator.setFullName("Moderator");
        moderator.setRole("MODERATOR");
        userRepository.save(moderator);

        normalUser = new User();
        normalUser.setEmail("user@example.com");
        normalUser.setPasswordHash("pass");
        normalUser.setFullName("User");
        normalUser.setRole("USER");
        userRepository.save(normalUser);

        testDecision = new Decision();
        testDecision.setTitle("Bad Decision");
        testDecision.setDescription("Evaluating spam");
        testDecision.setOwner(normalUser);
        testDecision.setCategory(categoryTech);
        testDecision.setStatus("OPEN");
        testDecision.setVisibility("PUBLIC");
        decisionRepository.save(testDecision);
    }

    @Test
    void flagContent_Success() {
        ModerationFlagRequest request = new ModerationFlagRequest("DECISION", testDecision.getId(), "Inappropriate content");
        ModerationFlagResponse response = moderationService.flagContent(request, normalUser.getEmail());

        assertNotNull(response);
        assertEquals("PENDING", response.getStatus());
        assertEquals("DECISION", response.getTargetType());
        assertEquals(testDecision.getId(), response.getTargetId());
    }

    @Test
    void getAllPendingFlags_ByModerator_Success() {
        ModerationFlagRequest request = new ModerationFlagRequest("DECISION", testDecision.getId(), "Inappropriate content");
        moderationService.flagContent(request, normalUser.getEmail());

        List<ModerationFlagResponse> flags = moderationService.getAllPendingFlags(moderator.getEmail());
        assertEquals(1, flags.size());
    }

    @Test
    void getAllPendingFlags_ByNormalUser_ThrowsAccessDenied() {
        assertThrows(AccessDeniedException.class, () ->
                moderationService.getAllPendingFlags(normalUser.getEmail()));
    }

    @Test
    void resolveFlag_ByModerator_Success() {
        ModerationFlagRequest request = new ModerationFlagRequest("DECISION", testDecision.getId(), "Inappropriate content");
        ModerationFlagResponse flagResp = moderationService.flagContent(request, normalUser.getEmail());

        ModerationFlagResponse resolved = moderationService.resolveFlag(flagResp.getId(), moderator.getEmail());
        assertEquals("RESOLVED", resolved.getStatus());
    }
}
