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
  Ban,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Eye,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  UserCheck,
  UserX,
  Users,
  X,
} from "lucide-react";

import {
  extractPatient,
  extractPatients,
  getAdminPatients,
  updateAdminPatientStatus,
} from "@/services/adminPatientsApi";

const STATUS_OPTIONS = [
  {
    value: "all",
    label: "All Statuses",
  },
  {
    value: "active",
    label: "Active",
  },
  {
    value: "blocked",
    label: "Blocked",
  },
];

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

function toBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  const normalizedValue = String(
    value ?? ""
  )
    .trim()
    .toLowerCase();

  if (
    [
      "true",
      "1",
      "yes",
      "active",
      "enabled",
      "unblocked",
    ].includes(normalizedValue)
  ) {
    return true;
  }

  if (
    [
      "false",
      "0",
      "no",
      "inactive",
      "disabled",
      "blocked",
    ].includes(normalizedValue)
  ) {
    return false;
  }

  return Boolean(value);
}

function getPatientName(patient = {}) {
  return (
    patient.name ||
    patient.full_name ||
    patient.fullName ||
    "Unnamed Patient"
  );
}

function getInitials(name = "") {
  const words = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "PT";
  }

  if (words.length === 1) {
    return words[0]
      .charAt(0)
      .toUpperCase();
  }

  return `${words[0].charAt(0)}${words[
    words.length - 1
  ].charAt(0)}`.toUpperCase();
}

function formatJoinedDate(value) {
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

function normalizePatient(patient = {}) {
  const name = getPatientName(patient);

  const explicitBlocked =
    patient.blocked ??
    patient.is_blocked ??
    patient.isBlocked;

  const explicitActive =
    patient.is_active ??
    patient.isActive ??
    patient.active;

  const blocked =
    explicitBlocked !== undefined &&
    explicitBlocked !== null
      ? toBoolean(explicitBlocked)
      : explicitActive !== undefined &&
          explicitActive !== null
        ? !toBoolean(explicitActive)
        : String(
              patient.status || ""
            )
              .trim()
              .toLowerCase() ===
          "blocked";

  const appointmentValue =
    patient.appointment_count ??
    patient.appointments_count ??
    patient.total_appointments ??
    patient.totalAppointments ??
    patient.appointments ??
    0;

  const appointmentCount =
    Array.isArray(appointmentValue)
      ? appointmentValue.length
      : Number(appointmentValue);

  return {
    ...patient,

    id:
      patient.id ??
      patient._id ??
      patient.patient_id ??
      patient.patientId,

    name,

    email:
      patient.email ||
      "Email unavailable",

    phone:
      patient.phone ||
      patient.phone_number ||
      patient.phoneNumber ||
      "Phone unavailable",

    address:
      patient.address ||
      patient.location ||
      patient.city ||
      "Address unavailable",

    joined: formatJoinedDate(
      patient.joined ||
        patient.joined_at ||
        patient.created_at ||
        patient.createdAt ||
        patient.registration_date
    ),

    appointments:
      Number.isFinite(
        appointmentCount
      )
        ? Math.max(
            0,
            appointmentCount
          )
        : 0,

    blocked,

    avatar:
      patient.avatar_url ||
      patient.avatarUrl ||
      patient.avatar ||
      patient.profile_image ||
      patient.profileImage ||
      "",

    initials:
      patient.initials ||
      getInitials(name),
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

export default function PatientManagement() {
  const [patients, setPatients] =
    useState([]);

  const [query, setQuery] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [loading, setLoading] =
    useState(true);

  const [pageError, setPageError] =
    useState("");

  const [viewing, setViewing] =
    useState(null);

  const [
    blockTarget,
    setBlockTarget,
  ] = useState(null);

  const [
    updatingStatus,
    setUpdatingStatus,
  ] = useState(false);

  const loadPatients =
    useCallback(async () => {
      setLoading(true);
      setPageError("");

      try {
        const response =
          await getAdminPatients({
            page: 1,
            limit: 100,
          });

        const extractedPatients =
          extractPatients(response);

        const patientList =
          Array.isArray(
            extractedPatients
          )
            ? extractedPatients
            : [];

        setPatients(
          patientList.map(
            normalizePatient
          )
        );
      } catch (error) {
        setPatients([]);

        setPageError(
          getErrorMessage(
            error,
            "Unable to load patients from the server."
          )
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const patientSummary =
    useMemo(() => {
      const active =
        patients.filter(
          (patient) =>
            !patient.blocked
        ).length;

      return {
        total: patients.length,
        active,
        blocked:
          patients.length - active,
      };
    }, [patients]);

  const filteredPatients =
    useMemo(() => {
      const normalizedQuery = query
        .trim()
        .toLowerCase();

      return patients.filter(
        (patient) => {
          const searchableContent = [
            patient.name,
            patient.email,
            patient.phone,
            patient.address,
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
            statusFilter === "all" ||
            (statusFilter ===
              "active" &&
              !patient.blocked) ||
            (statusFilter ===
              "blocked" &&
              patient.blocked);

          return (
            matchesQuery &&
            matchesStatus
          );
        }
      );
    }, [
      patients,
      query,
      statusFilter,
    ]);

  const hasActiveFilters =
    Boolean(query.trim()) ||
    statusFilter !== "all";

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
  };

  const closeDetailsModal =
    useCallback(() => {
      setViewing(null);
    }, []);

  const closeStatusModal =
    useCallback(() => {
      if (!updatingStatus) {
        setBlockTarget(null);
      }
    }, [updatingStatus]);

  const confirmToggleBlock =
    async () => {
      if (
        !blockTarget ||
        blockTarget.id === undefined
      ) {
        return;
      }

      const nextBlockedState =
        !blockTarget.blocked;

      const nextIsActive =
        !nextBlockedState;

      setUpdatingStatus(true);
      setPageError("");

      try {
        const response =
          await updateAdminPatientStatus(
            blockTarget.id,
            nextIsActive
          );

        const extractedPatient =
          extractPatient(response);

        const responsePatient =
          extractedPatient &&
          typeof extractedPatient ===
            "object"
            ? extractedPatient
            : {};

        const updatedPatient =
          normalizePatient({
            ...blockTarget,
            ...responsePatient,

            id:
              responsePatient.id ??
              responsePatient._id ??
              blockTarget.id,

            is_active:
              nextIsActive,

            blocked:
              nextBlockedState,
          });

        setPatients(
          (currentPatients) =>
            currentPatients.map(
              (patient) =>
                sameId(
                  patient.id,
                  blockTarget.id
                )
                  ? updatedPatient
                  : patient
            )
        );

        setViewing(
          (currentViewing) =>
            currentViewing &&
            sameId(
              currentViewing.id,
              blockTarget.id
            )
              ? updatedPatient
              : currentViewing
        );

        toast.success(
          `${updatedPatient.name} has been ${
            updatedPatient.blocked
              ? "blocked"
              : "unblocked"
          } successfully.`
        );

        setBlockTarget(null);
      } catch (error) {
        const message = getErrorMessage(
          error,
          blockTarget.blocked
            ? "Unable to unblock the patient."
            : "Unable to block the patient."
        );

        setPageError(message);
        toast.error(message);
      } finally {
        setUpdatingStatus(false);
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
              Patient Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--body)] sm:text-base">
              Review registered patient
              accounts, appointment activity,
              contact information, and platform
              access.
            </p>
          </div>

          <button
            type="button"
            onClick={loadPatients}
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

      {/* Summary cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={Users}
          label="Total Patients"
          value={patientSummary.total}
          description="Registered accounts"
          variant="primary"
        />

        <SummaryCard
          icon={UserCheck}
          label="Active"
          value={patientSummary.active}
          description="Can access the platform"
          variant="success"
        />

        <SummaryCard
          icon={UserX}
          label="Blocked"
          value={
            patientSummary.blocked
          }
          description="Access has been restricted"
          variant="danger"
        />
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
        <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_210px] xl:grid-cols-[minmax(320px,1fr)_220px]">
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
              placeholder="Search by name, email, phone, or location"
              className="min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--section)] py-2.5 pl-10 pr-4 text-sm text-[var(--heading)] outline-none transition-all duration-300 placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:bg-[var(--card)] focus:ring-4 focus:ring-[var(--primary-light)]"
            />
          </div>

          <SelectField
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
            ariaLabel="Filter patients by status"
          />
        </div>

        <div className="mt-3 flex flex-col gap-2 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing{" "}
            <span className="font-semibold text-[var(--heading)]">
              {filteredPatients.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[var(--heading)]">
              {patients.length}
            </span>{" "}
            patients
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

      {/* Patient records */}
      <section className="min-w-0 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-soft)]">
        {loading ? (
          <PatientLoading />
        ) : filteredPatients.length ===
          0 ? (
          <EmptyPatients
            hasFilters={
              hasActiveFilters
            }
            onClear={clearFilters}
          />
        ) : (
          <>
            {/* Mobile and tablet cards */}
            <div className="grid gap-4 p-4 lg:hidden">
              {filteredPatients.map(
                (patient, index) => (
                  <PatientMobileCard
                    key={
                      patient.id ??
                      `${patient.name}-${index}`
                    }
                    patient={patient}
                    onView={() =>
                      setViewing(patient)
                    }
                    onToggleStatus={() =>
                      setBlockTarget(
                        patient
                      )
                    }
                  />
                )
              )}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[940px] text-left">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--section)]">
                    <TableHeading>
                      Patient
                    </TableHeading>

                    <TableHeading>
                      Location
                    </TableHeading>

                    <TableHeading>
                      Joined
                    </TableHeading>

                    <TableHeading>
                      Appointments
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
                  {filteredPatients.map(
                    (patient, index) => (
                      <tr
                        key={
                          patient.id ??
                          `${patient.name}-${index}`
                        }
                        className="border-b border-[var(--border)] transition-colors duration-300 last:border-0 hover:bg-[var(--dashboard-hover)]"
                      >
                        <TableCell>
                          <div className="flex min-w-0 items-center gap-3">
                            <PatientAvatar
                              patient={patient}
                            />

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-[var(--heading)]">
                                {patient.name}
                              </p>

                              <p className="mt-0.5 max-w-[240px] truncate text-xs text-[var(--muted)]">
                                {patient.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="block max-w-[220px] truncate">
                            {patient.address}
                          </span>
                        </TableCell>

                        <TableCell>
                          {patient.joined}
                        </TableCell>

                        <TableCell>
                          <span className="inline-flex min-w-10 items-center justify-center rounded-full bg-[var(--primary-light)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                            {
                              patient.appointments
                            }
                          </span>
                        </TableCell>

                        <TableCell>
                          <PatientStatusBadge
                            blocked={
                              patient.blocked
                            }
                          />
                        </TableCell>

                        <TableCell align="right">
                          <div className="flex justify-end gap-1">
                            <ActionButton
                              icon={Eye}
                              label={`View ${patient.name}`}
                              onClick={() =>
                                setViewing(
                                  patient
                                )
                              }
                            />

                            <ActionButton
                              icon={
                                patient.blocked
                                  ? CheckCircle2
                                  : Ban
                              }
                              label={
                                patient.blocked
                                  ? `Unblock ${patient.name}`
                                  : `Block ${patient.name}`
                              }
                              success={
                                patient.blocked
                              }
                              danger={
                                !patient.blocked
                              }
                              onClick={() =>
                                setBlockTarget(
                                  patient
                                )
                              }
                            />
                          </div>
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

      <PatientDetailsModal
        patient={viewing}
        onClose={closeDetailsModal}
        onToggleStatus={() => {
          if (viewing) {
            setBlockTarget(viewing);
          }
        }}
      />

      <PatientStatusModal
        patient={blockTarget}
        updating={updatingStatus}
        onClose={closeStatusModal}
        onConfirm={confirmToggleBlock}
      />
    </motion.div>
  );
}

function PatientMobileCard({
  patient,
  onView,
  onToggleStatus,
}) {
  return (
    <article className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="flex items-start gap-3">
        <PatientAvatar
          patient={patient}
          sizeClass="h-12 w-12"
        />

        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-base font-bold text-[var(--heading)]">
            {patient.name}
          </p>

          <p className="mt-1 truncate text-sm text-[var(--body)]">
            {patient.email}
          </p>
        </div>

        <PatientStatusBadge
          blocked={patient.blocked}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MobileDetail
          label="Joined"
          value={patient.joined}
        />

        <MobileDetail
          label="Appointments"
          value={String(
            patient.appointments
          )}
        />
      </div>

      <div className="mt-3 rounded-[var(--radius-md)] bg-[var(--section)] px-3 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--muted)]">
          Location
        </p>

        <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-[var(--heading)]">
          {patient.address}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <MobileActionButton
          icon={Eye}
          label="View Details"
          onClick={onView}
        />

        <MobileActionButton
          icon={
            patient.blocked
              ? CheckCircle2
              : Ban
          }
          label={
            patient.blocked
              ? "Unblock"
              : "Block"
          }
          success={patient.blocked}
          danger={!patient.blocked}
          onClick={onToggleStatus}
        />
      </div>
    </article>
  );
}

function PatientDetailsModal({
  patient,
  onClose,
  onToggleStatus,
}) {
  useModalBehaviour(
    Boolean(patient),
    onClose
  );

  if (!patient) {
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
        aria-labelledby="patient-details-title"
        className="w-full max-w-lg overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-card)]"
      >
        <div className="relative bg-gradient-to-br from-[var(--primary)] to-[#4f8ee8] px-5 pb-16 pt-6 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close patient details"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-white/15 text-white transition hover:bg-white/25"
          >
            <X size={19} />
          </button>

          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/75">
            Patient Profile
          </p>
        </div>

        <div className="-mt-11 px-5 pb-6 sm:px-6">
          <div className="flex min-w-0 items-end gap-4">
            <PatientAvatar
              patient={patient}
              sizeClass="h-24 w-24"
              className="border-4 border-[var(--card)] shadow-[var(--shadow-card)]"
            />

            <div className="min-w-0 pb-1">
              <h2
                id="patient-details-title"
                className="truncate font-heading text-xl font-bold text-[var(--heading)]"
              >
                {patient.name}
              </h2>

              <p className="mt-1 truncate text-sm text-[var(--body)]">
                Registered patient
              </p>
            </div>
          </div>

          <div className="mt-5">
            <PatientStatusBadge
              blocked={patient.blocked}
            />
          </div>

          <div className="mt-5 space-y-3">
            <ContactItem
              icon={Mail}
              label="Email Address"
              value={patient.email}
            />

            <ContactItem
              icon={Phone}
              label="Phone Number"
              value={patient.phone}
            />

            <ContactItem
              icon={MapPin}
              label="Location"
              value={patient.address}
            />

            <ContactItem
              icon={Calendar}
              label="Joined"
              value={patient.joined}
            />
          </div>

          <div className="mt-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--section)] p-4 text-center">
            <p className="font-heading text-2xl font-bold text-[var(--heading)]">
              {patient.appointments}
            </p>

            <p className="mt-1 text-xs text-[var(--muted)]">
              Total appointments booked
            </p>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] px-5 text-sm font-semibold text-[var(--heading)] transition hover:bg-[var(--section)]"
            >
              Close
            </button>

            <button
              type="button"
              onClick={onToggleStatus}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] px-5 text-sm font-semibold text-[var(--white)] transition ${
                patient.blocked
                  ? "bg-[var(--success)] hover:opacity-90"
                  : "bg-[var(--danger)] hover:opacity-90"
              }`}
            >
              {patient.blocked ? (
                <CheckCircle2
                  size={17}
                />
              ) : (
                <Ban size={17} />
              )}

              {patient.blocked
                ? "Unblock Patient"
                : "Block Patient"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function PatientStatusModal({
  patient,
  updating,
  onClose,
  onConfirm,
}) {
  useModalBehaviour(
    Boolean(patient),
    onClose,
    updating
  );

  if (!patient) {
    return null;
  }

  const willUnblock =
    patient.blocked;

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
        aria-labelledby="patient-status-title"
        className="w-full max-w-sm rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-5 text-center shadow-[var(--shadow-card)] sm:p-6"
      >
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
            willUnblock
              ? "bg-[var(--success-light)] text-[var(--success)]"
              : "bg-[var(--danger-light)] text-[var(--danger)]"
          }`}
        >
          {willUnblock ? (
            <CheckCircle2 size={23} />
          ) : (
            <Ban size={23} />
          )}
        </div>

        <h2
          id="patient-status-title"
          className="mt-4 font-heading text-lg font-bold text-[var(--heading)]"
        >
          {willUnblock
            ? "Unblock"
            : "Block"}{" "}
          {patient.name}?
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--body)]">
          {willUnblock
            ? "This patient will regain access to log in, book appointments, and use the platform."
            : "This patient will no longer be able to log in or create new appointments."}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={updating}
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] text-sm font-semibold text-[var(--heading)] transition hover:bg-[var(--section)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={updating}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] px-4 text-sm font-semibold text-[var(--white)] transition disabled:cursor-not-allowed disabled:opacity-60 ${
              willUnblock
                ? "bg-[var(--success)] hover:opacity-90"
                : "bg-[var(--danger)] hover:opacity-90"
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
              : willUnblock
                ? "Unblock"
                : "Block"}
          </button>
        </div>
      </section>
    </div>
  );
}

function PatientAvatar({
  patient,
  sizeClass = "h-11 w-11",
  className = "",
}) {
  const [imageError, setImageError] =
    useState(false);

  useEffect(() => {
    setImageError(false);
  }, [patient.avatar]);

  if (
    patient.avatar &&
    !imageError
  ) {
    return (
      <img
        src={patient.avatar}
        alt={patient.name}
        loading="lazy"
        onError={() =>
          setImageError(true)
        }
        className={`${sizeClass} ${className} shrink-0 rounded-[var(--radius-lg)] border border-[var(--border)] object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} ${className} flex shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--primary-light)] font-heading text-xs font-bold text-[var(--primary)]`}
    >
      {patient.initials ||
        getInitials(patient.name)}
    </div>
  );
}

function PatientStatusBadge({
  blocked,
}) {
  return (
    <span
      className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
        blocked
          ? "border-red-200 bg-[var(--danger-light)] text-[var(--danger)]"
          : "border-green-200 bg-[var(--success-light)] text-[var(--success)]"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          blocked
            ? "bg-[var(--danger)]"
            : "bg-[var(--success)]"
        }`}
      />

      {blocked ? "Blocked" : "Active"}
    </span>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
  variant = "primary",
}) {
  const variants = {
    primary:
      "bg-[var(--primary-light)] text-[var(--primary)]",

    success:
      "bg-[var(--success-light)] text-[var(--success)]",

    danger:
      "bg-[var(--danger-light)] text-[var(--danger)]",
  };

  return (
    <article className="flex min-w-0 items-center gap-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-soft)] sm:p-5">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] ${
          variants[variant] ||
          variants.primary
        }`}
      >
        <Icon size={20} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold text-[var(--muted)]">
          {label}
        </p>

        <p className="mt-1 font-heading text-xl font-bold text-[var(--heading)]">
          {value}
        </p>

        <p className="mt-1 truncate text-xs text-[var(--body)]">
          {description}
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

function ContactItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--section)] p-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary-light)] text-[var(--primary)]">
        <Icon size={16} />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--muted)]">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold leading-5 text-[var(--heading)]">
          {value}
        </p>
      </div>
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
            Patient management error
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

function ActionButton({
  icon: Icon,
  label,
  onClick,
  danger = false,
  success = false,
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
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] transition-all duration-300 ${style}`}
    >
      <Icon size={17} />
    </button>
  );
}

function MobileActionButton({
  icon: Icon,
  label,
  onClick,
  danger = false,
  success = false,
}) {
  let style =
    "border-[var(--border)] text-[var(--body)] hover:border-[var(--primary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)]";

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
      className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-[var(--radius-md)] border text-xs font-semibold transition ${style}`}
    >
      <Icon size={15} />
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

function PatientLoading() {
  return (
    <div
      role="status"
      className="flex min-h-[360px] flex-col items-center justify-center px-5 text-center"
    >
      <LoaderCircle className="h-8 w-8 animate-spin text-[var(--primary)]" />

      <p className="mt-4 font-heading text-sm font-bold text-[var(--heading)]">
        Loading patients
      </p>

      <p className="mt-1 text-xs text-[var(--muted)]">
        Preparing patient records.
      </p>
    </div>
  );
}

function EmptyPatients({
  hasFilters,
  onClear,
}) {
  return (
    <div className="px-5 py-14 text-center sm:px-6">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)]">
        <Users size={24} />
      </div>

      <h3 className="mt-4 font-heading text-base font-bold text-[var(--heading)]">
        No patients found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--body)]">
        {hasFilters
          ? "No patients match the current search and status filter."
          : "Patient accounts will appear here after registration."}
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