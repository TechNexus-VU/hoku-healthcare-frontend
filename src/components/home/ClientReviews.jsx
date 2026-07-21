import { useState } from "react";

import {
  FaQuoteLeft,
  FaQuoteRight,
  FaStar,
} from "react-icons/fa";

import reviewerOne from "@/assets/reviews/reviewer-1.png";
import reviewerTwo from "@/assets/reviews/reviewer-2.png";
import reviewerThree from "@/assets/reviews/reviewer-3.png";
import reviewerFour from "@/assets/reviews/reviewer-4.png";
import reviewerFive from "@/assets/reviews/reviewer-5.png";

import PageContainer from "@/components/common/PageContainer";

const reviews = [
  {
    id: 1,
    name: "Emily Johnson",
    role: "Home Health Client",
    image: reviewerOne,
    review:
      "Additionally, there is a growing recognition of the importance of holistic approaches to healthcare, which encompass not only physical health but also mental and emotional well-being. Achieving equitable healthcare for all requires collaborative efforts from governments, healthcare providers, communities, and individuals alike.",
    rating: 5,
  },
  {
    id: 2,
    name: "Sarah Williams",
    role: "Palliative Care Client",
    image: reviewerTwo,
    review:
      "The HOKU Health Care team treated our family with kindness, respect, and professionalism. Their consistent support made a very difficult period easier, and we always felt informed and cared for.",
    rating: 5,
  },
  {
    id: 3,
    name: "Olivia Brown",
    role: "Hospice Care Client",
    image: reviewerThree,
    review:
      "Every nurse was attentive, compassionate, and patient. They listened carefully to our concerns and provided dependable care while preserving comfort and dignity.",
    rating: 5,
  },
  {
    id: 4,
    name: "Sophia Davis",
    role: "Family Member",
    image: reviewerFour,
    review:
      "We are deeply grateful for the quality of care provided by HOKU. The team communicated clearly, arrived on time, and always made our loved one feel safe.",
    rating: 5,
  },
  {
    id: 5,
    name: "Emma Wilson",
    role: "Home Care Client",
    image: reviewerFive,
    review:
      "HOKU Health Care offered reliable and personalized support. The staff members were friendly, well-trained, and genuinely committed to improving daily comfort and well-being.",
    rating: 5,
  },
];

const ClientReviews = () => {
  const [activeReview, setActiveReview] =
    useState(0);

  const currentReview =
    reviews[activeReview] || reviews[0];

  return (
    <section
      id="reviews"
      className="relative w-full overflow-hidden bg-[var(--section)] py-14 sm:py-20 lg:py-24"
    >
      {/* Decorative background */}
      <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-[var(--primary)]/[0.04] blur-2xl" />

      <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-[var(--secondary)]/[0.06] blur-2xl" />

      <PageContainer className="relative z-10">
        {/* Heading */}
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <p className="mb-1 font-body text-xs font-bold uppercase tracking-[0.18em] text-[var(--secondary)] sm:text-sm">
            Hoku
          </p>

          <h2 className="font-heading text-3xl font-extrabold uppercase leading-tight text-[var(--primary)] sm:text-4xl lg:text-[42px]">
            Client Reviews
          </h2>

          <p className="mx-auto mt-4 max-w-xl font-body text-sm leading-7 text-[var(--body)] sm:text-[15px]">
            Read what patients and families say about their experience with
            HOKU Health Care.
          </p>
        </div>

        {/* Review card */}
        <article
          key={currentReview.id}
          aria-live="polite"
          className="mx-auto max-w-[980px] rounded-[24px] border border-[var(--border)] bg-white px-5 py-8 shadow-[var(--shadow-soft)] sm:px-8 sm:py-10 lg:px-12 lg:py-12"
        >
          <div className="grid items-center gap-8 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-14">
            {/* Reviewer image */}
            <div className="flex justify-center">
              <div className="rounded-full border-[5px] border-[var(--primary)] p-1.5 shadow-[0_10px_28px_rgba(0,0,0,0.10)] sm:border-[7px] sm:p-2">
                <img
                  src={currentReview.image}
                  alt={`${currentReview.name}, ${currentReview.role}`}
                  className="h-[145px] w-[145px] rounded-full object-cover sm:h-[180px] sm:w-[180px] md:h-[190px] md:w-[190px] lg:h-[205px] lg:w-[205px]"
                />
              </div>
            </div>

            {/* Review content */}
            <div className="relative min-w-0 text-center md:text-left">
              <FaQuoteLeft
                aria-hidden="true"
                className="absolute -top-4 left-0 text-4xl text-slate-200 sm:-top-6 sm:text-5xl md:-left-3"
              />

              <blockquote className="relative z-10 pt-7 font-body text-sm leading-7 text-[var(--body)] sm:text-[15px] sm:leading-8 md:pt-5">
                “{currentReview.review}”
              </blockquote>

              <div className="mt-5">
                <h3 className="font-heading text-lg font-bold text-[var(--heading)] sm:text-xl">
                  {currentReview.name}
                </h3>

                <p className="mt-1 font-body text-sm text-[var(--body)]">
                  {currentReview.role}
                </p>
              </div>

              {/* Rating */}
              <div
                className="mt-4 flex justify-center gap-1 text-[#FFD000] md:justify-start"
                aria-label={`${currentReview.rating} out of 5 stars`}
              >
                {Array.from({
                  length: 5,
                }).map((_, index) => (
                  <FaStar
                    key={index}
                    aria-hidden="true"
                    className={
                      index <
                      currentReview.rating
                        ? "opacity-100"
                        : "opacity-25"
                    }
                  />
                ))}
              </div>

              <FaQuoteRight
                aria-hidden="true"
                className="absolute -bottom-2 right-0 text-4xl text-slate-200 sm:-bottom-4 sm:text-5xl"
              />
            </div>
          </div>
        </article>

        {/* Review selector */}
        <div
          className="mt-8 flex flex-wrap items-center justify-center gap-2.5"
          role="tablist"
          aria-label="Client reviews"
        >
          {reviews.map((review, index) => {
            const isActive =
              activeReview === index;

            return (
              <button
                key={review.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Show review from ${review.name}`}
                onClick={() =>
                  setActiveReview(index)
                }
                className={`h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 ${
                  isActive
                    ? "w-8 bg-[var(--primary)]"
                    : "w-3 bg-slate-300 hover:bg-[var(--secondary)]"
                }`}
              />
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
};

export default ClientReviews;