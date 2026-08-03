import DashboardLayout from "../components/DashboardLayout";

function Communities() {

  const categories = [
    { name: "Career", icon: "💼", members: 0 },
    { name: "Education", icon: "🎓", members: 0 },
    { name: "Technology", icon: "💻", members: 0 },
    { name: "Travel", icon: "✈️", members: 0 },
    { name: "Finance", icon: "💰", members: 0 },
    { name: "Lifestyle", icon: "🌿", members: 0 }
  ];

  return (
    <DashboardLayout
      pageTitle="Communities"
      pageSubtitle="Join category-based groups and collaborate with others."
    >
      <style>{`

        .community-grid{
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
          gap:20px;
        }

        .community-card{
          background:white;
          border-radius:16px;
          padding:24px;
          box-shadow:0 1px 4px rgba(0,0,0,.06);
          text-align:center;
        }

        .community-icon{
          font-size:34px;
          margin-bottom:12px;
        }

        .community-card h3{
          color:#111827;
          margin-bottom:6px;
        }

        .community-card p{
          font-size:13px;
          color:#6b7280;
          margin-bottom:16px;
        }

        .join-btn{
          background:#eef2ff;
          color:#4338ca;
          border:none;
          padding:8px 20px;
          border-radius:8px;
          font-weight:600;
          cursor:pointer;
          font-size:13px;
        }

        .notice{
          background:#fffbeb;
          border:1px solid #fde68a;
          color:#92400e;
          padding:14px 18px;
          border-radius:12px;
          margin-bottom:24px;
          font-size:13px;
        }

      `}</style>

      <div className="notice">
        Community creation and membership are coming Soon —
        these are the planned category groups.
      </div>

      <div className="community-grid">
        {categories.map((c, i) => (
          <div className="community-card" key={i}>
            <div className="community-icon">{c.icon}</div>
            <h3>{c.name}</h3>
            <p>{c.members} members</p>
            <button className="join-btn">Join</button>
          </div>
        ))}
      </div>

    </DashboardLayout>
  );
}

export default Communities;