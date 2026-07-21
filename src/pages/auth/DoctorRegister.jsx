import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { motion } from "framer-motion";

import {
  AlertCircle,
  Award,
  BriefcaseMedical,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Stethoscope,
  UserRound,
  WalletCards,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  registerDoctor,
} from "@/services/doctorApi";

const HOKU_PRIMARY = "#1E63C6";
const HOKU_PRIMARY_DARK = "#174FA0";
const HOKU_SECONDARY = "#B7CF35";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  specialty: "",
  qualification: "",
  experience: "",
  fee: "",
  hospital: "",
  address: "",
  license: "",
  biography: "",
};

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1E63C6] focus:ring-4 focus:ring-[#1E63C6]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

function getErrorMessage(
  error,
  fallback = "Unable to complete registration."
) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

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

function FieldIcon({ icon: Icon }) {
  return (
    <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
  );
}

export default function DoctorRegister() {
  const [form, setForm] =
    useState(initialForm);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [formError, setFormError] =
    useState("");

  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    if (
      name === "biography" &&
      value.length > 500
    ) {
      return;
    }

    setForm((currentForm) => ({
      ...currentForm,
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
    if (!form.fullName.trim()) {
      return showValidationError(
        "Please enter your full name."
      );
    }

    if (!form.email.trim()) {
      return showValidationError(
        "Please enter your email address."
      );
    }

    if (!form.phone.trim()) {
      return showValidationError(
        "Please enter your phone number."
      );
    }

    if (form.password.length < 8) {
      return showValidationError(
        "Password must contain at least 8 characters."
      );
    }

    if (!form.specialty.trim()) {
      return showValidationError(
        "Please enter your specialty."
      );
    }

    if (
      !form.qualification.trim()
    ) {
      return showValidationError(
        "Please enter your qualification."
      );
    }

    if (
      Number(form.experience) < 0
    ) {
      return showValidationError(
        "Experience cannot be negative."
      );
    }

    if (Number(form.fee) < 0) {
      return showValidationError(
        "Consultation fee cannot be negative."
      );
    }

    if (!form.hospital.trim()) {
      return showValidationError(
        "Please enter your hospital or clinic name."
      );
    }

    if (!form.address.trim()) {
      return showValidationError(
        "Please enter your clinic address."
      );
    }

    if (!form.license.trim()) {
      return showValidationError(
        "Please enter your medical license number."
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

    setSubmitting(true);
    setFormError("");

    try {
      const email = form.email
        .trim()
        .toLowerCase();

      const payload = {
        full_name:
          form.fullName.trim(),

        email,

        phone: form.phone.trim(),

        password: form.password,

        specialty:
          form.specialty.trim(),

        qualification:
          form.qualification.trim(),

        experience_years:
          Number(form.experience) || 0,

        consultation_fee:
          Number(form.fee) || 0,

        hospital:
          form.hospital.trim(),

        address:
          form.address.trim(),

        license_number:
          form.license.trim(),

        biography:
          form.biography.trim(),
      };

      const response =
        await registerDoctor(payload);

      toast.success(
        response?.data?.message ||
          "Doctor account created successfully. Please sign in."
      );

      setForm(initialForm);

      navigate("/doctor/login", {
        replace: true,

        state: {
          registeredEmail: email,
        },
      });
    } catch (error) {
      const message =
        getErrorMessage(error);

      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-dvh overflow-hidden bg-slate-50 px-4 py-6 font-['Inter'] sm:px-6 sm:py-8 lg:px-8">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-36 -top-36 h-96 w-96 rounded-full opacity-10 blur-3xl"
        style={{
          backgroundColor: HOKU_PRIMARY,
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-36 -right-36 h-96 w-96 rounded-full opacity-20 blur-3xl"
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
        className="relative mx-auto grid w-full max-w-7xl overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] lg:grid-cols-[0.8fr_1.2fr]"
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
            className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10 bg-white/5"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full border border-white/10 bg-white/5"
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

            <div className="mt-14">
              <p
                className="inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em]"
                style={{
                  backgroundColor:
                    "rgba(183, 207, 53, 0.18)",

                  color: "#EAF5A2",
                }}
              >
                Professional registration
              </p>

              <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
                Join the HOKU
                healthcare network.
              </h1>

              <p className="mt-5 max-w-sm text-sm leading-7 text-white/75">
                Create your professional
                doctor profile and manage
                appointments, availability,
                patient records, and clinical
                activity from one secure
                workspace.
              </p>
            </div>

            <div className="mt-10 space-y-4">
              {[
                "Secure professional profile",
                "Appointment and patient management",
                "Availability and consultation controls",
                "Verified healthcare access",
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

          <div className="relative border-t border-white/10 pt-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#DDF078]" />

              <p className="text-xs leading-5 text-white/60">
                Registration information
                may be reviewed before full
                doctor access is approved.
              </p>
            </div>
          </div>
        </section>

        {/* Registration form */}
        <section className="px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10 xl:px-12">
          <div className="mx-auto w-full max-w-3xl">
            {/* Mobile branding */}
            <div className="mb-7 lg:hidden">
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

                Doctor registration
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Create your professional
                account
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Complete your professional
                information to register with
                HOKU Health Care.
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
              className="space-y-7"
            >
              {/* Personal information */}
              <fieldset>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1E63C6]/10 text-[#1E63C6]">
                    <UserRound className="h-4 w-4" />
                  </div>

                  <div>
                    <legend className="text-sm font-bold text-slate-900">
                      Personal information
                    </legend>

                    <p className="text-xs text-slate-500">
                      Basic contact and login
                      details
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField
                    label="Full name"
                    required
                  >
                    <div className="relative">
                      <FieldIcon
                        icon={UserRound}
                      />

                      <input
                        type="text"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        autoComplete="name"
                        disabled={submitting}
                        placeholder="Dr. Maya Chen"
                        className={inputClassName}
                      />
                    </div>
                  </FormField>

                  <FormField
                    label="Email address"
                    required
                  >
                    <div className="relative">
                      <FieldIcon
                        icon={Mail}
                      />

                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="email"
                        autoCapitalize="none"
                        spellCheck={false}
                        disabled={submitting}
                        placeholder="doctor@hokuhealth.com"
                        className={inputClassName}
                      />
                    </div>
                  </FormField>

                  <FormField
                    label="Phone number"
                    required
                  >
                    <div className="relative">
                      <FieldIcon
                        icon={Phone}
                      />

                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        autoComplete="tel"
                        disabled={submitting}
                        placeholder="+92 300 1234567"
                        className={inputClassName}
                      />
                    </div>
                  </FormField>

                  <FormField
                    label="Password"
                    required
                  >
                    <div className="relative">
                      <FieldIcon
                        icon={LockKeyhole}
                      />

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
                        minLength={8}
                        disabled={submitting}
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
                        disabled={submitting}
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
                </div>
              </fieldset>

              <div className="border-t border-slate-100" />

              {/* Professional information */}
              <fieldset>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#B7CF35]/20 text-[#61720E]">
                    <BriefcaseMedical className="h-4 w-4" />
                  </div>

                  <div>
                    <legend className="text-sm font-bold text-slate-900">
                      Professional details
                    </legend>

                    <p className="text-xs text-slate-500">
                      Medical qualification and
                      practice information
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField
                    label="Specialty"
                    required
                  >
                    <div className="relative">
                      <FieldIcon
                        icon={Stethoscope}
                      />

                      <input
                        type="text"
                        name="specialty"
                        value={form.specialty}
                        onChange={handleChange}
                        disabled={submitting}
                        placeholder="Cardiology"
                        className={inputClassName}
                      />
                    </div>
                  </FormField>

                  <FormField
                    label="Qualification"
                    required
                  >
                    <div className="relative">
                      <FieldIcon
                        icon={GraduationCap}
                      />

                      <input
                        type="text"
                        name="qualification"
                        value={form.qualification}
                        onChange={handleChange}
                        disabled={submitting}
                        placeholder="MBBS, FCPS"
                        className={inputClassName}
                      />
                    </div>
                  </FormField>

                  <FormField
                    label="Experience (years)"
                    required
                  >
                    <div className="relative">
                      <FieldIcon
                        icon={Award}
                      />

                      <input
                        type="number"
                        name="experience"
                        value={form.experience}
                        onChange={handleChange}
                        min="0"
                        disabled={submitting}
                        placeholder="5"
                        className={inputClassName}
                      />
                    </div>
                  </FormField>

                  <FormField
                    label="Consultation fee"
                    required
                  >
                    <div className="relative">
                      <FieldIcon
                        icon={WalletCards}
                      />

                      <input
                        type="number"
                        name="fee"
                        value={form.fee}
                        onChange={handleChange}
                        min="0"
                        disabled={submitting}
                        placeholder="3000"
                        className={inputClassName}
                      />
                    </div>
                  </FormField>

                  <FormField
                    label="Hospital or clinic"
                    required
                  >
                    <div className="relative">
                      <FieldIcon
                        icon={Building2}
                      />

                      <input
                        type="text"
                        name="hospital"
                        value={form.hospital}
                        onChange={handleChange}
                        disabled={submitting}
                        placeholder="Hospital or clinic name"
                        className={inputClassName}
                      />
                    </div>
                  </FormField>

                  <FormField
                    label="License number"
                    required
                  >
                    <div className="relative">
                      <FieldIcon
                        icon={ShieldCheck}
                      />

                      <input
                        type="text"
                        name="license"
                        value={form.license}
                        onChange={handleChange}
                        disabled={submitting}
                        placeholder="Medical license number"
                        className={inputClassName}
                      />
                    </div>
                  </FormField>

                  <div className="sm:col-span-2">
                    <FormField
                      label="Clinic address"
                      required
                    >
                      <div className="relative">
                        <FieldIcon
                          icon={MapPin}
                        />

                        <input
                          type="text"
                          name="address"
                          value={form.address}
                          onChange={handleChange}
                          autoComplete="street-address"
                          disabled={submitting}
                          placeholder="Enter complete clinic address"
                          className={inputClassName}
                        />
                      </div>
                    </FormField>
                  </div>
                </div>
              </fieldset>

              <div className="border-t border-slate-100" />

              {/* Biography */}
              <fieldset>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <UserRound className="h-4 w-4" />
                  </div>

                  <div>
                    <legend className="text-sm font-bold text-slate-900">
                      Professional biography
                    </legend>

                    <p className="text-xs text-slate-500">
                      Briefly introduce your
                      experience and expertise
                    </p>
                  </div>
                </div>

                <textarea
                  name="biography"
                  value={form.biography}
                  onChange={handleChange}
                  placeholder="Write a brief professional biography..."
                  rows={5}
                  maxLength={500}
                  disabled={submitting}
                  className="min-h-32 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1E63C6] focus:ring-4 focus:ring-[#1E63C6]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                />

                <div className="mt-1.5 flex items-center justify-between gap-3 text-xs text-slate-400">
                  <span>
                    Maximum 500 characters
                  </span>

                  <span
                    className={
                      form.biography.length >=
                      450
                        ? "font-semibold text-amber-600"
                        : ""
                    }
                  >
                    {form.biography.length}/500
                  </span>
                </div>
              </fieldset>

              <div className="border-t border-slate-100 pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    backgroundColor:
                      submitting
                        ? HOKU_PRIMARY_DARK
                        : HOKU_PRIMARY,
                  }}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#1E63C6]/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-48"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />

                      Creating account...
                    </>
                  ) : (
                    <>
                      <Stethoscope className="h-4 w-4" />

                      Create doctor account
                    </>
                  )}
                </button>

                <p className="mt-5 text-sm text-slate-500 sm:inline-block sm:pl-5">
                  Already have an account?{" "}
                  <Link
                    to="/doctor/login"
                    className="font-semibold text-[#1E63C6] transition hover:text-[#174FA0] hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </section>
      </motion.section>
    </main>
  );
}