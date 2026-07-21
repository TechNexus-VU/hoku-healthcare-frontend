import { NavLink, useNavigate } from "react-router-dom";

import {
  FiCalendar,
  FiClock,
  FiHome,
  FiLogOut,
  FiSettings,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";

import { useAuth } from "../../hooks/useAuth";

const links = [
  {
    name: "Dashboard",
    path: "/doctor/dashboard",
    icon: FiHome,
  },
  {
    name: "Appointments",
    path: "/doctor/appointments",
    icon: FiCalendar,
  },
  {
    name: "Patient History",
    path: "/doctor/patients",
    icon: FiUsers,
  },
  {
    name: "Availability",
    path: "/doctor/availability",
    icon: FiClock,
  },
  {
    name: "Profile",
    path: "/doctor/profile",
    icon: FiUser,
  },
  {
    name: "Settings",
    path: "/doctor/settings",
    icon: FiSettings,
  },
];

export default function Sidebar({
  open,
  onClose,
}) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose?.();

    navigate("/doctor/login", {
      replace: true,
    });
  };

  const handleNavigation = () => {
    onClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex h-screen
          w-[272px] max-w-[86vw]
          flex-col
          border-r border-[var(--border)]
          bg-[var(--card)]
          shadow-[var(--shadow-card)]
          transition-transform duration-300 ease-in-out

          lg:sticky
          lg:top-0
          lg:z-30
          lg:w-[272px]
          lg:max-w-none
          lg:shrink-0
          lg:translate-x-0
          lg:shadow-none

          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Sidebar header */}
        <div className="flex min-h-[88px] items-center justify-between border-b border-[var(--border)] px-5">
          <div className="flex min-w-0 items-center gap-3">
            {/* Logo */}
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--primary)] font-heading text-lg font-bold text-[var(--white)] shadow-[var(--shadow-button)]">
              H

              <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-[var(--secondary)]" />
            </div>

            {/* Brand */}
            <div className="min-w-0">
              <p className="truncate font-heading text-sm font-bold text-[var(--heading)]">
                HOKU Health Care
              </p>

              <p className="mt-0.5 truncate text-xs font-medium text-[var(--muted)]">
                Doctor Portal
              </p>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--section)] text-[var(--body)] transition hover:border-[var(--primary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] lg:hidden"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Portal label */}
        <div className="px-5 pb-3 pt-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
            Doctor Workspace
          </p>
        </div>

        {/* Navigation */}
        <nav
          className="min-h-0 flex-1 overflow-y-auto px-4 pb-4"
          aria-label="Doctor portal navigation"
        >
          <ul className="space-y-1.5">
            {links.map(
              ({
                name,
                path,
                icon: Icon,
              }) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    onClick={handleNavigation}
                    className={({
                      isActive,
                    }) =>
                      `group relative flex min-h-12 items-center gap-3 overflow-hidden rounded-[var(--radius-md)] px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                        isActive
                          ? "bg-[var(--primary-light)] text-[var(--primary)]"
                          : "text-[var(--body)] hover:bg-[var(--section)] hover:text-[var(--primary)]"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Active side indicator */}
                        <span
                          className={`absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-[var(--secondary)] transition-opacity ${
                            isActive
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        />

                        {/* Icon */}
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] transition-all duration-300 ${
                            isActive
                              ? "bg-[var(--primary)] text-white shadow-sm"
                              : "bg-[var(--section)] text-[var(--body)] group-hover:bg-[var(--primary-light)] group-hover:text-[var(--primary)]"
                          }`}
                        >
                          <Icon size={18} />
                        </span>

                        <span className="min-w-0 flex-1 truncate">
                          {name}
                        </span>
                      </>
                    )}
                  </NavLink>
                </li>
              )
            )}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="border-t border-[var(--border)] bg-[var(--section)]/60 p-4">
          {/* Support message */}
          <div className="mb-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--secondary)] opacity-50" />

                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--secondary)]" />
              </span>

              <p className="text-xs font-semibold text-[var(--heading)]">
                Doctor portal active
              </p>
            </div>

            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
              Manage appointments, patients, and availability.
            </p>
          </div>

          {/* Logout button */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-11 w-full items-center justify-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-semibold text-[var(--danger)] transition-all duration-300 hover:border-[var(--danger)] hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100"
          >
            <FiLogOut size={18} />

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}