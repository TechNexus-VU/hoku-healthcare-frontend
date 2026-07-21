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
  CheckCircle2,
  ChevronDown,
  Eye,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Stethoscope,
  Trash2,
  Users,
  X,
  XCircle,
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

const DEFAULT_SPECIALTIES = [
  "Cardiologist",
  "Gynecologist",
  "Child Specialist",
  "Dermatologist",
  "Dental Specialist",
  "General Physician",
];

const AVAILABILITY_OPTIONS = [
  {
    value: "all",
    label: "All Availability",
  },
  {
    value: "available",
    label: "Available",
  },
  {
    value: "unavailable",
    label: "Unavailable",
  },
];

const EMPTY_FORM = {
  name: "",
  specialty: "",
  experience: "",
  fee: "",
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

  return [
    "true",
    "1",
    "yes",
    "active",
    "available",
    "enabled",
  ].includes(normalizedValue);
}

function sameId(firstId, secondId) {
  return String(firstId) ===
    String(secondId);
}

function getInitials(name = "") {
  const words = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "DR";
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

function formatFee(feeInPkr, currency) {
  const selectedCurrency =
    CURRENCIES[currency] ||
    CURRENCIES.PKR;

  const fee = Number(feeInPkr) || 0;

  const convertedFee =
    fee * selectedCurrency.rate;

  const formattedFee =
    currency === "PKR"
      ? Math.round(
          convertedFee
        ).toLocaleString("en-PK")
      : convertedFee.toLocaleString(
          "en-US",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        );

  return `${selectedCurrency.symbol} ${formattedFee}`;
}

function normalizeDoctor(doctor = {}) {
  const name =
    doctor.name ||
    doctor.full_name ||
    doctor.fullName ||
    "Unnamed Doctor";

  const experienceValue = Number(
    doctor.experience ??
      doctor.experience_years ??
      doctor.years_of_experience ??
      doctor.yearsOfExperience ??
      0
  );

  const feeValue = Number(
    doctor.fee ??
      doctor.consultation_fee ??
      doctor.consultationFee ??
      0
  );

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

    experience: Number.isFinite(
      experienceValue
    )
      ? Math.max(0, experienceValue)
      : 0,

    fee: Number.isFinite(feeValue)
      ? Math.max(0, feeValue)
      : 0,

    available: toBoolean(
      doctor.available ??
        doctor.is_available ??
        doctor.isAvailable ??
        doctor.status
    ),

    avatar:
      doctor.avatar_url ||
      doctor.avatarUrl ||
      doctor.avatar ||
      doctor.profile_image ||
      doctor.profileImage ||
      doctor.photo_url ||
      "",

    email: doctor.email || "",

    phone:
      doctor.phone ||
      doctor.phone_number ||
      "",

    qualification:
      doctor.qualification ||
      doctor.qualifications ||
      "",

    hospital:
      doctor.hospital ||
      doctor.clinic_name ||
      doctor.clinicName ||
      "",
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

export default function DoctorManagement() {
  const [doctors, setDoctors] =
    useState([]);

  const [query, setQuery] =
    useState("");

  const [
    selectedSpecialty,
    setSelectedSpecialty,
  ] = useState("All Specialties");

  const [
    availabilityFilter,
    setAvailabilityFilter,
  ] = useState("all");

  const [currency, setCurrency] =
    useState("PKR");

  const [loading, setLoading] =
    useState(true);

  const [pageError, setPageError] =
    useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editTarget, setEditTarget] =
    useState(null);

  const [viewTarget, setViewTarget] =
    useState(null);

  const [saving, setSaving] =
    useState(false);

  const [modalError, setModalError] =
    useState("");

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState(null);

  const [deleting, setDeleting] =
    useState(false);

  const [
    availabilityUpdatingId,
    setAvailabilityUpdatingId,
  ] = useState(null);

  const loadDoctors =
    useCallback(async () => {
      setLoading(true);
      setPageError("");

      try {
        const response =
          await getAdminDoctors({
            page: 1,
            limit: 100,
          });

        const extractedDoctors =
          extractDoctors(response);

        const doctorList = Array.isArray(
          extractedDoctors
        )
          ? extractedDoctors
          : [];

        setDoctors(
          doctorList.map(normalizeDoctor)
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

  const specialtyOptions =
    useMemo(() => {
      const availableSpecialties =
        doctors
          .map(
            (doctor) =>
              doctor.specialty
          )
          .filter(Boolean);

      return [
        "All Specialties",
        ...new Set([
          ...DEFAULT_SPECIALTIES,
          ...availableSpecialties,
        ]),
      ];
    }, [doctors]);

  const doctorSummary = useMemo(() => {
    const availableDoctors =
      doctors.filter(
        (doctor) => doctor.available
      ).length;

    return {
      total: doctors.length,
      available: availableDoctors,
      unavailable:
        doctors.length -
        availableDoctors,
    };
  }, [doctors]);

  const filteredDoctors =
    useMemo(() => {
      const normalizedQuery = query
        .trim()
        .toLowerCase();

      return doctors.filter(
        (doctor) => {
          const searchableContent = [
            doctor.name,
            doctor.specialty,
            doctor.email,
            doctor.phone,
            doctor.qualification,
            doctor.hospital,
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

          const matchesSpecialty =
            selectedSpecialty ===
              "All Specialties" ||
            doctor.specialty ===
              selectedSpecialty;

          const matchesAvailability =
            availabilityFilter === "all" ||
            (availabilityFilter ===
              "available" &&
              doctor.available) ||
            (availabilityFilter ===
              "unavailable" &&
              !doctor.available);

          return (
            matchesQuery &&
            matchesSpecialty &&
            matchesAvailability
          );
        }
      );
    }, [
      availabilityFilter,
      doctors,
      query,
      selectedSpecialty,
    ]);

  const hasActiveFilters =
    Boolean(query.trim()) ||
    selectedSpecialty !==
      "All Specialties" ||
    availabilityFilter !== "all";

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

  const closeDoctorModal =
    useCallback(() => {
      if (saving) {
        return;
      }

      setModalOpen(false);
      setEditTarget(null);
      setModalError("");
    }, [saving]);

  const clearFilters = () => {
    setQuery("");
    setSelectedSpecialty(
      "All Specialties"
    );
    setAvailabilityFilter("all");
  };

  const handleSaveDoctor = async (
    payload
  ) => {
    setSaving(true);
    setModalError("");

    try {
      if (
        editTarget?.id !==
        undefined
      ) {
        const response =
          await updateAdminDoctor(
            editTarget.id,
            payload
          );

        const extractedDoctor =
          extractDoctor(response);

        const responseDoctor =
          extractedDoctor &&
          typeof extractedDoctor ===
            "object"
            ? extractedDoctor
            : {};

        const updatedDoctor =
          normalizeDoctor({
            ...editTarget,
            ...payload,
            ...responseDoctor,

            id:
              responseDoctor.id ??
              responseDoctor._id ??
              editTarget.id,
          });

        setDoctors(
          (currentDoctors) =>
            currentDoctors.map(
              (doctor) =>
                sameId(
                  doctor.id,
                  editTarget.id
                )
                  ? updatedDoctor
                  : doctor
            )
        );

        toast.success(
          "Doctor updated successfully."
        );
      } else {
        const response =
          await createAdminDoctor(
            payload
          );

        const extractedDoctor =
          extractDoctor(response);

        const responseDoctor =
          extractedDoctor &&
          typeof extractedDoctor ===
            "object"
            ? extractedDoctor
            : {};

        const createdDoctor =
          normalizeDoctor({
            ...payload,
            ...responseDoctor,

            id:
              responseDoctor.id ??
              responseDoctor._id ??
              `local-${Date.now()}`,
          });

        setDoctors(
          (currentDoctors) => [
            createdDoctor,
            ...currentDoctors,
          ]
        );

        toast.success(
          "Doctor added successfully."
        );
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

  const toggleAvailability =
    async (doctor) => {
      if (
        availabilityUpdatingId !==
          null ||
        doctor.id === undefined
      ) {
        return;
      }

      const nextAvailability =
        !doctor.available;

      setAvailabilityUpdatingId(
        doctor.id
      );

      setPageError("");

      try {
        await updateAdminDoctorAvailability(
          doctor.id,
          nextAvailability
        );

        setDoctors(
          (currentDoctors) =>
            currentDoctors.map(
              (currentDoctor) =>
                sameId(
                  currentDoctor.id,
                  doctor.id
                )
                  ? {
                      ...currentDoctor,
                      available:
                        nextAvailability,
                    }
                  : currentDoctor
            )
        );

        toast.success(
          `${doctor.name} is now ${
            nextAvailability
              ? "available"
              : "unavailable"
          }.`
        );
      } catch (error) {
        const message = getErrorMessage(
          error,
          "Unable to update doctor availability."
        );

        setPageError(message);
        toast.error(message);
      } finally {
        setAvailabilityUpdatingId(
          null
        );
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
      await deleteAdminDoctor(
        deleteTarget.id
      );

      setDoctors(
        (currentDoctors) =>
          currentDoctors.filter(
            (doctor) =>
              !sameId(
                doctor.id,
                deleteTarget.id
              )
          )
      );

      toast.success(
        "Doctor removed successfully."
      );

      setDeleteTarget(null);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to remove the doctor."
      );

      setPageError(message);
      toast.error(message);
    } finally {
      setDeleting(false);
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
              Doctor Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--body)] sm:text-base">
              Add, review, edit, and
              manage specialists and their
              booking availability.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--white)] shadow-[var(--shadow-button)] transition-all duration-300 hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-light)] sm:w-auto"
          >
            <Plus size={18} />
            Add Doctor
          </button>
        </div>
      </section>

      {/* Summary */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={Users}
          label="Total Doctors"
          value={doctorSummary.total}
          description="Registered specialists"
          variant="primary"
        />

        <SummaryCard
          icon={CheckCircle2}
          label="Available"
          value={doctorSummary.available}
          description="Accepting appointments"
          variant="success"
        />

        <SummaryCard
          icon={XCircle}
          label="Unavailable"
          value={doctorSummary.unavailable}
          description="Not accepting bookings"
          variant="warning"
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
        <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_220px_190px_190px_auto]">
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
              placeholder="Search doctors..."
              className="min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--section)] py-2.5 pl-10 pr-4 text-sm text-[var(--heading)] outline-none transition-all duration-300 placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:bg-[var(--card)] focus:ring-4 focus:ring-[var(--primary-light)]"
            />
          </div>

          <SelectField
            value={selectedSpecialty}
            onChange={
              setSelectedSpecialty
            }
            ariaLabel="Filter by specialty"
            options={specialtyOptions.map(
              (item) => ({
                value: item,
                label: item,
              })
            )}
          />

          <SelectField
            value={availabilityFilter}
            onChange={
              setAvailabilityFilter
            }
            ariaLabel="Filter by availability"
            options={
              AVAILABILITY_OPTIONS
            }
          />

          <SelectField
            value={currency}
            onChange={setCurrency}
            ariaLabel="Display currency"
            options={Object.entries(
              CURRENCIES
            ).map(
              ([code, data]) => ({
                value: code,
                label: data.label,
              })
            )}
          />

          <button
            type="button"
            onClick={loadDoctors}
            disabled={loading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-semibold text-[var(--heading)] transition-all duration-300 hover:border-[var(--primary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-light)] disabled:cursor-not-allowed disabled:opacity-60"
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

        <div className="mt-3 flex flex-col gap-2 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing{" "}
            <span className="font-semibold text-[var(--heading)]">
              {filteredDoctors.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[var(--heading)]">
              {doctors.length}
            </span>{" "}
            doctors
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

      {/* Doctor list */}
      <section className="min-w-0 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-soft)]">
        {loading ? (
          <DoctorLoading />
        ) : filteredDoctors.length ===
          0 ? (
          <EmptyDoctors
            hasFilters={hasActiveFilters}
            onClear={clearFilters}
            onAdd={openAddModal}
          />
        ) : (
          <>
            {/* Mobile and tablet cards */}
            <div className="grid gap-4 p-4 lg:hidden">
              {filteredDoctors.map(
                (doctor, index) => (
                  <DoctorMobileCard
                    key={
                      doctor.id ??
                      `${doctor.name}-${index}`
                    }
                    doctor={doctor}
                    currency={currency}
                    updating={
                      availabilityUpdatingId !==
                        null &&
                      sameId(
                        availabilityUpdatingId,
                        doctor.id
                      )
                    }
                    onView={() =>
                      setViewTarget(doctor)
                    }
                    onEdit={() =>
                      openEditModal(doctor)
                    }
                    onDelete={() =>
                      setDeleteTarget(
                        doctor
                      )
                    }
                    onToggle={() =>
                      toggleAvailability(
                        doctor
                      )
                    }
                  />
                )
              )}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--section)]">
                    <TableHeading>
                      Doctor
                    </TableHeading>

                    <TableHeading>
                      Specialty
                    </TableHeading>

                    <TableHeading>
                      Experience
                    </TableHeading>

                    <TableHeading>
                      Fee ({currency})
                    </TableHeading>

                    <TableHeading>
                      Availability
                    </TableHeading>

                    <TableHeading align="right">
                      Actions
                    </TableHeading>
                  </tr>
                </thead>

                <tbody>
                  {filteredDoctors.map(
                    (doctor, index) => {
                      const updating =
                        availabilityUpdatingId !==
                          null &&
                        sameId(
                          availabilityUpdatingId,
                          doctor.id
                        );

                      return (
                        <tr
                          key={
                            doctor.id ??
                            `${doctor.name}-${index}`
                          }
                          className="border-b border-[var(--border)] transition-colors duration-300 last:border-0 hover:bg-[var(--dashboard-hover)]"
                        >
                          <TableCell>
                            <div className="flex min-w-0 items-center gap-3">
                              <DoctorAvatar
                                doctor={doctor}
                              />

                              <div className="min-w-0">
                                <p className="truncate font-semibold text-[var(--heading)]">
                                  {doctor.name}
                                </p>

                                {doctor.email && (
                                  <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
                                    {doctor.email}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            {doctor.specialty}
                          </TableCell>

                          <TableCell>
                            {doctor.experience}{" "}
                            {doctor.experience ===
                            1
                              ? "year"
                              : "years"}
                          </TableCell>

                          <TableCell>
                            <span className="font-semibold text-[var(--heading)]">
                              {formatFee(
                                doctor.fee,
                                currency
                              )}
                            </span>
                          </TableCell>

                          <TableCell>
                            <AvailabilitySwitch
                              doctor={doctor}
                              updating={
                                updating
                              }
                              onToggle={() =>
                                toggleAvailability(
                                  doctor
                                )
                              }
                            />
                          </TableCell>

                          <TableCell align="right">
                            <div className="flex justify-end gap-1">
                              <ActionButton
                                label={`View ${doctor.name}`}
                                icon={Eye}
                                onClick={() =>
                                  setViewTarget(
                                    doctor
                                  )
                                }
                              />

                              <ActionButton
                                label={`Edit ${doctor.name}`}
                                icon={Pencil}
                                onClick={() =>
                                  openEditModal(
                                    doctor
                                  )
                                }
                              />

                              <ActionButton
                                label={`Delete ${doctor.name}`}
                                icon={Trash2}
                                danger
                                onClick={() =>
                                  setDeleteTarget(
                                    doctor
                                  )
                                }
                              />
                            </div>
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

      <DoctorFormModal
        open={modalOpen}
        doctor={editTarget}
        specialties={
          specialtyOptions.filter(
            (item) =>
              item !==
              "All Specialties"
          )
        }
        saving={saving}
        error={modalError}
        onClose={closeDoctorModal}
        onSave={handleSaveDoctor}
      />

      <DoctorDetailsModal
        doctor={viewTarget}
        currency={currency}
        onClose={() =>
          setViewTarget(null)
        }
        onEdit={() => {
          const doctor = viewTarget;

          setViewTarget(null);

          if (doctor) {
            openEditModal(doctor);
          }
        }}
      />

      <DeleteDoctorModal
        doctor={deleteTarget}
        deleting={deleting}
        onClose={() => {
          if (!deleting) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={confirmDelete}
      />
    </motion.div>
  );
}

function DoctorMobileCard({
  doctor,
  currency,
  updating,
  onView,
  onEdit,
  onDelete,
  onToggle,
}) {
  return (
    <article className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="flex items-start gap-3">
        <DoctorAvatar
          doctor={doctor}
          sizeClass="h-12 w-12"
        />

        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-base font-bold text-[var(--heading)]">
            {doctor.name}
          </p>

          <p className="mt-1 truncate text-sm text-[var(--body)]">
            {doctor.specialty}
          </p>
        </div>

        <AvailabilityBadge
          available={doctor.available}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MobileDetail
          label="Experience"
          value={`${doctor.experience} ${
            doctor.experience === 1
              ? "year"
              : "years"
          }`}
        />

        <MobileDetail
          label={`Fee (${currency})`}
          value={formatFee(
            doctor.fee,
            currency
          )}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-[var(--radius-md)] bg-[var(--section)] px-3 py-3">
        <div>
          <p className="text-xs font-semibold text-[var(--heading)]">
            Booking availability
          </p>

          <p className="mt-0.5 text-[11px] text-[var(--muted)]">
            {doctor.available
              ? "Accepting appointments"
              : "Bookings are paused"}
          </p>
        </div>

        <AvailabilitySwitch
          doctor={doctor}
          updating={updating}
          onToggle={onToggle}
          compact
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <MobileActionButton
          icon={Eye}
          label="View"
          onClick={onView}
        />

        <MobileActionButton
          icon={Pencil}
          label="Edit"
          onClick={onEdit}
        />

        <MobileActionButton
          icon={Trash2}
          label="Remove"
          onClick={onDelete}
          danger
        />
      </div>
    </article>
  );
}

function DoctorFormModal({
  open,
  doctor,
  specialties,
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

  const isEditing = Boolean(doctor);

  useModalBehaviour(
    open,
    onClose,
    saving
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setValidationError("");

    if (doctor) {
      setForm({
        name: doctor.name || "",
        specialty:
          doctor.specialty || "",
        experience: String(
          doctor.experience ?? ""
        ),
        fee: String(
          doctor.fee ?? ""
        ),
      });

      return;
    }

    setForm(EMPTY_FORM);
  }, [doctor, open]);

  if (!open) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    if (validationError) {
      setValidationError("");
    }
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const name = form.name.trim();

    const specialty =
      form.specialty.trim();

    const experience = Number(
      form.experience || 0
    );

    const fee = Number(
      form.fee || 0
    );

    if (!name) {
      setValidationError(
        "Enter the doctor's full name."
      );

      return;
    }

    if (!specialty) {
      setValidationError(
        "Enter or select a medical specialty."
      );

      return;
    }

    if (
      !Number.isFinite(experience) ||
      experience < 0
    ) {
      setValidationError(
        "Experience must be zero or a positive number."
      );

      return;
    }

    if (
      !Number.isFinite(fee) ||
      fee < 0
    ) {
      setValidationError(
        "Consultation fee must be zero or a positive number."
      );

      return;
    }

    await onSave({
      name,
      specialty,
      experience,
      fee,
      available:
        doctor?.available ?? true,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-[2px]"
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
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="doctor-form-title"
        className="w-full max-w-lg overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-card)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] bg-[var(--section)] px-5 py-5 sm:px-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--primary)]">
              Doctor Management
            </p>

            <h2
              id="doctor-form-title"
              className="mt-1 font-heading text-xl font-bold text-[var(--heading)]"
            >
              {isEditing
                ? "Edit Doctor"
                : "Add New Doctor"}
            </h2>

            <p className="mt-1 text-sm text-[var(--body)]">
              {isEditing
                ? "Update the specialist's professional information."
                : "Create a new specialist profile."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close doctor form"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[var(--body)] transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-6"
        >
          {(error ||
            validationError) && (
            <div className="mb-5 flex items-start gap-3 rounded-[var(--radius-md)] border border-red-200 bg-[var(--danger-light)] p-3.5 text-sm text-[var(--danger)]">
              <AlertCircle
                size={17}
                className="mt-0.5 shrink-0"
              />

              <p className="leading-6">
                {validationError || error}
              </p>
            </div>
          )}

          <div className="space-y-5">
            <FormField
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Dr. Sarah Thompson"
              disabled={saving}
              required
            />

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[var(--heading)]">
                Medical Specialty
              </span>

              <input
                list="doctor-specialty-options"
                name="specialty"
                value={form.specialty}
                onChange={handleChange}
                placeholder="Select or enter specialty"
                disabled={saving}
                required
                className="min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm text-[var(--heading)] outline-none transition-all duration-300 placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-light)] disabled:cursor-not-allowed disabled:bg-[var(--section)]"
              />

              <datalist id="doctor-specialty-options">
                {specialties.map(
                  (specialty) => (
                    <option
                      key={specialty}
                      value={specialty}
                    />
                  )
                )}
              </datalist>
            </label>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField
                label="Experience (Years)"
                name="experience"
                type="number"
                min="0"
                step="1"
                value={form.experience}
                onChange={handleChange}
                placeholder="5"
                disabled={saving}
              />

              <FormField
                label="Consultation Fee (PKR)"
                name="fee"
                type="number"
                min="0"
                step="1"
                value={form.fee}
                onChange={handleChange}
                placeholder="3000"
                disabled={saving}
              />
            </div>
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] px-5 text-sm font-semibold text-[var(--heading)] transition hover:bg-[var(--section)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--white)] shadow-[var(--shadow-button)] transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {saving && (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              )}

              {saving
                ? "Saving..."
                : isEditing
                  ? "Update Doctor"
                  : "Save Doctor"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function DoctorDetailsModal({
  doctor,
  currency,
  onClose,
  onEdit,
}) {
  useModalBehaviour(
    Boolean(doctor),
    onClose
  );

  if (!doctor) {
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
        aria-labelledby="doctor-details-title"
        className="w-full max-w-lg overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-card)]"
      >
        <div className="relative bg-gradient-to-br from-[var(--primary)] to-[#4f8ee8] px-5 pb-16 pt-6 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close doctor details"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-white/15 text-white transition hover:bg-white/25"
          >
            <X size={19} />
          </button>

          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/75">
            Doctor Profile
          </p>
        </div>

        <div className="-mt-11 px-5 pb-6 sm:px-6">
          <div className="flex items-end gap-4">
            <DoctorAvatar
              doctor={doctor}
              sizeClass="h-24 w-24"
              className="border-4 border-[var(--card)] shadow-[var(--shadow-card)]"
            />

            <div className="min-w-0 pb-1">
              <h2
                id="doctor-details-title"
                className="truncate font-heading text-xl font-bold text-[var(--heading)]"
              >
                {doctor.name}
              </h2>

              <p className="mt-1 truncate text-sm text-[var(--body)]">
                {doctor.specialty}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <AvailabilityBadge
              available={doctor.available}
            />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <DetailItem
              label="Experience"
              value={`${doctor.experience} ${
                doctor.experience === 1
                  ? "year"
                  : "years"
              }`}
            />

            <DetailItem
              label={`Fee (${currency})`}
              value={formatFee(
                doctor.fee,
                currency
              )}
            />

            <DetailItem
              label="Email"
              value={
                doctor.email ||
                "Not provided"
              }
            />

            <DetailItem
              label="Phone"
              value={
                doctor.phone ||
                "Not provided"
              }
            />

            <DetailItem
              label="Qualification"
              value={
                doctor.qualification ||
                "Not provided"
              }
            />

            <DetailItem
              label="Hospital"
              value={
                doctor.hospital ||
                "Not provided"
              }
            />
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] px-5 text-sm font-semibold text-[var(--heading)] transition hover:bg-[var(--section)]"
            >
              Close
            </button>

            <button
              type="button"
              onClick={onEdit}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--white)] shadow-[var(--shadow-button)] transition hover:bg-[var(--primary-hover)]"
            >
              <Pencil size={17} />
              Edit Doctor
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function DeleteDoctorModal({
  doctor,
  deleting,
  onClose,
  onConfirm,
}) {
  useModalBehaviour(
    Boolean(doctor),
    onClose,
    deleting
  );

  if (!doctor) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !deleting
        ) {
          onClose();
        }
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-doctor-title"
        className="w-full max-w-sm rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-5 text-center shadow-[var(--shadow-card)] sm:p-6"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--danger-light)] text-[var(--danger)]">
          <Trash2 size={23} />
        </div>

        <h2
          id="delete-doctor-title"
          className="mt-4 font-heading text-lg font-bold text-[var(--heading)]"
        >
          Remove {doctor.name}?
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--body)]">
          This doctor will be removed from
          the platform and will no longer
          receive new bookings.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] text-sm font-semibold text-[var(--heading)] transition hover:bg-[var(--section)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--danger)] px-4 text-sm font-semibold text-[var(--white)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting && (
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
            )}

            {deleting
              ? "Removing..."
              : "Remove"}
          </button>
        </div>
      </section>
    </div>
  );
}

function DoctorAvatar({
  doctor,
  sizeClass = "h-11 w-11",
  className = "",
}) {
  const [imageError, setImageError] =
    useState(false);

  useEffect(() => {
    setImageError(false);
  }, [doctor.avatar]);

  if (
    doctor.avatar &&
    !imageError
  ) {
    return (
      <img
        src={doctor.avatar}
        alt={doctor.name}
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
      {getInitials(doctor.name)}
    </div>
  );
}

function AvailabilitySwitch({
  doctor,
  updating,
  onToggle,
  compact = false,
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={doctor.available}
        aria-label={`Set ${doctor.name} ${
          doctor.available
            ? "unavailable"
            : "available"
        }`}
        onClick={onToggle}
        disabled={updating}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-[var(--primary-light)] disabled:cursor-not-allowed disabled:opacity-60 ${
          doctor.available
            ? "bg-[var(--primary)]"
            : "bg-[var(--muted)]/50"
        }`}
      >
        <span
          className={`absolute top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--white)] shadow-sm transition-all duration-300 ${
            doctor.available
              ? "left-6"
              : "left-1"
          }`}
        >
          {updating && (
            <LoaderCircle
              size={12}
              className="animate-spin text-[var(--primary)]"
            />
          )}
        </span>
      </button>

      {!compact && (
        <span className="text-xs font-semibold text-[var(--body)]">
          {doctor.available
            ? "Available"
            : "Unavailable"}
        </span>
      )}
    </div>
  );
}

function AvailabilityBadge({
  available,
}) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
        available
          ? "border-green-200 bg-[var(--success-light)] text-[var(--success)]"
          : "border-red-200 bg-[var(--danger-light)] text-[var(--danger)]"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          available
            ? "bg-[var(--success)]"
            : "bg-[var(--danger)]"
        }`}
      />

      {available
        ? "Available"
        : "Unavailable"}
    </span>
  );
}

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
  required,
  min,
  step,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[var(--heading)]">
        {label}
      </span>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        min={min}
        step={step}
        className="min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm text-[var(--heading)] outline-none transition-all duration-300 placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-light)] disabled:cursor-not-allowed disabled:bg-[var(--section)]"
      />
    </label>
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

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
  variant,
}) {
  const variants = {
    primary:
      "bg-[var(--primary-light)] text-[var(--primary)]",

    success:
      "bg-[var(--success-light)] text-[var(--success)]",

    warning:
      "bg-[var(--warning-light)] text-[var(--warning)]",
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

        <div>
          <p className="font-semibold">
            Doctor management error
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
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] transition-all duration-300 ${
        danger
          ? "text-[var(--danger)] hover:bg-[var(--danger-light)]"
          : "text-[var(--body)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
      }`}
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
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-[var(--radius-md)] border text-xs font-semibold transition ${
        danger
          ? "border-red-200 text-[var(--danger)] hover:bg-[var(--danger-light)]"
          : "border-[var(--border)] text-[var(--body)] hover:border-[var(--primary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
      }`}
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

function DetailItem({
  label,
  value,
}) {
  return (
    <div className="min-w-0 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--section)] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-[var(--heading)]">
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

function DoctorLoading() {
  return (
    <div
      role="status"
      className="flex min-h-[360px] flex-col items-center justify-center px-5 text-center"
    >
      <LoaderCircle className="h-8 w-8 animate-spin text-[var(--primary)]" />

      <p className="mt-4 font-heading text-sm font-bold text-[var(--heading)]">
        Loading doctors
      </p>

      <p className="mt-1 text-xs text-[var(--muted)]">
        Preparing specialist records.
      </p>
    </div>
  );
}

function EmptyDoctors({
  hasFilters,
  onClear,
  onAdd,
}) {
  return (
    <div className="px-5 py-14 text-center sm:px-6">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)]">
        <Stethoscope size={24} />
      </div>

      <h3 className="mt-4 font-heading text-base font-bold text-[var(--heading)]">
        No doctors found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--body)]">
        {hasFilters
          ? "No doctors match the current search and filters."
          : "Add your first specialist to begin managing doctors."}
      </p>

      <button
        type="button"
        onClick={
          hasFilters ? onClear : onAdd
        }
        className="mt-5 inline-flex min-h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--white)] transition hover:bg-[var(--primary-hover)]"
      >
        {hasFilters
          ? "Clear filters"
          : "Add Doctor"}
      </button>
    </div>
  );
}