import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ChevronUp,
  Clock3,
  Eye,
  FileText,
  MessageCircle,
  RefreshCw,
  Shield,
  Trophy,
  Users,
  Vote,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const API = "http://localhost:8080";

const COLORS = [
  "#8b5cf6",
  "#a855f7",
  "#c084fc",
  "#7c3aed",
  "#d8b4fe",
  "#6d28d9",
];

const EMPTY_DATA = {
  summary: {
    totalDecisions: 0,
    activeDecisions: 0,
    completedDecisions: 0,
    publicDecisions: 0,
    privateDecisions: 0,
    anonymousDecisions: 0,
    votesCast: 0,
    votesReceived: 0,
    commentsWritten: 0,
    commentsReceived: 0,
  },
  trend: [],
  distribution: [],
  categories: [],
  options: [],
  communities: [],
  topDecisions: [],
  recentDecisions: [],
};

function AnalyticsPage() {
  const [data, setData] = useState(EMPTY_DATA);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchAnalytics = async (showRefresh = false) => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      setError("Please login to view analytics.");
      setLoading(false);
      return;
    }

    showRefresh ? setRefreshing(true) : setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API}/api/user/analytics?days=${days}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Analytics request failed: ${response.status}`
        );
      }

      const result = await response.json();

      setData({
        ...EMPTY_DATA,
        ...result,
        summary: {
          ...EMPTY_DATA.summary,
          ...(result.summary || {}),
        },
      });
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load analytics. Please check whether the backend is running."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const summary = data.summary || EMPTY_DATA.summary;

  const total = Number(summary.totalDecisions || 0);
  const active = Number(summary.activeDecisions || 0);
  const completed = Number(summary.completedDecisions || 0);
  const votesReceived = Number(summary.votesReceived || 0);
  const commentsReceived = Number(
    summary.commentsReceived || 0
  );

  const participationScore = useMemo(() => {
    if (!total) return 0;

    return Math.round(votesReceived / total);
  }, [total, votesReceived]);

  const completionRate = total
    ? Math.round((completed / total) * 100)
    : 0;

  const publicRate = total
    ? Math.round(
        (Number(summary.publicDecisions || 0) / total) * 100
      )
    : 0;

  const trend = (data.trend || []).map((item) => ({
    ...item,
    label: formatDate(item.date),
    decisions: Number(item.decisions || 0),
  }));

  const categoryData = (data.categories || [])
    .slice(0, 6)
    .map((item) => ({
      name: item.category || "Uncategorized",
      value: Number(item.decisions || 0),
    }));

  const distributionData = (data.distribution || []).map(
    (item) => ({
      name: item.name,
      value: Number(item.value || 0),
    })
  );

  const topDecisions = (data.topDecisions || []).slice(0, 5);

  const maxEngagement = Math.max(
    1,
    ...topDecisions.map((item) =>
      Number(item.engagement || 0)
    )
  );

  if (loading) {
    return (
      <DashboardLayout
        pageTitle="Analytics"
        pageSubtitle="Understand your decisions and activity at a glance."
      >
        <div className="analytics-loading">
          <div className="loader" />
          <span>ANALYZING YOUR DECISIONS...</span>
        </div>

        <AnalyticsStyles />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      pageTitle="Analytics"
      pageSubtitle="Understand your decisions and activity at a glance."
    >
      <AnalyticsStyles />

      <main className="analytics-page">

        {/* ================= HERO ================= */}

        <section className="analytics-hero">
          <div>
            <div className="eyebrow">
              <Activity size={14} />
              DECISION INTELLIGENCE
            </div>

            <h1>Decision Analytics</h1>

            <p>
              Track participation, engagement and decision
              performance from one place.
            </p>
          </div>

          <div className="hero-actions">

            <select
              value={days}
              onChange={(e) =>
                setDays(Number(e.target.value))
              }
              aria-label="Analytics period"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last 365 days</option>
            </select>

            <button
              className="refresh-btn"
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
            >
              <RefreshCw
                size={15}
                className={refreshing ? "spin" : ""}
              />

              Refresh
            </button>

          </div>
        </section>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="analytics-error">
            {error}
          </div>
        )}

        {/* ================= KPI CARDS ================= */}

        <section className="kpi-grid">

          <Kpi
            icon={<FileText />}
            label="Total Decisions"
            value={total}
            hint={`${active} currently active`}
          />

          <Kpi
            icon={<Vote />}
            label="Votes Received"
            value={votesReceived}
            hint={`${participationScore} avg. votes / decision`}
          />

          <Kpi
            icon={<Users />}
            label="Votes You Cast"
            value={summary.votesCast}
            hint={`${summary.commentsWritten} comments written`}
          />

          <Kpi
            icon={<Trophy />}
            label="Completion Rate"
            value={`${completionRate}%`}
            hint={`${completed} completed decisions`}
          />

        </section>

        {/* ================= ACTIVITY + VISIBILITY ================= */}

        <section className="analytics-grid two-one">

          <Card
            title="Decision Activity"
            subtitle={`Decisions created in the last ${days} days`}
            icon={<BarChart3 />}
          >

            {trend.length ? (

              <div className="chart-wrap">

                <ResponsiveContainer
                  width="100%"
                  height={280}
                >

                  <AreaChart
                    data={trend}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -18,
                      bottom: 0,
                    }}
                  >

                    <defs>

                      <linearGradient
                        id="decisionGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >

                        <stop
                          offset="0%"
                          stopColor="#8b5cf6"
                          stopOpacity={0.35}
                        />

                        <stop
                          offset="100%"
                          stopColor="#8b5cf6"
                          stopOpacity={0.02}
                        />

                      </linearGradient>

                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--app-border)"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="label"
                      tick={{
                        fill: "var(--app-muted)",
                        fontSize: 11,
                      }}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={25}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fill: "var(--app-muted)",
                        fontSize: 11,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      content={<ChartTooltip />}
                    />

                    <Area
                      type="monotone"
                      dataKey="decisions"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      fill="url(#decisionGradient)"
                    />

                  </AreaChart>

                </ResponsiveContainer>

              </div>

            ) : (
              <Empty text="No decision activity for this period." />
            )}

          </Card>


          <Card
            title="Decision Visibility"
            subtitle="How your decisions are shared"
            icon={<Eye />}
          >

            {distributionData.length ? (

              <div className="donut-area">

                <ResponsiveContainer
                  width="100%"
                  height={220}
                >

                  <PieChart>

                    <Pie
                      data={distributionData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={86}
                      paddingAngle={4}
                      stroke="none"
                    >

                      {distributionData.map(
                        (entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={
                              COLORS[
                                index % COLORS.length
                              ]
                            }
                          />
                        )
                      )}

                    </Pie>

                    <Tooltip
                      content={<ChartTooltip />}
                    />

                  </PieChart>

                </ResponsiveContainer>


                <div className="donut-center">

                  <strong>{publicRate}%</strong>

                  <span>public</span>

                </div>


                <div className="legend-list">

                  {distributionData.map(
                    (item, index) => (

                      <div
                        className="legend-row"
                        key={item.name}
                      >

                        <span>

                          <i
                            style={{
                              background:
                                COLORS[
                                  index %
                                    COLORS.length
                                ],
                            }}
                          />

                          {item.name}

                        </span>

                        <b>{item.value}</b>

                      </div>

                    )
                  )}

                </div>

              </div>

            ) : (
              <Empty text="No visibility data yet." />
            )}

          </Card>

        </section>


        {/* ================= ENGAGEMENT + CATEGORIES ================= */}

        <section className="analytics-grid two-one">

          <Card
            title="Most Engaged Decisions"
            subtitle="Ranked by votes and comments"
            icon={<Zap />}
            badge="TOP 5"
          >

            {topDecisions.length ? (

              <div className="ranking-list">

                {topDecisions.map(
                  (item, index) => {

                    const engagement =
                      Number(
                        item.engagement || 0
                      );

                    return (
                      <div
                        className="ranking-item"
                        key={
                          item.id ||
                          item.title
                        }
                      >

                        <div className="ranking-head">

                          <div className="rank-title">

                            <span>
                              {String(
                                index + 1
                              ).padStart(2, "0")}
                            </span>

                            <strong
                              title={item.title}
                            >
                              {item.title}
                            </strong>

                          </div>

                          <b>
                            {engagement}
                          </b>

                        </div>


                        <div className="progress-track">

                          <div
                            style={{
                              width: `${
                                (engagement /
                                  maxEngagement) *
                                100
                              }%`,
                            }}
                          />

                        </div>


                        <div className="ranking-meta">

                          <span>
                            <Vote size={12} />

                            {item.votes || 0}
                            {" "}
                            votes
                          </span>

                          <span>
                            <MessageCircle size={12} />

                            {item.comments || 0}
                            {" "}
                            comments
                          </span>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            ) : (
              <Empty text="No voting activity on your decisions yet." />
            )}

          </Card>


          <Card
            title="Categories"
            subtitle="Your decisions by category"
            icon={<BarChart3 />}
          >

            {categoryData.length ? (

              <ResponsiveContainer
                width="100%"
                height={280}
              >

                <BarChart
                  data={categoryData}
                  layout="vertical"
                  margin={{
                    top: 8,
                    right: 20,
                    left: 10,
                    bottom: 8,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--app-border)"
                    horizontal={false}
                  />

                  <XAxis
                    type="number"
                    allowDecimals={false}
                    hide
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={90}
                    tick={{
                      fill: "var(--app-muted)",
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    content={<ChartTooltip />}
                  />

                  <Bar
                    dataKey="value"
                    fill="#a855f7"
                    radius={[
                      0,
                      8,
                      8,
                      0,
                    ]}
                    barSize={20}
                  />

                </BarChart>

              </ResponsiveContainer>

            ) : (
              <Empty text="No categories available." />
            )}

          </Card>

        </section>


        {/* ================= STATS STRIP ================= */}

        <section className="stats-strip">

          <MiniStat
            icon={<Vote />}
            value={summary.votesReceived}
            label="Votes received"
          />

          <MiniStat
            icon={<Users />}
            value={summary.votesCast}
            label="Votes you cast"
          />

          <MiniStat
            icon={<MessageCircle />}
            value={commentsReceived}
            label="Comments received"
          />

          <MiniStat
            icon={<Shield />}
            value={summary.anonymousDecisions}
            label="Anonymous decisions"
          />

          <MiniStat
            icon={<Clock3 />}
            value={active}
            label="Active decisions"
          />

        </section>


        {/* ================= HEALTH + RECENT ================= */}

        <section className="analytics-grid one-one">

          <Card
            title="Decision Health"
            subtitle="Quick performance snapshot"
            icon={<CheckCircle2 />}
          >

            <div className="health-grid">

              <Health
                label="Completed"
                value={completed}
                percentage={completionRate}
              />

              <Health
                label="Active"
                value={active}
                percentage={
                  total
                    ? Math.round(
                        (active / total) *
                          100
                      )
                    : 0
                }
              />

              <Health
                label="Public"
                value={summary.publicDecisions}
                percentage={publicRate}
              />

            </div>

          </Card>


          <Card
            title="Recent Decisions"
            subtitle="Your latest decision boards"
            icon={<Clock3 />}
            badge="RECENT"
          >

            {data.recentDecisions?.length ? (

              <div className="recent-list">

                {data.recentDecisions.map(
                  (item) => (

                    <div
                      className="recent-row"
                      key={item.id}
                    >

                      <div className="recent-icon">

                        <BarChart3 size={17} />

                      </div>

                      <div className="recent-main">

                        <strong>
                          {item.title}
                        </strong>

                        <span>
                          {item.category ||
                            "Uncategorized"}

                          {" · "}

                          {item.visibility ||
                            "PUBLIC"}
                        </span>

                      </div>

                      <div className="recent-date">

                        {formatDateTime(
                          item.createdAt
                        )}

                      </div>

                    </div>

                  )
                )}

              </div>

            ) : (
              <Empty text="No decisions created yet." />
            )}

          </Card>

        </section>

      </main>
    </DashboardLayout>
  );
}


/* =========================================================
   KPI
========================================================= */

function Kpi({
  icon,
  label,
  value,
  hint,
}) {
  return (
    <div className="kpi-card">

      <div className="kpi-icon">
        {icon}
      </div>

      <div className="kpi-content">

        <span>{label}</span>

        <strong>{value}</strong>

        <small>
          <ChevronUp size={12} />
          {hint}
        </small>

      </div>

    </div>
  );
}


/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({
  icon,
  value,
  label,
}) {
  return (
    <div className="mini-stat">

      <span className="mini-icon">
        {icon}
      </span>

      <div>

        <strong>{value}</strong>

        <span>{label}</span>

      </div>

    </div>
  );
}


/* =========================================================
   HEALTH
========================================================= */

function Health({
  label,
  value,
  percentage,
}) {
  return (
    <div className="health-item">

      <div className="health-top">

        <span>{label}</span>

        <strong>{value}</strong>

      </div>

      <div className="progress-track">

        <div
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

      <small>
        {percentage}% of decisions
      </small>

    </div>
  );
}


/* =========================================================
   CARD
========================================================= */

function Card({
  title,
  subtitle,
  icon,
  badge,
  children,
}) {
  return (
    <section className="analytics-card">

      <div className="card-header">

        <div className="card-heading">

          <div className="card-icon">
            {icon}
          </div>

          <div>

            <h2>{title}</h2>

            <p>{subtitle}</p>

          </div>

        </div>

        {badge && (
          <span className="card-badge">
            {badge}
          </span>
        )}

      </div>

      {children}

    </section>
  );
}


/* =========================================================
   EMPTY
========================================================= */

function Empty({ text }) {
  return (
    <div className="empty-state">

      <BarChart3 size={28} />

      <span>{text}</span>

    </div>
  );
}


/* =========================================================
   CHART TOOLTIP
========================================================= */

function ChartTooltip({
  active,
  payload,
  label,
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="chart-tooltip">

      <strong>
        {label || payload[0].name}
      </strong>

      <span>
        {payload[0].value}
      </span>

    </div>
  );
}


/* =========================================================
   DATE
========================================================= */

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
    }
  );
}


/* =========================================================
   DATE TIME
========================================================= */

function formatDateTime(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
    }
  );
}


/* =========================================================
   ANALYTICS STYLES
========================================================= */

function AnalyticsStyles() {
  return (
    <style>{`

      .analytics-page{
        width:100%;
        max-width:1500px;
        margin:0 auto;
        padding:4px 0 42px;
        color:var(--app-text);
      }

      .analytics-loading{
        min-height:520px;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        gap:16px;
        color:var(--app-muted);
        font-size:11px;
        letter-spacing:1.2px;
      }

      .loader{
        width:48px;
        height:48px;
        border:2px solid var(--app-border);
        border-top-color:#8b5cf6;
        border-right-color:#a855f7;
        border-radius:50%;
        animation:spin 1s linear infinite;
      }

      .spin{
        animation:spin .8s linear infinite;
      }

      @keyframes spin{
        to{
          transform:rotate(360deg);
        }
      }

      .analytics-hero{
        display:flex;
        justify-content:space-between;
        align-items:flex-end;
        gap:20px;
        padding:8px 2px 24px;
      }

      .eyebrow{
        display:flex;
        align-items:center;
        gap:7px;
        font-size:10px;
        font-weight:800;
        letter-spacing:1.5px;
        color:#8b5cf6;
        margin-bottom:8px;
      }

      .analytics-hero h1{
        font-size:28px;
        line-height:1.1;
        margin:0 0 7px;
        font-weight:800;
        letter-spacing:-.6px;
      }

      .analytics-hero p{
        margin:0;
        color:var(--app-muted);
        font-size:13px;
      }

      .hero-actions{
        display:flex;
        gap:8px;
      }

      .hero-actions select,
      .refresh-btn{
        height:38px;
        border:1px solid var(--app-border);
        background:var(--app-card);
        color:var(--app-text);
        border-radius:10px;
        padding:0 12px;
        font-size:12px;
      }

      .refresh-btn{
        display:flex;
        align-items:center;
        gap:7px;
        cursor:pointer;
      }

      .refresh-btn:disabled{
        opacity:.6;
      }

      .analytics-error{
        border:1px solid rgba(239,68,68,.3);
        background:rgba(239,68,68,.08);
        color:#ef4444;
        padding:12px 14px;
        border-radius:12px;
        margin-bottom:16px;
        font-size:12px;
      }

      /* ================= KPI ================= */

      .kpi-grid{
        display:grid;
        grid-template-columns:repeat(4,1fr);
        gap:14px;
        margin-bottom:16px;
      }

      .kpi-card{
        position:relative;
        overflow:hidden;
        display:flex;
        gap:13px;
        padding:18px;
        border:1px solid var(--app-border);
        background:var(--app-card);
        border-radius:16px;
        box-shadow:0 8px 28px rgba(0,0,0,.06);
      }

      .kpi-card:after{
        content:"";
        position:absolute;
        width:80px;
        height:80px;
        border-radius:50%;
        right:-30px;
        top:-35px;
        background:rgba(139,92,246,.08);
      }

      .kpi-icon,
      .card-icon,
      .mini-icon{
        display:grid;
        place-items:center;
        flex-shrink:0;
      }

      .kpi-icon{
        width:42px;
        height:42px;
        border-radius:12px;
        background:rgba(139,92,246,.1);
        color:#8b5cf6;
      }

      .kpi-icon svg{
        width:20px;
      }

      .kpi-content{
        display:flex;
        flex-direction:column;
        min-width:0;
      }

      .kpi-content>span{
        font-size:11px;
        color:var(--app-muted);
        font-weight:700;
      }

      .kpi-content strong{
        font-size:26px;
        line-height:1.2;
        margin:3px 0;
      }

      .kpi-content small{
        display:flex;
        align-items:center;
        gap:2px;
        color:#22c55e;
        font-size:10px;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }

      /* ================= GRID ================= */

      .analytics-grid{
        display:grid;
        gap:16px;
        margin-bottom:16px;
      }

      .two-one{
        grid-template-columns:1.6fr 1fr;
      }

      .one-one{
        grid-template-columns:1fr 1fr;
      }

      /* ================= CARDS ================= */

      .analytics-card{
        border:1px solid var(--app-border);
        background:var(--app-card);
        border-radius:16px;
        padding:18px;
        min-width:0;
      }

      .card-header{
        display:flex;
        justify-content:space-between;
        align-items:flex-start;
        gap:12px;
        margin-bottom:14px;
      }

      .card-heading{
        display:flex;
        gap:10px;
        align-items:center;
      }

      .card-icon{
        width:34px;
        height:34px;
        border-radius:10px;
        background:rgba(139,92,246,.1);
        color:#8b5cf6;
      }

      .card-icon svg{
        width:17px;
      }

      .card-header h2{
        font-size:14px;
        margin:0 0 3px;
      }

      .card-header p{
        font-size:11px;
        color:var(--app-muted);
        margin:0;
      }

      .card-badge{
        font-size:9px;
        font-weight:800;
        letter-spacing:.8px;
        color:var(--app-muted);
        border:1px solid var(--app-border);
        padding:6px 8px;
        border-radius:7px;
      }

      /* ================= CHART ================= */

      .chart-wrap{
        width:100%;
        height:280px;
      }

      .chart-tooltip{
        background:var(--app-card);
        border:1px solid var(--app-border);
        box-shadow:0 10px 30px rgba(0,0,0,.12);
        padding:9px 11px;
        border-radius:9px;
        display:flex;
        flex-direction:column;
        gap:3px;
        font-size:11px;
      }

      .chart-tooltip span{
        font-weight:800;
        font-size:14px;
      }

      /* ================= DONUT ================= */

      .donut-area{
        position:relative;
        min-height:280px;
      }

      .donut-center{
        position:absolute;
        top:79px;
        left:50%;
        transform:translateX(-50%);
        display:flex;
        flex-direction:column;
        align-items:center;
        pointer-events:none;
      }

      .donut-center strong{
        font-size:25px;
      }

      .donut-center span{
        font-size:10px;
        color:var(--app-muted);
      }

      .legend-list{
        display:grid;
        gap:8px;
      }

      .legend-row{
        display:flex;
        justify-content:space-between;
        font-size:11px;
      }

      .legend-row span{
        display:flex;
        align-items:center;
        gap:7px;
      }

      .legend-row i{
        width:7px;
        height:7px;
        border-radius:50%;
      }

      .legend-row b{
        font-weight:800;
      }

      /* ================= RANKING ================= */

      .ranking-list{
        display:grid;
        gap:15px;
      }

      .ranking-item{
        padding-bottom:2px;
      }

      .ranking-head{
        display:flex;
        justify-content:space-between;
        gap:12px;
      }

      .rank-title{
        display:flex;
        gap:9px;
        align-items:center;
        min-width:0;
      }

      .rank-title span{
        font-size:10px;
        color:#8b5cf6;
        font-weight:800;
      }

      .rank-title strong{
        font-size:12px;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }

      .ranking-head>b{
        font-size:12px;
      }

      .progress-track{
        height:6px;
        background:var(--app-border);
        border-radius:20px;
        overflow:hidden;
        margin:8px 0 6px;
      }

      .progress-track>div{
        height:100%;
        border-radius:20px;
        background:linear-gradient(
          90deg,
          #7c3aed,
          #c084fc
        );
        transition:width .5s ease;
      }

      .ranking-meta{
        display:flex;
        gap:13px;
        color:var(--app-muted);
        font-size:10px;
      }

      .ranking-meta span{
        display:flex;
        align-items:center;
        gap:4px;
      }

      /* ================= EMPTY ================= */

      .empty-state{
        height:250px;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        gap:9px;
        color:var(--app-muted);
        font-size:11px;
        text-align:center;
      }

      /* ================= STATS ================= */

      .stats-strip{
        display:grid;
        grid-template-columns:repeat(5,1fr);
        gap:10px;
        margin-bottom:16px;
      }

      .mini-stat{
        display:flex;
        align-items:center;
        gap:10px;
        border:1px solid var(--app-border);
        background:var(--app-card);
        border-radius:13px;
        padding:13px;
      }

      .mini-icon{
        width:32px;
        height:32px;
        border-radius:9px;
        background:rgba(168,85,247,.1);
        color:#a855f7;
      }

      .mini-icon svg{
        width:15px;
      }

      .mini-stat div{
        display:flex;
        flex-direction:column;
      }

      .mini-stat strong{
        font-size:16px;
      }

      .mini-stat span{
        font-size:10px;
        color:var(--app-muted);
      }

      /* ================= HEALTH ================= */

      .health-grid{
        display:grid;
        gap:20px;
      }

      .health-item small{
        font-size:10px;
        color:var(--app-muted);
      }

      .health-top{
        display:flex;
        justify-content:space-between;
        font-size:11px;
      }

      .health-top strong{
        font-size:13px;
      }

      /* ================= RECENT ================= */

      .recent-list{
        display:grid;
      }

      .recent-row{
        display:flex;
        align-items:center;
        gap:10px;
        padding:11px 0;
        border-bottom:1px solid var(--app-border);
      }

      .recent-row:last-child{
        border-bottom:0;
      }

      .recent-icon{
        width:34px;
        height:34px;
        display:grid;
        place-items:center;
        border-radius:9px;
        background:rgba(139,92,246,.1);
        color:#8b5cf6;
        flex-shrink:0;
      }

      .recent-main{
        min-width:0;
        display:flex;
        flex-direction:column;
        gap:3px;
      }

      .recent-main strong{
        font-size:12px;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }

      .recent-main span,
      .recent-date{
        font-size:10px;
        color:var(--app-muted);
      }

      .recent-date{
        margin-left:auto;
        flex-shrink:0;
      }

      /* ================= RESPONSIVE ================= */

      @media(max-width:1050px){

        .kpi-grid{
          grid-template-columns:repeat(2,1fr);
        }

        .two-one,
        .one-one{
          grid-template-columns:1fr;
        }

        .stats-strip{
          grid-template-columns:repeat(3,1fr);
        }

      }

      @media(max-width:650px){

        .analytics-hero{
          align-items:flex-start;
          flex-direction:column;
        }

        .hero-actions{
          width:100%;
        }

        .hero-actions select,
        .refresh-btn{
          flex:1;
        }

        .kpi-grid{
          grid-template-columns:1fr;
        }

        .stats-strip{
          grid-template-columns:1fr 1fr;
        }

        .analytics-card{
          padding:14px;
        }

        .analytics-hero h1{
          font-size:23px;
        }

        .recent-date{
          display:none;
        }

      }

    `}</style>
  );
}

export default AnalyticsPage;