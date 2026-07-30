package com.decisionhub.service;

import com.decisionhub.dto.ForgotPasswordRequest;
import com.decisionhub.dto.ResetPasswordRequest;

public interface PasswordResetService {

    void initiatePasswordReset(ForgotPasswordRequest forgotPasswordRequest);

    void resetPassword(ResetPasswordRequest resetPasswordRequest);
}
