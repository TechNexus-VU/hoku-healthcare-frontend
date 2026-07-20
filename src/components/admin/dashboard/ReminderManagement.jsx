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
  
  function formatDate(value) {
    if (!value) {
      return "Not specified";
    }
  
    const date = new Date(`${value}T00:00:00`);
  
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
  
  function ReminderModal({
    open,
    reminder,
    patients,
    saving,
    error,
    onClose,
    onSave,
  }) {
    const [form, setForm] = useState(EMPTY_FORM);
  
    const isEditing = Boolean(reminder);
  
    useEffect(() => {
      if (!open) {
        return;
      }
  
      if (reminder) {
        setForm({
          patient_id: String(
            reminder.patientId || ""
          ),
          medicine_name:
            reminder.medicineName || "",
          dosage: reminder.dosage || "",
          reminder_time:
            reminder.reminderTime || "",
          frequency:
            reminder.frequency || "Once Daily",
          start_date:
            reminder.startDate || "",
          end_date: reminder.endDate || "",
          is_active: Boolean(reminder.active),
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }, [open, reminder]);
  
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
          type === "checkbox" ? checked : value,
      }));
    };
  
    const handleSubmit = async (event) => {
      event.preventDefault();
  
      if (
        !form.patient_id ||
        !form.medicine_name.trim() ||
        !form.reminder_time
      ) {
        return;
      }
  
      await onSave({
        patient_id: Number(form.patient_id),
        medicine_name:
          form.medicine_name.trim(),
        dosage: form.dosage.trim(),
        reminder_time: form.reminder_time,
        frequency: form.frequency,
        start_date: form.start_date,
        end_date: form.end_date,
        is_active: Boolean(form.is_active),
      });
    };
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-6">
        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-['Poppins'] text-lg font-semibold text-[#1A1A2E]">
              {isEditing
                ? "Edit Reminder"
                : "Add New Reminder"}
            </h3>
  
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              aria-label="Close"
              className="rounded-lg p-1 text-[#6B7280] hover:bg-gray-100 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
  
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
  
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-[#1A1A2E]">
                Patient
              </label>
  
              <select
                name="patient_id"
                value={form.patient_id}
                onChange={handleChange}
                disabled={saving}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 disabled:bg-gray-50"
              >
                <option value="">
                  Select patient
                </option>
  
                {patients.map((patient) => (
                  <option
                    key={patient.id}
                    value={patient.id}
                  >
                    {patient.name}
                    {patient.email
                      ? ` — ${patient.email}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>
  
            <div>
              <label className="mb-1 block text-sm font-medium text-[#1A1A2E]">
                Medicine Name
              </label>
  
              <input
                name="medicine_name"
                value={form.medicine_name}
                onChange={handleChange}
                disabled={saving}
                placeholder="Paracetamol"
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 disabled:bg-gray-50"
              />
            </div>
  
            <div>
              <label className="mb-1 block text-sm font-medium text-[#1A1A2E]">
                Dosage
              </label>
  
              <input
                name="dosage"
                value={form.dosage}
                onChange={handleChange}
                disabled={saving}
                placeholder="1 tablet after meal"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 disabled:bg-gray-50"
              />
            </div>
  
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1A1A2E]">
                  Reminder Time
                </label>
  
                <input
                  type="time"
                  name="reminder_time"
                  value={form.reminder_time}
                  onChange={handleChange}
                  disabled={saving}
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 disabled:bg-gray-50"
                />
              </div>
  
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1A1A2E]">
                  Frequency
                </label>
  
                <select
                  name="frequency"
                  value={form.frequency}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 disabled:bg-gray-50"
                >
                  {FREQUENCIES.map((frequency) => (
                    <option
                      key={frequency}
                      value={frequency}
                    >
                      {frequency}
                    </option>
                  ))}
                </select>
              </div>
            </div>
  
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1A1A2E]">
                  Start Date
                </label>
  
                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 disabled:bg-gray-50"
                />
              </div>
  
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1A1A2E]">
                  End Date
                </label>
  
                <input
                  type="date"
                  name="end_date"
                  min={form.start_date || undefined}
                  value={form.end_date}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 disabled:bg-gray-50"
                />
              </div>
            </div>
  
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-[#1A1A2E]">
                  Active Reminder
                </p>
  
                <p className="text-xs text-[#6B7280]">
                  Active reminders can send scheduled
                  notifications.
                </p>
              </div>
  
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
                disabled={saving}
                className="h-4 w-4 accent-[#2E7D32]"
              />
            </label>
  
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-[#1A1A2E] hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
  
              <button
                type="submit"
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#2E7D32] py-2.5 text-sm font-medium text-white hover:bg-[#1B5E20] disabled:opacity-60"
              >
                {saving && (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                )}
  
                {saving
                  ? "Saving..."
                  : isEditing
                    ? "Update Reminder"
                    : "Save Reminder"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  
  export default function ReminderManagement() {
    const [reminders, setReminders] = useState([]);
    const [patients, setPatients] = useState([]);
  
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] =
      useState("All");
  
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");
  
    const [modalOpen, setModalOpen] =
      useState(false);
    const [editTarget, setEditTarget] =
      useState(null);
    const [saving, setSaving] = useState(false);
    const [modalError, setModalError] =
      useState("");
  
    const [statusUpdatingId, setStatusUpdatingId] =
      useState(null);
  
    const [deleteTarget, setDeleteTarget] =
      useState(null);
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
  
    const loadData = useCallback(async () => {
      setLoading(true);
      setPageError("");
  
      try {
        const [remindersResponse, patientsResponse] =
          await Promise.all([
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
          extractPatients(patientsResponse).map(
            normalizePatient
          );
  
        const patientLookup = new Map(
          patientList.map((patient) => [
            Number(patient.id),
            patient,
          ])
        );
  
        const reminderList =
          extractReminders(remindersResponse);
  
        setPatients(patientList);
  
        setReminders(
          reminderList.map((reminder) =>
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
  
    const filteredReminders = useMemo(() => {
      const search = query.trim().toLowerCase();
  
      return reminders.filter((reminder) => {
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
            .includes(search);
  
        const matchesStatus =
          statusFilter === "All" ||
          (statusFilter === "Active" &&
            reminder.active) ||
          (statusFilter === "Inactive" &&
            !reminder.active);
  
        return matchesQuery && matchesStatus;
      });
    }, [reminders, query, statusFilter]);
  
    const activeCount = useMemo(
      () =>
        reminders.filter(
          (reminder) => reminder.active
        ).length,
      [reminders]
    );
  
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
  
    const closeModal = () => {
      if (saving) {
        return;
      }
  
      setModalOpen(false);
      setEditTarget(null);
      setModalError("");
    };
  
    const saveReminder = async (payload) => {
      setSaving(true);
      setModalError("");
  
      try {
        let response;
  
        if (editTarget?.id !== undefined) {
          response = await updateAdminReminder(
            editTarget.id,
            payload
          );
        } else {
          response =
            await createAdminReminder(payload);
        }
  
        const responseReminder =
          extractReminder(response);
  
        const normalizedReminder =
          normalizeReminder(
            {
              ...editTarget,
              ...payload,
              ...(responseReminder &&
              typeof responseReminder === "object"
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
  
        setReminders((currentReminders) => {
          if (editTarget?.id !== undefined) {
            return currentReminders.map(
              (reminder) =>
                reminder.id === editTarget.id
                  ? normalizedReminder
                  : reminder
            );
          }
  
          return [
            normalizedReminder,
            ...currentReminders,
          ];
        });
  
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
  
    const toggleStatus = async (reminder) => {
      if (
        reminder.id === undefined ||
        statusUpdatingId !== null
      ) {
        return;
      }
  
      const nextStatus = !reminder.active;
  
      setStatusUpdatingId(reminder.id);
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
              typeof responseReminder === "object"
                ? responseReminder
                : {}),
              is_active: nextStatus,
              active: nextStatus,
            },
            patientMap
          );
  
        setReminders((currentReminders) =>
          currentReminders.map(
            (currentReminder) =>
              currentReminder.id === reminder.id
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
        await deleteAdminReminder(deleteTarget.id);
  
        setReminders((currentReminders) =>
          currentReminders.filter(
            (reminder) =>
              reminder.id !== deleteTarget.id
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
  
    return (
      <div className="min-h-screen bg-[#F5F5F5] font-['Inter']">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#2E7D32]">
                Hoku Health Care
              </p>
  
              <h1 className="font-['Poppins'] text-2xl font-bold text-[#1A1A2E] sm:text-3xl">
                Reminder Management
              </h1>
  
              <p className="mt-1 text-sm text-[#6B7280]">
                Create and manage patient medication
                reminders.
              </p>
            </div>
  
            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#2E7D32] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1B5E20]"
            >
              <Plus className="h-4 w-4" />
              Add Reminder
            </button>
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
                Total Reminders
              </p>
              <p className="font-['Poppins'] text-xl font-bold text-[#1A1A2E]">
                {reminders.length}
              </p>
            </div>
  
            <div className="rounded-2xl bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <p className="text-xs text-[#6B7280]">
                Active
              </p>
              <p className="font-['Poppins'] text-xl font-bold text-[#2E7D32]">
                {activeCount}
              </p>
            </div>
  
            <div className="rounded-2xl bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <p className="text-xs text-[#6B7280]">
                Inactive
              </p>
              <p className="font-['Poppins'] text-xl font-bold text-[#DC2626]">
                {reminders.length - activeCount}
              </p>
            </div>
          </div>
  
          <div className="mb-5 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
  
              <input
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Search patient or medicine..."
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
                className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-4 pr-9 text-sm outline-none focus:border-[#2E7D32]"
              >
                <option value="All">
                  All Statuses
                </option>
                <option value="Active">
                  Active
                </option>
                <option value="Inactive">
                  Inactive
                </option>
              </select>
  
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            </div>
  
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[#1A1A2E] hover:bg-gray-50 disabled:opacity-60"
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
              <div className="flex flex-col items-center justify-center py-16">
                <LoaderCircle className="mb-3 h-7 w-7 animate-spin text-[#2E7D32]" />
                <p className="text-sm">
                  Loading reminders...
                </p>
              </div>
            ) : filteredReminders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <AlarmClock className="mb-3 h-8 w-8 text-[#6B7280]" />
                <p className="font-medium text-[#1A1A2E]">
                  No reminders found
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs uppercase text-[#6B7280]">
                      <th className="py-3">Patient</th>
                      <th className="py-3">Medicine</th>
                      <th className="py-3">Schedule</th>
                      <th className="py-3">Dates</th>
                      <th className="py-3">Status</th>
                      <th className="py-3 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
  
                  <tbody>
                    {filteredReminders.map(
                      (reminder) => (
                        <tr
                          key={reminder.id}
                          className="border-b border-gray-50 last:border-0"
                        >
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <UserRound className="h-5 w-5 text-[#1565C0]" />
                              <div>
                                <p className="font-medium text-[#1A1A2E]">
                                  {reminder.patientName}
                                </p>
                                <p className="text-xs text-[#6B7280]">
                                  {reminder.patientEmail}
                                </p>
                              </div>
                            </div>
                          </td>
  
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <Pill className="h-5 w-5 text-[#2E7D32]" />
                              <div>
                                <p className="font-medium text-[#1A1A2E]">
                                  {reminder.medicineName}
                                </p>
                                <p className="text-xs text-[#6B7280]">
                                  {reminder.dosage}
                                </p>
                              </div>
                            </div>
                          </td>
  
                          <td className="py-4 text-[#6B7280]">
                            <div className="space-y-1">
                              <p className="flex items-center gap-1.5">
                                <Clock3 className="h-4 w-4" />
                                {formatTime(
                                  reminder.reminderTime
                                )}
                              </p>
                              <p className="text-xs">
                                {reminder.frequency}
                              </p>
                            </div>
                          </td>
  
                          <td className="py-4 text-[#6B7280]">
                            <div className="flex items-start gap-1.5">
                              <CalendarDays className="mt-0.5 h-4 w-4" />
                              <div className="text-xs">
                                <p>
                                  {formatDate(
                                    reminder.startDate
                                  )}
                                </p>
                                <p>
                                  to{" "}
                                  {formatDate(
                                    reminder.endDate
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>
  
                          <td className="py-4">
                            <button
                              type="button"
                              onClick={() =>
                                toggleStatus(reminder)
                              }
                              disabled={
                                statusUpdatingId ===
                                reminder.id
                              }
                              className={`relative h-6 w-11 rounded-full ${
                                reminder.active
                                  ? "bg-[#2E7D32]"
                                  : "bg-gray-300"
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white transition ${
                                  reminder.active
                                    ? "left-5"
                                    : "left-0.5"
                                }`}
                              >
                                {statusUpdatingId ===
                                  reminder.id && (
                                  <LoaderCircle className="h-3 w-3 animate-spin" />
                                )}
                              </span>
                            </button>
                          </td>
  
                          <td className="py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  openEditModal(
                                    reminder
                                  )
                                }
                                className="rounded-lg p-2 text-[#1565C0] hover:bg-blue-50"
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
                                className="rounded-lg p-2 text-[#DC2626] hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
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
  
        <ReminderModal
          open={modalOpen}
          reminder={editTarget}
          patients={patients}
          saving={saving}
          error={modalError}
          onClose={closeModal}
          onSave={saveReminder}
        />
  
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
              <Trash2 className="mx-auto mb-4 h-7 w-7 text-[#DC2626]" />
  
              <h3 className="font-['Poppins'] font-semibold text-[#1A1A2E]">
                Delete reminder?
              </h3>
  
              <p className="mt-2 text-sm text-[#6B7280]">
                The reminder for{" "}
                {deleteTarget.medicineName} will be
                permanently removed.
              </p>
  
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setDeleteTarget(null)
                  }
                  disabled={deleting}
                  className="flex-1 rounded-lg border py-2.5 text-sm"
                >
                  Cancel
                </button>
  
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#DC2626] py-2.5 text-sm text-white"
                >
                  {deleting && (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  )}
                  {deleting
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }