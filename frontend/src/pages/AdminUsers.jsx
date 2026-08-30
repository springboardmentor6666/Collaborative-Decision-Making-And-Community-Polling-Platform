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
        .admin-users-page { max-width: 1100px; }
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
        .admin-users-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid var(--app-border);
          border-radius: 12px;
          overflow: hidden;
        }
        .admin-users-table th, .admin-users-table td {
          text-align: left;
          padding: 12px 14px;
          font-size: 13px;
          border-bottom: 1px solid var(--app-border);
          color: var(--app-text);
        }
        .admin-users-table th {
          color: var(--app-secondary-text);
          font-weight: 700;
          background: var(--app-card-2);
        }
        .admin-role-badge {
          padding: 3px 9px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          background: rgba(139, 92, 246, .12);
          color: #8b5cf6;
        }
        .admin-you-badge {
          margin-left: 8px;
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          background: var(--app-card-2);
          color: var(--app-secondary-text);
        }
        .admin-role-select {
          padding: 6px 8px;
          font-size: 12px;
          font-weight: 700;
          border-radius: 7px;
          border: 1px solid var(--app-border);
          background: var(--app-card-2);
          color: var(--app-text);
          cursor: pointer;
        }
        .admin-role-select:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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
        .admin-delete-btn:disabled {
          background: var(--app-card-2);
          color: var(--app-secondary-text);
          cursor: not-allowed;
        }
        .admin-empty {
          color: var(--app-secondary-text);
          font-size: 13px;
        }
      `}</style>

      <div className="admin-users-page">
        <Link className="admin-back-link" to="/admin">
          ← Back to Admin Dashboard
        </Link>

        <input
          className="admin-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or email"
        />

        {loading && <div className="admin-empty">Loading users…</div>}

        {!loading && filteredUsers.length === 0 && (
          <div className="admin-empty">No users found.</div>
        )}

        {!loading && filteredUsers.length > 0 && (
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
                        <span className="admin-you-badge">You</span>
                      )}
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        className="admin-role-select"
                        value={user.role}
                        disabled={isSelf || savingId === user.id}
                        title={
                          isSelf
                            ? "You can't change your own role."
                            : "Change role"
                        }
                        onChange={(event) =>
                          changeRole(user, event.target.value)
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
                        ? new Date(user.createdAt).toLocaleDateString()
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
                        onClick={() => deleteUser(user.id, user.name)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AdminUsers;