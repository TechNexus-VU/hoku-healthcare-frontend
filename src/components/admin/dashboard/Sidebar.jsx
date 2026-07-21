import {
    useEffect,
    useState,
  } from "react";
  
  import {
    AlarmClock,
    CalendarCheck,
    HeartPulse,
    LayoutDashboard,
    LogOut,
    MessageSquareText,
    ShieldCheck,
    Stethoscope,
    Users,
    X,
  } from "lucide-react";
  
  import {
    Link,
    NavLink,
  } from "react-router-dom";
  
  const menuSections = [
    {
      title: "Overview",
      items: [
        {
          label: "Dashboard",
          path: "/admin/dashboard",
          icon: LayoutDashboard,
          end: true,
        },
      ],
    },
    {
      title: "Management",
      items: [
        {
          label: "Doctors",
          path: "/admin/doctors",
          icon: Stethoscope,
        },
        {
          label: "Patients",
          path: "/admin/patients",
          icon: Users,
        },
        {
          label: "Appointments",
          path: "/admin/appointments",
          icon: CalendarCheck,
        },
        {
          label: "Services",
          path: "/admin/services",
          icon: HeartPulse,
        },
        {
          label: "Reminders",
          path: "/admin/reminders",
          icon: AlarmClock,
        },
        {
          label: "Reviews",
          path: "/admin/reviews",
          icon: MessageSquareText,
        },
      ],
    },
  ];
  
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
  
  function formatRole(role) {
    return String(
      role || "Administrator"
    )
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }
  
  export default function Sidebar({
    isOpen = false,
    onClose = () => {},
    user = null,
    onLogout,
  }) {
    const [imageError, setImageError] =
      useState(false);
  
    const adminName =
      user?.full_name ||
      user?.fullName ||
      user?.name ||
      "Administrator";
  
    const adminEmail =
      user?.email || "Admin account";
  
    const adminRole = formatRole(
      user?.role || "administrator"
    );
  
    const adminImage =
      user?.avatar_url ||
      user?.avatarUrl ||
      user?.avatar ||
      user?.profile_image ||
      "";
  
    const showImage =
      Boolean(adminImage) &&
      !imageError;
  
    useEffect(() => {
      setImageError(false);
    }, [adminImage]);
  
    const handleLogout = () => {
      onClose();
  
      if (
        typeof onLogout === "function"
      ) {
        onLogout();
      }
    };
  
    return (
      <>
        <button
          type="button"
          aria-label="Close admin navigation"
          onClick={onClose}
          tabIndex={isOpen ? 0 : -1}
          className={`fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
            isOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        />
  
        <aside
          aria-label="Admin navigation"
          aria-hidden={!isOpen}
          className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[var(--sidebar-width)] flex-col overflow-hidden border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 ease-out lg:translate-x-0 lg:shadow-none ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >
          {/* Brand */}
          <div className="flex h-[var(--topbar-height)] shrink-0 items-center justify-between border-b border-slate-200 px-5">
            <Link
              to="/admin/dashboard"
              onClick={onClose}
              className="group flex min-w-0 items-center gap-3"
            >
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1E63C6] text-xl font-bold text-white shadow-sm transition-transform duration-200 group-hover:scale-[1.03]">
                H
  
                <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#B7CF35]" />
              </div>
  
              <div className="min-w-0">
                <p className="truncate text-lg font-bold leading-tight text-slate-900">
                  HOKU
                </p>
  
                <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-[#1E63C6]">
                  Admin Portal
                </p>
              </div>
            </Link>
  
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sidebar"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-[#1E63C6]/10 hover:text-[#1E63C6] focus:outline-none focus:ring-4 focus:ring-[#1E63C6]/10 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
  
          {/* Portal information */}
          <div className="shrink-0 px-4 pb-2 pt-4">
            <div className="flex items-center gap-3 rounded-2xl border border-[#1E63C6]/10 bg-[#1E63C6]/5 px-3.5 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#B7CF35]/20 text-[#61720E]">
                <ShieldCheck className="h-[18px] w-[18px]" />
              </div>
  
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  Administration
                </p>
  
                <p className="truncate text-xs text-slate-500">
                  Platform management
                </p>
              </div>
            </div>
          </div>
  
          {/* Navigation */}
          <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4 [scrollbar-width:thin]">
            <div className="space-y-6">
              {menuSections.map(
                (section) => (
                  <section
                    key={section.title}
                  >
                    <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      {section.title}
                    </p>
  
                    <div className="space-y-1">
                      {section.items.map(
                        ({
                          label,
                          path,
                          icon: Icon,
                          end,
                        }) => (
                          <NavLink
                            key={path}
                            to={path}
                            end={end}
                            onClick={onClose}
                            className={({
                              isActive,
                            }) =>
                              `group relative flex min-h-11 items-center gap-3 overflow-hidden rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                                isActive
                                  ? "bg-[#1E63C6]/10 text-[#1E63C6]"
                                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                              }`
                            }
                          >
                            {({
                              isActive,
                            }) => (
                              <>
                                {isActive && (
                                  <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-[#B7CF35]" />
                                )}
  
                                <Icon
                                  className={`h-[19px] w-[19px] shrink-0 transition-colors duration-200 ${
                                    isActive
                                      ? "text-[#1E63C6]"
                                      : "text-slate-400 group-hover:text-[#1E63C6]"
                                  }`}
                                  strokeWidth={
                                    isActive
                                      ? 2.4
                                      : 2
                                  }
                                />
  
                                <span className="truncate">
                                  {label}
                                </span>
  
                                {isActive && (
                                  <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#B7CF35]" />
                                )}
                              </>
                            )}
                          </NavLink>
                        )
                      )}
                    </div>
                  </section>
                )
              )}
            </div>
          </nav>
  
          {/* Admin account */}
          <div className="shrink-0 border-t border-slate-200 bg-white p-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
              <div className="flex items-center gap-3">
                {showImage ? (
                  <img
                    src={adminImage}
                    alt={adminName}
                    onError={() =>
                      setImageError(true)
                    }
                    className="h-11 w-11 shrink-0 rounded-2xl border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1E63C6]/10 text-sm font-bold text-[#1E63C6]">
                    {getInitials(
                      adminName
                    )}
                  </div>
                )}
  
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {adminName}
                  </p>
  
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {adminEmail}
                  </p>
  
                  <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-[0.08em] text-[#61720E]">
                    {adminRole}
                  </p>
                </div>
              </div>
  
              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-red-100"
              >
                <LogOut className="h-[17px] w-[17px]" />
  
                Logout
              </button>
            </div>
          </div>
        </aside>
      </>
    );
  }