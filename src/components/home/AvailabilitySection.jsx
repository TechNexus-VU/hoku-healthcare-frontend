import {
    FaPhoneAlt,
    FaEnvelope,
    FaMapMarkerAlt,
  } from "react-icons/fa";
  
  import availabilitybg from "@/assets/availability-bg.png";
  
  const AvailabilitySection = () => {
    const contactItems = [
      {
        id: 1,
        icon: <FaPhoneAlt />,
        text: "512-258-789",
        href: "tel:512258789",
      },
      {
        id: 2,
        icon: <FaEnvelope />,
        text: "www.hokuhealth.com",
        href: "https://www.hokuhealth.com",
      },
      {
        id: 3,
        icon: <FaMapMarkerAlt />,
        text: "7537 Wiza Valley Missouri",
        href: "#contact",
      },
    ];
  
    return (
      <section
        id="availability"
        className="relative overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${availabilitybg})`,
        }}
      >
        {/* Blue overlay */}
        <div className="absolute inset-0 bg-[#0067a8]/80" />
  
        {/* Soft dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#005d91]/35 via-transparent to-[#005d91]/30" />
  
        <div className="relative z-10 mx-auto flex min-h-[310px] max-w-7xl flex-col items-center justify-center px-5 py-16 text-center sm:px-8 lg:min-h-[340px]">
          <h2 className="max-w-[760px] text-2xl font-extrabold uppercase leading-[1.3] text-white sm:text-3xl lg:text-[34px]">
            We Are Available 24/7 to Cater for Your
            <br className="hidden sm:block" />
            Home Healthcare Needs
          </h2>
  
          <div className="mt-8 flex w-full max-w-[680px] flex-col items-center justify-center gap-3 rounded-xl bg-white px-5 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)] sm:flex-row sm:gap-6 sm:px-7">
            {contactItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                target={item.id === 2 ? "_blank" : undefined}
                rel={item.id === 2 ? "noopener noreferrer" : undefined}
                className="flex items-center gap-2 text-[11px] font-semibold uppercase text-[#333333] transition-colors duration-300 hover:text-[#1268AE] sm:text-xs"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1268AE] text-[11px] text-white">
                  {item.icon}
                </span>
  
                <span>{item.text}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    );
  };
  
  export default AvailabilitySection;