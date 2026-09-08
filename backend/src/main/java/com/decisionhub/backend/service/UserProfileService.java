package com.decisionhub.backend.service;

import com.decisionhub.backend.dto.*;
import java.util.List;
import java.util.Map;

public interface UserProfileService {

    ProfileResponse get();

    ProfileResponse update(
            ProfileUpdateRequest request
    );

    void changePassword(
            ChangePasswordRequest request
    );

    void deleteAccount(
            DeleteAccountRequest request
    );

    List<Map<String, Object>> getActivity();
}