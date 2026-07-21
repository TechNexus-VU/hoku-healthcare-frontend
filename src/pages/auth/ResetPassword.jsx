import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

import Input from "../../components/doctor/Input";
import Button from "../../components/doctor/Button";

const initialForm = {
  otp: "",
  password: "",
  confirmPassword: "",
};

export default function ResetPassword() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!form.otp.trim()) {
      toast.error("Please enter the OTP.");
      return false;
    }

    if (form.otp.trim().length < 4) {
      toast.error("Please enter a valid OTP.");
      return false;
    }

    if (!form.password || !form.confirmPassword) {
      toast.error("Please enter and confirm your new password.");
      return false;
    }

    if (form.password.length < 8) {
      toast.error("Password must contain at least 8 characters.");
      return false;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const resetPasswordData = {
        otp: form.otp.trim(),
        password: form.password,
      };

      // Replace this with the reset-password API.
      // await resetPassword(resetPasswordData);

      console.log("Reset password data:", resetPasswordData);

      toast.success("Your password has been reset successfully.");

      setForm(initialForm);

      navigate("/patient/login", {
        replace: true,
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Unable to reset your password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md rounded-[32px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8"
      >
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
            HOKU Health Care
          </p>

          <h1 className="text-3xl font-bold text-[var(--heading)]">
            Reset Password
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--body)]">
            Enter the OTP sent to your email and create a secure new password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="One-Time Password"
            name="otp"
            type="text"
            inputMode="numeric"
            placeholder="Enter OTP"
            value={form.otp}
            onChange={handleChange}
            autoComplete="one-time-code"
            maxLength={6}
            required
          />

          <Input
            label="New Password"
            name="password"
            type="password"
            placeholder="Minimum 8 characters"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />

          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter your new password"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-[var(--body)]">
          Remember your password?{" "}
          <Link
            to="/patient/login"
            className="font-semibold text-[var(--primary)] transition hover:text-[var(--primary-hover)] hover:underline"
          >
            Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}