import {
  ArrowLeft,
  HeartPulse,
  SearchX,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import PageContainer from "@/components/common/PageContainer";
import ServiceDetail from "@/components/services/ServiceDetail";
import ServicesData from "@/data/ServicesData";

const ServiceDetailsPage = () => {
  const { slug } = useParams();

  const service = ServicesData.find(
    (item) =>
      item.slug === slug &&
      item.status === "active"
  );

  if (!service) {
    return (
      <main className="relative flex min-h-[70vh] items-center overflow-hidden bg-[#FCFCFD] py-16 font-['Inter'] sm:py-20 lg:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-28 -top-28 h-80 w-80 rounded-full bg-[#1E63C6]/10 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-[#B7CF35]/20 blur-3xl"
        />

        <PageContainer className="relative z-10">
          <div className="mx-auto max-w-2xl rounded-[28px] border border-slate-200/80 bg-white px-5 py-12 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:px-10 sm:py-16">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1E63C6]/10 text-[#1E63C6]">
              <SearchX className="h-7 w-7" />
            </div>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#B7CF35]/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#61720E]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8DAA18]" />

              Service unavailable
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Service not found
            </h1>

            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-500 sm:text-base">
              The healthcare service you requested does not exist, may have
              been removed, or is currently unavailable.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/services"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1E63C6] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#174FA0] hover:shadow-md sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to services
              </Link>

              <Link
                to="/contact"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-[#1E63C6]/30 hover:bg-[#1E63C6]/5 hover:text-[#1E63C6] sm:w-auto"
              >
                <HeartPulse className="h-4 w-4" />
                Contact our team
              </Link>
            </div>
          </div>
        </PageContainer>
      </main>
    );
  }

  return <ServiceDetail service={service} />;
};

export default ServiceDetailsPage;

