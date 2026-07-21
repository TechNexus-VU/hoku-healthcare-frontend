import { Link, useLocation } from "react-router-dom";
import dayjs from "dayjs";

import {
  FiBell,
  FiCalendar,
  FiMenu,
  FiSearch,
  FiUser,
} from "react-icons/fi";

import { useAuth } from "../../hooks/useAuth";

const pageTitles = {
  "/doctor/dashboard": {
    title: "Dashboard",
    description: "Overview of your daily activities",
  },
  "/doctor/appointments": {
    title: "Appointments",
    description: "Manage patient appointments",
  },
  "/doctor/patients": {
    title: "Patient History",
    description: "Review patient information and records",
  },
  "/doctor/availability": {
    title: "Availability",
    description: "Manage your working schedule",
  },
  "/doctor/profile": {
    title: "Profile",
    description: "Manage your professional information",
  },
  "/doctor/settings": {
    title: "Settings",
    description: "Manage your account preferences",
  },
};

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();
  const location = useLocation();

  const firstName =
    user?.name?.trim()?.split(" ")[0] ||
    user?.fullName?.trim()?.split(" ")[0] ||
    "Doctor";

  const doctorName =
    user?.name ||
    user?.fullName ||
    "Doctor";

  const doctorSpecialty =
    user?.specialty ||
    user?.doctor?.specialty ||
    "Healthcare Specialist";

  const doctorAvatar =
    user?.avatar_url ||
    user?.avatar ||
    user?.profile_image ||
    "";

  const currentDate = dayjs().format(
    "dddd, D MMMM YYYY"
  );

  const currentPage =
    pageTitles[location.pathname] ||
    pageTitles["/doctor/dashboard"];

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[var(--border)] bg-[var(--card)]">
      <div className="flex min-h-[72px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Left section */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile sidebar button */}
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open doctor navigation"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] text-[var(--heading)] transition-all duration-300 hover:border-[var(--primary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-light)] lg:hidden"
          >
            <FiMenu size={20} />
          </button>

          {/* Page information */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate font-heading text-base font-bold text-[var(--heading)] sm:text-lg">
                {currentPage.title}
              </h1>

              <span className="hidden h-1.5 w-1.5 rounded-full bg-[var(--secondary)] sm:block" />
            </div>

            <p className="hidden truncate text-xs text-[var(--muted)] sm:block">
              {currentPage.description}
            </p>
          </div>
        </div>

        {/* Right section */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Current date */}
          <div className="hidden items-center gap-2 rounded-[var(--radius-md)] bg-[var(--section)] px-3 py-2 xl:flex">
            <FiCalendar
              size={16}
              className="shrink-0 text-[var(--primary)]"
            />

            <span className="whitespace-nowrap text-xs font-medium text-[var(--body)]">
              {currentDate}
            </span>
          </div>

          {/* Search */}
          <label className="hidden h-10 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--section)] px-3 transition-all duration-300 focus-within:border-[var(--primary)] focus-within:bg-[var(--card)] focus-within:ring-4 focus-within:ring-[var(--primary-light)] md:flex">
            <FiSearch
              size={16}
              className="shrink-0 text-[var(--primary)]"
            />

            <input
              type="search"
              placeholder="Search dashboard"
              aria-label="Search doctor dashboard"
              className="w-28 bg-transparent text-sm text-[var(--heading)] outline-none placeholder:text-[var(--muted)] lg:w-36 xl:w-44"
            />
          </label>

          {/* Mobile search button */}
          <button
            type="button"
            aria-label="Search dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] text-[var(--heading)] transition-all duration-300 hover:border-[var(--primary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] md:hidden"
          >
            <FiSearch size={18} />
          </button>

          {/* Notification button */}
          <button
            type="button"
            aria-label="View notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] text-[var(--heading)] transition-all duration-300 hover:border-[var(--primary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-light)]"
          >
            <FiBell size={18} />

            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-[var(--card)] bg-[var(--danger)]" />
          </button>

          {/* Doctor profile */}
          <Link
            to="/doctor/profile"
            aria-label="Open doctor profile"
            className="group flex min-w-0 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-1.5 transition-all duration-300 hover:border-[var(--primary)] hover:bg-[var(--primary-light)] sm:gap-3 sm:pr-3"
          >
            {doctorAvatar ? (
              <img
                src={doctorAvatar}
                alt={doctorName}
                className="h-9 w-9 shrink-0 rounded-full border border-[var(--border)] object-cover sm:h-10 sm:w-10"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary-light)] text-sm font-bold uppercase text-[var(--primary)] sm:h-10 sm:w-10">
                {firstName.charAt(0)}
              </div>
            )}

            <div className="hidden min-w-0 sm:block">
              <p className="max-w-[125px] truncate text-sm font-semibold text-[var(--heading)] group-hover:text-[var(--primary)] lg:max-w-[150px]">
                {doctorName}
              </p>

              <p className="max-w-[125px] truncate text-xs text-[var(--muted)] lg:max-w-[150px]">
                {doctorSpecialty}
              </p>
            </div>

            <FiUser
              size={16}
              className="hidden shrink-0 text-[var(--muted)] transition-colors group-hover:text-[var(--primary)] lg:block"
            />
          </Link>
        </div>
      </div>

      {/* Mobile greeting row */}
      <div className="border-t border-[var(--border)] bg-[var(--section)] px-4 py-2.5 sm:hidden">
        <p className="truncate text-xs text-[var(--body)]">
          Welcome back,{" "}
          <span className="font-semibold text-[var(--heading)]">
            {firstName}
          </span>
          <span className="mx-2 text-[var(--muted)]">
            •
          </span>
          {dayjs().format("D MMMM")}
        </p>
      </div>
    </header>
  );
}