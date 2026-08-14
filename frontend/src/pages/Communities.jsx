import DashboardLayout from "../components/DashboardLayout";

function Communities() {

  const categories = [
    {
      name: "Career",
      icon: "💼",
      members: 0,
      description: "Discuss jobs, interviews and career decisions."
    },
    {
      name: "Education",
      icon: "🎓",
      members: 0,
      description: "Share ideas about courses, colleges and learning."
    },
    {
      name: "Technology",
      icon: "💻",
      members: 0,
      description: "Explore technology, projects and developer choices."
    },
    {
      name: "Travel",
      icon: "✈️",
      members: 0,
      description: "Compare destinations, trips and travel plans."
    },
    {
      name: "Finance",
      icon: "💰",
      members: 0,
      description: "Discuss financial choices and money decisions."
    },
    {
      name: "Lifestyle",
      icon: "🌿",
      members: 0,
      description: "Everyday choices, habits and lifestyle discussions."
    }
  ];

  return (

    <DashboardLayout
      pageTitle="Communities"
      pageSubtitle="Explore communities where people can share ideas and make decisions together."
    >

      <style>{`

        /* =========================
           PAGE
        ========================= */

        .communities-page {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          overflow: hidden;
        }


        /* =========================
           INTRO
        ========================= */

        .community-intro {
          position: relative;
          padding: 28px 30px;
          margin-bottom: 24px;

          border-radius: 18px;

          background:
            radial-gradient(
              circle at 90% 20%,
              rgba(139,92,246,.16),
              transparent 35%
            ),
            linear-gradient(
              135deg,
              #181326,
              #110d1a
            );

          border: 1px solid #302744;

          overflow: hidden;
        }


        .community-intro::after {
          content: "";

          position: absolute;

          width: 180px;
          height: 180px;

          right: -60px;
          bottom: -90px;

          border-radius: 50%;

          background:
            rgba(139,92,246,.12);

          filter: blur(30px);
        }


        .intro-content {
          position: relative;
          z-index: 2;
        }


        .intro-label {
          display: inline-flex;
          align-items: center;
          gap: 7px;

          padding: 6px 10px;

          border-radius: 20px;

          background:
            rgba(139,92,246,.10);

          border:
            1px solid
            rgba(167,139,250,.18);

          color: #bda9f4;

          font-size: 10px;
          font-weight: 600;

          text-transform: uppercase;

          letter-spacing: 1.4px;

          margin-bottom: 13px;
        }


        .intro-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #a78bfa;

          box-shadow:
            0 0 9px #a78bfa;
        }


        .intro-title {
          color: #f7f3ff;

          font-size: 25px;

          font-weight: 650;

          letter-spacing: -.5px;

          margin-bottom: 7px;
        }


        .intro-text {
          color: #91889f;

          font-size: 13px;

          line-height: 1.7;

          max-width: 650px;
        }


        /* =========================
           NOTICE
        ========================= */

        .notice {
          display: flex;
          align-items: center;

          gap: 13px;

          padding: 14px 17px;

          margin-bottom: 24px;

          border-radius: 12px;

          background:
            rgba(139,92,246,.06);

          border:
            1px solid #302644;

          color: #a9a0b7;

          font-size: 11px;

          line-height: 1.5;
        }


        .notice-icon {
          width: 32px;
          height: 32px;

          min-width: 32px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          background: #211a31;

          border: 1px solid #3b2d55;

          font-size: 14px;
        }


        .notice strong {
          color: #c8b9ed;
          font-weight: 600;
        }


        /* =========================
           SECTION HEADER
        ========================= */

        .section-header {
          display: flex;

          align-items: center;

          justify-content: space-between;

          margin-bottom: 15px;
        }


        .section-title {
          color: #e8e2f0;

          font-size: 15px;

          font-weight: 600;
        }


        .section-count {
          color: #71697d;

          font-size: 10px;
        }


        /* =========================
           COMMUNITY GRID
        ========================= */

        .community-grid {

          display: grid;

          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          gap: 16px;

        }


        /* =========================
           COMMUNITY CARD
        ========================= */

        .community-card {

          position: relative;

          min-width: 0;

          padding: 22px;

          border-radius: 16px;

          background:
            linear-gradient(
              145deg,
              #191526,
              #13101d
            );

          border:
            1px solid #2d263e;

          overflow: hidden;

          transition:
            transform .25s ease,
            border-color .25s ease,
            box-shadow .25s ease;

        }


        .community-card::before {

          content: "";

          position: absolute;

          width: 130px;
          height: 130px;

          right: -65px;
          top: -65px;

          border-radius: 50%;

          background:
            rgba(139,92,246,.08);

          filter: blur(25px);

          transition: .3s;

        }


        .community-card:hover {

          transform:
            translateY(-5px);

          border-color:
            #4a3970;

          box-shadow:
            0 18px 40px
            rgba(0,0,0,.28),
            0 0 25px
            rgba(139,92,246,.06);

        }


        .community-card:hover::before {

          background:
            rgba(139,92,246,.16);

        }


        /* =========================
           TOP
        ========================= */

        .community-top {

          display: flex;

          align-items: flex-start;

          justify-content:
            space-between;

          margin-bottom: 20px;

        }


        .community-icon {

          width: 52px;
          height: 52px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 14px;

          background:
            linear-gradient(
              135deg,
              #251b3b,
              #1b1629
            );

          border:
            1px solid #3c2c5b;

          font-size: 24px;

          box-shadow:
            0 0 22px
            rgba(139,92,246,.08);

        }


        .coming-soon {

          padding: 5px 8px;

          border-radius: 6px;

          background: #211a30;

          border:
            1px solid #372950;

          color: #9d86d5;

          font-size: 8px;

          font-weight: 600;

          letter-spacing: .6px;

          text-transform:
            uppercase;

        }


        /* =========================
           CONTENT
        ========================= */

        .community-card h3 {

          color: #eee9f5;

          font-size: 17px;

          font-weight: 600;

          margin-bottom: 7px;

        }


        .community-description {

          color: #81798d;

          font-size: 11px;

          line-height: 1.65;

          min-height: 38px;

          margin-bottom: 17px;

        }


        /* =========================
           FOOTER
        ========================= */

        .community-footer {

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          padding-top: 14px;

          border-top:
            1px solid #292337;

        }


        .members {

          display: flex;

          align-items: center;

          gap: 7px;

          color: #71697c;

          font-size: 10px;

        }


        .member-icon {

          font-size: 12px;

        }


        /* =========================
           JOIN BUTTON
        ========================= */

        .join-btn {

          border: none;

          padding:
            8px 15px;

          border-radius: 8px;

          background:
            #241b37;

          border:
            1px solid #3b2b59;

          color: #b99be9;

          font-size: 10px;

          font-weight: 600;

          cursor: pointer;

          transition: .2s;

        }


        .join-btn:hover {

          background:
            #302046;

          border-color:
            #5b4383;

          color: #d7c5f7;

        }


        /* =========================
           BOTTOM INFO
        ========================= */

        .community-info {

          margin-top: 22px;

          padding: 18px;

          border-radius: 14px;

          background:
            #15121f;

          border:
            1px solid #292337;

          display: flex;

          align-items: center;

          gap: 14px;

        }


        .info-icon {

          width: 38px;
          height: 38px;

          min-width: 38px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 10px;

          background: #211a32;

          border:
            1px solid #382951;

          font-size: 16px;

        }


        .info-title {

          color: #cfc7da;

          font-size: 11px;

          font-weight: 600;

          margin-bottom: 3px;

        }


        .info-text {

          color: #71697b;

          font-size: 10px;

          line-height: 1.5;

        }


        /* =========================
           RESPONSIVE
        ========================= */

        @media (max-width: 1050px) {

          .community-grid {

            grid-template-columns:
              repeat(2, minmax(0, 1fr));

          }

        }


        @media (max-width: 620px) {

          .community-grid {

            grid-template-columns: 1fr;

          }


          .community-intro {

            padding: 22px;

          }


          .intro-title {

            font-size: 22px;

          }


          .community-card {

            padding: 20px;

          }

        }


      `}</style>


      <div className="communities-page">


        {/* =========================
            INTRO
        ========================= */}

        <div className="community-intro">

          <div className="intro-content">

            <div className="intro-label">

              <span className="intro-dot"></span>

              Community Hub

            </div>


            <div className="intro-title">

              Find people with similar interests

            </div>


            <div className="intro-text">

              Communities bring people together
              around shared topics, ideas and
              everyday decisions.

            </div>

          </div>

        </div>


        {/* =========================
            NOTICE
        ========================= */}

        <div className="notice">

          <div className="notice-icon">
            ✨
          </div>

          <div>

            <strong>Communities are coming soon.</strong>
            {" "}
            These categories are already planned
            and will become available as community
            features are added.

          </div>

        </div>


        {/* =========================
            HEADER
        ========================= */}

        <div className="section-header">

          <div className="section-title">
            Explore Categories
          </div>

          <div className="section-count">
            {categories.length} categories
          </div>

        </div>


        {/* =========================
            CARDS
        ========================= */}

        <div className="community-grid">

          {categories.map(
            (community, index) => (

              <div
                className="community-card"
                key={index}
              >


                <div className="community-top">

                  <div className="community-icon">
                    {community.icon}
                  </div>

                  <div className="coming-soon">
                    Coming soon
                  </div>

                </div>


                <h3>
                  {community.name}
                </h3>


                <div className="community-description">

                  {community.description}

                </div>


                <div className="community-footer">

                  <div className="members">

                    <span className="member-icon">
                      👥
                    </span>

                    {community.members} members

                  </div>


                  <button
                    className="join-btn"
                    disabled
                  >
                    Join
                  </button>

                </div>


              </div>

            )
          )}

        </div>


        {/* =========================
            INFO
        ========================= */}

        <div className="community-info">

          <div className="info-icon">
            💡
          </div>

          <div>

            <div className="info-title">
              What's coming next?
            </div>

            <div className="info-text">

              Community discussions, member
              participation and shared decision
              boards will appear here once the
              community backend is connected.

            </div>

          </div>

        </div>


      </div>

    </DashboardLayout>

  );

}

export default Communities;