import { useState } from "react";

import {
  FiArrowUpRight,
  FiCalendar,
  FiHeart,
  FiPhone,
  FiUser,
} from "react-icons/fi";

function getInitials(name) {
  const words = String(name || "Patient")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "P";
  }

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return `${words[0].charAt(0)}${words[
    words.length - 1
  ].charAt(0)}`.toUpperCase();
}

function getPhoneHref(phone) {
  if (!phone) {
    return "";
  }

  const sanitizedPhone = String(phone).replace(
    /[^\d+]/g,
    ""
  );

  return sanitizedPhone
    ? `tel:${sanitizedPhone}`
    : "";
}

export default function PatientCard({
  patient = {},
  onView,
}) {
  const [imageError, setImageError] =
    useState(false);

  const patientName =
    patient.name ||
    patient.full_name ||
    patient.fullName ||
    "Unknown Patient";

  const condition =
    patient.condition ||
    patient.diagnosis ||
    "No condition provided";

  const lastVisit =
    patient.lastVisit ||
    patient.last_visit ||
    "No previous visit";

  const phone =
    patient.phone ||
    patient.phone_number ||
    "";

  const bloodGroup =
    patient.bloodGroup ||
    patient.blood_group ||
    "Not provided";

  const avatar =
    patient.avatar ||
    patient.avatar_url ||
    patient.profile_image ||
    "";

  const phoneHref = getPhoneHref(phone);
  const showAvatar = avatar && !imageError;

  const handleView = () => {
    onView?.(patient);
  };

  return (
    <article
      className="
        group flex h-full min-w-0 flex-col
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
      {/* Patient profile */}
      <div className="flex min-w-0 items-center gap-3">
        {showAvatar ? (
          <img
            src={avatar}
            alt={patientName}
            loading="lazy"
            onError={() => setImageError(true)}
            className="
              h-12 w-12 shrink-0
              rounded-[var(--radius-lg)]
              border-2 border-[var(--primary-light)]
              object-cover
              sm:h-14 sm:w-14
            "
          />
        ) : (
          <div
            className="
              flex h-12 w-12 shrink-0
              items-center justify-center
              rounded-[var(--radius-lg)]
              bg-[var(--primary-light)]
              font-heading text-sm font-bold
              text-[var(--primary)]
              transition-all duration-300
              group-hover:bg-[var(--primary)]
              group-hover:text-white
              sm:h-14 sm:w-14
            "
            aria-hidden="true"
          >
            {getInitials(patientName)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-heading text-base font-bold text-[var(--heading)]">
            {patientName}
          </h3>

          <p className="mt-1 line-clamp-2 text-sm leading-5 text-[var(--body)]">
            {condition}
          </p>
        </div>

        <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--section)] text-[var(--muted)] sm:flex">
          <FiUser size={16} />
        </div>
      </div>

      {/* Patient details */}
      <div className="mt-5 grid gap-3">
        <PatientDetail
          icon={FiCalendar}
          label="Last visit"
          iconClassName="bg-[var(--primary-light)] text-[var(--primary)]"
        >
          <span className="break-words">
            {lastVisit}
          </span>
        </PatientDetail>

        <PatientDetail
          icon={FiPhone}
          label="Phone number"
          iconClassName="bg-[var(--secondary-light)] text-[var(--secondary-hover)]"
        >
          {phoneHref ? (
            <a
              href={phoneHref}
              className="break-all font-medium text-[var(--heading)] transition-colors hover:text-[var(--primary)]"
            >
              {phone}
            </a>
          ) : (
            <span>No phone provided</span>
          )}
        </PatientDetail>

        <PatientDetail
          icon={FiHeart}
          label="Blood group"
          iconClassName="bg-red-50 text-[var(--danger)]"
        >
          <span className="font-semibold text-[var(--heading)]">
            {bloodGroup}
          </span>
        </PatientDetail>
      </div>

      {/* Optional view action */}
      {onView && (
        <div className="mt-auto border-t border-[var(--border)] pt-4">
          <button
            type="button"
            onClick={handleView}
            className="
              inline-flex min-h-10 w-full
              items-center justify-center gap-2
              rounded-[var(--radius-md)]
              bg-[var(--primary-light)]
              px-4 py-2
              text-sm font-semibold
              text-[var(--primary)]
              transition-all duration-300
              hover:bg-[var(--primary)]
              hover:text-white
              focus:outline-none
              focus:ring-4
              focus:ring-[var(--primary-light)]
              sm:w-auto
            "
          >
            View Patient

            <FiArrowUpRight size={16} />
          </button>
        </div>
      )}
    </article>
  );
}

function PatientDetail({
  icon: Icon,
  label,
  iconClassName,
  children,
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--section)] p-3">
      <span
        className={`
          flex h-9 w-9 shrink-0
          items-center justify-center
          rounded-[var(--radius-md)]
          ${iconClassName}
        `}
      >
        <Icon
          size={16}
          aria-hidden="true"
        />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">
          {label}
        </p>

        <div className="mt-0.5 min-w-0 text-sm leading-5 text-[var(--body)]">
          {children}
        </div>
      </div>
    </div>
  );
}