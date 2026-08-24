package com.decisionhub.service;

import com.decisionhub.dto.DecisionRequest;
import com.decisionhub.dto.DecisionResponse;
import com.decisionhub.dto.OptionDto;
import com.decisionhub.dto.OptionRequest;
import com.decisionhub.entity.Category;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.Poll;
import com.decisionhub.entity.User;
import com.decisionhub.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class DecisionServiceTest {

    @Autowired
    private DecisionService decisionService;

    @Autowired
    private DecisionRepository decisionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private PollRepository pollRepository;

    @Autowired
    private DecisionOptionRepository decisionOptionRepository;

    @Autowired
    private PollOptionRepository pollOptionRepository;

    private User ownerUser;
    private User otherUser;
    private User adminUser;
    private User moderatorUser;
    private Category categoryTech;
    private Category categoryFinance;
    private Decision testDecision;

    @BeforeEach
    void setUp() {
        pollOptionRepository.deleteAll();
        pollRepository.deleteAll();
        decisionOptionRepository.deleteAll();
        decisionRepository.deleteAll();
        userRepository.deleteAll();
        categoryRepository.deleteAll();
        categoryRepository.flush();

        categoryTech = new Category();
        categoryTech.setName("Technology");
        categoryRepository.save(categoryTech);

        categoryFinance = new Category();
        categoryFinance.setName("Finance");
        categoryRepository.save(categoryFinance);

        ownerUser = new User();
        ownerUser.setEmail("owner@example.com");
        ownerUser.setPasswordHash("hash123");
        ownerUser.setFullName("Owner User");
        ownerUser.setRole("USER");
        userRepository.save(ownerUser);

        otherUser = new User();
        otherUser.setEmail("other@example.com");
        otherUser.setPasswordHash("hash123");
        otherUser.setFullName("Other User");
        otherUser.setRole("USER");
        userRepository.save(otherUser);

        adminUser = new User();
        adminUser.setEmail("admin@example.com");
        adminUser.setPasswordHash("hash123");
        adminUser.setFullName("Admin User");
        adminUser.setRole("ADMIN");
        userRepository.save(adminUser);

        moderatorUser = new User();
        moderatorUser.setEmail("mod@example.com");
        moderatorUser.setPasswordHash("hash123");
        moderatorUser.setFullName("Moderator User");
        moderatorUser.setRole("MODERATOR");
        userRepository.save(moderatorUser);

        testDecision = new Decision();
        testDecision.setTitle("Should we adopt Microservices?");
        testDecision.setDescription("Evaluating architecture options");
        testDecision.setOwner(ownerUser);
        testDecision.setCategory(categoryTech);
        testDecision.setStatus("OPEN");
        testDecision.setVisibility("PUBLIC");
        decisionRepository.save(testDecision);
    }

    @Test
    void updateDecision_ByOwner_Success() {
        DecisionRequest request = new DecisionRequest();
        request.setTitle("Updated Title");
        request.setDescription("Updated Description");
        request.setCategoryId(categoryTech.getId());

        DecisionResponse response = decisionService.updateDecision(testDecision.getId(), request, ownerUser.getEmail());

        assertNotNull(response);
        assertEquals("Updated Title", response.getTitle());
        assertEquals("Updated Description", response.getDescription());
    }

    @Test
    void updateDecision_ByAdmin_Success() {
        DecisionRequest request = new DecisionRequest();
        request.setTitle("Admin Updated Title");
        request.setDescription("Updated Description");
        request.setCategoryId(categoryTech.getId());

        DecisionResponse response = decisionService.updateDecision(testDecision.getId(), request, adminUser.getEmail());

        assertEquals("Admin Updated Title", response.getTitle());
    }

    @Test
    void updateDecision_ByNonOwner_ThrowsAccessDenied() {
        DecisionRequest request = new DecisionRequest();
        request.setTitle("Hacked Title");

        assertThrows(AccessDeniedException.class, () ->
                decisionService.updateDecision(testDecision.getId(), request, otherUser.getEmail()));
    }

    @Test
    void deleteDecision_ByOwner_Success() {
        decisionService.deleteDecision(testDecision.getId(), ownerUser.getEmail());

        Decision deleted = decisionRepository.findById(testDecision.getId()).orElse(null);
        assertNotNull(deleted);
        assertTrue(deleted.getIsDeleted());
    }

    @Test
    void deleteDecision_ByModerator_Success() {
        decisionService.deleteDecision(testDecision.getId(), moderatorUser.getEmail());

        Decision deleted = decisionRepository.findById(testDecision.getId()).orElse(null);
        assertNotNull(deleted);
        assertTrue(deleted.getIsDeleted());
    }

    @Test
    void deleteDecision_ByAdmin_Success() {
        decisionService.deleteDecision(testDecision.getId(), adminUser.getEmail());

        Decision deleted = decisionRepository.findById(testDecision.getId()).orElse(null);
        assertNotNull(deleted);
        assertTrue(deleted.getIsDeleted());
    }

    @Test
    void deleteDecision_ByNonOwner_ThrowsAccessDenied() {
        assertThrows(AccessDeniedException.class, () ->
                decisionService.deleteDecision(testDecision.getId(), otherUser.getEmail()));
    }

    @Test
    void addOption_ByOwner_Success() {
        // Create an attached poll for the decision
        Poll poll = new Poll();
        poll.setDecision(testDecision);
        poll.setQuestion("Which option?");
        pollRepository.save(poll);

        OptionRequest optionRequest = new OptionRequest("Option A", "First option");
        OptionDto optionDto = decisionService.addOption(testDecision.getId(), optionRequest, ownerUser.getEmail());

        assertNotNull(optionDto.getId());
        assertEquals("Option A", optionDto.getLabel());
        assertEquals("First option", optionDto.getDescription());

        // Verify poll option was created
        assertEquals(1, pollOptionRepository.findByPollId(poll.getId()).size());
    }

    @Test
    void addOption_ByNonOwner_ThrowsAccessDenied() {
        OptionRequest optionRequest = new OptionRequest("Option Hack", "Hacked option");

        assertThrows(AccessDeniedException.class, () ->
                decisionService.addOption(testDecision.getId(), optionRequest, otherUser.getEmail()));
    }

    @Test
    void addOption_ToClosedDecision_ThrowsIllegalState() {
        testDecision.setStatus("CLOSED");
        decisionRepository.save(testDecision);

        OptionRequest optionRequest = new OptionRequest("Option A", "Option on closed decision");

        assertThrows(IllegalStateException.class, () ->
                decisionService.addOption(testDecision.getId(), optionRequest, ownerUser.getEmail()));
    }

    @Test
    void closeDecision_ByOwner_Success() {
        DecisionResponse response = decisionService.closeDecision(testDecision.getId(), ownerUser.getEmail());

        assertEquals("CLOSED", response.getStatus());
        Decision updated = decisionRepository.findById(testDecision.getId()).orElse(null);
        assertNotNull(updated);
        assertEquals("CLOSED", updated.getStatus());
    }

    @Test
    void checkAndApplyStatusTransition_ExpiredPoll_TransitionsToExpired() {
        Poll expiredPoll = new Poll();
        expiredPoll.setDecision(testDecision);
        expiredPoll.setQuestion("Expired poll question");
        expiredPoll.setEndsAt(LocalDateTime.now().minusDays(1));
        pollRepository.save(expiredPoll);

        decisionService.checkAndApplyStatusTransition(testDecision);

        assertEquals("EXPIRED", testDecision.getStatus());
    }

    @Test
    void getDecisions_PaginationAndFiltering_Success() {
        // Create second decision under Finance
        Decision dec2 = new Decision();
        dec2.setTitle("Budget Allocation 2026");
        dec2.setDescription("Annual planning");
        dec2.setOwner(ownerUser);
        dec2.setCategory(categoryFinance);
        dec2.setStatus("CLOSED");
        decisionRepository.save(dec2);

        Pageable pageable = PageRequest.of(0, 10, Sort.by("createdAt").descending());

        // Filter by category
        Page<DecisionResponse> techPage = decisionService.getDecisions(categoryTech.getId(), null, null, pageable);
        assertEquals(1, techPage.getTotalElements());
        assertEquals("Should we adopt Microservices?", techPage.getContent().get(0).getTitle());

        // Filter by status
        Page<DecisionResponse> closedPage = decisionService.getDecisions(null, "CLOSED", null, pageable);
        assertEquals(1, closedPage.getTotalElements());
        assertEquals("Budget Allocation 2026", closedPage.getContent().get(0).getTitle());

        // Search filter
        Page<DecisionResponse> searchPage = decisionService.getDecisions(null, null, "Microservices", pageable);
        assertEquals(1, searchPage.getTotalElements());
    }
}
