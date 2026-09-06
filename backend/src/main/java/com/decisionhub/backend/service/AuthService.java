package com.decisionhub.backend.service;

import com.decisionhub.backend.dto.AuthResponse;
import com.decisionhub.backend.dto.LoginRequest;
import com.decisionhub.backend.dto.RegisterRequest;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.exception.CustomException;
import com.decisionhub.backend.config.JwtUtils;
import com.decisionhub.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Transactional
    public void registerUser(RegisterRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            throw new CustomException("Error: Username is already taken!", HttpStatus.BAD_REQUEST);
        }
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new CustomException("Error: Email is already in use!", HttpStatus.BAD_REQUEST);
        }

        // Create new user's account using standard constructor
        User user = new User(
                signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()),
                signUpRequest.getFullName()
        );

        String strRole = signUpRequest.getRole();
        String role = "USER";
        
        if (strRole != null) {
            switch (strRole.toLowerCase()) {
                case "admin":
                case "administrator":
                    role = "ADMIN";
                    break;
                case "mod":
                case "moderator":
                case "community moderator":
                    role = "MODERATOR";
                    break;
                default:
                    role = "USER";
            }
        }

        user.setRole(role);
        userRepository.save(user);
    }

    public AuthResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return new AuthResponse(
                jwt,
                userDetails.getId(),
                userDetails.getFullName(),
                userDetails.getUsername(),
                roles
        );
    }

    @Transactional
    public void resetPassword(com.decisionhub.backend.dto.ResetPasswordRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new CustomException("No user found with email: " + req.getEmail(), HttpStatus.NOT_FOUND));
        user.setPasswordHash(encoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public AuthResponse googleLogin(com.decisionhub.backend.dto.GoogleLoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail()).orElse(null);
        if (user == null) {
            String uname = req.getEmail().split("@")[0] + "_" + (int)(Math.random()*1000);
            user = new User(
                    uname,
                    req.getEmail(),
                    encoder.encode(java.util.UUID.randomUUID().toString()),
                    req.getName() != null ? req.getName() : uname
            );
            user.setRole("USER");
            user = userRepository.save(user);
        }

        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return new AuthResponse(
                jwt,
                user.getId(),
                user.getFullName(),
                user.getUsername(),
                roles
        );
    }
}
