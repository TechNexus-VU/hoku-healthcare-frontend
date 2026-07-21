import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";
import { toast } from "react-toastify";

import {
  AlertCircle,
  CalendarCheck,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleX,
  Clock3,
  Eye,
  LoaderCircle,
  RefreshCw,
  Search,
  UserRound,
  X,
} from "lucide-react";

import {
  extractAppointment,
  extractAppointments,
  getAdminAppointments,
  updateAdminAppointmentStatus,
} from "@/services/adminAppointmentsApi";

const STATUS_OPTIONS = [
  {
    value: "All",
    label: "All Statuses",
  },
  {
    value: "Pending",
    label: "Pending",
  },
  {
    value: "Confirmed",
    label: "Confirmed",
  },
  {
    value: "Completed",
    label: "Completed",
  },
  {
    value: "Cancelled",
    label: "Cancelled",
  },
];

const STATUS_CONFIG = {
  Pending: {
    label: "Pending",
    icon: Clock3,
    badge:
      "border-amber-200 bg-[var(--warning-light)] text-[var(--warning)]",
    iconStyle:
      "bg-[var(--warning-light)] text-[var(--warning)]",
  },

  Confirmed: {
    label: "Confirmed",
    icon: CalendarCheck,
    badge:
      "border-blue-200 bg-[var(--info-light)] text-[var(--info)]",
    iconStyle:
      "bg-[var(--info-light)] text-[var(--info)]",
  },

  Completed: {
    label: "Completed",
    icon: CheckCircle2,
    badge:
      "border-green-200 bg-[var(--success-light)] text-[var(--success)]",
    iconStyle:
      "bg-[var(--success-light)] text-[var(--success)]",
  },

  Cancelled: {
    label: "Cancelled",
    icon: CircleX,
    badge:
      "border-red-200 bg-[var(--danger-light)] text-[var(--danger)]",
    iconStyle:
      "bg-[var(--danger-light)] text-[var(--danger)]",
  },
};

function getErrorMessage(
  error,
  fallback = "Something went wrong."
) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function sameId(firstId, secondId) {
  return String(firstId) ===
    String(secondId);
}

function getEntityName(
  entity,
  fallbackValues = [],
  fallback = "Unavailable"
) {
  if (
    typeof entity === "string" &&
    entity.trim()
  ) {
    return entity.trim();
  }

  if (
    entity &&
    typeof entity === "object"
  ) {
    const objectName =
      entity.name ||
      entity.full_name ||
      entity.fullName ||
      entity.title ||
      entity.service_name ||
      entity.serviceName;

    if (
      typeof objectName === "string" &&
      objectName.trim()
    ) {
      return objectName.trim();
    }
  }

  const matchingFallback =
    fallbackValues.find(
      (value) =>
        typeof value === "string" &&
        value.trim()
    );

  return matchingFallback?.trim() || fallback;
}

function normalizeStatus(value) {
  const status = String(
    value || "pending"
  )
    .trim()
    .toLowerCase();

  const statusMap = {
    pending: "Pending",
    requested: "Pending",

    confirmed: "Confirmed",
    approved: "Confirmed",
    accepted: "Confirmed",

    completed: "Completed",
    complete: "Completed",
    finished: "Completed",

    cancelled: "Cancelled",
    canceled: "Cancelled",
    rejected: "Cancelled",
  };

  return statusMap[status] || "Pending";
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

function getDateFilterValue(value) {
  if (!value) {
    return "";
  }

  const stringValue =
    String(value).trim();

  const directMatch =
    stringValue.match(
      /^(\d{4}-\d{2}-\d{2})/
    );

  if (directMatch) {
    return directMatch[1];
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "";
  }

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTime(value) {
  if (!value) {
    return "Time unavailable";
  }

  const stringValue =
    String(value).trim();

  if (
    /\b(am|pm)\b/i.test(stringValue)
  ) {
    return stringValue;
  }

  const timeMatch =
    stringValue.match(
      /(?:T|\s|^)(\d{1,2}):(\d{2})/
    );

  if (!timeMatch) {
    return stringValue;
  }

  const hour = Number(timeMatch[1]);
  const minute = timeMatch[2];

  if (Number.isNaN(hour)) {
    return stringValue;
  }

  const period =
    hour >= 12 ? "PM" : "AM";

  const displayHour =
    hour % 12 || 12;

  return `${String(
    displayHour
  ).padStart(2, "0")}:${minute} ${period}`;
}

function normalizeAppointment(
  appointment = {}
) {
  const patient = getEntityName(
    appointment.patient,
    [
      appointment.patient_name,
      appointment.patientName,
    ],
    "Unknown Patient"
  );

  const doctor = getEntityName(
    appointment.doctor,
    [
      appointment.doctor_name,
      appointment.doctorName,
    ],
    "Unknown Doctor"
  );

  const service = getEntityName(
    appointment.service,
    [
      appointment.service_name,
      appointment.serviceName,
    ],
    "Healthcare Service"
  );

  const rawDate =
    appointment.appointment_date ||
    appointment.appointmentDate ||
    appointment.date ||
    "";

  const rawTime =
    appointment.appointment_time ||
    appointment.appointmentTime ||
    appointment.time ||
    "";

  return {
    ...appointment,

    id:
      appointment.id ??
      appointment._id ??
      appointment.appointment_id ??
      appointment.appointmentId,

    patient,
    doctor,
    service,

    rawDate,
    date: formatDate(rawDate),
    dateFilterValue:
      getDateFilterValue(rawDate),

    rawTime,
    time: formatTime(rawTime),

    status: normalizeStatus(
      appointment.status
    ),

    notes:
      appointment.notes ||
      appointment.message ||
      appointment.reason ||
      "",

    patientEmail:
      appointment.patient_email ||
      appointment.patientEmail ||
      appointment.patient?.email ||
      "",

    patientPhone:
      appointment.patient_phone ||
      appointment.patientPhone ||
      appointment.patient?.phone ||
      appointment.patient?.phone_number ||
      "",

    appointmentType:
      appointment.appointment_type ||
      appointment.appointmentType ||
      appointment.type ||
      "Consultation",
  };
}

function useModalBehaviour(
  open,
  onClose,
  blocked = false
) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    const handleKeyDown = (event) => {
      if (
        event.key === "Escape" &&
        !blocked
      ) {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [blocked, onClose, open]);
}

export default function AppointmentManagement() {
  const [
    appointments,
    setAppointments,
  ] = useState([]);

  const [query, setQuery] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("All");

  const [
    doctorFilter,
    setDoctorFilter,
  ] = useState("All Doctors");

  const [dateFilter, setDateFilter] =
    useState("");

  const [viewing, setViewing] =
    useState(null);

  const [
    statusAction,
    setStatusAction,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [pageError, setPageError] =
    useState("");

  const [
    updatingAppointmentId,
    setUpdatingAppointmentId,
  ] = useState(null);

  const loadAppointments =
    useCallback(async () => {
      setLoading(true);
      setPageError("");

      try {
        const response =
          await getAdminAppointments({
            page: 1,
            limit: 100,
          });

        const extractedAppointments =
          extractAppointments(response);

        const appointmentList =
          Array.isArray(
            extractedAppointments
          )
            ? extractedAppointments
            : [];

        setAppointments(
          appointmentList.map(
            normalizeAppointment
          )
        );
      } catch (error) {
        setAppointments([]);

        setPageError(
          getErrorMessage(
            error,
            "Unable to load appointments from the server."
          )
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const doctorOptions =
    useMemo(() => {
      const doctors = appointments
        .map(
          (appointment) =>
            appointment.doctor
        )
        .filter(Boolean);

      return [
        "All Doctors",
        ...new Set(doctors),
      ];
    }, [appointments]);

  const counts = useMemo(() => {
    const appointmentCounts = {
      Pending: 0,
      Confirmed: 0,
      Completed: 0,
      Cancelled: 0,
    };

    appointments.forEach(
      (appointment) => {
        if (
          appointmentCounts[
            appointment.status
          ] !== undefined
        ) {
          appointmentCounts[
            appointment.status
          ] += 1;
        }
      }
    );

    return appointmentCounts;
  }, [appointments]);

  const filteredAppointments =
    useMemo(() => {
      const normalizedQuery = query
        .trim()
        .toLowerCase();

      return appointments.filter(
        (appointment) => {
          const searchableContent = [
            appointment.id,
            appointment.patient,
            appointment.doctor,
            appointment.service,
            appointment.notes,
            appointment.patientEmail,
            appointment.patientPhone,
          ]
            .map((value) =>
              String(
                value || ""
              ).toLowerCase()
            )
            .join(" ");

          const matchesQuery =
            !normalizedQuery ||
            searchableContent.includes(
              normalizedQuery
            );

          const matchesStatus =
            statusFilter === "All" ||
            appointment.status ===
              statusFilter;

          const matchesDoctor =
            doctorFilter ===
              "All Doctors" ||
            appointment.doctor ===
              doctorFilter;

          const matchesDate =
            !dateFilter ||
            appointment.dateFilterValue ===
              dateFilter;

          return (
            matchesQuery &&
            matchesStatus &&
            matchesDoctor &&
            matchesDate
          );
        }
      );
    }, [
      appointments,
      dateFilter,
      doctorFilter,
      query,
      statusFilter,
    ]);

  const hasActiveFilters =
    Boolean(query.trim()) ||
    statusFilter !== "All" ||
    doctorFilter !== "All Doctors" ||
    Boolean(dateFilter);

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("All");
    setDoctorFilter("All Doctors");
    setDateFilter("");
  };

  const closeDetailsModal =
    useCallback(() => {
      setViewing(null);
    }, []);

  const closeStatusModal =
    useCallback(() => {
      if (
        updatingAppointmentId ===
        null
      ) {
        setStatusAction(null);
      }
    }, [updatingAppointmentId]);

  const openStatusAction = (
    appointment,
    nextStatus
  ) => {
    if (
      appointment.id === undefined ||
      updatingAppointmentId !== null
    ) {
      return;
    }

    setStatusAction({
      appointment,
      nextStatus,
    });
  };

  const confirmStatusUpdate =
    async () => {
      const appointment =
        statusAction?.appointment;

      const nextStatus =
        statusAction?.nextStatus;

      if (
        !appointment ||
        appointment.id === undefined ||
        !nextStatus ||
        updatingAppointmentId !== null
      ) {
        return;
      }

      setUpdatingAppointmentId(
        appointment.id
      );

      setPageError("");

      try {
        const response =
          await updateAdminAppointmentStatus(
            appointment.id,
            nextStatus
          );

        const extractedAppointment =
          extractAppointment(response);

        const responseAppointment =
          extractedAppointment &&
          typeof extractedAppointment ===
            "object"
            ? extractedAppointment
            : {};

        const updatedAppointment =
          normalizeAppointment({
            ...appointment,
            ...responseAppointment,

            id:
              responseAppointment.id ??
              responseAppointment._id ??
              appointment.id,

            status: nextStatus,
          });

        setAppointments(
          (currentAppointments) =>
            currentAppointments.map(
              (currentAppointment) =>
                sameId(
                  currentAppointment.id,
                  appointment.id
                )
                  ? updatedAppointment
                  : currentAppointment
            )
        );

        setViewing(
          (currentViewing) =>
            currentViewing &&
            sameId(
              currentViewing.id,
              appointment.id
            )
              ? updatedAppointment
              : currentViewing
        );

        toast.success(
          `Appointment marked as ${nextStatus.toLowerCase()}.`
        );

        setStatusAction(null);
      } catch (error) {
        const message = getErrorMessage(
          error,
          `Unable to mark the appointment as ${nextStatus.toLowerCase()}.`
        );

        setPageError(message);
        toast.error(message);
      } finally {
        setUpdatingAppointmentId(
          null
        );
      }
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
      {/* Page heading */}
      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary)]">
              HOKU Health Care
            </p>

            <h1 className="mt-1 font-heading text-2xl font-bold text-[var(--heading)] sm:text-3xl">
              Appointment Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--body)] sm:text-base">
              Review appointments across all
              doctors and manage confirmation,
              completion, and cancellation
              status.
            </p>
          </div>

          <button
            type="button"
            onClick={loadAppointments}
            disabled={loading}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-sm font-semibold text-[var(--heading)] transition-all duration-300 hover:border-[var(--primary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-light)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
      </section>

      {/* Status summary */}
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {Object.entries(counts).map(
          ([status, count]) => (
            <StatusSummaryCard
              key={status}
              status={status}
              count={count}
            />
          )
        )}
      </section>

      {pageError && (
        <ErrorMessage
          message={pageError}
          onClose={() =>
            setPageError("")
          }
        />
      )}

      {/* Search and filters */}
      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-soft)] sm:p-5">
        <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_190px_220px_180px]">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--primary)]" />

            <input
              type="search"
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value
                )
              }
              placeholder="Search patient, doctor, service, or ID"
              className="min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--section)] py-2.5 pl-10 pr-4 text-sm text-[var(--heading)] outline-none transition-all duration-300 placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:bg-[var(--card)] focus:ring-4 focus:ring-[var(--primary-light)]"
            />
          </div>

          <SelectField
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
            ariaLabel="Filter appointments by status"
          />

          <SelectField
            value={doctorFilter}
            onChange={setDoctorFilter}
            options={doctorOptions.map(
              (doctor) => ({
                value: doctor,
                label: doctor,
              })
            )}
            ariaLabel="Filter appointments by doctor"
          />

          <input
            type="date"
            value={dateFilter}
            onChange={(event) =>
              setDateFilter(
                event.target.value
              )
            }
            aria-label="Filter appointments by date"
            className="min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm text-[var(--heading)] outline-none transition-all duration-300 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-light)]"
          />
        </div>

        <div className="mt-3 flex flex-col gap-2 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>
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

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="w-fit font-semibold text-[var(--primary)] transition hover:text-[var(--primary-hover)]"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      {/* Appointment records */}
      <section className="min-w-0 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-soft)]">
        {loading ? (
          <AppointmentLoading />
        ) : filteredAppointments.length ===
          0 ? (
          <EmptyAppointments
            hasFilters={
              hasActiveFilters
            }
            onClear={clearFilters}
          />
        ) : (
          <>
            {/* Mobile and tablet cards */}
            <div className="grid gap-4 p-4 lg:hidden">
              {filteredAppointments.map(
                (appointment, index) => (
                  <AppointmentMobileCard
                    key={
                      appointment.id ??
                      `${appointment.patient}-${index}`
                    }
                    appointment={
                      appointment
                    }
                    updating={
                      updatingAppointmentId !==
                        null &&
                      sameId(
                        updatingAppointmentId,
                        appointment.id
                      )
                    }
                    onView={() =>
                      setViewing(
                        appointment
                      )
                    }
                    onStatusAction={(
                      nextStatus
                    ) =>
                      openStatusAction(
                        appointment,
                        nextStatus
                      )
                    }
                  />
                )
              )}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1000px] text-left">
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
                      Date &amp; Time
                    </TableHeading>

                    <TableHeading>
                      Status
                    </TableHeading>

                    <TableHeading align="right">
                      Actions
                    </TableHeading>
                  </tr>
                </thead>

                <tbody>
                  {filteredAppointments.map(
                    (
                      appointment,
                      index
                    ) => {
                      const updating =
                        updatingAppointmentId !==
                          null &&
                        sameId(
                          updatingAppointmentId,
                          appointment.id
                        );

                      return (
                        <tr
                          key={
                            appointment.id ??
                            `${appointment.patient}-${index}`
                          }
                          className="border-b border-[var(--border)] transition-colors duration-300 last:border-0 hover:bg-[var(--dashboard-hover)]"
                        >
                          <TableCell>
                            <div className="min-w-0">
                              <p className="max-w-[190px] truncate font-semibold text-[var(--heading)]">
                                {
                                  appointment.patient
                                }
                              </p>

                              <p className="mt-0.5 text-xs text-[var(--muted)]">
                                #
                                {appointment.id ??
                                  "N/A"}
                              </p>
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="block max-w-[190px] truncate">
                              {
                                appointment.doctor
                              }
                            </span>
                          </TableCell>

                          <TableCell>
                            <span className="block max-w-[190px] truncate">
                              {
                                appointment.service
                              }
                            </span>
                          </TableCell>

                          <TableCell>
                            <div>
                              <p className="font-medium text-[var(--heading)]">
                                {
                                  appointment.date
                                }
                              </p>

                              <p className="mt-0.5 text-xs text-[var(--muted)]">
                                {
                                  appointment.time
                                }
                              </p>
                            </div>
                          </TableCell>

                          <TableCell>
                            <AppointmentStatusBadge
                              status={
                                appointment.status
                              }
                            />
                          </TableCell>

                          <TableCell align="right">
                            <AppointmentActions
                              appointment={
                                appointment
                              }
                              updating={
                                updating
                              }
                              onView={() =>
                                setViewing(
                                  appointment
                                )
                              }
                              onStatusAction={(
                                nextStatus
                              ) =>
                                openStatusAction(
                                  appointment,
                                  nextStatus
                                )
                              }
                            />
                          </TableCell>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <AppointmentDetailsModal
        appointment={viewing}
        onClose={closeDetailsModal}
        onStatusAction={(
          nextStatus
        ) => {
          if (viewing) {
            openStatusAction(
              viewing,
              nextStatus
            );
          }
        }}
      />

      <StatusConfirmationModal
        action={statusAction}
        updating={
          updatingAppointmentId !==
          null
        }
        onClose={closeStatusModal}
        onConfirm={
          confirmStatusUpdate
        }
      />
    </motion.div>
  );
}

function AppointmentMobileCard({
  appointment,
  updating,
  onView,
  onStatusAction,
}) {
  return (
    <article className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-heading text-base font-bold text-[var(--heading)]">
            {appointment.patient}
          </p>

          <p className="mt-1 truncate text-sm text-[var(--body)]">
            {appointment.service}
          </p>
        </div>

        <AppointmentStatusBadge
          status={appointment.status}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MobileDetail
          label="Doctor"
          value={appointment.doctor}
        />

        <MobileDetail
          label="Appointment ID"
          value={`#${
            appointment.id ?? "N/A"
          }`}
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

      <div className="mt-4">
        <button
          type="button"
          onClick={onView}
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] text-xs font-semibold text-[var(--body)] transition hover:border-[var(--primary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
        >
          <Eye size={15} />
          View Details
        </button>
      </div>

      {(appointment.status ===
        "Pending" ||
        appointment.status ===
          "Confirmed") && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {appointment.status ===
            "Pending" && (
            <MobileStatusButton
              icon={Check}
              label="Confirm"
              disabled={updating}
              onClick={() =>
                onStatusAction(
                  "Confirmed"
                )
              }
              success
            />
          )}

          {appointment.status ===
            "Confirmed" && (
            <MobileStatusButton
              icon={CheckCircle2}
              label="Complete"
              disabled={updating}
              onClick={() =>
                onStatusAction(
                  "Completed"
                )
              }
              success
            />
          )}

          <MobileStatusButton
            icon={X}
            label="Cancel"
            disabled={updating}
            onClick={() =>
              onStatusAction(
                "Cancelled"
              )
            }
            danger
          />
        </div>
      )}
    </article>
  );
}

function AppointmentDetailsModal({
  appointment,
  onClose,
  onStatusAction,
}) {
  useModalBehaviour(
    Boolean(appointment),
    onClose
  );

  if (!appointment) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="appointment-details-title"
        className="w-full max-w-lg overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-card)]"
      >
        <div className="relative bg-gradient-to-br from-[var(--primary)] to-[#4f8ee8] px-5 pb-16 pt-6 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close appointment details"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-white/15 text-white transition hover:bg-white/25"
          >
            <X size={19} />
          </button>

          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/75">
            Appointment Record
          </p>

          <h2
            id="appointment-details-title"
            className="mt-1 font-heading text-xl font-bold text-white"
          >
            Appointment #
            {appointment.id ?? "N/A"}
          </h2>
        </div>

        <div className="-mt-9 px-5 pb-6 sm:px-6">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-soft)]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--muted)]">
                  Current status
                </p>

                <div className="mt-2">
                  <AppointmentStatusBadge
                    status={
                      appointment.status
                    }
                  />
                </div>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--primary-light)] text-[var(--primary)]">
                <CalendarClock
                  size={20}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailItem
              label="Patient"
              value={appointment.patient}
            />

            <DetailItem
              label="Doctor"
              value={appointment.doctor}
            />

            <DetailItem
              label="Service"
              value={appointment.service}
            />

            <DetailItem
              label="Appointment Type"
              value={
                appointment.appointmentType
              }
            />

            <DetailItem
              label="Date"
              value={appointment.date}
            />

            <DetailItem
              label="Time"
              value={appointment.time}
            />

            {appointment.patientEmail && (
              <DetailItem
                label="Patient Email"
                value={
                  appointment.patientEmail
                }
              />
            )}

            {appointment.patientPhone && (
              <DetailItem
                label="Patient Phone"
                value={
                  appointment.patientPhone
                }
              />
            )}
          </div>

          {appointment.notes && (
            <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--section)] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                Notes
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--heading)]">
                {appointment.notes}
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] px-5 text-sm font-semibold text-[var(--heading)] transition hover:bg-[var(--section)]"
            >
              Close
            </button>

            {appointment.status ===
              "Pending" && (
              <button
                type="button"
                onClick={() =>
                  onStatusAction(
                    "Confirmed"
                  )
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--success)] px-5 text-sm font-semibold text-[var(--white)] transition hover:opacity-90"
              >
                <Check size={17} />
                Confirm
              </button>
            )}

            {appointment.status ===
              "Confirmed" && (
              <button
                type="button"
                onClick={() =>
                  onStatusAction(
                    "Completed"
                  )
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--success)] px-5 text-sm font-semibold text-[var(--white)] transition hover:opacity-90"
              >
                <CheckCircle2
                  size={17}
                />
                Complete
              </button>
            )}

            {(appointment.status ===
              "Pending" ||
              appointment.status ===
                "Confirmed") && (
              <button
                type="button"
                onClick={() =>
                  onStatusAction(
                    "Cancelled"
                  )
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--danger)] px-5 text-sm font-semibold text-[var(--white)] transition hover:opacity-90"
              >
                <X size={17} />
                Cancel
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatusConfirmationModal({
  action,
  updating,
  onClose,
  onConfirm,
}) {
  useModalBehaviour(
    Boolean(action),
    onClose,
    updating
  );

  if (!action) {
    return null;
  }

  const {
    appointment,
    nextStatus,
  } = action;

  const isCancelled =
    nextStatus === "Cancelled";

  const isCompleted =
    nextStatus === "Completed";

  const Icon = isCancelled
    ? CircleX
    : isCompleted
      ? CheckCircle2
      : CalendarCheck;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !updating
        ) {
          onClose();
        }
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="appointment-status-title"
        className="w-full max-w-sm rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-5 text-center shadow-[var(--shadow-card)] sm:p-6"
      >
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
            isCancelled
              ? "bg-[var(--danger-light)] text-[var(--danger)]"
              : isCompleted
                ? "bg-[var(--success-light)] text-[var(--success)]"
                : "bg-[var(--info-light)] text-[var(--info)]"
          }`}
        >
          <Icon size={23} />
        </div>

        <h2
          id="appointment-status-title"
          className="mt-4 font-heading text-lg font-bold text-[var(--heading)]"
        >
          Mark as {nextStatus}?
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--body)]">
          Appointment #
          {appointment.id ?? "N/A"} for{" "}
          <span className="font-semibold text-[var(--heading)]">
            {appointment.patient}
          </span>{" "}
          will be marked as{" "}
          {nextStatus.toLowerCase()}.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={updating}
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] text-sm font-semibold text-[var(--heading)] transition hover:bg-[var(--section)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Go Back
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={updating}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] px-4 text-sm font-semibold text-[var(--white)] transition disabled:cursor-not-allowed disabled:opacity-60 ${
              isCancelled
                ? "bg-[var(--danger)] hover:opacity-90"
                : isCompleted
                  ? "bg-[var(--success)] hover:opacity-90"
                  : "bg-[var(--primary)] hover:bg-[var(--primary-hover)]"
            }`}
          >
            {updating && (
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
            )}

            {updating
              ? "Updating..."
              : `Mark ${nextStatus}`}
          </button>
        </div>
      </section>
    </div>
  );
}

function AppointmentActions({
  appointment,
  updating,
  onView,
  onStatusAction,
}) {
  return (
    <div className="flex justify-end gap-1">
      <ActionButton
        icon={Eye}
        label={`View appointment ${
          appointment.id ?? ""
        }`}
        onClick={onView}
      />

      {appointment.status ===
        "Pending" && (
        <ActionButton
          icon={
            updating
              ? LoaderCircle
              : Check
          }
          label={`Confirm appointment ${
            appointment.id ?? ""
          }`}
          onClick={() =>
            onStatusAction(
              "Confirmed"
            )
          }
          disabled={updating}
          success
          spinning={updating}
        />
      )}

      {appointment.status ===
        "Confirmed" && (
        <ActionButton
          icon={
            updating
              ? LoaderCircle
              : CheckCircle2
          }
          label={`Complete appointment ${
            appointment.id ?? ""
          }`}
          onClick={() =>
            onStatusAction(
              "Completed"
            )
          }
          disabled={updating}
          success
          spinning={updating}
        />
      )}

      {(appointment.status ===
        "Pending" ||
        appointment.status ===
          "Confirmed") && (
        <ActionButton
          icon={X}
          label={`Cancel appointment ${
            appointment.id ?? ""
          }`}
          onClick={() =>
            onStatusAction(
              "Cancelled"
            )
          }
          disabled={updating}
          danger
        />
      )}
    </div>
  );
}

function AppointmentStatusBadge({
  status,
}) {
  const config =
    STATUS_CONFIG[status] ||
    STATUS_CONFIG.Pending;

  return (
    <span
      className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${config.badge}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          status === "Pending"
            ? "bg-[var(--warning)]"
            : status === "Confirmed"
              ? "bg-[var(--info)]"
              : status === "Completed"
                ? "bg-[var(--success)]"
                : "bg-[var(--danger)]"
        }`}
      />

      {config.label}
    </span>
  );
}

function StatusSummaryCard({
  status,
  count,
}) {
  const config =
    STATUS_CONFIG[status] ||
    STATUS_CONFIG.Pending;

  const Icon = config.icon;

  return (
    <article className="flex min-w-0 items-center gap-3 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-soft)] sm:gap-4 sm:p-5">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] sm:h-11 sm:w-11 ${config.iconStyle}`}
      >
        <Icon size={20} />
      </div>

      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-[var(--muted)]">
          {status}
        </p>

        <p className="mt-1 font-heading text-xl font-bold text-[var(--heading)]">
          {count}
        </p>
      </div>
    </article>
  );
}

function SelectField({
  value,
  onChange,
  options,
  ariaLabel,
}) {
  return (
    <div className="relative min-w-0">
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        aria-label={ariaLabel}
        className="min-h-11 w-full cursor-pointer appearance-none rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] py-2.5 pl-4 pr-9 text-sm text-[var(--heading)] outline-none transition-all duration-300 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-light)]"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  danger = false,
  success = false,
  spinning = false,
}) {
  let style =
    "text-[var(--body)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)]";

  if (danger) {
    style =
      "text-[var(--danger)] hover:bg-[var(--danger-light)]";
  }

  if (success) {
    style =
      "text-[var(--success)] hover:bg-[var(--success-light)]";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${style}`}
    >
      <Icon
        size={17}
        className={
          spinning
            ? "animate-spin"
            : ""
        }
      />
    </button>
  );
}

function MobileStatusButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  danger = false,
  success = false,
}) {
  let style =
    "border-[var(--border)] text-[var(--body)]";

  if (danger) {
    style =
      "border-red-200 text-[var(--danger)] hover:bg-[var(--danger-light)]";
  }

  if (success) {
    style =
      "border-green-200 text-[var(--success)] hover:bg-[var(--success-light)]";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-[var(--radius-md)] border text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${style}`}
    >
      {disabled ? (
        <LoaderCircle
          size={15}
          className="animate-spin"
        />
      ) : (
        <Icon size={15} />
      )}

      {label}
    </button>
  );
}

function MobileDetail({
  label,
  value,
}) {
  return (
    <div className="min-w-0 rounded-[var(--radius-md)] bg-[var(--section)] px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-semibold text-[var(--heading)]">
        {value}
      </p>
    </div>
  );
}

function DetailItem({
  label,
  value,
}) {
  return (
    <div className="min-w-0 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--section)] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold leading-5 text-[var(--heading)]">
        {value}
      </p>
    </div>
  );
}

function ErrorMessage({
  message,
  onClose,
}) {
  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-3 rounded-[var(--radius-lg)] border border-red-200 bg-[var(--danger-light)] p-4 text-sm text-[var(--danger)]"
    >
      <div className="flex min-w-0 items-start gap-3">
        <AlertCircle
          size={18}
          className="mt-0.5 shrink-0"
        />

        <div className="min-w-0">
          <p className="font-semibold">
            Appointment management error
          </p>

          <p className="mt-1 break-words leading-6">
            {message}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss error"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] transition hover:bg-red-100"
      >
        <X size={16} />
      </button>
    </div>
  );
}

function TableHeading({
  children,
  align = "left",
}) {
  return (
    <th
      className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)] ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function TableCell({
  children,
  align = "left",
}) {
  return (
    <td
      className={`px-5 py-4 text-sm text-[var(--body)] ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </td>
  );
}

function AppointmentLoading() {
  return (
    <div
      role="status"
      className="flex min-h-[360px] flex-col items-center justify-center px-5 text-center"
    >
      <LoaderCircle className="h-8 w-8 animate-spin text-[var(--primary)]" />

      <p className="mt-4 font-heading text-sm font-bold text-[var(--heading)]">
        Loading appointments
      </p>

      <p className="mt-1 text-xs text-[var(--muted)]">
        Preparing appointment records.
      </p>
    </div>
  );
}

function EmptyAppointments({
  hasFilters,
  onClear,
}) {
  return (
    <div className="px-5 py-14 text-center sm:px-6">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)]">
        <CalendarClock size={24} />
      </div>

      <h3 className="mt-4 font-heading text-base font-bold text-[var(--heading)]">
        No appointments found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--body)]">
        {hasFilters
          ? "No appointments match the current search and filters."
          : "Appointment records will appear here after patients create bookings."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--white)] transition hover:bg-[var(--primary-hover)]"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}