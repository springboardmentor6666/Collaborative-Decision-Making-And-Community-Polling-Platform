package com.decisionhub.service;

import com.decisionhub.dto.CommentReactionRequest;
import com.decisionhub.dto.CommentRequest;
import com.decisionhub.dto.CommentResponse;
import com.decisionhub.entity.Comment;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.User;
import com.decisionhub.repository.CommentReactionRepository;
import com.decisionhub.repository.CommentRepository;
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
public class CommentReactionTest {

    @Autowired
    private CommentService commentService;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private CommentReactionRepository commentReactionRepository;

    @Autowired
    private DecisionRepository decisionRepository;

    @Autowired
    private UserRepository userRepository;

    private User author;
    private User reactor1;
    private User reactor2;
    private Decision decision;
    private Comment comment1;
    private Comment comment2;

    @BeforeEach
    void setUp() {
        commentReactionRepository.deleteAll();
        commentRepository.deleteAll();
        decisionRepository.deleteAll();
        userRepository.deleteAll();

        author = createUser("author@test.com", "Author");
        reactor1 = createUser("reactor1@test.com", "Reactor One");
        reactor2 = createUser("reactor2@test.com", "Reactor Two");

        decision = new Decision();
        decision.setTitle("Architecture Discussion");
        decision.setOwner(author);
        decision.setStatus("OPEN");
        decisionRepository.save(decision);

        comment1 = createComment(decision, author, "First comment with thoughtful reasoning");
        comment2 = createComment(decision, author, "Second comment with alternative idea");
    }

    private User createUser(String email, String name) {
        User u = new User();
        u.setEmail(email);
        u.setFullName(name);
        u.setPasswordHash("pass");
        return userRepository.save(u);
    }

    private Comment createComment(Decision dec, User auth, String content) {
        Comment c = new Comment();
        c.setDecision(dec);
        c.setAuthor(auth);
        c.setContent(content);
        c.setUpvotesCount(0);
        c.setDownvotesCount(0);
        return commentRepository.save(c);
    }

    @Test
    void toggleReaction_UpvoteAndDownvote() {
        // Reactor 1 UPVOTES comment1
        CommentResponse res1 = commentService.toggleReaction(comment1.getId(), new CommentReactionRequest("UPVOTE"), reactor1.getEmail());
        assertEquals(1, res1.getUpvotesCount());
        assertEquals(0, res1.getDownvotesCount());
        assertEquals(1, res1.getScore());
        assertEquals("UPVOTE", res1.getUserReaction());

        // Reactor 1 toggles UPVOTE again -> reaction removed
        CommentResponse res2 = commentService.toggleReaction(comment1.getId(), new CommentReactionRequest("UPVOTE"), reactor1.getEmail());
        assertEquals(0, res2.getUpvotesCount());
        assertEquals(0, res2.getDownvotesCount());
        assertEquals(0, res2.getScore());
        assertNull(res2.getUserReaction());

        // Reactor 1 DOWNVOTES comment1
        CommentResponse res3 = commentService.toggleReaction(comment1.getId(), new CommentReactionRequest("DOWNVOTE"), reactor1.getEmail());
        assertEquals(0, res3.getUpvotesCount());
        assertEquals(1, res3.getDownvotesCount());
        assertEquals(-1, res3.getScore());
        assertEquals("DOWNVOTE", res3.getUserReaction());

        // Reactor 1 switches from DOWNVOTE to UPVOTE
        CommentResponse res4 = commentService.toggleReaction(comment1.getId(), new CommentReactionRequest("UPVOTE"), reactor1.getEmail());
        assertEquals(1, res4.getUpvotesCount());
        assertEquals(0, res4.getDownvotesCount());
        assertEquals(1, res4.getScore());
        assertEquals("UPVOTE", res4.getUserReaction());
    }

    @Test
    void qualityRanking_SortsCommentsByTopScore() {
        // Give comment2 2 upvotes -> score = 2
        commentService.toggleReaction(comment2.getId(), new CommentReactionRequest("UPVOTE"), reactor1.getEmail());
        commentService.toggleReaction(comment2.getId(), new CommentReactionRequest("UPVOTE"), reactor2.getEmail());

        // Give comment1 1 upvote -> score = 1
        commentService.toggleReaction(comment1.getId(), new CommentReactionRequest("UPVOTE"), reactor1.getEmail());

        List<CommentResponse> topComments = commentService.getCommentsByDecisionId(decision.getId(), "top", reactor1.getEmail());
        assertEquals(2, topComments.size());
        assertEquals(comment2.getId(), topComments.get(0).getId());
        assertEquals(2, topComments.get(0).getScore());
        assertEquals(comment1.getId(), topComments.get(1).getId());
        assertEquals(1, topComments.get(1).getScore());
    }
}
