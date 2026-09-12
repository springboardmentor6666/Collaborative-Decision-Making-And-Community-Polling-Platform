package com.decisionhub.backend.service;

import com.decisionhub.backend.dto.CommunityDTO;
import com.decisionhub.backend.entity.Community;
import com.decisionhub.backend.entity.CommunityMember;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.repository.CommunityMemberRepository;
import com.decisionhub.backend.repository.CommunityRepository;
import com.decisionhub.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommunityService {

    @Autowired
    private CommunityRepository communityRepository;

    @Autowired
    private CommunityMemberRepository memberRepository;

    @Autowired
    private UserRepository userRepository;

    public List<CommunityDTO> getAllCommunities() {
        return communityRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CommunityDTO createCommunity(CommunityDTO dto, String username) {
        User creator = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Community community = new Community();
        community.setCommunityName(dto.getName());
        community.setDescription(dto.getDescription());
        community.setCategory(dto.getCategory() != null ? dto.getCategory() : "General");
        community.setModerator(creator);

        Community saved = communityRepository.save(community);

        // Add creator as member
        CommunityMember member = new CommunityMember(saved, creator, "ADMIN");
        memberRepository.save(member);

        return convertToDTO(saved);
    }

    public boolean joinCommunity(Long communityId, String username) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new RuntimeException("Community not found: " + communityId));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        if (memberRepository.existsByCommunityIdAndUserId(communityId, user.getId())) {
            return false;
        }

        CommunityMember member = new CommunityMember(community, user, "MEMBER");
        memberRepository.save(member);

        community.setMemberCount(memberRepository.findByCommunityId(communityId).size());
        communityRepository.save(community);
        return true;
    }

    private CommunityDTO convertToDTO(Community community) {
        long memberCount = memberRepository.findByCommunityId(community.getId()).size();
        return new CommunityDTO(
                community.getId(),
                community.getCommunityName(),
                community.getDescription(),
                community.getCategory(),
                memberCount,
                community.getCreatedAt()
        );
    }
}
