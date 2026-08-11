package com.decisionhub.service;

import com.decisionhub.dto.*;
import com.decisionhub.entity.*;
import com.decisionhub.exception.DecisionNotFoundException;
import com.decisionhub.exception.UserNotFoundException;
import com.decisionhub.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final UserRepository userRepository;
    private final DecisionRepository decisionRepository;
    private final PollRepository pollRepository;
    private final PollOptionRepository pollOptionRepository;
    private final VoteRepository voteRepository;
    private final DecisionImpressionRepository decisionImpressionRepository;

    public AnalyticsService(UserRepository userRepository,
                            DecisionRepository decisionRepository,
                            PollRepository pollRepository,
                            PollOptionRepository pollOptionRepository,
                            VoteRepository voteRepository,
                            DecisionImpressionRepository decisionImpressionRepository) {
        this.userRepository = userRepository;
        this.decisionRepository = decisionRepository;
        this.pollRepository = pollRepository;
        this.pollOptionRepository = pollOptionRepository;
        this.voteRepository = voteRepository;
        this.decisionImpressionRepository = decisionImpressionRepository;
    }

    @Transactional(readOnly = true)
    public List<MyVoteAnalysisDto> getMyVotesAnalysis(String userEmail) {
        User voter = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        List<Vote> userVotes = voteRepository.findByVoterId(voter.getId());
        List<MyVoteAnalysisDto> result = new ArrayList<>();

        for (Vote userVote : userVotes) {
            Poll poll = userVote.getPoll();
            if (poll == null) {
                continue;
            }

            Decision decision = poll.getDecision();
            Long decisionId = decision != null ? decision.getId() : null;
            String decisionTitle = decision != null ? decision.getTitle() : "N/A";
            String status = decision != null ? decision.getStatus() : "OPEN";
            String pollQuestion = decision != null ? decision.getTitle() : "N/A";

            List<Vote> allPollVotes = voteRepository.findByPollId(poll.getId());
            long totalVotes = allPollVotes.size();

            // Count votes per poll option
            Map<Long, Long> voteCountsByPollOptionId = allPollVotes.stream()
                    .collect(Collectors.groupingBy(v -> v.getPollOption().getId(), Collectors.counting()));

            List<PollOption> pollOptions = pollOptionRepository.findByPollId(poll.getId());
            List<OptionBreakdownDto> optionsBreakdown = new ArrayList<>();

            long maxVoteCount = 0;
            PollOption winningPollOption = null;

            for (PollOption po : pollOptions) {
                long count = voteCountsByPollOptionId.getOrDefault(po.getId(), 0L);
                double percentage = totalVotes > 0 ? Math.round(((double) count / totalVotes * 100.0) * 100.0) / 100.0 : 0.0;
                
                Long optionId = po.getOption() != null ? po.getOption().getId() : po.getId();
                String optionText = po.getOption() != null ? po.getOption().getLabel() : "Option #" + po.getId();

                optionsBreakdown.add(new OptionBreakdownDto(optionId, optionText, count, percentage));

                if (count > maxVoteCount) {
                    maxVoteCount = count;
                    winningPollOption = po;
                }
            }

            // User choice
            PollOption userPo = userVote.getPollOption();
            Long userOptionId = userPo != null && userPo.getOption() != null ? userPo.getOption().getId() : (userPo != null ? userPo.getId() : null);
            String userOptionText = userPo != null && userPo.getOption() != null ? userPo.getOption().getLabel() : "N/A";
            UserChoiceDto userChoice = new UserChoiceDto(userOptionId, userOptionText);

            // Winning choice & isWinning calculation
            WinningChoiceDto winningChoice;
            boolean isWinning;

            if (totalVotes == 0 || winningPollOption == null || maxVoteCount == 0) {
                winningChoice = new WinningChoiceDto(null, "No votes yet", 0L);
                isWinning = false;
            } else {
                Long winningOptionId = winningPollOption.getOption() != null ? winningPollOption.getOption().getId() : winningPollOption.getId();
                String winningOptionText = winningPollOption.getOption() != null ? winningPollOption.getOption().getLabel() : "Option #" + winningPollOption.getId();
                winningChoice = new WinningChoiceDto(winningOptionId, winningOptionText, maxVoteCount);

                long userChoiceVoteCount = voteCountsByPollOptionId.getOrDefault(userPo != null ? userPo.getId() : -1L, 0L);
                isWinning = (userChoiceVoteCount == maxVoteCount && maxVoteCount > 0);
            }

            result.add(new MyVoteAnalysisDto(
                    decisionId,
                    decisionTitle,
                    status,
                    pollQuestion,
                    totalVotes,
                    userChoice,
                    winningChoice,
                    isWinning,
                    optionsBreakdown
            ));
        }

        return result;
    }

    @Transactional(readOnly = true)
    public CreatorAnalyticsResponse getCreatorAnalytics(String userEmail) {
        User creator = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        List<Decision> creatorDecisions = decisionRepository.findByOwnerIdAndIsDeletedFalse(creator.getId());
        long totalDecisionsPublished = creatorDecisions.size();

        long totalReach = decisionImpressionRepository.countByDecision_Owner_IdAndType(creator.getId(), "REACH");
        long totalViews = decisionImpressionRepository.countByDecision_Owner_IdAndType(creator.getId(), "VIEW");
        long totalVotes = 0;

        List<CreatorDecisionItemDto> decisionItems = new ArrayList<>();

        for (Decision decision : creatorDecisions) {
            long reach = decisionImpressionRepository.countByDecisionIdAndType(decision.getId(), "REACH");
            long views = decisionImpressionRepository.countByDecisionIdAndType(decision.getId(), "VIEW");

            List<Poll> polls = pollRepository.findByDecisionId(decision.getId());
            long decisionVotesCount = 0;
            List<OptionBreakdownDto> optionsDistribution = new ArrayList<>();

            for (Poll poll : polls) {
                List<Vote> pollVotes = voteRepository.findByPollId(poll.getId());
                long pollVoteCount = pollVotes.size();
                decisionVotesCount += pollVoteCount;

                Map<Long, Long> countsByPollOptionId = pollVotes.stream()
                        .collect(Collectors.groupingBy(v -> v.getPollOption().getId(), Collectors.counting()));

                List<PollOption> pollOptions = pollOptionRepository.findByPollId(poll.getId());
                for (PollOption po : pollOptions) {
                    long count = countsByPollOptionId.getOrDefault(po.getId(), 0L);
                    Long optionId = po.getOption() != null ? po.getOption().getId() : po.getId();
                    String optionText = po.getOption() != null ? po.getOption().getLabel() : "Option #" + po.getId();
                    optionsDistribution.add(new OptionBreakdownDto(optionId, optionText, count, 0.0));
                }
            }

            // Recalculate percentages relative to decision total votes
            final long finalDecisionVotes = decisionVotesCount;
            for (OptionBreakdownDto optionDto : optionsDistribution) {
                double pct = finalDecisionVotes > 0
                        ? Math.round(((double) optionDto.getVoteCount() / finalDecisionVotes * 100.0) * 100.0) / 100.0
                        : 0.0;
                optionDto.setPercentage(pct);
            }

            totalVotes += decisionVotesCount;

            double conversionRate = views > 0
                    ? Math.round(((double) decisionVotesCount / views * 100.0) * 100.0) / 100.0
                    : 0.0;

            decisionItems.add(new CreatorDecisionItemDto(
                    decision.getId(),
                    decision.getTitle(),
                    reach,
                    views,
                    decisionVotesCount,
                    conversionRate,
                    decision.getStatus() != null ? decision.getStatus() : "OPEN",
                    decision.getCreatedAt() != null ? decision.getCreatedAt().toString() : "",
                    polls.isEmpty() ? decision.getTitle() : polls.get(0).getQuestion(),
                    optionsDistribution
            ));
        }

        double overallConversionRate = totalViews > 0
                ? Math.round(((double) totalVotes / totalViews * 100.0) * 100.0) / 100.0
                : 0.0;

        return new CreatorAnalyticsResponse(
                totalDecisionsPublished,
                totalReach,
                totalViews,
                totalVotes,
                overallConversionRate,
                decisionItems
        );
    }

    @Transactional
    public void recordImpression(Long decisionId, String type, String userEmail, String clientIp) {
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new DecisionNotFoundException("Decision not found with id: " + decisionId));

        String sanitizedType = (type != null && !type.isBlank()) ? type.trim().toUpperCase() : "VIEW";
        if (!"VIEW".equals(sanitizedType) && !"REACH".equals(sanitizedType)) {
            throw new IllegalArgumentException("Invalid impression type: " + type + ". Type must be 'REACH' or 'VIEW'.");
        }

        User user = null;
        if (userEmail != null && !userEmail.isBlank()) {
            user = userRepository.findByEmail(userEmail).orElse(null);
        }

        DecisionImpression impression = new DecisionImpression(decision, user, userEmail, clientIp, sanitizedType);
        decisionImpressionRepository.save(impression);
    }
}
