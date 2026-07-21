import {
    useEffect,
    useMemo,
    useRef,
    useState,
  } from "react";
  
  import {
    Bell,
    CalendarDays,
    ChevronDown,
    LogOut,
    Menu,
    Settings,
    ShieldCheck,
    UserRound,
    X,
  } from "lucide-react";
  
  import {
    Link,
    useLocation,
  } from "react-router-dom";
  
  const pageDetails = {
    "/admin/dashboard": {
      title: "Admin Dashboard",
      description:
        "Monitor HOKU Health Care platform activity.",
    },
  
    "/admin/doctors": {
      title: "Doctor Management",
      description:
        "Manage registered doctors and specialists.",
    },
  
    "/admin/patients": {
      title: "Patient Management",
      description:
        "Review and manage patient accounts.",
    },
  
    "/admin/appointments": {
      title: "Appointment Management",
      description:
        "Manage appointments across the platform.",
    },
  
    "/admin/services": {
      title: "Service Management",
      description:
        "Manage healthcare services and specialties.",
    },
  
    "/admin/reminders": {
      title: "Reminder Management",
      description:
        "Manage patient medication reminders and schedules.",
    },
  
    "/admin/reviews": {
      title: "Review Management",
      description:
        "Review patient feedback and ratings.",
    },
  
    "/admin/profile": {
      title: "Admin Profile",
      description:
        "Manage your administrator profile.",
    },
  
    "/admin/settings": {
      title: "Settings",
      description:
        "Manage account and platform preferences.",
    },
  };
  
  function formatRole(role) {
    if (!role) {
      return "Administrator";
    }
  
    return String(role)
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }
  
  function getInitials(name) {
    const words = String(
      name || "Administrator"
    )
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  
    if (words.length === 0) {
      return "A";
    }
  
    if (words.length === 1) {
      return words[0]
        .charAt(0)
        .toUpperCase();
    }
  
    return `${words[0].charAt(
      0
    )}${words[
      words.length - 1
    ].charAt(0)}`.toUpperCase();
  }
  
  function createFallbackTitle(pathname) {
    const lastSegment = pathname
      .split("/")
      .filter(Boolean)
      .pop();
  
    if (!lastSegment) {
      return "Admin Portal";
    }
  
    return lastSegment
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }
  
  export default function Topbar({
    onMenuClick = () => {},
    user = null,
    onLogout,
  }) {
    const location = useLocation();
  
    const profileMenuRef = useRef(null);
    const notificationRef = useRef(null);
  
    const [
      profileMenuOpen,
      setProfileMenuOpen,
    ] = useState(false);
  
    const [
      notificationOpen,
      setNotificationOpen,
    ] = useState(false);
  
    const [imageError, setImageError] =
      useState(false);
  
    const currentPage = useMemo(() => {
      const exactPage =
        pageDetails[location.pathname];
  
      if (exactPage) {
        return exactPage;
      }
  
      const matchingPath = Object.keys(
        pageDetails
      ).find(
        (path) =>
          path !== "/admin/dashboard" &&
          location.pathname.startsWith(
            `${path}/`
          )
      );
  
      if (matchingPath) {
        return pageDetails[matchingPath];
      }
  
      return {
        title: createFallbackTitle(
          location.pathname
        ),
  
        description:
          "Manage HOKU Health Care administration.",
      };
    }, [location.pathname]);
  
    const userName =
      user?.full_name ||
      user?.fullName ||
      user?.name ||
      "Administrator";
  
    const userEmail =
      user?.email || "Admin account";
  
    const userRole = formatRole(
      user?.role || "admin"
    );
  
    const userImage =
      user?.avatar_url ||
      user?.avatarUrl ||
      user?.avatar ||
      user?.profile_image ||
      "";
  
    const showImage =
      Boolean(userImage) &&
      !imageError;
  
    const formattedDate = useMemo(
      () =>
        new Intl.DateTimeFormat("en-PK", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(new Date()),
      []
    );
  
    useEffect(() => {
      setImageError(false);
    }, [userImage]);
  
    useEffect(() => {
      setProfileMenuOpen(false);
      setNotificationOpen(false);
    }, [location.pathname]);
  
    useEffect(() => {
      const handleOutsideClick = (
        event
      ) => {
        if (
          profileMenuRef.current &&
          !profileMenuRef.current.contains(
            event.target
          )
        ) {
          setProfileMenuOpen(false);
        }
  
        if (
          notificationRef.current &&
          !notificationRef.current.contains(
            event.target
          )
        ) {
          setNotificationOpen(false);
        }
      };
  
      const handleEscape = (event) => {
        if (event.key === "Escape") {
          setProfileMenuOpen(false);
          setNotificationOpen(false);
        }
      };
  
      document.addEventListener(
        "mousedown",
        handleOutsideClick
      );
  
      document.addEventListener(
        "keydown",
        handleEscape
      );
  
      return () => {
        document.removeEventListener(
          "mousedown",
          handleOutsideClick
        );
  
        document.removeEventListener(
          "keydown",
          handleEscape
        );
      };
    }, []);
  
    const toggleNotifications = () => {
      setNotificationOpen(
        (current) => !current
      );
  
      setProfileMenuOpen(false);
    };
  
    const toggleProfileMenu = () => {
      setProfileMenuOpen(
        (current) => !current
      );
  
      setNotificationOpen(false);
    };
  
    const closeProfileMenu = () => {
      setProfileMenuOpen(false);
    };
  
    const handleLogout = () => {
      setProfileMenuOpen(false);
      setNotificationOpen(false);
  
      if (
        typeof onLogout === "function"
      ) {
        onLogout();
      }
    };
  
    return (
      <header className="sticky top-0 z-30 min-h-[var(--topbar-height)] border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="flex min-h-[var(--topbar-height)] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Left side */}
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onMenuClick}
              aria-label="Open admin sidebar"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-[#1E63C6]/30 hover:bg-[#1E63C6]/10 hover:text-[#1E63C6] focus:outline-none focus:ring-4 focus:ring-[#1E63C6]/10 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
  
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                {currentPage.title}
              </h1>
  
              <p className="hidden truncate text-xs text-slate-500 sm:block">
                {currentPage.description}
              </p>
            </div>
          </div>
  
          {/* Right side */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Current date */}
            <div className="hidden min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-600 xl:flex">
              <CalendarDays className="h-4 w-4 text-[#1E63C6]" />
  
              {formattedDate}
            </div>
  
            {/* Notifications */}
            <div
              ref={notificationRef}
              className="relative"
            >
              <button
                type="button"
                onClick={toggleNotifications}
                aria-label="Open notifications"
                aria-haspopup="dialog"
                aria-expanded={
                  notificationOpen
                }
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition focus:outline-none focus:ring-4 focus:ring-[#1E63C6]/10 ${
                  notificationOpen
                    ? "border-[#1E63C6]/30 bg-[#1E63C6]/10 text-[#1E63C6]"
                    : "border-slate-200 bg-white text-slate-600 hover:border-[#1E63C6]/30 hover:bg-[#1E63C6]/10 hover:text-[#1E63C6]"
                }`}
              >
                <Bell className="h-[18px] w-[18px]" />
  
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
              </button>
  
              {notificationOpen && (
                <div
                  role="dialog"
                  aria-label="Admin notifications"
                  className="absolute right-0 top-[calc(100%+12px)] w-[min(340px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Notifications
                      </p>
  
                      <p className="mt-0.5 text-xs text-slate-500">
                        Recent admin updates
                      </p>
                    </div>
  
                    <button
                      type="button"
                      onClick={() =>
                        setNotificationOpen(
                          false
                        )
                      }
                      aria-label="Close notifications"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
  
                  <div className="p-4">
                    <div className="flex items-start gap-3 rounded-2xl border border-[#1E63C6]/10 bg-[#1E63C6]/5 p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1E63C6] text-white">
                        <ShieldCheck className="h-[17px] w-[17px]" />
                      </div>
  
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800">
                          Admin Portal is active
                        </p>
  
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          New platform notifications
                          and updates will appear
                          here.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
  
            {/* Profile menu */}
            <div
              ref={profileMenuRef}
              className="relative"
            >
              <button
                type="button"
                onClick={toggleProfileMenu}
                aria-haspopup="menu"
                aria-expanded={
                  profileMenuOpen
                }
                className={`flex min-h-10 items-center gap-2 rounded-xl border p-1.5 pr-2 transition focus:outline-none focus:ring-4 focus:ring-[#1E63C6]/10 ${
                  profileMenuOpen
                    ? "border-[#1E63C6]/30 bg-[#1E63C6]/10"
                    : "border-slate-200 bg-white hover:border-[#1E63C6]/30 hover:bg-[#1E63C6]/5"
                }`}
              >
                {showImage ? (
                  <img
                    src={userImage}
                    alt={userName}
                    onError={() =>
                      setImageError(true)
                    }
                    className="h-8 w-8 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E63C6] text-xs font-bold text-white">
                    {getInitials(userName)}
                  </div>
                )}
  
                <div className="hidden max-w-32 text-left md:block">
                  <p className="truncate text-xs font-semibold text-slate-800">
                    {userName}
                  </p>
  
                  <p className="truncate text-[10px] text-slate-500">
                    {userRole}
                  </p>
                </div>
  
                <ChevronDown
                  className={`hidden h-4 w-4 text-slate-500 transition-transform duration-200 sm:block ${
                    profileMenuOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>
  
              {profileMenuOpen && (
                <div
                  role="menu"
                  aria-label="Admin account menu"
                  className="absolute right-0 top-[calc(100%+12px)] w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
                >
                  <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-4">
                    <div className="flex items-center gap-3">
                      {showImage ? (
                        <img
                          src={userImage}
                          alt={userName}
                          onError={() =>
                            setImageError(true)
                          }
                          className="h-11 w-11 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1E63C6] text-sm font-bold text-white">
                          {getInitials(
                            userName
                          )}
                        </div>
                      )}
  
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {userName}
                        </p>
  
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {userEmail}
                        </p>
  
                        <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-[0.08em] text-[#61720E]">
                          {userRole}
                        </p>
                      </div>
                    </div>
                  </div>
  
                  <div className="p-2">
                    <Link
                      to="/admin/profile"
                      role="menuitem"
                      onClick={
                        closeProfileMenu
                      }
                      className="flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-[#1E63C6]/10 hover:text-[#1E63C6]"
                    >
                      <UserRound className="h-[17px] w-[17px]" />
  
                      Admin Profile
                    </Link>
  
                    <Link
                      to="/admin/settings"
                      role="menuitem"
                      onClick={
                        closeProfileMenu
                      }
                      className="flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-[#1E63C6]/10 hover:text-[#1E63C6]"
                    >
                      <Settings className="h-[17px] w-[17px]" />
  
                      Account Settings
                    </Link>
  
                    {typeof onLogout ===
                      "function" && (
                      <>
                        <div className="my-2 border-t border-slate-100" />
  
                        <button
                          type="button"
                          role="menuitem"
                          onClick={
                            handleLogout
                          }
                          className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >
                          <LogOut className="h-[17px] w-[17px]" />
  
                          Logout
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
  
        {/* Mobile page description */}
        <div className="border-t border-slate-100 px-4 py-2 sm:hidden">
          <p className="truncate text-xs text-slate-500">
            {currentPage.description}
          </p>
        </div>
      </header>
    );
  }