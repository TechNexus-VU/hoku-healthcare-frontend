const ContactMap = () => {
  return (
    <div className="relative w-full bg-slate-100">
      <iframe
        title="HOKU Health Care location at 7537 Wiza Valley, Missouri"
        src="https://www.google.com/maps?q=7537%20Wiza%20Valley%20Missouri&output=embed"
        className="block h-[320px] w-full border-0 sm:h-[400px] lg:h-[480px]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />

      <div className="pointer-events-none absolute bottom-4 left-4 hidden rounded-xl border border-white/60 bg-white/90 px-4 py-3 shadow-lg backdrop-blur-sm sm:block">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#1E63C6]">
          HOKU Health Care
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-800">
          7537 Wiza Valley, Missouri
        </p>
      </div>
    </div>
  );
};

export default ContactMap;