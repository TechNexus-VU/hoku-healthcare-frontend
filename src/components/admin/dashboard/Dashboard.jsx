import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowUpRight,
  CalendarCheck,
  Clock,
  LoaderCircle,
  MoreVertical,
  RefreshCw,
  Star,
  Stethoscope,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import {
  extractAdminDashboard,
  getAdminDashboard,
} from "@/services/adminDashboardApi";

const statusStyles = {
  Pending:
    "bg-amber-50 text-amber-700 ring-1 ring-amber-200",

  Confirmed:
    "bg-blue-50 text-[#1565C0] ring-1 ring-blue-200",

  Completed:
    "bg-green-50 text-[#2E7D32] ring-1 ring-green-200",

  Cancelled:
    "bg-red-50 text-[#DC2626] ring-1 ring-red-200",
};

function normalizeStatus(value) {
  const status = String(value || "pending")
    .trim()
    .toLowerCase();

  const statusMap = {
    pending: "Pending",
    confirmed: "Confirmed",
    approved: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    canceled: "Cancelled",
  };

  return statusMap[status] || "Pending";
}

function formatTime(value) {
  if (!value) {
    return "Not specified";
  }

  const time = String(value).trim();

  if (
    time.toLowerCase().includes("am") ||
    time.toLowerCase().includes("pm")
  ) {
    return time;
  }

  const match = time.match(/^(\d{1,2}):(\d{2})/);

  if (!match) {
    return time;
  }

  const hour = Number(match[1]);
  const minute = match[2];

  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${String(displayHour).padStart(
    2,
    "0"
  )}:${minute} ${period}`;
}

function normalizeAppointment(appointment = {}) {
  return {
    ...appointment,

    id:
      appointment.id ??
      appointment._id ??
      appointment.appointment_id,

    patient:
      appointment.patient_name ||
      appointment.patientName ||
      appointment.patient?.name ||
      appointment.patient ||
      "Unknown Patient",

    doctor:
      appointment.doctor_name ||
      appointment.doctorName ||
      appointment.doctor?.name ||
      appointment.doctor ||
      "Unknown Doctor",

    service:
      appointment.service_name ||
      appointment.serviceName ||
      appointment.service?.name ||
      appointment.service ||
      "Healthcare Service",

    time: formatTime(
      appointment.appointment_time ||
        appointment.appointmentTime ||
        appointment.time
    ),

    status: normalizeStatus(
      appointment.status
    ),
  };
}

function getErrorMessage(
  error,
  fallback = "Unable to load dashboard."
) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

export default function Dashboard({
  onNavigate,
}) {
  const [dashboardData, setDashboardData] =
    useState({
      statistics: {},
      recentAppointments: [],
    });

  const [loading, setLoading] =
    useState(true);

  const [pageError, setPageError] =
    useState("");

  const [lastUpdated, setLastUpdated] =
    useState(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const response =
        await getAdminDashboard();

      const payload =
        extractAdminDashboard(response);

      const statistics =
        payload?.statistics || {};

      const appointmentList =
        Array.isArray(
          payload?.recent_appointments
        )
          ? payload.recent_appointments
          : Array.isArray(
                payload?.recentAppointments
              )
            ? payload.recentAppointments
            : [];

      setDashboardData({
        statistics,
        recentAppointments:
          appointmentList.map(
            normalizeAppointment
          ),
      });

      setLastUpdated(new Date());
    } catch (error) {
      setPageError(
        getErrorMessage(error)
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const stats = useMemo(() => {
    const statistics =
      dashboardData.statistics;

    const totalPatients =
      Number(
        statistics.total_patients ??
          statistics.totalPatients
      ) || 0;

    const totalDoctors =
      Number(
        statistics.total_doctors ??
          statistics.totalDoctors
      ) || 0;

    const totalAppointments =
      Number(
        statistics.total_appointments ??
          statistics.totalAppointments
      ) || 0;

    const pendingAppointments =
      Number(
        statistics.pending_appointments ??
          statistics.pendingAppointments
      ) || 0;

    const confirmedAppointments =
      Number(
        statistics.confirmed_appointments ??
          statistics.confirmedAppointments
      ) || 0;

      const totalReviews =
      Number(
        statistics.total_reviews ??
          statistics.totalReviews
      ) || 0;
    
    const averageRatingValue =
      statistics.average_rating ??
      statistics.averageRating ??
      statistics.avg_rating ??
      statistics.avgRating;
    
    const averageRating =
      averageRatingValue !== undefined &&
      averageRatingValue !== null &&
      Number.isFinite(Number(averageRatingValue))
        ? Number(averageRatingValue)
        : 0;
        console.log("Dashboard statistics:", statistics);
    return [
      {
        label: "Total Patients",
        value: totalPatients.toLocaleString(),
        delta: "Registered patients",
        icon: Users,
        accent: "bg-[#1565C0]",
      },
      {
        label: "Total Doctors",
        value: totalDoctors.toLocaleString(),
        delta: "Registered specialists",
        icon: Stethoscope,
        accent: "bg-[#2E7D32]",
      },
      {
        label: "Total Appointments",
        value:
          totalAppointments.toLocaleString(),
        delta: `${pendingAppointments} pending · ${confirmedAppointments} confirmed`,
        icon: CalendarCheck,
        accent: "bg-[#1565C0]",
      },
      {
        label: "Avg. Rating",
        value: averageRating.toFixed(1),
        delta: `${totalReviews} reviews`,
        icon: Star,
        accent: "bg-[#2E7D32]",
      },
    ];
  }, [dashboardData.statistics]);

  const formattedLastUpdated =
    lastUpdated
      ? lastUpdated.toLocaleTimeString(
          "en-PK",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        )
      : "Not updated";

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-['Inter']">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#2E7D32]">
              Hoku Health Care
            </p>

            <h1 className="font-['Poppins'] text-2xl font-bold text-[#1A1A2E] sm:text-3xl">
              Admin Dashboard
            </h1>

            <p className="mt-1 text-sm text-[#6B7280]">
              Overview of patients, doctors,
              appointments, and platform activity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-[#6B7280] shadow-sm ring-1 ring-black/5">
              <Clock className="h-4 w-4 text-[#1565C0]" />
              Updated {formattedLastUpdated}
            </div>

            <button
              type="button"
              onClick={loadDashboard}
              disabled={loading}
              className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-[#1A1A2E] shadow-sm ring-1 ring-black/5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />
              Refresh
            </button>
          </div>
        </div>

        {pageError && (
          <div className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{pageError}</span>
            </div>

            <button
              type="button"
              onClick={() => setPageError("")}
              aria-label="Dismiss error"
              className="rounded p-1 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
            <LoaderCircle className="mb-3 h-8 w-8 animate-spin text-[#2E7D32]" />

            <p className="text-sm font-medium text-[#1A1A2E]">
              Loading dashboard...
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map(
                ({
                  label,
                  value,
                  delta,
                  icon: Icon,
                  accent,
                }) => (
                  <div
                    key={label}
                    className="rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)]"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </span>

                      <TrendingUp className="h-4 w-4 text-[#2E7D32]" />
                    </div>

                    <p className="mt-4 font-['Poppins'] text-2xl font-bold text-[#1A1A2E]">
                      {value}
                    </p>

                    <p className="text-sm text-[#6B7280]">
                      {label}
                    </p>

                    <p className="mt-2 text-xs font-medium text-[#2E7D32]">
                      {delta}
                    </p>
                  </div>
                )
              )}
            </div>

            <div className="mt-8 rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.08)] sm:p-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-['Poppins'] text-lg font-semibold text-[#1A1A2E]">
                    Recent Appointments
                  </h2>

                  <p className="text-sm text-[#6B7280]">
                    Latest bookings across all
                    doctors
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onNavigate?.(
                      "appointments"
                    )
                  }
                  className="flex items-center justify-center gap-1 rounded-lg bg-[#2E7D32] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1B5E20]"
                >
                  View all
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>

              {dashboardData.recentAppointments
                .length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <CalendarCheck className="mb-3 h-8 w-8 text-[#6B7280]" />

                  <p className="font-medium text-[#1A1A2E]">
                    No recent appointments
                  </p>

                  <p className="mt-1 text-sm text-[#6B7280]">
                    New appointments will appear
                    here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-[#6B7280]">
                        <th className="py-3 font-medium">
                          Patient
                        </th>

                        <th className="py-3 font-medium">
                          Doctor
                        </th>

                        <th className="py-3 font-medium">
                          Service
                        </th>

                        <th className="py-3 font-medium">
                          Time
                        </th>

                        <th className="py-3 font-medium">
                          Status
                        </th>

                        <th className="py-3 font-medium" />
                      </tr>
                    </thead>

                    <tbody>
                      {dashboardData.recentAppointments.map(
                        (appointment, index) => {
                          const style =
                            statusStyles[
                              appointment.status
                            ] ||
                            statusStyles.Pending;

                          return (
                            <tr
                              key={
                                appointment.id ??
                                index
                              }
                              className="border-b border-gray-50 last:border-0 hover:bg-[#F5F5F5]/60"
                            >
                              <td className="py-3 font-medium text-[#1A1A2E]">
                                {
                                  appointment.patient
                                }
                              </td>

                              <td className="py-3 text-[#6B7280]">
                                {
                                  appointment.doctor
                                }
                              </td>

                              <td className="py-3 text-[#6B7280]">
                                {
                                  appointment.service
                                }
                              </td>

                              <td className="py-3 text-[#6B7280]">
                                {appointment.time}
                              </td>

                              <td className="py-3">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-medium ${style}`}
                                >
                                  {
                                    appointment.status
                                  }
                                </span>
                              </td>

                              <td className="py-3 text-right">
                                <button
                                  type="button"
                                  aria-label={`Appointment ${appointment.id}`}
                                  className="rounded-lg p-1.5 text-[#6B7280] hover:bg-gray-100"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}