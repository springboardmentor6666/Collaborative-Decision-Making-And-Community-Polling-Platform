package com.decisionhub.service;

import com.decisionhub.dto.ProfileResponse;
import com.decisionhub.dto.ProfileUpdateRequest;

public interface ProfileService {

    ProfileResponse getCurrentUserProfile();

    ProfileResponse updateCurrentUserProfile(ProfileUpdateRequest profileUpdateRequest);
}
