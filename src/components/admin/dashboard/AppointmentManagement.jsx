import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CalendarClock,
  Check,
  ChevronDown,
  Eye,
  LoaderCircle,
  RefreshCw,
  Search,
  X as XIcon,
} from "lucide-react";

import {
  extractAppointment,
  extractAppointments,
  getAdminAppointments,
  updateAdminAppointmentStatus,
} from "@/services/adminAppointmentsApi";

const statusOptions = [
  "All",
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
];

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

function formatDate(value) {
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

function formatTime(value) {
  if (!value) {
    return "Time unavailable";
  }

  const stringValue = String(value).trim();

  if (
    stringValue.toLowerCase().includes("am") ||
    stringValue.toLowerCase().includes("pm")
  ) {
    return stringValue;
  }

  const match = stringValue.match(
    /^(\d{1,2}):(\d{2})/
  );

  if (!match) {
    return stringValue;
  }

  const hour = Number(match[1]);
  const minute = match[2];

  if (Number.isNaN(hour)) {
    return stringValue;
  }

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
      appointment.appointment_id ??
      appointment.appointmentId,

    patient:
      appointment.patient ||
      appointment.patient_name ||
      appointment.patientName ||
      appointment.patient?.name ||
      "Unknown Patient",

    doctor:
      appointment.doctor ||
      appointment.doctor_name ||
      appointment.doctorName ||
      appointment.doctor?.name ||
      "Unknown Doctor",

    service:
      appointment.service ||
      appointment.service_name ||
      appointment.serviceName ||
      appointment.service?.name ||
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

    notes:
      appointment.notes ||
      appointment.message ||
      "",
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

function DetailsModal({
  appointment,
  onClose,
}) {
  if (!appointment) {
    return null;
  }

  const style =
    statusStyles[appointment.status] ||
    statusStyles.Pending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-['Poppins'] text-lg font-semibold text-[#1A1A2E]">
            Appointment #{appointment.id}
          </h3>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-[#6B7280] hover:bg-gray-100"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <dl className="space-y-3 text-sm">
          {[
            ["Patient", appointment.patient],
            ["Doctor", appointment.doctor],
            ["Service", appointment.service],
            ["Date", appointment.date],
            ["Time", appointment.time],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between gap-4"
            >
              <dt className="text-[#6B7280]">
                {label}
              </dt>

              <dd className="text-right font-medium text-[#1A1A2E]">
                {value}
              </dd>
            </div>
          ))}

          <div className="flex items-center justify-between pt-1">
            <dt className="text-[#6B7280]">
              Status
            </dt>

            <dd>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${style}`}
              >
                {appointment.status}
              </span>
            </dd>
          </div>

          {appointment.notes && (
            <div className="border-t border-gray-100 pt-3">
              <dt className="mb-1 text-[#6B7280]">
                Notes
              </dt>

              <dd className="text-[#1A1A2E]">
                {appointment.notes}
              </dd>
            </div>
          )}
        </dl>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-[#2E7D32] py-2.5 text-sm font-medium text-white hover:bg-[#1B5E20]"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function AppointmentManagement() {
  const [appointments, setAppointments] =
    useState([]);

  const [query, setQuery] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [viewing, setViewing] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [pageError, setPageError] =
    useState("");

  const [updatingAppointmentId, setUpdatingAppointmentId] =
    useState(null);

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

        const appointmentList =
          extractAppointments(response);

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

  const filteredAppointments =
    useMemo(() => {
      const normalizedQuery = query
        .trim()
        .toLowerCase();

      return appointments.filter(
        (appointment) => {
          const matchesQuery =
            !normalizedQuery ||
            appointment.patient
              .toLowerCase()
              .includes(normalizedQuery) ||
            appointment.doctor
              .toLowerCase()
              .includes(normalizedQuery) ||
            appointment.service
              .toLowerCase()
              .includes(normalizedQuery);

          const matchesStatus =
            statusFilter === "All" ||
            appointment.status ===
              statusFilter;

          return (
            matchesQuery && matchesStatus
          );
        }
      );
    }, [
      appointments,
      query,
      statusFilter,
    ]);

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

  const updateStatus = async (
    appointment,
    nextStatus
  ) => {
    if (
      appointment.id === undefined ||
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

      const responseAppointment =
        extractAppointment(response);

      const updatedAppointment =
        normalizeAppointment({
          ...appointment,

          ...(responseAppointment &&
          typeof responseAppointment ===
            "object"
            ? responseAppointment
            : {}),

          id:
            responseAppointment?.id ??
            responseAppointment?._id ??
            appointment.id,

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

      setViewing((currentViewing) =>
        currentViewing?.id ===
        appointment.id
          ? updatedAppointment
          : currentViewing
      );
    } catch (error) {
      setPageError(
        getErrorMessage(
          error,
          `Unable to mark the appointment as ${nextStatus.toLowerCase()}.`
        )
      );
    } finally {
      setUpdatingAppointmentId(null);
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
            Appointment Management
          </h1>

          <p className="mt-1 text-sm text-[#6B7280]">
            Review, approve, and track
            appointments across all doctors.
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
              onClick={() =>
                setPageError("")
              }
              aria-label="Dismiss error"
              className="rounded p-1 hover:bg-red-100"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Object.entries(counts).map(
            ([status, count]) => (
              <div
                key={status}
                className="rounded-2xl bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
              >
                <p className="text-xs text-[#6B7280]">
                  {status}
                </p>

                <p className="font-['Poppins'] text-xl font-bold text-[#1A1A2E]">
                  {count}
                </p>
              </div>
            )
          )}
        </div>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />

            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search by patient, doctor, or service..."
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
              {statusOptions.map(
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

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
          </div>

          <button
            type="button"
            onClick={loadAppointments}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[#1A1A2E] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
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

        <div className="rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.08)] sm:p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <LoaderCircle className="mb-3 h-7 w-7 animate-spin text-[#2E7D32]" />

              <p className="text-sm font-medium text-[#1A1A2E]">
                Loading appointments...
              </p>
            </div>
          ) : filteredAppointments.length ===
            0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F5F5]">
                <CalendarClock className="h-6 w-6 text-[#6B7280]" />
              </div>

              <h3 className="font-['Poppins'] text-base font-semibold text-[#1A1A2E]">
                No appointments found
              </h3>

              <p className="mt-1 max-w-xs text-sm text-[#6B7280]">
                Try a different search term or
                status filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
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
                      Date &amp; Time
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
                  {filteredAppointments.map(
                    (appointment) => {
                      const isUpdating =
                        updatingAppointmentId ===
                        appointment.id;

                      const style =
                        statusStyles[
                          appointment.status
                        ] ||
                        statusStyles.Pending;

                      return (
                        <tr
                          key={appointment.id}
                          className="border-b border-gray-50 last:border-0 hover:bg-[#F5F5F5]/60"
                        >
                          <td className="py-3 font-medium text-[#1A1A2E]">
                            {appointment.patient}
                          </td>

                          <td className="py-3 text-[#6B7280]">
                            {appointment.doctor}
                          </td>

                          <td className="py-3 text-[#6B7280]">
                            {appointment.service}
                          </td>

                          <td className="py-3 text-[#6B7280]">
                            {appointment.date} ·{" "}
                            {appointment.time}
                          </td>

                          <td className="py-3">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${style}`}
                            >
                              {appointment.status}
                            </span>
                          </td>

                          <td className="py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setViewing(
                                    appointment
                                  )
                                }
                                className="rounded-lg p-2 text-[#1565C0] hover:bg-[#1565C0]/10"
                                aria-label={`View appointment ${appointment.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </button>

                              {appointment.status ===
                                "Pending" && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateStatus(
                                        appointment,
                                        "Confirmed"
                                      )
                                    }
                                    disabled={
                                      isUpdating
                                    }
                                    className="rounded-lg p-2 text-[#2E7D32] hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    aria-label={`Approve appointment ${appointment.id}`}
                                  >
                                    {isUpdating ? (
                                      <LoaderCircle className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Check className="h-4 w-4" />
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateStatus(
                                        appointment,
                                        "Cancelled"
                                      )
                                    }
                                    disabled={
                                      isUpdating
                                    }
                                    className="rounded-lg p-2 text-[#DC2626] hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    aria-label={`Cancel appointment ${appointment.id}`}
                                  >
                                    <XIcon className="h-4 w-4" />
                                  </button>
                                </>
                              )}

                              {appointment.status ===
                                "Confirmed" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateStatus(
                                      appointment,
                                      "Completed"
                                    )
                                  }
                                  disabled={
                                    isUpdating
                                  }
                                  className="rounded-lg p-2 text-[#2E7D32] hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                                  aria-label={`Complete appointment ${appointment.id}`}
                                >
                                  {isUpdating ? (
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Check className="h-4 w-4" />
                                  )}
                                </button>
                              )}
                            </div>
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
      </div>

      <DetailsModal
        appointment={viewing}
        onClose={() => setViewing(null)}
      />
    </div>
  );
}