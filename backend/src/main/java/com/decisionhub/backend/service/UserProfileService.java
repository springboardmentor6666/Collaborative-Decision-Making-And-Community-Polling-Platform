package com.decisionhub.backend.service;

import com.decisionhub.backend.dto.*;

public interface UserProfileService {

    ProfileResponse get();

    ProfileResponse update(
            ProfileUpdateRequest request
    );
}