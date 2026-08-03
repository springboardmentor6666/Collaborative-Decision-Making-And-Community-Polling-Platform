package com.decisionhub.backend.controller;

import com.decisionhub.backend.dto.AuthResponse;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.repository.UserRepository;
import com.decisionhub.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/signup")
    public AuthResponse signup(@RequestBody User user) {

        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());

        if (existingUser.isPresent()) {
            return new AuthResponse(false, "Email already exists");
        }

        user.setUsername(user.getName());

        String hashed = passwordEncoder.encode(user.getPassword());
        user.setPasswordHash(hashed);
        user.setPassword(null); // do not store plain text going forward

        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("USER");
        }

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        return new AuthResponse(true, "Account created successfully", token, user.getRole());
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody User loginUser) {

        Optional<User> userOpt = userRepository.findByEmail(loginUser.getEmail());

        if (userOpt.isEmpty()) {
            return new AuthResponse(false, "User not found");
        }

        User user = userOpt.get();

        boolean matches = user.getPasswordHash() != null
                && passwordEncoder.matches(loginUser.getPassword(), user.getPasswordHash());

        if (!matches) {
            return new AuthResponse(false, "Invalid password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        return new AuthResponse(true, "Login successful", token, user.getRole());
    }
}
