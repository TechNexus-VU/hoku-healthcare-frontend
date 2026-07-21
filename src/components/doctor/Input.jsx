export default function Input({
  label,
  error,
  helperText,
  className = "",
  required = false,
  ...props
}) {
  const inputId =
    props.id || props.name || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <label
      htmlFor={inputId}
      className="block text-sm font-medium text-[var(--heading)]"
    >
      {label && (
        <span className="mb-2 block">
          {label}

          {required && (
            <span className="ml-1 text-[var(--danger)]">*</span>
          )}
        </span>
      )}

      <input
        id={inputId}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error
            ? `${inputId}-error`
            : helperText
              ? `${inputId}-helper`
              : undefined
        }
        className={`w-full rounded-[var(--radius-md)] border
                    bg-[var(--card)] px-4 py-3 text-sm
                    text-[var(--heading)] outline-none
                    transition duration-300
                    placeholder:text-[var(--muted)]
                    disabled:cursor-not-allowed
                    disabled:bg-[var(--section)]
                    disabled:opacity-70 ${
                      error
                        ? `border-[var(--danger)]
                           focus:border-[var(--danger)]
                           focus:ring-[#DC2626]/15`
                        : `border-[var(--border)]
                           focus:border-[var(--primary)]
                           focus:ring-[#1E63C6]/15`
                    }
                    focus:ring-4 ${className}`}
        {...props}
      />

      {error && (
        <span
          id={`${inputId}-error`}
          className="mt-1.5 block text-xs text-[var(--danger)]"
        >
          {error}
        </span>
      )}

      {!error && helperText && (
        <span
          id={`${inputId}-helper`}
          className="mt-1.5 block text-xs text-[var(--muted)]"
        >
          {helperText}
        </span>
      )}
    </label>
  );
}