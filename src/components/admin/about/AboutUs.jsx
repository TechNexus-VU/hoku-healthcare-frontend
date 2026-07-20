import React from "react";
import {
  HeartHandshake,
  ShieldCheck,
  Clock3,
  Users,
  Stethoscope,
  Quote,
} from "lucide-react";

const values = [
  {
    icon: HeartHandshake,
    title: "Compassion First",
    text: "Every visit is guided by empathy — we treat every patient like family, not a file number.",
  },
  {
    icon: ShieldCheck,
    title: "Clinical Trust",
    text: "Licensed specialists and vetted caregivers deliver hospital-grade care inside your home.",
  },
  {
    icon: Clock3,
    title: "Always Available",
    text: "Round-the-clock support across Pakistan, the UAE, and the UK — care doesn't keep office hours.",
  },
];

const stats = [
  { value: "36+", label: "Specialists on call" },
  { value: "1,200+", label: "Families supported" },
  { value: "3", label: "Countries served" },
  { value: "24/7", label: "Availability" },
];

const team = [
  { name: "Dr. James Whitfield", role: "Cardiologist", region: "United Kingdom" },
  { name: "Dr. Emma Clarke", role: "Gynecologist", region: "United Kingdom" },
  { name: "Dr. Layla Al Mansoori", role: "Dental Specialist", region: "UAE" },
  { name: "Dr. Michael Braun", role: "Dermatologist", region: "Germany" },
];

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-white font-['Inter'] text-[#1A1A2E]">
      <section className="relative overflow-hidden bg-[#F5F5F5] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#2E7D32]">
            About Hoku Health Care
          </p>
          <h1 className="mt-3 font-['Poppins'] text-3xl font-bold leading-tight sm:text-5xl">
            Nourishing lives,
            <br className="hidden sm:block" /> one home at a time.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#6B7280]">
            Access to quality healthcare is a fundamental right. We bring nursing,
            therapy, palliative, and hospice care directly to your doorstep — so
            families across Pakistan, the UAE, and the UK never have to choose
            between comfort and quality care.
          </p>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#2E7D32]/5 to-transparent" />
      </section>

      <section className="border-b border-gray-100 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-['Poppins'] text-2xl font-bold text-[#2E7D32] sm:text-3xl">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-[#6B7280] sm:text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1565C0]">
              Our Story
            </p>
            <h2 className="mt-2 font-['Poppins'] text-2xl font-bold sm:text-3xl">
              Care shouldn't require a waiting room.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#6B7280] sm:text-base">
              Hoku Health Care began with a simple observation: the patients who
              need the gentlest care are often the ones least able to travel for
              it. Elderly parents, post-surgery patients, and those in palliative
              or hospice care deserve treatment that comes to them, delivered by
              specialists they can trust.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[#6B7280] sm:text-base">
              Today, our network of child specialists, gynaecologists, dentists,
              and dermatologists — alongside dedicated home health nurses —
              serves families across three countries, any hour of the day.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 rounded-2xl bg-[#2E7D32] p-6 text-white">
              <Stethoscope className="h-6 w-6" />
              <p className="mt-4 font-['Poppins'] text-lg font-semibold">
                "We take care of your health."
              </p>
              <p className="mt-1 text-sm text-white/80">— Hoku Health Care motto</p>
            </div>
            <div className="rounded-2xl bg-[#F5F5F5] p-5">
              <Users className="h-5 w-5 text-[#1565C0]" />
              <p className="mt-3 font-['Poppins'] text-lg font-bold">Family-first</p>
              <p className="mt-1 text-xs text-[#6B7280]">
                Care plans built around the whole household, not just the patient.
              </p>
            </div>
            <div className="rounded-2xl bg-[#F5F5F5] p-5">
              <ShieldCheck className="h-5 w-5 text-[#1565C0]" />
              <p className="mt-3 font-['Poppins'] text-lg font-bold">Verified staff</p>
              <p className="mt-1 text-xs text-[#6B7280]">
                Every caregiver is licensed, background-checked, and trained.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F5F5F5] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#2E7D32]">
              What Guides Us
            </p>
            <h2 className="mt-2 font-['Poppins'] text-2xl font-bold sm:text-3xl">
              Our Core Values
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {values.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-2xl bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2E7D32]/10">
                  <Icon className="h-5 w-5 text-[#2E7D32]" />
                </span>
                <h3 className="mt-4 font-['Poppins'] text-base font-semibold">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1565C0]">
              Meet the Team
            </p>
            <h2 className="mt-2 font-['Poppins'] text-2xl font-bold sm:text-3xl">
              Specialists Across Three Countries
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((d) => (
              <div
                key={d.name}
                className="rounded-2xl border border-gray-100 p-5 text-center transition hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
              >
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1565C0]/10 text-sm font-semibold text-[#1565C0]">
                  {d.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                </span>
                <p className="mt-3 font-['Poppins'] text-sm font-semibold">
                  {d.name}
                </p>
                <p className="text-xs text-[#6B7280]">{d.role}</p>
                <p className="mt-1 text-xs font-medium text-[#2E7D32]">{d.region}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#1565C0] px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Quote className="mx-auto h-8 w-8 text-white/60" />
          <p className="mt-4 font-['Poppins'] text-xl font-medium leading-snug sm:text-2xl">
            Healthcare access shouldn't depend on how far you can travel — it
            should meet you at your door.
          </p>
          <button className="mt-6 rounded-lg bg-white px-6 py-3 text-sm font-medium text-[#1565C0] transition hover:bg-white/90">
            Book a Home Visit
          </button>
        </div>
      </section>
    </div>
  );
}
