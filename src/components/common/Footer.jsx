import { Link } from "react-router-dom";

import footerBg from "@/assets/footer_bg.png";
import PageContainer from "@/components/common/PageContainer";

const footerLinks = [
  {
    label: "Home",
    path: "/",
  },
  {
    label: "About",
    path: "/about",
  },
  {
    label: "Services",
    path: "/services",
  },
  {
    label: "Specialists",
    path: "/specialists",
  },
  {
    label: "Available",
    path: "/availability",
  },
  {
    label: "Reviews",
    path: "/reviews",
  },
  {
    label: "Contact Us",
    path: "/contact",
  },
];

const Footer = () => {
  const currentYear =
    new Date().getFullYear();

  return (
    <footer className="relative w-full overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${footerBg})`,
        }}
      />

      {/* Dark overlays */}
      <div className="absolute inset-0 bg-black/80" />

      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/40" />

      {/* Decorative lights */}
      <div className="pointer-events-none absolute -left-28 top-10 h-72 w-72 rounded-full bg-[var(--primary)]/15 blur-3xl" />

      <div className="pointer-events-none absolute -right-28 bottom-0 h-72 w-72 rounded-full bg-[var(--secondary)]/10 blur-3xl" />

      <PageContainer className="relative z-10">
        <div className="py-14 sm:py-16 lg:py-20">
          {/* Logo */}
          <Link
            to="/"
            className="mx-auto block w-fit text-center"
            aria-label="Go to HOKU Health Care home page"
          >
            <p className="font-heading text-3xl font-light tracking-[0.1em] text-[var(--secondary)] sm:text-4xl">
              HOKU
            </p>

            <h2 className="mt-1 font-heading text-3xl font-extrabold uppercase leading-none text-[var(--primary)] sm:text-4xl lg:text-5xl">
              Health Care
            </h2>
          </Link>

          {/* Description */}
          <p className="mx-auto mt-5 max-w-2xl text-center font-body text-sm leading-7 text-white/70 sm:text-[15px]">
            Compassionate and professional home healthcare services dedicated
            to improving comfort, dignity, and well-being.
          </p>

          {/* Navigation */}
          <nav
            className="mt-9 sm:mt-11"
            aria-label="Footer navigation"
          >
            <ul className="grid grid-cols-2 gap-x-5 gap-y-4 text-center sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-7 sm:gap-y-4 lg:gap-x-9">
              {footerLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="font-body text-xs font-semibold uppercase tracking-[0.06em] text-white/85 transition-colors duration-300 hover:text-[var(--secondary)] sm:text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Divider */}
          <div className="my-9 h-px w-full bg-white/15 sm:my-10" />

          {/* Footer bottom */}
          <div className="flex flex-col items-center justify-between gap-5 text-center font-body text-[11px] uppercase leading-5 tracking-[0.04em] text-white/60 md:flex-row md:text-left">
            <Link
              to="/privacy-policy"
              className="transition-colors duration-300 hover:text-[var(--secondary)]"
            >
              Privacy Policy
            </Link>

            <p className="order-first max-w-md md:order-none md:text-center">
              Copyright © HOKU Health Care {currentYear}. All Rights Reserved.
            </p>

            <Link
              to="/terms"
              className="transition-colors duration-300 hover:text-[var(--secondary)]"
            >
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
};

export default Footer;