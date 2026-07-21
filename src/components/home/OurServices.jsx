import homeHealth from "@/assets/services/home-health.png";
import palliativeCare from "@/assets/services/palliative-care.png";
import hospiceCare from "@/assets/services/hospice-care.png";

import PageContainer from "@/components/common/PageContainer";

const services = [
  {
    id: 1,
    title: "Home Health",
    image: homeHealth,
  },
  {
    id: 2,
    title: "Palliative Care",
    image: palliativeCare,
  },
  {
    id: 3,
    title: "Hospice Care",
    image: hospiceCare,
  },
];

const OurServices = () => {
  return (
    <section
      id="services"
      className="w-full overflow-hidden bg-white py-14 sm:py-20 lg:py-24"
    >
      <PageContainer>
        {/* Section heading */}
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <p className="mb-1 font-body text-xs font-bold uppercase tracking-[0.18em] text-[var(--secondary)] sm:text-sm">
            Hoku
          </p>

          <h2 className="font-heading text-3xl font-extrabold uppercase leading-tight text-[var(--primary)] sm:text-4xl lg:text-[42px]">
            Our Services
          </h2>

          <p className="mx-auto mt-4 max-w-xl font-body text-sm leading-7 text-[var(--body)] sm:text-[15px]">
            Compassionate healthcare services designed to support patients and
            families in the comfort of their homes.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 xl:gap-10">
          {services.map((service) => (
            <article
              key={service.id}
              className="group mx-auto w-full max-w-[390px]"
            >
              {/* Image card */}
              <div className="relative overflow-hidden rounded-[20px] bg-white shadow-[var(--shadow-soft)]">
                <img
                  src={service.image}
                  alt={`${service.title} healthcare service`}
                  loading="lazy"
                  className="h-[220px] w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-[235px] md:h-[250px] lg:h-[260px]"
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
              </div>

              {/* Service label */}
              <div className="relative z-10 mx-auto -mt-5 w-[86%] sm:w-[82%]">
                <div className="flex min-h-[68px] items-center justify-center rounded-xl border border-[var(--border)] bg-white px-4 py-4 text-center shadow-[0_8px_22px_rgba(0,0,0,0.10)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-card)] sm:px-5">
                  <h3 className="font-heading text-sm font-bold uppercase tracking-[0.05em] text-[var(--heading)] sm:text-base">
                    {service.title}
                  </h3>
                </div>
              </div>
            </article>
          ))}
        </div>
      </PageContainer>
    </section>
  );
};

export default OurServices;