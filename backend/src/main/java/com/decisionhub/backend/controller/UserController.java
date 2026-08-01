package com.decisionhub.backend.controller;

import com.decisionhub.backend.dto.AuthResponse;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/signup")
    public AuthResponse signup(@RequestBody User user) {

        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());

        if (existingUser.isPresent()) {
            return new AuthResponse(false, "Email already exists");
        }

        userRepository.save(user);

        return new AuthResponse(true, "Account created successfully");
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody User loginUser) {

        Optional<User> user = userRepository.findByEmail(loginUser.getEmail());

        if (user.isEmpty()) {
            return new AuthResponse(false, "User not found");
        }

        if (!user.get().getPassword().equals(loginUser.getPassword())) {
            return new AuthResponse(false, "Invalid password");
        }

        return new AuthResponse(true, "Login successful");
    }
}