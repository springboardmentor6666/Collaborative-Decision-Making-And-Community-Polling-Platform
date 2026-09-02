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
        /* ================================
           MAIN CONTAINER
        ================================= */

        .admin-users-page {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
        }

        /* ================================
           BACK LINK
        ================================= */

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

        /* ================================
           SEARCH
        ================================= */

        .admin-search-wrapper {
          width: 100%;
          margin-bottom: 18px;
        }

        .admin-search {
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

        /* ================================
           TABLE CONTAINER
        ================================= */

        .admin-table-wrapper {
          width: 100%;
          overflow-x: auto;
          border: 1px solid var(--app-border);
          border-radius: 12px;
          background: var(--app-card);
          -webkit-overflow-scrolling: touch;
        }

        .admin-users-table {
          width: 100%;
          min-width: 700px;
          border-collapse: collapse;
        }

        .admin-users-table th,
        .admin-users-table td {
          text-align: left;
          padding: 13px 14px;
          font-size: 13px;
          border-bottom: 1px solid var(--app-border);
          color: var(--app-text);
        }

        .admin-users-table th {
          color: var(--app-secondary-text);
          font-weight: 700;
          background: var(--app-card-2);
          white-space: nowrap;
        }

        .admin-users-table tbody tr:last-child td {
          border-bottom: none;
        }

        .admin-users-table tbody tr {
          transition: background 0.2s ease;
        }

        .admin-users-table tbody tr:hover {
          background: rgba(139, 92, 246, 0.04);
        }

        /* ================================
           ROLE BADGE
        ================================= */

        .admin-role-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 9px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          background: rgba(139, 92, 246, 0.12);
          color: #8b5cf6;
        }

        /* ================================
           YOU BADGE
        ================================= */

        .admin-you-badge {
          display: inline-flex;
          align-items: center;
          margin-left: 8px;
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          background: var(--app-card-2);
          color: var(--app-secondary-text);
          white-space: nowrap;
        }

        /* ================================
           ROLE SELECT
        ================================= */

        .admin-role-select {
          width: auto;
          min-width: 105px;
          padding: 7px 9px;
          font-size: 12px;
          font-weight: 700;
          border-radius: 7px;
          border: 1px solid var(--app-border);
          background: var(--app-card-2);
          color: var(--app-text);
          cursor: pointer;
          outline: none;
        }

        .admin-role-select:focus {
          border-color: #8b5cf6;
        }

        .admin-role-select:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ================================
           DELETE BUTTON
        ================================= */

        .admin-delete-btn {
          border: 0;
          border-radius: 7px;
          background: #b91c1c;
          color: #fff;
          padding: 7px 11px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition:
            background 0.2s ease,
            transform 0.1s ease;
        }

        .admin-delete-btn:hover:not(:disabled) {
          background: #dc2626;
        }

        .admin-delete-btn:active:not(:disabled) {
          transform: scale(0.97);
        }

        .admin-delete-btn:disabled {
          background: var(--app-card-2);
          color: var(--app-secondary-text);
          cursor: not-allowed;
        }

        /* ================================
           EMPTY / LOADING
        ================================= */

        .admin-empty {
          color: var(--app-secondary-text);
          font-size: 13px;
          padding: 18px 0;
        }

        /* ================================
           MOBILE USER CARDS
        ================================= */

        .admin-mobile-users {
          display: none;
        }

        .admin-user-card {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid var(--app-border);
          border-radius: 12px;
          background: var(--app-card);
          padding: 15px;
          margin-bottom: 12px;
        }

        .admin-user-card:last-child {
          margin-bottom: 0;
        }

        .admin-user-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        .admin-user-name {
          min-width: 0;
          font-size: 15px;
          font-weight: 700;
          color: var(--app-text);
          word-break: break-word;
        }

        .admin-user-email {
          margin-top: 4px;
          font-size: 12px;
          color: var(--app-secondary-text);
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        .admin-user-card-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 0;
          border-top: 1px solid var(--app-border);
        }

        .admin-user-card-label {
          flex-shrink: 0;
          font-size: 11px;
          font-weight: 700;
          color: var(--app-secondary-text);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .admin-user-card-value {
          min-width: 0;
          text-align: right;
          font-size: 12px;
          color: var(--app-text);
          word-break: break-word;
        }

        .admin-mobile-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 10px;
        }

        .admin-mobile-actions .admin-role-select,
        .admin-mobile-actions .admin-delete-btn {
          width: 100%;
          min-height: 40px;
          box-sizing: border-box;
        }

        /* ================================
           TABLET
        ================================= */

        @media (max-width: 768px) {
          .admin-users-page {
            max-width: 100%;
          }

          .admin-search {
            max-width: 100%;
          }

          .admin-table-wrapper {
            border-radius: 10px;
          }
        }

        /* ================================
           MOBILE
        ================================= */

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
          .admin-mobile-users {
            display: block;
          }

          .admin-user-card {
            padding: 14px;
          }

          .admin-user-card-header {
            gap: 8px;
          }

          .admin-user-name {
            font-size: 14px;
          }

          .admin-user-card-row {
            align-items: center;
          }

          .admin-user-card-value {
            max-width: 65%;
          }

          .admin-mobile-actions {
            grid-template-columns: 1fr;
          }

          .admin-mobile-actions .admin-role-select,
          .admin-mobile-actions .admin-delete-btn {
            min-height: 42px;
          }
        }

        /* ================================
           VERY SMALL PHONES
        ================================= */

        @media (max-width: 380px) {
          .admin-user-card {
            padding: 12px;
          }

          .admin-user-card-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }

          .admin-user-card-value {
            max-width: 100%;
            width: 100%;
            text-align: left;
          }
        }
      `}</style>

      <div className="admin-users-page">
        <Link className="admin-back-link" to="/admin">
          ← Back to Admin Dashboard
        </Link>

        <div className="admin-search-wrapper">
          <input
            className="admin-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email"
            aria-label="Search users by name or email"
          />
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
                        {user.name}

                        {isSelf && (
                          <span className="admin-you-badge">
                            You
                          </span>
                        )}
                      </td>

                      <td>{user.email}</td>

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
                        {user.createdAt
                          ? new Date(
                              user.createdAt
                            ).toLocaleDateString()
                          : "—"}
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
                    <div>
                      <div className="admin-user-name">
                        {user.name}

                        {isSelf && (
                          <span className="admin-you-badge">
                            You
                          </span>
                        )}
                      </div>

                      <div className="admin-user-email">
                        {user.email}
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