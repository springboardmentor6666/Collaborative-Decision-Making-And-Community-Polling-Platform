import DashboardLayout from "../components/DashboardLayout";

function Profile() {

  const email = localStorage.getItem("userEmail") || "Not available";
  const role = localStorage.getItem("role") || "USER";

  const initials = email !== "Not available" ? email.charAt(0).toUpperCase() : "?";

  return (
    <DashboardLayout
      pageTitle="Profile"
      pageSubtitle="Your account details."
    >
      <style>{`

        .profile-card{
          background:white;
          border-radius:16px;
          padding:30px;
          box-shadow:0 1px 4px rgba(0,0,0,.06);
          max-width:480px;
          text-align:center;
        }

        .profile-avatar{
          width:80px;
          height:80px;
          border-radius:50%;
          background:#4f46e5;
          color:white;
          font-size:32px;
          font-weight:700;
          display:flex;
          align-items:center;
          justify-content:center;
          margin:0 auto 18px;
        }

        .profile-field{
          text-align:left;
          padding:14px 0;
          border-bottom:1px solid #f1f2f6;
        }

        .profile-field:last-child{
          border-bottom:none;
        }

        .profile-field-label{
          font-size:12px;
          color:#6b7280;
          text-transform:uppercase;
          letter-spacing:.05em;
        }

        .profile-field-value{
          font-size:15px;
          color:#111827;
          font-weight:600;
          margin-top:4px;
        }

        .role-badge{
          display:inline-block;
          margin-top:6px;
          padding:4px 12px;
          border-radius:20px;
          background:#eef2ff;
          color:#4338ca;
          font-size:12px;
          font-weight:700;
          text-transform:capitalize;
        }

      `}</style>

      <div className="profile-card">

        <div className="profile-avatar">{initials}</div>

        <div className="profile-field">
          <div className="profile-field-label">Email</div>
          <div className="profile-field-value">{email}</div>
        </div>

        <div className="profile-field">
          <div className="profile-field-label">Role</div>
          <div className="role-badge">{role.toLowerCase()}</div>
        </div>

      </div>

    </DashboardLayout>
  );
}

export default Profile;