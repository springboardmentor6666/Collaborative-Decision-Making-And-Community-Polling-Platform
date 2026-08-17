package com.decisionhub;

import com.decisionhub.dto.CommentRequest;
import com.decisionhub.dto.CommentResponse;
import com.decisionhub.entity.Category;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.User;
import com.decisionhub.repository.CategoryRepository;
import com.decisionhub.repository.CommentRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.CommentService;
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
public class CommentServiceTest {

    @Autowired
    private CommentService commentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DecisionRepository decisionRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CommentRepository commentRepository;

    private User testUser1;
    private User testUser2;
    private User adminUser;
    private Decision testDecision;
    private Decision anotherDecision;

    @BeforeEach
    void setUp() {
        commentRepository.deleteAll();
        decisionRepository.deleteAll();
        userRepository.deleteAll();
        categoryRepository.deleteAll();

        Category category = new Category();
        category.setName("Technology");
        categoryRepository.save(category);

        testUser1 = new User();
        testUser1.setEmail("user1@example.com");
        testUser1.setPasswordHash("hashedpassword");
        testUser1.setFullName("User One");
        testUser1.setRole("USER");
        userRepository.save(testUser1);

        testUser2 = new User();
        testUser2.setEmail("user2@example.com");
        testUser2.setPasswordHash("hashedpassword");
        testUser2.setFullName("User Two");
        testUser2.setRole("USER");
        userRepository.save(testUser2);

        adminUser = new User();
        adminUser.setEmail("admin@example.com");
        adminUser.setPasswordHash("hashedpassword");
        adminUser.setFullName("Admin User");
        adminUser.setRole("ADMIN");
        userRepository.save(adminUser);

        testDecision = new Decision();
        testDecision.setOwner(testUser1);
        testDecision.setTitle("Test Decision 1");
        testDecision.setCategory(category);
        decisionRepository.save(testDecision);
        
        anotherDecision = new Decision();
        anotherDecision.setOwner(testUser2);
        anotherDecision.setTitle("Test Decision 2");
        anotherDecision.setCategory(category);
        decisionRepository.save(anotherDecision);
    }

    @Test
    void createComment_Valid_Success() {
        CommentRequest request = new CommentRequest();
        request.setDecisionId(testDecision.getId());
        request.setContent("This is a great decision!");

        CommentResponse response = commentService.createComment(request, testUser1.getEmail());

        assertNotNull(response.getId());
        assertEquals("This is a great decision!", response.getContent());
        assertEquals(testDecision.getId(), response.getDecisionId());
        assertEquals(testUser1.getEmail(), response.getAuthor().getEmail());
    }

    @Test
    void createComment_Unauthenticated_ThrowsException() {
        CommentRequest request = new CommentRequest();
        request.setDecisionId(testDecision.getId());
        request.setContent("This is a great decision!");

        assertThrows(IllegalArgumentException.class, () -> 
            commentService.createComment(request, "unknown@example.com"));
    }

    @Test
    void createComment_InvalidDecision_ThrowsException() {
        CommentRequest request = new CommentRequest();
        request.setDecisionId(999L);
        request.setContent("This is a great decision!");

        assertThrows(RuntimeException.class, () -> 
            commentService.createComment(request, testUser1.getEmail()));
    }

    @Test
    void getComments_ReturnsCorrectList() {
        CommentRequest request = new CommentRequest(testDecision.getId(), "Comment 1");
        commentService.createComment(request, testUser1.getEmail());
        
        CommentRequest request2 = new CommentRequest(testDecision.getId(), "Comment 2");
        commentService.createComment(request2, testUser2.getEmail());

        List<CommentResponse> comments = commentService.getCommentsByDecisionId(testDecision.getId());
        
        assertEquals(2, comments.size());
    }

    @Test
    void replyToComment_Valid_Success() {
        CommentRequest request = new CommentRequest(testDecision.getId(), "Parent Comment");
        CommentResponse parent = commentService.createComment(request, testUser1.getEmail());

        CommentRequest replyRequest = new CommentRequest(testDecision.getId(), "Reply Comment");
        CommentResponse reply = commentService.replyToComment(parent.getId(), replyRequest, testUser2.getEmail());

        assertNotNull(reply.getId());
        assertEquals(parent.getId(), reply.getParentId());
        assertEquals(testDecision.getId(), reply.getDecisionId());
    }

    @Test
    void replyToComment_CrossDecision_ThrowsException() {
        CommentRequest request = new CommentRequest(testDecision.getId(), "Parent Comment");
        CommentResponse parent = commentService.createComment(request, testUser1.getEmail());

        // Try to reply to parent from testDecision, but supply anotherDecision ID
        CommentRequest replyRequest = new CommentRequest(anotherDecision.getId(), "Sneaky Cross Reply");
        
        assertThrows(IllegalArgumentException.class, () -> 
            commentService.replyToComment(parent.getId(), replyRequest, testUser2.getEmail()));
    }

    @Test
    void updateComment_ByAuthor_Success() {
        CommentRequest request = new CommentRequest(testDecision.getId(), "Original");
        CommentResponse comment = commentService.createComment(request, testUser1.getEmail());

        CommentRequest updateRequest = new CommentRequest(testDecision.getId(), "Updated");
        CommentResponse updated = commentService.updateComment(comment.getId(), updateRequest, testUser1.getEmail());

        assertEquals("Updated", updated.getContent());
    }

    @Test
    void updateComment_ByOtherUser_ThrowsAccessDenied() {
        CommentRequest request = new CommentRequest(testDecision.getId(), "Original");
        CommentResponse comment = commentService.createComment(request, testUser1.getEmail());

        CommentRequest updateRequest = new CommentRequest(testDecision.getId(), "Updated");
        
        assertThrows(AccessDeniedException.class, () -> 
            commentService.updateComment(comment.getId(), updateRequest, testUser2.getEmail()));
    }

    @Test
    void deleteComment_ByAuthor_Success() {
        CommentRequest request = new CommentRequest(testDecision.getId(), "Original");
        CommentResponse comment = commentService.createComment(request, testUser1.getEmail());

        assertDoesNotThrow(() -> commentService.deleteComment(comment.getId(), testUser1.getEmail()));
        assertTrue(commentRepository.findById(comment.getId()).isEmpty());
    }

    @Test
    void deleteComment_ByAdmin_Success() {
        CommentRequest request = new CommentRequest(testDecision.getId(), "Original");
        CommentResponse comment = commentService.createComment(request, testUser1.getEmail());

        assertDoesNotThrow(() -> commentService.deleteComment(comment.getId(), adminUser.getEmail()));
        assertTrue(commentRepository.findById(comment.getId()).isEmpty());
    }

    @Test
    void deleteComment_ByOtherUser_ThrowsAccessDenied() {
        CommentRequest request = new CommentRequest(testDecision.getId(), "Original");
        CommentResponse comment = commentService.createComment(request, testUser1.getEmail());
        
        assertThrows(AccessDeniedException.class, () -> 
            commentService.deleteComment(comment.getId(), testUser2.getEmail()));
    }
}
