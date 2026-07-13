import { Link } from "react-router-dom";
import footerbg from "@/assets/footer_bg.png";

const Footer = () => {
  const links = [
    "Home",
    "About",
    "Service",
    "Available",
    "Reviews",
    "Contact Us",
  ];

  return (
    <footer className="relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${footerbg})`,
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/75" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        {/* Logo */}
        <div className="text-center">
          <p className="text-4xl font-light tracking-wide text-[#A7D53F]">
            HOKU
          </p>

          <h2 className="mt-1 text-5xl font-extrabold uppercase leading-none text-[#1568B2]">
            HEALTH CARE
          </h2>
        </div>

        {/* Navigation */}

        <nav className="mt-12">
          <ul className="flex flex-wrap items-center justify-center gap-8 text-sm font-medium uppercase tracking-wide text-white">
            {links.map((item) => (
              <li key={item}>
                <Link
                  to="/"
                  className="transition duration-300 hover:text-[#9CCB39]"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Divider */}

        <div className="my-10 h-px bg-white/15" />

        {/* Bottom */}

        <div className="flex flex-col items-center justify-between gap-5 text-xs uppercase text-gray-300 md:flex-row">
          <Link
            to="/privacy-policy"
            className="transition hover:text-[#9CCB39]"
          >
            Privacy Policy
          </Link>

          <p className="text-center">
            Copyright © HOKU Healthcare 2026 | All Rights Reserved
          </p>

          <Link
            to="/terms"
            className="transition hover:text-[#9CCB39]"
          >
            Terms & Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;