import {
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

import { motion } from "framer-motion";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "@/context/AuthContext.jsx";

const HOKU_PRIMARY = "#1E63C6";
const HOKU_PRIMARY_DARK = "#174FA0";
const HOKU_SECONDARY = "#B7CF35";

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1E63C6] focus:ring-4 focus:ring-[#1E63C6]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

function getErrorMessage(
  error,
  fallback = "Unable to sign in."
) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

export default function DoctorLogin() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const { login, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setError("");
  }, [form.email, form.password]);

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((currentForm) => ({
      ...currentForm,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const email = form.email.trim();

    if (!email || !form.password) {
      setError(
        "Email and password are required."
      );

      return;
    }

    setError("");

    try {
      await login({
        email,
        password: form.password,
        rememberMe: form.rememberMe,
      });

      navigate("/doctor/dashboard", {
        replace: true,
      });
    } catch (loginError) {
      console.error(
        "Doctor login failed:",
        loginError
      );

      setError(
        getErrorMessage(
          loginError,
          "Invalid doctor email or password."
        )
      );
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
        className="relative grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] lg:min-h-[680px] lg:grid-cols-[0.95fr_1.05fr]"
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
                <Stethoscope className="h-7 w-7" />

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
                  Doctor Portal
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
                Clinical workspace
              </p>

              <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
                Manage patient care with
                confidence.
              </h1>

              <p className="mt-5 max-w-sm text-sm leading-7 text-white/75">
                Access appointments, patient
                information, availability,
                medical history, and your
                professional profile through
                one secure doctor dashboard.
              </p>
            </div>

            <div className="mt-10 space-y-4">
              {[
                "Manage daily appointments",
                "Review patient information",
                "Control availability and profile",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3"
                >
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor:
                        "rgba(183, 207, 53, 0.2)",
                      color: "#DDF078",
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </div>

                  <span className="text-sm font-medium text-white/85">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-between border-t border-white/10 pt-6 text-xs text-white/55">
            <span>
              Secure doctor access
            </span>

            <span>HOKU Health Care</span>
          </div>
        </section>

        {/* Login form */}
        <section className="flex items-center px-5 py-7 sm:px-10 sm:py-10 lg:px-12 lg:py-12 xl:px-16">
          <div className="mx-auto w-full max-w-md">
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
                  <Stethoscope className="h-6 w-6" />

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
                    Doctor Portal
                  </p>
                </div>
              </div>
            </div>

            <header className="mb-8">
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

                Doctor access
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter your registered doctor
                credentials to access your HOKU
                dashboard.
              </p>
            </header>

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
              >
                <AlertCircle className="mt-1 h-4 w-4 shrink-0" />

                <span>{error}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="doctor-email"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="doctor-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={form.email}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="doctor@hokuhealth.com"
                    required
                    className={`${inputClassName} pr-4`}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <label
                    htmlFor="doctor-password"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-[#1E63C6] transition hover:text-[#174FA0] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="doctor-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Enter your password"
                    required
                    className={`${inputClassName} pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
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
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
                <input
                  name="rememberMe"
                  type="checkbox"
                  checked={form.rememberMe}
                  onChange={handleChange}
                  disabled={loading}
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#1E63C6] disabled:cursor-not-allowed"
                />

                <span>Remember me</span>
              </label>

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

                    Signing in...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />

                    Sign in to Doctor Portal
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-6">
              <p className="text-center text-sm text-slate-500">
                New doctor?{" "}
                <Link
                  to="/doctor/register"
                  className="font-semibold text-[#1E63C6] transition hover:text-[#174FA0] hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-slate-400">
              Access is restricted to
              registered and authorized HOKU
              doctors.
            </p>
          </div>
        </section>
      </motion.section>
    </main>
  );
}