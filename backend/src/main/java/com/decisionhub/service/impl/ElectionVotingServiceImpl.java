package com.decisionhub.service.impl;

import com.decisionhub.common.enums.ElectionVisibility;
import com.decisionhub.common.enums.MemberRole;
import com.decisionhub.common.enums.MemberStatus;
import com.decisionhub.common.enums.NominationStatus;
import com.decisionhub.common.enums.VotingEventStatus;
import com.decisionhub.dto.request.ElectionVoteRequest;
import com.decisionhub.dto.response.ElectionResultsResponse;
import com.decisionhub.entity.CommunityMember;
import com.decisionhub.entity.ElectionVote;
import com.decisionhub.entity.Nominee;
import com.decisionhub.entity.User;
import com.decisionhub.entity.VotingCategory;
import com.decisionhub.entity.VotingEvent;
import com.decisionhub.exception.BusinessException;
import com.decisionhub.exception.DuplicateException;
import com.decisionhub.exception.EntityNotFoundException;
import com.decisionhub.exception.ForbiddenException;
import com.decisionhub.repository.CommunityMemberRepository;
import com.decisionhub.repository.ElectionVoteRepository;
import com.decisionhub.repository.NomineeRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.repository.VotingCategoryRepository;
import com.decisionhub.repository.VotingEventRepository;
import com.decisionhub.service.ElectionVotingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class ElectionVotingServiceImpl implements ElectionVotingService {

    private final ElectionVoteRepository electionVoteRepository;
    private final VotingCategoryRepository votingCategoryRepository;
    private final NomineeRepository nomineeRepository;
    private final UserRepository userRepository;
    private final CommunityMemberRepository communityMemberRepository;
    private final VotingEventRepository votingEventRepository;

    @Override
    @Transactional
    public void submitVote(Long categoryId, Long userId, ElectionVoteRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        VotingCategory category = votingCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Voting category not found"));

        VotingEvent event = category.getVotingEvent();

        if (event == null) {
            throw new EntityNotFoundException("Voting event not found");
        }

        boolean isMember = communityMemberRepository.existsByCommunityCommunityIdAndUserUserIdAndStatus(
                event.getCommunity().getCommunityId(), userId, MemberStatus.ACTIVE);
        if (!isMember) {
            throw new ForbiddenException("You must be an active member of this community to vote.");
        }

        if (event.getStatus() != VotingEventStatus.ACTIVE) {
            throw new BusinessException("Voting is not currently active for this election. Current status: " + event.getStatus());
        }

        LocalDateTime now = LocalDateTime.now();
        if (event.getStartDate() != null && now.isBefore(event.getStartDate())) {
            throw new BusinessException("Voting starts on " + event.getStartDate());
        }
        if (event.getEndDate() != null && now.isAfter(event.getEndDate())) {
            throw new BusinessException("Voting has ended.");
        }

        if (request.getNomineeId() == null) {
            throw new BusinessException("Nominee ID is required for SINGLE_CHOICE voting.");
        }

        Nominee nominee = nomineeRepository.findById(request.getNomineeId())
                .orElseThrow(() -> new EntityNotFoundException("Nominee not found"));

        if (!nominee.getVotingCategory().getCategoryId().equals(categoryId)) {
            throw new BusinessException("Nominee does not belong to this category.");
        }

        if (nominee.getNominationStatus() != NominationStatus.APPROVED) {
            throw new BusinessException("You can only vote for approved nominees.");
        }

        if (electionVoteRepository.existsByUserUserIdAndVotingCategoryCategoryId(userId, categoryId)) {
            throw new DuplicateException("You have already voted in this category.");
        }

        ElectionVote vote = ElectionVote.builder()
                .user(user)
                .votingEvent(event)
                .votingCategory(category)
                .nominee(nominee)
                .build();

        electionVoteRepository.save(vote);
    }

    @Override
    @Transactional(readOnly = true)
    public ElectionResultsResponse getResults(Long eventId, Long userId) {
        VotingEvent event = votingEventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Voting Arena not found"));

        CommunityMember member = communityMemberRepository.findByCommunityCommunityIdAndUserUserId(event.getCommunity().getCommunityId(), userId)
                .orElseThrow(() -> new ForbiddenException("Not a member of this community."));
        
        boolean isModerator = member.getMemberRole() == MemberRole.OWNER || member.getMemberRole() == MemberRole.MODERATOR;

        // Visibility logic
        if (!isModerator) {
            if (!event.isResultsPublished()) {
                throw new ForbiddenException("Results will be revealed once the election is closed and published by the owner.");
            }
        }

        long eligibleMembers = communityMemberRepository.countByCommunityCommunityIdAndStatus(event.getCommunity().getCommunityId(), MemberStatus.ACTIVE);
        
        List<VotingCategory> categories = votingCategoryRepository.findByVotingEventEventId(eventId);
        
        List<ElectionResultsResponse.CategoryResultResponse> categoryResults = new ArrayList<>();
        long totalUniqueVotesAcrossCategories = 0; // Simplified total votes calculation

        for (VotingCategory category : categories) {
            List<Object[]> aggregatedVotes = electionVoteRepository.countVotesPerNomineeByCategoryId(category.getCategoryId());
            Map<Long, Long> voteMap = new HashMap<>();
            long categoryTotalVotes = 0;
            
            for (Object[] result : aggregatedVotes) {
                Long nomineeId = (Long) result[0];
                Long count = (Long) result[1];
                voteMap.put(nomineeId, count);
                categoryTotalVotes += count;
            }
            
            totalUniqueVotesAcrossCategories += categoryTotalVotes;
            
            List<Nominee> nominees = nomineeRepository.findByVotingCategoryCategoryId(category.getCategoryId())
                    .stream().filter(n -> n.getNominationStatus() == NominationStatus.APPROVED).collect(Collectors.toList());
            
            List<ElectionResultsResponse.NomineeResultResponse> nomineeResults = new ArrayList<>();
            long maxVotes = -1;
            List<ElectionResultsResponse.NomineeResultResponse> winners = new ArrayList<>();
            
            for (Nominee nominee : nominees) {
                long votes = voteMap.getOrDefault(nominee.getNomineeId(), 0L);
                double percentage = categoryTotalVotes > 0 ? (double) votes / categoryTotalVotes * 100 : 0.0;
                
                ElectionResultsResponse.NomineeResultResponse resultResp = ElectionResultsResponse.NomineeResultResponse.builder()
                        .nomineeId(nominee.getNomineeId())
                        .name(nominee.getName())
                        .votes(votes)
                        .percentage(Math.round(percentage * 100.0) / 100.0)
                        .build();
                        
                nomineeResults.add(resultResp);
                
                if (votes > maxVotes) {
                    maxVotes = votes;
                    winners.clear();
                    winners.add(resultResp);
                } else if (votes == maxVotes && votes > 0) {
                    winners.add(resultResp);
                }
            }
            
            String winnerStatus = "NO_VOTES";
            if (maxVotes > 0) {
                winnerStatus = winners.size() > 1 ? "TIE" : "WINNER";
            }
            
            categoryResults.add(ElectionResultsResponse.CategoryResultResponse.builder()
                    .categoryId(category.getCategoryId())
                    .categoryName(category.getName())
                    .totalVotes(categoryTotalVotes)
                    .winnerStatus(winnerStatus)
                    .winners(winners)
                    .nominees(nomineeResults)
                    .build());
        }
        
        // This is a rough estimation of participation rate based on total votes / categories. A true unique user count would require a COUNT(DISTINCT user_id) query.
        int categoryCount = categories.size() > 0 ? categories.size() : 1;
        long estimatedUniqueVoters = totalUniqueVotesAcrossCategories / categoryCount;
        double participationRate = eligibleMembers > 0 ? (double) estimatedUniqueVoters / eligibleMembers * 100 : 0.0;

        return ElectionResultsResponse.builder()
                .eventId(eventId)
                .title(event.getTitle())
                .totalEligibleMembers(eligibleMembers)
                .totalVotes(totalUniqueVotesAcrossCategories)
                .participationRate(Math.round(participationRate * 100.0) / 100.0)
                .categories(categoryResults)
                .build();
    }
}
