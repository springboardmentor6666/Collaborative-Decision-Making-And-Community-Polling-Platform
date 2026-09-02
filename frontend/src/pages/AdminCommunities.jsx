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
      const response = await fetch(
        `${API}/api/admin/communities/${id}`,
        {
          method: "DELETE",
          headers: headers(),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to delete community."
        );
      }

      notify("Community deleted.");

      setCommunities((current) =>
        current.filter((c) => c.id !== id)
      );

      if (expandedId === id) {
        setExpandedId(null);
      }
    } catch (err) {
      notify(err.message, true);
    }
  };

  const toggleCommunity = (id) => {
    setExpandedId((current) =>
      current === id ? null : id
    );
  };

  const filteredCommunities = communities.filter((c) => {
    const term = search.trim().toLowerCase();

    if (!term) return true;

    return (
      c.communityName?.toLowerCase().includes(term) ||
      c.ownerName?.toLowerCase().includes(term)
    );
  });

  /* =====================================================
     MEMBERS CONTENT
  ===================================================== */

  const MembersList = ({ community }) => {
    if (community.memberNames?.length) {
      return (
        <div className="admin-members-list">
          {community.memberNames.map((name, index) => (
            <span
              className="admin-member-chip"
              key={`${name}-${index}`}
            >
              {name}
            </span>
          ))}
        </div>
      );
    }

    return (
      <div className="admin-empty">
        No members yet.
      </div>
    );
  };

  return (
    <DashboardLayout
      pageTitle="Manage Communities"
      pageSubtitle="View members, moderate, and remove communities."
    >
      <Toast message={message} isError={isError} />

      <style>{`
        /* =====================================================
           MAIN PAGE
        ===================================================== */

        .admin-communities-page {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          box-sizing: border-box;
        }

        /* =====================================================
           BACK LINK
        ===================================================== */

        .admin-back-link {
          display: inline-block;
          color: #8b5cf6;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          margin-bottom: 16px;
          transition: color 0.2s ease;
        }

        .admin-back-link:hover {
          color: #a855f7;
        }

        /* =====================================================
           SEARCH
        ===================================================== */

        .admin-search-wrapper {
          width: 100%;
          margin-bottom: 18px;
        }

        .admin-search {
          display: block;
          width: 100%;
          max-width: 360px;
          box-sizing: border-box;
          padding: 11px 13px;
          border: 1px solid var(--app-border);
          border-radius: 9px;
          background: var(--app-card-2);
          color: var(--app-text);
          font-size: 13px;
          outline: none;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .admin-search::placeholder {
          color: var(--app-secondary-text);
        }

        .admin-search:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12);
        }

        /* =====================================================
           DESKTOP TABLE
        ===================================================== */

        .admin-table-wrapper {
          width: 100%;
          overflow-x: auto;
          border: 1px solid var(--app-border);
          border-radius: 12px;
          background: var(--app-card);
          -webkit-overflow-scrolling: touch;
        }

        .admin-communities-table {
          width: 100%;
          min-width: 650px;
          border-collapse: collapse;
        }

        .admin-communities-table th,
        .admin-communities-table td {
          text-align: left;
          padding: 13px 14px;
          font-size: 13px;
          border-bottom: 1px solid var(--app-border);
          color: var(--app-text);
        }

        .admin-communities-table th {
          color: var(--app-secondary-text);
          font-weight: 700;
          background: var(--app-card-2);
          white-space: nowrap;
        }

        .admin-communities-table tbody tr:last-child td {
          border-bottom: none;
        }

        .admin-community-row {
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .admin-community-row:hover {
          background: rgba(139, 92, 246, 0.04);
        }

        /* =====================================================
           BADGE
        ===================================================== */

        .admin-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 30px;
          padding: 4px 9px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          background: rgba(139, 92, 246, 0.12);
          color: #8b5cf6;
          white-space: nowrap;
        }

        /* =====================================================
           DELETE BUTTON
        ===================================================== */

        .admin-delete-btn {
          border: 0;
          border-radius: 7px;
          background: #b91c1c;
          color: #fff;
          padding: 7px 11px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition:
            background 0.2s ease,
            transform 0.1s ease;
        }

        .admin-delete-btn:hover {
          background: #dc2626;
        }

        .admin-delete-btn:active {
          transform: scale(0.97);
        }

        /* =====================================================
           EMPTY
        ===================================================== */

        .admin-empty {
          color: var(--app-secondary-text);
          font-size: 13px;
          padding: 10px 0;
        }

        /* =====================================================
           DESKTOP MEMBERS PANEL
        ===================================================== */

        .admin-members-panel {
          background: var(--app-card-2);
        }

        .admin-members-panel td {
          padding: 16px 20px;
        }

        .admin-members-list {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .admin-member-chip {
          display: inline-flex;
          align-items: center;
          max-width: 100%;
          box-sizing: border-box;
          padding: 5px 10px;
          border-radius: 20px;
          background: var(--app-card);
          border: 1px solid var(--app-border);
          font-size: 12px;
          color: var(--app-text);
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        /* =====================================================
           MOBILE COMMUNITY CARDS
        ===================================================== */

        .admin-mobile-communities {
          display: none;
        }

        .admin-community-card {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid var(--app-border);
          border-radius: 12px;
          background: var(--app-card);
          margin-bottom: 12px;
          overflow: hidden;
        }

        .admin-community-card:last-child {
          margin-bottom: 0;
        }

        .admin-community-card-main {
          padding: 15px;
        }

        .admin-community-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .admin-community-name {
          flex: 1;
          min-width: 0;
          font-size: 15px;
          line-height: 1.4;
          font-weight: 700;
          color: var(--app-text);
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .admin-expand-icon {
          flex-shrink: 0;
          width: 29px;
          height: 29px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          background: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
          font-size: 15px;
          font-weight: 700;
        }

        .admin-community-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 15px;
          padding-top: 13px;
          border-top: 1px solid var(--app-border);
        }

        .admin-info-item {
          min-width: 0;
        }

        .admin-info-label {
          display: block;
          margin-bottom: 4px;
          font-size: 10px;
          font-weight: 700;
          color: var(--app-secondary-text);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .admin-info-value {
          display: block;
          font-size: 12px;
          color: var(--app-text);
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .admin-mobile-delete {
          width: 100%;
          min-height: 40px;
          margin-top: 15px;
        }

        /* =====================================================
           MOBILE MEMBERS SECTION
        ===================================================== */

        .admin-mobile-members {
          padding: 0 15px 15px;
          border-top: 1px solid var(--app-border);
          background: var(--app-card-2);
        }

        .admin-mobile-members-title {
          padding-top: 14px;
          margin-bottom: 9px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--app-secondary-text);
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 768px) {
          .admin-communities-page {
            max-width: 100%;
          }

          .admin-search {
            max-width: 100%;
          }

          .admin-table-wrapper {
            border-radius: 10px;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 600px) {
          .admin-back-link {
            font-size: 12px;
            margin-bottom: 14px;
          }

          .admin-search-wrapper {
            margin-bottom: 14px;
          }

          .admin-search {
            max-width: 100%;
            padding: 12px 13px;
            font-size: 13px;
          }

          /* Hide desktop table */
          .admin-table-wrapper {
            display: none;
          }

          /* Show mobile cards */
          .admin-mobile-communities {
            display: block;
          }

          .admin-community-card-main {
            padding: 14px;
          }

          .admin-community-name {
            font-size: 14px;
          }

          .admin-community-info {
            grid-template-columns: 1fr 1fr;
          }

          .admin-mobile-delete {
            min-height: 42px;
          }

          .admin-mobile-members {
            padding-left: 14px;
            padding-right: 14px;
          }

          .admin-member-chip {
            font-size: 11px;
            padding: 5px 9px;
          }
        }

        /* =====================================================
           VERY SMALL PHONES
        ===================================================== */

        @media (max-width: 380px) {
          .admin-community-card-main {
            padding: 12px;
          }

          .admin-community-info {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .admin-mobile-members {
            padding-left: 12px;
            padding-right: 12px;
          }

          .admin-members-list {
            gap: 6px;
          }

          .admin-member-chip {
            max-width: 100%;
          }
        }
      `}</style>

      <div className="admin-communities-page">
        {/* BACK */}
        <Link
          className="admin-back-link"
          to="/admin"
        >
          ← Back to Admin Dashboard
        </Link>

        {/* SEARCH */}
        <div className="admin-search-wrapper">
          <input
            className="admin-search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by community name or owner"
            aria-label="Search communities"
          />
        </div>

        {/* LOADING */}
        {loading && (
          <div className="admin-empty">
            Loading communities…
          </div>
        )}

        {/* NO RESULTS */}
        {!loading &&
          filteredCommunities.length === 0 && (
            <div className="admin-empty">
              No communities found.
            </div>
          )}

        {/* =====================================================
            DESKTOP / TABLET TABLE
        ===================================================== */}

        {!loading &&
          filteredCommunities.length > 0 && (
            <div className="admin-table-wrapper">
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
                  {filteredCommunities.map((community) => {
                    const isExpanded =
                      expandedId === community.id;

                    return (
                      <>
                        <tr
                          key={`row-${community.id}`}
                          className="admin-community-row"
                          onClick={() =>
                            toggleCommunity(community.id)
                          }
                        >
                          <td>
                            {community.communityName}
                          </td>

                          <td>
                            {community.ownerName || "—"}
                          </td>

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

                        {isExpanded && (
                          <tr
                            key={`members-${community.id}`}
                            className="admin-members-panel"
                          >
                            <td colSpan={4}>
                              <MembersList
                                community={community}
                              />
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        {/* =====================================================
            MOBILE COMMUNITY CARDS
        ===================================================== */}

        {!loading &&
          filteredCommunities.length > 0 && (
            <div className="admin-mobile-communities">
              {filteredCommunities.map((community) => {
                const isExpanded =
                  expandedId === community.id;

                return (
                  <div
                    className="admin-community-card"
                    key={community.id}
                  >
                    {/* CARD MAIN */}
                    <div
                      className="admin-community-card-main"
                      onClick={() =>
                        toggleCommunity(community.id)
                      }
                    >
                      <div className="admin-community-card-header">
                        <div className="admin-community-name">
                          {community.communityName}
                        </div>

                        <div className="admin-expand-icon">
                          {isExpanded ? "−" : "+"}
                        </div>
                      </div>

                      <div className="admin-community-info">
                        <div className="admin-info-item">
                          <span className="admin-info-label">
                            Owner
                          </span>

                          <span className="admin-info-value">
                            {community.ownerName || "—"}
                          </span>
                        </div>

                        <div className="admin-info-item">
                          <span className="admin-info-label">
                            Members
                          </span>

                          <span className="admin-info-value">
                            <span className="admin-badge">
                              {community.memberCount}
                            </span>
                          </span>
                        </div>
                      </div>

                      <button
                        className="admin-delete-btn admin-mobile-delete"
                        onClick={(event) => {
                          event.stopPropagation();

                          deleteCommunity(
                            community.id,
                            community.communityName
                          );
                        }}
                      >
                        Delete Community
                      </button>
                    </div>

                    {/* MOBILE MEMBERS */}
                    {isExpanded && (
                      <div className="admin-mobile-members">
                        <div className="admin-mobile-members-title">
                          Members
                        </div>

                        <MembersList
                          community={community}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </DashboardLayout>
  );
}

export default AdminCommunities;