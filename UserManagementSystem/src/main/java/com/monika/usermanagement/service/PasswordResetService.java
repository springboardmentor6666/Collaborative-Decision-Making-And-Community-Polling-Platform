package com.monika.usermanagement.service;

import com.monika.usermanagement.dto.ForgotPasswordRequest;
import com.monika.usermanagement.dto.ResetPasswordRequest;

public interface PasswordResetService {

    void initiatePasswordReset(ForgotPasswordRequest forgotPasswordRequest);

    void resetPassword(ResetPasswordRequest resetPasswordRequest);
}
