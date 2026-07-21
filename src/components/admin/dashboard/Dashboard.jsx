import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  AlertCircle,
  ArrowUpRight,
  CalendarCheck,
  Clock,
  LoaderCircle,
  RefreshCw,
  Star,
  Stethoscope,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  extractAdminDashboard,
  getAdminDashboard,
} from "@/services/adminDashboardApi";

const statusConfig = {
  Pending: {
    className:
      "border-amber-200 bg-amber-50 text-[var(--warning)]",
  },

  Confirmed: {
    className:
      "border-blue-200 bg-[var(--primary-light)] text-[var(--primary)]",
  },

  Completed: {
    className:
      "border-green-200 bg-green-50 text-[var(--success)]",
  },

  Cancelled: {
    className:
      "border-red-200 bg-red-50 text-[var(--danger)]",
  },
};

function normalizeStatus(value) {
  const normalizedStatus = String(
    value || "pending"
  )
    .trim()
    .toLowerCase();

  const statusMap = {
    pending: "Pending",
    confirmed: "Confirmed",
    approved: "Confirmed",
    upcoming: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    canceled: "Cancelled",
  };

  return (
    statusMap[normalizedStatus] ||
    "Pending"
  );
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

  const match = time.match(
    /^(\d{1,2}):(\d{2})/
  );

  if (!match) {
    return time;
  }

  const hour = Number(match[1]);
  const minute = match[2];

  const period =
    hour >= 12 ? "PM" : "AM";

  const displayHour =
    hour % 12 || 12;

  return `${displayHour}:${minute} ${period}`;
}

function formatDate(value) {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return String(value);
  }

  return new Intl.DateTimeFormat(
    "en-PK",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function normalizeAppointment(
  appointment = {}
) {
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

    date: formatDate(
      appointment.appointment_date ||
        appointment.appointmentDate ||
        appointment.date
    ),

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

function normalizeAppointmentList(
  payload = {}
) {
  const possibleLists = [
    payload.recent_appointments,
    payload.recentAppointments,
    payload.appointments,
    payload.data?.recent_appointments,
    payload.data?.recentAppointments,
  ];

  const appointmentList =
    possibleLists.find(Array.isArray) ||
    [];

  return appointmentList.map(
    normalizeAppointment
  );
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
  const navigate = useNavigate();

  const [
    dashboardData,
    setDashboardData,
  ] = useState({
    statistics: {},
    recentAppointments: [],
  });

  const [loading, setLoading] =
    useState(true);

  const [pageError, setPageError] =
    useState("");

  const [lastUpdated, setLastUpdated] =
    useState(null);

  const loadDashboard =
    useCallback(async () => {
      setLoading(true);
      setPageError("");

      try {
        const response =
          await getAdminDashboard();

        const extractedPayload =
          extractAdminDashboard(
            response
          );

        const payload =
          extractedPayload &&
          typeof extractedPayload ===
            "object"
            ? extractedPayload
            : {};

        setDashboardData({
          statistics:
            payload.statistics ||
            payload.stats ||
            {},

          recentAppointments:
            normalizeAppointmentList(
              payload
            ),
        });

        setLastUpdated(new Date());
      } catch (error) {
        setDashboardData({
          statistics: {},
          recentAppointments: [],
        });

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

  const statistics =
    dashboardData.statistics;

  const dashboardStats = useMemo(() => {
    const totalPatients =
      Number(
        statistics.total_patients ??
          statistics.totalPatients ??
          statistics.patients
      ) || 0;

    const totalDoctors =
      Number(
        statistics.total_doctors ??
          statistics.totalDoctors ??
          statistics.doctors
      ) || 0;

    const totalAppointments =
      Number(
        statistics.total_appointments ??
          statistics.totalAppointments ??
          statistics.appointments
      ) || 0;

    const pendingAppointments =
      Number(
        statistics.pending_appointments ??
          statistics.pendingAppointments ??
          statistics.pending
      ) || 0;

    const confirmedAppointments =
      Number(
        statistics.confirmed_appointments ??
          statistics.confirmedAppointments ??
          statistics.confirmed
      ) || 0;

    const totalReviews =
      Number(
        statistics.total_reviews ??
          statistics.totalReviews ??
          statistics.reviews
      ) || 0;

    const rawAverageRating =
      statistics.average_rating ??
      statistics.averageRating ??
      statistics.avg_rating ??
      statistics.avgRating ??
      0;

    const averageRating =
      Number.isFinite(
        Number(rawAverageRating)
      )
        ? Number(rawAverageRating)
        : 0;

    return [
      {
        label: "Total Patients",
        value:
          totalPatients.toLocaleString(),
        detail: "Registered patients",
        icon: Users,
        variant: "primary",
      },

      {
        label: "Total Doctors",
        value:
          totalDoctors.toLocaleString(),
        detail: "Registered specialists",
        icon: Stethoscope,
        variant: "success",
      },

      {
        label: "Appointments",
        value:
          totalAppointments.toLocaleString(),
        detail: `${pendingAppointments} pending · ${confirmedAppointments} confirmed`,
        icon: CalendarCheck,
        variant: "secondary",
      },

      {
        label: "Average Rating",
        value:
          averageRating.toFixed(1),
        detail: `${totalReviews.toLocaleString()} reviews`,
        icon: Star,
        variant: "warning",
      },
    ];
  }, [statistics]);

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

  const handleNavigate = (route) => {
    if (
      typeof onNavigate === "function"
    ) {
      onNavigate(route);
      return;
    }

    navigate(`/admin/${route}`);
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.3,
      }}
      className="min-w-0 space-y-5 sm:space-y-6"
    >
      {/* Dashboard header */}
      <section className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-soft)]">
        <div className="relative overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[#4f8ee8] px-5 py-6 sm:px-6 sm:py-7">
          <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-white/10" />

          <div className="absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-[var(--secondary)]/20" />

          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/75">
                HOKU Health Care
              </p>

              <h1 className="mt-2 font-heading text-2xl font-bold text-white sm:text-3xl">
                Admin Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
                Monitor patients, doctors,
                appointments, reviews, and
                recent platform activity.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <div className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-white/20 bg-white/10 px-4 text-sm font-medium text-white backdrop-blur-sm">
                <Clock size={17} />

                Updated{" "}
                {formattedLastUpdated}
              </div>

              <button
                type="button"
                onClick={loadDashboard}
                disabled={loading}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-white px-5 text-sm font-semibold text-[var(--primary)] shadow-sm transition hover:bg-[var(--primary-light)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={17}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>
            </div>
          </div>
        </div>
      </section>

      {pageError && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-[var(--radius-lg)] border border-red-200 bg-red-50 p-4 text-sm text-[var(--danger)]"
        >
          <div className="flex min-w-0 items-start gap-3">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div className="min-w-0">
              <p className="font-semibold">
                Dashboard could not be loaded
              </p>

              <p className="mt-1 break-words leading-6">
                {pageError}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setPageError("")
            }
            aria-label="Dismiss error"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] transition hover:bg-red-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {loading ? (
        <DashboardLoading />
      ) : (
        <>
          {/* Statistics */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardStats.map(
              (stat, index) => (
                <DashboardStatCard
                  key={stat.label}
                  stat={stat}
                  index={index}
                />
              )
            )}
          </section>

          {/* Recent appointments */}
          <section className="min-w-0 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-soft)]">
            <div className="flex flex-col gap-4 border-b border-[var(--border)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--primary)]">
                  Platform Activity
                </p>

                <h2 className="mt-1 font-heading text-lg font-bold text-[var(--heading)]">
                  Recent Appointments
                </h2>

                <p className="mt-1 text-sm text-[var(--body)]">
                  Latest patient bookings
                  across all registered doctors.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleNavigate(
                    "appointments"
                  )
                }
                className="inline-flex min-h-10 w-full shrink-0 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--primary-hover)] sm:w-auto"
              >
                View all

                <ArrowUpRight
                  size={17}
                />
              </button>
            </div>

            {dashboardData
              .recentAppointments.length ===
            0 ? (
              <EmptyAppointments />
            ) : (
              <>
                {/* Mobile cards */}
                <div className="space-y-3 p-4 lg:hidden">
                  {dashboardData.recentAppointments.map(
                    (
                      appointment,
                      index
                    ) => (
                      <MobileAppointmentCard
                        key={
                          appointment.id ??
                          index
                        }
                        appointment={
                          appointment
                        }
                      />
                    )
                  )}
                </div>

                {/* Desktop table */}
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[820px] text-left">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-[var(--section)]">
                        <TableHeading>
                          Patient
                        </TableHeading>

                        <TableHeading>
                          Doctor
                        </TableHeading>

                        <TableHeading>
                          Service
                        </TableHeading>

                        <TableHeading>
                          Date
                        </TableHeading>

                        <TableHeading>
                          Time
                        </TableHeading>

                        <TableHeading>
                          Status
                        </TableHeading>
                      </tr>
                    </thead>

                    <tbody>
                      {dashboardData.recentAppointments.map(
                        (
                          appointment,
                          index
                        ) => (
                          <tr
                            key={
                              appointment.id ??
                              index
                            }
                            className="border-b border-[var(--border)] transition last:border-0 hover:bg-[var(--section)]"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <PatientInitial
                                  name={
                                    appointment.patient
                                  }
                                />

                                <span className="font-semibold text-[var(--heading)]">
                                  {
                                    appointment.patient
                                  }
                                </span>
                              </div>
                            </TableCell>

                            <TableCell>
                              {
                                appointment.doctor
                              }
                            </TableCell>

                            <TableCell>
                              {
                                appointment.service
                              }
                            </TableCell>

                            <TableCell>
                              {
                                appointment.date
                              }
                            </TableCell>

                            <TableCell>
                              {
                                appointment.time
                              }
                            </TableCell>

                            <TableCell>
                              <StatusBadge
                                status={
                                  appointment.status
                                }
                              />
                            </TableCell>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        </>
      )}
    </motion.div>
  );
}

function DashboardStatCard({
  stat,
  index,
}) {
  const {
    label,
    value,
    detail,
    icon: Icon,
    variant,
  } = stat;

  const variants = {
    primary: {
      iconClass:
        "bg-[var(--primary-light)] text-[var(--primary)]",

      accentClass:
        "bg-[var(--primary)]",
    },

    success: {
      iconClass:
        "bg-green-50 text-[var(--success)]",

      accentClass:
        "bg-[var(--success)]",
    },

    secondary: {
      iconClass:
        "bg-[var(--secondary-light)] text-[var(--secondary-hover)]",

      accentClass:
        "bg-[var(--secondary)]",
    },

    warning: {
      iconClass:
        "bg-amber-50 text-[var(--warning)]",

      accentClass:
        "bg-[var(--warning)]",
    },
  };

  const selectedVariant =
    variants[variant] ||
    variants.primary;

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.25,
        delay: index * 0.05,
      }}
      className="relative min-w-0 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
    >
      <span
        className={`absolute inset-y-0 left-0 w-1 ${selectedVariant.accentClass}`}
      />

      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] ${selectedVariant.iconClass}`}
        >
          <Icon size={21} />
        </div>

        <TrendingUp
          size={17}
          className="text-[var(--success)]"
        />
      </div>

      <p className="mt-5 font-heading text-2xl font-bold text-[var(--heading)] sm:text-3xl">
        {value}
      </p>

      <p className="mt-1 text-sm font-semibold text-[var(--heading)]">
        {label}
      </p>

      <p className="mt-2 truncate text-xs text-[var(--body)]">
        {detail}
      </p>
    </motion.article>
  );
}

function MobileAppointmentCard({
  appointment,
}) {
  return (
    <article className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--section)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <PatientInitial
            name={appointment.patient}
          />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--heading)]">
              {appointment.patient}
            </p>

            <p className="mt-1 truncate text-xs text-[var(--body)]">
              {appointment.service}
            </p>
          </div>
        </div>

        <StatusBadge
          status={appointment.status}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MobileDetail
          label="Doctor"
          value={appointment.doctor}
        />

        <MobileDetail
          label="Date"
          value={appointment.date}
        />

        <MobileDetail
          label="Time"
          value={appointment.time}
        />
      </div>
    </article>
  );
}

function MobileDetail({
  label,
  value,
}) {
  return (
    <div className="min-w-0 rounded-[var(--radius-md)] bg-[var(--card)] px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-semibold text-[var(--heading)]">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const config =
    statusConfig[status] ||
    statusConfig.Pending;

  return (
    <span
      className={`inline-flex w-fit shrink-0 items-center rounded-full border px-3 py-1.5 text-xs font-semibold leading-none ${config.className}`}
    >
      {status}
    </span>
  );
}

function PatientInitial({ name }) {
  const initial = String(
    name || "Patient"
  )
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary-light)] font-heading text-sm font-bold text-[var(--primary)]">
      {initial || "P"}
    </div>
  );
}

function TableHeading({ children }) {
  return (
    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
      {children}
    </th>
  );
}

function TableCell({ children }) {
  return (
    <td className="px-5 py-4 text-sm text-[var(--body)]">
      {children}
    </td>
  );
}

function EmptyAppointments() {
  return (
    <div className="px-5 py-14 text-center sm:px-6">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)]">
        <CalendarCheck size={24} />
      </div>

      <h3 className="mt-4 font-heading text-base font-bold text-[var(--heading)]">
        No recent appointments
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--body)]">
        New patient appointments will
        appear here when bookings are
        created.
      </p>
    </div>
  );
}

function DashboardLoading() {
  return (
    <section
      role="status"
      className="flex min-h-[420px] items-center justify-center rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-soft)]"
    >
      <div className="text-center">
        <LoaderCircle className="mx-auto h-9 w-9 animate-spin text-[var(--primary)]" />

        <p className="mt-4 font-heading text-sm font-bold text-[var(--heading)]">
          Loading Admin Dashboard
        </p>

        <p className="mt-1 text-xs text-[var(--muted)]">
          Preparing platform statistics
          and appointments.
        </p>
      </div>
    </section>
  );
}