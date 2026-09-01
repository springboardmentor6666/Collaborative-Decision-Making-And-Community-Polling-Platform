import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";

const API = "http://localhost:8080";
const PAGE_SIZE = 20;

const EVENT_TYPES = [
    { label: "All", value: "" },
    { label: "Users", value: "USER" },
    { label: "Decisions", value: "DECISION" },
    { label: "Votes", value: "VOTE" },
    { label: "Comments", value: "COMMENT" },
    { label: "Communities", value: "COMMUNITY" },
];

function formatWhen(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString();
}

function AdminActivity() {
    const [page, setPage] = useState(0);
    const [type, setType] = useState("");
    const [items, setItems] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async (pageNum, typeFilter) => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                page: String(pageNum),
                size: String(PAGE_SIZE),
            });

            if (typeFilter) {
                params.set("type", typeFilter);
            }

            const response = await fetch(
                `${API}/api/admin/activity?${params.toString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error();
            }

            const data = await response.json();

            setItems(Array.isArray(data.content) ? data.content : []);
            setTotalPages(typeof data.totalPages === "number" ? data.totalPages : 0);
            setTotalElements(
                typeof data.totalElements === "number" ? data.totalElements : 0
            );
            setError("");
        } catch {
            setError("Unable to load activity.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load(page, type);
    }, [load, page, type]);

    const changeType = (value) => {
        setType(value);
        setPage(0);
    };

    return (
        <DashboardLayout
            pageTitle="All activity"
            pageSubtitle="Complete admin activity log"
        >
            <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        to="/admin/analytics"
                        className="flex items-center gap-1.5 text-xs font-semibold text-[var(--app-secondary-text)] transition hover:text-cyan-400"
                    >
                        <ArrowLeft size={14} />
                        Back to analytics
                    </Link>

                    <button
                        type="button"
                        onClick={() => load(page, type)}
                        disabled={loading}
                        className="flex items-center gap-1.5 rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-xs font-semibold text-[var(--app-text)] transition hover:border-cyan-400/50 disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>

                <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-5 shadow-sm">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-cyan-400">
                                {totalElements.toLocaleString()} events
                            </p>
                            <h2 className="mt-1 text-lg font-bold text-[var(--app-text)]">
                                Activity log
                            </h2>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                            {EVENT_TYPES.map((option) => (
                                <button
                                    key={option.value || "all"}
                                    type="button"
                                    onClick={() => changeType(option.value)}
                                    className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                                        type === option.value
                                            ? "bg-cyan-400 text-black"
                                            : "border border-[var(--app-border)] text-[var(--app-secondary-text)] hover:border-cyan-400/50"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="mb-3 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-xs text-red-400">
                            {error}
                        </div>
                    )}

                    {loading && !items.length ? (
                        <div className="py-10 text-center text-xs text-[var(--app-muted)]">
                            Loading activity...
                        </div>
                    ) : items.length ? (
                        <div className="relative ml-2">
                            <div className="absolute left-[5px] top-3 bottom-3 w-px bg-cyan-400/25" />

                            <div className="space-y-1">
                                {items.map((event, index) => (
                                    <div
                                        key={`${event.type}-${event.at}-${index}`}
                                        className="group relative flex min-h-[62px] items-start"
                                    >
                                        <div className="relative z-10 mt-[7px] h-[11px] w-[11px] shrink-0 rounded-full border-2 border-[var(--app-card)] bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,.45)]" />

                                        <div className="ml-5 min-w-0 flex-1 rounded-xl px-3 py-2 transition duration-200 group-hover:bg-[var(--app-card-2)]">
                                            <p className="text-xs leading-5 text-[var(--app-text)]">
                                                <span className="font-bold">{event.actor}</span>{" "}
                                                <span className="text-[var(--app-secondary-text)]">
                                                    {event.type?.toLowerCase()}
                                                </span>
                                            </p>

                                            {event.subject && (
                                                <p className="mt-0.5 truncate text-[11px] text-[var(--app-secondary-text)]">
                                                    {event.subject}
                                                </p>
                                            )}

                                            {event.at && (
                                                <p className="mt-0.5 text-[10px] text-[var(--app-muted)]">
                                                    {formatWhen(event.at)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="py-10 text-center text-xs text-[var(--app-muted)]">
                            No activity found.
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="mt-5 flex items-center justify-between border-t border-[var(--app-border)] pt-4 text-xs">
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={page === 0 || loading}
                                className="rounded-lg border border-[var(--app-border)] px-3 py-1.5 font-semibold text-[var(--app-text)] transition hover:border-cyan-400/50 disabled:opacity-40"
                            >
                                ← Previous
                            </button>

                            <span className="text-[var(--app-secondary-text)]">
                                Page {page + 1} of {totalPages}
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    setPage((p) => Math.min(totalPages - 1, p + 1))
                                }
                                disabled={page >= totalPages - 1 || loading}
                                className="rounded-lg border border-[var(--app-border)] px-3 py-1.5 font-semibold text-[var(--app-text)] transition hover:border-cyan-400/50 disabled:opacity-40"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </section>
            </main>
        </DashboardLayout>
    );
}

export default AdminActivity;