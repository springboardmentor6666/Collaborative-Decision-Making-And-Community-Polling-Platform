import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

function Home() {
  const navigate = useNavigate();

  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchDecisions();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = sessionStorage.getItem("token");

      const response = await fetch(
        "http://localhost:8080/api/users/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        setProfile(null);
        return;
      }

      const data = await response.json();

      setProfile(data);
    } catch (error) {
      setProfile(null);
    }
  };

  const fetchDecisions = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("token");

      const response = await fetch(
        "http://localhost:8080/api/decisions/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load decisions");
      }

      const data = await response.json();

      setDecisions(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(
        "Unable to load your decisions right now."
      );
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Create Decision",
      description: "Start a new decision board",
      icon: "➕",
      color: "#6d3dcc",
      route: "/create-decision",
    },
    {
      title: "My Decisions",
      description: "View and manage your boards",
      icon: "📊",
      color: "#2563eb",
      route: "/decisions",
    },
    {
      title: "Active Polls",
      description: "See polls you can vote on",
      icon: "🗳",
      color: "#7c3aed",
      route: "/polls",
    },
    {
      title: "Communities",
      description: "Join and collaborate with others",
      icon: "👥",
      color: "#be3c88",
      route: "/communities",
    },
    {
      title: "Analytics",
      description: "Track decision trends",
      icon: "📈",
      color: "#168653",
      route: "/analytics",
    },
    {
      title: "Profile",
      description: "Manage your account",
      icon: "👤",
      color: "#b7791f",
      route: "/profile",
    },
  ];

  const totalDecisions = decisions.length;

  const publicDecisions = decisions.filter(
    (decision) =>
      decision.visibility === "PUBLIC"
  ).length;

  const privateDecisions = decisions.filter(
    (decision) =>
      decision.visibility === "PRIVATE"
  ).length;

  const stats = [
    {
      label: "Total Decisions",
      value: totalDecisions,
      icon: "🧭",
    },
    {
      label: "Public Boards",
      value: publicDecisions,
      icon: "🌐",
    },
    {
      label: "Private Boards",
      value: privateDecisions,
      icon: "🔒",
    },
    {
      label: "Communities Joined",
      value: profile?.joinedCommunities ?? 0,
      icon: "👥",
    },
  ];

  return (
    <DashboardLayout
      pageTitle="Welcome Back 👋"
      pageSubtitle="Create polls, compare ideas and make smarter decisions together."
    >
      <div className="w-full min-w-0 pb-10">
        {/* ================= STATISTICS ================= */}

        <section
          className="
            grid grid-cols-1
            gap-4

            sm:grid-cols-2

            xl:grid-cols-4
            xl:gap-[18px]
          "
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="
                group
                flex min-w-0
                items-center
                gap-[14px]
                rounded-[14px]
                border border-[#2d2840]
                bg-[#15121f]
                p-5
                transition-all duration-200
                hover:-translate-y-[2px]
                hover:border-[#4c3a70]
              "
            >
              <div
                className="
                  flex h-[46px] w-[46px]
                  shrink-0
                  items-center justify-center
                  rounded-[11px]
                  border border-[#3b2c5c]
                  bg-[#211a32]
                  text-xl
                  transition-transform duration-200
                  group-hover:scale-105
                "
              >
                {stat.icon}
              </div>

              <div className="min-w-0">
                <div className="text-2xl font-bold leading-tight text-[#f8fafc]">
                  {stat.value}
                </div>

                <div className="mt-1 truncate text-xs text-[#918a9f]">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* ================= QUICK ACTIONS ================= */}

        <section className="mt-9">
          <div className="mb-[15px] flex items-center gap-3">
            <h2 className="shrink-0 text-[17px] font-semibold text-[#eee9f7]">
              Quick Actions
            </h2>

            <div className="h-px flex-1 bg-[#2d2840]" />
          </div>

          <div
            className="
              grid grid-cols-1
              gap-4

              sm:grid-cols-2

              xl:grid-cols-3
              xl:gap-[18px]
            "
          >
            {quickActions.map((action) => (
              <button
                key={action.title}
                type="button"
                onClick={() => navigate(action.route)}
                style={{
                  borderTopColor: action.color,
                }}
                className="
                  group
                  relative
                  min-h-[150px]
                  min-w-0
                  overflow-hidden
                  rounded-[14px]
                  border border-[#2d2840]
                  border-t-[3px]
                  bg-[#15121f]
                  p-[21px]
                  text-left
                  transition-all duration-200

                  hover:-translate-y-[3px]
                  hover:border-[#403651]
                  hover:bg-[#181521]

                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#6d3dcc]/50
                "
              >
                {/* SUBTLE COLORED GLOW */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    -right-12 -top-12
                    h-28 w-28
                    rounded-full
                    opacity-10
                    blur-3xl
                    transition-all duration-500
                    group-hover:scale-150
                    group-hover:opacity-20
                  "
                  style={{
                    backgroundColor: action.color,
                  }}
                />

                <div
                  style={{
                    background: action.color,
                  }}
                  className="
                    relative z-10
                    mb-[15px]
                    flex h-11 w-11
                    items-center justify-center
                    rounded-[10px]
                    text-xl
                    text-white
                    shadow-lg
                    transition-transform duration-200
                    group-hover:scale-110
                  "
                >
                  {action.icon}
                </div>

                <h3 className="relative z-10 mb-[6px] text-base font-semibold text-[#f3f0f7]">
                  {action.title}
                </h3>

                <p className="relative z-10 text-[13px] leading-relaxed text-[#918a9f]">
                  {action.description}
                </p>

                <div
                  className="
                    absolute bottom-0 left-0
                    h-[2px] w-0
                    transition-all duration-300
                    group-hover:w-full
                  "
                  style={{
                    backgroundColor: action.color,
                  }}
                />
              </button>
            ))}
          </div>
        </section>

        {/* ================= RECENT DECISIONS ================= */}

        <section className="mt-10">
          <div className="mb-[15px] flex items-center gap-3">
            <h2 className="shrink-0 text-[17px] font-semibold text-[#eee9f7]">
              Recent Decisions
            </h2>

            <div className="h-px flex-1 bg-[#2d2840]" />
          </div>

          <div
            className="
              w-full
              overflow-hidden
              rounded-[14px]
              border border-[#2d2840]
              bg-[#15121f]
            "
          >
            {/* LOADING */}

            {loading && (
              <div className="px-6 py-12 text-center">
                <div
                  className="
                    mx-auto mb-3
                    h-7 w-7
                    animate-spin
                    rounded-full
                    border-2 border-[#4f46e5]
                    border-t-transparent
                  "
                />

                <p className="text-sm text-[#918a9f]">
                  Loading your decisions...
                </p>
              </div>
            )}

            {/* ERROR */}

            {!loading && error && (
              <div className="px-6 py-12 text-center text-sm text-[#918a9f]">
                {error}
              </div>
            )}

            {/* EMPTY STATE */}

            {!loading &&
              !error &&
              decisions.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <div className="mb-3 text-3xl">
                    🧭
                  </div>

                  <p className="text-sm text-[#918a9f]">
                    You haven't created any decisions yet.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/create-decision")
                    }
                    className="
                      mt-5
                      rounded-lg
                      border border-[#493773]
                      bg-[#211a32]
                      px-4 py-2
                      text-xs font-semibold
                      text-[#c4b5fd]
                      transition-all duration-200
                      hover:bg-[#2a2140]
                      hover:text-white
                      active:scale-95
                    "
                  >
                    Create Decision
                  </button>
                </div>
              )}

            {/* DECISIONS */}

            {!loading &&
              !error &&
              decisions
                .slice(0, 5)
                .map((decision) => (
                  <div
                    key={decision.id}
                    className="
                      group
                      flex flex-col
                      gap-4
                      border-b border-[#282334]
                      px-5 py-[17px]
                      transition-colors duration-200
                      last:border-b-0
                      hover:bg-white/[0.02]

                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                    "
                  >
                    {/* LEFT */}

                    <div className="min-w-0">
                      <h3
                        className="
                          truncate
                          text-sm
                          font-semibold
                          text-[#eeeaf5]
                          transition-colors
                          group-hover:text-white
                        "
                      >
                        {decision.title}
                      </h3>

                      <p className="mt-1 truncate text-xs text-[#898192]">
                        {decision.category ||
                          "Uncategorized"}

                        {decision.deadline
                          ? ` • Deadline: ${decision.deadline}`
                          : ""}
                      </p>
                    </div>

                    {/* RIGHT */}

                    <div
                      className="
                        flex
                        shrink-0
                        items-center
                        justify-between
                        gap-3

                        sm:justify-end
                      "
                    >
                      <span
                        className={`
                          rounded-md
                          border
                          px-2.5 py-[5px]
                          text-[11px]
                          font-semibold

                          ${
                            decision.visibility === "PRIVATE"
                              ? `
                                border-[#66333a]
                                bg-[#28191d]
                                text-[#fca5a5]
                              `
                              : `
                                border-[#235c43]
                                bg-[#10251d]
                                text-[#86efac]
                              `
                          }
                        `}
                      >
                        {decision.visibility ||
                          "PUBLIC"}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          navigate("/decisions")
                        }
                        className="
                          rounded-[7px]
                          border border-[#493773]
                          bg-[#211a32]
                          px-3.5 py-[7px]
                          text-xs
                          font-semibold
                          text-[#c4b5fd]
                          transition-all duration-200
                          hover:border-[#6749a1]
                          hover:bg-[#2a2140]
                          hover:text-white
                          active:scale-95
                        "
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default Home;