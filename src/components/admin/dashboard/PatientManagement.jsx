import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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
  Users,
  X,
} from "lucide-react";

import {
  extractPatient,
  extractPatients,
  getAdminPatients,
  updateAdminPatientStatus,
} from "@/services/adminPatientsApi";

function getPatientName(patient = {}) {
  return (
    patient.name ||
    patient.full_name ||
    patient.fullName ||
    "Unnamed Patient"
  );
}

function getInitials(name = "") {
  const initials = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return initials || "PT";
}

function formatJoinedDate(value) {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function normalizePatient(patient = {}) {
  const name = getPatientName(patient);

  const isActive =
    patient.is_active ??
    patient.isActive ??
    !patient.blocked;

  const appointmentValue =
    patient.appointment_count ??
    patient.appointments_count ??
    patient.total_appointments ??
    patient.appointments ??
    0;

  return {
    ...patient,

    id:
      patient.id ??
      patient._id ??
      patient.patient_id ??
      patient.patientId,

    name,

    email: patient.email || "Email unavailable",

    phone:
      patient.phone ||
      patient.phone_number ||
      patient.phoneNumber ||
      "Phone unavailable",

    address:
      patient.address ||
      patient.location ||
      "Address unavailable",

    joined: formatJoinedDate(
      patient.joined ||
        patient.created_at ||
        patient.createdAt
    ),

    appointments: Array.isArray(appointmentValue)
      ? appointmentValue.length
      : Number(appointmentValue) || 0,

    blocked: !Boolean(isActive),

    initials:
      patient.initials || getInitials(name),
  };
}

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

function PatientDetailsPanel({
  patient,
  onClose,
}) {
  if (!patient) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-['Poppins'] text-lg font-semibold text-[#1A1A2E]">
            Patient Details
          </h3>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-[#6B7280] hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1565C0]/10 text-sm font-semibold text-[#1565C0]">
            {patient.initials}
          </span>

          <div>
            <p className="font-['Poppins'] font-semibold text-[#1A1A2E]">
              {patient.name}
            </p>

            <span
              className={`mt-0.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                patient.blocked
                  ? "bg-red-50 text-[#DC2626] ring-1 ring-red-200"
                  : "bg-green-50 text-[#2E7D32] ring-1 ring-green-200"
              }`}
            >
              {patient.blocked
                ? "Blocked"
                : "Active"}
            </span>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 text-[#1A1A2E]">
            <Mail className="h-4 w-4 shrink-0 text-[#6B7280]" />
            <span className="break-all">
              {patient.email}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[#1A1A2E]">
            <Phone className="h-4 w-4 shrink-0 text-[#6B7280]" />
            {patient.phone}
          </div>

          <div className="flex items-center gap-3 text-[#1A1A2E]">
            <MapPin className="h-4 w-4 shrink-0 text-[#6B7280]" />
            {patient.address}
          </div>

          <div className="flex items-center gap-3 text-[#1A1A2E]">
            <Calendar className="h-4 w-4 shrink-0 text-[#6B7280]" />
            Joined {patient.joined}
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-[#F5F5F5] p-4 text-center">
          <p className="font-['Poppins'] text-xl font-bold text-[#1A1A2E]">
            {patient.appointments}
          </p>

          <p className="text-xs text-[#6B7280]">
            Total appointments booked
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-lg bg-[#2E7D32] py-2.5 text-sm font-medium text-white hover:bg-[#1B5E20]"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function PatientManagement() {
  const [patients, setPatients] = useState([]);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] =
    useState("");

  const [viewing, setViewing] =
    useState(null);

  const [blockTarget, setBlockTarget] =
    useState(null);

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const response = await getAdminPatients({
        page: 1,
        limit: 100,
      });

      const patientList =
        extractPatients(response);

      setPatients(
        patientList.map((patient) =>
          normalizePatient(patient)
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

  const filteredPatients = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLowerCase();

    return patients.filter((patient) => {
      const matchesQuery =
        !normalizedQuery ||
        patient.name
          .toLowerCase()
          .includes(normalizedQuery) ||
        patient.email
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" &&
          !patient.blocked) ||
        (statusFilter === "Blocked" &&
          patient.blocked);

      return matchesQuery && matchesStatus;
    });
  }, [patients, query, statusFilter]);

  const totalActive = useMemo(
    () =>
      patients.filter(
        (patient) => !patient.blocked
      ).length,
    [patients]
  );

  const totalBlocked = useMemo(
    () =>
      patients.filter(
        (patient) => patient.blocked
      ).length,
    [patients]
  );

  const confirmToggleBlock = async () => {
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

      const responsePatient =
        extractPatient(response);

      const updatedPatient =
        normalizePatient({
          ...blockTarget,

          ...(responsePatient &&
          typeof responsePatient === "object"
            ? responsePatient
            : {}),

          id:
            responsePatient?.id ??
            responsePatient?._id ??
            blockTarget.id,

          is_active: nextIsActive,

          blocked: nextBlockedState,
        });

      setPatients((currentPatients) =>
        currentPatients.map((patient) =>
          patient.id === blockTarget.id
            ? updatedPatient
            : patient
        )
      );

      setViewing((currentViewing) =>
        currentViewing?.id === blockTarget.id
          ? updatedPatient
          : currentViewing
      );

      setBlockTarget(null);
    } catch (error) {
      setPageError(
        getErrorMessage(
          error,
          blockTarget.blocked
            ? "Unable to unblock the patient."
            : "Unable to block the patient."
        )
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-['Inter']">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#2E7D32]">
            Hoku Health Care
          </p>

          <h1 className="font-['Poppins'] text-2xl font-bold text-[#1A1A2E] sm:text-3xl">
            Patient Management
          </h1>

          <p className="mt-1 text-sm text-[#6B7280]">
            View patient records and manage
            platform access.
          </p>
        </div>

        {pageError && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
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

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
            <p className="text-xs text-[#6B7280]">
              Total Patients
            </p>

            <p className="font-['Poppins'] text-xl font-bold text-[#1A1A2E]">
              {patients.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
            <p className="text-xs text-[#6B7280]">
              Active
            </p>

            <p className="font-['Poppins'] text-xl font-bold text-[#2E7D32]">
              {totalActive}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
            <p className="text-xs text-[#6B7280]">
              Blocked
            </p>

            <p className="font-['Poppins'] text-xl font-bold text-[#DC2626]">
              {totalBlocked}
            </p>
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />

            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search by name or email..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20"
            />
          </div>

          <div className="relative sm:w-48">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-4 pr-9 text-sm outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20"
            >
              <option value="All">
                All Statuses
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Blocked">
                Blocked
              </option>
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
          </div>

          <button
            type="button"
            onClick={loadPatients}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[#1A1A2E] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />

            Refresh
          </button>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.08)] sm:p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <LoaderCircle className="mb-3 h-7 w-7 animate-spin text-[#2E7D32]" />

              <p className="text-sm font-medium text-[#1A1A2E]">
                Loading patients...
              </p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F5F5]">
                <Users className="h-6 w-6 text-[#6B7280]" />
              </div>

              <h3 className="font-['Poppins'] text-base font-semibold text-[#1A1A2E]">
                No patients found
              </h3>

              <p className="mt-1 max-w-xs text-sm text-[#6B7280]">
                Try a different search term or
                status filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-[#6B7280]">
                    <th className="py-3 font-medium">
                      Patient
                    </th>

                    <th className="py-3 font-medium">
                      Location
                    </th>

                    <th className="py-3 font-medium">
                      Joined
                    </th>

                    <th className="py-3 font-medium">
                      Appointments
                    </th>

                    <th className="py-3 font-medium">
                      Status
                    </th>

                    <th className="py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPatients.map(
                    (patient) => (
                      <tr
                        key={patient.id}
                        className="border-b border-gray-50 last:border-0 hover:bg-[#F5F5F5]/60"
                      >
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1565C0]/10 text-xs font-semibold text-[#1565C0]">
                              {patient.initials}
                            </span>

                            <div>
                              <p className="font-medium text-[#1A1A2E]">
                                {patient.name}
                              </p>

                              <p className="text-xs text-[#6B7280]">
                                {patient.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 text-[#6B7280]">
                          {patient.address}
                        </td>

                        <td className="py-3 text-[#6B7280]">
                          {patient.joined}
                        </td>

                        <td className="py-3 text-[#6B7280]">
                          {patient.appointments}
                        </td>

                        <td className="py-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              patient.blocked
                                ? "bg-red-50 text-[#DC2626] ring-1 ring-red-200"
                                : "bg-green-50 text-[#2E7D32] ring-1 ring-green-200"
                            }`}
                          >
                            {patient.blocked
                              ? "Blocked"
                              : "Active"}
                          </span>
                        </td>

                        <td className="py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setViewing(patient)
                              }
                              className="rounded-lg p-2 text-[#1565C0] hover:bg-[#1565C0]/10"
                              aria-label={`View ${patient.name}`}
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setBlockTarget(
                                  patient
                                )
                              }
                              className={`rounded-lg p-2 ${
                                patient.blocked
                                  ? "text-[#2E7D32] hover:bg-green-50"
                                  : "text-[#DC2626] hover:bg-red-50"
                              }`}
                              aria-label={
                                patient.blocked
                                  ? `Unblock ${patient.name}`
                                  : `Block ${patient.name}`
                              }
                            >
                              {patient.blocked ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <Ban className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <PatientDetailsPanel
        patient={viewing}
        onClose={() => setViewing(null)}
      />

      {blockTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <div
              className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
                blockTarget.blocked
                  ? "bg-green-50"
                  : "bg-red-50"
              }`}
            >
              {blockTarget.blocked ? (
                <CheckCircle2 className="h-5 w-5 text-[#2E7D32]" />
              ) : (
                <Ban className="h-5 w-5 text-[#DC2626]" />
              )}
            </div>

            <h3 className="font-['Poppins'] text-base font-semibold text-[#1A1A2E]">
              {blockTarget.blocked
                ? "Unblock"
                : "Block"}{" "}
              {blockTarget.name}?
            </h3>

            <p className="mt-1 text-sm text-[#6B7280]">
              {blockTarget.blocked
                ? "This patient will regain access to book appointments and use the platform."
                : "This patient will no longer be able to log in or book appointments."}
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setBlockTarget(null)
                }
                disabled={updatingStatus}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-[#1A1A2E] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmToggleBlock}
                disabled={updatingStatus}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                  blockTarget.blocked
                    ? "bg-[#2E7D32] hover:bg-[#1B5E20]"
                    : "bg-[#DC2626] hover:bg-red-700"
                }`}
              >
                {updatingStatus && (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                )}

                {updatingStatus
                  ? "Updating..."
                  : blockTarget.blocked
                    ? "Unblock"
                    : "Block"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}