import DashboardLayout from "../components/DashboardLayout";

function Profile() {

  const email =
    localStorage.getItem("userEmail") || "Not available";

  const role =
    localStorage.getItem("role") || "USER";

  const initials =
    email !== "Not available"
      ? email.charAt(0).toUpperCase()
      : "?";


  return (
    <DashboardLayout
      pageTitle="Profile"
      pageSubtitle="Manage and view your account information."
    >

      <style>{`

        /* =========================
           PROFILE PAGE
        ========================= */

        .profile-page {
          width: 100%;
          min-height: calc(100vh - 100px);

          padding: 5px 0 40px;

          color: #f8fafc;
        }


        /* =========================
           PROFILE LAYOUT
        ========================= */

        .profile-container {

          width: 100%;

          max-width: 900px;

          display: grid;

          grid-template-columns:
            280px 1fr;

          gap: 20px;

          align-items: stretch;
        }


        /* =========================
           PROFILE INTRO CARD
        ========================= */

        .profile-intro {

          background: #15121f;

          border:
            1px solid #2d2840;

          border-radius: 16px;

          padding: 30px 24px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          text-align: center;

          min-height: 330px;
        }


        /* =========================
           AVATAR
        ========================= */

        .profile-avatar {

          width: 88px;
          height: 88px;

          border-radius: 50%;

          background:
            #6d3dcc;

          border:
            3px solid #8b5cf6;

          color: white;

          font-size: 32px;

          font-weight: 700;

          display: flex;

          align-items: center;

          justify-content: center;

          margin-bottom: 18px;

          box-shadow:
            0 8px 25px
            rgba(109, 61, 204, 0.25);
        }


        .profile-title {

          color: #f5f2f9;

          font-size: 20px;

          font-weight: 600;

          margin-bottom: 7px;
        }


        .profile-subtitle {

          color: #918a9f;

          font-size: 13px;

          line-height: 1.5;

          max-width: 210px;
        }


        /* =========================
           ACCOUNT DETAILS CARD
        ========================= */

        .account-card {

          background: #15121f;

          border:
            1px solid #2d2840;

          border-radius: 16px;

          padding: 28px;
        }


        .account-header {

          padding-bottom: 18px;

          margin-bottom: 5px;

          border-bottom:
            1px solid #292433;
        }


        .account-header h2 {

          color: #f3f0f7;

          font-size: 18px;

          font-weight: 600;

          margin-bottom: 5px;
        }


        .account-header p {

          color: #898192;

          font-size: 12px;
        }


        /* =========================
           ACCOUNT FIELD
        ========================= */

        .profile-field {

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;

          padding: 20px 0;

          border-bottom:
            1px solid #292433;
        }


        .profile-field:last-child {

          border-bottom: none;
        }


        .field-left {

          display: flex;

          align-items: center;

          gap: 13px;

          min-width: 0;
        }


        .field-icon {

          width: 38px;

          height: 38px;

          min-width: 38px;

          border-radius: 9px;

          background: #211a32;

          border:
            1px solid #493773;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 16px;
        }


        .field-label {

          color: #81798e;

          font-size: 11px;

          text-transform: uppercase;

          letter-spacing: .06em;

          margin-bottom: 4px;
        }


        .field-value {

          color: #ddd6e8;

          font-size: 14px;

          font-weight: 500;

          word-break: break-word;
        }


        /* =========================
           ROLE BADGE
        ========================= */

        .role-badge {

          display: inline-flex;

          align-items: center;

          gap: 7px;

          padding:
            6px 11px;

          border-radius: 7px;

          background: #211a32;

          border:
            1px solid #493773;

          color: #c4b5fd;

          font-size: 11px;

          font-weight: 600;

          text-transform: capitalize;
        }


        .role-dot {

          width: 6px;

          height: 6px;

          border-radius: 50%;

          background: #a78bfa;
        }


        /* =========================
           ACCOUNT STATUS
        ========================= */

        .account-status {

          margin-top: 22px;

          padding: 12px 14px;

          border-radius: 8px;

          background: #10251d;

          border:
            1px solid #235c43;

          color: #86efac;

          font-size: 12px;

          display: flex;

          align-items: center;

          gap: 8px;
        }


        .status-dot {

          width: 7px;

          height: 7px;

          border-radius: 50%;

          background: #34d399;
        }


        /* =========================
           RESPONSIVE
        ========================= */

        @media (max-width: 800px) {

          .profile-container {

            grid-template-columns: 1fr;

            max-width: 600px;
          }


          .profile-intro {

            min-height: auto;

            padding: 28px;
          }

        }


        @media (max-width: 500px) {

          .account-card {

            padding: 20px;
          }


          .profile-intro {

            padding: 24px 18px;
          }


          .profile-field {

            align-items: flex-start;

            flex-direction: column;

            gap: 10px;
          }


          .field-left {

            width: 100%;
          }

        }

      `}</style>


      <div className="profile-page">

        <div className="profile-container">


          {/* =========================
              PROFILE INTRO
          ========================= */}

          <div className="profile-intro">

            <div className="profile-avatar">
              {initials}
            </div>

            <div className="profile-title">
              Account Profile
            </div>

            <div className="profile-subtitle">
              Your account information and
              access details.
            </div>

          </div>


          {/* =========================
              ACCOUNT DETAILS
          ========================= */}

          <div className="account-card">

            <div className="account-header">

              <h2>
                Account Information
              </h2>

              <p>
                Your current account details
              </p>

            </div>


            {/* EMAIL */}

            <div className="profile-field">

              <div className="field-left">

                <div className="field-icon">
                  ✉️
                </div>

                <div>

                  <div className="field-label">
                    Email Address
                  </div>

                  <div className="field-value">
                    {email}
                  </div>

                </div>

              </div>

            </div>


            {/* ROLE */}

            <div className="profile-field">

              <div className="field-left">

                <div className="field-icon">
                  🛡️
                </div>

                <div>

                  <div className="field-label">
                    Account Role
                  </div>

                  <div className="field-value">

                    <span className="role-badge">

                      <span className="role-dot"></span>

                      {role.toLowerCase()}

                    </span>

                  </div>

                </div>

              </div>

            </div>


            {/* STATUS */}

            <div className="account-status">

              <span className="status-dot"></span>

              Account is active

            </div>

          </div>


        </div>

      </div>

    </DashboardLayout>
  );
}

export default Profile;