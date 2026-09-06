package com.decisionhub.dto;

public class GoogleUserInfo {

    private final String providerId;
    private final String email;
    private final String fullName;
    private final String profileImage;
    private final boolean emailVerified;

    public GoogleUserInfo(String providerId, String email, String fullName, String profileImage, boolean emailVerified) {
        this.providerId = providerId;
        this.email = email;
        this.fullName = fullName;
        this.profileImage = profileImage;
        this.emailVerified = emailVerified;
    }

    public String getProviderId() {
        return providerId;
    }

    public String getEmail() {
        return email;
    }

    public String getFullName() {
        return fullName;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }
}
