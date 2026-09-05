package com.decisionhub.service;

import com.decisionhub.dto.SearchResponse;
import com.decisionhub.entity.Comment;
import com.decisionhub.entity.Community;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.User;
import com.decisionhub.repository.CommentRepository;
import com.decisionhub.repository.CommunityRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class SearchServiceTest {

    @Autowired
    private SearchService searchService;

    @Autowired
    private DecisionRepository decisionRepository;

    @Autowired
    private CommunityRepository communityRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    private User user;

    @BeforeEach
    void setUp() {
        commentRepository.deleteAll();
        decisionRepository.deleteAll();
        communityRepository.deleteAll();
        userRepository.deleteAll();

        user = new User();
        user.setEmail("search_user@test.com");
        user.setFullName("Search Tester");
        user.setPasswordHash("pass");
        userRepository.save(user);

        // 1. Create Decision
        Decision decision = new Decision();
        decision.setTitle("Kubernetes Deployment Strategy");
        decision.setDescription("Evaluating Helm vs Kustomize for microservices");
        decision.setOwner(user);
        decision.setVisibility("PUBLIC");
        decision.setStatus("OPEN");
        decisionRepository.save(decision);

        // 2. Create Community
        Community community = new Community();
        community.setName("Kubernetes Operators Community");
        community.setDescription("Discussions on container orchestration and cloud native systems");
        community.setVisibility("PUBLIC");
        community.setCreatedBy(user);
        communityRepository.save(community);

        // 3. Create Comment
        Comment comment = new Comment();
        comment.setDecision(decision);
        comment.setAuthor(user);
        comment.setContent("We should consider GitOps workflow with ArgoCD");
        commentRepository.save(comment);
    }

    @Test
    void search_ReturnsAllMatchingEntities() {
        SearchResponse response = searchService.search("Kubernetes", "all", 0, 10, user.getEmail());

        assertNotNull(response);
        assertEquals("kubernetes", response.getQuery().toLowerCase());
        assertEquals("all", response.getType());
        assertEquals(1, response.getTotalDecisions());
        assertEquals(1, response.getTotalCommunities());
        assertEquals(2, response.getTotalResults());
        assertEquals("Kubernetes Deployment Strategy", response.getDecisions().get(0).getTitle());
        assertEquals("Kubernetes Operators Community", response.getCommunities().get(0).getName());
    }

    @Test
    void search_FiltersByType() {
        SearchResponse response = searchService.search("GitOps", "comments", 0, 10, user.getEmail());

        assertNotNull(response);
        assertEquals(0, response.getTotalDecisions());
        assertEquals(0, response.getTotalCommunities());
        assertEquals(1, response.getTotalComments());
        assertTrue(response.getComments().get(0).getContent().contains("ArgoCD"));
    }
}
