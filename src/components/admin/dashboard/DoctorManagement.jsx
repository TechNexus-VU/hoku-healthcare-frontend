import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  ChevronDown,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Stethoscope,
  Trash2,
  X,
} from "lucide-react";

import {
  createAdminDoctor,
  deleteAdminDoctor,
  extractDoctor,
  extractDoctors,
  getAdminDoctors,
  updateAdminDoctor,
  updateAdminDoctorAvailability,
} from "@/services/adminDoctorsapi";

const CURRENCIES = {
  PKR: {
    symbol: "PKR",
    rate: 1,
    label: "Pakistan (PKR)",
  },
  AED: {
    symbol: "AED",
    rate: 0.013,
    label: "UAE (AED)",
  },
  GBP: {
    symbol: "£",
    rate: 0.0028,
    label: "UK (GBP)",
  },
  EUR: {
    symbol: "€",
    rate: 0.0032,
    label: "Europe (EUR)",
  },
  USD: {
    symbol: "$",
    rate: 0.0036,
    label: "USA (USD)",
  },
};

const specialties = [
  "All Specialties",
  "Cardiologist",
  "Gynecologist",
  "Child Specialist",
  "Dermatologist",
  "Dental Specialist",
];

const EMPTY_FORM = {
  name: "",
  specialty: "",
  experience: "",
  fee: "",
};

function formatFee(feeInPkr, currency) {
  const selectedCurrency =
    CURRENCIES[currency] || CURRENCIES.PKR;

  const fee = Number(feeInPkr) || 0;
  const converted = fee * selectedCurrency.rate;

  const formatted =
    currency === "PKR"
      ? Math.round(converted).toLocaleString()
      : converted.toFixed(2);

  return `${selectedCurrency.symbol} ${formatted}`;
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

  return initials || "DR";
}

function normalizeDoctor(doctor = {}) {
  const name =
    doctor.name ||
    doctor.full_name ||
    doctor.fullName ||
    "Unnamed Doctor";

  return {
    ...doctor,

    id:
      doctor.id ??
      doctor._id ??
      doctor.doctor_id ??
      doctor.doctorId,

    name,

    specialty:
      doctor.specialty ||
      doctor.specialization ||
      doctor.department ||
      "General Physician",

    experience: Number(
      doctor.experience ??
        doctor.years_of_experience ??
        doctor.yearsOfExperience ??
        0
    ),

    fee: Number(
      doctor.fee ??
        doctor.consultation_fee ??
        doctor.consultationFee ??
        0
    ),

    available:
  doctor.available ??
  doctor.is_available ??
  doctor.isAvailable ??
  (doctor.status
    ? doctor.status === "available"
    : false),

    photo:
      doctor.photo ||
      doctor.initials ||
      getInitials(name),
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

function DoctorModal({
  open,
  doctor,
  saving,
  error,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(EMPTY_FORM);

  const isEditing = Boolean(doctor);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (doctor) {
      setForm({
        name: doctor.name || "",
        specialty: doctor.specialty || "",
        experience: String(doctor.experience ?? ""),
        fee: String(doctor.fee ?? ""),
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [doctor, open]);

  if (!open) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const specialty = form.specialty.trim();

    if (!name || !specialty) {
      return;
    }

    await onSave({
      name,
      specialty,
      experience: Number(form.experience) || 0,
      fee: Number(form.fee) || 0,
      available: doctor?.available ?? true,
      photo: doctor?.photo || getInitials(name),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-['Poppins'] text-lg font-semibold text-[#1A1A2E]">
            {isEditing
              ? "Edit Doctor"
              : "Add New Doctor"}
          </h3>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="rounded-lg p-1 text-[#6B7280] hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
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
              Full Name
            </label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Dr. Sarah Thompson"
              disabled={saving}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 disabled:cursor-not-allowed disabled:bg-gray-50"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#1A1A2E]">
              Specialty
            </label>

            <select
              name="specialty"
              value={form.specialty}
              onChange={handleChange}
              disabled={saving}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 disabled:cursor-not-allowed disabled:bg-gray-50"
              required
            >
              <option value="">
                Select specialty
              </option>

              {specialties
                .slice(1)
                .map((specialtyOption) => (
                  <option
                    key={specialtyOption}
                    value={specialtyOption}
                  >
                    {specialtyOption}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#1A1A2E]">
                Experience (yrs)
              </label>

              <input
                type="number"
                name="experience"
                min="0"
                value={form.experience}
                onChange={handleChange}
                disabled={saving}
                placeholder="5"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 disabled:cursor-not-allowed disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#1A1A2E]">
                Fee (PKR)
              </label>

              <input
                type="number"
                name="fee"
                min="0"
                value={form.fee}
                onChange={handleChange}
                disabled={saving}
                placeholder="3000"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 disabled:cursor-not-allowed disabled:bg-gray-50"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-[#1A1A2E] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#2E7D32] py-2.5 text-sm font-medium text-white hover:bg-[#1B5E20] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              )}

              {saving
                ? "Saving..."
                : isEditing
                  ? "Update Doctor"
                  : "Save Doctor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState([]);
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState(
    "All Specialties"
  );
  const [currency, setCurrency] = useState("EUR");

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  const [deleteTarget, setDeleteTarget] =
    useState(null);
  const [deleting, setDeleting] = useState(false);

  const [availabilityUpdatingId, setAvailabilityUpdatingId] =
    useState(null);

  const loadDoctors = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const response = await getAdminDoctors({
        page: 1,
        limit: 100,
      });

      const doctorList = extractDoctors(response);

      setDoctors(
        doctorList.map((doctor) =>
          normalizeDoctor(doctor)
        )
      );
    } catch (error) {
      setDoctors([]);
      setPageError(
        getErrorMessage(
          error,
          "Unable to load doctors from the server."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  const filteredDoctors = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLowerCase();

    return doctors.filter((doctor) => {
      const matchesQuery =
        !normalizedQuery ||
        doctor.name
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesSpecialty =
        specialty === "All Specialties" ||
        doctor.specialty === specialty;

      return matchesQuery && matchesSpecialty;
    });
  }, [doctors, query, specialty]);

  const openAddModal = () => {
    setEditTarget(null);
    setModalError("");
    setModalOpen(true);
  };

  const openEditModal = (doctor) => {
    setEditTarget(doctor);
    setModalError("");
    setModalOpen(true);
  };

  const closeDoctorModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditTarget(null);
    setModalError("");
  };

  const handleSaveDoctor = async (payload) => {
    setSaving(true);
    setModalError("");

    try {
      if (editTarget?.id !== undefined) {
        const response = await updateAdminDoctor(
          editTarget.id,
          payload
        );

        const responseDoctor =
          extractDoctor(response);

        const updatedDoctor = normalizeDoctor({
          ...editTarget,
          ...payload,
          ...(responseDoctor &&
          typeof responseDoctor === "object"
            ? responseDoctor
            : {}),
          id:
            responseDoctor?.id ??
            responseDoctor?._id ??
            editTarget.id,
        });

        setDoctors((currentDoctors) =>
          currentDoctors.map((doctor) =>
            doctor.id === editTarget.id
              ? updatedDoctor
              : doctor
          )
        );
      } else {
        const response =
          await createAdminDoctor(payload);

        const responseDoctor =
          extractDoctor(response);

        const createdDoctor = normalizeDoctor({
          ...payload,
          ...(responseDoctor &&
          typeof responseDoctor === "object"
            ? responseDoctor
            : {}),
          id:
            responseDoctor?.id ??
            responseDoctor?._id ??
            Date.now(),
        });

        setDoctors((currentDoctors) => [
          createdDoctor,
          ...currentDoctors,
        ]);
      }

      setModalOpen(false);
      setEditTarget(null);
    } catch (error) {
      setModalError(
        getErrorMessage(
          error,
          editTarget
            ? "Unable to update the doctor."
            : "Unable to create the doctor."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = async (doctor) => {
    if (
      availabilityUpdatingId !== null ||
      doctor.id === undefined
    ) {
      return;
    }

    const nextAvailability = !doctor.available;

    setAvailabilityUpdatingId(doctor.id);
    setPageError("");

    try {
      await updateAdminDoctorAvailability(
        doctor.id,
        nextAvailability
      );

      setDoctors((currentDoctors) =>
        currentDoctors.map((currentDoctor) =>
          currentDoctor.id === doctor.id
            ? {
                ...currentDoctor,
                available: nextAvailability,
              }
            : currentDoctor
        )
      );
    } catch (error) {
      setPageError(
        getErrorMessage(
          error,
          "Unable to update doctor availability."
        )
      );
    } finally {
      setAvailabilityUpdatingId(null);
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
      await deleteAdminDoctor(deleteTarget.id);

      setDoctors((currentDoctors) =>
        currentDoctors.filter(
          (doctor) =>
            doctor.id !== deleteTarget.id
        )
      );

      setDeleteTarget(null);
    } catch (error) {
      setPageError(
        getErrorMessage(
          error,
          "Unable to remove the doctor."
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
              Doctor Management
            </h1>

            <p className="mt-1 text-sm text-[#6B7280]">
              Add, edit, and manage specialists on
              the platform.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#2E7D32] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1B5E20]"
          >
            <Plus className="h-4 w-4" />
            Add Doctor
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
              className="shrink-0 rounded p-1 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />

            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search doctors by name..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20"
            />
          </div>

          <div className="relative sm:w-56">
            <select
              value={specialty}
              onChange={(event) =>
                setSpecialty(event.target.value)
              }
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-4 pr-9 text-sm outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20"
            >
              {specialties.map(
                (specialtyOption) => (
                  <option
                    key={specialtyOption}
                    value={specialtyOption}
                  >
                    {specialtyOption}
                  </option>
                )
              )}
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
          </div>

          <div className="relative sm:w-52">
            <select
              value={currency}
              onChange={(event) =>
                setCurrency(event.target.value)
              }
              aria-label="Display currency"
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-4 pr-9 text-sm outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20"
            >
              {Object.entries(CURRENCIES).map(
                ([code, currencyData]) => (
                  <option
                    key={code}
                    value={code}
                  >
                    {currencyData.label}
                  </option>
                )
              )}
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
          </div>

          <button
            type="button"
            onClick={loadDoctors}
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
                Loading doctors...
              </p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F5F5]">
                <Stethoscope className="h-6 w-6 text-[#6B7280]" />
              </div>

              <h3 className="font-['Poppins'] text-base font-semibold text-[#1A1A2E]">
                No doctors found
              </h3>

              <p className="mt-1 max-w-xs text-sm text-[#6B7280]">
                Try a different search term or
                specialty filter, or add a new doctor.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-[#6B7280]">
                    <th className="py-3 font-medium">
                      Doctor
                    </th>

                    <th className="py-3 font-medium">
                      Specialty
                    </th>

                    <th className="py-3 font-medium">
                      Experience
                    </th>

                    <th className="py-3 font-medium">
                      Fee ({currency})
                    </th>

                    <th className="py-3 font-medium">
                      Availability
                    </th>

                    <th className="py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDoctors.map((doctor) => {
                    const updatingAvailability =
                      availabilityUpdatingId ===
                      doctor.id;

                    return (
                      <tr
                        key={doctor.id}
                        className="border-b border-gray-50 last:border-0 hover:bg-[#F5F5F5]/60"
                      >
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1565C0]/10 text-xs font-semibold text-[#1565C0]">
                              {doctor.photo}
                            </span>

                            <span className="font-medium text-[#1A1A2E]">
                              {doctor.name}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 text-[#6B7280]">
                          {doctor.specialty}
                        </td>

                        <td className="py-3 text-[#6B7280]">
                          {doctor.experience} yrs
                        </td>

                        <td className="py-3 text-[#6B7280]">
                          {formatFee(
                            doctor.fee,
                            currency
                          )}
                        </td>

                        <td className="py-3">
                          <button
                            type="button"
                            onClick={() =>
                              toggleAvailability(
                                doctor
                              )
                            }
                            disabled={
                              updatingAvailability
                            }
                            className={`relative h-6 w-11 rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${
                              doctor.available
                                ? "bg-[#2E7D32]"
                                : "bg-gray-300"
                            }`}
                            aria-label={`Set ${
                              doctor.name
                            } ${
                              doctor.available
                                ? "unavailable"
                                : "available"
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white transition ${
                                doctor.available
                                  ? "left-5"
                                  : "left-0.5"
                              }`}
                            >
                              {updatingAvailability && (
                                <LoaderCircle className="h-3 w-3 animate-spin text-[#2E7D32]" />
                              )}
                            </span>
                          </button>
                        </td>

                        <td className="py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(doctor)
                              }
                              className="rounded-lg p-2 text-[#1565C0] hover:bg-[#1565C0]/10"
                              aria-label={`Edit ${doctor.name}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget(
                                  doctor
                                )
                              }
                              className="rounded-lg p-2 text-[#DC2626] hover:bg-red-50"
                              aria-label={`Delete ${doctor.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <DoctorModal
        open={modalOpen}
        doctor={editTarget}
        saving={saving}
        error={modalError}
        onClose={closeDoctorModal}
        onSave={handleSaveDoctor}
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <Trash2 className="h-5 w-5 text-[#DC2626]" />
            </div>

            <h3 className="font-['Poppins'] text-base font-semibold text-[#1A1A2E]">
              Remove {deleteTarget.name}?
            </h3>

            <p className="mt-1 text-sm text-[#6B7280]">
              This doctor will be removed from the
              platform and can no longer receive
              bookings.
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(null)
                }
                disabled={deleting}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-[#1A1A2E] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#DC2626] py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting && (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                )}

                {deleting
                  ? "Removing..."
                  : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}