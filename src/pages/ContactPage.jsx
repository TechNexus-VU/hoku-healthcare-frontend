import {
  FaArrowRight,
  FaCheck,
  FaClock,
  FaEnvelope,
  FaHeart,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaShieldAlt,
} from "react-icons/fa";

import { Link } from "react-router-dom";

import PageContainer from "@/components/common/PageContainer";
import ContactForm from "@/components/contact/ContactForm";
import ContactInfo from "@/components/contact/ContactInfo";
import ContactMap from "@/components/contact/ContactMap";

const HOKU_PRIMARY = "#1E63C6";
const HOKU_SECONDARY = "#B7CF35";

const supportHighlights = [
  "Home healthcare support",
  "Appointment assistance",
  "Professional guidance",
];

const Contact = () => {
  return (
    <main className="overflow-hidden bg-[#FCFCFD] font-['Inter']">
      {/* Page banner */}
      <section
        className="relative overflow-hidden py-20 text-white sm:py-24 lg:py-28"
        style={{
          background:
            "linear-gradient(135deg, #1E63C6 0%, #174FA0 58%, #123E7D 100%)",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-28 h-80 w-80 rounded-full border border-white/10 bg-white/5"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-36 right-[-70px] h-96 w-96 rounded-full border border-white/10 bg-[#B7CF35]/15"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl"
        />

        <PageContainer className="relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm sm:text-sm">
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: HOKU_SECONDARY,
                }}
              />

              Contact HOKU
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              We are here to support your healthcare needs
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/75 sm:text-lg">
              Contact our healthcare team for service information,
              appointments, home care support, or general assistance.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {supportHighlights.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-sm font-medium text-white/85"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#B7CF35]/20 text-[#E5F48B]">
                    <FaCheck className="text-[10px]" />
                  </span>

                  {item}
                </div>
              ))}
            </div>

            <nav
              aria-label="Breadcrumb"
              className="mt-10 flex items-center justify-center gap-3 text-sm font-medium"
            >
              <Link
                to="/"
                className="text-white/70 transition hover:text-white"
              >
                Home
              </Link>

              <span className="text-white/35">/</span>

              <span className="text-[#DDF078]">Contact</span>
            </nav>
          </div>
        </PageContainer>
      </section>

      {/* Contact information */}
      <section className="bg-[#FCFCFD] py-16 sm:py-20 lg:py-24">
        <PageContainer>
          <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-14">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#1E63C6]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#1E63C6] sm:text-sm">
              <FaPhoneAlt className="text-xs" />

              Contact Information
            </div>

            <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Connect with our healthcare team
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-500 sm:text-lg">
              Our support team is available to answer your questions and help
              you select the most suitable healthcare service.
            </p>
          </div>

          <ContactInfo />
        </PageContainer>
      </section>

      {/* Contact form */}
      <section className="border-y border-slate-100 bg-white py-16 sm:py-20 lg:py-24">
        <PageContainer>
          <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div className="lg:sticky lg:top-28">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#B7CF35]/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#61720E] sm:text-sm">
                <FaClock className="text-xs" />

                Available 24/7
              </div>

              <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Let us know how we can help
              </h2>

              <p className="mt-6 text-base leading-8 text-slate-500 sm:text-lg">
                Whether you need home healthcare, palliative support, hospice
                services, or assistance booking an appointment, our team is
                ready to guide you.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  {
                    icon: FaShieldAlt,
                    text: "Private and secure communication",
                  },
                  {
                    icon: FaHeart,
                    text: "Compassionate healthcare guidance",
                  },
                  {
                    icon: FaEnvelope,
                    text: "Prompt response from our support team",
                  },
                ].map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-3 text-sm font-medium text-slate-600"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#1E63C6]/10 text-[#1E63C6]">
                      <Icon className="text-xs" />
                    </span>

                    {text}
                  </div>
                ))}
              </div>

              {/* Working hours */}
              <div className="mt-8 rounded-[24px] border border-[#1E63C6]/10 bg-[#1E63C6]/5 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1E63C6] text-white">
                    <FaClock />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Working hours
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Healthcare assistance throughout the week
                    </p>
                  </div>
                </div>

                <div className="mt-5 divide-y divide-slate-200/80 text-sm">
                  <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
                    <span className="text-slate-500">Monday – Friday</span>

                    <span className="font-bold text-slate-900">
                      24 Hours
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-3 last:pb-0">
                    <span className="text-slate-500">Saturday – Sunday</span>

                    <span className="font-bold text-slate-900">
                      24 Hours
                    </span>
                  </div>
                </div>
              </div>

              <a
                href="tel:+1234567890"
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-[#1E63C6]/30 hover:bg-[#1E63C6]/5 hover:text-[#1E63C6] sm:w-auto"
              >
                <FaPhoneAlt className="text-xs" />
                Call our support team
              </a>
            </div>

            <ContactForm />
          </div>
        </PageContainer>
      </section>

      {/* Map */}
      <section className="bg-[#FCFCFD] py-16 sm:py-20 lg:py-24">
        <PageContainer>
          <div className="mb-10 flex flex-col gap-6 sm:mb-12 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#1E63C6]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#1E63C6] sm:text-sm">
                <FaMapMarkerAlt className="text-xs" />

                Our Location
              </div>

              <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Find HOKU Health Care
              </h2>

              <p className="mt-4 text-base leading-8 text-slate-500">
                Visit our healthcare location or use the map to plan your
                journey to our facility.
              </p>
            </div>

            <Link
              to="/appointment"
              style={{
                backgroundColor: HOKU_PRIMARY,
              }}
              className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl px-6 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 hover:shadow-md sm:w-auto"
            >
              Book an Appointment
              <FaArrowRight className="text-xs" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
            <ContactMap />
          </div>
        </PageContainer>
      </section>

      {/* Bottom CTA */}
      <section className="bg-white pb-16 sm:pb-20 lg:pb-24">
        <PageContainer>
          <div
            className="relative overflow-hidden rounded-[28px] px-6 py-12 text-center text-white shadow-[0_20px_60px_rgba(30,99,198,0.18)] sm:px-10 sm:py-16 lg:px-16"
            style={{
              background:
                "linear-gradient(135deg, #1E63C6 0%, #174FA0 65%, #123E7D 100%)",
            }}
          >
            <div
              aria-hidden="true"
              className="absolute -left-20 -top-20 h-60 w-60 rounded-full border border-white/10 bg-white/5"
            />

            <div
              aria-hidden="true"
              className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-[#B7CF35]/15"
            />

            <div className="relative mx-auto max-w-3xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[#DDF078] backdrop-blur">
                <FaHeart className="text-xl" />
              </div>

              <h2 className="mt-6 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                Ready to discuss your healthcare needs?
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
                Our team will help you understand your options and connect you
                with the right healthcare support.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  to="/appointment"
                  style={{
                    backgroundColor: HOKU_SECONDARY,
                  }}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl px-7 text-sm font-bold text-[#243000] transition hover:opacity-90 sm:w-auto"
                >
                  Book an Appointment
                  <FaArrowRight className="text-xs" />
                </Link>

                <a
                  href="tel:+1234567890"
                  className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/35 bg-white/5 px-7 text-sm font-semibold text-white transition hover:bg-white hover:text-[#1E63C6] sm:w-auto"
                >
                  <FaPhoneAlt className="text-xs" />
                  Call Us Now
                </a>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>
    </main>
  );
};

export default Contact;