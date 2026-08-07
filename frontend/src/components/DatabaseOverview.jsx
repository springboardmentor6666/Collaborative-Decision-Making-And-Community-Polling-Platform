import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

function DatabaseOverview() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/dashboard`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load database records.");
        return data;
      })
      .then(setDashboard)
      .catch((requestError) => setError(requestError.message));
  }, []);

  if (error) {
    return <main className="database-overview"><h1>Database Overview</h1><p className="database-error">{error}</p></main>;
  }

  if (!dashboard) {
    return <main className="database-overview"><h1>Database Overview</h1><p>Loading records…</p></main>;
  }

  return (
    <main className="database-overview">
      <h1>Database Overview</h1>
      <p>Live records from PostgreSQL ({dashboard.schemaVersion} schema).</p>

      <section className="database-summary" aria-label="Database record counts">
        {Object.entries(dashboard.summary).map(([table, count]) => (
          <article className="database-stat" key={table}>
            <span>{table.replace("_", " ")}</span>
            <strong>{count}</strong>
          </article>
        ))}
      </section>

      <DataTable title="Users" rows={dashboard.users} columns={["id", "name", "email", "role", "created_at"]} />
      <DataTable title="Decisions" rows={dashboard.decisions} columns={["id", "title", "category", "status", "visibility", "created_at"]} />
      <DataTable title="Options" rows={dashboard.options} columns={["option_id", "decision_id", "option_title", "score", "ranking"]} />
    </main>
  );
}

function DataTable({ title, rows, columns }) {
  return (
    <section className="database-table-section">
      <h2>{title}</h2>
      <div className="database-table-scroll">
        <table>
          <thead><tr>{columns.map((column) => <th key={column}>{column.replaceAll("_", " ")}</th>)}</tr></thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${title}-${index}`}>{columns.map((column) => <td key={column}>{row[column] ?? "—"}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default DatabaseOverview;
