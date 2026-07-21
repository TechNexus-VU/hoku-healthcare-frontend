import { Link } from "react-router-dom";

import aboutMain from "@/assets/about_main.png";
import aboutTop from "@/assets/about_top.png";
import aboutBottom from "@/assets/about_bottom.png";

import PageContainer from "@/components/common/PageContainer";

const AboutSection = () => {
  return (
    <section className="w-full overflow-hidden bg-white py-14 sm:py-18 lg:py-24">
      <PageContainer>
        <div
          className="
            grid items-center gap-12
            lg:grid-cols-[0.95fr_1.05fr]
            lg:gap-14
            xl:gap-20
          "
        >
          {/* Image collage */}
          <div className="relative mx-auto w-full max-w-[560px]">
            <div className="grid grid-cols-[1.05fr_0.95fr] gap-2.5 sm:gap-4">
              {/* Main image */}
              <div className="overflow-hidden rounded-2xl shadow-[var(--shadow-soft)] sm:rounded-[20px]">
                <img
                  src={aboutMain}
                  alt="Healthcare professional assisting a patient"
                  className="
                    h-[300px] w-full object-cover
                    sm:h-[400px]
                    md:h-[450px]
                    lg:h-[470px]
                  "
                />
              </div>

              {/* Stacked images */}
              <div className="flex flex-col gap-2.5 sm:gap-4">
                <div className="overflow-hidden rounded-2xl shadow-[var(--shadow-soft)] sm:rounded-[20px]">
                  <img
                    src={aboutTop}
                    alt="Doctor consulting with a patient"
                    className="
                      h-[144px] w-full object-cover
                      sm:h-[192px]
                      md:h-[217px]
                      lg:h-[227px]
                    "
                  />
                </div>

                <div className="overflow-hidden rounded-2xl shadow-[var(--shadow-soft)] sm:rounded-[20px]">
                  <img
                    src={aboutBottom}
                    alt="Healthcare professional providing patient care"
                    className="
                      h-[144px] w-full object-cover
                      sm:h-[192px]
                      md:h-[217px]
                      lg:h-[227px]
                    "
                  />
                </div>
              </div>
            </div>

            {/* Center badge */}
            <div
              className="
                absolute left-1/2 top-1/2
                flex h-[76px] w-[76px]
                -translate-x-1/2 -translate-y-1/2
                items-center justify-center
                rounded-full border-[5px] border-white
                bg-white text-center
                shadow-[0_10px_28px_rgba(0,0,0,0.14)]
                sm:h-[96px] sm:w-[96px] sm:border-[7px]
                lg:h-[104px] lg:w-[104px]
              "
            >
              <div className="leading-none">
                <p
                  className="
                    text-[10px] font-semibold
                    tracking-[0.08em]
                    text-[var(--secondary)]
                    sm:text-xs
                  "
                >
                  HOKU
                </p>

                <p
                  className="
                    mt-1 text-[9px] font-extrabold
                    tracking-[0.02em]
                    text-[var(--primary)]
                    sm:text-[11px]
                    lg:text-xs
                  "
                >
                  HEALTH CARE
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="w-full lg:pl-2">
            {/* Section label */}
            <div className="mb-5 flex items-center gap-3">
              <span className="h-0.5 w-8 shrink-0 bg-[var(--secondary)]" />

              <p
                className="
                  font-body text-xs font-bold uppercase
                  tracking-[0.16em]
                  text-[var(--heading)]
                "
              >
                About Us
              </p>
            </div>

            <h2
              className="
                max-w-[590px] font-heading
                text-[30px] font-extrabold uppercase
                leading-[1.1] tracking-[-0.03em]
                text-[var(--heading)]
                sm:text-[38px]
                md:text-[42px]
                lg:text-[44px]
                xl:text-[48px]
              "
            >
              Nourishing lives, one home at a time
            </h2>

            <div className="mt-6 max-w-[620px] space-y-4">
              <p
                className="
                  font-body text-sm leading-7
                  text-[var(--body)]
                  sm:text-[15px] sm:leading-8
                "
              >
                Access to quality healthcare is a fundamental right that every
                individual deserves. At Hoku Health Care, we provide
                compassionate, reliable and professional home healthcare
                services designed around the needs of patients and their
                families.
              </p>

              <p
                className="
                  font-body text-sm leading-7
                  text-[var(--body)]
                  sm:text-[15px] sm:leading-8
                "
              >
                From home health support to palliative and hospice care, our
                experienced professionals work to improve comfort, dignity and
                overall well-being within the familiar surroundings of home.
              </p>
            </div>

            <Link
              to="/about"
              className="
                mt-7 inline-flex min-h-12
                items-center justify-center
                rounded-lg bg-[var(--primary)]
                px-7 font-body text-xs font-bold
                uppercase tracking-[0.06em]
                text-white
                shadow-[var(--shadow-button)]
                transition-all duration-300
                hover:-translate-y-0.5
                hover:bg-[var(--primary-hover)]
              "
            >
              Learn More
            </Link>
          </div>
        </div>
      </PageContainer>
    </section>
  );
};

export default AboutSection;