import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
} from "react-icons/fa";

import availabilityBg from "@/assets/availability-bg.png";

import PageContainer from "@/components/common/PageContainer";

const contactItems = [
  {
    id: 1,
    icon: FaPhoneAlt,
    text: "512-258-789",
    href: "tel:512258789",
    external: false,
  },
  {
    id: 2,
    icon: FaEnvelope,
    text: "www.hokuhealth.com",
    href: "https://www.hokuhealth.com",
    external: true,
  },
  {
    id: 3,
    icon: FaMapMarkerAlt,
    text: "7537 Wiza Valley Missouri",
    href: "#contact",
    external: false,
  },
];

const AvailabilitySection = () => {
  return (
    <section
      id="availability"
      className="relative w-full overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${availabilityBg})`,
      }}
    >
      {/* Primary overlay */}
      <div className="absolute inset-0 bg-[var(--primary)]/85" />

      {/* Readability overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />

      {/* Decorative lighting */}
      <div className="pointer-events-none absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />

      <PageContainer className="relative z-10">
        <div className="flex min-h-[320px] flex-col items-center justify-center py-14 text-center sm:min-h-[350px] sm:py-16 lg:min-h-[380px] lg:py-20">
          {/* Section label */}
          <p className="font-body text-xs font-bold uppercase tracking-[0.2em] text-[var(--secondary)] sm:text-sm">
            Always Here for You
          </p>

          {/* Heading */}
          <h2 className="mt-3 max-w-[820px] font-heading text-2xl font-extrabold uppercase leading-[1.25] text-white sm:text-3xl lg:text-[36px]">
            We Are Available 24/7 to Cater for Your
            <span className="block">
              Home Healthcare Needs
            </span>
          </h2>

          <p className="mt-4 max-w-2xl font-body text-sm leading-7 text-white/85 sm:text-[15px]">
            Contact our healthcare team at any time for professional,
            compassionate, and dependable support.
          </p>

          {/* Contact panel */}
          <div className="mt-8 grid w-full max-w-[850px] grid-cols-1 overflow-hidden rounded-2xl border border-white/20 bg-white shadow-[0_14px_36px_rgba(0,0,0,0.2)] sm:grid-cols-3">
            {contactItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.id}
                  href={item.href}
                  target={
                    item.external
                      ? "_blank"
                      : undefined
                  }
                  rel={
                    item.external
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className={`group flex min-h-[82px] items-center justify-start gap-3 px-5 py-4 text-left transition duration-300 hover:bg-[var(--primary-light)] sm:justify-center sm:px-4 ${
                    index > 0
                      ? "border-t border-[var(--border)] sm:border-l sm:border-t-0"
                      : ""
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-sm text-white transition duration-300 group-hover:scale-105 group-hover:bg-[var(--primary-hover)]">
                    <Icon />
                  </span>

                  <span className="break-words font-body text-xs font-semibold uppercase leading-5 tracking-[0.02em] text-[var(--heading)] transition-colors duration-300 group-hover:text-[var(--primary)]">
                    {item.text}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </PageContainer>
    </section>
  );
};

export default AvailabilitySection;