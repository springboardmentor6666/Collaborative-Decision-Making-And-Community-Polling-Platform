package com.decisionhub.backend.dto;

public class UserProfileDTO {

    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String role;
    private String interests;
    private String profilePicture;
    private long createdDecisionsCount;
    private long totalVotesCast;

    public UserProfileDTO() {
    }

    public UserProfileDTO(Long id, String username, String email, String fullName, String role, String interests, String profilePicture, long createdDecisionsCount, long totalVotesCast) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.interests = interests;
        this.profilePicture = profilePicture;
        this.createdDecisionsCount = createdDecisionsCount;
        this.totalVotesCast = totalVotesCast;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getInterests() {
        return interests;
    }

    public void setInterests(String interests) {
        this.interests = interests;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }

    public long getCreatedDecisionsCount() {
        return createdDecisionsCount;
    }

    public void setCreatedDecisionsCount(long createdDecisionsCount) {
        this.createdDecisionsCount = createdDecisionsCount;
    }

    public long getTotalVotesCast() {
        return totalVotesCast;
    }

    public void setTotalVotesCast(long totalVotesCast) {
        this.totalVotesCast = totalVotesCast;
    }
}
