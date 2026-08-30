import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import Toast from "../components/Toast";

const API = "http://localhost:8080";

function AdminCommunities() {
  const [communities, setCommunities] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const headers = () => ({
    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
  });

  const notify = (text, error = false) => {
    setIsError(error);
    setMessage(text);
  };

  useEffect(() => {
    loadCommunities();
  }, []);

  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => setMessage(""), 3500);
    return () => clearTimeout(timer);
  }, [message]);

  const loadCommunities = async () => {
    try {
      const response = await fetch(`${API}/api/admin/communities`, {
        headers: headers(),
      });

      if (!response.ok) {
        throw new Error("Unable to load communities.");
      }

      const data = await response.json();
      setCommunities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      notify("Unable to load communities.", true);
    } finally {
      setLoading(false);
    }
  };

  const deleteCommunity = async (id, name) => {
    const confirmed = window.confirm(
      `Delete "${name}"? This will also remove its decisions and polls.`
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`${API}/api/admin/communities/${id}`, {
        method: "DELETE",
        headers: headers(),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete community.");
      }

      notify("Community deleted.");
      setCommunities((current) => current.filter((c) => c.id !== id));
    } catch (err) {
      notify(err.message, true);
    }
  };

  const filteredCommunities = communities.filter((c) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      c.communityName?.toLowerCase().includes(term) ||
      c.ownerName?.toLowerCase().includes(term)
    );
  });

  return (
    <DashboardLayout
      pageTitle="Manage Communities"
      pageSubtitle="View members, moderate, and remove communities."
    >
      <Toast message={message} isError={isError} />

      <style>{`
        .admin-communities-page { max-width: 1100px; }
        .admin-back-link {
          display: inline-block;
          color: #8b5cf6;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          margin-bottom: 16px;
        }
        .admin-search {
          width: 100%;
          max-width: 320px;
          padding: 10px 12px;
          border: 1px solid var(--app-border);
          border-radius: 8px;
          background: var(--app-card-2);
          color: var(--app-text);
          margin-bottom: 18px;
        }
        .admin-communities-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid var(--app-border);
          border-radius: 12px;
          overflow: hidden;
        }
        .admin-communities-table th, .admin-communities-table td {
          text-align: left;
          padding: 12px 14px;
          font-size: 13px;
          border-bottom: 1px solid var(--app-border);
          color: var(--app-text);
        }
        .admin-communities-table th {
          color: var(--app-secondary-text);
          font-weight: 700;
          background: var(--app-card-2);
        }
        .admin-community-row { cursor: pointer; }
        .admin-community-row:hover { background: var(--app-card-2); }
        .admin-badge {
          padding: 3px 9px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          background: rgba(139, 92, 246, .12);
          color: #8b5cf6;
        }
        .admin-delete-btn {
          border: 0;
          border-radius: 7px;
          background: #b91c1c;
          color: #fff;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }
        .admin-empty {
          color: var(--app-secondary-text);
          font-size: 13px;
        }
        .admin-members-panel { background: var(--app-card-2); }
        .admin-members-panel td { padding: 14px 20px; }
        .admin-member-chip {
          display: inline-block;
          padding: 4px 10px;
          margin: 3px 6px 3px 0;
          border-radius: 20px;
          background: var(--app-card);
          border: 1px solid var(--app-border);
          font-size: 12px;
          color: var(--app-text);
        }
      `}</style>

      <div className="admin-communities-page">
        <Link className="admin-back-link" to="/admin">
          ← Back to Admin Dashboard
        </Link>

        <input
          className="admin-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by community name or owner"
        />

        {loading && <div className="admin-empty">Loading communities…</div>}

        {!loading && filteredCommunities.length === 0 && (
          <div className="admin-empty">No communities found.</div>
        )}

        {!loading && filteredCommunities.length > 0 && (
          <table className="admin-communities-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Owner</th>
                <th>Members</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredCommunities.map((community) => (
                <>
                  <tr
                    key={community.id}
                    className="admin-community-row"
                    onClick={() =>
                      setExpandedId((current) =>
                        current === community.id ? null : community.id
                      )
                    }
                  >
                    <td>{community.communityName}</td>
                    <td>{community.ownerName || "—"}</td>
                    <td>
                      <span className="admin-badge">
                        {community.memberCount}
                      </span>
                    </td>
                    <td>
                      <button
                        className="admin-delete-btn"
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteCommunity(
                            community.id,
                            community.communityName
                          );
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>

                  {expandedId === community.id && (
                    <tr className="admin-members-panel">
                      <td colSpan={4}>
                        {community.memberNames?.length ? (
                          community.memberNames.map((name) => (
                            <span className="admin-member-chip" key={name}>
                              {name}
                            </span>
                          ))
                        ) : (
                          <div className="admin-empty">No members yet.</div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AdminCommunities;