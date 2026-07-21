import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  NavLink,
} from "react-router-dom";

import {
  FaBars,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaTimes,
} from "react-icons/fa";

import logo from "@/assets/logo.png";

import PageContainer from "@/components/common/PageContainer";

const navLinks = [
  {
    name: "Home",
    path: "/",
  },
  {
    name: "About",
    path: "/about",
  },
  {
    name: "Services",
    path: "/services",
  },
  {
    name: "Specialists",
    path: "/specialists",
  },
  {
    name: "Available",
    path: "/availability",
  },
  {
    name: "Reviews",
    path: "/reviews",
  },
  {
    name: "Contact Us",
    path: "/contact",
  },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  const desktopNavLinkClass = ({
    isActive,
  }) =>
    `relative whitespace-nowrap py-2 text-[13px] font-semibold uppercase tracking-[0.04em] transition-colors duration-300 ${
      isActive
        ? "text-[var(--primary)]"
        : "text-[var(--heading)] hover:text-[var(--primary)]"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
      <PageContainer>
        {/* Mobile and tablet navbar */}
        <div className="flex min-h-[76px] items-center justify-between lg:hidden">
          <Link
            to="/"
            onClick={closeMenu}
            className="shrink-0"
          >
            <img
              src={logo}
              alt="HOKU Health Care"
              className="h-[58px] w-[145px] object-contain sm:h-[62px] sm:w-[160px]"
            />
          </Link>

          <button
            type="button"
            onClick={() =>
              setMenuOpen(
                (currentValue) =>
                  !currentValue
              )
            }
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary)] text-white shadow-[var(--shadow-button)] transition-colors duration-300 hover:bg-[var(--primary-hover)]"
            aria-label={
              menuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            {menuOpen ? (
              <FaTimes size={18} />
            ) : (
              <FaBars size={18} />
            )}
          </button>
        </div>

        {/* Desktop navbar */}
        <div className="hidden grid-cols-[210px_minmax(0,1fr)] grid-rows-[58px_68px] lg:grid">
          {/* Logo spans both rows */}
          <Link
            to="/"
            className="row-span-2 flex items-center justify-start"
          >
            <img
              src={logo}
              alt="HOKU Health Care"
              className="h-[108px] w-[205px] object-contain transition-transform duration-300 hover:scale-[1.02] xl:h-[116px] xl:w-[220px]"
            />
          </Link>

          {/* Contact information */}
          <div className="flex items-stretch justify-end overflow-hidden rounded-bl-2xl">
            <ContactItem
              icon={<FaPhoneAlt />}
              text="512-258-789"
              variant="primary"
            />

            <ContactItem
              icon={<FaEnvelope />}
              text="www.hokuhealth.com"
              variant="secondary"
            />

            <ContactItem
              icon={<FaMapMarkerAlt />}
              text="7537 Wiza Valley, Missouri"
              variant="primary"
              className="min-w-[215px]"
            />
          </div>

          {/* Desktop navigation */}
          <div className="flex min-w-0 items-center justify-end">
            <nav className="flex min-w-0 items-center justify-end gap-4 xl:gap-7">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={
                    desktopNavLinkClass
                  }
                >
                  {link.name}
                </NavLink>
              ))}

              <Link
                to="/patient/register"
                className="ml-1 inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)] px-5 text-[12px] font-bold uppercase tracking-[0.05em] text-white shadow-[var(--shadow-button)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] xl:px-6"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </PageContainer>

      {/* Mobile navigation */}
      <div
        id="mobile-navigation"
        className={`overflow-hidden border-t bg-white transition-all duration-300 lg:hidden ${
          menuOpen
            ? "max-h-[760px] border-[var(--border)] opacity-100"
            : "max-h-0 border-transparent opacity-0"
        }`}
      >
        <PageContainer>
          <nav className="flex flex-col gap-1 py-5">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={closeMenu}
                className={({
                  isActive,
                }) =>
                  `rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-300 ${
                    isActive
                      ? "bg-[var(--primary-light)] text-[var(--primary)]"
                      : "text-[var(--heading)] hover:bg-[var(--section)] hover:text-[var(--primary)]"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            <Link
              to="/patient/register"
              onClick={closeMenu}
              className="mt-3 flex min-h-11 items-center justify-center rounded-xl bg-[var(--primary)] px-5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[var(--primary-hover)]"
            >
              Get Started
            </Link>

            <div className="mt-5 space-y-3 border-t border-[var(--border)] pt-5">
              <MobileContact
                icon={<FaPhoneAlt />}
                text="512-258-789"
              />

              <MobileContact
                icon={<FaEnvelope />}
                text="www.hokuhealth.com"
              />

              <MobileContact
                icon={
                  <FaMapMarkerAlt />
                }
                text="7537 Wiza Valley, Missouri"
              />
            </div>
          </nav>
        </PageContainer>
      </div>
    </header>
  );
};

const ContactItem = ({
  icon,
  text,
  variant = "primary",
  className = "",
}) => {
  const backgroundClass =
    variant === "secondary"
      ? "bg-[var(--secondary)]"
      : "bg-[var(--primary)]";

  return (
    <div
      className={`flex min-w-[175px] items-center justify-center gap-2 px-4 py-3 text-white ${backgroundClass} ${className}`}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-[11px]">
        {icon}
      </span>

      <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.03em]">
        {text}
      </span>
    </div>
  );
};

const MobileContact = ({
  icon,
  text,
}) => {
  return (
    <div className="flex items-start gap-3 text-sm text-[var(--body)]">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)]">
        {icon}
      </span>

      <span className="break-words pt-2">
        {text}
      </span>
    </div>
  );
};

export default Navbar;