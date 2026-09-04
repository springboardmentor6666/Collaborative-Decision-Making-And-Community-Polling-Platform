import "../styles/Stats.css";

function Stats() {
  return (
    <section className="stats-section">
  <div className="stats-container">

    <div className="stat-card">
      <div className="stat-icon">👥</div>
      <h2>10K+</h2>
      <p>Active Users</p>
    </div>

    <div className="stat-card">
      <div className="stat-icon">🗳️</div>
      <h2>5K+</h2>
      <p>Polls Created</p>
    </div>

    <div className="stat-card">
      <div className="stat-icon">📊</div>
      <h2>50K+</h2>
      <p>Total Votes</p>
    </div>

    <div className="stat-card">
      <div className="stat-icon">🌐</div>
      <h2>100+</h2>
      <p>Communities</p>
    </div>

  </div>
</section>
  );
}

export default Stats;