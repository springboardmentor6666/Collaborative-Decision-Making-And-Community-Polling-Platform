package com.decisionhub.service;

import com.decisionhub.dto.UserProfileUpdateRequest;
import com.decisionhub.dto.UserResponse;
import com.decisionhub.entity.User;
import com.decisionhub.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class UserProfileServiceTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    private User testUser;
    private User otherUser;
    private User admin;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        testUser = new User();
        testUser.setEmail("user@example.com");
        testUser.setPasswordHash("pass");
        testUser.setFullName("Normal User");
        testUser.setRole("USER");
        testUser.setIsPublic(true);
        userRepository.save(testUser);

        otherUser = new User();
        otherUser.setEmail("other@example.com");
        otherUser.setPasswordHash("pass");
        otherUser.setFullName("Other User");
        otherUser.setRole("USER");
        userRepository.save(otherUser);

        admin = new User();
        admin.setEmail("admin@example.com");
        admin.setPasswordHash("pass");
        admin.setFullName("Admin User");
        admin.setRole("ADMIN");
        userRepository.save(admin);
    }

    @Test
    void updateProfile_Self_Success() {
        UserProfileUpdateRequest request = new UserProfileUpdateRequest("New Name", "New Bio", "http://avatar.com/1");
        UserResponse response = userService.updateUserProfile(testUser.getId(), request, testUser.getEmail());

        assertNotNull(response);
        assertEquals("New Name", response.getFullName());
        assertEquals("New Bio", response.getBio());
        assertEquals("http://avatar.com/1", response.getAvatar());
    }

    @Test
    void updateProfile_OtherUser_ThrowsAccessDenied() {
        UserProfileUpdateRequest request = new UserProfileUpdateRequest("Hacked Name", null, null);
        assertThrows(AccessDeniedException.class, () ->
                userService.updateUserProfile(testUser.getId(), request, otherUser.getEmail()));
    }

    @Test
    void deleteUser_Self_Success() {
        userService.deleteUser(testUser.getId(), testUser.getEmail());
        assertFalse(userRepository.existsById(testUser.getId()));
    }

    @Test
    void deleteUser_ByAdmin_Success() {
        userService.deleteUser(testUser.getId(), admin.getEmail());
        assertFalse(userRepository.existsById(testUser.getId()));
    }

    @Test
    void toggleProfileVisibility_Success() {
        boolean nextVal = userService.toggleProfileVisibility(testUser.getEmail());
        assertFalse(nextVal);

        User updated = userRepository.findById(testUser.getId()).orElse(null);
        assertNotNull(updated);
        assertFalse(updated.getIsPublic());
    }
}
