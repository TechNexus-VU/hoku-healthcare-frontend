import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlarmClock,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  LoaderCircle,
  Pencil,
  Pill,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import {
  createAdminReminder,
  deleteAdminReminder,
  extractPatients,
  extractReminder,
  extractReminders,
  getAdminReminders,
  getReminderPatients,
  updateAdminReminder,
  updateAdminReminderStatus,
} from "@/services/adminRemindersApi";

const FREQUENCIES = [
  "Once Daily",
  "Twice Daily",
  "Three Times Daily",
  "Every 6 Hours",
  "Every 8 Hours",
  "Every 12 Hours",
  "As Needed",
];

const EMPTY_FORM = {
  patient_id: "",
  medicine_name: "",
  dosage: "",
  reminder_time: "",
  frequency: "Once Daily",
  start_date: "",
  end_date: "",
  is_active: true,
};

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

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

function toDateInputValue(value) {
  if (!value) {
    return "";
  }

  const match = String(value).match(
    /^\d{4}-\d{2}-\d{2}/
  );

  return match ? match[0] : "";
}

function toTimeInputValue(value) {
  if (!value) {
    return "";
  }

  const match = String(value).match(
    /^(\d{1,2}):(\d{2})/
  );

  if (!match) {
    return "";
  }

  return `${match[1].padStart(
    2,
    "0"
  )}:${match[2]}`;
}

function formatDate(value) {
  if (!value) {
    return "Not specified";
  }

  const normalizedValue =
    toDateInputValue(value);

  if (!normalizedValue) {
    return String(value);
  }

  const date = new Date(
    `${normalizedValue}T00:00:00`
  );

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
    return "Not specified";
  }

  const time = String(value);

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
  const displayHour = hour % 12 || 12;

  return `${String(displayHour).padStart(
    2,
    "0"
  )}:${minute} ${period}`;
}

function normalizePatient(patient = {}) {
  return {
    id:
      patient.id ??
      patient._id ??
      patient.patient_id,

    name:
      patient.full_name ||
      patient.name ||
      patient.fullName ||
      "Unnamed Patient",

    email: patient.email || "",
  };
}

function normalizeReminder(
  reminder = {},
  patientMap = new Map()
) {
  const patientId = Number(
    reminder.patient_id ??
      reminder.patientId ??
      reminder.patient?.id ??
      0
  );

  const relatedPatient =
    patientMap.get(patientId);

  return {
    ...reminder,

    id:
      reminder.id ??
      reminder._id ??
      reminder.reminder_id,

    patientId,

    patientName:
      reminder.patient_name ||
      reminder.patientName ||
      reminder.patient?.full_name ||
      reminder.patient?.name ||
      relatedPatient?.name ||
      "Unknown Patient",

    patientEmail:
      reminder.patient_email ||
      reminder.patientEmail ||
      reminder.patient?.email ||
      relatedPatient?.email ||
      "",

    medicineName:
      reminder.medicine_name ||
      reminder.medicineName ||
      reminder.title ||
      "Unnamed Medicine",

    dosage:
      reminder.dosage ||
      reminder.dose ||
      "Not specified",

    reminderTime:
      reminder.reminder_time ||
      reminder.reminderTime ||
      reminder.time ||
      "",

    frequency:
      reminder.frequency ||
      "Once Daily",

    startDate:
      reminder.start_date ||
      reminder.startDate ||
      "",

    endDate:
      reminder.end_date ||
      reminder.endDate ||
      "",

    active: Boolean(
      reminder.is_active ??
        reminder.isActive ??
        reminder.active ??
        true
    ),
  };
}

function FormField({
  label,
  required = false,
  children,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active
            ? "bg-emerald-500"
            : "bg-slate-400"
        }`}
      />

      {active ? "Active" : "Inactive"}
    </span>
  );
}

function StatusToggle({
  reminder,
  updating,
  onToggle,
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(reminder)}
      disabled={updating}
      aria-label={`Mark reminder for ${reminder.medicineName} as ${
        reminder.active
          ? "inactive"
          : "active"
      }`}
      aria-pressed={reminder.active}
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60 ${
        reminder.active
          ? "bg-primary"
          : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition-transform ${
          reminder.active
            ? "translate-x-5"
            : "translate-x-0.5"
        }`}
      >
        {updating && (
          <LoaderCircle className="h-3 w-3 animate-spin text-primary" />
        )}
      </span>
    </button>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName,
}) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconClassName}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

function ReminderModal({
  open,
  reminder,
  patients,
  saving,
  error,
  onClose,
  onSave,
}) {
  const [form, setForm] =
    useState(EMPTY_FORM);

  const [
    validationError,
    setValidationError,
  ] = useState("");

  const isEditing = Boolean(reminder);

  useEffect(() => {
    if (!open) {
      return;
    }

    setValidationError("");

    if (reminder) {
      setForm({
        patient_id: String(
          reminder.patientId || ""
        ),

        medicine_name:
          reminder.medicineName || "",

        dosage:
          reminder.dosage ===
          "Not specified"
            ? ""
            : reminder.dosage || "",

        reminder_time:
          toTimeInputValue(
            reminder.reminderTime
          ),

        frequency:
          reminder.frequency ||
          "Once Daily",

        start_date:
          toDateInputValue(
            reminder.startDate
          ),

        end_date:
          toDateInputValue(
            reminder.endDate
          ),

        is_active: Boolean(
          reminder.active
        ),
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, reminder]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    const handleEscape = (event) => {
      if (
        event.key === "Escape" &&
        !saving
      ) {
        onClose();
      }
    };

    document.body.style.overflow =
      "hidden";

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open, saving, onClose]);

  if (!open) {
    return null;
  }

  const handleChange = (event) => {
    const {
      name,
      value,
      checked,
      type,
    } = event.target;

    setForm((currentForm) => ({
      ...currentForm,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    if (validationError) {
      setValidationError("");
    }
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (
      !form.patient_id ||
      !form.medicine_name.trim() ||
      !form.reminder_time
    ) {
      setValidationError(
        "Patient, medicine name, and reminder time are required."
      );

      return;
    }

    if (
      form.start_date &&
      form.end_date &&
      form.end_date < form.start_date
    ) {
      setValidationError(
        "End date cannot be earlier than the start date."
      );

      return;
    }

    await onSave({
      patient_id: Number(
        form.patient_id
      ),

      medicine_name:
        form.medicine_name.trim(),

      dosage: form.dosage.trim(),

      reminder_time:
        form.reminder_time,

      frequency: form.frequency,

      start_date: form.start_date,

      end_date: form.end_date,

      is_active: Boolean(
        form.is_active
      ),
    });
  };

  const visibleError =
    validationError || error;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 backdrop-blur-[2px] sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reminder-modal-title"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !saving
        ) {
          onClose();
        }
      }}
    >
      <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-[28px] bg-white shadow-2xl sm:max-w-2xl sm:rounded-[28px]">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-6 sm:py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Medication schedule
            </p>

            <h2
              id="reminder-modal-title"
              className="mt-1 text-xl font-bold text-slate-900"
            >
              {isEditing
                ? "Edit reminder"
                : "Add new reminder"}
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              {isEditing
                ? "Update the patient's medication reminder details."
                : "Schedule a medication reminder for a patient."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close reminder form"
            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 px-5 py-5 sm:px-6 sm:py-6"
        >
          {visibleError && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

              <span>{visibleError}</span>
            </div>
          )}

          <FormField
            label="Patient"
            required
          >
            <div className="relative">
              <select
                name="patient_id"
                value={form.patient_id}
                onChange={handleChange}
                disabled={saving}
                className={`${inputClassName} appearance-none pr-10`}
              >
                <option value="">
                  Select patient
                </option>

                {patients.map(
                  (patient) => (
                    <option
                      key={patient.id}
                      value={patient.id}
                    >
                      {patient.name}
                      {patient.email
                        ? ` — ${patient.email}`
                        : ""}
                    </option>
                  )
                )}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </FormField>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField
              label="Medicine name"
              required
            >
              <input
                name="medicine_name"
                value={form.medicine_name}
                onChange={handleChange}
                disabled={saving}
                placeholder="Paracetamol"
                className={inputClassName}
              />
            </FormField>

            <FormField label="Dosage">
              <input
                name="dosage"
                value={form.dosage}
                onChange={handleChange}
                disabled={saving}
                placeholder="1 tablet after meal"
                className={inputClassName}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField
              label="Reminder time"
              required
            >
              <input
                type="time"
                name="reminder_time"
                value={form.reminder_time}
                onChange={handleChange}
                disabled={saving}
                className={inputClassName}
              />
            </FormField>

            <FormField label="Frequency">
              <div className="relative">
                <select
                  name="frequency"
                  value={form.frequency}
                  onChange={handleChange}
                  disabled={saving}
                  className={`${inputClassName} appearance-none pr-10`}
                >
                  {FREQUENCIES.map(
                    (frequency) => (
                      <option
                        key={frequency}
                        value={frequency}
                      >
                        {frequency}
                      </option>
                    )
                  )}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField label="Start date">
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                disabled={saving}
                className={inputClassName}
              />
            </FormField>

            <FormField label="End date">
              <input
                type="date"
                name="end_date"
                min={
                  form.start_date ||
                  undefined
                }
                value={form.end_date}
                onChange={handleChange}
                disabled={saving}
                className={inputClassName}
              />
            </FormField>
          </div>

          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Active reminder
              </p>

              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                Active reminders can send
                scheduled medication
                notifications.
              </p>
            </div>

            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
              disabled={saving}
              className="h-4 w-4 shrink-0 accent-primary"
            />
          </label>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              )}

              {saving
                ? "Saving..."
                : isEditing
                  ? "Update reminder"
                  : "Save reminder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({
  reminder,
  deleting,
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    if (!reminder) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    const handleEscape = (event) => {
      if (
        event.key === "Escape" &&
        !deleting
      ) {
        onCancel();
      }
    };

    document.body.style.overflow =
      "hidden";

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [reminder, deleting, onCancel]);

  if (!reminder) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-reminder-title"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !deleting
        ) {
          onCancel();
        }
      }}
    >
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 text-center shadow-2xl sm:p-7">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <Trash2 className="h-6 w-6" />
        </div>

        <h2
          id="delete-reminder-title"
          className="mt-5 text-xl font-bold text-slate-900"
        >
          Delete reminder?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          The reminder for{" "}
          <span className="font-semibold text-slate-700">
            {reminder.medicineName}
          </span>{" "}
          assigned to{" "}
          <span className="font-semibold text-slate-700">
            {reminder.patientName}
          </span>{" "}
          will be permanently removed.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting && (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            )}

            {deleting
              ? "Deleting..."
              : "Delete reminder"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReminderMobileCard({
  reminder,
  updatingStatus,
  onToggleStatus,
  onEdit,
  onDelete,
}) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Pill className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-900">
              {reminder.medicineName}
            </h3>

            <p className="mt-1 truncate text-xs font-medium text-slate-500">
              {reminder.dosage}
            </p>
          </div>
        </div>

        <StatusBadge
          active={reminder.active}
        />
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
          <UserRound className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">
            {reminder.patientName}
          </p>

          <p className="truncate text-xs text-slate-500">
            {reminder.patientEmail ||
              "Email not available"}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-100 px-3 py-2.5">
          <p className="text-xs text-slate-400">
            Reminder time
          </p>

          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
            <Clock3 className="h-4 w-4 text-primary" />

            {formatTime(
              reminder.reminderTime
            )}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 px-3 py-2.5">
          <p className="text-xs text-slate-400">
            Frequency
          </p>

          <p className="mt-1 truncate text-sm font-semibold text-slate-700">
            {reminder.frequency}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-slate-100 px-3 py-2.5">
        <p className="text-xs text-slate-400">
          Reminder period
        </p>

        <div className="mt-1 flex items-start gap-1.5 text-sm font-semibold text-slate-700">
          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

          <span>
            {formatDate(
              reminder.startDate
            )}{" "}
            —{" "}
            {formatDate(
              reminder.endDate
            )}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2">
          <StatusToggle
            reminder={reminder}
            updating={updatingStatus}
            onToggle={onToggleStatus}
          />

          <span className="text-xs font-medium text-slate-500">
            {reminder.active
              ? "Enabled"
              : "Disabled"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              onEdit(reminder)
            }
            aria-label={`Edit reminder for ${reminder.medicineName}`}
            className="rounded-xl border border-primary/15 bg-primary/5 p-2.5 text-primary transition hover:bg-primary/10"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              onDelete(reminder)
            }
            aria-label={`Delete reminder for ${reminder.medicineName}`}
            className="rounded-xl border border-red-100 bg-red-50 p-2.5 text-red-600 transition hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function ReminderManagement() {
  const [reminders, setReminders] =
    useState([]);

  const [patients, setPatients] =
    useState([]);

  const [query, setQuery] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("All");

  const [loading, setLoading] =
    useState(true);

  const [pageError, setPageError] =
    useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editTarget, setEditTarget] =
    useState(null);

  const [saving, setSaving] =
    useState(false);

  const [modalError, setModalError] =
    useState("");

  const [
    statusUpdatingId,
    setStatusUpdatingId,
  ] = useState(null);

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState(null);

  const [deleting, setDeleting] =
    useState(false);

  const patientMap = useMemo(
    () =>
      new Map(
        patients.map((patient) => [
          Number(patient.id),
          patient,
        ])
      ),
    [patients]
  );

  const loadData =
    useCallback(async () => {
      setLoading(true);
      setPageError("");

      try {
        const [
          remindersResponse,
          patientsResponse,
        ] = await Promise.all([
          getAdminReminders({
            page: 1,
            limit: 100,
          }),

          getReminderPatients({
            page: 1,
            limit: 100,
          }),
        ]);

        const patientList =
          extractPatients(
            patientsResponse
          ).map(normalizePatient);

        const patientLookup =
          new Map(
            patientList.map(
              (patient) => [
                Number(patient.id),
                patient,
              ]
            )
          );

        const reminderList =
          extractReminders(
            remindersResponse
          );

        setPatients(patientList);

        setReminders(
          reminderList.map(
            (reminder) =>
              normalizeReminder(
                reminder,
                patientLookup
              )
          )
        );
      } catch (error) {
        setReminders([]);
        setPatients([]);

        setPageError(
          getErrorMessage(
            error,
            "Unable to load reminders."
          )
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredReminders =
    useMemo(() => {
      const search = query
        .trim()
        .toLowerCase();

      return reminders.filter(
        (reminder) => {
          const matchesQuery =
            !search ||
            reminder.patientName
              .toLowerCase()
              .includes(search) ||
            reminder.patientEmail
              .toLowerCase()
              .includes(search) ||
            reminder.medicineName
              .toLowerCase()
              .includes(search) ||
            reminder.dosage
              .toLowerCase()
              .includes(search) ||
            reminder.frequency
              .toLowerCase()
              .includes(search);

          const matchesStatus =
            statusFilter === "All" ||
            (statusFilter ===
              "Active" &&
              reminder.active) ||
            (statusFilter ===
              "Inactive" &&
              !reminder.active);

          return (
            matchesQuery &&
            matchesStatus
          );
        }
      );
    }, [
      reminders,
      query,
      statusFilter,
    ]);

  const activeCount = useMemo(
    () =>
      reminders.filter(
        (reminder) =>
          reminder.active
      ).length,
    [reminders]
  );

  const inactiveCount =
    reminders.length - activeCount;

  const hasFilters =
    Boolean(query.trim()) ||
    statusFilter !== "All";

  const openAddModal = () => {
    setEditTarget(null);
    setModalError("");
    setModalOpen(true);
  };

  const openEditModal = (reminder) => {
    setEditTarget(reminder);
    setModalError("");
    setModalOpen(true);
  };

  const closeModal = useCallback(() => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditTarget(null);
    setModalError("");
  }, [saving]);

  const closeDeleteModal =
    useCallback(() => {
      if (deleting) {
        return;
      }

      setDeleteTarget(null);
    }, [deleting]);

  const saveReminder = async (
    payload
  ) => {
    setSaving(true);
    setModalError("");

    try {
      let response;

      if (
        editTarget?.id !== undefined
      ) {
        response =
          await updateAdminReminder(
            editTarget.id,
            payload
          );
      } else {
        response =
          await createAdminReminder(
            payload
          );
      }

      const responseReminder =
        extractReminder(response);

      const normalizedReminder =
        normalizeReminder(
          {
            ...editTarget,
            ...payload,

            ...(responseReminder &&
            typeof responseReminder ===
              "object"
              ? responseReminder
              : {}),

            id:
              responseReminder?.id ??
              responseReminder?._id ??
              editTarget?.id ??
              Date.now(),
          },
          patientMap
        );

      setReminders(
        (currentReminders) => {
          if (
            editTarget?.id !==
            undefined
          ) {
            return currentReminders.map(
              (reminder) =>
                reminder.id ===
                editTarget.id
                  ? normalizedReminder
                  : reminder
            );
          }

          return [
            normalizedReminder,
            ...currentReminders,
          ];
        }
      );

      setModalOpen(false);
      setEditTarget(null);
    } catch (error) {
      setModalError(
        getErrorMessage(
          error,
          editTarget
            ? "Unable to update reminder."
            : "Unable to create reminder."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (
    reminder
  ) => {
    if (
      reminder.id === undefined ||
      statusUpdatingId !== null
    ) {
      return;
    }

    const nextStatus =
      !reminder.active;

    setStatusUpdatingId(
      reminder.id
    );

    setPageError("");

    try {
      const response =
        await updateAdminReminderStatus(
          reminder.id,
          nextStatus
        );

      const responseReminder =
        extractReminder(response);

      const updatedReminder =
        normalizeReminder(
          {
            ...reminder,

            ...(responseReminder &&
            typeof responseReminder ===
              "object"
              ? responseReminder
              : {}),

            is_active: nextStatus,
            active: nextStatus,
          },
          patientMap
        );

      setReminders(
        (currentReminders) =>
          currentReminders.map(
            (currentReminder) =>
              currentReminder.id ===
              reminder.id
                ? updatedReminder
                : currentReminder
          )
      );
    } catch (error) {
      setPageError(
        getErrorMessage(
          error,
          "Unable to update reminder status."
        )
      );
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const confirmDelete = async () => {
    if (
      !deleteTarget ||
      deleteTarget.id === undefined
    ) {
      return;
    }

    setDeleting(true);
    setPageError("");

    try {
      await deleteAdminReminder(
        deleteTarget.id
      );

      setReminders(
        (currentReminders) =>
          currentReminders.filter(
            (reminder) =>
              reminder.id !==
              deleteTarget.id
          )
      );

      setDeleteTarget(null);
    } catch (error) {
      setPageError(
        getErrorMessage(
          error,
          "Unable to delete reminder."
        )
      );
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("All");
  };

  return (
    <section className="space-y-6 font-['Inter']">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />

            Medication reminders
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Reminder Management
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Create and manage medication
            schedules, notification times,
            and reminder status for HOKU
            patients.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          style={{ backgroundColor: "#1E63C6" }}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-4 focus:ring-primary/20 sm:w-auto"
        >
          <Plus className="h-4 w-4" />

          Add reminder
        </button>
      </header>

      {pageError && (
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

            <span>{pageError}</span>
          </div>

          <button
            type="button"
            onClick={() =>
              setPageError("")
            }
            aria-label="Dismiss error"
            className="rounded-lg p-1 transition hover:bg-red-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total reminders"
          value={reminders.length}
          icon={AlarmClock}
          iconClassName="bg-primary/10 text-primary"
        />

        <StatCard
          label="Active reminders"
          value={activeCount}
          icon={CheckCircle2}
          iconClassName="bg-secondary/20 text-lime-700"
        />

        <StatCard
          label="Inactive reminders"
          value={inactiveCount}
          icon={AlertCircle}
          iconClassName="bg-slate-100 text-slate-500"
        />
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value
                )
              }
              placeholder="Search patient, medicine, dosage, or frequency..."
              className={`${inputClassName} pl-10`}
            />
          </div>

          <div className="relative lg:w-48">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className={`${inputClassName} appearance-none pr-10`}
            >
              <option value="All">
                All statuses
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>

            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredReminders.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {reminders.length}
            </span>{" "}
            reminders
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-semibold text-primary transition hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-16 text-center shadow-sm">
          <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-primary" />

          <p className="mt-3 text-sm font-semibold text-slate-700">
            Loading reminders...
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Fetching reminders and
            patient information.
          </p>
        </div>
      ) : filteredReminders.length ===
        0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <AlarmClock className="h-6 w-6" />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900">
            No reminders found
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            {hasFilters
              ? "Try changing your search term or status filter."
              : "Create the first medication reminder for a patient."}
          </p>

          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 px-4 text-sm font-semibold text-primary transition hover:bg-primary/10"
            >
              Clear filters
            </button>
          ) : (
            <button
              type="button"
              onClick={openAddModal}
              style={{ backgroundColor: "#1E63C6" }}
              className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:brightness-95"
            >
              <Plus className="h-4 w-4" />

              Add reminder
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
            {filteredReminders.map(
              (reminder) => (
                <ReminderMobileCard
                  key={reminder.id}
                  reminder={reminder}
                  updatingStatus={
                    statusUpdatingId ===
                    reminder.id
                  }
                  onToggleStatus={
                    toggleStatus
                  }
                  onEdit={
                    openEditModal
                  }
                  onDelete={
                    setDeleteTarget
                  }
                />
              )
            )}
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1040px] text-left text-sm">
                <thead className="bg-slate-50/80">
                  <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                    <th className="px-5 py-4">
                      Patient
                    </th>

                    <th className="px-4 py-4">
                      Medicine
                    </th>

                    <th className="px-4 py-4">
                      Schedule
                    </th>

                    <th className="px-4 py-4">
                      Reminder period
                    </th>

                    <th className="px-4 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredReminders.map(
                    (reminder) => {
                      const updatingStatus =
                        statusUpdatingId ===
                        reminder.id;

                      return (
                        <tr
                          key={reminder.id}
                          className="transition hover:bg-slate-50/70"
                        >
                          <td className="px-5 py-4">
                            <div className="flex max-w-xs items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <UserRound className="h-5 w-5" />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-bold text-slate-900">
                                  {
                                    reminder.patientName
                                  }
                                </p>

                                <p className="mt-1 truncate text-xs text-slate-500">
                                  {reminder.patientEmail ||
                                    "Email not available"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex max-w-xs items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary/20 text-lime-700">
                                <Pill className="h-5 w-5" />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-bold text-slate-900">
                                  {
                                    reminder.medicineName
                                  }
                                </p>

                                <p className="mt-1 truncate text-xs text-slate-500">
                                  {
                                    reminder.dosage
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="space-y-1.5">
                              <p className="flex items-center gap-1.5 font-semibold text-slate-700">
                                <Clock3 className="h-4 w-4 text-primary" />

                                {formatTime(
                                  reminder.reminderTime
                                )}
                              </p>

                              <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                                {
                                  reminder.frequency
                                }
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-start gap-2 text-xs leading-5 text-slate-600">
                              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                              <div>
                                <p>
                                  {formatDate(
                                    reminder.startDate
                                  )}
                                </p>

                                <p className="text-slate-400">
                                  to{" "}
                                  {formatDate(
                                    reminder.endDate
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <StatusToggle
                                reminder={
                                  reminder
                                }
                                updating={
                                  updatingStatus
                                }
                                onToggle={
                                  toggleStatus
                                }
                              />

                              <StatusBadge
                                active={
                                  reminder.active
                                }
                              />
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  openEditModal(
                                    reminder
                                  )
                                }
                                aria-label={`Edit reminder for ${reminder.medicineName}`}
                                className="rounded-xl border border-primary/15 bg-primary/5 p-2.5 text-primary transition hover:bg-primary/10"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteTarget(
                                    reminder
                                  )
                                }
                                aria-label={`Delete reminder for ${reminder.medicineName}`}
                                className="rounded-xl border border-red-100 bg-red-50 p-2.5 text-red-600 transition hover:bg-red-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <ReminderModal
        open={modalOpen}
        reminder={editTarget}
        patients={patients}
        saving={saving}
        error={modalError}
        onClose={closeModal}
        onSave={saveReminder}
      />

      <DeleteModal
        reminder={deleteTarget}
        deleting={deleting}
        onCancel={closeDeleteModal}
        onConfirm={confirmDelete}
      />
    </section>
  );
}