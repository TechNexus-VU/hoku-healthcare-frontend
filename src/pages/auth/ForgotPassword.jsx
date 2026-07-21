import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

import Input from "../../components/doctor/Input";
import Button from "../../components/doctor/Button";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }

    try {
      setLoading(true);

      // TODO:
      // await forgotPassword(email);

      toast.success("OTP has been sent to your email.");
    } catch (error) {
      toast.error("Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--section)] px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md rounded-[32px] border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-soft)]"
      >
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-[var(--heading)]">
            Forgot Password
          </h2>

          <p className="mt-2 text-sm text-[var(--body)]">
            Enter your registered email address to receive a One-Time Password
            (OTP).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-[var(--body)]">
          Remember your password?{" "}
          <Link
            to="/doctor/login"
            className="font-semibold text-[var(--primary)] transition hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}