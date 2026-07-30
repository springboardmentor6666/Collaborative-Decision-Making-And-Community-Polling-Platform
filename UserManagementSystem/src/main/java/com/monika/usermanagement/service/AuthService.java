package com.monika.usermanagement.service;

import com.monika.usermanagement.dto.JwtAuthResponse;
import com.monika.usermanagement.dto.LoginRequest;
import com.monika.usermanagement.dto.UserRequest;

public interface AuthService {

    JwtAuthResponse login(LoginRequest loginRequest);

    JwtAuthResponse register(UserRequest userRequest);

    JwtAuthResponse refreshToken(String refreshToken);
}