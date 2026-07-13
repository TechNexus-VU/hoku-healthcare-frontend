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

const ClientReviews = () => {
  const [activeReview, setActiveReview] = useState(0);

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

  const currentReview = reviews[activeReview];

  return (
    <section
      id="reviews"
      className="relative overflow-hidden bg-[#fafafa] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"
    >
      {/* Decorative background shapes */}
      <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-[#1268AE]/[0.025]" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-[#9CCB39]/[0.035]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-10 text-center sm:mb-12">
          <p className="mb-1 text-sm font-semibold uppercase tracking-[0.16em] text-[#9CCB39]">
            Hoku
          </p>

          <h2 className="text-3xl font-extrabold uppercase leading-tight text-[#1268AE] sm:text-4xl lg:text-[42px]">
            Client Reviews
          </h2>
        </div>

        {/* Review card */}
        <div className="mx-auto max-w-[930px] rounded-[20px] bg-white px-6 py-9 shadow-[0_8px_28px_rgba(0,0,0,0.10)] sm:px-10 lg:px-12 lg:py-12">
          <div className="grid items-center gap-10 md:grid-cols-[250px_1fr] lg:gap-14">
            {/* Reviewer image */}
            <div className="flex justify-center">
              <div className="rounded-full border-[7px] border-[#1268AE] p-[7px]">
                <img
                  src={currentReview.image}
                  alt={currentReview.name}
                  className="h-[180px] w-[180px] rounded-full object-cover sm:h-[205px] sm:w-[205px]"
                />
              </div>
            </div>

            {/* Review content */}
            <div className="relative">
              <FaQuoteLeft className="absolute -left-2 -top-7 text-5xl text-[#d9d9d9] sm:text-6xl" />

              <p className="relative z-10 text-sm leading-7 text-[#555555] sm:text-[15px] sm:leading-8">
                {currentReview.review}
              </p>

              <div className="mt-5">
                <h3 className="text-lg font-bold text-[#1f1f1f]">
                  {currentReview.name}
                </h3>

                <p className="mt-1 text-sm text-[#777777]">
                  {currentReview.role}
                </p>
              </div>

              <div className="mt-4 flex gap-1 text-[#FFD000]">
                {Array.from({ length: currentReview.rating }).map(
                  (_, index) => (
                    <FaStar key={index} />
                  )
                )}
              </div>

              <FaQuoteRight className="absolute -bottom-5 right-0 text-5xl text-[#d9d9d9] sm:text-6xl" />
            </div>
          </div>
        </div>

        {/* Slider dots */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {reviews.map((review, index) => (
            <button
              key={review.id}
              type="button"
              onClick={() => setActiveReview(index)}
              aria-label={`Show review ${index + 1}`}
              className={`h-3 rounded-full transition-all duration-300 ${
                activeReview === index
                  ? "w-3 bg-[#0796B8]"
                  : "w-3 bg-[#dedede] hover:bg-[#bdbdbd]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientReviews;