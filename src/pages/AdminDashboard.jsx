import React, { useState } from "react";

import {
  AlarmClock,
  CalendarCheck,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  ShieldCheck,
  Stethoscope,
  Users,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import Dashboard from "@/components/admin/dashboard/Dashboard";
import DoctorManagement from "@/components/admin/dashboard/DoctorManagement";
import PatientManagement from "@/components/admin/dashboard/PatientManagement";
import AppointmentManagement from "@/components/admin/dashboard/AppointmentManagement";
import ServiceManagement from "@/components/admin/dashboard/ServiceManagement";
import ReminderManagement from "@/components/admin/dashboard/ReminderManagement";
import ReviewManagement from "@/components/admin/dashboard/ReviewManagement";

import {
  clearAdminAuthentication,
  getCurrentAdmin,
} from "@/services/adminAuthApi";

const NAV_ITEMS = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    Component: Dashboard,
  },
  {
    key: "doctors",
    label: "Doctors",
    icon: Stethoscope,
    Component: DoctorManagement,
  },
  {
    key: "patients",
    label: "Patients",
    icon: Users,
    Component: PatientManagement,
  },
  {
    key: "appointments",
    label: "Appointments",
    icon: CalendarCheck,
    Component: AppointmentManagement,
  },
  {
    key: "services",
    label: "Services",
    icon: HeartPulse,
    Component: ServiceManagement,
  },
  {
    key: "reminders",
    label: "Reminders",
    icon: AlarmClock,
    Component: ReminderManagement,
  },
  {
    key: "reviews",
    label: "Reviews",
    icon: MessageSquareText,
    Component: ReviewManagement,
  },
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  const [active, setActive] =
    useState("dashboard");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const admin = getCurrentAdmin();

  const ActiveComponent =
    NAV_ITEMS.find(
      (item) => item.key === active
    )?.Component || Dashboard;

  const adminName =
    admin?.full_name ||
    admin?.fullName ||
    admin?.name ||
    "Administrator";

  const adminEmail =
    admin?.email || "Admin account";

  const handleNavigation = (key) => {
    setActive(key);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    clearAdminAuthentication();

    navigate("/admin/login", {
      replace: true,
    });
  };

  return (
    <div className="flex min-h-screen bg-[#F5F5F5] font-['Inter']">
      {/* Mobile topbar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-4 lg:hidden">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#2E7D32]">
            Hoku Health Care
          </p>

          <p className="font-['Poppins'] font-semibold text-[#1A1A2E]">
            Admin Panel
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setSidebarOpen(
              (current) => !current
            )
          }
          aria-label="Toggle Admin menu"
          className="rounded-lg p-2 text-[#1A1A2E] transition hover:bg-gray-100"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 shrink-0 transform flex-col border-r border-gray-100 bg-white pt-16 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:pt-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* Desktop sidebar heading */}
        <div className="hidden border-b border-gray-100 px-6 py-6 lg:block">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#2E7D32]/10 text-[#2E7D32]">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-widest text-[#2E7D32]">
            Hoku Health Care
          </p>

          <p className="mt-1 font-['Poppins'] text-lg font-bold text-[#1A1A2E]">
            Admin Panel
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {NAV_ITEMS.map(
            ({
              key,
              label,
              icon: Icon,
            }) => {
              const isActive =
                active === key;

              return (
                <button
                  type="button"
                  key={key}
                  onClick={() =>
                    handleNavigation(key)
                  }
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                    isActive
                      ? "bg-[#2E7D32] text-white shadow-sm"
                      : "text-[#1A1A2E] hover:bg-[#F5F5F5]"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />

                  <span>{label}</span>
                </button>
              );
            }
          )}
        </nav>

        {/* Admin account and logout */}
        <div className="border-t border-gray-100 p-4">
          <div className="mb-3 rounded-xl bg-[#F5F5F5] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1565C0] text-sm font-semibold text-white">
                {adminName
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#1A1A2E]">
                  {adminName}
                </p>

                <p className="truncate text-xs text-[#6B7280]">
                  {adminEmail}
                </p>

                <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-[#2E7D32]">
                  Administrator
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm font-semibold text-[#DC2626] transition hover:border-red-200 hover:bg-red-100"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close Admin sidebar"
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
        />
      )}

      {/* Page content */}
      <main className="min-w-0 flex-1 pt-16 lg:pt-0">
        <ActiveComponent
          onNavigate={handleNavigation}
        />
      </main>
    </div>
  );
}