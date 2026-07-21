import React, {
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
} from "lucide-react";

import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  extractLoginData,
  getAdminToken,
  isAdminRole,
  loginAdmin,
  saveAdminAuthentication,
} from "@/services/adminAuthApi";

const HOKU_PRIMARY = "#1E63C6";
const HOKU_PRIMARY_DARK = "#174FA0";
const HOKU_SECONDARY = "#B7CF35";

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

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1E63C6] focus:ring-4 focus:ring-[#1E63C6]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const existingAdminToken =
    getAdminToken();

  const redirectPath =
    location.state?.from?.pathname ||
    "/admin/dashboard";

  useEffect(() => {
    setError("");
  }, [form.email, form.password]);

  if (existingAdminToken) {
    return (
      <Navigate
        to="/admin/dashboard"
        replace
      />
    );
  }

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
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

    setLoading(true);
    setError("");

    try {
      const response = await loginAdmin({
        email,
        password: form.password,
      });

      const { token, user } =
        extractLoginData(response);

      if (!token) {
        throw new Error(
          "The login response did not include an access token."
        );
      }

      if (!user) {
        throw new Error(
          "The login response did not include the user information."
        );
      }

      if (!isAdminRole(user.role)) {
        throw new Error(
          "This account does not have Admin access."
        );
      }

      saveAdminAuthentication(
        token,
        user
      );

      navigate(redirectPath, {
        replace: true,
      });
    } catch (loginError) {
      setError(
        getErrorMessage(
          loginError,
          "Invalid Admin email or password."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-slate-50 px-4 py-8 font-['Inter'] sm:px-6 sm:py-10 lg:px-8">
      {/* Page decoration */}
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

      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] lg:min-h-[680px] lg:grid-cols-[0.95fr_1.05fr]">
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
                <ShieldCheck className="h-7 w-7" />

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
                  Health Care
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
                Admin Portal
              </p>

              <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
                Secure healthcare
                management in one place.
              </h1>

              <p className="mt-5 max-w-sm text-sm leading-7 text-white/75">
                Manage doctors, patients,
                appointments, services,
                medication reminders, reviews,
                and platform activity from one
                secure dashboard.
              </p>
            </div>

            <div className="mt-10 space-y-4">
              {[
                "Centralized platform management",
                "Protected administrator access",
                "Responsive operational dashboard",
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
              Authorized staff access only
            </span>

            <span>HOKU Admin</span>
          </div>
        </section>

        {/* Login form */}
        <section className="flex items-center px-5 py-7 sm:px-10 sm:py-10 lg:px-12 lg:py-12 xl:px-16">
          <div className="mx-auto w-full max-w-md">
            {/* Mobile branding */}
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div
                  className="relative flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm"
                  style={{
                    backgroundColor:
                      HOKU_PRIMARY,
                  }}
                >
                  <ShieldCheck className="h-6 w-6" />

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
                    Admin Portal
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

                Secure access
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter your administrator
                credentials to access the HOKU
                management dashboard.
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
                  htmlFor="admin-email"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="admin-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={form.email}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="admin@hoku.com"
                    required
                    className={`${inputClassName} pr-4`}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="admin-password"
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

                    Sign in to Admin Portal
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5">
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor:
                      "rgba(183, 207, 53, 0.2)",
                    color: "#61720E",
                  }}
                >
                  <ShieldCheck className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-700">
                    Mock Admin account
                  </p>

                  <div className="mt-1.5 space-y-0.5 text-xs text-slate-500">
                    <p>
                      Email:{" "}
                      <span className="font-semibold text-slate-700">
                        admin@hoku.com
                      </span>
                    </p>

                    <p>
                      Password:{" "}
                      <span className="font-semibold text-slate-700">
                        admin123
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-slate-400">
              This area is restricted to
              authorized HOKU Health Care
              administrators.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}