import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
function Activity() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadActivity = async () => {
            try {
                setLoading(true);

                const response = await fetch(
                    "http://localhost:8080/api/users/activity",
                    {
                        headers: {
                            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Unable to load activity.");
                }

                const data = await response.json();

                setItems(Array.isArray(data) ? data : []);
                setError("");
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadActivity();
    }, []);
    return (
        <DashboardLayout
            pageTitle="Recent Activity"
            pageSubtitle="Your recent activity"
        >
            <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-3 sm:p-4 md:p-6">
                <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-4 shadow-sm sm:p-5">
                   <div className="mb-5">
    <p className="text-[10px] font-bold uppercase tracking-[.18em] text-violet-400">
        {items.length} events
    </p>

    <h2 className="mt-1 text-lg font-bold text-[var(--app-text)]">
        Recent Activity
    </h2>

    <p className="mt-1 text-xs text-[var(--app-secondary-text)]">
        Your latest actions across DecisionHub
    </p>
</div>

{error && (
    <div className="mb-4 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-xs text-red-400">
        {error}
    </div>
)}

{loading ? (
    <div className="py-10 text-center text-xs text-[var(--app-muted)]">
        Loading activity...
    </div>
) : items.length > 0 ? (
    <div className="relative ml-1 sm:ml-2">
        <div className="absolute bottom-3 left-[5px] top-3 w-px bg-violet-400/25" />

        <div className="space-y-1">
            {items.map((event, index) => (
                <div
                    key={`${event.type}-${event.at}-${index}`}
                    className="group relative flex min-h-[70px] items-start"
                >
                    <div className="relative z-10 mt-[7px] flex h-[11px] w-[11px] shrink-0 rounded-full border-2 border-[var(--app-card)] bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,.5)]" />

                    <div className="ml-4 min-w-0 flex-1 rounded-xl px-3 py-2 transition duration-200 group-hover:bg-[var(--app-card-2)] sm:ml-5">
                        <p className="break-words text-xs leading-5 text-[var(--app-text)]">
                           <span className="font-bold">
    {event.type === "Decision created" && "📝 You created a decision"}
    {event.type === "Vote submitted" && "🗳️ You voted on a decision"}
    {event.type === "Comment created" && "💬 You commented on a decision"}
    {event.type === "Community joined" && "👥 You joined a community"}
</span>
                        </p>

                        {event.subject && (
                            <p className="mt-0.5 break-words text-[11px] text-[var(--app-secondary-text)]">
                                {event.subject}
                            </p>
                        )}

                        {event.at && (
                            <p className="mt-0.5 break-words text-[10px] text-[var(--app-muted)]">
                                {new Date(event.at).toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </div>
) : (
    <div className="py-10 text-center text-xs text-[var(--app-muted)]">
        No recent activity found.
    </div>
)}
                </section>
            </main>
        </DashboardLayout>
    );
}

export default Activity;