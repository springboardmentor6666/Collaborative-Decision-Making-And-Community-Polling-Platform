package com.decisionhub.service;

import com.decisionhub.dto.request.VotingCategoryRequest;
import com.decisionhub.dto.response.VotingCategoryResponse;

import java.util.List;

public interface VotingCategoryService {
    VotingCategoryResponse createCategory(Long eventId, Long userId, VotingCategoryRequest request);
    VotingCategoryResponse updateCategory(Long categoryId, Long userId, VotingCategoryRequest request);
    List<VotingCategoryResponse> getCategoriesForEvent(Long eventId);
    void deleteCategory(Long categoryId, Long userId);
}
