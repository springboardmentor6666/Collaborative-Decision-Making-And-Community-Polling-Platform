import React, { useMemo, useState } from "react";
import "../styles/Community.css";

const communities = [
  {
    id: 1,
    icon: "💻",
    name: "Technology",
    description: "Discuss technology, programming and new innovations.",
    members: "1.2K",
  },
  {
    id: 2,
    icon: "🎓",
    name: "Students",
    description:
      "Share ideas, study resources and make better decisions.",
    members: "850",
  },
  {
    id: 3,
    icon: "💼",
    name: "Career & Jobs",
    description:
      "Discuss careers, internships, jobs and professional growth.",
    members: "1.5K",
  },
  {
    id: 4,
    icon: "🚀",
    name: "Startups",
    description:
      "Share startup ideas and discuss business opportunities.",
    members: "620",
  },
];

const initialDiscussions = [
  {
    id: 1,
    title: "Which technology should we learn next?",
    message:
      "I am planning my learning roadmap for the next few months. Which technology would be most useful for a frontend developer?",
    author: "Rahul Sharma",
    time: "2 hours ago",
    likes: 24,
    comments: 8,
    liked: false,
    replies: [
      {
        id: 11,
        author: "Priya Singh",
        text: "React and TypeScript are a great combination.",
        time: "1 hour ago",
      },
      {
        id: 12,
        author: "Aman Verma",
        text: "I would also recommend learning basic cloud concepts.",
        time: "45 min ago",
      },
    ],
  },
  {
    id: 2,
    title: "What makes a good team decision?",
    message:
      "What process does your team follow when everyone has a different opinion? I would love to hear practical examples.",
    author: "Priya Singh",
    time: "5 hours ago",
    likes: 18,
    comments: 6,
    liked: false,
    replies: [
      {
        id: 21,
        author: "Rahul Sharma",
        text: "Clear goals and voting criteria help a lot.",
        time: "3 hours ago",
      },
    ],
  },
  {
    id: 3,
    title: "Best way to prepare for technical interviews?",
    message:
      "I am preparing for upcoming interviews. What should I focus on first: DSA, projects, JavaScript or system design?",
    author: "Aman Verma",
    time: "1 day ago",
    likes: 32,
    comments: 12,
    liked: false,
    replies: [],
  },
];

const pollOptions = ["Java", "Python", "JavaScript"];

function Community() {
  const [joined, setJoined] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [activeTab, setActiveTab] = useState("discussions");

  const [selectedPoll, setSelectedPoll] = useState("");
  const [voted, setVoted] = useState(false);

  const [voteCounts, setVoteCounts] = useState({
    Java: 110,
    Python: 75,
    JavaScript: 60,
  });

  const [discussionList, setDiscussionList] =
    useState(initialDiscussions);

  const [showDiscussionForm, setShowDiscussionForm] =
    useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const [openDiscussion, setOpenDiscussion] = useState(null);
  const [commentText, setCommentText] = useState("");

  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);
  const [reportedId, setReportedId] = useState(null);

  const [searchText, setSearchText] = useState("");

  const totalVotes = Object.values(voteCounts).reduce(
    (total, count) => total + count,
    0
  );

  const leadingChoice = useMemo(
    () =>
      Object.entries(voteCounts).sort(
        (a, b) => b[1] - a[1]
      )[0],
    [voteCounts]
  );

  const getPercentage = (count) =>
    totalVotes === 0
      ? 0
      : Math.round((count / totalVotes) * 100);

  const scrollTo = (id, block = "start") => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block,
    });
  };

  const handleJoin = (community) => {
    if (joined.includes(community.id)) {
      setJoined((prev) =>
        prev.filter((id) => id !== community.id)
      );

      if (selectedCommunity?.id === community.id) {
        setSelectedCommunity(null);
      }

      return;
    }

    setJoined((prev) => [...prev, community.id]);
  };

  const handleEnterCommunity = (community) => {
    setSelectedCommunity(community);
    setActiveTab("discussions");

    setTimeout(() => {
      scrollTo("community-details", "center");
    }, 50);
  };

  const handleLike = (id) => {
    setDiscussionList((prev) =>
      prev.map((discussion) =>
        discussion.id === id
          ? {
              ...discussion,
              liked: !discussion.liked,
              likes: discussion.liked
                ? discussion.likes - 1
                : discussion.likes + 1,
            }
          : discussion
      )
    );
  };

  const handleAddComment = (id) => {
    if (!commentText.trim()) return;

    const reply = {
      id: Date.now(),
      author: "You",
      text: commentText.trim(),
      time: "Just now",
    };

    setDiscussionList((prev) =>
      prev.map((discussion) =>
        discussion.id === id
          ? {
              ...discussion,
              comments: discussion.comments + 1,
              replies: [...discussion.replies, reply],
            }
          : discussion
      )
    );

    setCommentText("");
  };

  const handleDiscussionSubmit = () => {
    if (!newTitle.trim() || !newMessage.trim()) return;

    const newDiscussion = {
      id: Date.now(),
      title: newTitle.trim(),
      message: newMessage.trim(),
      author: "You",
      time: "Just now",
      likes: 0,
      comments: 0,
      liked: false,
      replies: [],
    };

    setDiscussionList((prev) => [
      newDiscussion,
      ...prev,
    ]);

    setNewTitle("");
    setNewMessage("");
    setShowDiscussionForm(false);
    setOpenDiscussion(newDiscussion.id);

    setActiveTab("discussions");

    setTimeout(() => {
      scrollTo("discussions", "start");
    }, 100);
  };

  const handleShare = async (title) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: title,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(title);
        alert("Discussion title copied!");
      }
    } catch {
      // User cancelled sharing.
    }
  };

  const handleVote = () => {
    if (!selectedPoll || voted) return;

    setVoteCounts((prev) => ({
      ...prev,
      [selectedPoll]: prev[selectedPoll] + 1,
    }));

    setVoted(true);

    setTimeout(() => {
      scrollTo("poll-results", "center");
    }, 150);
  };

  const handleFeedback = () => {
    if (!feedbackText.trim()) return;

    setFeedbackSent(true);
    setFeedbackText("");
  };

  const filteredDiscussions = discussionList.filter(
    (discussion) => {
      const value = searchText.toLowerCase();

      return (
        discussion.title.toLowerCase().includes(value) ||
        discussion.message.toLowerCase().includes(value) ||
        discussion.author.toLowerCase().includes(value)
      );
    }
  );

  return (
    <section className="community-page">

      {/* HERO */}
      <header className="community-hero">

        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />

        <span className="community-badge">
          DECISIONHUB COMMUNITY
        </span>

        <h1>
          Join Our Community{" "}
          <span className="hero-heart">♥</span>
        </h1>

        <p>
          Connect with people, share ideas, participate in
          polls, and make better decisions together.
        </p>

        <button
          className="join-main-btn"
          onClick={() => scrollTo("communities")}
        >
          Explore Communities <span>→</span>
        </button>

        <div className="hero-trust">
          <span>✓ Real discussions</span>
          <span>✓ Community polls</span>
          <span>✓ Shared decisions</span>
        </div>
      </header>

      {/* STATS */}
      <div
        className="community-stats"
        aria-label="Community statistics"
      >
        {[
          ["👥", "4.2K+", "Total Members"],
          ["🌐", "25+", "Communities"],
          ["📊", "180+", "Polls Created"],
          ["✓", "320+", "Decisions Made"],
        ].map(([icon, value, label]) => (
          <div
            className="community-stat-card"
            key={label}
          >
            <span className="stat-icon">{icon}</span>

            <strong>{value}</strong>

            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* COMMUNITIES */}
      <section
        className="community-section"
        id="communities"
      >
        <div className="section-heading">

          <span>EXPLORE</span>

          <h2>Find your community</h2>

          <p>
            Join an interest-based community and enter its
            discussion space, polls and decision activities.
          </p>

        </div>

        <div className="community-grid">

          {communities.map((community) => {

            const isJoined =
              joined.includes(community.id);

            return (
              <article
                className="community-card"
                key={community.id}
              >

                <div className="community-card-top">

                  <div className="community-icon">
                    {community.icon}
                  </div>

                  <span className="community-status">
                    {isJoined
                      ? "Member"
                      : "Open community"}
                  </span>

                </div>

                <h3>{community.name}</h3>

                <p>
                  {community.description}
                </p>

                <div className="community-card-bottom">

                  <span className="member-count">
                    👥 {community.members} Members
                  </span>

                  <div className="community-card-actions">

                    <button
                      className={
                        isJoined
                          ? "joined-btn"
                          : "join-btn"
                      }
                      onClick={() =>
                        handleJoin(community)
                      }
                    >
                      {isJoined
                        ? "Joined ✓"
                        : "Join"}
                    </button>

                    {isJoined && (
                      <button
                        className="enter-community-btn"
                        onClick={() =>
                          handleEnterCommunity(
                            community
                          )
                        }
                      >
                        Enter →
                      </button>
                    )}

                  </div>

                </div>

              </article>
            );
          })}

        </div>

        {/* SELECTED COMMUNITY */}
        {selectedCommunity && (
          <div
            className="community-detail"
            id="community-details"
          >

            <div className="community-detail-main">

              <div className="community-detail-icon">
                {selectedCommunity.icon}
              </div>

              <div>

                <span className="detail-kicker">
                  YOUR COMMUNITY
                </span>

                <h2>
                  {selectedCommunity.name} Community
                </h2>

                <p>
                  {selectedCommunity.description}
                </p>

                <span className="detail-members">
                  👥 {selectedCommunity.members} members
                </span>

              </div>

            </div>

            <div className="community-detail-actions">

              <button
                className={
                  activeTab === "discussions"
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setActiveTab("discussions");
                  scrollTo("discussions");
                }}
              >
                💬 Discussions
              </button>

              <button
                className={
                  activeTab === "polls"
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setActiveTab("polls");
                  scrollTo("polls");
                }}
              >
                📊 Polls
              </button>

              <button
                className={
                  activeTab === "analytics"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab("analytics")
                }
              >
                📈 Analytics
              </button>

              <button
                onClick={() =>
                  setSelectedCommunity(null)
                }
              >
                ✕ Close
              </button>

            </div>

          </div>
        )}
      </section>

      {/* DISCUSSION FORUM */}
      <section
        className="community-section"
        id="discussions"
      >

        <div className="section-heading section-heading-row">

          <div>

            <span>DISCUSS</span>

            <h2>
              Community Discussion Forum
            </h2>

            <p>
              Ask questions, share advice and continue
              conversations with other members.
            </p>

          </div>

          <button
            className="outline-action"
            onClick={() =>
              setShowDiscussionForm(true)
            }
          >
            + Start Discussion
          </button>

        </div>

        <div className="forum-toolbar">

          <div className="forum-search">

            <span>⌕</span>

            <input
              value={searchText}
              onChange={(e) =>
                setSearchText(e.target.value)
              }
              placeholder="Search discussions..."
              aria-label="Search discussions"
            />

          </div>

          <span className="forum-count">
            {filteredDiscussions.length} discussions
          </span>

        </div>

        <div className="discussion-list">

          {filteredDiscussions.length === 0 ? (

            <div className="empty-state">

              <div>💬</div>

              <h3>
                No discussions found
              </h3>

              <p>
                Try another search or start the first
                discussion.
              </p>

              <button
                onClick={() =>
                  setShowDiscussionForm(true)
                }
              >
                Start a Discussion
              </button>

            </div>

          ) : (

            filteredDiscussions.map((discussion) => {

              const isOpen =
                openDiscussion === discussion.id;

              return (
                <article
                  className="discussion-card"
                  key={discussion.id}
                >

                  <div className="discussion-avatar">
                    {discussion.author.charAt(0)}
                  </div>

                  <div className="discussion-content">

                    <div className="discussion-topline">

                      <div>

                        <h3>
                          {discussion.title}
                        </h3>

                        <p className="discussion-meta">
                          By{" "}
                          <strong>
                            {discussion.author}
                          </strong>{" "}
                          · {discussion.time}
                        </p>

                      </div>

                      <button
                        className="more-btn"
                        title="Report discussion"
                        onClick={() =>
                          setReportedId(
                            discussion.id
                          )
                        }
                      >
                        ⋯
                      </button>

                    </div>

                    <p className="discussion-message">
                      {discussion.message}
                    </p>

                    <div className="discussion-actions">

                      <button
                        className={
                          discussion.liked
                            ? "action-liked"
                            : ""
                        }
                        onClick={() =>
                          handleLike(
                            discussion.id
                          )
                        }
                      >
                        {discussion.liked
                          ? "♥"
                          : "♡"}{" "}
                        {discussion.likes}
                      </button>

                      <button
                        className={
                          isOpen
                            ? "action-active"
                            : ""
                        }
                        onClick={() =>
                          setOpenDiscussion(
                            isOpen
                              ? null
                              : discussion.id
                          )
                        }
                      >
                        💬 {discussion.comments}
                      </button>

                      <button
                        onClick={() =>
                          handleShare(
                            discussion.title
                          )
                        }
                      >
                        ↗ Share
                      </button>

                      <button
                        onClick={() =>
                          setReportedId(
                            discussion.id
                          )
                        }
                        className="report-action"
                      >
                        ⚑ Report
                      </button>

                    </div>

                    {isOpen && (
                      <div className="thread-panel">

                        <div className="thread-title">

                          <span>
                            Conversation
                          </span>

                          <small>
                            {
                              discussion.replies
                                .length
                            }{" "}
                            replies
                          </small>

                        </div>

                        <div className="reply-list">

                          {discussion.replies
                            .length === 0 ? (

                            <div className="reply-empty">
                              Be the first person to
                              reply to this discussion.
                            </div>

                          ) : (

                            discussion.replies.map(
                              (reply) => (
                                <div
                                  className="reply-item"
                                  key={reply.id}
                                >

                                  <div className="reply-avatar">
                                    {reply.author.charAt(
                                      0
                                    )}
                                  </div>

                                  <div>

                                    <div className="reply-meta">

                                      <strong>
                                        {reply.author}
                                      </strong>

                                      <span>
                                        {reply.time}
                                      </span>

                                    </div>

                                    <p>
                                      {reply.text}
                                    </p>

                                  </div>

                                </div>
                              )
                            )

                          )}

                        </div>

                        <div className="reply-composer">

                          <input
                            value={commentText}
                            onChange={(e) =>
                              setCommentText(
                                e.target.value
                              )
                            }
                            placeholder="Write a reply..."
                            onKeyDown={(e) => {
                              if (
                                e.key === "Enter"
                              ) {
                                handleAddComment(
                                  discussion.id
                                );
                              }
                            }}
                          />

                          <button
                            onClick={() =>
                              handleAddComment(
                                discussion.id
                              )
                            }
                          >
                            Reply
                          </button>

                        </div>

                      </div>
                    )}

                  </div>

                </article>
              );
            })

          )}

        </div>

      </section>

      {/* POLL */}
      <section
        className="community-section"
        id="polls"
      >

        <div className="section-heading">

          <span>VOTE</span>

          <h2>Active Community Poll</h2>

          <p>
            Participate in a poll and see how the
            community is thinking.
          </p>

        </div>

        <div className="poll-layout">

          <div className="poll-card">

            <div className="poll-header">

              <span className="poll-icon">
                📊
              </span>

              <div>

                <span className="poll-label">
                  COMMUNITY POLL
                </span>

                <h3>
                  Which programming language
                  should we focus on?
                </h3>

                <p>
                  {totalVotes} votes · One response
                  per member
                </p>

              </div>

            </div>

            <div className="poll-options">

              {pollOptions.map((option) => (

                <label
                  className={`poll-option ${
                    selectedPoll === option
                      ? "selected"
                      : ""
                  }`}
                  key={option}
                >

                  <input
                    type="radio"
                    name="language"
                    value={option}
                    checked={
                      selectedPoll === option
                    }
                    onChange={(e) =>
                      setSelectedPoll(
                        e.target.value
                      )
                    }
                    disabled={voted}
                  />

                  <span>{option}</span>

                  {selectedPoll === option && (
                    <b>Selected</b>
                  )}

                </label>

              ))}

            </div>

            <button
              className="vote-btn"
              onClick={handleVote}
              disabled={
                !selectedPoll || voted
              }
            >
              {voted
                ? "Vote Submitted ✓"
                : "Submit Vote"}
            </button>

          </div>

          {voted && (

            <div
              className="poll-results"
              id="poll-results"
            >

              <div className="results-header">

                <div>

                  <span className="results-badge">
                    RESULT TRACKING
                  </span>

                  <h3>
                    Community Poll Results
                  </h3>

                  <p>
                    Results are updated after
                    your vote.
                  </p>

                </div>

                <div className="total-votes">

                  <strong>
                    {totalVotes}
                  </strong>

                  <span>
                    Total Votes
                  </span>

                </div>

              </div>

              <div className="results-list">

                {Object.entries(voteCounts).map(
                  ([language, count]) => {

                    const percentage =
                      getPercentage(count);

                    return (
                      <div
                        className="result-item"
                        key={language}
                      >

                        <div className="result-top">

                          <strong>
                            {language}
                          </strong>

                          <span>
                            {percentage}% ·{" "}
                            {count} votes
                          </span>

                        </div>

                        <div className="result-progress">

                          <div
                            className="result-progress-fill"
                            style={{
                              width:
                                `${percentage}%`,
                            }}
                          />

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

              <div className="result-summary">

                🏆{" "}
                <span>
                  Leading choice:
                </span>{" "}

                <strong>
                  {leadingChoice[0]}
                </strong>

                <span>
                  {getPercentage(
                    leadingChoice[1]
                  )}%
                </span>

              </div>

            </div>

          )}

        </div>

      </section>

      {/* ANALYTICS */}
      {selectedCommunity &&
        activeTab === "analytics" && (

          <section className="community-section analytics-section">

            <div className="section-heading">

              <span>ANALYTICS</span>

              <h2>
                Community Insights
              </h2>

              <p>
                Frontend dashboard ready for
                analytics APIs.
              </p>

            </div>

            <div className="analytics-grid">

              <div className="analytics-card">

                <span>
                  Participation
                </span>

                <strong>
                  78%
                </strong>

                <div className="mini-bar">
                  <i
                    style={{
                      width: "78%",
                    }}
                  />
                </div>

                <small>
                  Members participating
                  this week
                </small>

              </div>

              <div className="analytics-card">

                <span>
                  Total votes
                </span>

                <strong>
                  {totalVotes}
                </strong>

                <small>
                  Across the active
                  community poll
                </small>

              </div>

              <div className="analytics-card">

                <span>
                  Discussions
                </span>

                <strong>
                  {discussionList.length}
                </strong>

                <small>
                  Active discussion threads
                </small>

              </div>

              <div className="analytics-card">

                <span>
                  Leading option
                </span>

                <strong>
                  {leadingChoice[0]}
                </strong>

                <small>
                  {getPercentage(
                    leadingChoice[1]
                  )}
                  % of total votes
                </small>

              </div>

            </div>

          </section>
        )}

      {/* NOTIFICATIONS + FEEDBACK */}
      <section className="community-tools">

        <div className="notification-panel">

          <button
            className="notification-trigger"
            onClick={() =>
              setShowNotifications(
                (value) => !value
              )
            }
          >

            <span>🔔</span>

            <span>
              Notifications
            </span>

            <b>3</b>

          </button>

          {showNotifications && (

            <div className="notification-dropdown">

              <div className="notification-head">

                <strong>
                  Recent activity
                </strong>

                <span>
                  3 new
                </span>

              </div>

              <div className="notification-item unread">

                <span>💬</span>

                <div>

                  <strong>
                    New reply
                  </strong>

                  <p>
                    Someone replied to a
                    community discussion.
                  </p>

                </div>

              </div>

              <div className="notification-item">

                <span>📊</span>

                <div>

                  <strong>
                    Voting reminder
                  </strong>

                  <p>
                    The active community poll
                    is waiting for your vote.
                  </p>

                </div>

              </div>

              <div className="notification-item">

                <span>✓</span>

                <div>

                  <strong>
                    Decision update
                  </strong>

                  <p>
                    Your community has a new
                    decision update.
                  </p>

                </div>

              </div>

            </div>
          )}

        </div>

        <div className="feedback-panel">

          <div>

            <span className="tool-kicker">
              FEEDBACK
            </span>

            <h3>
              Help us improve the community
            </h3>

            <p>
              Share a suggestion about the
              discussion experience.
            </p>

          </div>

          <button
            onClick={() =>
              setShowFeedback(
                (value) => !value
              )
            }
          >
            Give Feedback
          </button>

        </div>

        {showFeedback && (

          <div className="feedback-form">

            {feedbackSent ? (

              <div className="feedback-success">

                <span>✓</span>

                <div>

                  <strong>
                    Thanks for your feedback!
                  </strong>

                  <p>
                    Your suggestion has been
                    captured.
                  </p>

                </div>

                <button
                  onClick={() =>
                    setFeedbackSent(false)
                  }
                >
                  Close
                </button>

              </div>

            ) : (

              <>

                <textarea
                  value={feedbackText}
                  onChange={(e) =>
                    setFeedbackText(
                      e.target.value
                    )
                  }
                  placeholder="Tell us what you would improve..."
                  rows="4"
                />

                <div>

                  <button
                    onClick={handleFeedback}
                  >
                    Send Feedback
                  </button>

                  <button
                    className="secondary-btn"
                    onClick={() =>
                      setShowFeedback(false)
                    }
                  >
                    Cancel
                  </button>

                </div>

              </>

            )}

          </div>
        )}

      </section>

      {/* CTA */}
      <section className="community-cta">

        <div>

          <span className="cta-kicker">
            YOUR VOICE MATTERS
          </span>

          <h2>
            Have an idea to share?
          </h2>

          <p>
            Start a discussion and help your
            community make better decisions.
          </p>

        </div>

        <button
          className="start-discussion-btn"
          onClick={() =>
            setShowDiscussionForm(true)
          }
        >
          Start a Discussion{" "}
          <span>→</span>
        </button>

      </section>

      {/* NEW DISCUSSION MODAL */}
      {showDiscussionForm && (

        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget
            ) {
              setShowDiscussionForm(false);
            }
          }}
        >

          <div
            className="discussion-form"
            role="dialog"
            aria-modal="true"
          >

            <div className="form-header">

              <div>

                <span>
                  NEW THREAD
                </span>

                <h3>
                  Start a Discussion
                </h3>

                <p>
                  Ask a question, share advice
                  or start a conversation.
                </p>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowDiscussionForm(false)
                }
                aria-label="Close"
              >
                ×
              </button>

            </div>

            <label>

              Discussion title

              <input
                type="text"
                placeholder="e.g. What should we learn next?"
                value={newTitle}
                onChange={(e) =>
                  setNewTitle(e.target.value)
                }
                autoFocus
              />

            </label>

            <label>

              Your message

              <textarea
                rows="6"
                placeholder="Share your thoughts, question or advice..."
                value={newMessage}
                onChange={(e) =>
                  setNewMessage(e.target.value)
                }
              />

            </label>

            <div className="discussion-form-buttons">

              <button
                className="post-btn"
                onClick={
                  handleDiscussionSubmit
                }
                disabled={
                  !newTitle.trim() ||
                  !newMessage.trim()
                }
              >
                Publish Discussion
              </button>

              <button
                className="cancel-btn"
                onClick={() =>
                  setShowDiscussionForm(false)
                }
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}

      {/* REPORT MODAL */}
      {reportedId && (

        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget
            ) {
              setReportedId(null);
            }
          }}
        >

          <div
            className="report-modal"
            role="dialog"
            aria-modal="true"
          >

            <span className="report-icon">
              ⚑
            </span>

            <h3>
              Report this discussion?
            </h3>

            <p>
              This frontend action is ready
              for the moderation API.
            </p>

            <div>

              <button
                className="post-btn"
                onClick={() => {
                  setReportedId(null);
                  alert(
                    "Report submitted for review."
                  );
                }}
              >
                Submit Report
              </button>

              <button
                className="cancel-btn"
                onClick={() =>
                  setReportedId(null)
                }
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}

    </section>
  );
}

export default Community;