package com.monika.usermanagement.service;

import com.monika.usermanagement.dto.ProfileResponse;
import com.monika.usermanagement.dto.ProfileUpdateRequest;

public interface ProfileService {

    ProfileResponse getCurrentUserProfile();

    ProfileResponse updateCurrentUserProfile(ProfileUpdateRequest profileUpdateRequest);
}
