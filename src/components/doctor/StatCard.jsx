import { motion } from "framer-motion";

const accentStyles = {
  primary:
    "from-[var(--primary)] to-[#4f8ee8]",

  secondary:
    "from-[var(--secondary-hover)] to-[var(--secondary)]",

  success:
    "from-[var(--success)] to-[#4ade80]",

  warning:
    "from-[var(--warning)] to-[#fbbf24]",

  danger:
    "from-[var(--danger)] to-[#f87171]",

  info:
    "from-[var(--info)] to-[#38bdf8]",
};

const getAccentClasses = (accent) => {
  if (accentStyles[accent]) {
    return accentStyles[accent];
  }

  if (
    typeof accent === "string" &&
    accent.includes("from-")
  ) {
    return accent;
  }

  return accentStyles.primary;
};

export default function StatCard({
  icon: Icon,
  title,
  value,
  detail,
  accent = "primary",
}) {
  const selectedAccent =
    getAccentClasses(accent);

  return (
    <motion.article
      whileHover={{
        y: -3,
      }}
      transition={{
        duration: 0.2,
        ease: "easeOut",
      }}
      className="
        group relative
        flex h-full min-w-0
        flex-col overflow-hidden
        rounded-[var(--radius-xl)]
        border border-[var(--border)]
        bg-[var(--card)]
        p-5
        shadow-[var(--shadow-soft)]
        transition-shadow duration-300
        hover:shadow-[var(--shadow-card)]
        sm:p-6
      "
    >
      {/* Decorative accent */}
      <div
        className={`
          pointer-events-none absolute
          -right-10 -top-10
          h-28 w-28
          rounded-full
          bg-gradient-to-br
          opacity-[0.08]
          transition-transform duration-300
          group-hover:scale-110
          ${selectedAccent}
        `}
      />

      {/* Top content */}
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div
          className={`
            flex h-11 w-11 shrink-0
            items-center justify-center
            rounded-[var(--radius-lg)]
            bg-gradient-to-br
            text-[var(--white)]
            shadow-[var(--shadow-soft)]
            sm:h-12 sm:w-12
            ${selectedAccent}
          `}
        >
          {Icon && (
            <Icon
              size={20}
              aria-hidden="true"
            />
          )}
        </div>

        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--secondary)]" />
      </div>

      {/* Card information */}
      <div className="relative z-10 mt-5 min-w-0">
        <p className="truncate text-sm font-medium text-[var(--body)]">
          {title}
        </p>

        <h3 className="mt-2 break-words font-heading text-2xl font-bold leading-none text-[var(--heading)] sm:text-[28px]">
          {value}
        </h3>

        {detail && (
          <div className="mt-3 flex min-w-0 items-start gap-2">
            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--secondary)]" />

            <p className="min-w-0 text-xs font-medium leading-5 text-[var(--muted)] sm:text-sm">
              {detail}
            </p>
          </div>
        )}
      </div>

      {/* Bottom accent line */}
      <div className="relative z-10 mt-auto pt-5">
        <div className="h-1 overflow-hidden rounded-full bg-[var(--section)]">
          <div
            className={`
              h-full w-16
              rounded-full
              bg-gradient-to-r
              transition-all duration-300
              group-hover:w-24
              ${selectedAccent}
            `}
          />
        </div>
      </div>
    </motion.article>
  );
}