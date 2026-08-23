package com.decisionhub.backend.service;

import com.decisionhub.backend.dto.CommunityRequest;
import com.decisionhub.backend.dto.CommunityResponse;
import com.decisionhub.backend.entity.Community;
import com.decisionhub.backend.entity.CommunityMember;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.exception.CustomException;
import com.decisionhub.backend.repository.CommunityMemberRepository;
import com.decisionhub.backend.repository.CommunityRepository;
import com.decisionhub.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommunityService {

    @Autowired private CommunityRepository communityRepository;
    @Autowired private CommunityMemberRepository communityMemberRepository;
    @Autowired private UserRepository userRepository;

    @Transactional
    public CommunityResponse createCommunity(CommunityRequest req, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        Community community = new Community(req.getCommunityName(), req.getDescription(), req.getCategory(), user);
        community.setMemberCount(1); // Moderator is the first member
        Community saved = communityRepository.save(community);

        // Add moderator as member
        CommunityMember member = new CommunityMember(saved, user, "MODERATOR");
        communityMemberRepository.save(member);

        return toResponse(saved, user.getId());
    }

    public List<CommunityResponse> getAllCommunities(String userEmail) {
        Long userId = getUserIdByEmail(userEmail);
        return communityRepository.findAll().stream()
                .map(c -> toResponse(c, userId))
                .collect(Collectors.toList());
    }

    public List<CommunityResponse> getCommunitiesByCategory(String category, String userEmail) {
        Long userId = getUserIdByEmail(userEmail);
        return communityRepository.findByCategory(category).stream()
                .map(c -> toResponse(c, userId))
                .collect(Collectors.toList());
    }

    public CommunityResponse getCommunityById(Long communityId, String userEmail) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new CustomException("Community not found", HttpStatus.NOT_FOUND));
        Long userId = getUserIdByEmail(userEmail);
        return toResponse(community, userId);
    }

    @Transactional
    public void joinCommunity(Long communityId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new CustomException("Community not found", HttpStatus.NOT_FOUND));

        if (communityMemberRepository.existsByCommunityIdAndUserId(communityId, user.getId())) {
            throw new CustomException("You are already a member of this community", HttpStatus.BAD_REQUEST);
        }

        CommunityMember member = new CommunityMember(community, user, "MEMBER");
        communityMemberRepository.save(member);

        community.setMemberCount(community.getMemberCount() + 1);
        communityRepository.save(community);
    }

    @Transactional
    public void leaveCommunity(Long communityId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new CustomException("Community not found", HttpStatus.NOT_FOUND));

        List<CommunityMember> members = communityMemberRepository.findByCommunityId(communityId);
        CommunityMember userMember = members.stream()
                .filter(m -> m.getUser().getId().equals(user.getId()))
                .findFirst()
                .orElseThrow(() -> new CustomException("You are not a member of this community", HttpStatus.BAD_REQUEST));

        if ("MODERATOR".equals(userMember.getMemberRole())) {
            throw new CustomException("Moderators cannot leave the community. Delete the community instead.", HttpStatus.BAD_REQUEST);
        }

        communityMemberRepository.delete(userMember);

        community.setMemberCount(Math.max(0, community.getMemberCount() - 1));
        communityRepository.save(community);
    }

    @Transactional
    public void deleteCommunity(Long communityId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new CustomException("Community not found", HttpStatus.NOT_FOUND));

        if (!community.getModerator().getId().equals(user.getId())) {
            throw new CustomException("Only the moderator can delete this community", HttpStatus.FORBIDDEN);
        }

        communityRepository.delete(community);
    }

    private Long getUserIdByEmail(String email) {
        if (email == null) return null;
        return userRepository.findByEmail(email).map(User::getId).orElse(null);
    }

    private CommunityResponse toResponse(Community c, Long currentUserId) {
        CommunityResponse r = new CommunityResponse();
        r.setId(c.getId());
        r.setCommunityName(c.getCommunityName());
        r.setDescription(c.getDescription());
        r.setCategory(c.getCategory());
        r.setMemberCount(c.getMemberCount());
        r.setModeratorId(c.getModerator().getId());
        r.setModeratorName(c.getModerator().getFullName());
        r.setCreatedAt(c.getCreatedAt());
        
        if (currentUserId != null) {
            r.setMember(communityMemberRepository.existsByCommunityIdAndUserId(c.getId(), currentUserId));
        } else {
            r.setMember(false);
        }
        
        return r;
    }
}
