import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import {
  FiActivity,
  FiAlertCircle,
  FiArrowUpRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

import StatCard from "../../components/doctor/StatCard";
import AppointmentCard from "../../components/doctor/AppointmentCard";
import PatientCard from "../../components/doctor/PatientCard";
import CalendarWidget from "../../components/doctor/CalendarWidget";

import {
  extractDoctorDashboard,
  getDoctorDashboard,
} from "@/services/doctorDashboardApi";

const DEFAULT_STATISTICS = {
  total_appointments: 0,
  today_appointments: 0,
  total_patients: 0,
  pending_appointments: 0,
  confirmed_appointments: 0,
  completed_appointments: 0,
};

const STATUS_SUMMARY_CONFIG = [
  {
    key: "confirmed",
    label: "Confirmed",
    barClass: "bg-[var(--primary)]",
  },
  {
    key: "completed",
    label: "Completed",
    barClass: "bg-[var(--success)]",
  },
  {
    key: "pending",
    label: "Pending",
    barClass: "bg-[var(--warning)]",
  },
];

function getErrorMessage(
  error,
  fallback = "Unable to load Doctor Dashboard."
) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function toNumber(value) {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : 0;
}

function clampPercentage(value) {
  return Math.min(
    100,
    Math.max(0, toNumber(value))
  );
}

function formatTime(value) {
  if (!value) {
    return "Time unavailable";
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

  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${String(displayHour).padStart(
    2,
    "0"
  )}:${minute} ${period}`;
}

function formatDate(value) {
  if (!value) {
    return "No visit recorded";
  }

  const normalizedValue =
    String(value).includes("T")
      ? value
      : `${value}T00:00:00`;

  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function normalizeStatus(value) {
  const status = String(value || "pending")
    .trim()
    .toLowerCase();

  const statuses = {
    pending: "Pending",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    canceled: "Cancelled",
    upcoming: "Upcoming",
  };

  return statuses[status] || "Pending";
}

function normalizeAppointment(
  appointment = {}
) {
  return {
    id:
      appointment.id ??
      appointment._id ??
      appointment.appointment_id,

    patient:
      appointment.patient_name ||
      appointment.patientName ||
      appointment.patient?.full_name ||
      appointment.patient?.name ||
      appointment.patient ||
      "Unknown Patient",

    reason:
      appointment.reason ||
      appointment.service_name ||
      appointment.serviceName ||
      appointment.service?.name ||
      appointment.notes ||
      "General Consultation",

    time: formatTime(
      appointment.appointment_time ||
        appointment.appointmentTime ||
        appointment.time
    ),

    type:
      appointment.appointment_type ||
      appointment.appointmentType ||
      appointment.consultation_type ||
      appointment.type ||
      "In Clinic",

    status: normalizeStatus(
      appointment.status
    ),
  };
}

function normalizePatient(patient = {}) {
  const appointmentCount = toNumber(
    patient.appointment_count
  );

  return {
    id:
      patient.id ??
      patient._id ??
      patient.patient_id,

    name:
      patient.full_name ||
      patient.fullName ||
      patient.name ||
      "Unknown Patient",

    condition:
      patient.condition ||
      patient.diagnosis ||
      patient.health_condition ||
      `${appointmentCount} appointment${
        appointmentCount === 1 ? "" : "s"
      }`,

    lastVisit: formatDate(
      patient.last_appointment ||
        patient.lastAppointment ||
        patient.last_visit
    ),

    phone:
      patient.phone ||
      patient.phone_number ||
      "Not provided",

    bloodGroup:
      patient.blood_group ||
      patient.bloodGroup ||
      "N/A",

    avatar:
      patient.avatar_url ||
      patient.avatar ||
      patient.profile_image ||
      "",
  };
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] =
    useState({
      doctor: null,
      statistics: DEFAULT_STATISTICS,
      todayAppointments: [],
      recentPatients: [],
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  const loadDashboard =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await getDoctorDashboard();

        const payload =
          extractDoctorDashboard(response);

        const statistics = {
          ...DEFAULT_STATISTICS,
          ...(payload?.statistics || {}),
        };

        const appointmentList =
          Array.isArray(
            payload?.today_appointments
          )
            ? payload.today_appointments
            : Array.isArray(
                  payload?.upcoming_appointments
                )
              ? payload.upcoming_appointments
              : [];

        const patientList = Array.isArray(
          payload?.recent_patients
        )
          ? payload.recent_patients
          : [];

        setDashboardData({
          doctor: payload?.doctor || null,
          statistics,

          todayAppointments:
            appointmentList.map(
              normalizeAppointment
            ),

          recentPatients:
            patientList.map(
              normalizePatient
            ),
        });
      } catch (requestError) {
        setError(
          getErrorMessage(requestError)
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

  const totalAppointments = toNumber(
    statistics.total_appointments ??
      statistics.totalAppointments
  );

  const todayAppointmentsCount = toNumber(
    statistics.today_appointments ??
      statistics.todayAppointments
  );

  const totalPatients = toNumber(
    statistics.total_patients ??
      statistics.totalPatients
  );

  const pendingAppointments = toNumber(
    statistics.pending_appointments ??
      statistics.pendingAppointments
  );

  const confirmedAppointments = toNumber(
    statistics.confirmed_appointments ??
      statistics.confirmedAppointments
  );

  const completedAppointments = toNumber(
    statistics.completed_appointments ??
      statistics.completedAppointments
  );

  const completionRate =
    totalAppointments > 0
      ? clampPercentage(
          Math.round(
            (completedAppointments /
              totalAppointments) *
              100
          )
        )
      : 0;

  const doctorName =
    dashboardData.doctor?.full_name ||
    dashboardData.doctor?.fullName ||
    dashboardData.doctor?.name ||
    dashboardData.doctor?.user
      ?.full_name ||
    dashboardData.doctor?.user?.name ||
    "Doctor";

  const stats = useMemo(
    () => [
      {
        title: "Today's Appointments",
        value:
          todayAppointmentsCount.toLocaleString(),
        detail: `${confirmedAppointments} confirmed`,
        icon: FiCalendar,
        accent:
          "from-[var(--primary)] to-[#4f8ee8]",
      },
      {
        title: "Total Patients",
        value:
          totalPatients.toLocaleString(),
        detail: "Unique registered patients",
        icon: FiUsers,
        accent:
          "from-[var(--secondary)] to-[#8faa25]",
      },
      {
        title: "Completed",
        value:
          completedAppointments.toLocaleString(),
        detail: `${completionRate}% completion rate`,
        icon: FiCheckCircle,
        accent:
          "from-[var(--success)] to-[#16a34a]",
      },
      {
        title: "Pending",
        value:
          pendingAppointments.toLocaleString(),
        detail: "Needs follow-up",
        icon: FiClock,
        accent:
          "from-[var(--warning)] to-[#d97706]",
      },
    ],
    [
      todayAppointmentsCount,
      confirmedAppointments,
      totalPatients,
      completedAppointments,
      completionRate,
      pendingAppointments,
    ]
  );

  const statusSummary =
    STATUS_SUMMARY_CONFIG.map((item) => {
      const values = {
        confirmed: confirmedAppointments,
        completed: completedAppointments,
        pending: pendingAppointments,
      };

      return {
        ...item,
        value: values[item.key],
      };
    });

  if (loading) {
    return <DashboardLoading />;
  }

  if (error) {
    return (
      <DashboardError
        message={error}
        onRetry={loadDashboard}
      />
    );
  }

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
      {/* Welcome and performance */}
      <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(310px,0.6fr)]">
        <article className="relative min-w-0 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--primary)]/20 bg-gradient-to-br from-[var(--primary)] to-[#4f8ee8] p-5 text-white shadow-[var(--shadow-card)] sm:p-6 lg:p-7">
          <div className="pointer-events-none absolute -right-20 -top-24 h-60 w-60 rounded-full bg-white/10" />

          <div className="pointer-events-none absolute -bottom-24 right-16 h-52 w-52 rounded-full bg-white/10" />

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/75 sm:text-sm">
                  Practice Overview
                </p>

                <h1 className="mt-2 font-heading text-2xl font-bold leading-tight sm:text-3xl">
                  Welcome back, {doctorName}.
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:text-[15px]">
                  Monitor appointments,
                  patients, and daily practice
                  activity from one organized
                  workspace.
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] border border-white/15 bg-white/15 backdrop-blur-sm sm:h-12 sm:w-12">
                <FiTrendingUp size={22} />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5 sm:mt-7">
              <OverviewBadge
                text={`${totalAppointments.toLocaleString()} total appointments`}
              />

              <OverviewBadge
                text={`${confirmedAppointments.toLocaleString()} confirmed`}
              />

              <OverviewBadge
                text={`${pendingAppointments.toLocaleString()} pending`}
              />
            </div>
          </div>
        </article>

        <article className="min-w-0 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--body)]">
                Appointment Performance
              </p>

              <h2 className="mt-1 font-heading text-2xl font-bold text-[var(--heading)]">
                {completionRate}%
              </h2>

              <p className="mt-1 text-xs font-semibold text-[var(--success)]">
                {completedAppointments.toLocaleString()}{" "}
                of{" "}
                {totalAppointments.toLocaleString()}{" "}
                completed
              </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--primary-light)] text-[var(--primary)]">
              <FiActivity size={21} />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {statusSummary.map((item) => {
              const percentage =
                totalAppointments > 0
                  ? clampPercentage(
                      Math.round(
                        (item.value /
                          totalAppointments) *
                          100
                      )
                    )
                  : 0;

              return (
                <div key={item.key}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                    <span className="font-medium text-[var(--body)]">
                      {item.label}
                    </span>

                    <span className="font-bold text-[var(--heading)]">
                      {item.value.toLocaleString()}
                    </span>
                  </div>

                  <div
                    className="h-2 overflow-hidden rounded-full bg-[var(--section)]"
                    role="progressbar"
                    aria-label={`${item.label} appointments`}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-valuenow={percentage}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${percentage}%`,
                      }}
                      transition={{
                        duration: 0.55,
                      }}
                      className={`h-full rounded-full ${item.barClass}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      {/* Statistics */}
      <section
        className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Doctor dashboard statistics"
      >
        {stats.map((item, index) => (
          <motion.div
            key={item.title}
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
              delay: index * 0.05,
            }}
            className="min-w-0"
          >
            <StatCard {...item} />
          </motion.div>
        ))}
      </section>

      {/* Main dashboard content */}
      <section className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div className="min-w-0 space-y-6">
          <DashboardSection
            title="Today's Schedule"
            description="Appointments scheduled for today"
            actionLabel="View all"
            onAction={() =>
              navigate("/doctor/appointments")
            }
          >
            {dashboardData.todayAppointments
              .length > 0 ? (
              <div className="space-y-3">
                {dashboardData.todayAppointments.map(
                  (appointment, index) => (
                    <AppointmentCard
                      key={
                        appointment.id ??
                        `${appointment.patient}-${index}`
                      }
                      appointment={appointment}
                    />
                  )
                )}
              </div>
            ) : (
              <EmptyState
                icon={FiCalendar}
                title="No appointments today"
                description="Your scheduled appointments will appear here."
              />
            )}
          </DashboardSection>

          <DashboardSection
            title="Recent Patients"
            description="Your latest patient interactions"
            actionLabel="See history"
            onAction={() =>
              navigate("/doctor/patients")
            }
          >
            {dashboardData.recentPatients
              .length > 0 ? (
              <div className="grid min-w-0 gap-3 md:grid-cols-2">
                {dashboardData.recentPatients.map(
                  (patient, index) => (
                    <PatientCard
                      key={
                        patient.id ??
                        `${patient.name}-${index}`
                      }
                      patient={patient}
                    />
                  )
                )}
              </div>
            ) : (
              <EmptyState
                icon={FiUsers}
                title="No recent patients"
                description="Recent patient activity will appear here."
              />
            )}
          </DashboardSection>
        </div>

        <aside className="min-w-0 space-y-6">
          <CalendarWidget />

          <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary)]">
                Overview
              </p>

              <h2 className="mt-1 font-heading text-lg font-bold text-[var(--heading)]">
                Practice Summary
              </h2>

              <p className="mt-1 text-sm leading-6 text-[var(--body)]">
                Current appointment and patient
                activity.
              </p>
            </div>

            <div className="mt-5 space-y-3">
              <SummaryItem
                icon={FiCalendar}
                label="Appointments today"
                value={todayAppointmentsCount}
              />

              <SummaryItem
                icon={FiCheckCircle}
                label="Confirmed"
                value={confirmedAppointments}
              />

              <SummaryItem
                icon={FiClock}
                label="Pending"
                value={pendingAppointments}
              />

              <SummaryItem
                icon={FiUsers}
                label="Total patients"
                value={totalPatients}
              />
            </div>
          </section>
        </aside>
      </section>
    </motion.div>
  );
}

function OverviewBadge({ text }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm sm:text-sm">
      {text}
    </span>
  );
}

function SummaryItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <article className="flex min-w-0 items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--section)] p-3.5 sm:p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary-light)] text-[var(--primary)]">
          <Icon size={18} />
        </div>

        <p className="min-w-0 text-sm font-medium text-[var(--heading)]">
          {label}
        </p>
      </div>

      <p className="shrink-0 font-heading text-lg font-bold text-[var(--heading)]">
        {toNumber(value).toLocaleString()}
      </p>
    </article>
  );
}

function DashboardSection({
  title,
  description,
  actionLabel,
  onAction,
  children,
}) {
  return (
    <section className="min-w-0 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-heading text-lg font-bold text-[var(--heading)]">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--body)]">
            {description}
          </p>
        </div>

        <button
          type="button"
          onClick={onAction}
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary-light)] px-4 py-2 text-sm font-semibold text-[var(--primary)] transition-all duration-300 hover:bg-[var(--primary)] hover:text-white focus:outline-none focus:ring-4 focus:ring-[var(--primary-light)] sm:w-auto"
        >
          {actionLabel}

          <FiArrowUpRight size={15} />
        </button>
      </div>

      {children}
    </section>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--section)] px-5 py-9 text-center sm:py-10">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)]">
        <Icon size={21} />
      </div>

      <h3 className="mt-4 font-heading font-bold text-[var(--heading)]">
        {title}
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[var(--body)]">
        {description}
      </p>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div
      className="flex min-h-[420px] items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] px-8 py-7 text-center shadow-[var(--shadow-soft)]">
        <FiRefreshCw className="mx-auto animate-spin text-3xl text-[var(--primary)]" />

        <p className="mt-4 font-heading text-sm font-bold text-[var(--heading)]">
          Loading Doctor Dashboard
        </p>

        <p className="mt-1 text-xs text-[var(--muted)]">
          Please wait while we prepare your
          practice overview.
        </p>
      </div>
    </div>
  );
}

function DashboardError({
  message,
  onRetry,
}) {
  return (
    <div className="flex min-h-[420px] items-center justify-center">
      <div className="w-full max-w-md rounded-[var(--radius-xl)] border border-red-100 bg-[var(--card)] p-6 text-center shadow-[var(--shadow-soft)] sm:p-7">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-[var(--danger)]">
          <FiAlertCircle size={23} />
        </div>

        <h2 className="mt-4 font-heading text-lg font-bold text-[var(--heading)]">
          Dashboard unavailable
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--body)]">
          {message}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-button)] transition-all duration-300 hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-light)] sm:w-auto"
        >
          <FiRefreshCw size={16} />

          Try again
        </button>
      </div>
    </div>
  );
}