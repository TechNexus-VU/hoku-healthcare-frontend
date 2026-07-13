import homeHealth from "@/assets/home-health.png";
import palliativeCare from "@/assets/palliative-care.png";
import hospiceCare from "@/assets/hospice-care.png";

const OurServices = () => {
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

  return (
    <section
      id="services"
      className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="mb-10 text-center sm:mb-12">
          <p className="mb-1 text-sm font-semibold uppercase tracking-[0.15em] text-[#9CCB39]">
            Hoku
          </p>

          <h2 className="text-3xl font-extrabold uppercase leading-tight text-[#1268AE] sm:text-4xl lg:text-[42px]">
            Our Service
          </h2>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-9">
          {services.map((service) => (
            <article
              key={service.id}
              className="group mx-auto w-full max-w-[370px]"
            >
              {/* Image card */}
              <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.13)]">
                <img
                  src={service.image}
                  alt={service.title}
                  className="h-[230px] w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-[245px] lg:h-[260px]"
                />
              </div>

              {/* Service label */}
              <div className="relative z-10 mx-auto -mt-1 w-[78%]">
                <div className="flex min-h-[68px] items-center justify-center bg-white px-5 py-4 text-center shadow-[0_6px_20px_rgba(0,0,0,0.11)]">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-[#1F1F1F] sm:text-base">
                    {service.title}
                  </h3>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurServices;