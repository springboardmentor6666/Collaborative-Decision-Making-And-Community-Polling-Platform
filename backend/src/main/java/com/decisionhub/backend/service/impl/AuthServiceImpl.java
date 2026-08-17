package com.decisionhub.backend.service.impl;

import com.decisionhub.backend.dto.AuthResponse;
import com.decisionhub.backend.dto.LoginRequest;
import com.decisionhub.backend.dto.RegisterRequest;
import com.decisionhub.backend.entity.Role;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.repository.UserRepository;
import com.decisionhub.backend.security.JwtService;
import com.decisionhub.backend.service.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    public AuthResponse register(RegisterRequest request) {

        // Check email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Create User Object
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();

        // Save to Database
        userRepository.save(user);

        // Generate JWT
        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponse(
                true,
                token,
                user.getRole().name(),
                "User Registered Successfully"
        );
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid Password");
        }

        // Generate JWT
        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponse(
                true,
                token,
                user.getRole().name(),
                "Login Successful"
        );
    }
}