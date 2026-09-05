package com.decisionhub.dto;

public class UserSummaryDto {

    private Long id;
    private String email;
    private String fullName;
    private String profileImage;

    public UserSummaryDto() {
    }

    public UserSummaryDto(Long id, String email, String fullName, String profileImage) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.profileImage = profileImage;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }
}
