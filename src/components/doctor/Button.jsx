export default function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
  ...props
}) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    rounded-[var(--radius-md)]
    px-4 py-2.5
    text-sm font-semibold
    transition duration-300
    focus:outline-none
    focus:ring-2
    focus:ring-[var(--primary)]
    focus:ring-offset-2
    disabled:cursor-not-allowed
    disabled:opacity-50
  `;

  const variants = {
    primary: `
      bg-[var(--primary)]
      text-[var(--white)]
      shadow-[var(--shadow-button)]
      hover:-translate-y-0.5
      hover:bg-[var(--primary-hover)]
    `,

    secondary: `
      bg-[var(--primary-light)]
      text-[var(--primary)]
      hover:bg-[#DCEAFF]
    `,

    outline: `
      border border-[var(--border)]
      bg-[var(--card)]
      text-[var(--heading)]
      hover:border-[var(--primary)]
      hover:bg-[var(--section)]
      hover:text-[var(--primary)]
    `,

    danger: `
      bg-[var(--danger)]
      text-[var(--white)]
      hover:bg-[#B91C1C]
    `,
  };

  const selectedVariant = variants[variant] ?? variants.primary;

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseStyles} ${selectedVariant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}