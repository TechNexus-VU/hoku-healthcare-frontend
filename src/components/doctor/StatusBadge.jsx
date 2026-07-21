import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiInfo,
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

  active: {
    label: "Active",
    icon: FiCheckCircle,
    className:
      "border-green-200 bg-green-50 text-[var(--success)]",
  },

  inactive: {
    label: "Inactive",
    icon: FiAlertCircle,
    className:
      "border-[var(--border)] bg-[var(--section)] text-[var(--body)]",
  },
};

function getStatusConfig(status) {
  const normalizedStatus = String(
    status || "pending"
  )
    .trim()
    .toLowerCase();

  return (
    statusConfig[normalizedStatus] || {
      label:
        String(status || "Unknown").trim() ||
        "Unknown",
      icon: FiInfo,
      className:
        "border-[var(--border)] bg-[var(--section)] text-[var(--body)]",
    }
  );
}

export default function StatusBadge({
  status = "Pending",
  showIcon = true,
  className = "",
}) {
  const currentStatus =
    getStatusConfig(status);

  const StatusIcon = currentStatus.icon;

  return (
    <span
      aria-label={`Status: ${currentStatus.label}`}
      className={`
        inline-flex w-fit shrink-0
        items-center justify-center gap-1.5
        whitespace-nowrap rounded-full
        border px-3 py-1.5
        text-xs font-semibold leading-none
        ${currentStatus.className}
        ${className}
      `}
    >
      {showIcon && (
        <StatusIcon
          size={13}
          aria-hidden="true"
          className="shrink-0"
        />
      )}

      <span>{currentStatus.label}</span>
    </span>
  );
}