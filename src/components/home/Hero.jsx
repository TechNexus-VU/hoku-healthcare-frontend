import { Link } from "react-router-dom";

import hokudoctorpatient from "@/assets/hoku-doctor-patient.png";
import PageContainer from "@/components/common/PageContainer";

const specialists = [
  "Child Specialist",
  "Gynecologist",
  "Dental Specialist",
  "Dermatologist",
];

const Hero = () => {
  return (
    <section className="relative isolate w-full overflow-hidden bg-white">
      <PageContainer
        className="
          grid min-h-[680px] grid-cols-1 items-center
          gap-8 pb-32 pt-10
          sm:min-h-[760px] sm:gap-10 sm:pb-36 sm:pt-14
          lg:min-h-[720px] lg:grid-cols-[0.85fr_1.15fr]
          lg:gap-5 lg:pb-32 lg:pt-0
        "
      >
        {/* Left content */}
        <div className="relative z-30 order-1 flex items-center lg:min-h-[650px]">
          <div className="w-full max-w-[570px]">
            {/* Script heading */}
            <p
              className="
                font-script text-[44px] leading-[0.85]
                text-[var(--heading)]
                sm:text-[56px]
                lg:text-[64px]
                xl:text-[68px]
              "
            >
              We take
            </p>

            {/* Main heading */}
            <h1 className="mt-3 uppercase">
              <span className="flex flex-wrap items-end gap-x-2 leading-none">
                <span
                  className="
                    font-heading text-[32px] font-black
                    text-[var(--heading)]
                    sm:text-[40px]
                    lg:text-[44px]
                    xl:text-[48px]
                  "
                >
                  Care
                </span>

                <span
                  className="
                    font-heading text-[42px] font-black
                    tracking-[-0.04em] text-[var(--primary)]
                    sm:text-[52px]
                    lg:text-[55px]
                    xl:text-[59px]
                  "
                >
                  Of Your
                </span>
              </span>

              <span
                className="
                  mt-1 block font-heading text-[64px]
                  font-black leading-[0.84]
                  tracking-[-0.055em] text-[var(--heading)]
                  sm:text-[82px]
                  lg:text-[91px]
                  xl:text-[102px]
                "
              >
                Health
              </span>
            </h1>

            {/* Supporting text */}
            <p
              className="
                mt-6 max-w-[520px] font-body text-sm
                leading-7 text-[var(--body)]
                sm:text-base
              "
            >
              Compassionate healthcare services designed to support patients
              and families with professional care at home.
            </p>

            {/* Specialist heading */}
            <h2
              className="
                mt-6 font-heading text-xl font-bold uppercase
                tracking-[-0.02em] text-[var(--primary)]
                sm:text-2xl
              "
            >
              Our Specialists
            </h2>

            {/* Specialists */}
            <div
              className="
                mt-4 grid max-w-[480px] grid-cols-1
                gap-x-7 gap-y-3
                xs:grid-cols-2 sm:grid-cols-2
              "
            >
              {specialists.map((specialist) => (
                <div
                  key={specialist}
                  className="
                    flex items-center gap-2 font-body
                    text-[11px] font-semibold uppercase
                    tracking-[0.02em] text-[var(--heading)]
                    sm:text-xs
                  "
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />

                  <span>{specialist}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/patient/register"
                className="
                  inline-flex min-h-12 items-center justify-center
                  rounded-lg bg-[var(--primary)] px-7
                  text-xs font-bold uppercase tracking-[0.04em]
                  text-white shadow-[var(--shadow-button)]
                  transition duration-300
                  hover:-translate-y-0.5
                  hover:bg-[var(--primary-hover)]
                "
              >
                Get Started
              </Link>

              <Link
                to="/services"
                className="
                  inline-flex min-h-12 items-center justify-center
                  rounded-lg border border-[var(--primary)]
                  bg-white px-7 text-xs font-bold uppercase
                  tracking-[0.04em] text-[var(--primary)]
                  transition duration-300
                  hover:bg-[var(--primary-light)]
                "
              >
                View Services
              </Link>
            </div>
          </div>
        </div>

        {/* Right visual */}
        <div
          className="
            relative order-2 min-h-[390px]
            sm:min-h-[500px]
            lg:min-h-[720px]
          "
        >
          {/* Background panel */}
          <div
            className="
              absolute inset-0 overflow-hidden
              rounded-tl-[26px] rounded-br-[90px]
              bg-gradient-to-br
              from-[#F7F9FC] via-[#EFF2F3] to-[#E4E7E5]
              sm:rounded-br-[130px]
              lg:left-2 lg:right-[-48px] lg:rounded-br-[150px]
              xl:right-[-70px]
            "
          >
            {/* Panel lighting */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(255,255,255,0.95),transparent_38%)]" />

            {/* Blue accent */}
            <div
              className="
                absolute left-0 top-0 h-full w-1.5
                bg-gradient-to-b
                from-[var(--primary)] via-[#77A3D7] to-transparent
              "
            />

            {/* Health service badge */}
            <div
              className="
                absolute left-[8%] right-0 top-5 z-30
                flex min-h-[52px] items-center justify-center
                rounded-l-xl border border-white/90
                bg-white/30 px-4
                shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]
                backdrop-blur-sm
                sm:top-7 sm:min-h-[58px]
                lg:left-[10%] lg:top-11
              "
            >
              <p
                className="
                  text-center font-heading text-xs font-bold
                  uppercase tracking-[0.28em]
                  text-[var(--primary)]
                  sm:text-base sm:tracking-[0.42em]
                  lg:text-lg lg:tracking-[0.5em]
                "
              >
                Health Service
              </p>
            </div>

            {/* Decorative lighting */}
            <div className="absolute bottom-[12%] left-[8%] h-40 w-40 rounded-full bg-white/35 blur-3xl sm:h-52 sm:w-52" />

            <div className="absolute right-[3%] top-[20%] h-48 w-48 rounded-full bg-white/40 blur-3xl sm:h-64 sm:w-64" />
          </div>

          {/* Doctor and patient image */}
          <img
            src={hokudoctorpatient}
            alt="Healthcare professional examining an elderly patient"
            className="
              absolute bottom-5 left-1/2 z-20
              h-auto w-[108%] max-w-none
              -translate-x-1/2 object-contain object-bottom
              sm:bottom-7 sm:w-[102%]
              lg:bottom-8 lg:left-[52%] lg:w-[118%]
              xl:left-[51%] xl:w-[114%]
            "
          />

          {/* Left blending effect */}
          <div
            className="
              pointer-events-none absolute inset-y-0
              left-0 z-20 hidden w-[9%]
              bg-gradient-to-r from-white/55 to-transparent
              lg:block
            "
          />
        </div>
      </PageContainer>

      {/* Bottom waves */}
      <div className="pointer-events-none absolute bottom-0 left-0 z-40 w-full">
        <svg
          viewBox="0 0 1440 150"
          preserveAspectRatio="none"
          className="block h-[78px] w-full sm:h-[105px] lg:h-[125px]"
          aria-hidden="true"
        >
          <path
            d="M0,55 C330,121 695,140 1035,84 C1210,55 1335,23 1440,8
               L1440,39
               C1310,58 1190,88 1035,113
               C690,168 310,145 0,76 Z"
            fill="var(--secondary)"
          />

          <path
            d="M0,48 C335,108 695,126 1028,72
               C1200,44 1328,15 1440,3
               L1440,22
               C1310,41 1188,69 1030,95
               C690,150 315,129 0,64 Z"
            fill="var(--primary)"
          />

          <path
            d="M0,68 C320,136 695,156 1035,102
               C1215,73 1335,44 1440,28
               L1440,150 L0,150 Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;