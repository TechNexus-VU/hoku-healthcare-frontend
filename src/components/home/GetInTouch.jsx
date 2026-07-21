import contactImage from "@/assets/contactImage.png";

import ContactForm from "@/components/contact/ContactForm";
import PageContainer from "@/components/common/PageContainer";

const GetInTouch = () => {
  return (
    <section
      id="contact"
      className="relative w-full overflow-hidden bg-[var(--section)] pb-28 pt-14 sm:pb-36 sm:pt-20 lg:pb-40 lg:pt-24"
    >
      {/* Bottom dark background */}
      <div
        className="absolute inset-x-0 bottom-0 h-[210px] bg-[#1A1A1A] sm:h-[235px] lg:h-[255px]"
        style={{
          clipPath:
            "polygon(0 28%, 68% 0, 100% 28%, 100% 100%, 0 100%)",
        }}
      />

      {/* Green decorative ribbon */}
      <div
        className="absolute inset-x-0 bottom-[190px] h-2 bg-[var(--secondary)] sm:bottom-[215px] lg:bottom-[235px]"
        style={{
          clipPath:
            "polygon(0 78%, 68% 0, 100% 78%, 100% 100%, 0 100%)",
        }}
      />

      {/* Blue decorative ribbon */}
      <div
        className="absolute inset-x-0 bottom-[176px] h-4 bg-[var(--primary)] sm:bottom-[201px] lg:bottom-[221px]"
        style={{
          clipPath:
            "polygon(0 76%, 68% 0, 100% 76%, 100% 100%, 0 100%)",
        }}
      />

      {/* Decorative background lights */}
      <div className="pointer-events-none absolute -left-24 top-12 h-64 w-64 rounded-full bg-[var(--primary)]/[0.04] blur-3xl" />

      <div className="pointer-events-none absolute -right-24 top-24 h-64 w-64 rounded-full bg-[var(--secondary)]/[0.06] blur-3xl" />

      <PageContainer className="relative z-10">
        {/* Section heading */}
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <p className="font-body text-xs font-bold uppercase tracking-[0.18em] text-[var(--secondary)] sm:text-sm">
            Contact Us
          </p>

          <h2 className="mt-1 font-heading text-3xl font-extrabold uppercase leading-tight text-[var(--primary)] sm:text-4xl lg:text-[42px]">
            Get In Touch
          </h2>

          <p className="mx-auto mt-4 max-w-xl font-body text-sm leading-7 text-[var(--body)] sm:text-[15px]">
            Connect with our healthcare team for professional support,
            appointment information, or questions about our services.
          </p>
        </div>

        {/* Contact card */}
        <div className="mx-auto w-full max-w-[1120px] overflow-hidden rounded-[24px] border border-[var(--border)] bg-white shadow-[0_18px_55px_rgba(15,23,42,0.18)] sm:rounded-[28px]">
          <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]">
            {/* Image */}
            <div className="relative min-h-[260px] overflow-hidden sm:min-h-[360px] lg:min-h-[520px]">
              <img
                src={contactImage}
                alt="Healthcare professional assisting a patient"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />

              {/* Image overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-white/10" />

              {/* Mobile image label */}
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/30 bg-white/85 p-4 backdrop-blur-sm sm:bottom-7 sm:left-7 sm:right-auto sm:max-w-[310px] lg:hidden">
                <p className="font-heading text-lg font-bold text-[var(--heading)]">
                  Compassionate Care
                </p>

                <p className="mt-1 text-sm leading-6 text-[var(--body)]">
                  Our team is ready to support your healthcare needs.
                </p>
              </div>
            </div>

            {/* Contact form */}
            <div className="flex min-w-0 items-center bg-white px-5 py-8 sm:px-8 sm:py-10 md:px-10 lg:px-10 lg:py-12 xl:px-14">
              <div className="w-full min-w-0">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
};

export default GetInTouch;