import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";
import { toast } from "react-toastify";

import {
  FiAlertCircle,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCoffee,
  FiRefreshCw,
  FiSave,
} from "react-icons/fi";

import {
  extractDoctorAvailability,
  getDoctorAvailability,
  updateDoctorAvailability,
} from "@/services/doctorAvailabilityApi";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const SLOT_OPTIONS = [
  "15",
  "20",
  "30",
  "45",
  "60",
];

const DEFAULT_DAY = {
  enabled: false,
  start: "09:00",
  end: "17:00",
  lunchStart: "13:00",
  lunchEnd: "14:00",
  slot: "30",
};

const INITIAL_AVAILABILITY = {
  Monday: {
    ...DEFAULT_DAY,
    enabled: true,
  },
  Tuesday: {
    ...DEFAULT_DAY,
    enabled: true,
  },
  Wednesday: {
    ...DEFAULT_DAY,
  },
  Thursday: {
    ...DEFAULT_DAY,
    enabled: true,
  },
  Friday: {
    ...DEFAULT_DAY,
    enabled: true,
    start: "10:00",
    end: "18:00",
    slot: "45",
  },
  Saturday: {
    ...DEFAULT_DAY,
    start: "10:00",
    end: "15:00",
    lunchStart: "12:00",
    lunchEnd: "13:00",
    slot: "45",
  },
  Sunday: {
    ...DEFAULT_DAY,
    start: "10:00",
    end: "15:00",
    lunchStart: "12:00",
    lunchEnd: "13:00",
    slot: "45",
  },
};

function getErrorMessage(
  error,
  fallback = "Unable to process availability."
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
    "enabled",
  ].includes(normalizedValue);
}

function capitalizeDay(value) {
  const normalizedDay = String(
    value || ""
  )
    .trim()
    .toLowerCase();

  if (!normalizedDay) {
    return "";
  }

  return (
    normalizedDay.charAt(0).toUpperCase() +
    normalizedDay.slice(1)
  );
}

function normalizeRecords(records) {
  if (Array.isArray(records)) {
    return records;
  }

  if (
    records &&
    typeof records === "object"
  ) {
    return Object.entries(records).map(
      ([day, entry]) => ({
        day,
        ...(entry &&
        typeof entry === "object"
          ? entry
          : {}),
      })
    );
  }

  return [];
}

function convertAvailabilityToObject(
  records
) {
  const result = Object.fromEntries(
    DAYS.map((day) => [
      day,
      {
        ...INITIAL_AVAILABILITY[day],
      },
    ])
  );

  normalizeRecords(records).forEach(
    (record) => {
      const day = capitalizeDay(
        record.day ||
          record.day_name ||
          record.week_day
      );

      if (!DAYS.includes(day)) {
        return;
      }

      result[day] = {
        enabled: toBoolean(
          record.enabled ??
            record.is_available ??
            record.isAvailable ??
            record.active
        ),

        start:
          record.start_time ||
          record.startTime ||
          record.start ||
          result[day].start,

        end:
          record.end_time ||
          record.endTime ||
          record.end ||
          result[day].end,

        lunchStart:
          record.lunch_start ??
          record.lunchStart ??
          record.break_start ??
          record.breakStart ??
          "",

        lunchEnd:
          record.lunch_end ??
          record.lunchEnd ??
          record.break_end ??
          record.breakEnd ??
          "",

        slot: String(
          record.slot_duration ??
            record.slotDuration ??
            record.slot ??
            result[day].slot
        ),
      };
    }
  );

  return result;
}

function getMinutes(value) {
  if (!value) {
    return null;
  }

  const [hours, minutes] = String(
    value
  )
    .split(":")
    .map(Number);

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

function formatDisplayTime(value) {
  if (!value) {
    return "Not set";
  }

  const minutes = getMinutes(value);

  if (minutes === null) {
    return value;
  }

  const hours = Math.floor(
    minutes / 60
  );

  const displayMinutes = String(
    minutes % 60
  ).padStart(2, "0");

  const period =
    hours >= 12 ? "PM" : "AM";

  const displayHours =
    hours % 12 || 12;

  return `${displayHours}:${displayMinutes} ${period}`;
}

export default function Availability() {
  const [
    availability,
    setAvailability,
  ] = useState(
    INITIAL_AVAILABILITY
  );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadAvailability =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await getDoctorAvailability();

        const extractedRecords =
          extractDoctorAvailability(
            response
          );

        setAvailability(
          convertAvailabilityToObject(
            extractedRecords
          )
        );
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Unable to load availability."
          )
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const activeDays = useMemo(
    () =>
      DAYS.filter(
        (day) =>
          availability[day]?.enabled
      ),
    [availability]
  );

  const averageSlot = useMemo(() => {
    if (activeDays.length === 0) {
      return 0;
    }

    const total = activeDays.reduce(
      (sum, day) =>
        sum +
        Number(
          availability[day]?.slot || 0
        ),
      0
    );

    return Math.round(
      total / activeDays.length
    );
  }, [activeDays, availability]);

  const toggleDay = (day) => {
    setAvailability(
      (currentAvailability) => ({
        ...currentAvailability,

        [day]: {
          ...currentAvailability[day],

          enabled:
            !currentAvailability[day]
              .enabled,
        },
      })
    );
  };

  const updateField = (
    day,
    field,
    value
  ) => {
    setAvailability(
      (currentAvailability) => ({
        ...currentAvailability,

        [day]: {
          ...currentAvailability[day],
          [field]: value,
        },
      })
    );
  };

  const validateAvailability = () => {
    if (activeDays.length === 0) {
      toast.error(
        "Enable at least one available day."
      );

      return false;
    }

    for (const day of DAYS) {
      const entry =
        availability[day];

      if (!entry.enabled) {
        continue;
      }

      const startMinutes =
        getMinutes(entry.start);

      const endMinutes =
        getMinutes(entry.end);

      const lunchStartMinutes =
        getMinutes(entry.lunchStart);

      const lunchEndMinutes =
        getMinutes(entry.lunchEnd);

      if (
        startMinutes === null ||
        endMinutes === null
      ) {
        toast.error(
          `Enter valid working hours for ${day}.`
        );

        return false;
      }

      if (
        startMinutes >= endMinutes
      ) {
        toast.error(
          `${day}'s start time must be before its end time.`
        );

        return false;
      }

      const hasLunchStart =
        Boolean(entry.lunchStart);

      const hasLunchEnd =
        Boolean(entry.lunchEnd);

      if (
        hasLunchStart !== hasLunchEnd
      ) {
        toast.error(
          `Enter both break times for ${day}, or leave both empty.`
        );

        return false;
      }

      if (
        hasLunchStart &&
        hasLunchEnd
      ) {
        if (
          lunchStartMinutes === null ||
          lunchEndMinutes === null
        ) {
          toast.error(
            `Enter valid break times for ${day}.`
          );

          return false;
        }

        if (
          lunchStartMinutes >=
          lunchEndMinutes
        ) {
          toast.error(
            `${day}'s break start must be before its break end.`
          );

          return false;
        }

        if (
          lunchStartMinutes <
            startMinutes ||
          lunchEndMinutes >
            endMinutes
        ) {
          toast.error(
            `${day}'s break must remain within working hours.`
          );

          return false;
        }
      }

      if (
        !SLOT_OPTIONS.includes(
          String(entry.slot)
        )
      ) {
        toast.error(
          `Choose a valid slot duration for ${day}.`
        );

        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateAvailability()) {
      return;
    }

    setSaving(true);
    setError("");

    const payload = DAYS.map(
      (day) => ({
        day: day.toLowerCase(),

        enabled:
          availability[day].enabled,

        start_time:
          availability[day].start,

        end_time:
          availability[day].end,

        lunch_start:
          availability[day]
            .lunchStart || null,

        lunch_end:
          availability[day]
            .lunchEnd || null,

        slot_duration: Number(
          availability[day].slot
        ),
      })
    );

    try {
      const response =
        await updateDoctorAvailability(
          payload
        );

      const updatedRecords =
        extractDoctorAvailability(
          response
        );

      const hasUpdatedRecords =
        normalizeRecords(
          updatedRecords
        ).length > 0;

      setAvailability(
        hasUpdatedRecords
          ? convertAvailabilityToObject(
              updatedRecords
            )
          : convertAvailabilityToObject(
              payload
            )
      );

      toast.success(
        "Availability updated successfully."
      );
    } catch (requestError) {
      const message = getErrorMessage(
        requestError,
        "Unable to save availability."
      );

      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AvailabilityLoading />;
  }

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
              Availability Manager
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--body)] sm:text-base">
              Set your consultation days,
              working hours, break periods,
              and appointment duration.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <button
              type="button"
              onClick={loadAvailability}
              disabled={
                loading || saving
              }
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-sm font-semibold text-[var(--heading)] transition-all duration-300 hover:border-[var(--primary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-light)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-button)] transition-all duration-300 hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-light)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {saving ? (
                <FiRefreshCw
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <FiSave size={17} />
              )}

              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={FiCalendar}
          label="Available Days"
          value={`${activeDays.length} / 7`}
          description="Days accepting bookings"
        />

        <SummaryCard
          icon={FiClock}
          label="Average Slot"
          value={`${averageSlot || 0} min`}
          description="Average consultation time"
          variant="secondary"
        />

        <SummaryCard
          icon={FiCheckCircle}
          label="Schedule Status"
          value={
            activeDays.length > 0
              ? "Active"
              : "Inactive"
          }
          description={
            activeDays.length > 0
              ? "Bookings can be scheduled"
              : "No available days selected"
          }
          variant="success"
        />
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-red-200 bg-red-50 p-4 text-sm text-[var(--danger)]">
          <FiAlertCircle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <div className="min-w-0">
            <p className="font-semibold">
              Availability could not be processed
            </p>

            <p className="mt-1 break-words leading-6">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Weekly schedule */}
      <section className="space-y-4">
        {DAYS.map((day, index) => {
          const entry =
            availability[day];

          return (
            <motion.article
              key={day}
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
                delay: index * 0.035,
              }}
              className={`min-w-0 overflow-hidden rounded-[var(--radius-xl)] border bg-[var(--card)] shadow-[var(--shadow-soft)] transition-all duration-300 ${
                entry.enabled
                  ? "border-[var(--primary)]/20"
                  : "border-[var(--border)]"
              }`}
            >
              {/* Day header */}
              <div
                className={`flex flex-col gap-4 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 ${
                  entry.enabled
                    ? "border-[var(--primary)]/10 bg-[var(--primary-light)]/60"
                    : "border-[var(--border)] bg-[var(--section)]"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <DaySwitch
                    enabled={entry.enabled}
                    day={day}
                    onToggle={() =>
                      toggleDay(day)
                    }
                  />

                  <div className="min-w-0">
                    <h2 className="font-heading text-lg font-bold text-[var(--heading)]">
                      {day}
                    </h2>

                    <p className="mt-0.5 text-sm text-[var(--body)]">
                      {entry.enabled
                        ? `${formatDisplayTime(
                            entry.start
                          )} – ${formatDisplayTime(
                            entry.end
                          )}`
                        : "Not available for appointments"}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    entry.enabled
                      ? "border-green-200 bg-green-50 text-[var(--success)]"
                      : "border-[var(--border)] bg-[var(--card)] text-[var(--muted)]"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      entry.enabled
                        ? "bg-[var(--success)]"
                        : "bg-[var(--muted)]"
                    }`}
                  />

                  {entry.enabled
                    ? "Available"
                    : "Unavailable"}
                </span>
              </div>

              {/* Day fields */}
              <div
                className={`p-4 transition-opacity sm:p-5 ${
                  entry.enabled
                    ? "opacity-100"
                    : "opacity-60"
                }`}
              >
                <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                  <TimeField
                    label="Start Time"
                    value={entry.start}
                    disabled={!entry.enabled}
                    icon={FiClock}
                    onChange={(value) =>
                      updateField(
                        day,
                        "start",
                        value
                      )
                    }
                  />

                  <TimeField
                    label="End Time"
                    value={entry.end}
                    disabled={!entry.enabled}
                    icon={FiClock}
                    onChange={(value) =>
                      updateField(
                        day,
                        "end",
                        value
                      )
                    }
                  />

                  <TimeField
                    label="Break Start"
                    value={
                      entry.lunchStart
                    }
                    disabled={!entry.enabled}
                    icon={FiCoffee}
                    onChange={(value) =>
                      updateField(
                        day,
                        "lunchStart",
                        value
                      )
                    }
                  />

                  <TimeField
                    label="Break End"
                    value={entry.lunchEnd}
                    disabled={!entry.enabled}
                    icon={FiCoffee}
                    onChange={(value) =>
                      updateField(
                        day,
                        "lunchEnd",
                        value
                      )
                    }
                  />

                  <SlotField
                    value={entry.slot}
                    disabled={!entry.enabled}
                    onChange={(value) =>
                      updateField(
                        day,
                        "slot",
                        value
                      )
                    }
                  />
                </div>

                {entry.enabled && (
                  <div className="mt-4 flex flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--section)] px-4 py-3 text-xs text-[var(--body)] sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      Working hours:{" "}
                      <strong className="text-[var(--heading)]">
                        {formatDisplayTime(
                          entry.start
                        )}{" "}
                        –{" "}
                        {formatDisplayTime(
                          entry.end
                        )}
                      </strong>
                    </span>

                    <span>
                      Appointment duration:{" "}
                      <strong className="text-[var(--heading)]">
                        {entry.slot} minutes
                      </strong>
                    </span>
                  </div>
                )}
              </div>
            </motion.article>
          );
        })}
      </section>

      {/* Mobile save action */}
      <div className="sticky bottom-4 z-20 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)]/95 p-3 shadow-[var(--shadow-card)] backdrop-blur-md sm:hidden">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <FiRefreshCw
              size={17}
              className="animate-spin"
            />
          ) : (
            <FiSave size={17} />
          )}

          {saving
            ? "Saving Schedule..."
            : "Save Availability"}
        </button>
      </div>
    </motion.div>
  );
}

function DaySwitch({
  enabled,
  day,
  onToggle,
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={`${
        enabled ? "Disable" : "Enable"
      } ${day}`}
      onClick={onToggle}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-[var(--primary-light)] ${
        enabled
          ? "bg-[var(--primary)]"
          : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-300 ${
          enabled
            ? "left-6"
            : "left-1"
        }`}
      />
    </button>
  );
}

function TimeField({
  label,
  value,
  disabled,
  icon: Icon,
  onChange,
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-medium text-[var(--body)]">
        {label}
      </span>

      <div className="relative">
        <Icon
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary)]"
        />

        <input
          type="time"
          value={value}
          disabled={disabled}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] py-2 pl-10 pr-3 text-sm text-[var(--heading)] outline-none transition-all duration-300 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-light)] disabled:cursor-not-allowed disabled:bg-[var(--section)] disabled:text-[var(--muted)]"
        />
      </div>
    </label>
  );
}

function SlotField({
  value,
  disabled,
  onChange,
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-medium text-[var(--body)]">
        Slot Duration
      </span>

      <div className="relative">
        <FiClock
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary)]"
        />

        <select
          value={value}
          disabled={disabled}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="min-h-11 w-full cursor-pointer appearance-none rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] py-2 pl-10 pr-9 text-sm text-[var(--heading)] outline-none transition-all duration-300 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-light)] disabled:cursor-not-allowed disabled:bg-[var(--section)] disabled:text-[var(--muted)]"
        >
          {SLOT_OPTIONS.map((slot) => (
            <option
              key={slot}
              value={slot}
            >
              {slot} minutes
            </option>
          ))}
        </select>

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)]">
          ▼
        </span>
      </div>
    </label>
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

    secondary:
      "bg-[var(--secondary-light)] text-[var(--secondary-hover)]",

    success:
      "bg-green-50 text-[var(--success)]",
  };

  return (
    <article className="flex min-w-0 items-center gap-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-soft)] sm:p-5">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] ${variants[variant]}`}
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

function AvailabilityLoading() {
  return (
    <div
      className="flex min-h-[420px] items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] px-8 py-7 text-center shadow-[var(--shadow-soft)]">
        <FiRefreshCw className="mx-auto animate-spin text-3xl text-[var(--primary)]" />

        <p className="mt-4 font-heading text-sm font-bold text-[var(--heading)]">
          Loading availability
        </p>

        <p className="mt-1 text-xs text-[var(--muted)]">
          Please wait while your schedule is
          prepared.
        </p>
      </div>
    </div>
  );
}