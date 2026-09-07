import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import Toast from "../components/Toast";

const API = "http://localhost:8080";

function CommunityDetail() {
  const { communityId } = useParams();
  const navigate = useNavigate();

  const [community, setCommunity] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [messages, setMessages] = useState([]);

  const [chatText, setChatText] = useState("");
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState({});

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(null);

  const headers = () => ({
    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
  });

  const notify = (text, error = false) => {
    setIsError(error);
    setMessage(text);
  };

  const request = async (path, options = {}) => {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        ...headers(),
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong.");
    }

    return data;
  };

  // ============================================================
  // LOAD COMMUNITY
  // ============================================================

  const load = async () => {
    try {
      const [communityData, decisionsData, messagesData] =
        await Promise.all([
          request(`/api/communities/${communityId}`),
          request(`/api/communities/${communityId}/decisions`),
          request(`/api/communities/${communityId}/messages`),
        ]);

      if (!communityData.joined) {
        navigate("/communities");
        return;
      }

      setCommunity(communityData);
      setDecisions(Array.isArray(decisionsData) ? decisionsData : []);
      setMessages(Array.isArray(messagesData) ? messagesData : []);
    } catch (error) {
      notify(
        error.message || "Unable to load this community.",
        true
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [communityId]);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [message]);

  // ============================================================
  // VOTE
  // ============================================================

  const vote = async (decisionId, optionId) => {
    setBusy(`vote-${optionId}`);

    try {
      await request(
        `/api/decisions/${decisionId}/vote/${optionId}`,
        {
          method: "POST",
        }
      );

      notify("Your vote has been recorded.");

      await load();
    } catch (error) {
      notify(error.message || "Unable to record your vote.", true);
    } finally {
      setBusy(null);
    }
  };

  // ============================================================
  // COMMENTS
  // ============================================================

  const loadComments = async (decisionId) => {
    try {
      const loaded = await request(
        `/api/decisions/${decisionId}/comments`
      );

      setComments((current) => ({
        ...current,
        [decisionId]: Array.isArray(loaded) ? loaded : [],
      }));
    } catch (error) {
      notify(error.message || "Unable to load comments.", true);
    }
  };

  const addComment = async (decisionId) => {
    const content = (commentText[decisionId] || "").trim();

    if (!content) {
      notify("Write a comment before posting.", true);
      return;
    }

    try {
      const added = await request(
        `/api/decisions/${decisionId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
          }),
        }
      );

      setComments((current) => ({
        ...current,
        [decisionId]: [
          ...(current[decisionId] || []),
          added,
        ],
      }));

      setCommentText((current) => ({
        ...current,
        [decisionId]: "",
      }));

      notify("Comment posted.");
    } catch (error) {
      notify(error.message || "Unable to post comment.", true);
    }
  };

  // ============================================================
  // COMMUNITY CHAT
  // ============================================================

  const sendMessage = async (event) => {
    event.preventDefault();

    const content = chatText.trim();

    if (!content) return;

    try {
      const added = await request(
        `/api/communities/${communityId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
          }),
        }
      );

      setMessages((current) => [
        ...current,
        added,
      ]);

      setChatText("");
    } catch (error) {
      notify(
        error.message || "Unable to send message.",
        true
      );
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <DashboardLayout
        pageTitle="Community"
        pageSubtitle="Loading your community space."
      >
        <div className="flex min-h-[500px] items-center justify-center">
          <div
            className="
              flex items-center gap-3
              rounded-2xl
              border border-[var(--app-border)]
              bg-[var(--app-card)]
              px-6 py-4
              text-sm
              text-[var(--app-secondary-text)]
              shadow-sm
            "
          >
            <div
              className="
                h-5 w-5
                animate-spin
                rounded-full
                border-2
                border-[var(--app-border)]
                border-t-violet-500
              "
            />

            Loading community...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ============================================================
  // COMMUNITY NOT FOUND
  // ============================================================

  if (!community) {
    return (
      <DashboardLayout
        pageTitle="Community"
        pageSubtitle=""
      >
        <div
          className="
            rounded-2xl
            border border-[var(--app-border)]
            bg-[var(--app-card)]
            p-10
            text-center
            shadow-sm
          "
        >
          <div className="mb-3 text-4xl">
            😕
          </div>

          <h2
            className="
              text-lg
              font-bold
              text-[var(--app-text)]
            "
          >
            Community unavailable
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-[var(--app-secondary-text)]
            "
          >
            This community could not be loaded.
          </p>

          <button
            onClick={() => navigate("/communities")}
            className="
              mt-5
              rounded-xl
              bg-gradient-to-r
              from-violet-600
              to-purple-600
              px-5 py-2.5
              text-sm
              font-bold
              text-white
              shadow-lg
              shadow-violet-500/20
              transition
              hover:-translate-y-0.5
            "
          >
            Back to Communities
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <DashboardLayout
      pageTitle={community.communityName}
      pageSubtitle={
        community.description ||
        "A shared space for conversation and decisions."
      }
    >
      <Toast
        message={message}
        isError={isError}
      />

      <div className="w-full max-w-[1400px]">
        {/* ======================================================
            COMMUNITY HERO
        ====================================================== */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[26px]
            border
            border-[var(--app-border)]
            bg-[var(--app-card)]
            shadow-sm
          "
        >
          {/* Subtle theme-safe purple decoration */}

          <div
            className="
              pointer-events-none
              absolute
              -right-32
              -top-32
              h-72
              w-72
              rounded-full
              bg-violet-500/10
              blur-3xl
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-40
              left-1/3
              h-80
              w-80
              rounded-full
              bg-purple-500/10
              blur-3xl
            "
          />

          <div
            className="
              relative
              border-b
              border-[var(--app-border)]
              bg-gradient-to-r
              from-violet-500/[0.06]
              via-transparent
              to-purple-500/[0.06]
              px-6
              py-7
              sm:px-8
              sm:py-8
              lg:px-10
              lg:py-9
            "
          >
            <div
              className="
                flex
                flex-col
                gap-7
                lg:flex-row
                lg:items-center
                lg:justify-between
              "
            >
              {/* LEFT */}

              <div className="min-w-0">
                {/* Label */}

                <div
                  className="
                    mb-3
                    flex
                    items-center
                    gap-2
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-violet-600
                    dark:text-violet-400
                  "
                >
                  <span
                    className="
                      h-2
                      w-2
                      rounded-full
                      bg-violet-500
                      shadow
                      shadow-violet-500/50
                    "
                  />

                  Decision Community
                </div>

                {/* Community name */}

                <h1
                  className="
                    text-3xl
                    font-extrabold
                    tracking-tight
                    text-[var(--app-text)]
                    sm:text-4xl
                  "
                >
                  {community.communityName}
                </h1>

                {/* Description */}

                <p
                  className="
                    mt-3
                    max-w-3xl
                    text-sm
                    leading-6
                    text-[var(--app-secondary-text)]
                    sm:text-[15px]
                  "
                >
                  {community.description ||
                    "A community for sharing ideas, discussing important questions and making decisions together."}
                </p>

                {/* Stats */}

                <div
                  className="
                    mt-6
                    flex
                    flex-wrap
                    gap-3
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-xl
                      border
                      border-[var(--app-border)]
                      bg-[var(--app-card-2)]
                      px-4
                      py-2.5
                    "
                  >
                    <span
                      className="
                        flex
                        h-7
                        w-7
                        items-center
                        justify-center
                        rounded-lg
                        bg-violet-500/10
                        text-sm
                      "
                    >
                      👥
                    </span>

                    <div>
                      <p
                        className="
                          text-sm
                          font-bold
                          text-[var(--app-text)]
                        "
                      >
                        {community.memberCount || 0}
                      </p>

                      <p
                        className="
                          text-[10px]
                          text-[var(--app-secondary-text)]
                        "
                      >
                        Members
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-xl
                      border
                      border-[var(--app-border)]
                      bg-[var(--app-card-2)]
                      px-4
                      py-2.5
                    "
                  >
                    <span
                      className="
                        flex
                        h-7
                        w-7
                        items-center
                        justify-center
                        rounded-lg
                        bg-violet-500/10
                        text-sm
                        text-violet-600
                        dark:text-violet-400
                      "
                    >
                      ◇
                    </span>

                    <div>
                      <p
                        className="
                          text-sm
                          font-bold
                          text-[var(--app-text)]
                        "
                      >
                        {decisions.length}
                      </p>

                      <p
                        className="
                          text-[10px]
                          text-[var(--app-secondary-text)]
                        "
                      >
                        Polls
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CREATE POLL */}

              <Link
                to={`/create-decision?communityId=${community.id}`}
                className="
                  inline-flex
                  shrink-0
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-violet-600
                  to-purple-600
                  px-6
                  py-3.5
                  text-sm
                  font-bold
                  text-white
                  shadow-lg
                  shadow-violet-500/20
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:shadow-xl
                  hover:shadow-violet-500/25
                  active:translate-y-0
                  lg:min-w-[155px]
                "
              >
                <span className="text-lg leading-none">
                  +
                </span>

                Create Poll
              </Link>
            </div>
          </div>
        </section>

        {/* ======================================================
            MAIN CONTENT
        ====================================================== */}

        <div
          className="
            mt-8
            grid
            grid-cols-1
            gap-6
            xl:grid-cols-[minmax(0,1fr)_370px]
          "
        >
          {/* ====================================================
              POLLS
          ==================================================== */}

          <main className="min-w-0">
            {/* Section title */}

            <div
              className="
                mb-4
                flex
                items-center
                gap-4
              "
            >
              <div
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-violet-600
                  dark:text-violet-400
                "
              >
                Community
              </div>

              <div
                className="
                  h-px
                  flex-1
                  bg-[var(--app-border)]
                "
              />

              <h2
                className="
                  text-lg
                  font-extrabold
                  text-[var(--app-text)]
                "
              >
                Polls
              </h2>
            </div>

            {/* Empty state */}

            {decisions.length === 0 && (
              <div
                className="
                  rounded-2xl
                  border
                  border-dashed
                  border-[var(--app-border)]
                  bg-[var(--app-card)]
                  px-6
                  py-14
                  text-center
                "
              >
                <div className="text-4xl">
                  🗳️
                </div>

                <h3
                  className="
                    mt-4
                    text-base
                    font-bold
                    text-[var(--app-text)]
                  "
                >
                  No polls yet
                </h3>

                <p
                  className="
                    mx-auto
                    mt-2
                    max-w-md
                    text-sm
                    text-[var(--app-secondary-text)]
                  "
                >
                  Start the first poll and let your
                  community make a decision together.
                </p>

                <Link
                  to={`/create-decision?communityId=${community.id}`}
                  className="
                    mt-5
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-violet-600
                    px-5
                    py-2.5
                    text-sm
                    font-bold
                    text-white
                    transition
                    hover:bg-violet-700
                  "
                >
                  + Create Poll
                </Link>
              </div>
            )}

            {/* Poll list */}

            <div className="space-y-5">
              {decisions.map((decision, index) => {
                const totalVotes = decision.options?.reduce(
                  (sum, option) =>
                    sum + (option.voteCount || 0),
                  0
                ) || 0;

                const isClosed =
                  decision.status === "COMPLETED";

                return (
                  <article
                    key={decision.id}
                    className="
                      overflow-hidden
                      rounded-2xl
                      border
                      border-[var(--app-border)]
                      bg-[var(--app-card)]
                      shadow-sm
                      transition-all
                      duration-200
                      hover:-translate-y-[1px]
                      hover:shadow-md
                    "
                  >
                    {/* Purple top accent */}

                    <div
                      className="
                        h-[2px]
                        bg-gradient-to-r
                        from-violet-500
                        via-purple-500
                        to-fuchsia-400
                      "
                    />

                    <div className="p-5 sm:p-6">
                      {/* Poll heading */}

                      <div
                        className="
                          flex
                          gap-4
                        "
                      >
                        {/* Icon */}

                        <div
                          className="
                            flex
                            h-12
                            w-12
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-violet-500/20
                            bg-violet-500/10
                            text-xl
                            text-violet-600
                            dark:text-violet-400
                          "
                        >
                          ◇
                        </div>

                        <div className="min-w-0 flex-1">
                          {/* Badges */}

                          <div
                            className="
                              mb-2
                              flex
                              flex-wrap
                              items-center
                              gap-2
                            "
                          >
                            <span
                              className="
                                rounded-full
                                border
                                border-violet-500/20
                                bg-violet-500/10
                                px-2.5
                                py-1
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-wide
                                text-violet-600
                                dark:text-violet-400
                              "
                            >
                              Poll {index + 1}
                            </span>

                            <span
                              className={`
                                rounded-full
                                border
                                px-2.5
                                py-1
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-wide
                                ${
                                  isClosed
                                    ? `
                                      border-gray-300
                                      bg-gray-100
                                      text-gray-500
                                      dark:border-white/10
                                      dark:bg-white/5
                                      dark:text-gray-400
                                    `
                                    : `
                                      border-emerald-500/20
                                      bg-emerald-500/10
                                      text-emerald-600
                                      dark:text-emerald-400
                                    `
                                }
                              `}
                            >
                              {isClosed
                                ? "Closed"
                                : "Open"}
                            </span>
                          </div>

                          {/* Title */}

                          <h3
                            className="
                              text-lg
                              font-extrabold
                              leading-snug
                              text-[var(--app-text)]
                            "
                          >
                            {decision.title}
                          </h3>

                          {/* Description */}

                          {decision.description && (
                            <p
                              className="
                                mt-2
                                text-sm
                                leading-6
                                text-[var(--app-secondary-text)]
                              "
                            >
                              {decision.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Poll metadata */}

                      <div
                        className="
                          mt-5
                          flex
                          flex-wrap
                          items-center
                          gap-x-4
                          gap-y-2
                          border-y
                          border-[var(--app-border)]
                          py-3
                          text-[11px]
                          text-[var(--app-secondary-text)]
                        "
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="text-violet-500">
                            ●
                          </span>

                          {totalVotes}{" "}
                          {totalVotes === 1
                            ? "vote"
                            : "votes"}
                        </span>

                        <span
                          className="
                            hidden
                            h-3
                            w-px
                            bg-[var(--app-border)]
                            sm:block
                          "
                        />

                        <span>
                          {decision.options?.length || 0}{" "}
                          options
                        </span>

                        {decision.deadline && (
                          <>
                            <span
                              className="
                                hidden
                                h-3
                                w-px
                                bg-[var(--app-border)]
                                sm:block
                              "
                            />

                            <span>
                              Closes{" "}
                              {decision.deadline}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Options */}

                      <div className="mt-4 space-y-2.5">
                        {decision.options?.map(
                          (option) => {
                            const selected =
                              !!option.selected;

                            const percentage =
                              totalVotes > 0
                                ? Math.round(
                                    ((option.voteCount ||
                                      0) /
                                      totalVotes) *
                                      100
                                  )
                                : 0;

                            const disabled =
                              decision.alreadyVoted ||
                              isClosed ||
                              busy ===
                                `vote-${option.id}`;

                            return (
                              <button
                                key={option.id}
                                type="button"
                                disabled={disabled}
                                onClick={() =>
                                  vote(
                                    decision.id,
                                    option.id
                                  )
                                }
                                className={`
                                  group
                                  relative
                                  w-full
                                  overflow-hidden
                                  rounded-xl
                                  border
                                  px-4
                                  py-3.5
                                  text-left
                                  transition-all
                                  duration-200

                                  ${
                                    selected
                                      ? `
                                        border-violet-500/50
                                        bg-violet-500/10
                                        shadow-sm
                                        shadow-violet-500/10
                                      `
                                      : `
                                        border-[var(--app-border)]
                                        bg-[var(--app-card-2)]
                                        hover:border-violet-500/30
                                        hover:bg-violet-500/[0.04]
                                      `
                                  }

                                  ${
                                    disabled
                                      ? `
                                        cursor-default
                                        opacity-90
                                      `
                                      : `
                                        cursor-pointer
                                      `
                                  }
                                `}
                              >
                                {/* Progress background */}

                                {totalVotes > 0 && (
                                  <div
                                    className="
                                      pointer-events-none
                                      absolute
                                      inset-y-0
                                      left-0
                                      bg-violet-500/[0.05]
                                      transition-all
                                    "
                                    style={{
                                      width: `${percentage}%`,
                                    }}
                                  />
                                )}

                                <div
                                  className="
                                    relative
                                    flex
                                    items-center
                                    justify-between
                                    gap-4
                                  "
                                >
                                  <div
                                    className="
                                      flex
                                      min-w-0
                                      items-center
                                      gap-3
                                    "
                                  >
                                    {/* Radio */}

                                    <span
                                      className={`
                                        flex
                                        h-9
                                        w-9
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-lg
                                        border
                                        ${
                                          selected
                                            ? `
                                              border-violet-500
                                              bg-violet-500
                                              text-white
                                            `
                                            : `
                                              border-[var(--app-border)]
                                              bg-[var(--app-card)]
                                              text-[var(--app-secondary-text)]
                                            `
                                        }
                                      `}
                                    >
                                      {selected ? (
                                        <span className="text-sm font-bold">
                                          ✓
                                        </span>
                                      ) : (
                                        <span className="h-2.5 w-2.5 rounded-full border border-current" />
                                      )}
                                    </span>

                                    <span
                                      className="
                                        truncate
                                        text-sm
                                        font-semibold
                                        text-[var(--app-text)]
                                      "
                                    >
                                      {
                                        option.optionText
                                      }
                                    </span>
                                  </div>

                                  {/* Vote count */}

                                  <span
                                    className="
                                      shrink-0
                                      text-[11px]
                                      font-semibold
                                      text-[var(--app-secondary-text)]
                                    "
                                  >
                                    {option.voteCount ||
                                      0}{" "}
                                    {option.voteCount ===
                                    1
                                      ? "vote"
                                      : "votes"}
                                  </span>
                                </div>

                                {/* Percentage */}

                                {totalVotes > 0 && (
                                  <div
                                    className="
                                      relative
                                      mt-2
                                      h-1
                                      overflow-hidden
                                      rounded-full
                                      bg-[var(--app-border)]
                                    "
                                  >
                                    <div
                                      className="
                                        h-full
                                        rounded-full
                                        bg-gradient-to-r
                                        from-violet-500
                                        to-purple-500
                                        transition-all
                                        duration-500
                                      "
                                      style={{
                                        width: `${percentage}%`,
                                      }}
                                    />
                                  </div>
                                )}
                              </button>
                            );
                          }
                        )}
                      </div>

                      {/* Already voted message */}

                      {decision.alreadyVoted && (
                        <div
                          className="
                            mt-4
                            rounded-xl
                            border
                            border-violet-500/20
                            bg-violet-500/[0.06]
                            px-4
                            py-3
                            text-xs
                            text-[var(--app-secondary-text)]
                          "
                        >
                          <span className="font-bold text-violet-600 dark:text-violet-400">
                            ✓ You have voted
                          </span>

                          {" "}Your participation has been
                          recorded.
                        </div>
                      )}

                      {/* Closed message */}

                      {isClosed && (
                        <div
                          className="
                            mt-4
                            rounded-xl
                            border
                            border-[var(--app-border)]
                            bg-[var(--app-card-2)]
                            px-4
                            py-3
                            text-xs
                            text-[var(--app-secondary-text)]
                          "
                        >
                          🔒 This poll is closed and no
                          longer accepting votes.
                        </div>
                      )}

                      {/* ==================================================
                          DISCUSSION
                      ================================================== */}

                      <details
                        className="
                          group
                          mt-5
                          border-t
                          border-[var(--app-border)]
                          pt-4
                        "
                        onToggle={(event) => {
                          if (event.currentTarget.open) {
                            loadComments(decision.id);
                          }
                        }}
                      >
                        <summary
                          className="
                            flex
                            cursor-pointer
                            list-none
                            items-center
                            justify-between
                            text-sm
                            font-bold
                            text-violet-600
                            transition
                            hover:text-violet-500
                            dark:text-violet-400
                          "
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className="
                                flex
                                h-7
                                w-7
                                items-center
                                justify-center
                                rounded-lg
                                bg-violet-500/10
                              "
                            >
                              💬
                            </span>

                            Discuss this poll

                            <span
                              className="
                                rounded-full
                                bg-[var(--app-card-2)]
                                px-2
                                py-0.5
                                text-[10px]
                                text-[var(--app-secondary-text)]
                              "
                            >
                              {comments[decision.id]
                                ?.length || 0}
                            </span>
                          </span>

                          <span
                            className="
                              transition-transform
                              group-open:rotate-180
                            "
                          >
                            ↓
                          </span>
                        </summary>

                        {/* Comments */}

                        <div className="mt-4">
                          {(!comments[decision.id] ||
                            comments[decision.id]
                              ?.length === 0) && (
                            <div
                              className="
                                rounded-xl
                                border
                                border-dashed
                                border-[var(--app-border)]
                                bg-[var(--app-card-2)]
                                px-4
                                py-5
                                text-center
                                text-xs
                                text-[var(--app-secondary-text)]
                              "
                            >
                              No comments yet.
                              Start the discussion.
                            </div>
                          )}

                          <div className="space-y-3">
                            {(
                              comments[decision.id] || []
                            ).map((comment) => (
                              <div
                                key={comment.id}
                                className="
                                  flex
                                  gap-3
                                  rounded-xl
                                  border
                                  border-[var(--app-border)]
                                  bg-[var(--app-card-2)]
                                  p-3
                                "
                              >
                                {/* Avatar */}

                                <div
                                  className="
                                    flex
                                    h-8
                                    w-8
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-violet-500/10
                                    text-xs
                                    font-bold
                                    text-violet-600
                                    dark:text-violet-400
                                  "
                                >
                                  {(
                                    comment.userName ||
                                    "U"
                                  )
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>

                                <div className="min-w-0">
                                  <div
                                    className="
                                      text-xs
                                      font-bold
                                      text-[var(--app-text)]
                                    "
                                  >
                                    {comment.userName}
                                  </div>

                                  <p
                                    className="
                                      mt-1
                                      text-xs
                                      leading-5
                                      text-[var(--app-secondary-text)]
                                    "
                                  >
                                    {
                                      comment.content
                                    }
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Comment form */}

                          <form
                            className="
                              mt-4
                              flex
                              gap-2
                            "
                            onSubmit={(event) => {
                              event.preventDefault();
                              addComment(
                                decision.id
                              );
                            }}
                          >
                            <input
                              value={
                                commentText[
                                  decision.id
                                ] || ""
                              }
                              onChange={(event) =>
                                setCommentText(
                                  (current) => ({
                                    ...current,
                                    [decision.id]:
                                      event.target.value,
                                  })
                                )
                              }
                              placeholder="Add to the discussion..."
                              maxLength={1000}
                              className="
                                min-w-0
                                flex-1
                                rounded-xl
                                border
                                border-[var(--app-border)]
                                bg-[var(--app-card-2)]
                                px-3
                                py-2.5
                                text-xs
                                text-[var(--app-text)]
                                outline-none
                                placeholder:text-[var(--app-secondary-text)]
                                focus:border-violet-500/50
                                focus:ring-2
                                focus:ring-violet-500/10
                              "
                            />

                            <button
                              type="submit"
                              className="
                                shrink-0
                                rounded-xl
                                bg-violet-600
                                px-4
                                py-2.5
                                text-xs
                                font-bold
                                text-white
                                transition
                                hover:bg-violet-700
                              "
                            >
                              Post
                            </button>
                          </form>
                        </div>
                      </details>
                    </div>
                  </article>
                );
              })}
            </div>
          </main>

          {/* ====================================================
              COMMUNITY CHAT
          ==================================================== */}

          <aside className="min-w-0">
            <div
              className="
                sticky
                top-5
                overflow-hidden
                rounded-2xl
                border
                border-[var(--app-border)]
                bg-[var(--app-card)]
                shadow-sm
              "
            >
              {/* Chat header */}

              <div
                className="
                  border-b
                  border-[var(--app-border)]
                  bg-gradient-to-r
                  from-violet-500/[0.06]
                  to-transparent
                  p-5
                "
              >
                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-3
                  "
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        bg-violet-500/10
                        text-lg
                      "
                    >
                      💬
                    </div>

                    <div>
                      <h2
                        className="
                          text-base
                          font-extrabold
                          text-[var(--app-text)]
                        "
                      >
                        Community Chat
                      </h2>

                      <p
                        className="
                          mt-0.5
                          text-[11px]
                          text-[var(--app-secondary-text)]
                        "
                      >
                        Talk with everyone in the room.
                      </p>
                    </div>
                  </div>

                  {/* Online indicator */}

                  <span
                    className="
                      mt-2
                      h-2.5
                      w-2.5
                      rounded-full
                      bg-emerald-500
                      shadow
                      shadow-emerald-500/40
                    "
                    title="Community active"
                  />
                </div>
              </div>

              {/* Chat messages */}

              <div
                className="
                  h-[420px]
                  overflow-y-auto
                  p-4
                  scrollbar-thin
                "
              >
                {messages.length === 0 && (
                  <div
                    className="
                      flex
                      h-full
                      flex-col
                      items-center
                      justify-center
                      px-6
                      text-center
                    "
                  >
                    <div
                      className="
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-2xl
                        bg-violet-500/10
                        text-2xl
                      "
                    >
                      💬
                    </div>

                    <p
                      className="
                        mt-4
                        text-sm
                        font-bold
                        text-[var(--app-text)]
                      "
                    >
                      Start the conversation
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        leading-5
                        text-[var(--app-secondary-text)]
                      "
                    >
                      Share your thoughts with the
                      community.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {messages.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3"
                    >
                      {/* Avatar */}

                      <div
                        className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-violet-500/20
                          bg-violet-500/10
                          text-[11px]
                          font-bold
                          text-violet-600
                          dark:text-violet-400
                        "
                      >
                        {(
                          item.userName || "U"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className="
                            mb-1
                            text-[11px]
                            font-bold
                            text-[var(--app-text)]
                          "
                        >
                          {item.userName}
                        </p>

                        <div
                          className="
                            rounded-xl
                            rounded-tl-sm
                            border
                            border-[var(--app-border)]
                            bg-[var(--app-card-2)]
                            px-3
                            py-2.5
                            text-xs
                            leading-5
                            text-[var(--app-secondary-text)]
                          "
                        >
                          {item.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat form */}

              <form
                onSubmit={sendMessage}
                className="
                  border-t
                  border-[var(--app-border)]
                  bg-[var(--app-card-2)]
                  p-3
                "
              >
                <div className="flex gap-2">
                  <input
                    value={chatText}
                    onChange={(event) =>
                      setChatText(event.target.value)
                    }
                    placeholder="Write a message..."
                    maxLength={2000}
                    className="
                      min-w-0
                      flex-1
                      rounded-xl
                      border
                      border-[var(--app-border)]
                      bg-[var(--app-card)]
                      px-3
                      py-2.5
                      text-xs
                      text-[var(--app-text)]
                      outline-none
                      placeholder:text-[var(--app-secondary-text)]
                      focus:border-violet-500/50
                      focus:ring-2
                      focus:ring-violet-500/10
                    "
                  />

                  <button
                    type="submit"
                    disabled={!chatText.trim()}
                    className="
                      shrink-0
                      rounded-xl
                      bg-gradient-to-r
                      from-violet-600
                      to-purple-600
                      px-4
                      py-2.5
                      text-xs
                      font-bold
                      text-white
                      shadow-sm
                      transition
                      hover:-translate-y-0.5
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    Send
                  </button>
                </div>
              </form>

              {/* ==================================================
                  MEMBERS
              ================================================== */}

              <div
                className="
                  border-t
                  border-[var(--app-border)]
                  p-5
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >
                  <h3
                    className="
                      text-sm
                      font-extrabold
                      text-[var(--app-text)]
                    "
                  >
                    Members
                  </h3>

                  <span
                    className="
                      rounded-full
                      bg-violet-500/10
                      px-2.5
                      py-1
                      text-[10px]
                      font-bold
                      text-violet-600
                      dark:text-violet-400
                    "
                  >
                    {community.memberCount || 0}
                  </span>
                </div>

                <div
                  className="
                    mt-4
                    flex
                    max-h-52
                    flex-wrap
                    gap-2
                    overflow-y-auto
                  "
                >
                  {community.memberNames?.map(
                    (name) => (
                      <div
                        key={name}
                        className="
                          flex
                          items-center
                          gap-2
                          rounded-full
                          border
                          border-[var(--app-border)]
                          bg-[var(--app-card-2)]
                          py-1.5
                          pl-1.5
                          pr-3
                        "
                      >
                        <span
                          className="
                            flex
                            h-6
                            w-6
                            items-center
                            justify-center
                            rounded-full
                            bg-violet-500/10
                            text-[9px]
                            font-bold
                            text-violet-600
                            dark:text-violet-400
                          "
                        >
                          {name
                            .charAt(0)
                            .toUpperCase()}
                        </span>

                        <span
                          className="
                            max-w-[130px]
                            truncate
                            text-[10px]
                            font-semibold
                            text-[var(--app-secondary-text)]
                          "
                        >
                          {name}
                        </span>
                      </div>
                    )
                  )}

                  {(!community.memberNames ||
                    community.memberNames.length ===
                      0) && (
                    <p
                      className="
                        text-xs
                        text-[var(--app-secondary-text)]
                      "
                    >
                      No members to display.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CommunityDetail;