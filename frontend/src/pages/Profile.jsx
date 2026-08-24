import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import Toast from "../components/Toast";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
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
     LOAD PROFILE
  ========================= */

  const load = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/users/profile",
        {
          headers: headers(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setProfile(data);
      setName(data.name || "");

    } catch (error) {
      notify(
        error.message ||
          "Unable to load profile.",
        true
      );
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
     UPDATE PROFILE
  ========================= */

  const update = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      return notify(
        "Name is required.",
        true
      );
    }

    setSaving(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/users/profile",
        {
          method: "PUT",
          headers: {
            ...headers(),
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setProfile(data);

      sessionStorage.setItem(
        "userName",
        data.name
      );

      notify(
        "Profile updated successfully."
      );

    } catch (error) {
      notify(
        error.message ||
          "Unable to update profile.",
        true
      );

    } finally {
      setSaving(false);
    }
  };


  /* =========================
     STATS
  ========================= */

  const stats = profile
    ? [
        [
          "Decisions created",
          profile.decisionsCreated,
        ],
        [
          "Votes cast",
          profile.votesParticipated,
        ],
        [
          "Communities joined",
          profile.joinedCommunities,
        ],
      ]
    : [];


  return (
    <DashboardLayout
      pageTitle="Profile"
      pageSubtitle="Your DecisionHub identity, activity, and account settings."
    >

      <Toast
        message={message}
        isError={isError}
      />


      <style>{`

        /* =========================
           MAIN PAGE
        ========================= */

        .profile-page {
          max-width: 1250px;

          margin: 0 auto;

          padding:
            4px 0 42px;

          color:
            var(--app-text);
        }


        /* =========================
           LOADING
        ========================= */

        .profile-loading {
          padding: 54px;

          border:
            1px dashed
            var(--app-border);

          border-radius: 16px;

          color:
            var(--app-secondary-text);

          background:
            var(--app-card);

          text-align: center;

          transition:
            background 0.25s ease,
            border-color 0.25s ease;
        }


        /* =========================
           PROFILE BANNER
        ========================= */

        .profile-banner {
          position: relative;

          overflow: hidden;

          display: flex;

          align-items: center;

          gap: 20px;

          padding:
            27px 30px;

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


        .profile-banner::after {
          content: "";

          position: absolute;

          right: -50px;
          bottom: -62px;

          width: 190px;
          height: 190px;

          border:
            1px solid
            rgba(139, 92, 246, .15);

          border-radius: 50%;

          pointer-events: none;
        }


        /* =========================
           AVATAR
        ========================= */

        .profile-avatar {
          position: relative;

          z-index: 1;

          display: flex;

          align-items: center;
          justify-content: center;

          width: 76px;
          height: 76px;

          flex: 0 0 76px;

          border:
            2px solid
            rgba(196, 181, 253, .4);

          border-radius: 24px;

          background:
            linear-gradient(
              135deg,
              #4f46e5,
              #7c3aed
            );

          box-shadow:
            0 12px 28px
            rgba(79, 70, 229, .28);

          color: white;

          font-size: 28px;

          font-weight: 800;
        }


        /* =========================
           BANNER TEXT
        ========================= */

        .profile-banner-copy {
          position: relative;

          z-index: 1;

          min-width: 0;
        }


        .profile-kicker {
          color:
            #8b5cf6;

          font-size: 10px;

          font-weight: 700;

          letter-spacing: 1.4px;

          text-transform: uppercase;
        }


        .profile-banner h2 {
          margin:
            7px 0 4px;

          color:
            var(--app-text);

          font-size: 25px;

          letter-spacing: -.5px;
        }


        .profile-banner p {
          margin: 0;

          color:
            var(--app-secondary-text);

          font-size: 13px;
        }


        /* =========================
           ROLE
        ========================= */

        .profile-role {
          position: relative;

          z-index: 1;

          margin-left: auto;

          border:
            1px solid
            rgba(22, 163, 74, .25);

          border-radius: 20px;

          padding:
            7px 11px;

          color:
            #16a34a;

          background:
            rgba(22, 163, 74, .10);

          font-size: 10px;

          font-weight: 700;

          white-space: nowrap;
        }


        /* =========================
           GRID
        ========================= */

        .profile-grid {
          display: grid;

          grid-template-columns:
            .85fr 1.15fr;

          gap: 18px;

          margin-top: 19px;
        }


        /* =========================
           CARDS
        ========================= */

        .profile-card {
          border:
            1px solid
            var(--app-border);

          border-radius: 16px;

          background:
            var(--app-card);

          padding: 23px;

          transition:
            background 0.25s ease,
            border-color 0.25s ease;
        }


        .profile-card h3 {
          margin: 0;

          color:
            var(--app-text);

          font-size: 16px;
        }


        .profile-card > p {
          margin:
            6px 0 20px;

          color:
            var(--app-secondary-text);

          font-size: 11px;
        }


        /* =========================
           ACCOUNT ROW
        ========================= */

        .account-row {
          padding:
            13px 0;

          border-bottom:
            1px solid
            var(--app-border);
        }


        .account-row:last-child {
          border-bottom: 0;
        }


        .account-label {
          display: block;

          color:
            var(--app-secondary-text);

          font-size: 10px;

          font-weight: 700;

          letter-spacing: .3px;

          text-transform: uppercase;
        }


        .account-value {
          display: block;

          margin-top: 5px;

          color:
            var(--app-text);

          font-size: 13px;

          overflow-wrap: anywhere;
        }


        /* =========================
           FORM
        ========================= */

        .profile-form {
          display: grid;

          gap: 16px;
        }


        .profile-form label {
          color:
            var(--app-secondary-text);

          font-size: 11px;

          font-weight: 600;
        }


        .profile-form input {
          box-sizing: border-box;

          display: block;

          width: 100%;

          margin-top: 8px;

          border:
            1px solid
            var(--app-border);

          border-radius: 9px;

          outline: 0;

          background:
            var(--app-bg);

          color:
            var(--app-text);

          padding:
            11px 12px;

          font-size: 13px;

          transition:
            background 0.25s ease,
            color 0.25s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }


        .profile-form input::placeholder {
          color:
            var(--app-secondary-text);
        }


        .profile-form input:focus {
          border-color:
            #7753bd;

          box-shadow:
            0 0 0 3px
            rgba(124, 58, 237, .12);
        }


        .profile-form input:disabled {
          color:
            var(--app-secondary-text);

          cursor: not-allowed;

          opacity: .75;
        }


        /* =========================
           SAVE BUTTON
        ========================= */

        .save-profile {
          justify-self: start;

          border: 0;

          border-radius: 9px;

          padding:
            11px 15px;

          color: white;

          background:
            linear-gradient(
              135deg,
              #4f46e5,
              #7c3aed
            );

          font-size: 12px;

          font-weight: 700;

          cursor: pointer;

          transition:
            transform 0.2s ease,
            opacity 0.2s ease;
        }


        .save-profile:hover:not(:disabled) {
          transform:
            translateY(-1px);
        }


        .save-profile:disabled {
          opacity: .6;

          cursor: default;
        }


        /* =========================
           STATS
        ========================= */

        .profile-stats {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 13px;

          margin-top: 18px;
        }


        .profile-stat {
          position: relative;

          overflow: hidden;

          border:
            1px solid
            var(--app-border);

          border-radius: 14px;

          background:
            var(--app-card);

          padding: 18px;

          transition:
            background 0.25s ease,
            border-color 0.25s ease,
            transform 0.2s ease;
        }


        .profile-stat:hover {
          transform:
            translateY(-2px);
        }


        .profile-stat::after {
          content: "";

          position: absolute;

          top: -20px;
          right: -18px;

          width: 65px;
          height: 65px;

          border-radius: 50%;

          background:
            rgba(124, 58, 237, .12);

          filter: blur(6px);
        }


        .profile-stat strong {
          position: relative;

          display: block;

          color:
            #8b5cf6;

          font-size: 25px;
        }


        .profile-stat span {
          position: relative;

          display: block;

          margin-top: 5px;

          color:
            var(--app-secondary-text);

          font-size: 11px;
        }


        /* =========================
           TABLET / MOBILE
        ========================= */

        @media (max-width: 750px) {

          .profile-banner {
            padding:
              22px 19px;
          }


          .profile-grid {
            grid-template-columns: 1fr;
          }


          .profile-stats {
            grid-template-columns: 1fr;
          }


          .profile-role {
            display: none;
          }
        }


        @media (max-width: 470px) {

          .profile-avatar {
            width: 60px;
            height: 60px;

            flex-basis: 60px;

            border-radius: 19px;

            font-size: 23px;
          }


          .profile-banner h2 {
            font-size: 20px;
          }


          .profile-banner p {
            font-size: 11px;
          }
        }

      `}</style>


      <div className="profile-page">

        {!profile ? (

          <div className="profile-loading">
            Loading your profile…
          </div>

        ) : (

          <>

            {/* =========================
                PROFILE BANNER
            ========================= */}

            <section className="profile-banner">

              <div className="profile-avatar">
                {profile.name
                  ?.charAt(0)
                  ?.toUpperCase() || "U"}
              </div>


              <div className="profile-banner-copy">

                <span className="profile-kicker">
                  DecisionHub member
                </span>

                <h2>
                  {profile.name}
                </h2>

                <p>
                  {profile.email}
                </p>

              </div>


              <span className="profile-role">
                {profile.role}
              </span>

            </section>


            {/* =========================
                PROFILE GRID
            ========================= */}

            <div className="profile-grid">

              {/* ACCOUNT DETAILS */}

              <section className="profile-card">

                <h3>
                  Account at a glance
                </h3>

                <p>
                  Your DecisionHub membership
                  details.
                </p>


                <div className="account-row">

                  <span className="account-label">
                    Email address
                  </span>

                  <span className="account-value">
                    {profile.email}
                  </span>

                </div>


                <div className="account-row">

                  <span className="account-label">
                    Account role
                  </span>

                  <span className="account-value">
                    {profile.role}
                  </span>

                </div>


                <div className="account-row">

                  <span className="account-label">
                    Member since
                  </span>

                  <span className="account-value">
                    {profile.createdAt
                      ? new Date(
                          profile.createdAt
                        ).toLocaleDateString()
                      : "Not available"}
                  </span>

                </div>

              </section>


              {/* PERSONAL DETAILS */}

              <section className="profile-card">

                <h3>
                  Personal details
                </h3>

                <p>
                  Keep the name shown across
                  your decisions and comments
                  up to date.
                </p>


                <form
                  className="profile-form"
                  onSubmit={update}
                >

                  <label>
                    Display name

                    <input
                      value={name}
                      onChange={(event) =>
                        setName(
                          event.target.value
                        )
                      }
                      maxLength="100"
                    />
                  </label>


                  <label>
                    Email address

                    <input
                      value={profile.email}
                      disabled
                    />
                  </label>


                  <button
                    type="submit"
                    className="save-profile"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving changes…"
                      : "Save changes"}
                  </button>

                </form>

              </section>

            </div>


            {/* =========================
                STATS
            ========================= */}

            <section className="profile-stats">

              {stats.map(
                ([label, value]) => (

                  <div
                    className="profile-stat"
                    key={label}
                  >

                    <strong>
                      {value || 0}
                    </strong>

                    <span>
                      {label}
                    </span>

                  </div>

                )
              )}

            </section>

          </>

        )}

      </div>

    </DashboardLayout>
  );
}

export default Profile;