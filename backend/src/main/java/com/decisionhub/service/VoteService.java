package com.decisionhub.service;

import com.decisionhub.dto.OptionDto;
import com.decisionhub.dto.VoteRequest;
import com.decisionhub.dto.VoteResponse;
import com.decisionhub.dto.VoteResultResponse;
import com.decisionhub.dto.OptionRatingSummaryDto;
import com.decisionhub.dto.PollRatingSummaryResponse;
import com.decisionhub.entity.*;
import com.decisionhub.exception.DuplicateVoteException;
import com.decisionhub.exception.PollNotFoundException;
import com.decisionhub.exception.UserNotFoundException;
import com.decisionhub.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class VoteService {

    private final VoteRepository voteRepository;
    private final UserRepository userRepository;
    private final PollRepository pollRepository;
    private final PollOptionRepository pollOptionRepository;

    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    public VoteService(VoteRepository voteRepository,
                       UserRepository userRepository,
                       PollRepository pollRepository,
                       PollOptionRepository pollOptionRepository,
                       org.springframework.context.ApplicationEventPublisher eventPublisher) {
        this.voteRepository = voteRepository;
        this.userRepository = userRepository;
        this.pollRepository = pollRepository;
        this.pollOptionRepository = pollOptionRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public VoteResponse castVote(VoteRequest request, String userEmail) {
        User voter = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        Poll poll = pollRepository.findById(request.getPollId())
                .orElseThrow(() -> new PollNotFoundException("Poll not found with id: " + request.getPollId()));

        // Check if poll or decision is closed/expired
        if (poll.getEndsAt() != null && java.time.LocalDateTime.now().isAfter(poll.getEndsAt())) {
            throw new IllegalArgumentException("Poll has expired and is no longer accepting votes");
        }
        if (poll.getDecision() != null && ("CLOSED".equalsIgnoreCase(poll.getDecision().getStatus()) || "EXPIRED".equalsIgnoreCase(poll.getDecision().getStatus()))) {
            throw new IllegalArgumentException("Decision is " + poll.getDecision().getStatus().toLowerCase() + " and is no longer accepting votes");
        }

        // Check for duplicate vote based on poll type
        if ("MULTI".equalsIgnoreCase(poll.getPollType())) {
            if (voteRepository.existsByPollOptionIdAndVoterId(request.getPollOptionId(), voter.getId())) {
                throw new DuplicateVoteException("User has already voted for this option");
            }
        } else {
            if (voteRepository.existsByPollIdAndVoterId(poll.getId(), voter.getId())) {
                throw new DuplicateVoteException("User has already voted on this poll");
            }
        }

        // Check rating bounds for RATING polls
        if ("RATING".equalsIgnoreCase(poll.getPollType())) {
            if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
                throw new IllegalArgumentException("Rating must be between 1 and 5 for RATING polls");
            }
        }

        PollOption pollOption = pollOptionRepository.findById(request.getPollOptionId())
                .orElseThrow(() -> new IllegalArgumentException("Poll option not found with id: " + request.getPollOptionId()));

        // Verify the poll option belongs to the correct poll
        if (!pollOption.getPoll().getId().equals(poll.getId())) {
            throw new IllegalArgumentException("Poll option does not belong to the specified poll");
        }

        Vote vote = new Vote();
        vote.setPoll(poll);
        vote.setPollOption(pollOption);
        vote.setVoter(voter);
        vote.setRating(request.getRating());

        Vote savedVote = voteRepository.save(vote);

        if (poll.getDecision() != null && poll.getDecision().getOwner() != null && !poll.getDecision().getOwner().getId().equals(voter.getId())) {
            String msg = voter.getFullName() + " voted on your poll for decision: " + poll.getDecision().getTitle();
            eventPublisher.publishEvent(new com.decisionhub.event.NotificationEvent(this, poll.getDecision().getOwner(), "NEW_VOTE", msg, "New Vote Received"));
        }

        return new VoteResponse(
                savedVote.getId(),
                poll.getId(),
                pollOption.getId(),
                voter.getId(),
                pollOption.getOption().getLabel(),
                savedVote.getRating(),
                savedVote.getVotedAt()
        );
    }

    @Transactional(readOnly = true)
    public VoteResultResponse getVoteResults(Long pollId) {
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new PollNotFoundException("Poll not found with id: " + pollId));

        List<Vote> votes = voteRepository.findByPollId(pollId);
        int totalVotes = votes.size();

        // Count votes per poll option
        Map<Long, Long> voteCounts = votes.stream()
                .collect(Collectors.groupingBy(v -> v.getPollOption().getId(), Collectors.counting()));

        List<PollOption> pollOptions = pollOptionRepository.findByPollId(pollId);

        List<OptionDto> optionDtos = pollOptions.stream()
                .map(po -> {
                    long count = voteCounts.getOrDefault(po.getId(), 0L);
                    double pct = (totalVotes > 0) ? (count * 100.0 / totalVotes) : 0.0;
                    pct = Math.round(pct * 100.0) / 100.0;
                    return new OptionDto(po.getOption().getId(), po.getOption().getLabel(),
                            po.getOption().getDescription(), count, pct);
                })
                .collect(Collectors.toList());

        // Determine winning option, handling ties
        String winningOption = "No votes yet";
        int winningCount = 0;

        if (!voteCounts.isEmpty()) {
            long maxCount = voteCounts.values().stream().max(Long::compare).orElse(0L);
            if (maxCount > 0) {
                winningCount = (int) maxCount;
                List<Long> winnerOptionIds = voteCounts.entrySet().stream()
                        .filter(e -> e.getValue() == maxCount)
                        .map(Map.Entry::getKey)
                        .collect(Collectors.toList());

                List<String> winnerLabels = pollOptions.stream()
                        .filter(po -> winnerOptionIds.contains(po.getId()))
                        .map(po -> po.getOption().getLabel())
                        .collect(Collectors.toList());

                winningOption = String.join(", ", winnerLabels);
            }
        }

        Decision decision = poll.getDecision();

        return new VoteResultResponse(
                poll.getId(),
                decision != null ? decision.getId() : null,
                decision != null ? decision.getTitle() : "N/A",
                poll.getPollType(),
                totalVotes,
                winningOption,
                winningCount,
                optionDtos
        );
    }

    @Transactional(readOnly = true)
    public PollRatingSummaryResponse getRatingSummary(Long pollId) {
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new PollNotFoundException("Poll not found with id: " + pollId));

        if (!"RATING".equalsIgnoreCase(poll.getPollType())) {
            throw new IllegalArgumentException("Poll must be of type RATING to get rating summary");
        }

        List<Vote> votes = voteRepository.findByPollId(pollId);
        
        // Calculate overall average
        double overallAverage = 0.0;
        long totalVotesWithRating = 0;
        double overallSum = 0.0;
        for (Vote v : votes) {
            if (v.getRating() != null) {
                overallSum += v.getRating();
                totalVotesWithRating++;
            }
        }
        if (totalVotesWithRating > 0) {
            overallAverage = Math.round((overallSum / totalVotesWithRating) * 100.0) / 100.0;
        }

        List<PollOption> pollOptions = pollOptionRepository.findByPollId(pollId);

        // Group votes by option
        Map<Long, List<Vote>> optionVotes = votes.stream()
                .collect(Collectors.groupingBy(v -> v.getPollOption().getId()));

        List<OptionRatingSummaryDto> optionRatings = pollOptions.stream()
                .map(po -> {
                    List<Vote> list = optionVotes.getOrDefault(po.getId(), java.util.Collections.emptyList());
                    long count = 0;
                    double sum = 0.0;
                    for (Vote v : list) {
                        if (v.getRating() != null) {
                            sum += v.getRating();
                            count++;
                        }
                    }
                    double avg = (count > 0) ? Math.round((sum / count) * 100.0) / 100.0 : 0.0;
                    return new OptionRatingSummaryDto(
                            po.getOption().getId(),
                            po.getOption().getLabel(),
                            avg,
                            count
                    );
                })
                .collect(Collectors.toList());

        return new PollRatingSummaryResponse(
                poll.getId(),
                overallAverage,
                totalVotesWithRating,
                optionRatings
        );
    }
}
