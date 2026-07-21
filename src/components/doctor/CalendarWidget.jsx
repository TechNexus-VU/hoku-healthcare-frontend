import {
  useMemo,
  useState,
} from "react";

import dayjs from "dayjs";

import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const WEEK_DAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

function normalizeAppointmentDates(dates) {
  if (!Array.isArray(dates)) {
    return new Set();
  }

  return new Set(
    dates
      .map((value) => dayjs(value))
      .filter((date) => date.isValid())
      .map((date) =>
        date.format("YYYY-MM-DD")
      )
  );
}

export default function CalendarWidget({
  appointmentDates = [],
  onDateSelect,
}) {
  const today = dayjs();

  const [visibleMonth, setVisibleMonth] =
    useState(() => today.startOf("month"));

  const [selectedDate, setSelectedDate] =
    useState(() => today);

  const appointmentDateSet = useMemo(
    () =>
      normalizeAppointmentDates(
        appointmentDates
      ),
    [appointmentDates]
  );

  const calendarDays = useMemo(() => {
    const calendarStart = visibleMonth
      .startOf("month")
      .startOf("week");

    return Array.from(
      { length: 42 },
      (_, index) =>
        calendarStart.add(index, "day")
    );
  }, [visibleMonth]);

  const handlePreviousMonth = () => {
    setVisibleMonth((current) =>
      current.subtract(1, "month")
    );
  };

  const handleNextMonth = () => {
    setVisibleMonth((current) =>
      current.add(1, "month")
    );
  };

  const handleToday = () => {
    setVisibleMonth(today.startOf("month"));
    setSelectedDate(today);

    onDateSelect?.(
      today.format("YYYY-MM-DD")
    );
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);

    if (
      !date.isSame(visibleMonth, "month")
    ) {
      setVisibleMonth(
        date.startOf("month")
      );
    }

    onDateSelect?.(
      date.format("YYYY-MM-DD")
    );
  };

  return (
    <section className="min-w-0 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-soft)] sm:p-5 lg:p-6">
      {/* Calendar header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary-light)] text-[var(--primary)]">
              <FiCalendar
                size={17}
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--primary)]">
                Calendar
              </p>

              <h3 className="truncate font-heading text-lg font-bold text-[var(--heading)]">
                {visibleMonth.format(
                  "MMMM YYYY"
                )}
              </h3>
            </div>
          </div>

          <p className="mt-2 text-sm text-[var(--body)]">
            Select a date to review your
            schedule.
          </p>
        </div>

        {/* Month controls */}
        <div className="flex items-center gap-2 self-start">
          <button
            type="button"
            onClick={handlePreviousMonth}
            aria-label="Show previous month"
            className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] text-[var(--body)] transition-all duration-300 hover:border-[var(--primary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-light)]"
          >
            <FiChevronLeft size={19} />
          </button>

          <button
            type="button"
            onClick={handleToday}
            className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary-light)] px-3 text-xs font-semibold text-[var(--primary)] transition-all duration-300 hover:bg-[var(--primary)] hover:text-white focus:outline-none focus:ring-4 focus:ring-[var(--primary-light)]"
          >
            Today
          </button>

          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Show next month"
            className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] text-[var(--body)] transition-all duration-300 hover:border-[var(--primary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-light)]"
          >
            <FiChevronRight size={19} />
          </button>
        </div>
      </div>

      {/* Selected date */}
      <div className="mt-5 flex flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--section)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
            Selected date
          </p>

          <p className="mt-0.5 text-sm font-semibold text-[var(--heading)]">
            {selectedDate.format(
              "dddd, D MMMM YYYY"
            )}
          </p>
        </div>

        {appointmentDateSet.has(
          selectedDate.format("YYYY-MM-DD")
        ) && (
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--secondary-light)] px-3 py-1.5 text-xs font-semibold text-[var(--secondary-hover)]">
            <span className="h-2 w-2 rounded-full bg-[var(--secondary)]" />

            Appointment scheduled
          </span>
        )}
      </div>

      {/* Calendar grid */}
      <div className="mt-5 min-w-0">
        {/* Weekday headings */}
        <div className="grid grid-cols-7 gap-1 text-center sm:gap-1.5">
          {WEEK_DAYS.map((day) => (
            <div
              key={day}
              className="flex h-8 items-center justify-center text-[10px] font-bold uppercase tracking-[0.04em] text-[var(--muted)] sm:text-xs"
            >
              <span className="hidden sm:inline">
                {day}
              </span>

              <span className="sm:hidden">
                {day.charAt(0)}
              </span>
            </div>
          ))}
        </div>

        {/* Date cells */}
        <div className="mt-1 grid grid-cols-7 gap-1 sm:gap-1.5">
          {calendarDays.map((date) => {
            const dateKey =
              date.format("YYYY-MM-DD");

            const isToday = date.isSame(
              today,
              "day"
            );

            const isSelected =
              date.isSame(
                selectedDate,
                "day"
              );

            const isCurrentMonth =
              date.isSame(
                visibleMonth,
                "month"
              );

            const hasAppointment =
              appointmentDateSet.has(
                dateKey
              );

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() =>
                  handleDateSelect(date)
                }
                aria-label={date.format(
                  "dddd, D MMMM YYYY"
                )}
                aria-current={
                  isToday
                    ? "date"
                    : undefined
                }
                aria-pressed={isSelected}
                className={`
                  group relative
                  flex aspect-square min-h-9
                  items-center justify-center
                  rounded-[var(--radius-md)]
                  border text-xs font-semibold
                  transition-all duration-200
                  focus:outline-none
                  focus:ring-4
                  focus:ring-[var(--primary-light)]
                  sm:min-h-10 sm:text-sm

                  ${
                    isSelected
                      ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-[var(--shadow-button)]"
                      : isToday
                        ? "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]"
                        : isCurrentMonth
                          ? "border-transparent bg-[var(--section)] text-[var(--heading)] hover:border-[var(--primary)]/30 hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                          : "border-transparent bg-transparent text-[var(--muted)]/55 hover:bg-[var(--section)] hover:text-[var(--body)]"
                  }
                `}
              >
                <span>{date.date()}</span>

                {hasAppointment && (
                  <span
                    className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${
                      isSelected
                        ? "bg-[var(--secondary)]"
                        : "bg-[var(--primary)]"
                    }`}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Calendar legend */}
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--border)] pt-4 text-xs text-[var(--body)]">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-[4px] bg-[var(--primary)]" />

          Selected
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-[4px] border border-[var(--primary)] bg-[var(--primary-light)]" />

          Today
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[var(--secondary)]" />

          Appointment
        </div>
      </div>
    </section>
  );
}