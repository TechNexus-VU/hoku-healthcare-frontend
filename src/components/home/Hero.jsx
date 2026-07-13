import { Link } from "react-router-dom";
import hero_doctor_patient from "@/assets/hero_doctor_patient.png";

const Hero = () => {
  const specialists = [
    "Child Specialist",
    "Gynecologist",
    "Dental Specialist",
    "Dermatologist",
  ];

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto grid min-h-[620px] max-w-[1280px] grid-cols-1 items-center px-5 pb-24 pt-12 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:px-12 lg:pb-28 lg:pt-4">
        {/* Left content */}
        <div className="relative z-20 order-2 pt-10 lg:order-1 lg:pt-0">
          {/* Script heading */}
          <p className="font-script text-[42px] leading-none text-[var(--heading)] sm:text-[50px] lg:text-[58px]">
            We take
          </p>

          {/* Main heading */}
          <h1 className="mt-2 max-w-[510px] font-heading text-[44px] font-extrabold uppercase leading-[0.92] tracking-[-0.045em] text-[var(--heading)] sm:text-[58px] lg:text-[68px]">
            Care{" "}
            <span className="text-[var(--primary)]">
              of your
            </span>
            <br />
            health
          </h1>

          {/* Specialist label */}
          <h2 className="mt-5 font-heading text-[21px] font-extrabold uppercase tracking-[-0.02em] text-[var(--primary)] sm:text-[24px]">
            Our Specialist
          </h2>

          {/* Specialist list */}
          <div className="mt-3 grid max-w-[390px] grid-cols-1 gap-x-7 gap-y-2 sm:grid-cols-2">
            {specialists.map((specialist) => (
              <div
                key={specialist}
                className="flex items-center gap-2 font-body text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--body)]"
              >
                <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-[var(--primary)]" />
                {specialist}
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            to="/services"
            className="mt-7 inline-flex min-h-[44px] items-center justify-center rounded-[7px] bg-[var(--primary)] px-7 font-body text-[11px] font-bold uppercase tracking-[0.06em] text-white shadow-[var(--shadow-button)] transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--primary-hover)]"
          >
            Get Started
          </Link>
        </div>

        {/* Right visual */}
        <div className="relative order-1 min-h-[370px] lg:order-2 lg:min-h-[570px]">
          {/* Soft background */}
          <div className="absolute inset-x-0 top-2 h-[88%] overflow-hidden rounded-tl-[10px] bg-gradient-to-br from-[#f7f8f7] via-[#eef1ef] to-[#dfe6e2] lg:left-5">
            {/* Health Service label */}
            <div className="absolute left-1/2 top-7 z-20 w-[78%] -translate-x-1/2 rounded-[10px] border border-white/70 bg-white/30 px-5 py-4 text-center backdrop-blur-[2px]">
              <p className="font-heading text-[13px] font-semibold uppercase tracking-[0.55em] text-[var(--primary)] sm:text-[15px]">
                Health Service
              </p>
            </div>

            {/* Subtle vertical accent */}
            <div className="absolute left-0 top-0 h-full w-[6px] bg-gradient-to-b from-[#3c5b7e] via-[#8293a6] to-transparent opacity-70" />
          </div>

          {/* Hero image */}
          <img
            src={hero_doctor_patient}
            alt="Healthcare professional checking a senior patient"
            className="absolute bottom-0 left-1/2 z-10 h-[360px] w-full max-w-[610px] -translate-x-1/2 object-contain object-bottom sm:h-[440px] lg:left-[52%] lg:h-[535px]"
          />
        </div>
      </div>

      {/* Curved wave */}
      <div className="pointer-events-none absolute bottom-0 left-0 z-30 w-full">
        <svg
          viewBox="0 0 1440 145"
          preserveAspectRatio="none"
          className="block h-[90px] w-full sm:h-[105px] lg:h-[125px]"
          aria-hidden="true"
        >
          {/* White cover */}
          <path
            d="M0,45 C300,110 700,132 1040,76 C1210,47 1335,20 1440,5 L1440,145 L0,145 Z"
            fill="#ffffff"
          />

          {/* Green wave */}
          <path
            d="M0,36 C320,110 690,124 1030,69 C1215,39 1338,10 1440,0 L1440,25 C1315,44 1192,72 1030,98 C675,154 300,129 0,57 Z"
            fill="var(--secondary)"
          />

          {/* Blue wave */}
          <path
            d="M0,29 C335,94 690,110 1025,58 C1197,31 1325,6 1440,0 L1440,13 C1310,33 1185,59 1028,84 C688,138 318,118 0,45 Z"
            fill="var(--primary)"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;