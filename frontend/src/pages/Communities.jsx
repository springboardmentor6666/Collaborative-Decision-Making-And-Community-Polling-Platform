import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import Toast from "../components/Toast";

const API = "http://localhost:8080";

function Communities() {
  const [communities, setCommunities] = useState([]);
  const [form, setForm] = useState({
    communityName: "",
    description: "",
  });

  const [opened, setOpened] = useState(null);
  const [communityDecisions, setCommunityDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const headers = () => ({
    Authorization:
      "Bearer " + sessionStorage.getItem("token"),
  });

  const notify = (text, error = false) => {
    setIsError(error);
    setMessage(text);
  };


  /* =========================
     LOAD COMMUNITIES
  ========================= */

  const load = async () => {
    try {
      const response = await fetch(
        API + "/api/communities",
        {
          headers: headers(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setCommunities(data);

    } catch (error) {
      notify(
        error.message ||
          "Unable to load communities.",
        true
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    load();
  }, []);


  /* =========================
     CLEAR TOAST
  ========================= */

  useEffect(() => {
    if (!message) return undefined;

    const timer = setTimeout(
      () => setMessage(""),
      3500
    );

    return () => clearTimeout(timer);
  }, [message]);


  /* =========================
     CREATE COMMUNITY
  ========================= */

  const create = async (event) => {
    event.preventDefault();

    if (!form.communityName.trim()) {
      return notify(
        "Community name is required.",
        true
      );
    }

    try {
      const response = await fetch(
        API + "/api/communities",
        {
          method: "POST",
          headers: {
            ...headers(),
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setForm({
        communityName: "",
        description: "",
      });

      notify(
        "Community created successfully."
      );

      load();

    } catch (error) {
      notify(
        error.message ||
          "Unable to create community.",
        true
      );
    }
  };


  /* =========================
     JOIN / LEAVE
  ========================= */

  const membership = async (community) => {
    try {
      const action = community.joined
        ? "leave"
        : "join";

      const response = await fetch(
        API +
          "/api/communities/" +
          community.id +
          "/" +
          action,
        {
          method: "POST",
          headers: headers(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      notify(
        community.joined
          ? "Community left successfully."
          : "Community joined successfully."
      );

      if (
        opened?.id === community.id &&
        community.joined
      ) {
        setOpened(null);
      }

      load();

    } catch (error) {
      notify(
        error.message ||
          "Unable to update membership.",
        true
      );
    }
  };


  /* =========================
     VIEW COMMUNITY
  ========================= */

  const viewCommunity = async (community) => {
    try {
      const response = await fetch(
        API +
          "/api/communities/" +
          community.id +
          "/decisions",
        {
          headers: headers(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setOpened(community);
      setCommunityDecisions(data);

    } catch (error) {
      notify(
        error.message ||
          "Join this community to view its decisions.",
        true
      );
    }
  };


  return (
    <DashboardLayout
      pageTitle="Communities"
      pageSubtitle="Discover people, ideas, and shared decisions in one place."
    >

      <Toast
        message={message}
        isError={isError}
      />


      <style>{`

        /* =========================
           MAIN PAGE
        ========================= */

        .communities-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 4px 0 42px;

          color: var(--app-text);
        }


        /* =========================
           HERO
        ========================= */

        .communities-hero {
          position: relative;
          overflow: hidden;

          display: grid;
          grid-template-columns: 1.2fr .8fr;

          gap: 25px;

          padding: 28px 30px;

          border:
            1px solid
            var(--app-border);

          border-radius: 18px;

          background:
            linear-gradient(
              135deg,
              var(--app-card),
              var(--app-card-2)
            );

          transition:
            background 0.25s ease,
            border-color 0.25s ease;
        }


        .communities-hero::after {
          content: "";

          position: absolute;

          right: -80px;
          top: -80px;

          width: 230px;
          height: 230px;

          border-radius: 50%;

          background:
            rgba(99, 102, 241, 0.12);

          filter: blur(50px);

          pointer-events: none;
        }


        .communities-kicker {
          color: #8b5cf6;

          font-size: 10px;
          font-weight: 700;

          letter-spacing: 1.6px;

          text-transform: uppercase;
        }


        .communities-hero h2 {
          margin: 10px 0 7px;

          color:
            var(--app-text);

          font-size:
            clamp(24px, 3vw, 32px);

          letter-spacing: -.7px;
        }


        .communities-hero p {
          max-width: 610px;

          margin: 0;

          color:
            var(--app-secondary-text);

          font-size: 13px;

          line-height: 1.65;
        }


        /* =========================
           CREATE COMMUNITY
        ========================= */

        .community-create {
          align-self: center;

          padding: 15px;

          border:
            1px solid
            var(--app-border);

          border-radius: 12px;

          background:
            var(--app-card-2);

          transition:
            background 0.25s ease,
            border-color 0.25s ease;
        }


        .community-create label {
          display: block;

          margin-bottom: 8px;

          color:
            var(--app-text);

          font-size: 11px;

          font-weight: 700;
        }


        .create-fields {
          display: grid;

          grid-template-columns:
            1fr 1.2fr auto;

          gap: 8px;
        }


        .create-fields input {
          min-width: 0;

          border:
            1px solid
            var(--app-border);

          border-radius: 8px;

          outline: none;

          background:
            var(--app-bg);

          color:
            var(--app-text);

          padding: 10px;

          font-size: 11px;

          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            color 0.2s ease;
        }


        .create-fields input::placeholder {
          color:
            var(--app-secondary-text);
        }


        .create-fields input:focus {
          border-color:
            #7351b6;
        }


        .create-fields button {
          border: 0;

          border-radius: 8px;

          color: white;

          background:
            linear-gradient(
              135deg,
              #4f46e5,
              #7c3aed
            );

          padding: 0 13px;

          font-size: 11px;

          font-weight: 700;

          cursor: pointer;

          transition:
            transform 0.2s ease,
            opacity 0.2s ease;
        }


        .create-fields button:hover {
          transform:
            translateY(-1px);

          opacity: .95;
        }


        /* =========================
           SECTION HEADER
        ========================= */

        .community-section-head {
          display: flex;

          justify-content:
            space-between;

          align-items:
            end;

          margin: 26px 0 14px;
        }


        .community-section-head h3 {
          margin: 0;

          color:
            var(--app-text);

          font-size: 17px;
        }


        .community-section-head span {
          color:
            var(--app-secondary-text);

          font-size: 11px;
        }


        /* =========================
           COMMUNITY GRID
        ========================= */

        .community-grid {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );

          gap: 17px;
        }


        /* =========================
           COMMUNITY CARD
        ========================= */

        .community-card {
          position: relative;

          overflow: hidden;

          padding: 21px;

          border:
            1px solid
            var(--app-border);

          border-radius: 15px;

          background:
            var(--app-card);

          transition:
            transform 0.22s ease,
            border-color 0.22s ease,
            box-shadow 0.22s ease,
            background 0.25s ease;
        }


        .community-card:hover {
          transform:
            translateY(-3px);

          border-color:
            #564075;

          box-shadow:
            0 15px 32px
            rgba(0, 0, 0, .15);
        }


        /* =========================
           CARD TOP
        ========================= */

        .community-card-top {
          display: flex;

          align-items: center;

          justify-content:
            space-between;
        }


        .community-mark {
          display: flex;

          align-items: center;
          justify-content: center;

          width: 37px;
          height: 37px;

          border:
            1px solid
            #473263;

          border-radius: 10px;

          color: #8b5cf6;

          background:
            var(--app-card-2);

          font-size: 15px;

          font-weight: 800;
        }


        .community-state {
          border-radius: 20px;

          padding: 5px 8px;

          font-size: 9px;

          font-weight: 700;
        }


        .community-state.joined {
          color: #16a34a;

          border:
            1px solid
            rgba(22, 163, 74, .25);

          background:
            rgba(22, 163, 74, .10);
        }


        .community-state.open {
          color: #8b5cf6;

          border:
            1px solid
            rgba(139, 92, 246, .25);

          background:
            rgba(139, 92, 246, .10);
        }


        /* =========================
           CARD CONTENT
        ========================= */

        .community-card h3 {
          margin:
            17px 0 7px;

          color:
            var(--app-text);

          font-size: 17px;
        }


        .community-card p {
          min-height: 41px;

          margin: 0;

          color:
            var(--app-secondary-text);

          font-size: 12px;

          line-height: 1.6;
        }


        .community-owner {
          display: block;

          margin-top: 12px;

          color:
            var(--app-secondary-text);

          font-size: 10px;
        }


        /* =========================
           ACTIONS
        ========================= */

        .community-actions {
          display: flex;

          justify-content:
            space-between;

          align-items: center;

          gap: 7px;

          margin-top: 17px;

          padding-top: 14px;

          border-top:
            1px solid
            var(--app-border);
        }


        .member-count {
          color:
            var(--app-secondary-text);

          font-size: 10px;
        }


        .community-buttons {
          display: flex;

          gap: 7px;
        }


        .community-buttons button {
          border-radius: 8px;

          padding:
            8px 10px;

          font-size: 10px;

          font-weight: 700;

          cursor: pointer;

          transition:
            transform 0.2s ease,
            opacity 0.2s ease;
        }


        .community-buttons button:hover {
          transform:
            translateY(-1px);

          opacity: .9;
        }


        .view-community {
          color:
            var(--app-text);

          border:
            1px solid
            var(--app-border);

          background:
            var(--app-card-2);
        }


        .join-community {
          color: white;

          border: 0;

          background:
            #6840be;
        }


        .leave-community {
          color:
            #dc2626;

          border:
            1px solid
            rgba(220, 38, 38, .35);

          background:
            rgba(220, 38, 38, .08);
        }


        /* =========================
           COMMUNITY DETAIL
        ========================= */

        .community-detail {
          margin-top: 22px;

          padding: 23px;

          border:
            1px solid
            var(--app-border);

          border-radius: 16px;

          background:
            var(--app-card);

          transition:
            background 0.25s ease,
            border-color 0.25s ease;
        }


        .detail-top {
          display: flex;

          justify-content:
            space-between;

          gap: 18px;
        }


        .detail-top h3 {
          margin: 0;

          color:
            var(--app-text);

          font-size: 19px;
        }


        .detail-top p {
          margin:
            6px 0 0;

          color:
            var(--app-secondary-text);

          font-size: 11px;
        }


        .close-detail {
          border: 0;

          color: #8b5cf6;

          background: transparent;

          font-size: 11px;

          cursor: pointer;
        }


        /* =========================
           DECISION STRIP
        ========================= */

        .decision-strip {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );

          gap: 10px;

          margin-top: 17px;
        }


        .decision-strip > div {
          padding: 13px;

          border:
            1px solid
            var(--app-border);

          border-radius: 10px;

          background:
            var(--app-card-2);

          transition:
            background 0.25s ease,
            border-color 0.25s ease;
        }


        .decision-strip strong {
          display: block;

          color:
            var(--app-text);

          font-size: 12px;
        }


        .decision-strip span {
          display: block;

          margin-top: 6px;

          color:
            var(--app-secondary-text);

          font-size: 10px;

          line-height: 1.45;
        }


        /* =========================
           EMPTY STATE
        ========================= */

        .communities-empty {
          padding: 52px;

          border:
            1px dashed
            var(--app-border);

          border-radius: 16px;

          color:
            var(--app-secondary-text);

          background:
            var(--app-card);

          text-align: center;

          font-size: 13px;

          transition:
            background 0.25s ease,
            border-color 0.25s ease;
        }


        /* =========================
           TABLET
        ========================= */

        @media (max-width: 1000px) {

          .communities-hero {
            grid-template-columns: 1fr;
          }

          .community-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }

          .decision-strip {
            grid-template-columns:
              1fr 1fr;
          }
        }


        /* =========================
           MOBILE
        ========================= */

        @media (max-width: 600px) {

          .communities-hero {
            padding:
              22px 19px;
          }

          .create-fields {
            grid-template-columns: 1fr;
          }

          .create-fields button {
            padding: 11px;
          }

          .community-grid,
          .decision-strip {
            grid-template-columns: 1fr;
          }

          .community-section-head {
            margin-top: 20px;
          }

          .community-card {
            padding: 18px;
          }

          .community-actions {
            align-items: flex-start;
            flex-direction: column;
          }

          .community-buttons {
            width: 100%;
          }

          .community-buttons button {
            flex: 1;
          }
        }

      `}</style>


      <div className="communities-page">

        {/* =========================
            HERO
        ========================= */}

        <section className="communities-hero">

          <div>

            <span className="communities-kicker">
              Community hub
            </span>

            <h2>
              Better decisions happen together.
            </h2>

            <p>
              Find the right people for a topic,
              join the conversation, and take part
              in the decisions that matter to your
              community.
            </p>

          </div>


          {/* CREATE COMMUNITY */}

          <form
            className="community-create"
            onSubmit={create}
          >

            <label>
              Create a community
            </label>

            <div className="create-fields">

              <input
                value={form.communityName}
                onChange={(event) =>
                  setForm({
                    ...form,
                    communityName:
                      event.target.value,
                  })
                }
                placeholder="Community name"
                maxLength="100"
              />


              <input
                value={form.description}
                onChange={(event) =>
                  setForm({
                    ...form,
                    description:
                      event.target.value,
                  })
                }
                placeholder="What is this community about?"
                maxLength="500"
              />


              <button type="submit">
                Create
              </button>

            </div>

          </form>

        </section>


        {/* =========================
            SECTION HEADER
        ========================= */}

        <div className="community-section-head">

          <h3>
            Explore communities
          </h3>

          <span>
            {loading
              ? "Loading…"
              : communities.length +
                " available"}
          </span>

        </div>


        {/* =========================
            LOADING
        ========================= */}

        {loading && (
          <div className="communities-empty">
            Loading communities…
          </div>
        )}


        {/* =========================
            EMPTY
        ========================= */}

        {!loading &&
          communities.length === 0 && (
            <div className="communities-empty">
              No communities yet.
              Be the first to create one.
            </div>
          )}


        {/* =========================
            COMMUNITY CARDS
        ========================= */}

        {!loading &&
          communities.length > 0 && (

            <div className="community-grid">

              {communities.map(
                (community) => (

                  <article
                    className="community-card"
                    key={community.id}
                  >

                    {/* CARD TOP */}

                    <div className="community-card-top">

                      <span className="community-mark">
                        DH
                      </span>


                      <span
                        className={
                          "community-state " +
                          (
                            community.joined
                              ? "joined"
                              : "open"
                          )
                        }
                      >
                        {community.joined
                          ? "Joined"
                          : "Open"}
                      </span>

                    </div>


                    {/* TITLE */}

                    <h3>
                      {community.communityName}
                    </h3>


                    {/* DESCRIPTION */}

                    <p>
                      {community.description ||
                        "A space to share ideas and make decisions together."}
                    </p>


                    {/* OWNER */}

                    <span className="community-owner">
                      Created by{" "}
                      {community.ownerName ||
                        "Community owner"}
                    </span>


                    {/* ACTIONS */}

                    <div className="community-actions">

                      <span className="member-count">
                        {community.memberCount ||
                          0}{" "}
                        members
                      </span>


                      <div className="community-buttons">

                        <button
                          type="button"
                          className="view-community"
                          onClick={() =>
                            viewCommunity(
                              community
                            )
                          }
                        >
                          View
                        </button>


                        <button
                          type="button"
                          className={
                            community.joined
                              ? "leave-community"
                              : "join-community"
                          }
                          onClick={() =>
                            membership(
                              community
                            )
                          }
                        >
                          {community.joined
                            ? "Leave"
                            : "Join"}
                        </button>

                      </div>

                    </div>

                  </article>

                )
              )}

            </div>

          )}


        {/* =========================
            COMMUNITY DETAIL
        ========================= */}

        {opened && (

          <section className="community-detail">

            <div className="detail-top">

              <div>

                <h3>
                  {opened.communityName}
                </h3>

                <p>
                  Members:{" "}
                  {opened.memberNames?.join(
                    ", "
                  ) ||
                    "No members yet"}
                </p>

              </div>


              <button
                type="button"
                className="close-detail"
                onClick={() =>
                  setOpened(null)
                }
              >
                Close panel
              </button>

            </div>


            <div className="decision-strip">

              {communityDecisions.length ? (

                communityDecisions.map(
                  (decision) => (

                    <div
                      key={decision.id}
                    >

                      <strong>
                        {decision.title}
                      </strong>

                      <span>
                        {decision.description}
                      </span>

                    </div>

                  )
                )

              ) : (

                <div>

                  <strong>
                    No decisions yet
                  </strong>

                  <span>
                    Community members can
                    create a decision from
                    the Create Decision page.
                  </span>

                </div>

              )}

            </div>

          </section>

        )}

      </div>

    </DashboardLayout>
  );
}

export default Communities;