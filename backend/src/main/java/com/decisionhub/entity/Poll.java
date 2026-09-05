package com.decisionhub.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "polls")
public class Poll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decision_id", nullable = false)
    private Decision decision;

    @Column(name = "poll_type", length = 20)
    private String pollType = "SINGLE";

    @Column(name = "voting_method", length = 20)
    private String votingMethod = "SINGLE_CHOICE";

    @Column(name = "max_choices")
    private Integer maxChoices = 1;

    @Column(name = "allow_revoting")
    private Boolean allowRevoting = false;

    @Column(name = "question")
    private String question;

    @Column(name = "is_anonymous")
    private Boolean isAnonymous = false;

    @Column(name = "ends_at")
    private LocalDateTime endsAt;

    @OneToMany(mappedBy = "poll", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<PollOption> pollOptions = new ArrayList<>();

    @OneToMany(mappedBy = "poll", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Vote> votes = new ArrayList<>();

    public Poll() {
    }

    public String getVotingMethod() {
        return votingMethod != null ? votingMethod : (pollType != null ? pollType : "SINGLE_CHOICE");
    }

    public void setVotingMethod(String votingMethod) {
        this.votingMethod = votingMethod;
    }

    public Integer getMaxChoices() {
        return maxChoices != null ? maxChoices : 1;
    }

    public void setMaxChoices(Integer maxChoices) {
        this.maxChoices = maxChoices;
    }

    public Boolean getAllowRevoting() {
        return allowRevoting != null ? allowRevoting : false;
    }

    public void setAllowRevoting(Boolean allowRevoting) {
        this.allowRevoting = allowRevoting;
    }

    // --- Getters and Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Decision getDecision() {
        return decision;
    }

    public void setDecision(Decision decision) {
        this.decision = decision;
    }

    public String getPollType() {
        return pollType;
    }

    public void setPollType(String pollType) {
        this.pollType = pollType;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public Boolean getIsAnonymous() {
        return isAnonymous;
    }

    public void setIsAnonymous(Boolean isAnonymous) {
        this.isAnonymous = isAnonymous;
    }

    public LocalDateTime getEndsAt() {
        return endsAt;
    }

    public void setEndsAt(LocalDateTime endsAt) {
        this.endsAt = endsAt;
    }

    public List<PollOption> getPollOptions() {
        return pollOptions;
    }

    public void setPollOptions(List<PollOption> pollOptions) {
        this.pollOptions = pollOptions;
    }

    public List<Vote> getVotes() {
        return votes;
    }

    public void setVotes(List<Vote> votes) {
        this.votes = votes;
    }

    public void addPollOption(PollOption pollOption) {
        pollOptions.add(pollOption);
        pollOption.setPoll(this);
    }

    public void removePollOption(PollOption pollOption) {
        pollOptions.remove(pollOption);
        pollOption.setPoll(null);
    }
}
