import {
  FaArrowRight,
  FaCheck,
  FaClock,
  FaHeart,
  FaPhoneAlt,
  FaShieldAlt,
  FaUserMd,
} from "react-icons/fa";

import { Link } from "react-router-dom";

import PageContainer from "@/components/common/PageContainer";
import ServiceCard from "@/components/services/ServiceCard";
import ServicesData from "@/data/ServicesData";

const HOKU_PRIMARY = "#1E63C6";
const HOKU_PRIMARY_DARK = "#174FA0";
const HOKU_SECONDARY = "#B7CF35";

const benefits = [
  {
    number: "01",
    icon: FaUserMd,
    title: "Experienced Professionals",
    text: "Qualified healthcare specialists committed to providing safe, reliable, and respectful patient care.",
  },
  {
    number: "02",
    icon: FaHeart,
    title: "Personalized Care Plans",
    text: "Every care plan is developed around the patient’s condition, preferences, comfort, and personal needs.",
  },
  {
    number: "03",
    icon: FaClock,
    title: "Available When Needed",
    text: "Our healthcare team is available to support patients and families whenever care is required.",
  },
  {
    number: "04",
    icon: FaShieldAlt,
    title: "Safe and Compassionate",
    text: "We deliver dependable physical, emotional, and family-centered support with dignity and compassion.",
  },
];

const serviceHighlights = [
  "Patient-centered support",
  "Qualified healthcare professionals",
  "Flexible care options",
];

const Services = () => {
  const activeServices = ServicesData.filter(
    (service) => service.status === "active"
  );

  return (
    <main className="overflow-hidden bg-[#FCFCFD] font-['Inter']">
      {/* Hero banner */}
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

              Our Healthcare Services
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Compassionate care for every stage of life
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/75 sm:text-lg">
              Explore professional healthcare services designed to provide
              comfort, dignity, personalized support, and a better quality of
              life for patients and their families.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
              {serviceHighlights.map((item) => (
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

              <span className="text-[#DDF078]">Services</span>
            </nav>
          </div>
        </PageContainer>
      </section>

      {/* Services */}
      <section className="bg-[#FCFCFD] py-16 sm:py-20 lg:py-24">
        <PageContainer>
          <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-14">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#1E63C6]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#1E63C6] sm:text-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B7CF35]" />

              What We Offer
            </div>

            <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Healthcare services tailored to your needs
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-500 sm:text-lg">
              Our experienced healthcare professionals provide dependable,
              respectful, and personalized support in a safe and comfortable
              environment.
            </p>
          </div>

          {activeServices.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {activeServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-14 text-center shadow-sm sm:py-16">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1E63C6]/10 text-[#1E63C6]">
                <FaHeart className="text-xl" />
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900 sm:text-2xl">
                No services are currently available
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500 sm:text-base">
                Please check again later or contact our healthcare team for
                assistance with your care requirements.
              </p>

              <Link
                to="/contact"
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1E63C6] px-5 text-sm font-semibold text-white transition hover:bg-[#174FA0]"
              >
                Contact our team
                <FaArrowRight className="text-xs" />
              </Link>
            </div>
          )}
        </PageContainer>
      </section>

      {/* Why choose HOKU */}
      <section className="border-y border-slate-100 bg-white py-16 sm:py-20 lg:py-24">
        <PageContainer>
          <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div className="lg:sticky lg:top-28">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#B7CF35]/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#61720E] sm:text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8DAA18]" />

                Why Choose HOKU
              </div>

              <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Trusted healthcare delivered with compassion
              </h2>

              <p className="mt-6 text-base leading-8 text-slate-500 sm:text-lg">
                We provide patient-centered care that supports comfort,
                emotional well-being, independence, and dignity throughout
                every stage of the care journey.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/appointment"
                  style={{
                    backgroundColor: HOKU_PRIMARY,
                  }}
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl px-6 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 hover:shadow-md"
                >
                  Book an Appointment
                  <FaArrowRight className="text-xs" />
                </Link>

                <Link
                  to="/contact"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-[#1E63C6]/30 hover:bg-[#1E63C6]/5 hover:text-[#1E63C6]"
                >
                  Ask a Question
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {benefits.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.number}
                    className="group rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#1E63C6]/20 hover:shadow-lg sm:p-7"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1E63C6]/10 text-[#1E63C6] transition group-hover:bg-[#1E63C6] group-hover:text-white">
                        <Icon className="text-lg" />
                      </div>

                      <span className="text-3xl font-bold text-[#B7CF35]/60">
                        {item.number}
                      </span>
                    </div>

                    <h3 className="mt-6 text-xl font-bold text-slate-900">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
                      {item.text}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </PageContainer>
      </section>

      {/* CTA */}
      <section className="bg-[#FCFCFD] py-16 sm:py-20 lg:py-24">
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
                <FaPhoneAlt className="text-xl" />
              </div>

              <h2 className="mt-6 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                Need help choosing the right service?
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
                Speak with our healthcare team to discuss your needs and
                identify the most suitable care option for you or your loved
                one.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  to="/contact"
                  style={{
                    backgroundColor: HOKU_SECONDARY,
                  }}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl px-7 text-sm font-bold text-[#243000] transition hover:opacity-90 sm:w-auto"
                >
                  Contact Our Team
                  <FaArrowRight className="text-xs" />
                </Link>

                <a
                  href="tel:+1234567890"
                  className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/35 bg-white/5 px-7 text-sm font-semibold text-white transition hover:bg-white hover:text-[#1E63C6] sm:w-auto"
                >
                  <FaPhoneAlt className="text-sm" />
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

export default Services;