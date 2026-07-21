import {
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  FaArrowRight,
  FaCheck,
  FaFilter,
  FaSearch,
  FaStethoscope,
  FaTimes,
  FaUserMd,
} from "react-icons/fa";

import PageContainer from "@/components/common/PageContainer";
import SpecialistCard from "@/components/specialists/SpecialistCard";
import specialistsData from "@/data/SpecialistData";

const HOKU_PRIMARY = "#1E63C6";
const HOKU_SECONDARY = "#B7CF35";

const Specialists = () => {
  const [
    selectedSpecialty,
    setSelectedSpecialty,
  ] = useState("All");

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const specialties = useMemo(
    () => [
      "All",
      ...new Set(
        specialistsData
          .map(
            (doctor) =>
              doctor?.specialty
          )
          .filter(Boolean)
      ),
    ],
    []
  );

  const filteredSpecialists =
    useMemo(() => {
      const searchValue = searchTerm
        .toLowerCase()
        .trim();

      return specialistsData.filter(
        (doctor) => {
          const matchesSpecialty =
            selectedSpecialty ===
              "All" ||
            doctor?.specialty ===
              selectedSpecialty;

          const searchableContent = [
            doctor?.name,
            doctor?.specialty,
            doctor?.qualification,
            doctor?.hospital,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            !searchValue ||
            searchableContent.includes(
              searchValue
            );

          return (
            matchesSpecialty &&
            matchesSearch
          );
        }
      );
    }, [
      selectedSpecialty,
      searchTerm,
    ]);

  const hasActiveFilters =
    selectedSpecialty !== "All" ||
    searchTerm.trim() !== "";

  const clearFilters = () => {
    setSelectedSpecialty("All");
    setSearchTerm("");
  };

  return (
    <main className="overflow-hidden bg-[#FCFCFD] font-['Inter']">
      {/* Page banner */}
      <section
        className="relative overflow-hidden py-20 text-white sm:py-24 lg:py-28"
        style={{
          background:
            "linear-gradient(135deg, #1E63C6 0%, #174FA0 58%, #123E7D 100%)",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-28 h-80 w-80 rounded-full border border-white/10 bg-white/5"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-36 right-[-70px] h-96 w-96 rounded-full border border-white/10 bg-[#B7CF35]/15"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl"
        />

        <PageContainer className="relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm sm:text-sm">
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor:
                    HOKU_SECONDARY,
                }}
              />

              Healthcare Professionals
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Meet our trusted healthcare
              specialists
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/75 sm:text-lg">
              Find experienced healthcare
              professionals based on your
              medical needs, preferred
              specialty, and required
              qualifications.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {[
                "Qualified specialists",
                "Multiple medical fields",
                "Patient-centered care",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-sm font-medium text-white/85"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#B7CF35]/20 text-[#E5F48B]">
                    <FaCheck className="text-[10px]" />
                  </span>

                  {item}
                </div>
              ))}
            </div>

            <nav
              aria-label="Breadcrumb"
              className="mt-10 flex items-center justify-center gap-3 text-sm font-medium"
            >
              <Link
                to="/"
                className="text-white/70 transition hover:text-white"
              >
                Home
              </Link>

              <span className="text-white/35">
                /
              </span>

              <span className="text-[#DDF078]">
                Specialists
              </span>
            </nav>
          </div>
        </PageContainer>
      </section>

      {/* Specialists section */}
      <section className="bg-[#FCFCFD] py-16 sm:py-20 lg:py-24">
        <PageContainer>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#1E63C6]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#1E63C6] sm:text-sm">
              <FaUserMd className="text-sm" />

              Our Medical Team
            </div>

            <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Choose the right specialist
              for your care
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-500 sm:text-lg">
              Search our healthcare
              professionals by name,
              qualification, hospital, or
              medical specialty.
            </p>
          </div>

          {/* Search and filters */}
          <div className="mt-10 rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.07)] sm:p-6 lg:mt-12">
            <div className="grid gap-5 lg:grid-cols-[minmax(280px,0.8fr)_1.2fr] lg:items-start">
              {/* Search */}
              <div>
                <label
                  htmlFor="specialist-search"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Search specialists
                </label>

                <div className="relative">
                  <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

                  <input
                    id="specialist-search"
                    type="search"
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(
                        event.target.value
                      )
                    }
                    placeholder="Name, specialty or qualification"
                    className="min-h-12 w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1E63C6] focus:ring-4 focus:ring-[#1E63C6]/10"
                  />

                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearchTerm("")
                      }
                      aria-label="Clear search"
                      className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  )}
                </div>
              </div>

              {/* Specialty filters */}
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <FaFilter className="text-xs text-[#1E63C6]" />
                    Filter by specialty
                  </p>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-xs font-semibold text-[#1E63C6] transition hover:text-[#174FA0] hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-wrap lg:overflow-visible lg:pb-0">
                  {specialties.map(
                    (specialty) => {
                      const isSelected =
                        selectedSpecialty ===
                        specialty;

                      return (
                        <button
                          key={specialty}
                          type="button"
                          onClick={() =>
                            setSelectedSpecialty(
                              specialty
                            )
                          }
                          aria-pressed={
                            isSelected
                          }
                          style={
                            isSelected
                              ? {
                                  backgroundColor:
                                    HOKU_PRIMARY,
                                }
                              : undefined
                          }
                          className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition sm:text-sm ${
                            isSelected
                              ? "border-[#1E63C6] text-white shadow-sm"
                              : "border-slate-200 bg-slate-50 text-slate-600 hover:border-[#1E63C6]/30 hover:bg-[#1E63C6]/5 hover:text-[#1E63C6]"
                          }`}
                        >
                          {specialty}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Results information */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p
              className="text-sm text-slate-500"
              aria-live="polite"
            >
              Showing{" "}
              <span className="font-bold text-slate-900">
                {
                  filteredSpecialists.length
                }
              </span>{" "}
              {filteredSpecialists.length ===
              1
                ? "specialist"
                : "specialists"}
            </p>

            {selectedSpecialty !==
              "All" && (
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#B7CF35]/15 px-3 py-1.5 text-xs font-semibold text-[#61720E]">
                <FaStethoscope />

                {selectedSpecialty}
              </div>
            )}
          </div>

          {/* Specialist cards */}
          {filteredSpecialists.length >
          0 ? (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-3">
              {filteredSpecialists.map(
                (specialist) => (
                  <SpecialistCard
                    key={specialist.id}
                    specialist={specialist}
                  />
                )
              )}
            </div>
          ) : (
            <div className="mt-8 rounded-[28px] border border-slate-200 bg-white px-6 py-14 text-center shadow-sm sm:py-16">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1E63C6]/10 text-[#1E63C6]">
                <FaSearch className="text-xl" />
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900 sm:text-2xl">
                No specialists found
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500 sm:text-base">
                We could not find a
                specialist matching your
                current search and specialty
                filters.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                style={{
                  backgroundColor:
                    HOKU_PRIMARY,
                }}
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Clear all filters
              </button>
            </div>
          )}
        </PageContainer>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-100 bg-white py-16 sm:py-20 lg:py-24">
        <PageContainer>
          <div
            className="relative overflow-hidden rounded-[28px] px-6 py-12 text-center text-white shadow-[0_20px_60px_rgba(30,99,198,0.18)] sm:px-10 sm:py-16 lg:px-16"
            style={{
              background:
                "linear-gradient(135deg, #1E63C6 0%, #174FA0 65%, #123E7D 100%)",
            }}
          >
            <div
              aria-hidden="true"
              className="absolute -left-20 -top-20 h-60 w-60 rounded-full border border-white/10 bg-white/5"
            />

            <div
              aria-hidden="true"
              className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-[#B7CF35]/15"
            />

            <div className="relative mx-auto max-w-3xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[#DDF078] backdrop-blur">
                <FaUserMd className="text-xl" />
              </div>

              <h2 className="mt-6 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                Not sure which specialist
                you need?
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
                Contact our healthcare team
                for guidance and we will help
                you choose the right
                professional for your needs.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  to="/contact"
                  style={{
                    backgroundColor:
                      HOKU_SECONDARY,
                  }}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl px-7 text-sm font-bold text-[#243000] transition hover:opacity-90 sm:w-auto"
                >
                  Contact Our Team
                  <FaArrowRight className="text-xs" />
                </Link>

                <Link
                  to="/appointment"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-white/35 bg-white/5 px-7 text-sm font-semibold text-white transition hover:bg-white hover:text-[#1E63C6] sm:w-auto"
                >
                  Book an Appointment
                </Link>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>
    </main>
  );
};

export default Specialists;