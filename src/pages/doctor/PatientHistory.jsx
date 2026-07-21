import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";
import dayjs from "dayjs";

import {
  FiActivity,
  FiAlertCircle,
  FiCalendar,
  FiFileText,
  FiHeart,
  FiPhone,
  FiRefreshCw,
  FiSearch,
  FiUser,
  FiUsers,
} from "react-icons/fi";

import {
  extractDoctorPatient,
  extractDoctorPatients,
  getDoctorPatient,
  getDoctorPatients,
} from "@/services/doctorPatientsApi";

function getErrorMessage(
  error,
  fallback = "Unable to load patient history."
) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (
    typeof value === "string" &&
    value.trim()
  ) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) {
    return null;
  }

  const birthDate = dayjs(dateOfBirth);

  if (!birthDate.isValid()) {
    return null;
  }

  const age = dayjs().diff(
    birthDate,
    "year"
  );

  return age >= 0 ? age : null;
}

function formatDate(value) {
  if (!value) {
    return "Date unavailable";
  }

  const possibleValue =
    typeof value === "object"
      ? value.date ||
        value.visit_date ||
        value.appointment_date ||
        value.created_at
      : value;

  const date = dayjs(possibleValue);

  return date.isValid()
    ? date.format("DD MMM YYYY")
    : String(possibleValue || "Date unavailable");
}

function getRecordLabel(item) {
  if (
    typeof item === "string" ||
    typeof item === "number"
  ) {
    return String(item);
  }

  if (
    item &&
    typeof item === "object"
  ) {
    return (
      item.name ||
      item.title ||
      item.label ||
      item.medicine ||
      item.medication ||
      item.test_name ||
      item.report_name ||
      item.description ||
      item.notes ||
      item.date ||
      "Record available"
    );
  }

  return "Record available";
}

function normalizePatient(patient = {}) {
  return {
    ...patient,

    id:
      patient.id ??
      patient._id ??
      patient.patient_id,

    name:
      patient.full_name ||
      patient.fullName ||
      patient.name ||
      "Unknown Patient",

    age:
      Number(
        patient.age ??
          patient.patient_age
      ) ||
      calculateAge(
        patient.date_of_birth ||
          patient.dateOfBirth ||
          patient.dob
      ) ||
      null,

    gender:
      patient.gender ||
      "Not specified",

    phone:
      patient.phone ||
      patient.phone_number ||
      "Not provided",

    bloodGroup:
      patient.blood_group ||
      patient.bloodGroup ||
      "N/A",

    history:
      patient.medical_history ||
      patient.medicalHistory ||
      patient.history ||
      patient.condition ||
      patient.diagnosis ||
      "No medical history recorded",

    previousVisits: normalizeList(
      patient.previous_visits ||
        patient.previousVisits ||
        patient.visits
    ),

    prescriptions: normalizeList(
      patient.prescriptions ||
        patient.medications
    ),

    labReports: normalizeList(
      patient.lab_reports ||
        patient.labReports ||
        patient.reports
    ),

    allergies: normalizeList(
      patient.allergies
    ),

    notes:
      patient.doctor_notes ||
      patient.doctorNotes ||
      patient.notes ||
      "",

    avatar:
      patient.avatar_url ||
      patient.avatar ||
      patient.profile_image ||
      patient.profileImage ||
      "",
  };
}

function getPatientInitials(name) {
  const words = String(name || "Patient")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "P";
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

export default function PatientHistory() {
  const [patients, setPatients] =
    useState([]);

  const [query, setQuery] =
    useState("");

  const [
    selectedPatientId,
    setSelectedPatientId,
  ] = useState(null);

  const [
    selectedPatientDetails,
    setSelectedPatientDetails,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [
    detailsLoading,
    setDetailsLoading,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [detailsError, setDetailsError] =
    useState("");

  const loadPatients =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await getDoctorPatients({
            page: 1,
            limit: 100,
          });

        const extractedPatients =
          extractDoctorPatients(
            response
          );

        const patientList =
          Array.isArray(extractedPatients)
            ? extractedPatients.map(
                normalizePatient
              )
            : [];

        setPatients(patientList);

        setSelectedPatientId(
          (currentId) => {
            const currentExists =
              patientList.some(
                (patient) =>
                  patient.id === currentId
              );

            return currentExists
              ? currentId
              : patientList[0]?.id ??
                  null;
          }
        );
      } catch (requestError) {
        setPatients([]);
        setSelectedPatientId(null);
        setSelectedPatientDetails(null);

        setError(
          getErrorMessage(requestError)
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  useEffect(() => {
    if (!selectedPatientId) {
      setSelectedPatientDetails(null);
      setDetailsError("");
      return;
    }

    let active = true;

    const loadPatientDetails =
      async () => {
        setDetailsLoading(true);
        setDetailsError("");
        setSelectedPatientDetails(null);

        try {
          const response =
            await getDoctorPatient(
              selectedPatientId
            );

          const extractedPatient =
            extractDoctorPatient(
              response
            );

          if (
            active &&
            extractedPatient
          ) {
            const summaryPatient =
              patients.find(
                (patient) =>
                  patient.id ===
                  selectedPatientId
              ) || {};

            setSelectedPatientDetails(
              normalizePatient({
                ...summaryPatient,
                ...extractedPatient,
              })
            );
          }
        } catch (requestError) {
          if (active) {
            setDetailsError(
              getErrorMessage(
                requestError,
                "Unable to load full patient details."
              )
            );
          }
        } finally {
          if (active) {
            setDetailsLoading(false);
          }
        }
      };

    loadPatientDetails();

    return () => {
      active = false;
    };
  }, [patients, selectedPatientId]);

  const filteredPatients =
    useMemo(() => {
      const normalizedQuery = query
        .trim()
        .toLowerCase();

      if (!normalizedQuery) {
        return patients;
      }

      return patients.filter(
        (patient) => {
          const searchableContent = [
            patient.name,
            patient.phone,
            patient.history,
            patient.gender,
            patient.bloodGroup,
          ]
            .map((value) =>
              String(value || "").toLowerCase()
            )
            .join(" ");

          return searchableContent.includes(
            normalizedQuery
          );
        }
      );
    }, [patients, query]);

  const selectedPatient =
    selectedPatientDetails ||
    patients.find(
      (patient) =>
        patient.id ===
        selectedPatientId
    ) ||
    null;

  const handleSearchChange = (
    event
  ) => {
    const value = event.target.value;

    setQuery(value);

    const normalizedValue = value
      .trim()
      .toLowerCase();

    if (!normalizedValue) {
      return;
    }

    const firstMatchingPatient =
      patients.find((patient) => {
        const searchableContent = [
          patient.name,
          patient.phone,
          patient.history,
          patient.gender,
          patient.bloodGroup,
        ]
          .map((item) =>
            String(item || "").toLowerCase()
          )
          .join(" ");

        return searchableContent.includes(
          normalizedValue
        );
      });

    if (firstMatchingPatient) {
      setSelectedPatientId(
        firstMatchingPatient.id
      );
    }
  };

  const selectPatient = (patientId) => {
    setSelectedPatientId(patientId);

    window.requestAnimationFrame(() => {
      document
        .getElementById(
          "patient-details"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    });
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
      {/* Page header */}
      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary)] sm:text-sm">
              Doctor Portal
            </p>

            <h1 className="mt-1 font-heading text-2xl font-bold text-[var(--heading)] sm:text-3xl">
              Patient History
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--body)] sm:text-base">
              Review medical records,
              prescriptions, lab reports,
              allergies, and previous
              consultations.
            </p>
          </div>

          <button
            type="button"
            onClick={loadPatients}
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

      {/* Search */}
      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-soft)] sm:p-5">
        <label className="flex min-h-11 w-full items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--section)] px-4 transition-all duration-300 focus-within:border-[var(--primary)] focus-within:bg-[var(--card)] focus-within:ring-4 focus-within:ring-[var(--primary-light)]">
          <FiSearch
            size={17}
            className="shrink-0 text-[var(--primary)]"
          />

          <input
            type="search"
            value={query}
            onChange={handleSearchChange}
            placeholder="Search by name, phone, condition, gender or blood group"
            className="w-full bg-transparent py-3 text-sm text-[var(--heading)] outline-none placeholder:text-[var(--muted)]"
          />
        </label>

        <p className="mt-3 text-xs text-[var(--muted)]">
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
      </section>

      {error && (
        <ErrorMessage
          title="Patient history unavailable"
          message={error}
        />
      )}

      {loading ? (
        <PatientHistoryLoading />
      ) : filteredPatients.length === 0 ? (
        <NoPatients
          hasQuery={Boolean(
            query.trim()
          )}
          onClear={() => setQuery("")}
        />
      ) : (
        <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          {/* Patient selection */}
          <aside className="min-w-0 xl:sticky xl:top-[96px]">
            <section className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-soft)]">
              <div className="border-b border-[var(--border)] px-4 py-4 sm:px-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary-light)] text-[var(--primary)]">
                    <FiUsers size={18} />
                  </div>

                  <div>
                    <h2 className="font-heading font-bold text-[var(--heading)]">
                      Patients
                    </h2>

                    <p className="text-xs text-[var(--muted)]">
                      Select a patient
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex max-h-[460px] gap-3 overflow-x-auto p-4 xl:flex-col xl:overflow-x-hidden xl:overflow-y-auto">
                {filteredPatients.map(
                  (patient) => {
                    const isSelected =
                      selectedPatientId ===
                      patient.id;

                    return (
                      <button
                        key={
                          patient.id ??
                          patient.name
                        }
                        type="button"
                        onClick={() =>
                          selectPatient(
                            patient.id
                          )
                        }
                        className={`flex min-w-[260px] items-center gap-3 rounded-[var(--radius-lg)] border p-3 text-left transition-all duration-300 xl:min-w-0 xl:w-full ${
                          isSelected
                            ? "border-[var(--primary)] bg-[var(--primary-light)] shadow-sm"
                            : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/40 hover:bg-[var(--section)]"
                        }`}
                      >
                        <PatientAvatar
                          patient={patient}
                          sizeClass="h-11 w-11"
                          roundedClass="rounded-[var(--radius-lg)]"
                        />

                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate text-sm font-semibold ${
                              isSelected
                                ? "text-[var(--primary)]"
                                : "text-[var(--heading)]"
                            }`}
                          >
                            {patient.name}
                          </p>

                          <p className="mt-1 truncate text-xs text-[var(--body)]">
                            {patient.history}
                          </p>

                          <p className="mt-1 truncate text-[11px] text-[var(--muted)]">
                            {patient.phone}
                          </p>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </section>
          </aside>

          {/* Patient details */}
          <div
            id="patient-details"
            className="relative min-w-0 scroll-mt-24 space-y-6"
          >
            {detailsLoading && (
              <div className="absolute inset-0 z-20 flex items-start justify-center rounded-[var(--radius-xl)] bg-white/70 pt-16 backdrop-blur-[2px]">
                <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] px-6 py-5 text-center shadow-[var(--shadow-soft)]">
                  <FiRefreshCw className="mx-auto animate-spin text-2xl text-[var(--primary)]" />

                  <p className="mt-3 text-sm font-semibold text-[var(--heading)]">
                    Loading patient details
                  </p>
                </div>
              </div>
            )}

            {detailsError && (
              <ErrorMessage
                title="Some details could not be loaded"
                message={detailsError}
              />
            )}

            {selectedPatient && (
              <>
                {/* Patient profile */}
                <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <PatientAvatar
                        patient={
                          selectedPatient
                        }
                        sizeClass="h-16 w-16 sm:h-20 sm:w-20"
                        roundedClass="rounded-[var(--radius-xl)]"
                      />

                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--primary)]">
                          Patient Profile
                        </p>

                        <h2 className="mt-1 truncate font-heading text-xl font-bold text-[var(--heading)] sm:text-2xl">
                          {selectedPatient.name}
                        </h2>

                        <p className="mt-1 text-sm text-[var(--body)]">
                          {selectedPatient.gender}

                          {selectedPatient.age
                            ? ` • ${selectedPatient.age} years`
                            : ""}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--secondary-light)] px-3 py-1.5 text-xs font-semibold text-[var(--secondary-hover)]">
                      <span className="h-2 w-2 rounded-full bg-[var(--secondary)]" />

                      Patient record active
                    </span>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <ProfileItem
                      icon={FiPhone}
                      label="Phone"
                      value={
                        selectedPatient.phone
                      }
                    />

                    <ProfileItem
                      icon={FiHeart}
                      label="Blood Group"
                      value={
                        selectedPatient
                          .bloodGroup
                      }
                      variant="danger"
                    />

                    <ProfileItem
                      icon={FiCalendar}
                      label="Last Visit"
                      value={
                        selectedPatient
                          .previousVisits
                          .length
                          ? formatDate(
                              selectedPatient
                                .previousVisits[0]
                            )
                          : "No visit recorded"
                      }
                    />

                    <ProfileItem
                      icon={FiActivity}
                      label="Condition"
                      value={
                        selectedPatient.history
                      }
                      variant="secondary"
                    />
                  </div>
                </section>

                {/* Medical history */}
                <InfoSection
                  icon={FiActivity}
                  eyebrow="Clinical Information"
                  title="Medical History"
                >
                  <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[var(--body)]">
                    {selectedPatient.history}
                  </p>
                </InfoSection>

                <div className="grid min-w-0 gap-6 lg:grid-cols-2">
                  {/* Allergies */}
                  <InfoSection
                    icon={FiAlertCircle}
                    eyebrow="Safety Information"
                    title="Allergies"
                  >
                    {selectedPatient
                      .allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedPatient.allergies.map(
                          (
                            allergy,
                            index
                          ) => (
                            <span
                              key={`${getRecordLabel(
                                allergy
                              )}-${index}`}
                              className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700"
                            >
                              {getRecordLabel(
                                allergy
                              )}
                            </span>
                          )
                        )}
                      </div>
                    ) : (
                      <EmptyText>
                        No allergies recorded.
                      </EmptyText>
                    )}
                  </InfoSection>

                  {/* Notes */}
                  <InfoSection
                    icon={FiFileText}
                    eyebrow="Clinical Notes"
                    title="Doctor Notes"
                  >
                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[var(--body)]">
                      {selectedPatient.notes ||
                        "No clinical notes available."}
                    </p>
                  </InfoSection>
                </div>

                {/* Prescriptions and reports */}
                <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--primary)]">
                      Medical Records
                    </p>

                    <h2 className="mt-1 font-heading text-lg font-bold text-[var(--heading)]">
                      Prescriptions &amp; Lab
                      Reports
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-[var(--body)]">
                      Current medication and
                      recent diagnostic records.
                    </p>
                  </div>

                  <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2">
                    <RecordList
                      title="Prescriptions"
                      icon={FiFileText}
                      items={
                        selectedPatient
                          .prescriptions
                      }
                      emptyMessage="No prescriptions available."
                    />

                    <RecordList
                      title="Lab Reports"
                      icon={FiActivity}
                      items={
                        selectedPatient
                          .labReports
                      }
                      emptyMessage="No lab reports available."
                    />
                  </div>
                </section>

                {/* Visit timeline */}
                <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--primary)]">
                      Consultation Records
                    </p>

                    <h2 className="mt-1 font-heading text-lg font-bold text-[var(--heading)]">
                      Visit Timeline
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-[var(--body)]">
                      Previous appointments and
                      consultation history.
                    </p>
                  </div>

                  {selectedPatient
                    .previousVisits.length > 0 ? (
                    <div className="relative mt-6 space-y-4 before:absolute before:bottom-3 before:left-[17px] before:top-3 before:w-0.5 before:bg-[var(--primary-light)]">
                      {selectedPatient.previousVisits.map(
                        (
                          visit,
                          index
                        ) => (
                          <motion.article
                            key={`${formatDate(
                              visit
                            )}-${index}`}
                            initial={{
                              opacity: 0,
                              x: 10,
                            }}
                            animate={{
                              opacity: 1,
                              x: 0,
                            }}
                            transition={{
                              duration: 0.25,
                              delay:
                                index * 0.05,
                            }}
                            className="relative flex items-start gap-4"
                          >
                            <span className="relative z-10 mt-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-4 border-[var(--card)] bg-[var(--primary)] text-white shadow-sm">
                              <FiCalendar
                                size={13}
                              />
                            </span>

                            <div className="min-w-0 flex-1 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--section)] p-4">
                              <p className="font-heading text-sm font-bold text-[var(--heading)]">
                                Consultation{" "}
                                {index + 1}
                              </p>

                              <p className="mt-1 text-sm text-[var(--body)]">
                                Recorded on{" "}
                                {formatDate(
                                  visit
                                )}
                              </p>

                              {typeof visit ===
                                "object" &&
                                (visit.notes ||
                                  visit.reason ||
                                  visit.description) && (
                                  <p className="mt-2 break-words text-sm leading-6 text-[var(--body)]">
                                    {visit.notes ||
                                      visit.reason ||
                                      visit.description}
                                  </p>
                                )}
                            </div>
                          </motion.article>
                        )
                      )}
                    </div>
                  ) : (
                    <VisitEmptyState />
                  )}
                </section>
              </>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function PatientAvatar({
  patient,
  sizeClass,
  roundedClass = "rounded-full",
}) {
  const [imageError, setImageError] =
    useState(false);

  const showImage =
    patient.avatar && !imageError;

  if (showImage) {
    return (
      <img
        src={patient.avatar}
        alt={patient.name}
        loading="lazy"
        onError={() =>
          setImageError(true)
        }
        className={`${sizeClass} ${roundedClass} shrink-0 border border-[var(--border)] object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} ${roundedClass} flex shrink-0 items-center justify-center bg-[var(--primary-light)] font-heading text-sm font-bold text-[var(--primary)]`}
      aria-hidden="true"
    >
      {getPatientInitials(
        patient.name
      )}
    </div>
  );
}

function ProfileItem({
  icon: Icon,
  label,
  value,
  variant = "primary",
}) {
  const variants = {
    primary:
      "bg-[var(--primary-light)] text-[var(--primary)]",

    secondary:
      "bg-[var(--secondary-light)] text-[var(--secondary-hover)]",

    danger:
      "bg-red-50 text-[var(--danger)]",
  };

  return (
    <article className="flex min-w-0 items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--section)] p-3.5">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] ${variants[variant]}`}
      >
        <Icon size={16} />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold leading-5 text-[var(--heading)]">
          {value}
        </p>
      </div>
    </article>
  );
}

function InfoSection({
  icon: Icon,
  eyebrow,
  title,
  children,
}) {
  return (
    <section className="min-w-0 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--primary-light)] text-[var(--primary)]">
          <Icon size={19} />
        </div>

        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--primary)]">
              {eyebrow}
            </p>
          )}

          <h2 className="font-heading text-lg font-bold text-[var(--heading)]">
            {title}
          </h2>
        </div>
      </div>

      <div className="mt-5 min-w-0">
        {children}
      </div>
    </section>
  );
}

function RecordList({
  title,
  icon: Icon,
  items,
  emptyMessage,
}) {
  return (
    <div className="min-w-0 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--section)] p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary-light)] text-[var(--primary)]">
          <Icon size={16} />
        </span>

        <h3 className="font-heading font-bold text-[var(--heading)]">
          {title}
        </h3>
      </div>

      {items.length > 0 ? (
        <ul className="mt-4 space-y-2.5">
          {items.map(
            (item, index) => (
              <li
                key={`${getRecordLabel(
                  item
                )}-${index}`}
                className="flex min-w-0 items-start gap-2.5 rounded-[var(--radius-md)] bg-[var(--card)] px-3 py-2.5 text-sm text-[var(--body)]"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--secondary)]" />

                <span className="min-w-0 break-words">
                  {getRecordLabel(item)}
                </span>
              </li>
            )
          )}
        </ul>
      ) : (
        <EmptyText>
          {emptyMessage}
        </EmptyText>
      )}
    </div>
  );
}

function EmptyText({ children }) {
  return (
    <p className="mt-3 text-sm leading-6 text-[var(--body)]">
      {children}
    </p>
  );
}

function ErrorMessage({
  title,
  message,
}) {
  return (
    <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-red-200 bg-red-50 p-4 text-sm text-[var(--danger)]">
      <FiAlertCircle
        size={18}
        className="mt-0.5 shrink-0"
      />

      <div className="min-w-0">
        <p className="font-semibold">
          {title}
        </p>

        <p className="mt-1 break-words leading-6">
          {message}
        </p>
      </div>
    </div>
  );
}

function PatientHistoryLoading() {
  return (
    <section
      className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] px-6 py-16 text-center shadow-[var(--shadow-soft)]"
      role="status"
    >
      <FiRefreshCw className="mx-auto animate-spin text-3xl text-[var(--primary)]" />

      <p className="mt-4 font-heading text-sm font-bold text-[var(--heading)]">
        Loading patient history
      </p>

      <p className="mt-1 text-xs text-[var(--muted)]">
        Please wait while patient records
        are prepared.
      </p>
    </section>
  );
}

function NoPatients({
  hasQuery,
  onClear,
}) {
  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] px-5 py-14 text-center shadow-[var(--shadow-soft)] sm:px-6 sm:py-16">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)]">
        <FiUser size={24} />
      </div>

      <h2 className="mt-4 font-heading text-lg font-bold text-[var(--heading)]">
        No patient found
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--body)]">
        {hasQuery
          ? "No patients match the current search. Try another name, phone number, condition, gender, or blood group."
          : "Patient records will appear here after appointments are registered."}
      </p>

      {hasQuery && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)]"
        >
          Clear search
        </button>
      )}
    </section>
  );
}

function VisitEmptyState() {
  return (
    <div className="mt-5 rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--section)] px-5 py-9 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)]">
        <FiCalendar size={21} />
      </div>

      <p className="mt-3 font-heading text-sm font-bold text-[var(--heading)]">
        No previous visits recorded
      </p>

      <p className="mt-1 text-xs text-[var(--muted)]">
        Completed consultation records will
        appear here.
      </p>
    </div>
  );
}