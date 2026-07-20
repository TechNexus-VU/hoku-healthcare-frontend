import React, { useEffect, useState } from "react";
import {
  AlertCircle,
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

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  const existingAdminToken = getAdminToken();

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
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
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

      saveAdminAuthentication(token, user);

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
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5] px-4 py-10 font-['Inter']">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.12)] lg:grid-cols-[0.9fr_1.1fr]">
        {/* Branding section */}
        <div className="hidden bg-[#1B5E20] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
              <ShieldCheck className="h-7 w-7" />
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
              Hoku Health Care
            </p>

            <h1 className="mt-3 font-['Poppins'] text-4xl font-bold leading-tight">
              Secure Admin Management
            </h1>

            <p className="mt-4 max-w-sm text-sm leading-6 text-white/75">
              Manage doctors, patients,
              appointments, services, reminders,
              reviews, and platform activity from
              one dashboard.
            </p>
          </div>

          <p className="text-xs text-white/60">
            Authorized staff access only
          </p>
        </div>

        {/* Login form */}
        <div className="p-6 sm:p-10 lg:p-12">
          <div className="mx-auto max-w-md">
            <div className="mb-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32] lg:hidden">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <p className="text-xs font-semibold uppercase tracking-widest text-[#2E7D32]">
                Hoku Health Care
              </p>

              <h2 className="mt-2 font-['Poppins'] text-2xl font-bold text-[#1A1A2E] sm:text-3xl">
                Admin Login
              </h2>

              <p className="mt-2 text-sm text-[#6B7280]">
                Enter your Admin credentials to
                continue.
              </p>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
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
                  className="mb-1.5 block text-sm font-medium text-[#1A1A2E]"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />

                  <input
                    id="admin-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="admin@hoku.com"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-[#1A1A2E] outline-none transition placeholder:text-gray-400 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="mb-1.5 block text-sm font-medium text-[#1A1A2E]"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />

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
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-11 text-sm text-[#1A1A2E] outline-none transition placeholder:text-gray-400 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 disabled:cursor-not-allowed disabled:bg-gray-50"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-[#6B7280] hover:bg-gray-100"
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
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2E7D32] py-3 text-sm font-semibold text-white transition hover:bg-[#1B5E20] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Sign In to Admin
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 rounded-xl bg-[#F5F5F5] px-4 py-3 text-xs text-[#6B7280]">
              <p className="font-semibold text-[#1A1A2E]">
                Mock Admin account
              </p>

              <p className="mt-1">
                Email: admin@hoku.com
              </p>

              <p>Password: admin123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}