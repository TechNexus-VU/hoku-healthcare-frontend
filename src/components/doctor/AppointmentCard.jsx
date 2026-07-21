import {
  FiCheckCircle,
  FiClock,
  FiEye,
  FiXCircle,
} from "react-icons/fi";

const statusConfig = {
  pending: {
    label: "Pending",
    icon: FiClock,
    className:
      "border-amber-200 bg-amber-50 text-[var(--warning)]",
  },

  upcoming: {
    label: "Upcoming",
    icon: FiClock,
    className:
      "border-[var(--secondary)]/30 bg-[var(--secondary-light)] text-[var(--secondary-hover)]",
  },

  confirmed: {
    label: "Confirmed",
    icon: FiCheckCircle,
    className:
      "border-blue-200 bg-[var(--primary-light)] text-[var(--primary)]",
  },

  completed: {
    label: "Completed",
    icon: FiCheckCircle,
    className:
      "border-green-200 bg-green-50 text-[var(--success)]",
  },

  cancelled: {
    label: "Cancelled",
    icon: FiXCircle,
    className:
      "border-red-200 bg-red-50 text-[var(--danger)]",
  },

  canceled: {
    label: "Cancelled",
    icon: FiXCircle,
    className:
      "border-red-200 bg-red-50 text-[var(--danger)]",
  },
};

function getStatusConfig(status) {
  const normalizedStatus = String(
    status || "pending"
  )
    .trim()
    .toLowerCase();

  return (
    statusConfig[normalizedStatus] ||
    statusConfig.pending
  );
}

function getPatientInitial(patientName) {
  return String(patientName || "P")
    .trim()
    .charAt(0)
    .toUpperCase();
}

export default function AppointmentCard({
  appointment = {},
  onApprove,
  onView,
  onCancel,
  updating = false,
}) {
  const currentStatus = getStatusConfig(
    appointment.status
  );

  const StatusIcon = currentStatus.icon;

  const statusKey = String(
    appointment.status || "pending"
  )
    .trim()
    .toLowerCase();

  const patientName =
    appointment.patient ||
    "Unknown Patient";

  const reason =
    appointment.reason ||
    "General Consultation";

  const appointmentTime =
    appointment.time ||
    "Time unavailable";

  const appointmentType =
    appointment.type ||
    "In Clinic";

  const canApprove = [
    "pending",
    "upcoming",
  ].includes(statusKey);

  const canCancel = ![
    "completed",
    "cancelled",
    "canceled",
  ].includes(statusKey);

  const handleApprove = () => {
    onApprove?.(appointment);
  };

  const handleView = () => {
    onView?.(appointment);
  };

  const handleCancel = () => {
    onCancel?.(appointment);
  };

  return (
    <article
      className="
        group min-w-0
        rounded-[var(--radius-xl)]
        border border-[var(--border)]
        bg-[var(--card)]
        p-4
        shadow-[var(--shadow-soft)]
        transition-all duration-300
        hover:-translate-y-0.5
        hover:border-[var(--primary)]/25
        hover:shadow-[var(--shadow-card)]
        sm:p-5
      "
    >
      {/* Patient and status */}
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {/* Patient initial */}
          <div
            className="
              flex h-11 w-11 shrink-0
              items-center justify-center
              rounded-[var(--radius-lg)]
              bg-[var(--primary-light)]
              font-heading text-sm font-bold
              text-[var(--primary)]
              transition-colors duration-300
              group-hover:bg-[var(--primary)]
              group-hover:text-white
            "
          >
            {getPatientInitial(patientName)}
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-heading text-base font-bold text-[var(--heading)]">
              {patientName}
            </h3>

            <p className="mt-1 line-clamp-2 text-sm leading-5 text-[var(--body)]">
              {reason}
            </p>
          </div>
        </div>

        {/* Status */}
        <span
          className={`
            inline-flex w-fit shrink-0
            items-center gap-1.5
            rounded-full border
            px-3 py-1.5
            text-xs font-semibold
            ${currentStatus.className}
          `}
        >
          <StatusIcon
            size={14}
            aria-hidden="true"
          />

          {currentStatus.label}
        </span>
      </div>

      {/* Appointment details */}
      <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 border-y border-[var(--border)] py-4 sm:grid-cols-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary-light)] text-[var(--primary)]">
            <FiClock
              size={16}
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium text-[var(--muted)]">
              Appointment time
            </p>

            <p className="mt-0.5 truncate text-sm font-semibold text-[var(--heading)]">
              {appointmentTime}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--secondary-light)] text-[var(--secondary-hover)]">
            <FiCheckCircle
              size={16}
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium text-[var(--muted)]">
              Consultation type
            </p>

            <p className="mt-0.5 truncate text-sm font-semibold text-[var(--heading)]">
              {appointmentType}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
        {canApprove && (
          <button
            type="button"
            onClick={handleApprove}
            disabled={updating}
            className="
              inline-flex min-h-10 w-full
              items-center justify-center gap-2
              rounded-[var(--radius-md)]
              bg-[var(--primary)]
              px-4 py-2
              text-sm font-semibold text-white
              shadow-[var(--shadow-button)]
              transition-all duration-300
              hover:bg-[var(--primary-hover)]
              focus:outline-none
              focus:ring-4
              focus:ring-[var(--primary-light)]
              disabled:cursor-not-allowed
              disabled:opacity-60
              sm:w-auto
            "
          >
            <FiCheckCircle size={16} />

            Confirm
          </button>
        )}

        <button
          type="button"
          onClick={handleView}
          disabled={updating}
          className="
            inline-flex min-h-10 w-full
            items-center justify-center gap-2
            rounded-[var(--radius-md)]
            border border-[var(--border)]
            bg-[var(--card)]
            px-4 py-2
            text-sm font-semibold
            text-[var(--heading)]
            transition-all duration-300
            hover:border-[var(--primary)]
            hover:bg-[var(--primary-light)]
            hover:text-[var(--primary)]
            focus:outline-none
            focus:ring-4
            focus:ring-[var(--primary-light)]
            disabled:cursor-not-allowed
            disabled:opacity-60
            sm:w-auto
          "
        >
          <FiEye size={16} />

          View Details
        </button>

        {canCancel && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={updating}
            className="
              inline-flex min-h-10 w-full
              items-center justify-center gap-2
              rounded-[var(--radius-md)]
              border border-red-200
              bg-[var(--card)]
              px-4 py-2
              text-sm font-semibold
              text-[var(--danger)]
              transition-all duration-300
              hover:border-[var(--danger)]
              hover:bg-red-50
              focus:outline-none
              focus:ring-4
              focus:ring-red-100
              disabled:cursor-not-allowed
              disabled:opacity-60
              sm:ml-auto sm:w-auto
            "
          >
            <FiXCircle size={16} />

            Cancel
          </button>
        )}
      </div>
    </article>
  );
}