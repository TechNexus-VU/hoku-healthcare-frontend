import { useState } from "react";

import {
  Link,
} from "react-router-dom";

import { motion } from "framer-motion";

import {
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  HeartPulse,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { toast } from "react-toastify";

const HOKU_PRIMARY = "#1E63C6";
const HOKU_PRIMARY_DARK = "#174FA0";
const HOKU_SECONDARY = "#B7CF35";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1E63C6] focus:ring-4 focus:ring-[#1E63C6]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

function FormField({
  label,
  required = false,
  children,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

function getErrorMessage(
  error,
  fallback = "Unable to create your account. Please try again."
) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

export default function PatientRegister() {
  const [form, setForm] =
    useState(initialForm);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [formError, setFormError] =
    useState("");

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

    if (formError) {
      setFormError("");
    }
  };

  const showValidationError = (
    message
  ) => {
    setFormError(message);
    toast.error(message);

    return false;
  };

  const validateForm = () => {
    if (
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      return showValidationError(
        "Please complete all required fields."
      );
    }

    if (
      form.fullName.trim().length < 3
    ) {
      return showValidationError(
        "Please enter your complete name."
      );
    }

    if (form.phone.trim().length < 10) {
      return showValidationError(
        "Please enter a valid phone number."
      );
    }

    if (form.password.length < 8) {
      return showValidationError(
        "Password must contain at least 8 characters."
      );
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      return showValidationError(
        "Passwords do not match."
      );
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

    try {
      setLoading(true);
      setFormError("");

      const patientData = {
        fullName:
          form.fullName.trim(),

        email: form.email
          .trim()
          .toLowerCase(),

        phone: form.phone.trim(),

        password: form.password,
      };

      // Replace this with your patient registration API.
      // await registerPatient(patientData);

      console.log(
        "Patient registration data:",
        patientData
      );

      toast.success(
        "Patient account created successfully."
      );

      setForm(initialForm);
      setShowPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      const message =
        getErrorMessage(error);

      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-slate-50 px-4 py-8 font-['Inter'] sm:px-6 sm:py-10 lg:px-8">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full opacity-10 blur-3xl"
        style={{
          backgroundColor: HOKU_PRIMARY,
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full opacity-20 blur-3xl"
        style={{
          backgroundColor:
            HOKU_SECONDARY,
        }}
      />

      <motion.section
        initial={{
          opacity: 0,
          y: 18,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
          ease: "easeOut",
        }}
        className="relative grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] lg:min-h-[720px] lg:grid-cols-[0.9fr_1.1fr]"
      >
        {/* Branding panel */}
        <section
          className="relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-12"
          style={{
            background:
              "linear-gradient(145deg, #1E63C6 0%, #174FA0 62%, #123E7D 100%)",
          }}
        >
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10 bg-white/5"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full border border-white/10 bg-white/5"
          />

          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 shadow-lg backdrop-blur">
                <HeartPulse className="h-7 w-7" />

                <span
                  className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-[#1E63C6]"
                  style={{
                    backgroundColor:
                      HOKU_SECONDARY,
                  }}
                />
              </div>

              <div>
                <p className="text-xl font-bold tracking-tight">
                  HOKU
                </p>

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
                  Patient Portal
                </p>
              </div>
            </div>

            <div className="mt-14 max-w-md">
              <p
                className="inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em]"
                style={{
                  backgroundColor:
                    "rgba(183, 207, 53, 0.18)",

                  color: "#EAF5A2",
                }}
              >
                Patient registration
              </p>

              <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
                Take control of your
                healthcare journey.
              </h1>

              <p className="mt-5 max-w-sm text-sm leading-7 text-white/75">
                Create your patient account
                to book appointments, connect
                with doctors, manage healthcare
                services, and access your
                appointment history.
              </p>
            </div>

            <div className="mt-10 space-y-4">
              {[
                {
                  icon: CalendarCheck,
                  text: "Book and manage appointments",
                },
                {
                  icon: UserRound,
                  text: "Connect with verified doctors",
                },
                {
                  icon: ShieldCheck,
                  text: "Secure personal healthcare access",
                },
              ].map(
                ({
                  icon: Icon,
                  text,
                }) => (
                  <div
                    key={text}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                      style={{
                        backgroundColor:
                          "rgba(183, 207, 53, 0.2)",

                        color: "#DDF078",
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <span className="text-sm font-medium text-white/85">
                      {text}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="relative flex items-center justify-between border-t border-white/10 pt-6 text-xs text-white/55">
            <span>
              Secure patient registration
            </span>

            <span>HOKU Health Care</span>
          </div>
        </section>

        {/* Registration form */}
        <section className="flex items-center px-5 py-7 sm:px-10 sm:py-10 lg:px-12 lg:py-12 xl:px-16">
          <div className="mx-auto w-full max-w-xl">
            {/* Mobile brand */}
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div
                  className="relative flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm"
                  style={{
                    backgroundColor:
                      HOKU_PRIMARY,
                  }}
                >
                  <HeartPulse className="h-6 w-6" />

                  <span
                    className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white"
                    style={{
                      backgroundColor:
                        HOKU_SECONDARY,
                    }}
                  />
                </div>

                <div>
                  <p className="text-lg font-bold leading-tight text-slate-900">
                    HOKU
                  </p>

                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.16em]"
                    style={{
                      color: HOKU_PRIMARY,
                    }}
                  >
                    Patient Portal
                  </p>
                </div>
              </div>
            </div>

            <header className="mb-7">
              <div
                className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em]"
                style={{
                  backgroundColor:
                    "rgba(30, 99, 198, 0.1)",

                  color: HOKU_PRIMARY,
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor:
                      HOKU_SECONDARY,
                  }}
                />

                Create an account
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Create your patient account
              </h2>

              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                Register to manage your
                appointments and HOKU
                healthcare services securely.
              </p>
            </header>

            {formError && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
              >
                <AlertCircle className="mt-1 h-4 w-4 shrink-0" />

                <span>{formError}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <FormField
                label="Full name"
                required
              >
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    autoComplete="name"
                    disabled={loading}
                    placeholder="Enter your full name"
                    className={`${inputClassName} pr-4`}
                  />
                </div>
              </FormField>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField
                  label="Email address"
                  required
                >
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      disabled={loading}
                      placeholder="patient@example.com"
                      className={`${inputClassName} pr-4`}
                    />
                  </div>
                </FormField>

                <FormField
                  label="Phone number"
                  required
                >
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                      disabled={loading}
                      placeholder="+92 300 1234567"
                      className={`${inputClassName} pr-4`}
                    />
                  </div>
                </FormField>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField
                  label="Password"
                  required
                >
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      disabled={loading}
                      placeholder="Minimum 8 characters"
                      className={`${inputClassName} pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (current) =>
                            !current
                        )
                      }
                      disabled={loading}
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      aria-pressed={
                        showPassword
                      }
                      className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#1E63C6]/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormField>

                <FormField
                  label="Confirm password"
                  required
                >
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      name="confirmPassword"
                      value={
                        form.confirmPassword
                      }
                      onChange={handleChange}
                      autoComplete="new-password"
                      disabled={loading}
                      placeholder="Re-enter password"
                      className={`${inputClassName} pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (current) =>
                            !current
                        )
                      }
                      disabled={loading}
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirmation password"
                          : "Show confirmation password"
                      }
                      aria-pressed={
                        showConfirmPassword
                      }
                      className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#1E63C6]/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormField>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#B7CF35]/20 text-[#61720E]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>

                <p className="text-xs leading-5 text-slate-500">
                  By creating an account, you
                  agree to HOKU Health Care’s
                  terms and privacy policy.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor:
                    loading
                      ? HOKU_PRIMARY_DARK
                      : HOKU_PRIMARY,
                }}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#1E63C6]/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />

                    Creating account...
                  </>
                ) : (
                  <>
                    <UserRound className="h-4 w-4" />

                    Create patient account
                  </>
                )}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Already registered?
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <p className="text-center text-sm text-slate-500">
              Already have a patient
              account?{" "}
              <Link
                to="/patient/login"
                className="font-semibold text-[#1E63C6] transition hover:text-[#174FA0] hover:underline"
              >
                Sign in
              </Link>
            </p>

            <p className="mt-4 text-center text-sm text-slate-500">
              Registering as a healthcare
              professional?{" "}
              <Link
                to="/doctor/register"
                className="font-semibold text-[#1E63C6] transition hover:text-[#174FA0] hover:underline"
              >
                Doctor registration
              </Link>
            </p>
          </div>
        </section>
      </motion.section>
    </main>
  );
}