package com.decisionhub.service;

import com.decisionhub.dto.JwtAuthResponse;
import com.decisionhub.dto.LoginRequest;
import com.decisionhub.dto.UserRequest;

public interface AuthService {

    JwtAuthResponse login(LoginRequest loginRequest);

    JwtAuthResponse register(UserRequest userRequest);
}