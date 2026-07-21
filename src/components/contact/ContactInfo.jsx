import {
  FaClock,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
} from "react-icons/fa";

const contactItems = [
  {
    id: 1,
    icon: FaPhoneAlt,
    title: "Phone",
    value: "512-258-789",
    href: "tel:512258789",
    helperText: "Speak directly with our support team",
  },
  {
    id: 2,
    icon: FaEnvelope,
    title: "Email",
    value: "info@hokuhealth.com",
    href: "mailto:info@hokuhealth.com",
    helperText: "Send us your healthcare enquiry",
  },
  {
    id: 3,
    icon: FaMapMarkerAlt,
    title: "Address",
    value: "7537 Wiza Valley, Missouri",
    href: null,
    helperText: "Visit our healthcare location",
  },
  {
    id: 4,
    icon: FaClock,
    title: "Availability",
    value: "24 Hours, 7 Days a Week",
    href: null,
    helperText: "Healthcare assistance when needed",
  },
];

const ContactInfoCard = ({ item }) => {
  const Icon = item.icon;

  const content = (
    <article
      className={`group relative h-full overflow-hidden rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 sm:p-7 ${
        item.href
          ? "hover:-translate-y-1 hover:border-[#1E63C6]/30 hover:shadow-[0_16px_40px_rgba(15,23,42,0.1)]"
          : ""
      }`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-[#1E63C6]/5 transition duration-300 group-hover:scale-110"
      />

      <div className="relative">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1E63C6]/10 text-[#1E63C6] transition duration-300 group-hover:bg-[#1E63C6] group-hover:text-white">
          <Icon className="text-lg" />
        </div>

        <h3 className="mt-5 text-lg font-bold text-slate-900">
          {item.title}
        </h3>

        <p className="mt-2 break-words text-base font-semibold leading-7 text-slate-700">
          {item.value}
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {item.helperText}
        </p>

        {item.href && (
          <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#1E63C6]">
            Contact now
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </span>
        )}
      </div>
    </article>
  );

  if (item.href) {
    return (
      <a
        href={item.href}
        className="block h-full rounded-[24px] outline-none focus-visible:ring-4 focus-visible:ring-[#1E63C6]/20"
        aria-label={`${item.title}: ${item.value}`}
      >
        {content}
      </a>
    );
  }

  return <div className="h-full">{content}</div>;
};

const ContactInfo = () => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {contactItems.map((item) => (
        <ContactInfoCard
          key={item.id}
          item={item}
        />
      ))}
    </div>
  );
};

export default ContactInfo;