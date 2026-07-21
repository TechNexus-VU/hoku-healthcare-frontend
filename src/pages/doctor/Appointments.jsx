import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";
import dayjs from "dayjs";
import { toast } from "react-toastify";

import {
  FiAlertCircle,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiFilter,
  FiMail,
  FiPhone,
  FiRefreshCw,
  FiSearch,
  FiX,
  FiXCircle,
} from "react-icons/fi";

import StatusBadge from "../../components/doctor/StatusBadge";

import {
  extractDoctorAppointment,
  extractDoctorAppointments,
  getDoctorAppointments,
  updateDoctorAppointmentStatus,
} from "@/services/doctorAppointmentsApi";

const STATUS_OPTIONS = [
  "All",
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
];

const DEFAULT_COUNTS = {
  All: 0,
  Pending: 0,
  Confirmed: 0,
  Completed: 0,
  Cancelled: 0,
};

function getErrorMessage(
  error,
  fallback = "Unable to load appointments."
) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
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

  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${String(displayHour).padStart(
    2,
    "0"
  )}:${minute} ${period}`;
}

function formatDate(value) {
  if (!value) {
    return "Not specified";
  }

  const date = dayjs(value);

  return date.isValid()
    ? date.format("DD MMM YYYY")
    : String(value);
}

function normalizeStatus(value) {
  const status = String(value || "pending")
    .trim()
    .toLowerCase();

  const statusMap = {
    pending: "Pending",
    confirmed: "Confirmed",
    upcoming: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    canceled: "Cancelled",
  };

  return statusMap[status] || "Pending";
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
      appointment.patient?.full_name ||
      appointment.patient?.name ||
      "Unknown Patient",

    patientEmail:
      appointment.patient_email ||
      appointment.patientEmail ||
      appointment.patient?.email ||
      "",

    patientPhone:
      appointment.patient_phone ||
      appointment.patientPhone ||
      appointment.patient?.phone ||
      "",

    date:
      appointment.appointment_date ||
      appointment.appointmentDate ||
      appointment.date ||
      "",

    time: formatTime(
      appointment.appointment_time ||
        appointment.appointmentTime ||
        appointment.time
    ),

    status: normalizeStatus(
      appointment.status
    ),

    type:
      appointment.appointment_type ||
      appointment.appointmentType ||
      appointment.consultation_type ||
      appointment.type ||
      "In Clinic",

    reason:
      appointment.reason ||
      appointment.service_name ||
      appointment.serviceName ||
      appointment.service?.name ||
      appointment.notes ||
      "General Consultation",

    notes:
      appointment.notes ||
      appointment.message ||
      "",
  };
}

function getPatientInitial(name) {
  return String(name || "P")
    .trim()
    .charAt(0)
    .toUpperCase();
}

export default function Appointments() {
  const [appointments, setAppointments] =
    useState([]);

  const [query, setQuery] = useState("");

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState("All");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  const [updating, setUpdating] =
    useState({
      id: null,
      status: "",
    });

  const [
    selectedAppointment,
    setSelectedAppointment,
  ] = useState(null);

  const loadAppointments =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await getDoctorAppointments({
            page: 1,
            limit: 100,
          });

        const appointmentList =
          extractDoctorAppointments(
            response
          );

        setAppointments(
          Array.isArray(appointmentList)
            ? appointmentList.map(
                normalizeAppointment
              )
            : []
        );
      } catch (requestError) {
        setAppointments([]);

        setError(
          getErrorMessage(requestError)
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  useEffect(() => {
    if (!selectedAppointment) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedAppointment(null);
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow = "";

      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [selectedAppointment]);

  const appointmentCounts =
    useMemo(() => {
      return appointments.reduce(
        (counts, appointment) => {
          counts.All += 1;

          if (
            Object.prototype.hasOwnProperty.call(
              counts,
              appointment.status
            )
          ) {
            counts[appointment.status] += 1;
          }

          return counts;
        },
        { ...DEFAULT_COUNTS }
      );
    }, [appointments]);

  const filteredAppointments =
    useMemo(() => {
      const normalizedQuery = query
        .trim()
        .toLowerCase();

      return appointments.filter(
        (appointment) => {
          const searchableContent = [
            appointment.patient,
            appointment.type,
            appointment.reason,
            appointment.patientEmail,
            appointment.patientPhone,
          ]
            .map((value) =>
              String(value || "").toLowerCase()
            )
            .join(" ");

          const matchesSearch =
            !normalizedQuery ||
            searchableContent.includes(
              normalizedQuery
            );

          const matchesStatus =
            selectedStatus === "All" ||
            appointment.status ===
              selectedStatus;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      appointments,
      query,
      selectedStatus,
    ]);

  const handleStatusUpdate = async (
    appointment,
    nextStatus
  ) => {
    if (
      updating.id !== null ||
      !appointment?.id
    ) {
      return;
    }

    setUpdating({
      id: appointment.id,
      status: nextStatus,
    });

    try {
      const response =
        await updateDoctorAppointmentStatus(
          appointment.id,
          nextStatus
        );

      const responseAppointment =
        extractDoctorAppointment(
          response
        );

      const updatedAppointment =
        normalizeAppointment({
          ...appointment,

          ...(responseAppointment &&
          typeof responseAppointment ===
            "object"
            ? responseAppointment
            : {}),

          status: nextStatus,
        });

      setAppointments(
        (currentAppointments) =>
          currentAppointments.map(
            (currentAppointment) =>
              currentAppointment.id ===
              appointment.id
                ? updatedAppointment
                : currentAppointment
          )
      );

      setSelectedAppointment(
        (currentAppointment) =>
          currentAppointment?.id ===
          appointment.id
            ? updatedAppointment
            : currentAppointment
      );

      const successMessages = {
        confirmed:
          "Appointment confirmed successfully.",
        completed:
          "Appointment marked as completed.",
        cancelled:
          "Appointment cancelled successfully.",
      };

      toast.success(
        successMessages[nextStatus] ||
          "Appointment updated successfully."
      );
    } catch (requestError) {
      toast.error(
        getErrorMessage(
          requestError,
          "Unable to update appointment."
        )
      );
    } finally {
      setUpdating({
        id: null,
        status: "",
      });
    }
  };

  const isUpdatingAppointment = (
    appointmentId,
    status
  ) =>
    updating.id === appointmentId &&
    updating.status === status;

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
      {/* Page header */}
      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary)] sm:text-sm">
              Doctor Portal
            </p>

            <h1 className="mt-1 font-heading text-2xl font-bold text-[var(--heading)] sm:text-3xl">
              Appointments
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--body)] sm:text-base">
              Review patient booking requests,
              confirm scheduled visits, and
              maintain appointment progress.
            </p>
          </div>

          <button
            type="button"
            onClick={loadAppointments}
            disabled={loading}
            className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-semibold text-[var(--heading)] transition-all duration-300 hover:border-[var(--primary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-light)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <FiRefreshCw
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
      </section>

      {/* Status overview */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {STATUS_OPTIONS.map((status) => {
          const active =
            selectedStatus === status;

          return (
            <button
              key={status}
              type="button"
              onClick={() =>
                setSelectedStatus(status)
              }
              className={`rounded-[var(--radius-lg)] border p-4 text-left shadow-[var(--shadow-soft)] transition-all duration-300 ${
                active
                  ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                  : "border-[var(--border)] bg-[var(--card)] text-[var(--heading)] hover:border-[var(--primary)] hover:bg-[var(--primary-light)]"
              }`}
            >
              <p
                className={`text-xs font-semibold ${
                  active
                    ? "text-white/75"
                    : "text-[var(--muted)]"
                }`}
              >
                {status}
              </p>

              <p className="mt-2 font-heading text-2xl font-bold">
                {appointmentCounts[
                  status
                ].toLocaleString()}
              </p>
            </button>
          );
        })}
      </section>

      {/* Search and filters */}
      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-soft)] sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--section)] px-4 transition-all duration-300 focus-within:border-[var(--primary)] focus-within:bg-[var(--card)] focus-within:ring-4 focus-within:ring-[var(--primary-light)]">
            <FiSearch
              size={17}
              className="shrink-0 text-[var(--primary)]"
            />

            <input
              type="search"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search patient, type, reason, phone or email"
              className="w-full bg-transparent py-3 text-sm text-[var(--heading)] outline-none placeholder:text-[var(--muted)]"
            />
          </label>

          <label className="flex min-h-11 w-full items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-semibold text-[var(--heading)] transition-all duration-300 focus-within:border-[var(--primary)] focus-within:ring-4 focus-within:ring-[var(--primary-light)] md:w-auto md:min-w-[190px]">
            <FiFilter
              size={17}
              className="shrink-0 text-[var(--primary)]"
            />

            <select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(
                  event.target.value
                )
              }
              className="w-full cursor-pointer bg-transparent py-3 outline-none"
              aria-label="Filter appointments by status"
            >
              {STATUS_OPTIONS.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                )
              )}
            </select>
          </label>
        </div>

        <p className="mt-3 text-xs text-[var(--muted)]">
          Showing{" "}
          <span className="font-semibold text-[var(--heading)]">
            {filteredAppointments.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-[var(--heading)]">
            {appointments.length}
          </span>{" "}
          appointments
        </p>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-red-200 bg-red-50 p-4 text-sm text-[var(--danger)]">
          <FiAlertCircle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <div className="min-w-0">
            <p className="font-semibold">
              Appointments could not be loaded
            </p>

            <p className="mt-1 break-words leading-6">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Appointments content */}
      <section className="min-w-0 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-soft)]">
        {loading ? (
          <AppointmentsLoading />
        ) : filteredAppointments.length >
          0 ? (
          <>
            {/* Mobile and tablet cards */}
            <div className="divide-y divide-[var(--border)] lg:hidden">
              {filteredAppointments.map(
                (appointment, index) => (
                  <AppointmentMobileCard
                    key={
                      appointment.id ??
                      `${appointment.patient}-${index}`
                    }
                    appointment={appointment}
                    index={index}
                    updating={updating}
                    onView={
                      setSelectedAppointment
                    }
                    onStatusUpdate={
                      handleStatusUpdate
                    }
                  />
                )
              )}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1050px]">
                <thead className="bg-[var(--section)]">
                  <tr>
                    <TableHeading>
                      Patient
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

                    <TableHeading>
                      Type
                    </TableHeading>

                    <TableHeading>
                      Actions
                    </TableHeading>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--border)]">
                  {filteredAppointments.map(
                    (
                      appointment,
                      index
                    ) => (
                      <motion.tr
                        key={
                          appointment.id ??
                          `${appointment.patient}-${index}`
                        }
                        initial={{
                          opacity: 0,
                          y: 8,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          duration: 0.2,
                          delay:
                            Math.min(
                              index * 0.025,
                              0.25
                            ),
                        }}
                        className="transition-colors hover:bg-[var(--section)]"
                      >
                        <TableCell>
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary-light)] font-heading text-sm font-bold text-[var(--primary)]">
                              {getPatientInitial(
                                appointment.patient
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-[220px] truncate font-semibold text-[var(--heading)]">
                                {
                                  appointment.patient
                                }
                              </p>

                              <p className="mt-1 max-w-[220px] truncate text-xs text-[var(--body)]">
                                {
                                  appointment.reason
                                }
                              </p>

                              <p className="mt-1 text-[11px] text-[var(--muted)]">
                                ID: #
                                {
                                  appointment.id
                                }
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          {formatDate(
                            appointment.date
                          )}
                        </TableCell>

                        <TableCell>
                          <span className="inline-flex items-center gap-2">
                            <FiClock
                              size={15}
                              className="text-[var(--primary)]"
                            />

                            {
                              appointment.time
                            }
                          </span>
                        </TableCell>

                        <TableCell>
                          <StatusBadge
                            status={
                              appointment.status
                            }
                          />
                        </TableCell>

                        <TableCell>
                          {
                            appointment.type
                          }
                        </TableCell>

                        <TableCell>
                          <AppointmentActions
                            appointment={
                              appointment
                            }
                            updating={
                              updating
                            }
                            compact
                            onView={
                              setSelectedAppointment
                            }
                            onStatusUpdate={
                              handleStatusUpdate
                            }
                          />
                        </TableCell>
                      </motion.tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <AppointmentsEmpty
            query={query}
            selectedStatus={
              selectedStatus
            }
            onClear={() => {
              setQuery("");
              setSelectedStatus("All");
            }}
          />
        )}
      </section>

      {/* Details modal */}
      {selectedAppointment && (
        <AppointmentDetailsModal
          appointment={
            selectedAppointment
          }
          updating={updating}
          onClose={() =>
            setSelectedAppointment(null)
          }
          onStatusUpdate={
            handleStatusUpdate
          }
        />
      )}
    </motion.div>
  );
}

function AppointmentMobileCard({
  appointment,
  index,
  updating,
  onView,
  onStatusUpdate,
}) {
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
        delay: Math.min(
          index * 0.035,
          0.25
        ),
      }}
      className="p-4 sm:p-5"
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--primary-light)] font-heading text-sm font-bold text-[var(--primary)]">
            {getPatientInitial(
              appointment.patient
            )}
          </div>

          <div className="min-w-0">
            <h2 className="truncate font-heading text-base font-bold text-[var(--heading)]">
              {appointment.patient}
            </h2>

            <p className="mt-1 line-clamp-2 text-sm leading-5 text-[var(--body)]">
              {appointment.reason}
            </p>
          </div>
        </div>

        <StatusBadge
          status={appointment.status}
        />
      </div>

      <div className="mt-4 grid gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--section)] p-4 sm:grid-cols-2">
        <AppointmentDetail
          icon={FiCalendar}
          label="Date"
          value={formatDate(
            appointment.date
          )}
        />

        <AppointmentDetail
          icon={FiClock}
          label="Time"
          value={appointment.time}
        />

        <AppointmentDetail
          icon={FiCheckCircle}
          label="Type"
          value={appointment.type}
        />

        <AppointmentDetail
          icon={FiEye}
          label="Appointment ID"
          value={`#${appointment.id}`}
        />
      </div>

      <div className="mt-4">
        <AppointmentActions
          appointment={appointment}
          updating={updating}
          onView={onView}
          onStatusUpdate={
            onStatusUpdate
          }
        />
      </div>
    </motion.article>
  );
}

function AppointmentDetail({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary-light)] text-[var(--primary)]">
        <Icon size={16} />
      </span>

      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--muted)]">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-semibold text-[var(--heading)]">
          {value}
        </p>
      </div>
    </div>
  );
}

function AppointmentActions({
  appointment,
  updating,
  compact = false,
  onView,
  onStatusUpdate,
}) {
  const status = appointment.status;

  const canConfirm =
    status === "Pending";

  const canComplete =
    status === "Confirmed";

  const canCancel = ![
    "Completed",
    "Cancelled",
  ].includes(status);

  const confirming =
    updating.id === appointment.id &&
    updating.status === "confirmed";

  const completing =
    updating.id === appointment.id &&
    updating.status === "completed";

  const cancelling =
    updating.id === appointment.id &&
    updating.status === "cancelled";

  const anyUpdating =
    updating.id === appointment.id;

  return (
    <div
      className={`flex flex-col gap-2 sm:flex-row sm:flex-wrap ${
        compact ? "xl:flex-nowrap" : ""
      }`}
    >
      {canConfirm && (
        <ActionButton
          label={
            confirming
              ? "Confirming..."
              : "Confirm"
          }
          icon={
            confirming
              ? FiRefreshCw
              : FiCheck
          }
          loading={confirming}
          disabled={anyUpdating}
          variant="primary"
          onClick={() =>
            onStatusUpdate(
              appointment,
              "confirmed"
            )
          }
        />
      )}

      {canComplete && (
        <ActionButton
          label={
            completing
              ? "Completing..."
              : "Complete"
          }
          icon={
            completing
              ? FiRefreshCw
              : FiCheckCircle
          }
          loading={completing}
          disabled={anyUpdating}
          variant="success"
          onClick={() =>
            onStatusUpdate(
              appointment,
              "completed"
            )
          }
        />
      )}

      <ActionButton
        label="View"
        icon={FiEye}
        disabled={anyUpdating}
        variant="secondary"
        onClick={() =>
          onView(appointment)
        }
      />

      {canCancel && (
        <ActionButton
          label={
            cancelling
              ? "Cancelling..."
              : "Cancel"
          }
          icon={
            cancelling
              ? FiRefreshCw
              : FiXCircle
          }
          loading={cancelling}
          disabled={anyUpdating}
          variant="danger"
          onClick={() =>
            onStatusUpdate(
              appointment,
              "cancelled"
            )
          }
        />
      )}
    </div>
  );
}

function ActionButton({
  label,
  icon: Icon,
  loading = false,
  disabled = false,
  variant = "secondary",
  onClick,
}) {
  const variants = {
    primary:
      "border-[var(--primary)] bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]",

    success:
      "border-[var(--success)] bg-[var(--success)] text-white hover:brightness-95",

    secondary:
      "border-[var(--border)] bg-[var(--card)] text-[var(--heading)] hover:border-[var(--primary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)]",

    danger:
      "border-red-200 bg-[var(--card)] text-[var(--danger)] hover:border-[var(--danger)] hover:bg-red-50",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border px-3 py-2 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[var(--primary-light)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto ${variants[variant]}`}
    >
      <Icon
        size={14}
        className={
          loading
            ? "animate-spin"
            : ""
        }
      />

      {label}
    </button>
  );
}

function AppointmentDetailsModal({
  appointment,
  updating,
  onClose,
  onStatusUpdate,
}) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="appointment-modal-title"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-card)]">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-5 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--primary)]">
              Appointment Details
            </p>

            <h2
              id="appointment-modal-title"
              className="mt-1 truncate font-heading text-xl font-bold text-[var(--heading)]"
            >
              {appointment.patient}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close appointment details"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--section)] text-[var(--body)] transition-all hover:border-[var(--primary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="mb-5 flex items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--section)] p-4">
            <div>
              <p className="text-xs text-[var(--muted)]">
                Current status
              </p>

              <p className="mt-1 text-sm font-semibold text-[var(--heading)]">
                Appointment #
                {appointment.id}
              </p>
            </div>

            <StatusBadge
              status={appointment.status}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <ModalDetail
              icon={FiCalendar}
              label="Date"
              value={formatDate(
                appointment.date
              )}
            />

            <ModalDetail
              icon={FiClock}
              label="Time"
              value={appointment.time}
            />

            <ModalDetail
              icon={FiCheckCircle}
              label="Consultation type"
              value={appointment.type}
            />

            <ModalDetail
              icon={FiPhone}
              label="Phone"
              value={
                appointment.patientPhone ||
                "Not provided"
              }
              href={
                appointment.patientPhone
                  ? `tel:${appointment.patientPhone}`
                  : ""
              }
            />

            <ModalDetail
              icon={FiMail}
              label="Email"
              value={
                appointment.patientEmail ||
                "Not provided"
              }
              href={
                appointment.patientEmail
                  ? `mailto:${appointment.patientEmail}`
                  : ""
              }
            />

            <ModalDetail
              icon={FiEye}
              label="Reason"
              value={appointment.reason}
            />
          </div>

          {appointment.notes && (
            <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--section)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[var(--muted)]">
                Additional notes
              </p>

              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--body)]">
                {appointment.notes}
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-[var(--border)] bg-[var(--section)] px-5 py-4 sm:px-6">
          <AppointmentActions
            appointment={appointment}
            updating={updating}
            onView={() => {}}
            onStatusUpdate={
              onStatusUpdate
            }
          />
        </div>
      </div>
    </div>
  );
}

function ModalDetail({
  icon: Icon,
  label,
  value,
  href = "",
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary-light)] text-[var(--primary)]">
        <Icon size={17} />
      </span>

      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--muted)]">
          {label}
        </p>

        {href ? (
          <a
            href={href}
            className="mt-1 block break-all text-sm font-semibold text-[var(--heading)] transition-colors hover:text-[var(--primary)]"
          >
            {value}
          </a>
        ) : (
          <p className="mt-1 break-words text-sm font-semibold leading-5 text-[var(--heading)]">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

function TableHeading({ children }) {
  return (
    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.06em] text-[var(--body)]">
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

function AppointmentsLoading() {
  return (
    <div
      className="px-6 py-16 text-center"
      role="status"
    >
      <FiRefreshCw className="mx-auto animate-spin text-3xl text-[var(--primary)]" />

      <p className="mt-4 font-heading text-sm font-bold text-[var(--heading)]">
        Loading appointments
      </p>

      <p className="mt-1 text-xs text-[var(--muted)]">
        Please wait while the appointment
        records are prepared.
      </p>
    </div>
  );
}

function AppointmentsEmpty({
  query,
  selectedStatus,
  onClear,
}) {
  const hasFilters =
    Boolean(query.trim()) ||
    selectedStatus !== "All";

  return (
    <div className="px-5 py-14 text-center sm:px-6 sm:py-16">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)]">
        <FiCalendar size={24} />
      </div>

      <h3 className="mt-4 font-heading text-lg font-bold text-[var(--heading)]">
        No appointments found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--body)]">
        {hasFilters
          ? "No appointments match the current search and status filters."
          : "Appointment records will appear here when patients make bookings."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)]"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}