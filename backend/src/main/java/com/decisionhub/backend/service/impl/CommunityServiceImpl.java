package com.decisionhub.backend.service.impl;

import com.decisionhub.backend.dto.CommunityRequest;
import com.decisionhub.backend.dto.CommunityResponse;
import com.decisionhub.backend.entity.Community;
import com.decisionhub.backend.repository.CommunityRepository;
import com.decisionhub.backend.service.CommunityService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommunityServiceImpl implements CommunityService {

    private final CommunityRepository repository;

    public CommunityServiceImpl(CommunityRepository repository) {
        this.repository = repository;
    }

    @Override
    public CommunityResponse createCommunity(CommunityRequest request) {

        Community community = Community.builder()
                .communityName(request.getCommunityName())
                .description(request.getDescription())
                .build();

        Community saved = repository.save(community);

        return CommunityResponse.builder()
                .id(saved.getId())
                .communityName(saved.getCommunityName())
                .description(saved.getDescription())
                .build();
    }

    @Override
    public List<CommunityResponse> getAllCommunities() {

        return repository.findAll()
                .stream()
                .map(c -> CommunityResponse.builder()
                        .id(c.getId())
                        .communityName(c.getCommunityName())
                        .description(c.getDescription())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public void deleteCommunity(Long id) {

        repository.deleteById(id);

    }
}