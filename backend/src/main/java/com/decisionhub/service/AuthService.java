package com.decisionhub.service;

import com.decisionhub.dto.request.AuthRequest;
import com.decisionhub.dto.request.ForgotPasswordRequest;
import com.decisionhub.dto.request.RegisterRequest;
import com.decisionhub.dto.request.ResetPasswordRequest;
import com.decisionhub.dto.request.TokenRefreshRequest;
import com.decisionhub.dto.response.AuthResponse;
import com.decisionhub.dto.response.UserResponse;

public interface AuthService {

    UserResponse register(RegisterRequest request);

    AuthResponse login(AuthRequest request);

    AuthResponse refreshToken(TokenRefreshRequest request);

    void logout(String token);

    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);
}
