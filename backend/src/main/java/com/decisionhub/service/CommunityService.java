package com.decisionhub.service;

import com.decisionhub.dto.*;
import com.decisionhub.entity.Category;
import com.decisionhub.entity.Community;
import com.decisionhub.entity.CommunityMember;
import com.decisionhub.entity.CommunityInvite;
import com.decisionhub.entity.User;
import com.decisionhub.exception.CommunityNotFoundException;
import com.decisionhub.repository.CategoryRepository;
import com.decisionhub.repository.CommunityMemberRepository;
import com.decisionhub.repository.CommunityRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.repository.CommunityInviteRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.decisionhub.event.ActivityEvent;
import org.springframework.context.ApplicationEventPublisher;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CommunityService {

    private final CommunityRepository communityRepository;
    private final CommunityMemberRepository communityMemberRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final DecisionRepository decisionRepository;
    private final UserService userService;
    private final CommunityInviteRepository communityInviteRepository;
    private final ApplicationEventPublisher eventPublisher;

    public CommunityService(CommunityRepository communityRepository,
                            CommunityMemberRepository communityMemberRepository,
                            UserRepository userRepository,
                            CategoryRepository categoryRepository,
                            DecisionRepository decisionRepository,
                            UserService userService,
                            CommunityInviteRepository communityInviteRepository,
                            ApplicationEventPublisher eventPublisher) {
        this.communityRepository = communityRepository;
        this.communityMemberRepository = communityMemberRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.decisionRepository = decisionRepository;
        this.userService = userService;
        this.communityInviteRepository = communityInviteRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public CommunityResponse createCommunity(CommunityRequest request, String userEmail) {
        User creator = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));

        if (communityRepository.existsByName(request.getName().trim())) {
            throw new IllegalArgumentException("Community with name '" + request.getName().trim() + "' already exists");
        }

        String visibility = request.getVisibility() != null ? request.getVisibility().toUpperCase().trim() : "PUBLIC";
        if (!"PUBLIC".equals(visibility) && !"PRIVATE".equals(visibility)) {
            throw new IllegalArgumentException("Invalid visibility mode. Must be PUBLIC or PRIVATE");
        }

        Community community = new Community();
        community.setName(request.getName().trim());
        community.setDescription(request.getDescription());
        community.setVisibility(visibility);
        community.setCreatedBy(creator);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId()).orElse(null);
            community.setCategory(category);
        }

        Community savedCommunity = communityRepository.save(community);

        // Creator automatically becomes OWNER
        CommunityMember ownerMember = new CommunityMember();
        ownerMember.setCommunity(savedCommunity);
        ownerMember.setUser(creator);
        ownerMember.setRole("OWNER");
        communityMemberRepository.save(ownerMember);

        if (eventPublisher != null) {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("communityId", savedCommunity.getId());
            metadata.put("name", savedCommunity.getName());

            eventPublisher.publishEvent(new ActivityEvent(
                    creator.getId(),
                    "COMMUNITY_CREATED",
                    "COMMUNITY",
                    savedCommunity.getId(),
                    savedCommunity.getId(),
                    "Created community: " + savedCommunity.getName(),
                    metadata,
                    savedCommunity.getVisibility()
            ));
        }

        return mapToCommunityResponse(savedCommunity, userEmail);
    }

    @Transactional(readOnly = true)
    public List<CommunityResponse> getAllCommunities(String search, String userEmail) {
        List<Community> communities;
        if (search != null && !search.trim().isEmpty()) {
            if (userEmail != null && !userEmail.isBlank()) {
                communities = communityRepository.searchCommunitiesForUser(search.trim(), userEmail);
            } else {
                communities = communityRepository.findByVisibilityAndNameContainingIgnoreCase("PUBLIC", search.trim());
            }
        } else {
            if (userEmail != null && !userEmail.isBlank()) {
                communities = communityRepository.findAllVisibleToUser(userEmail);
            } else {
                communities = communityRepository.findByVisibility("PUBLIC");
            }
        }

        return communities.stream()
                .map(c -> mapToCommunityResponse(c, userEmail))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CommunityResponse getCommunityById(Long id, String userEmail) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new CommunityNotFoundException("Community not found with id: " + id));

        if ("PRIVATE".equalsIgnoreCase(community.getVisibility())) {
            if (userEmail == null || userEmail.isBlank()) {
                throw new AccessDeniedException("Access denied to private community");
            }
            User user = userRepository.findByEmail(userEmail).orElse(null);
            if (user == null || !communityMemberRepository.existsByCommunityIdAndUserId(id, user.getId())) {
                throw new AccessDeniedException("Access denied to private community");
            }
        }

        return mapToCommunityResponse(community, userEmail);
    }

    @Transactional
    public CommunityResponse updateCommunity(Long id, CommunityRequest request, String userEmail) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new CommunityNotFoundException("Community not found with id: " + id));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));

        CommunityMember member = communityMemberRepository.findByCommunityIdAndUserId(id, user.getId())
                .orElseThrow(() -> new AccessDeniedException("Only community owners and admins can update community details"));

        if (!"OWNER".equals(member.getRole()) && !"ADMIN".equals(member.getRole())) {
            throw new AccessDeniedException("Only community owners and admins can update community details");
        }

        if (request.getName() != null && !request.getName().trim().equalsIgnoreCase(community.getName())) {
            if (communityRepository.existsByName(request.getName().trim())) {
                throw new IllegalArgumentException("Community with name '" + request.getName().trim() + "' already exists");
            }
            community.setName(request.getName().trim());
        }

        if (request.getDescription() != null) {
            community.setDescription(request.getDescription());
        }

        if (request.getVisibility() != null) {
            String visibility = request.getVisibility().toUpperCase().trim();
            if (!"PUBLIC".equals(visibility) && !"PRIVATE".equals(visibility)) {
                throw new IllegalArgumentException("Invalid visibility mode. Must be PUBLIC or PRIVATE");
            }
            community.setVisibility(visibility);
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId()).orElse(null);
            community.setCategory(category);
        }

        Community updatedCommunity = communityRepository.save(community);
        return mapToCommunityResponse(updatedCommunity, userEmail);
    }

    @Transactional
    public void deleteCommunity(Long id, String userEmail) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new CommunityNotFoundException("Community not found with id: " + id));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));

        boolean isPlatformAdmin = "ADMIN".equalsIgnoreCase(user.getRole());
        CommunityMember member = communityMemberRepository.findByCommunityIdAndUserId(id, user.getId()).orElse(null);

        if (!isPlatformAdmin && (member == null || !"OWNER".equals(member.getRole()))) {
            throw new AccessDeniedException("Only the community owner can delete the community");
        }

        communityRepository.delete(community);
    }

    @Transactional
    public CommunityResponse joinCommunity(Long id, String userEmail) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new CommunityNotFoundException("Community not found with id: " + id));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));

        if ("PRIVATE".equalsIgnoreCase(community.getVisibility())) {
            throw new AccessDeniedException("Cannot join private community directly");
        }

        if (communityMemberRepository.existsByCommunityIdAndUserId(id, user.getId())) {
            throw new IllegalArgumentException("User is already a member of this community");
        }

        CommunityMember member = new CommunityMember();
        member.setCommunity(community);
        member.setUser(user);
        member.setRole("MEMBER");
        communityMemberRepository.save(member);

        if (eventPublisher != null) {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("communityId", community.getId());
            metadata.put("name", community.getName());

            eventPublisher.publishEvent(new ActivityEvent(
                    user.getId(),
                    "COMMUNITY_JOINED",
                    "COMMUNITY",
                    community.getId(),
                    community.getId(),
                    "Joined community: " + community.getName(),
                    metadata,
                    community.getVisibility()
            ));
        }

        return mapToCommunityResponse(community, userEmail);
    }

    @Transactional
    public void leaveCommunity(Long id, String userEmail) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new CommunityNotFoundException("Community not found with id: " + id));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));

        CommunityMember member = communityMemberRepository.findByCommunityIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("User is not a member of this community"));

        if ("OWNER".equals(member.getRole())) {
            long totalMembers = communityMemberRepository.countByCommunityId(id);
            long ownerCount = communityMemberRepository.countByCommunityIdAndRole(id, "OWNER");

            if (ownerCount <= 1 && totalMembers > 1) {
                throw new IllegalArgumentException("Owner cannot leave the community without transferring ownership first");
            }

            if (totalMembers <= 1) {
                communityRepository.delete(community);
                return;
            }
        }

        communityMemberRepository.delete(member);
    }

    @Transactional(readOnly = true)
    public List<CommunityMemberResponse> getCommunityMembers(Long id, String userEmail) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new CommunityNotFoundException("Community not found with id: " + id));

        if ("PRIVATE".equalsIgnoreCase(community.getVisibility())) {
            if (userEmail == null || userEmail.isBlank()) {
                throw new AccessDeniedException("Access denied to private community member list");
            }
            User user = userRepository.findByEmail(userEmail).orElse(null);
            if (user == null || !communityMemberRepository.existsByCommunityIdAndUserId(id, user.getId())) {
                throw new AccessDeniedException("Access denied to private community member list");
            }
        }

        List<CommunityMember> members = communityMemberRepository.findByCommunityId(id);
        return members.stream()
                .map(m -> new CommunityMemberResponse(
                        m.getId(),
                        community.getId(),
                        userService.mapToUserResponse(m.getUser()),
                        m.getRole(),
                        m.getJoinedAt()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public CommunityMemberResponse updateMemberRole(Long communityId, Long targetUserId, UpdateMemberRoleRequest request, String requesterEmail) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new CommunityNotFoundException("Community not found with id: " + communityId));

        if (requesterEmail == null || requesterEmail.isBlank()) {
            throw new AccessDeniedException("Authentication required");
        }

        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + requesterEmail));

        boolean isCreator = community.getCreatedBy() != null && community.getCreatedBy().getId().equals(requester.getId());
        CommunityMember requesterMember = communityMemberRepository.findByCommunityIdAndUserId(communityId, requester.getId())
                .orElse(null);

        boolean isOwner = isCreator || (requesterMember != null && "OWNER".equalsIgnoreCase(requesterMember.getRole()));
        boolean isAdmin = requesterMember != null && "ADMIN".equalsIgnoreCase(requesterMember.getRole());

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("Only community owners and admins can manage member roles");
        }

        CommunityMember targetMember = communityMemberRepository.findByCommunityIdAndUserId(communityId, targetUserId)
                .or(() -> communityMemberRepository.findById(targetUserId))
                .orElseThrow(() -> new IllegalArgumentException("Target user is not a member of this community"));

        if ("OWNER".equalsIgnoreCase(targetMember.getRole()) || 
            (community.getCreatedBy() != null && community.getCreatedBy().getId().equals(targetMember.getUser().getId()))) {
            throw new IllegalArgumentException("Cannot alter owner role directly. Use transfer ownership endpoint.");
        }

        String newRole = request.getRole() != null ? request.getRole().toUpperCase().trim() : "";
        if (!"ADMIN".equalsIgnoreCase(newRole) && !"MEMBER".equalsIgnoreCase(newRole) && !"MODERATOR".equalsIgnoreCase(newRole)) {
            throw new IllegalArgumentException("Invalid role. Role must be ADMIN, MODERATOR, or MEMBER");
        }

        if (!isOwner && isAdmin) {
            if ("ADMIN".equalsIgnoreCase(targetMember.getRole())) {
                throw new AccessDeniedException("Admins cannot modify role of another admin");
            }
            if ("ADMIN".equalsIgnoreCase(newRole)) {
                throw new AccessDeniedException("Only community owners can promote members to ADMIN");
            }
        }

        targetMember.setRole(newRole.toUpperCase());
        CommunityMember updated = communityMemberRepository.save(targetMember);

        return new CommunityMemberResponse(
                updated.getId(),
                communityId,
                userService.mapToUserResponse(updated.getUser()),
                updated.getRole(),
                updated.getJoinedAt()
        );
    }

    @Transactional
    public void removeMember(Long communityId, Long targetUserId, String requesterEmail) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new CommunityNotFoundException("Community not found with id: " + communityId));

        if (requesterEmail == null || requesterEmail.isBlank()) {
            throw new AccessDeniedException("Authentication required");
        }

        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + requesterEmail));

        boolean isCreator = community.getCreatedBy() != null && community.getCreatedBy().getId().equals(requester.getId());
        CommunityMember requesterMember = communityMemberRepository.findByCommunityIdAndUserId(communityId, requester.getId())
                .orElse(null);

        boolean isOwner = isCreator || (requesterMember != null && "OWNER".equalsIgnoreCase(requesterMember.getRole()));
        boolean isAdmin = requesterMember != null && "ADMIN".equalsIgnoreCase(requesterMember.getRole());

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("Only community owners and admins can remove members");
        }

        CommunityMember targetMember = communityMemberRepository.findByCommunityIdAndUserId(communityId, targetUserId)
                .or(() -> communityMemberRepository.findById(targetUserId))
                .orElseThrow(() -> new IllegalArgumentException("Target user is not a member of this community"));

        if ("OWNER".equalsIgnoreCase(targetMember.getRole()) ||
            (community.getCreatedBy() != null && community.getCreatedBy().getId().equals(targetMember.getUser().getId()))) {
            throw new IllegalArgumentException("Cannot remove the community owner");
        }

        if (!isOwner && isAdmin && "ADMIN".equalsIgnoreCase(targetMember.getRole())) {
            throw new AccessDeniedException("Admins cannot remove other admins");
        }

        communityMemberRepository.delete(targetMember);
    }

    @Transactional
    public CommunityResponse transferOwnership(Long communityId, TransferOwnershipRequest request, String requesterEmail) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new CommunityNotFoundException("Community not found with id: " + communityId));

        if (requesterEmail == null || requesterEmail.isBlank()) {
            throw new AccessDeniedException("Authentication required");
        }

        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + requesterEmail));

        boolean isCreator = community.getCreatedBy() != null && community.getCreatedBy().getId().equals(requester.getId());
        CommunityMember requesterMember = communityMemberRepository.findByCommunityIdAndUserId(communityId, requester.getId())
                .orElse(null);

        boolean isOwner = isCreator || (requesterMember != null && "OWNER".equalsIgnoreCase(requesterMember.getRole()));
        if (!isOwner) {
            throw new AccessDeniedException("Only the community owner can transfer ownership");
        }

        Long targetUserId = request.getNewOwnerUserId();
        CommunityMember targetMember = communityMemberRepository.findByCommunityIdAndUserId(communityId, targetUserId)
                .or(() -> communityMemberRepository.findById(targetUserId))
                .orElseThrow(() -> new IllegalArgumentException("Target user is not a member of this community"));

        if ("OWNER".equalsIgnoreCase(targetMember.getRole())) {
            throw new IllegalArgumentException("Target user is already the owner");
        }

        // Demote previous owner to ADMIN
        if (requesterMember != null) {
            requesterMember.setRole("ADMIN");
            communityMemberRepository.save(requesterMember);
        }

        // Promote new owner to OWNER
        targetMember.setRole("OWNER");
        communityMemberRepository.save(targetMember);

        community.setCreatedBy(targetMember.getUser());
        Community updated = communityRepository.save(community);

        return mapToCommunityResponse(updated, requesterEmail);
    }

    public CommunityResponse mapToCommunityResponse(Community community, String userEmail) {
        long memberCount = communityMemberRepository.countByCommunityId(community.getId());
        long decisionCount = decisionRepository.countByCommunityIdAndIsDeletedFalse(community.getId());

        boolean isMember = false;
        String currentUserRole = null;

        if (userEmail != null && !userEmail.isBlank()) {
            User user = userRepository.findByEmail(userEmail).orElse(null);
            if (user != null) {
                boolean isCreator = community.getCreatedBy() != null && community.getCreatedBy().getId().equals(user.getId());
                Optional<CommunityMember> memberOpt = communityMemberRepository.findByCommunityIdAndUserId(community.getId(), user.getId());
                if (memberOpt.isPresent()) {
                    isMember = true;
                    currentUserRole = memberOpt.get().getRole();
                    if (isCreator && (currentUserRole == null || !"ADMIN".equalsIgnoreCase(currentUserRole))) {
                        currentUserRole = "OWNER";
                    }
                } else if (isCreator) {
                    isMember = true;
                    currentUserRole = "OWNER";
                }
            }
        }

        UserResponse creatorResponse = community.getCreatedBy() != null
                ? userService.mapToUserResponse(community.getCreatedBy())
                : null;

        return new CommunityResponse(
                community.getId(),
                community.getName(),
                community.getDescription(),
                community.getVisibility(),
                community.getCategory() != null ? community.getCategory().getId() : null,
                community.getCategory() != null ? community.getCategory().getName() : null,
                creatorResponse,
                community.getCreatedAt(),
                memberCount,
                isMember,
                currentUserRole,
                decisionCount
        );
    }

    @Transactional
    public CommunityInviteResponse inviteUserToCommunity(Long communityId, CommunityInviteRequest request, String requesterEmail) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new CommunityNotFoundException("Community not found with id: " + communityId));

        if (requesterEmail == null || requesterEmail.isBlank()) {
            throw new AccessDeniedException("Authentication required");
        }

        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + requesterEmail));

        // Check if requester is OWNER or ADMIN
        CommunityMember requesterMember = communityMemberRepository.findByCommunityIdAndUserId(communityId, requester.getId())
                .orElseThrow(() -> new AccessDeniedException("Only community owners and admins can invite users"));

        if (!"OWNER".equalsIgnoreCase(requesterMember.getRole()) && !"ADMIN".equalsIgnoreCase(requesterMember.getRole())) {
            throw new AccessDeniedException("Only community owners and admins can invite users");
        }

        // Find invitee by email
        User invitee = userRepository.findByEmail(request.getInviteeEmail().trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + request.getInviteeEmail()));

        // Check if invitee is already a member
        if (communityMemberRepository.existsByCommunityIdAndUserId(communityId, invitee.getId())) {
            throw new IllegalArgumentException("User is already a member of this community");
        }

        // Check if there is already an active pending invite
        if (communityInviteRepository.existsByCommunityIdAndInviteeIdAndStatus(communityId, invitee.getId(), "PENDING")) {
            throw new IllegalArgumentException("A pending invite already exists for this user");
        }

        CommunityInvite invite = new CommunityInvite();
        invite.setCommunity(community);
        invite.setInvitee(invitee);
        invite.setInviter(requester);
        invite.setStatus("PENDING");

        CommunityInvite saved = communityInviteRepository.save(invite);
        return mapToCommunityInviteResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<CommunityInviteResponse> getPendingInvites(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));

        return communityInviteRepository.findByInviteeIdAndStatus(user.getId(), "PENDING").stream()
                .map(this::mapToCommunityInviteResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommunityResponse respondToInvite(Long inviteId, InviteResponseRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));

        CommunityInvite invite = communityInviteRepository.findById(inviteId)
                .orElseThrow(() -> new IllegalArgumentException("Invite not found with id: " + inviteId));

        if (!invite.getInvitee().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not authorized to respond to this invite");
        }

        if (!"PENDING".equalsIgnoreCase(invite.getStatus())) {
            throw new IllegalArgumentException("Invite has already been resolved");
        }

        String response = request.getResponse().toUpperCase().trim();
        if ("ACCEPT".equalsIgnoreCase(response)) {
            invite.setStatus("ACCEPTED");
            communityInviteRepository.save(invite);

            // Add user as MEMBER
            if (!communityMemberRepository.existsByCommunityIdAndUserId(invite.getCommunity().getId(), user.getId())) {
                CommunityMember member = new CommunityMember();
                member.setCommunity(invite.getCommunity());
                member.setUser(user);
                member.setRole("MEMBER");
                communityMemberRepository.save(member);
            }
        } else {
            invite.setStatus("REJECTED");
            communityInviteRepository.save(invite);
        }

        return mapToCommunityResponse(invite.getCommunity(), userEmail);
    }

    public CommunityInviteResponse mapToCommunityInviteResponse(CommunityInvite invite) {
        return new CommunityInviteResponse(
                invite.getId(),
                invite.getCommunity().getId(),
                invite.getCommunity().getName(),
                userService.mapToUserResponse(invite.getInvitee()),
                userService.mapToUserResponse(invite.getInviter()),
                invite.getStatus(),
                invite.getCreatedAt()
        );
    }
}
