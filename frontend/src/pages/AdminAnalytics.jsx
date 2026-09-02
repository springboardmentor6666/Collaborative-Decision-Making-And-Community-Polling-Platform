import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Activity,
    BarChart3,
    Compass,
    Database,
    MessageSquare,
    RefreshCw,
    Users,
    Vote,
} from "lucide-react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import DashboardLayout from "../components/DashboardLayout";

const API = "http://localhost:8080";

const RANGES = [
    { label: "Today", days: 1 },
    { label: "7 Days", days: 7 },
    { label: "30 Days", days: 30 },
    { label: "90 Days", days: 90 },
    { label: "1 Year", days: 365 },
];

const style = {
    background: "var(--app-card)",
    border: "1px solid var(--app-border)",
    borderRadius: "10px",
};

function NumberValue({ value }) {
    return <>{Number(value || 0).toLocaleString()}</>;
}

function Section({ title, subtitle, action, children }) {
    return (
        <section className="min-w-0 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-5 shadow-sm transition duration-300 hover:border-violet-400/30">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.18em] text-violet-400">
                        {subtitle}
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-[var(--app-text)]">
                        {title}
                    </h2>
                </div>

                {action}
            </div>

            {children}
        </section>
    );
}

function AdminAnalytics() {
    const [range, setRange] = useState(30);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(
        async (days = range) => {
            try {
                setLoading(true);

                const response = await fetch(
                    `${API}/api/admin/analytics?days=${days}`,
                    {
                        headers: {
                            Authorization: `Bearer ${sessionStorage.getItem(
                                "token"
                            )}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error();
                }

                setData(await response.json());
                setError("");
            } catch {
                setError("Unable to load analytics.");
            } finally {
                setLoading(false);
            }
        },
        [range]
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            load(range);
        }, 0);

        return () => clearTimeout(timer);
    }, [load, range]);

    if (loading && !data) {
        return (
            <DashboardLayout
                pageTitle="Admin Analytics"
                pageSubtitle="Platform health and engagement."
            >
                <main className="mx-auto max-w-[1600px] space-y-5 px-4 pb-10 sm:px-6 lg:px-8">
                    <div className="h-36 animate-pulse rounded-2xl bg-[var(--app-card-2)]" />

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 8 }, (_, i) => (
                            <div
                                key={i}
                                className="h-32 animate-pulse rounded-2xl bg-[var(--app-card-2)]"
                            />
                        ))}
                    </div>
                </main>
            </DashboardLayout>
        );
    }

    const k = data?.kpis || {};
    const summary = data?.decisionSummary || {};

    const cards = [
        [
            "Total users",
            k.totalUsers,
            Users,
            "All registered accounts",
        ],
        [
            "Active users",
            k.activeUsers,
            Activity,
            "Activity in range",
        ],
        [
            "Decisions",
            k.totalDecisions,
            BarChart3,
            "Created in range",
        ],
        [
            "Votes",
            k.totalVotes,
            Vote,
            "On period decisions",
        ],
        [
            "Comments",
            k.totalComments,
            MessageSquare,
            "On period decisions",
        ],
        [
            "Communities",
            k.totalCommunities,
            Compass,
            "Platform communities",
        ],
        [
            "Members",
            k.communityMembers,
            Users,
            "Memberships",
        ],
        [
            "Reports",
            k.pendingReports,
            Database,
            "Status not tracked",
        ],
    ];

    return (
        <DashboardLayout
            pageTitle="Admin Analytics"
            pageSubtitle="Platform health and engagement."
        >
            <main className="mx-auto max-w-[1600px] space-y-5 px-4 pb-10 sm:px-6 lg:px-8">

                {/* Header */}
                <header className="flex flex-col justify-between gap-4 rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-400/10 via-[var(--app-card)] to-violet-400/10 p-5 lg:flex-row lg:items-end">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-violet-400">
                            DecisionHub intelligence
                        </p>

                        <h1 className="mt-2 text-3xl font-black text-[var(--app-text)]">
                            Platform pulse
                        </h1>

                        <p className="mt-1 text-sm text-[var(--app-secondary-text)]">
                            A compact operational view of growth, decisions,
                            and engagement.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <div className="flex flex-wrap rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] p-1">
                            {RANGES.map((item) => (
                                <button
                                    key={item.days}
                                    onClick={() => setRange(item.days)}
                                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${range === item.days
                                        ? "bg-violet-400 text-slate-950"
                                        : "text-[var(--app-secondary-text)] hover:bg-[var(--app-card-2)]"
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => load(range)}
                            disabled={loading}
                            title="Refresh analytics"
                            className="rounded-xl border border-[var(--app-border)] p-2.5 text-[var(--app-secondary-text)] hover:text-violet-400 disabled:opacity-50"
                        >
                            <RefreshCw
                                size={16}
                                className={
                                    loading ? "animate-spin" : ""
                                }
                            />
                        </button>
                    </div>
                </header>

                {/* Error */}
                {error && (
                    <div className="flex justify-between rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-300">
                        <span>{error}</span>

                        <button
                            onClick={() => load(range)}
                            className="font-semibold"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {cards.map(
                        ([label, value, Icon, detail]) => (
                            <article
                                key={label}
                                className="group rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-400/40"
                            >
                                <Icon
                                    size={18}
                                    className="mb-4 text-violet-400 transition group-hover:scale-110"
                                />

                                <p className="text-xs text-[var(--app-secondary-text)]">
                                    {label}
                                </p>

                                <p className="mt-1 text-2xl font-black text-[var(--app-text)]">
                                    <NumberValue value={value} />
                                </p>

                                <p className="mt-1 text-[10px] text-[var(--app-muted)]">
                                    {detail}
                                </p>
                            </article>
                        )
                    )}
                </div>

                {/* Activity + Decision Mix */}
                <div className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">

                    {/* User Activity */}
                    <Section
                        title="User activity"
                        subtitle="Growth signal"
                    >
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={data?.activity || []}
                                >
                                    <CartesianGrid
                                        stroke="var(--app-border)"
                                        strokeDasharray="4 5"
                                        vertical={false}
                                    />

                                    <XAxis
                                        dataKey="date"
                                        tick={{
                                            fill: "var(--app-muted)",
                                            fontSize: 10,
                                        }}
                                    />

                                    <YAxis
                                        allowDecimals={false}
                                        tick={{
                                            fill: "var(--app-muted)",
                                            fontSize: 10,
                                        }}
                                    />

                                    <Tooltip
                                        contentStyle={style}
                                    />

                                    <Line
                                        dataKey="activeUsers"
                                        stroke="#8b5cf6"
                                        strokeWidth={3}
                                        dot={false}
                                        animationDuration={700}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Section>

                    {/* Decision Mix */}
                    <Section
                        title="Decision mix"
                        subtitle="Period split"
                    >
                        <div className="space-y-4 pt-4">

                            <div className="flex justify-between rounded-xl bg-[var(--app-card-2)] p-4 text-sm text-[var(--app-secondary-text)]">
                                <span>Public decisions</span>

                                <strong className="text-2xl text-[var(--app-text)]">
                                    <NumberValue
                                        value={summary.public}
                                    />
                                </strong>
                            </div>

                            <div className="flex justify-between rounded-xl bg-[var(--app-card-2)] p-4 text-sm text-[var(--app-secondary-text)]">
                                <span>Community decisions</span>

                                <strong className="text-2xl text-[var(--app-text)]">
                                    <NumberValue
                                        value={summary.community}
                                    />
                                </strong>
                            </div>

                            <p className="text-xs text-[var(--app-muted)]">
                                {summary.total
                                    ? Math.round(
                                        (summary.community /
                                            summary.total) *
                                        100
                                    )
                                    : 0}
                                % of decisions are
                                community-based.
                            </p>
                        </div>
                    </Section>
                </div>

                {/* Community + Categories */}
                <div className="grid gap-5 xl:grid-cols-2">

                    {/* Community Analytics */}
                    <Section
                        title="Community analytics"
                        subtitle="Network health"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[620px] text-left text-xs">
                                <thead className="text-[10px] uppercase tracking-wider text-[var(--app-muted)]">
                                    <tr>
                                        {[
                                            "Community",
                                            "Owner",
                                            "Members",
                                            "Decisions",
                                            "Votes",
                                            "Comments",
                                        ].map((h) => (
                                            <th
                                                className="px-2 py-3"
                                                key={h}
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {data?.communities?.map(
                                        (row, index) => (
                                            <tr
                                                key={row.id}
                                                className="border-t border-[var(--app-border)] transition hover:bg-violet-400/5"
                                            >
                                                <td className="px-2 py-3 font-semibold text-[var(--app-text)]">
                                                    {index === 0
                                                        ? "★ "
                                                        : ""}
                                                    {row.name}
                                                </td>

                                                <td className="px-2 py-3 text-[var(--app-secondary-text)]">
                                                    {row.owner}
                                                </td>

                                                <td className="px-2 py-3">
                                                    {row.members}
                                                </td>

                                                <td className="px-2 py-3">
                                                    {row.decisions}
                                                </td>

                                                <td className="px-2 py-3">
                                                    {row.votes}
                                                </td>

                                                <td className="px-2 py-3">
                                                    {row.comments}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Section>

                    {/* Popular Categories */}
                    <Section
                        title="Popular categories"
                        subtitle="Topics"
                    >
                        <div className="h-[280px]">
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <BarChart
                                    data={data?.categories || []}
                                    layout="vertical"
                                    margin={{
                                        left: 15,
                                        right: 15,
                                    }}
                                >
                                    <CartesianGrid
                                        stroke="var(--app-border)"
                                        horizontal={false}
                                    />

                                    <XAxis
                                        type="number"
                                        allowDecimals={false}
                                        tick={{
                                            fill: "var(--app-muted)",
                                            fontSize: 10,
                                        }}
                                    />

                                    <YAxis
                                        type="category"
                                        dataKey="category"
                                        width={100}
                                        tick={{
                                            fill: "var(--app-secondary-text)",
                                            fontSize: 10,
                                        }}
                                    />

                                    <Tooltip
                                        contentStyle={style}
                                    />

                                    <Bar
                                        dataKey="decisions"
                                        fill="#a855f7"
                                        radius={[0, 7, 7, 0]}
                                        animationDuration={700}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Section>
                </div>

                {/* Top 5 Users + Top 5 Decisions */}
                <div className="grid gap-5 xl:grid-cols-2">

                    {/* Top 5 Active Users */}
                    <Section title="Most active users" subtitle="Top 5">
                        <div className="space-y-2.5">
                            {data?.activeUsers?.slice(0, 5).length ? (
                                data.activeUsers.slice(0, 5).map((row, index) => (
                                    <div
                                        key={row.id ?? `${row.name}-${index}`}
                                        className="flex items-center justify-between rounded-xl border border-transparent bg-[var(--app-card-2)] px-4 py-3.5 transition-all duration-200 hover:border-violet-400/20 hover:bg-violet-400/5"
                                    >
                                        <div className="flex min-w-0 items-center gap-2.5">
                                            <span className="w-4 shrink-0 text-sm font-bold text-violet-400">
                                                {index + 1}
                                            </span>

                                            <span className="truncate text-sm font-medium text-[var(--app-text)]">
                                                {row.name || "Unknown user"}
                                            </span>
                                        </div>

                                        <span className="ml-4 shrink-0 text-xs font-bold text-violet-400">
                                            {Number(row.activity || 0).toLocaleString()} activity
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-xs text-[var(--app-muted)]">
                                    No active users available.
                                </div>
                            )}
                        </div>
                    </Section>

                    {/* Top 5 Popular Decisions */}
                    <Section
                        title="Most popular decisions"
                        subtitle="Top 5"
                    >
                        <div className="space-y-2">
                            {data?.popularDecisions
                                ?.slice(0, 5)
                                .map((row, i) => (
                                    <div
                                        key={row.id}
                                        className="flex items-center gap-3 rounded-xl bg-[var(--app-card-2)] p-3"
                                    >
                                        <b className="text-violet-400">
                                            {i + 1}
                                        </b>

                                        <span className="min-w-0 flex-1 truncate text-sm text-[var(--app-text)]">
                                            {row.title}
                                        </span>

                                        <span className="text-xs font-bold text-violet-300">
                                            {row.votes} votes
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </Section>
                </div>

                {/* Recent Activity - Top 5 */}
                <Section
                    title="Recent activity"
                    subtitle="Top 5"
                    action={
                        <Link
                            to="/admin/activity"
                            className="shrink-0 whitespace-nowrap rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-xs font-semibold text-violet-400 transition duration-200 hover:border-violet-400/50 hover:bg-violet-400/10"
                        >
                            View all →
                        </Link>
                    }
                >
                    <div className="max-w-4xl">
                        {data?.recentActivity?.length ? (
                            <div className="relative ml-2">
                                {/* Timeline line */}
                                <div className="absolute left-[5px] top-3 bottom-3 w-px bg-violet-400/25" />

                                <div className="space-y-1">
                                    {data.recentActivity.slice(0, 5).map((event, index) => (
                                        <div
                                            key={`${event.type}-${event.at}-${index}`}
                                            className="group relative flex min-h-[62px] items-start"
                                        >
                                            {/* Timeline dot */}
                                            <div className="relative z-10 mt-[7px] h-[11px] w-[11px] shrink-0 rounded-full border-2 border-[var(--app-card)] bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,.45)]" />

                                            {/* Activity content */}
                                            <div className="ml-5 min-w-0 flex-1 rounded-xl px-3 py-2 transition duration-200 group-hover:bg-[var(--app-card-2)]">
                                                <p className="text-xs leading-5 text-[var(--app-text)]">
                                                    <span className="font-bold">
                                                        {event.actor}
                                                    </span>{" "}
                                                    <span className="text-[var(--app-secondary-text)]">
                                                        {event.type?.toLowerCase()}
                                                    </span>
                                                </p>

                                                {event.subject && (
                                                    <p className="mt-0.5 truncate text-[11px] text-[var(--app-secondary-text)]">
                                                        {event.subject}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 text-center text-xs text-[var(--app-muted)]">
                                No recent activity available.
                            </div>
                        )}
                    </div>
                </Section>
            </main>
        </DashboardLayout>
    );
}

export default AdminAnalytics;