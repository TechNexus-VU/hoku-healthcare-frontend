import { useState } from "react";

import {
  FaArrowRight,
  FaCheckCircle,
  FaEnvelope,
  FaLayerGroup,
  FaPhoneAlt,
  FaRegCommentDots,
  FaSpinner,
  FaUser,
} from "react-icons/fa";

import { toast } from "react-toastify";

const HOKU_PRIMARY = "#1E63C6";
const HOKU_PRIMARY_DARK = "#174FA0";

const initialForm = {
  firstName: "",
  secondName: "",
  email: "",
  phone: "",
  service: "",
  message: "",
};

const services = [
  "Home Health",
  "Palliative Care",
  "Hospice Care",
];

const inputClassName =
  "min-h-12 w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1E63C6] focus:ring-4 focus:ring-[#1E63C6]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

function getErrorMessage(
  error,
  fallback = "Unable to submit your message."
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
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required = false,
  disabled = false,
  icon: Icon,
}) {
  return (
    <div>
      <label
        htmlFor={`contact-${name}`}
        className="mb-1.5 block text-sm font-semibold text-slate-700"
      >
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <input
          id={`contact-${name}`}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          className={inputClassName}
        />
      </div>
    </div>
  );
}

const ContactForm = () => {
  const [formData, setFormData] =
    useState(initialForm);

  const [loading, setLoading] =
    useState(false);

  const [formError, setFormError] =
    useState("");

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setFormData((previousData) => ({
      ...previousData,
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
    if (!formData.firstName.trim()) {
      return showValidationError(
        "Please enter your first name."
      );
    }

    if (!formData.email.trim()) {
      return showValidationError(
        "Please enter your email address."
      );
    }

    if (!formData.phone.trim()) {
      return showValidationError(
        "Please enter your phone number."
      );
    }

    if (!formData.service) {
      return showValidationError(
        "Please select a healthcare service."
      );
    }

    if (!formData.message.trim()) {
      return showValidationError(
        "Please enter your message."
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

      const payload = {
        first_name:
          formData.firstName.trim(),

        second_name:
          formData.secondName.trim(),

        email: formData.email
          .trim()
          .toLowerCase(),

        phone: formData.phone.trim(),

        service: formData.service,

        message:
          formData.message.trim(),
      };

      // Replace this with the contact API later.
      // await submitContactForm(payload);

      console.log(
        "Contact form:",
        payload
      );

      toast.success(
        "Your message has been submitted."
      );

      setFormData(initialForm);
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
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)] sm:p-7 lg:p-8"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1E63C6]/10 text-[#1E63C6]">
          <FaRegCommentDots className="text-lg" />
        </div>

        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#61720E]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#B7CF35]" />
            Send a message
          </div>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Get in touch
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Complete the form and our
            healthcare support team will
            respond as soon as possible.
          </p>
        </div>
      </div>

      {formError && (
        <div
          role="alert"
          aria-live="polite"
          className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
        >
          <FaRegCommentDots className="mt-1 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField
          label="First name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="Enter first name"
          autoComplete="given-name"
          required
          disabled={loading}
          icon={FaUser}
        />

        <FormField
          label="Second name"
          name="secondName"
          value={formData.secondName}
          onChange={handleChange}
          placeholder="Enter second name"
          autoComplete="family-name"
          disabled={loading}
          icon={FaUser}
        />

        <FormField
          label="Email address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="patient@example.com"
          autoComplete="email"
          required
          disabled={loading}
          icon={FaEnvelope}
        />

        <FormField
          label="Phone number"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+92 300 1234567"
          autoComplete="tel"
          required
          disabled={loading}
          icon={FaPhoneAlt}
        />

        <div className="sm:col-span-2">
          <label
            htmlFor="contact-service"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Healthcare service
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <div className="relative">
            <FaLayerGroup className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <select
              id="contact-service"
              name="service"
              value={formData.service}
              onChange={handleChange}
              required
              disabled={loading}
              className="min-h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm text-slate-900 outline-none transition focus:border-[#1E63C6] focus:ring-4 focus:ring-[#1E63C6]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
            >
              <option value="">
                Select a service
              </option>

              {services.map((service) => (
                <option
                  key={service}
                  value={service}
                >
                  {service}
                </option>
              ))}
            </select>

            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              ▼
            </span>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="contact-message"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Message
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <div className="relative">
            <FaRegCommentDots className="pointer-events-none absolute left-3.5 top-4 h-4 w-4 text-slate-400" />

            <textarea
              id="contact-message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              disabled={loading}
              rows={5}
              placeholder="Tell us how our healthcare team can help..."
              className="min-h-36 w-full resize-y rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1E63C6] focus:ring-4 focus:ring-[#1E63C6]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#B7CF35]/20 text-[#61720E]">
          <FaCheckCircle className="text-sm" />
        </div>

        <p className="text-xs leading-5 text-slate-500">
          Your contact information will only
          be used to respond to your
          healthcare enquiry.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          backgroundColor: loading
            ? HOKU_PRIMARY_DARK
            : HOKU_PRIMARY,
        }}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl px-6 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#1E63C6]/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-48"
      >
        {loading ? (
          <>
            <FaSpinner className="animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            Submit message
            <FaArrowRight className="text-xs" />
          </>
        )}
      </button>
    </form>
  );
};

export default ContactForm;