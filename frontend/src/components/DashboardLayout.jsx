import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";

function DashboardLayout({ children, pageTitle, pageSubtitle }) {
  const navigate = useNavigate();
  const location = useLocation();

  const userEmail = sessionStorage.getItem("userEmail") || "";
  const role = sessionStorage.getItem("role") || "USER";

  // Desktop sidebar:
  // false = expanded
  // true = collapsed
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return (
      localStorage.getItem("decisionHubSidebarCollapsed") === "true"
    );
  });

  // Mobile sidebar
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const notificationRef = useRef(null);

  // Regular participants get the personal/participation tools.
  const userNavItems = [
    {
      label: "Dashboard",
      icon: "🏠",
      route: "/home",
    },
    {
      label: "Create Decision",
      icon: "➕",
      route: "/create-decision",
    },
    {
      label: "My Decisions",
      icon: "📊",
      route: "/decisions",
    },
    {
      label: "Active Polls",
      icon: "🗳",
      route: "/polls",
    },
    {
      label: "Communities",
      icon: "👥",
      route: "/communities",
    },
    {
      label: "Analytics",
      icon: "📈",
      route: "/analytics",
    },
    {
      label: "Profile",
      icon: "👤",
      route: "/profile",
    },
  ];

  // Admins manage the platform rather than participate in it, so the
  // admin nav swaps the personal tools out for the moderation/management
  // surfaces instead of just appending an "Admin" link to the user nav.
  const adminNavItems = [
    {
      label: "Admin Dashboard",
      icon: "🛠",
      route: "/admin",
    },
    {
      label: "Create Decision",
      icon: "➕",
      route: "/admin/create-decision",
    },
    {
      label: "My Decisions",
      icon: "📊",
      route: "/admin/my-decisions",
    },
    {
      label: "Active Polls",
      icon: "🗳",
      route: "/admin/polls",
    },
    {
      label: "Manage Users",
      icon: "🧑‍💼",
      route: "/admin/users",
    },
    {
      label: "Manage Decisions",
      icon: "📋",
      route: "/admin/decisions",
    },
    {
      label: "Manage Communities",
      icon: "👥",
      route: "/admin/communities",
    },
    {
      label: "Analytics",
      icon: "📈",
      route: "/admin/analytics",
    },
    {
      label: "Profile",
      icon: "👤",
      route: "/profile",
    },
  ];

  const navItems = role === "ADMIN" ? adminNavItems : userNavItems;

  const initials = userEmail
    ? userEmail.charAt(0).toUpperCase()
    : "?";

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("userEmail");

    navigate("/");
  };

  const toggleDesktopSidebar = () => {
    setSidebarCollapsed((previous) => {
      const newValue = !previous;

      localStorage.setItem(
        "decisionHubSidebarCollapsed",
        String(newValue)
      );

      return newValue;
    });
  };

  const fetchNotifications = async () => {
    try {
      const token = sessionStorage.getItem("token");

      const response = await fetch(
        "http://localhost:8080/api/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) return;

      const data = await response.json();

      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      // Notifications are non-critical
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(
      fetchNotifications,
      30000
    );

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const markAsRead = async (id) => {
    try {
      const token = sessionStorage.getItem("token");

      await fetch(
        `http://localhost:8080/api/notifications/${id}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      // Fail silently
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = sessionStorage.getItem("token");

      await fetch(
        "http://localhost:8080/api/notifications/read-all",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (error) {
      // Fail silently
    }
  };

  const timeAgo = (dateString) => {
    if (!dateString) return "";

    const difference =
      Date.now() - new Date(dateString).getTime();

    const minutes = Math.floor(difference / 60000);

    if (minutes < 1) return "just now";

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);

    return `${days}d ago`;
  };

  const isActive = (route) => {
    return location.pathname === route;
  };

  const handleDesktopNavigation = (route) => {
    navigate(route);
  };

  const handleMobileNavigation = (route) => {
    navigate(route);
    setMobileSidebarOpen(false);
  };

  return (
    <div
      className="
        min-h-screen
        w-full
        overflow-x-hidden
        bg-[var(--app-bg)]
        text-[var(--app-text)]
        transition-colors
        duration-300
      "
    >
      {/* ================= MOBILE BACKDROP ================= */}

      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setMobileSidebarOpen(false)}
          className="
            fixed inset-0
            z-40
            bg-black/50
            backdrop-blur-sm
            lg:hidden
          "
        />
      )}

      {/* ================= SIDEBAR ================= */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex h-screen flex-col
          overflow-hidden

          bg-[var(--app-card)]
          border-r border-[var(--app-border)]
          shadow-2xl

          transition-[width,transform,background-color]
          duration-300 ease-in-out

          w-[250px]

          ${
            mobileSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          lg:translate-x-0

          ${
            sidebarCollapsed
              ? "lg:w-[88px]"
              : "lg:w-[250px]"
          }
        `}
      >
        {/* ================= LOGO AREA ================= */}

        <div
          className={`
            flex h-[104px] shrink-0
            items-center
            border-b
            border-[var(--app-border)]
            px-4

            ${
              sidebarCollapsed
                ? "lg:justify-center"
                : "justify-between"
            }
          `}
        >
          {/* LOGO */}

          <div
            className={`
              whitespace-nowrap
              text-[24px]
              font-extrabold
              tracking-tight
              text-[var(--app-text)]

              ${
                sidebarCollapsed
                  ? "lg:hidden"
                  : ""
              }
            `}
          >
            DecisionHub
          </div>

          {/* DESKTOP COLLAPSE / EXPAND */}

          <button
            type="button"
            onClick={toggleDesktopSidebar}
            title={
              sidebarCollapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            className="
              hidden
              h-10 w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              text-xl
              text-[var(--app-secondary-text)]
              transition-all
              duration-200
              hover:bg-[var(--app-card-2)]
              hover:text-[var(--app-text)]
              active:scale-95
              lg:flex
            "
          >
            {sidebarCollapsed ? "☰" : "←"}
          </button>

          {/* MOBILE CLOSE */}

          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="
              flex h-10 w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              text-xl
              text-[var(--app-secondary-text)]
              transition-all
              hover:bg-[var(--app-card-2)]
              hover:text-[var(--app-text)]
              active:scale-95
              lg:hidden
            "
          >
            ✕
          </button>
        </div>

        {/* ================= NAVIGATION ================= */}

        <nav className="flex-1 overflow-x-hidden overflow-y-auto px-3 py-5">
          <div className="space-y-2">
            {navItems.map((item) => {
              const active = isActive(item.route);

              return (
                <button
                  key={item.route}
                  type="button"
                  title={
                    sidebarCollapsed
                      ? item.label
                      : ""
                  }
                  onClick={() => {
                    if (window.innerWidth >= 1024) {
                      handleDesktopNavigation(
                        item.route
                      );
                    } else {
                      handleMobileNavigation(
                        item.route
                      );
                    }
                  }}
                  className={`
                    flex w-full
                    items-center
                    rounded-xl
                    py-3
                    font-medium
                    transition-all
                    duration-200
                    active:scale-[0.98]

                    ${
                      sidebarCollapsed
                        ? "lg:justify-center lg:px-0"
                        : "gap-3 px-4"
                    }

                    ${
                      active
                        ? `
                          bg-[#4f46e5]
                          text-white
                          shadow-[0_6px_18px_rgba(79,70,229,0.30)]
                        `
                        : `
                          text-[var(--app-secondary-text)]
                          hover:bg-[var(--app-card-2)]
                          hover:text-[var(--app-text)]
                        `
                    }
                  `}
                >
                  <span
                    className={`
                      flex h-8 w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      text-[19px]
                      transition-transform
                      duration-200
                      hover:scale-110

                      ${
                        active
                          ? "bg-white/10"
                          : ""
                      }
                    `}
                  >
                    {item.icon}
                  </span>

                  <span
  className={`
    flex-1
    min-w-0
    truncate
    text-left
    transition-opacity
    duration-200

    ${
      sidebarCollapsed
        ? "lg:hidden"
        : ""
    }
  `}
>
  {item.label}
</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* ================= LOGOUT ================= */}

        <div
          className="
            shrink-0
            border-t
            border-[var(--app-border)]
            p-3
          "
        >
          <button
            type="button"
            title={
              sidebarCollapsed
                ? "Logout"
                : ""
            }
            onClick={handleLogout}
            className={`
              flex w-full
              items-center
              rounded-xl
              bg-red-500/10
              py-3
              font-semibold
              text-red-500
              transition-all
              duration-200
              hover:bg-red-500/20
              active:scale-[0.98]

              ${
                sidebarCollapsed
                  ? "lg:justify-center lg:px-0"
                  : "gap-3 px-4"
              }
            `}
          >
            <span
              className="
                flex h-8 w-8
                shrink-0
                items-center
                justify-center
                text-lg
              "
            >
              🚪
            </span>

            <span
              className={
                sidebarCollapsed
                  ? "lg:hidden"
                  : ""
              }
            >
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}

      <main
        className={`
          min-h-screen
          min-w-0
          overflow-x-hidden

          bg-[var(--app-bg)]
          text-[var(--app-text)]

          transition-[margin,background-color,color]
          duration-300 ease-in-out

          ${
            sidebarCollapsed
              ? "lg:ml-[88px]"
              : "lg:ml-[250px]"
          }

          px-4 py-5
          sm:px-6 sm:py-6
          lg:px-8 lg:py-7
          xl:px-10
        `}
      >
        {/* ================= TOP BAR ================= */}

        <header
          className="
            mb-8
            flex
            items-start
            justify-between
            gap-4
            sm:items-center
          "
        >
          {/* LEFT SIDE */}

          <div
            className="
              flex
              min-w-0
              items-start
              gap-3
            "
          >
            {/* MOBILE MENU */}

            <button
              type="button"
              onClick={() =>
                setMobileSidebarOpen(true)
              }
              className="
                flex h-10 w-10
                shrink-0
                items-center
                justify-center
                rounded-xl

                border
                border-[var(--app-border)]

                bg-[var(--app-card)]
                text-xl
                text-[var(--app-text)]

                transition-all
                duration-200

                hover:bg-[var(--app-card-2)]
                active:scale-95

                lg:hidden
              "
            >
              ☰
            </button>

            {/* PAGE TITLE */}

            <div className="min-w-0">
              <h1
                className="
                  truncate
                  text-[25px]
                  font-semibold
                  leading-tight
                  text-[var(--app-text)]
                  sm:text-[27px]
                "
              >
                {pageTitle}
              </h1>

              {pageSubtitle && (
                <p
                  className="
                    mt-2
                    max-w-3xl
                    text-sm
                    leading-relaxed
                    text-[var(--app-secondary-text)]
                  "
                >
                  {pageSubtitle}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT SIDE */}

          <div
            className="
              flex
              shrink-0
              items-center
              gap-2
              sm:gap-4
            "
          >
            {/* THEME TOGGLE */}

            <ThemeToggle />

            {/* ================= NOTIFICATIONS ================= */}

            <div
              ref={notificationRef}
              className="relative"
            >
              <button
                type="button"
                onClick={() =>
                  setShowNotifications(
                    (previous) => !previous
                  )
                }
                className="
                  relative
                  flex h-10 w-10
                  items-center
                  justify-center
                  rounded-xl
                  text-xl
                  transition-all
                  duration-200
                  hover:bg-[var(--app-card-2)]
                  active:scale-95
                "
              >
                🔔

                {unreadCount > 0 && (
                  <span
                    className="
                      absolute
                      -right-1
                      -top-1
                      flex
                      h-5
                      min-w-5
                      items-center
                      justify-center
                      rounded-full
                      bg-red-500
                      px-1
                      text-[10px]
                      font-bold
                      text-white
                    "
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* NOTIFICATION DROPDOWN */}

              {showNotifications && (
                <div
                  className="
                    absolute
                    right-0
                    top-12
                    z-[100]

                    flex
                    w-[calc(100vw-2rem)]
                    max-w-[360px]
                    flex-col

                    overflow-hidden
                    rounded-2xl

                    border
                    border-[var(--app-border)]

                    bg-[var(--app-card)]
                    text-[var(--app-text)]

                    shadow-2xl
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      justify-between

                      border-b
                      border-[var(--app-border)]

                      px-4
                      py-4
                    "
                  >
                    <span
                      className="
                        font-semibold
                        text-[var(--app-text)]
                      "
                    >
                      Notifications
                    </span>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="
                          text-xs
                          font-semibold
                          text-[#8b5cf6]
                          transition
                          hover:text-[#a78bfa]
                        "
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[350px] overflow-y-auto">
                    {notifications.length === 0 && (
                      <div
                        className="
                          px-5
                          py-10
                          text-center
                          text-sm
                          text-[var(--app-secondary-text)]
                        "
                      >
                        You're all caught up.
                        No notifications yet.
                      </div>
                    )}

                    {notifications.map(
                      (notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => {
                            if (
                              !notification.read
                            ) {
                              markAsRead(
                                notification.id
                              );
                            }
                          }}
                          className={`
                            block
                            w-full
                            border-b
                            border-[var(--app-border)]
                            px-4
                            py-4
                            text-left
                            transition
                            last:border-b-0
                            hover:bg-[var(--app-card-2)]

                            ${
                              !notification.read
                                ? "bg-[#4f46e5]/10"
                                : ""
                            }
                          `}
                        >
                          <p
                            className={`
                              text-sm
                              leading-relaxed

                              ${
                                notification.read
                                  ? "text-[var(--app-secondary-text)]"
                                  : "font-semibold text-[var(--app-text)]"
                              }
                            `}
                          >
                            {notification.message}
                          </p>

                          <span
                            className="
                              mt-1
                              block
                              text-xs
                              text-[var(--app-muted)]
                            "
                          >
                            {timeAgo(
                              notification.createdAt
                            )}
                          </span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ================= USER ================= */}

            <div
              className="
                flex
                items-center
                gap-2
                rounded-full

                border
                border-[var(--app-border)]

                bg-[var(--app-card)]

                p-1
                pr-2

                sm:gap-3
                sm:pr-4
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#4f46e5]
                  font-bold
                  text-white
                "
              >
                {initials}
              </div>

              <div
                className="
                  hidden
                  min-w-0
                  sm:block
                "
              >
                <p
                  className="
                    max-w-[180px]
                    truncate
                    text-sm
                    font-semibold
                    text-[var(--app-text)]
                  "
                >
                  {userEmail || "Guest"}
                </p>

                <p
                  className="
                    text-xs
                    capitalize
                    text-[var(--app-secondary-text)]
                  "
                >
                  {role.toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ================= PAGE CONTENT ================= */}

        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;