package com.decisionhub.service;

import com.decisionhub.entity.Category;
import com.decisionhub.entity.User;
import com.decisionhub.repository.CategoryRepository;
import com.decisionhub.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class UserInterestsServiceTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private User testUser;
    private Category cat1;
    private Category cat2;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        categoryRepository.deleteAll();
        categoryRepository.flush();

        testUser = new User();
        testUser.setEmail("user@example.com");
        testUser.setPasswordHash("pass");
        testUser.setFullName("User Interests");
        userRepository.save(testUser);

        cat1 = new Category();
        cat1.setName("Career");
        categoryRepository.save(cat1);

        cat2 = new Category();
        cat2.setName("Education");
        categoryRepository.save(cat2);
    }

    @Test
    void updateAndGetInterests_Success() {
        Set<Category> updated = userService.updateUserInterests(List.of(cat1.getId(), cat2.getId()), testUser.getEmail());
        assertEquals(2, updated.size());

        Set<Category> retrieved = userService.getUserInterests(testUser.getEmail());
        assertEquals(2, retrieved.size());
    }
}
