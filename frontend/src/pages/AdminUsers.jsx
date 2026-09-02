import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import Toast from "../components/Toast";

const API = "http://localhost:8080";
const ROLES = ["USER", "MODERATOR", "ADMIN"];

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const myEmail = (sessionStorage.getItem("userEmail") || "").toLowerCase();

  const headers = () => ({
    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
  });

  const notify = (text, error = false) => {
    setIsError(error);
    setMessage(text);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (!message) return undefined;

    const timer = setTimeout(() => setMessage(""), 3500);

    return () => clearTimeout(timer);
  }, [message]);

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API}/api/admin/users`, {
        headers: headers(),
      });

      if (!response.ok) {
        throw new Error("Unable to load users.");
      }

      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      notify("Unable to load users.", true);
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (user, nextRole) => {
    if (nextRole === user.role) return;

    setSavingId(user.id);

    try {
      const response = await fetch(
        `${API}/api/admin/users/${user.id}/role`,
        {
          method: "PATCH",
          headers: {
            ...headers(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: nextRole }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to update role.");
      }

      notify(`${user.name}'s role is now ${nextRole}.`);

      setUsers((current) =>
        current.map((u) =>
          u.id === user.id ? { ...u, role: nextRole } : u
        )
      );
    } catch (err) {
      notify(err.message, true);
    } finally {
      setSavingId(null);
    }
  };

  const deleteUser = async (id, name) => {
    const confirmed = window.confirm(
      `Delete ${name}? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: headers(),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete user.");
      }

      notify("User deleted.");

      setUsers((current) => current.filter((u) => u.id !== id));
    } catch (err) {
      notify(err.message, true);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = search.trim().toLowerCase();

    if (!term) return true;

    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term)
    );
  });

  return (
    <DashboardLayout
      pageTitle="Manage Users"
      pageSubtitle="View, search, promote/demote, and remove platform users."
    >
      <Toast message={message} isError={isError} />

      <style>{`
        .admin-users-page {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          box-sizing: border-box;
          padding: 8px 0 40px;
        }

        .admin-back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #b8a7ff;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          margin-bottom: 18px;
          padding: 9px 13px;
          border: 1px solid rgba(139, 92, 246, 0.22);
          border-radius: 12px;
          background: rgba(139, 92, 246, 0.07);
          transition: all 0.22s ease;
        }

        .admin-back-link:hover {
          color: #fff;
          background: rgba(139, 92, 246, 0.16);
          border-color: rgba(167, 139, 250, 0.45);
          transform: translateX(-2px);
        }

        .admin-users-hero {
          position: relative;
          overflow: hidden;
          margin-bottom: 20px;
          padding: 28px 30px;
          border: 1px solid rgba(139, 92, 246, 0.24);
          border-radius: 24px;
          background:
            radial-gradient(circle at 86% 12%, rgba(168, 85, 247, 0.22), transparent 30%),
            radial-gradient(circle at 12% 100%, rgba(59, 130, 246, 0.12), transparent 32%),
            linear-gradient(135deg, rgba(27, 22, 46, 0.98), rgba(16, 14, 30, 0.98));
          box-shadow:
            0 20px 55px rgba(0, 0, 0, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .admin-users-hero::before {
          content: "";
          position: absolute;
          width: 180px;
          height: 180px;
          right: -55px;
          top: -70px;
          border-radius: 50%;
          border: 1px solid rgba(167, 139, 250, 0.16);
          box-shadow:
            0 0 0 22px rgba(167, 139, 250, 0.025),
            0 0 0 44px rgba(167, 139, 250, 0.018);
        }

        .admin-users-hero-content {
          position: relative;
          z-index: 1;
        }

        .admin-users-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 10px;
          color: #a78bfa;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .admin-users-eyebrow-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #a78bfa;
          box-shadow: 0 0 14px rgba(167, 139, 250, 0.8);
        }

        .admin-users-title {
          margin: 0;
          color: #fff;
          font-size: clamp(26px, 3vw, 38px);
          line-height: 1.08;
          letter-spacing: -0.035em;
          font-weight: 600;
        }

        .admin-users-description {
          max-width: 660px;
          margin: 10px 0 0;
          color: #a9a2bd;
          font-size: 13px;
          line-height: 1.7;
          font-weight: 400;
        }

        .admin-users-stats {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 22px;
        }

        .admin-user-stat {
          padding: 15px 17px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.035);
          backdrop-filter: blur(12px);
        }

        .admin-user-stat-label {
          display: block;
          margin-bottom: 6px;
          color: #817b94;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .admin-user-stat-value {
          color: #f8f7ff;
          font-size: 22px;
          line-height: 1;
          font-weight: 500;
        }

        .admin-users-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 16px;
        }

        .admin-search-wrapper {
          position: relative;
          flex: 1;
          margin: 0;
        }

        .admin-search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #777087;
          font-size: 16px;
          pointer-events: none;
        }

        .admin-search {
          width: 100%;
          max-width: none;
          box-sizing: border-box;
          padding: 13px 15px 13px 43px;
          border: 1px solid rgba(139, 92, 246, 0.18);
          border-radius: 14px;
          background: rgba(23, 20, 37, 0.88);
          color: var(--app-text);
          font-size: 13px;
          font-weight: 400;
          outline: none;
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
          transition: all 0.22s ease;
        }

        .admin-search::placeholder {
          color: #706a7e;
        }

        .admin-search:focus {
          border-color: #8b5cf6;
          background: rgba(27, 23, 45, 0.98);
          box-shadow:
            0 0 0 4px rgba(139, 92, 246, 0.1),
            0 12px 35px rgba(0, 0, 0, 0.18);
        }

        .admin-user-results {
          flex-shrink: 0;
          color: #837c91;
          font-size: 12px;
          font-weight: 500;
        }

        .admin-user-results strong {
          color: #c4b5fd;
          font-weight: 600;
        }

        .admin-table-wrapper {
          width: 100%;
          overflow: hidden;
          border: 1px solid rgba(139, 92, 246, 0.15);
          border-radius: 20px;
          background: rgba(20, 17, 32, 0.86);
          box-shadow:
            0 18px 50px rgba(0, 0, 0, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.025);
        }

        .admin-users-table {
          width: 100%;
          min-width: 760px;
          border-collapse: separate;
          border-spacing: 0;
        }

        .admin-users-table th,
        .admin-users-table td {
          text-align: left;
          padding: 17px 18px;
          font-size: 13px;
          font-weight: 400;
          border-bottom: 1px solid rgba(255, 255, 255, 0.055);
          color: var(--app-text);
          vertical-align: middle;
        }

        .admin-users-table th {
          color: #777083;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          background: rgba(255, 255, 255, 0.018);
          white-space: nowrap;
        }

        .admin-users-table th:first-child,
        .admin-users-table td:first-child {
          padding-left: 22px;
        }

        .admin-users-table tbody tr {
          transition: background 0.22s ease;
        }

        .admin-users-table tbody tr:last-child td {
          border-bottom: none;
        }

        .admin-users-table tbody tr:hover {
          background: linear-gradient(
            90deg,
            rgba(139, 92, 246, 0.08),
            rgba(139, 92, 246, 0.025)
          );
        }

        .admin-user-identity {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .admin-user-avatar {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 38px;
          height: 38px;
          border: 1px solid rgba(167, 139, 250, 0.18);
          border-radius: 12px;
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.20),
            rgba(59, 130, 246, 0.08)
          );
          color: #c4b5fd;
          font-size: 13px;
          font-weight: 500;
        }

        .admin-user-name-text {
          min-width: 0;
          color: #f0edf7;
          font-size: 13px;
          font-weight: 500;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .admin-user-email {
          color: #b1aabd;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .admin-role-badge {
          display: inline-flex;
          align-items: center;
          padding: 7px 10px;
          border: 1px solid rgba(139, 92, 246, 0.14);
          border-radius: 10px;
          background: rgba(139, 92, 246, 0.08);
          color: #bcaeff;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.03em;
          text-transform: capitalize;
        }

        .admin-you-badge {
          display: inline-flex;
          align-items: center;
          margin-left: 7px;
          padding: 4px 7px;
          border: 1px solid rgba(96, 165, 250, 0.12);
          border-radius: 999px;
          background: rgba(59, 130, 246, 0.07);
          color: #9fc7ff;
          font-size: 9px;
          font-weight: 500;
          white-space: nowrap;
        }

        .admin-role-select {
          min-width: 112px;
          padding: 8px 30px 8px 10px;
          font-size: 11px;
          font-weight: 400;
          border-radius: 10px;
          border: 1px solid rgba(139, 92, 246, 0.15);
          background: rgba(139, 92, 246, 0.06);
          color: #ddd7ea;
          cursor: pointer;
          outline: none;
          transition: all 0.2s ease;
        }

        .admin-role-select:hover:not(:disabled) {
          border-color: rgba(139, 92, 246, 0.28);
          background: rgba(139, 92, 246, 0.10);
        }

        .admin-role-select:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.09);
        }

        .admin-role-select:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .admin-joined-date {
          color: #a9a2b5;
          font-size: 12px;
        }

        .admin-delete-btn {
          min-width: 74px;
          border: 1px solid rgba(248, 113, 113, 0.18);
          border-radius: 10px;
          background: rgba(239, 68, 68, 0.08);
          color: #f87171;
          padding: 8px 12px;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .admin-delete-btn:hover:not(:disabled) {
          border-color: rgba(248, 113, 113, 0.38);
          background: rgba(239, 68, 68, 0.16);
          color: #fca5a5;
          transform: translateY(-1px);
          box-shadow: 0 7px 20px rgba(239, 68, 68, 0.1);
        }

        .admin-delete-btn:active:not(:disabled) {
          transform: scale(0.97);
        }

        .admin-delete-btn:disabled {
          border-color: rgba(255, 255, 255, 0.06);
          background: rgba(255, 255, 255, 0.025);
          color: #6d6877;
          cursor: not-allowed;
        }

        .admin-empty {
          padding: 38px 20px;
          border: 1px dashed rgba(139, 92, 246, 0.18);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.018);
          color: var(--app-secondary-text);
          font-size: 13px;
          text-align: center;
        }

        .admin-mobile-users {
          display: none;
        }

        .admin-user-card {
          position: relative;
          width: 100%;
          box-sizing: border-box;
          border: 1px solid rgba(139, 92, 246, 0.14);
          border-radius: 18px;
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246, 0.08), transparent 35%),
            rgba(20, 17, 32, 0.9);
          padding: 18px;
          margin-bottom: 12px;
          overflow: hidden;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.14);
        }

        .admin-user-card::before {
          content: "";
          position: absolute;
          left: 0;
          top: 14px;
          bottom: 14px;
          width: 3px;
          border-radius: 0 5px 5px 0;
          background: linear-gradient(180deg, #a78bfa, #6366f1);
          opacity: 0.7;
        }

        .admin-user-card:last-child {
          margin-bottom: 0;
        }

        .admin-user-card-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 15px;
        }

        .admin-user-card-identity {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
          flex: 1;
        }

        .admin-user-name {
          min-width: 0;
          color: #f0edf7;
          font-size: 15px;
          font-weight: 500;
          word-break: break-word;
        }

        .admin-user-email-mobile {
          margin-top: 4px;
          font-size: 11px;
          color: #8f899c;
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        .admin-user-card-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.055);
        }

        .admin-user-card-label {
          flex-shrink: 0;
          color: #777083;
          font-size: 9px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .admin-user-card-value {
          min-width: 0;
          text-align: right;
          color: #d7d1df;
          font-size: 12px;
          font-weight: 400;
          word-break: break-word;
        }

        .admin-mobile-actions {
          margin-top: 11px;
        }

        .admin-mobile-actions .admin-delete-btn {
          width: 100%;
          min-height: 42px;
          box-sizing: border-box;
        }

        @media (max-width: 768px) {
          .admin-users-page {
            max-width: 100%;
          }

          .admin-users-hero {
            padding: 23px 21px;
            border-radius: 20px;
          }

          .admin-users-stats {
            gap: 9px;
          }

          .admin-user-stat {
            padding: 13px;
          }

          .admin-users-toolbar {
            align-items: stretch;
            flex-direction: column;
            gap: 9px;
          }

          .admin-user-results {
            padding-left: 3px;
          }
        }

        @media (max-width: 600px) {
          .admin-users-page {
            padding-bottom: 25px;
          }

          .admin-users-hero {
            padding: 21px 18px;
            margin-bottom: 15px;
          }

          .admin-users-title {
            font-size: 27px;
          }

          .admin-users-description {
            font-size: 12px;
          }

          .admin-users-stats {
            grid-template-columns: 1fr 1fr 1fr;
            margin-top: 17px;
          }

          .admin-user-stat {
            padding: 11px 9px;
            border-radius: 12px;
          }

          .admin-user-stat-label {
            font-size: 8px;
          }

          .admin-user-stat-value {
            font-size: 18px;
          }

          .admin-search {
            padding: 12px 13px 12px 40px;
          }

          .admin-table-wrapper {
            display: none;
          }

          .admin-mobile-users {
            display: block;
          }

          .admin-user-card {
            padding: 17px;
          }

          .admin-user-card-row {
            align-items: center;
          }

          .admin-user-card-value {
            max-width: 68%;
          }

          .admin-role-select {
            min-width: 105px;
          }
        }

        @media (max-width: 380px) {
          .admin-users-stats {
            grid-template-columns: 1fr;
          }

          .admin-user-stat {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .admin-user-stat-label {
            margin-bottom: 0;
          }

          .admin-user-card {
            padding: 14px;
          }

          .admin-user-card-row {
            align-items: flex-start;
            flex-direction: column;
            gap: 7px;
          }

          .admin-user-card-value {
            max-width: 100%;
            width: 100%;
            text-align: left;
          }
        }
      `}</style>

      <div className="admin-users-page">

        <div className="admin-users-hero">
          <div className="admin-users-hero-content">
            <div className="admin-users-eyebrow">
              <span className="admin-users-eyebrow-dot" />
              User control center
            </div>

            <h1 className="admin-users-title">Manage Users</h1>

            <p className="admin-users-description">
              Review accounts, manage access levels, and keep your platform
              secure from one clean moderation workspace.
            </p>

            <div className="admin-users-stats">
              <div className="admin-user-stat">
                <span className="admin-user-stat-label">Total users</span>
                <span className="admin-user-stat-value">{users.length}</span>
              </div>

              <div className="admin-user-stat">
                <span className="admin-user-stat-label">Admins</span>
                <span className="admin-user-stat-value">
                  {users.filter((u) => u.role === "ADMIN").length}
                </span>
              </div>

              <div className="admin-user-stat">
                <span className="admin-user-stat-label">Showing</span>
                <span className="admin-user-stat-value">
                  {filteredUsers.length}
                </span>
              </div>
            </div>
          </div>
        </div>
        <Link className="admin-back-link" to="/admin">
          ← Back to Admin Dashboard
        </Link>

        <div className="admin-users-toolbar">
          <div className="admin-search-wrapper">
            <span className="admin-search-icon">⌕</span>
            <input
              className="admin-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or email..."
              aria-label="Search users by name or email"
            />
          </div>

          <div className="admin-user-results">
            <strong>{filteredUsers.length}</strong>{" "}
            {filteredUsers.length === 1 ? "user" : "users"}
          </div>
        </div>

        {loading && (
          <div className="admin-empty">
            Loading users…
          </div>
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="admin-empty">
            No users found.
          </div>
        )}

        {/* ==========================================
            DESKTOP / TABLET TABLE
        =========================================== */}

        {!loading && filteredUsers.length > 0 && (
          <div className="admin-table-wrapper">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => {
                  const isSelf =
                    user.email?.toLowerCase() === myEmail;

                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="admin-user-identity">
                          <span className="admin-user-avatar">
                            {(user.name || "U").trim().charAt(0).toUpperCase()}
                          </span>
                          <span className="admin-user-name-text">
                            {user.name}
                            {isSelf && (
                              <span className="admin-you-badge">You</span>
                            )}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="admin-user-email">
                          {user.email}
                        </span>
                      </td>

                      <td>
                        <select
                          className="admin-role-select"
                          value={user.role}
                          disabled={
                            isSelf || savingId === user.id
                          }
                          title={
                            isSelf
                              ? "You can't change your own role."
                              : "Change role"
                          }
                          onChange={(event) =>
                            changeRole(
                              user,
                              event.target.value
                            )
                          }
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>
                        <span className="admin-joined-date">
                          {user.createdAt
                            ? new Date(
                                user.createdAt
                              ).toLocaleDateString()
                            : "—"}
                        </span>
                      </td>

                      <td>
                        <button
                          className="admin-delete-btn"
                          disabled={isSelf}
                          title={
                            isSelf
                              ? "You can't delete your own account."
                              : "Delete user"
                          }
                          onClick={() =>
                            deleteUser(
                              user.id,
                              user.name
                            )
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ==========================================
            MOBILE USER CARDS
        =========================================== */}

        {!loading && filteredUsers.length > 0 && (
          <div className="admin-mobile-users">
            {filteredUsers.map((user) => {
              const isSelf =
                user.email?.toLowerCase() === myEmail;

              return (
                <div
                  className="admin-user-card"
                  key={user.id}
                >
                  {/* User name + email */}
                  <div className="admin-user-card-header">
                    <div className="admin-user-card-identity">
                      <span className="admin-user-avatar">
                        {(user.name || "U").trim().charAt(0).toUpperCase()}
                      </span>

                      <div>
                        <div className="admin-user-name">
                          {user.name}

                          {isSelf && (
                            <span className="admin-you-badge">
                              You
                            </span>
                          )}
                        </div>

                        <div className="admin-user-email-mobile">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="admin-user-card-row">
                    <span className="admin-user-card-label">
                      Role
                    </span>

                    <select
                      className="admin-role-select"
                      value={user.role}
                      disabled={
                        isSelf || savingId === user.id
                      }
                      title={
                        isSelf
                          ? "You can't change your own role."
                          : "Change role"
                      }
                      onChange={(event) =>
                        changeRole(
                          user,
                          event.target.value
                        )
                      }
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Joined date */}
                  <div className="admin-user-card-row">
                    <span className="admin-user-card-label">
                      Joined
                    </span>

                    <span className="admin-user-card-value">
                      {user.createdAt
                        ? new Date(
                            user.createdAt
                          ).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="admin-mobile-actions">
                    <button
                      className="admin-delete-btn"
                      disabled={isSelf}
                      title={
                        isSelf
                          ? "You can't delete your own account."
                          : "Delete user"
                      }
                      onClick={() =>
                        deleteUser(
                          user.id,
                          user.name
                        )
                      }
                    >
                      {isSelf
                        ? "Delete Disabled"
                        : "Delete User"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AdminUsers;