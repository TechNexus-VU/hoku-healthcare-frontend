import {
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";
import { toast } from "react-toastify";

import {
  FiAlertCircle,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiKey,
  FiLock,
  FiRefreshCw,
  FiSave,
  FiShield,
} from "react-icons/fi";

import Button from "../../components/doctor/Button";

import {
  changeDoctorPassword,
} from "@/services/doctorSettingsApi";

const INITIAL_FORM = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function getErrorMessage(
  error,
  fallback = "Unable to change password."
) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function getPasswordRequirements(password) {
  return [
    {
      id: "length",
      label: "At least 8 characters",
      passed: password.length >= 8,
    },
    {
      id: "uppercase",
      label: "One uppercase letter",
      passed: /[A-Z]/.test(password),
    },
    {
      id: "lowercase",
      label: "One lowercase letter",
      passed: /[a-z]/.test(password),
    },
    {
      id: "number",
      label: "One number",
      passed: /[0-9]/.test(password),
    },
  ];
}

export default function Settings() {
  const [form, setForm] =
    useState(INITIAL_FORM);

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const passwordRequirements =
    useMemo(
      () =>
        getPasswordRequirements(
          form.newPassword
        ),
      [form.newPassword]
    );

  const completedRequirements =
    passwordRequirements.filter(
      (requirement) =>
        requirement.passed
    ).length;

  const hasFormValues = Boolean(
    form.currentPassword ||
      form.newPassword ||
      form.confirmPassword
  );

  const passwordsMatch =
    Boolean(form.confirmPassword) &&
    form.newPassword ===
      form.confirmPassword;

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const validateForm = () => {
    if (!form.currentPassword) {
      toast.error(
        "Enter your current password."
      );

      return false;
    }

    if (!form.newPassword) {
      toast.error(
        "Enter a new password."
      );

      return false;
    }

    const failedRequirement =
      passwordRequirements.find(
        (requirement) =>
          !requirement.passed
      );

    if (failedRequirement) {
      toast.error(
        `New password requires: ${failedRequirement.label.toLowerCase()}.`
      );

      return false;
    }

    if (
      form.currentPassword ===
      form.newPassword
    ) {
      toast.error(
        "New password must be different from the current password."
      );

      return false;
    }

    if (!form.confirmPassword) {
      toast.error(
        "Confirm your new password."
      );

      return false;
    }

    if (!passwordsMatch) {
      toast.error(
        "New password and confirmation do not match."
      );

      return false;
    }

    return true;
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await changeDoctorPassword({
        current_password:
          form.currentPassword,

        new_password:
          form.newPassword,

        confirm_password:
          form.confirmPassword,
      });

      setForm(INITIAL_FORM);

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      toast.success(
        "Password changed successfully."
      );
    } catch (requestError) {
      const message = getErrorMessage(
        requestError
      );

      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setError("");

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
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
              Account Settings
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--body)] sm:text-base">
              Protect your Doctor Portal
              account by maintaining a strong,
              private login password.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-[var(--success)]">
            <span className="h-2 w-2 rounded-full bg-[var(--success)]" />

            Security settings active
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-red-200 bg-red-50 p-4 text-sm text-[var(--danger)]"
        >
          <FiAlertCircle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <div className="min-w-0">
            <p className="font-semibold">
              Password could not be changed
            </p>

            <p className="mt-1 break-words leading-6">
              {error}
            </p>
          </div>
        </div>
      )}

      <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        {/* Security information */}
        <aside className="min-w-0 space-y-6 xl:sticky xl:top-[96px]">
          <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--primary-light)] text-[var(--primary)]">
              <FiShield size={22} />
            </div>

            <h2 className="mt-5 font-heading text-lg font-bold text-[var(--heading)]">
              Password Security
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--body)]">
              A strong password helps protect
              patient information and your
              professional account.
            </p>

            <div className="mt-5 space-y-3">
              <SecurityTip text="Use a password unique to HOKU." />

              <SecurityTip text="Avoid your name, email, or phone number." />

              <SecurityTip text="Do not share your password with anyone." />

              <SecurityTip text="Change it when you suspect unauthorized access." />
            </div>
          </section>

          <section className="rounded-[var(--radius-xl)] border border-[var(--primary)]/15 bg-[var(--primary-light)] p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary)] text-white">
                <FiLock size={18} />
              </div>

              <div className="min-w-0">
                <h3 className="font-heading font-bold text-[var(--heading)]">
                  Security notice
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--body)]">
                  HOKU staff should never ask
                  you to share your password by
                  email, telephone, or message.
                </p>
              </div>
            </div>
          </section>
        </aside>

        {/* Password form */}
        <form
          onSubmit={handleSubmit}
          className="min-w-0 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-soft)]"
        >
          {/* Form header */}
          <div className="border-b border-[var(--border)] bg-[var(--section)] px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--primary-light)] text-[var(--primary)]">
                <FiKey size={20} />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-[var(--primary)]">
                  Account Security
                </p>

                <h2 className="mt-0.5 font-heading text-xl font-bold text-[var(--heading)]">
                  Change Password
                </h2>

                <p className="mt-1 text-sm leading-6 text-[var(--body)]">
                  Enter your current password,
                  then create and confirm a
                  secure new password.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid min-w-0 gap-5">
              <PasswordField
                label="Current Password"
                name="currentPassword"
                value={form.currentPassword}
                showPassword={
                  showCurrentPassword
                }
                onToggleVisibility={() =>
                  setShowCurrentPassword(
                    (current) => !current
                  )
                }
                onChange={handleChange}
                placeholder="Enter current password"
                autoComplete="current-password"
                disabled={saving}
              />

              <PasswordField
                label="New Password"
                name="newPassword"
                value={form.newPassword}
                showPassword={
                  showNewPassword
                }
                onToggleVisibility={() =>
                  setShowNewPassword(
                    (current) => !current
                  )
                }
                onChange={handleChange}
                placeholder="Create a new password"
                autoComplete="new-password"
                disabled={saving}
              />

              {/* Password strength */}
              <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--section)] p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-[var(--heading)]">
                    Password requirements
                  </p>

                  <span className="text-xs font-semibold text-[var(--primary)]">
                    {completedRequirements}/
                    {passwordRequirements.length}
                  </span>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {passwordRequirements.map(
                    (requirement) => (
                      <RequirementItem
                        key={requirement.id}
                        passed={
                          requirement.passed
                        }
                        label={
                          requirement.label
                        }
                      />
                    )
                  )}
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      completedRequirements === 4
                        ? "bg-[var(--success)]"
                        : completedRequirements >= 2
                          ? "bg-[var(--warning)]"
                          : "bg-[var(--danger)]"
                    }`}
                    style={{
                      width: `${
                        (completedRequirements /
                          passwordRequirements.length) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <PasswordField
                label="Confirm New Password"
                name="confirmPassword"
                value={form.confirmPassword}
                showPassword={
                  showConfirmPassword
                }
                onToggleVisibility={() =>
                  setShowConfirmPassword(
                    (current) => !current
                  )
                }
                onChange={handleChange}
                placeholder="Confirm the new password"
                autoComplete="new-password"
                disabled={saving}
              />

              {form.confirmPassword && (
                <div
                  className={`flex items-center gap-2 rounded-[var(--radius-md)] border px-4 py-3 text-sm font-medium ${
                    passwordsMatch
                      ? "border-green-200 bg-green-50 text-[var(--success)]"
                      : "border-red-200 bg-red-50 text-[var(--danger)]"
                  }`}
                >
                  {passwordsMatch ? (
                    <FiCheck size={17} />
                  ) : (
                    <FiAlertCircle size={17} />
                  )}

                  {passwordsMatch
                    ? "The passwords match."
                    : "The passwords do not match."}
                </div>
              )}
            </div>
          </div>

          {/* Form actions */}
          <div className="border-t border-[var(--border)] bg-[var(--section)] px-5 py-4 sm:px-6">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={
                  saving || !hasFormValues
                }
                className="w-full sm:min-w-32"
              >
                Reset
              </Button>

              <Button
                type="submit"
                disabled={
                  saving || !hasFormValues
                }
                className="w-full sm:min-w-44"
              >
                <span className="inline-flex items-center gap-2">
                  {saving ? (
                    <FiRefreshCw
                      className="animate-spin"
                      size={16}
                    />
                  ) : (
                    <FiSave size={16} />
                  )}

                  {saving
                    ? "Updating..."
                    : "Change Password"}
                </span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

function PasswordField({
  label,
  name,
  value,
  showPassword,
  onToggleVisibility,
  onChange,
  placeholder,
  autoComplete,
  disabled,
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-medium text-[var(--heading)]">
        {label}
      </span>

      <div className="relative">
        <FiLock
          size={17}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--primary)]"
        />

        <input
          name={name}
          type={
            showPassword
              ? "text"
              : "password"
          }
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          required
          className="min-h-12 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] py-3 pl-11 pr-12 text-sm text-[var(--heading)] outline-none transition-all duration-300 placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-light)] disabled:cursor-not-allowed disabled:bg-[var(--section)] disabled:text-[var(--muted)]"
        />

        <button
          type="button"
          onClick={
            onToggleVisibility
          }
          disabled={disabled}
          aria-label={
            showPassword
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-[var(--radius-md)] text-[var(--body)] transition-all duration-300 hover:bg-[var(--primary-light)] hover:text-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-light)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {showPassword ? (
            <FiEyeOff size={18} />
          ) : (
            <FiEye size={18} />
          )}
        </button>
      </div>
    </label>
  );
}

function SecurityTip({ text }) {
  return (
    <div className="flex items-start gap-2.5 text-sm leading-6 text-[var(--body)]">
      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--secondary)]" />

      <span>{text}</span>
    </div>
  );
}

function RequirementItem({
  passed,
  label,
}) {
  return (
    <div
      className={`flex items-center gap-2 text-xs font-medium ${
        passed
          ? "text-[var(--success)]"
          : "text-[var(--muted)]"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          passed
            ? "bg-green-100"
            : "bg-[var(--card)]"
        }`}
      >
        <FiCheck size={12} />
      </span>

      <span>{label}</span>
    </div>
  );
}