import { Link } from "react-router-dom";

import about_main from "@/assets/about_main.png";
import about_top from "@/assets/about_top.png";
import about_bottom from "@/assets/about_bottom.png";

const AboutSection = () => {
  return (
    <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
      <div className="mx-auto grid max-w-[1180px] items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
        {/* Left image collage */}
        <div className="relative mx-auto w-full max-w-[540px]">
          <div className="grid grid-cols-[1.05fr_0.95fr] gap-4">
            {/* Large left image */}
            <div className="overflow-hidden rounded-[18px] shadow-[var(--shadow-soft)]">
              <img
                src={about_main}
                alt="Healthcare professional assisting a patient"
                className="h-[420px] w-full object-cover sm:h-[470px]"
              />
            </div>

            {/* Right stacked images */}
            <div className="flex flex-col gap-4">
              <div className="overflow-hidden rounded-[18px] shadow-[var(--shadow-soft)]">
                <img
                  src={about_top}
                  alt="Doctor consulting with a patient"
                  className="h-[202px] w-full object-cover sm:h-[227px]"
                />
              </div>

              <div className="overflow-hidden rounded-[18px] shadow-[var(--shadow-soft)]">
                <img
                  src={about_bottom}
                  alt="Healthcare professional at work"
                  className="h-[202px] w-full object-cover sm:h-[227px]"
                />
              </div>
            </div>
          </div>

          {/* Center logo badge */}
          <div className="absolute left-1/2 top-1/2 flex h-[92px] w-[92px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[7px] border-white bg-white text-center shadow-[0_10px_28px_rgba(0,0,0,0.12)] sm:h-[104px] sm:w-[104px]">
            <div className="leading-none">
              <p className="text-[12px] font-semibold tracking-[0.08em] text-[var(--secondary)]">
                HOKU
              </p>

              <p className="mt-1 text-[11px] font-extrabold tracking-[0.03em] text-[var(--primary)] sm:text-[12px]">
                HEALTH CARE
              </p>
            </div>
          </div>
        </div>

        {/* Right content */}
        <div className="lg:pl-2">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-[2px] w-8 bg-[var(--secondary)]" />

            <p className="font-body text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--heading)]">
              About Us
            </p>
          </div>

          <h2 className="max-w-[560px] font-heading text-[34px] font-extrabold uppercase leading-[1.08] tracking-[-0.03em] text-[var(--heading)] sm:text-[42px] lg:text-[46px]">
            Nourishing lives, one home at a time
          </h2>

          <p className="mt-6 max-w-[590px] font-body text-[14px] leading-8 text-[var(--body)] sm:text-[15px]">
            Access to quality healthcare is a fundamental right that every
            individual deserves. At Hoku Health Care, we provide compassionate,
            reliable and professional home healthcare services designed around
            the needs of patients and their families.
          </p>

          <p className="mt-4 max-w-[590px] font-body text-[14px] leading-8 text-[var(--body)] sm:text-[15px]">
            From home health support to palliative and hospice care, our
            experienced professionals work to improve comfort, dignity and
            overall well-being within the familiar surroundings of home.
          </p>

          <Link
            to="/about"
            className="mt-7 inline-flex min-h-[44px] items-center justify-center rounded-[7px] bg-[var(--primary)] px-7 font-body text-[11px] font-bold uppercase tracking-[0.06em] text-white shadow-[var(--shadow-button)] transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--primary-hover)]"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;