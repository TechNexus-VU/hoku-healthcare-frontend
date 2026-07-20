import React, { useState } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

const approvedReviews = [
  {
    id: 1,
    patient: "Charlotte Bennett",
    location: "Manchester, UK",
    rating: 5,
    comment:
      "The home visit was on time and the nurse was incredibly caring. Made my father feel comfortable in his own bed instead of a hospital ward.",
  },
  {
    id: 2,
    patient: "Fatima Al Suwaidi",
    location: "Dubai, UAE",
    rating: 4,
    comment:
      "Very professional palliative care team. They explained every step to our family and were always reachable, day or night.",
  },
  {
    id: 3,
    patient: "Ayesha Raheem",
    location: "Lahore, Pakistan",
    rating: 5,
    comment:
      "Booking was simple and the dental specialist arrived exactly on schedule. Highly recommend Hoku for anyone needing home care.",
  },
];

function StarRow({ rating, size = "h-4 w-4" }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${size} ${n <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

function ReviewList() {
  const [index, setIndex] = useState(0);
  const review = approvedReviews[index];

  const next = () => setIndex((i) => (i + 1) % approvedReviews.length);
  const prev = () => setIndex((i) => (i - 1 + approvedReviews.length) % approvedReviews.length);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)] sm:p-8">
        <Quote className="h-8 w-8 text-[#1565C0]/30" />
        <p className="mt-4 text-base leading-relaxed text-[#1A1A2E] sm:text-lg">
          {review.comment}
        </p>
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1565C0]/10 text-sm font-semibold text-[#1565C0]">
              {review.patient.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
            </span>
            <div>
              <p className="font-['Poppins'] text-sm font-semibold text-[#1A1A2E]">
                {review.patient}
              </p>
              <p className="text-xs text-[#6B7280]">{review.location}</p>
            </div>
          </div>
          <StarRow rating={review.rating} />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-4">
        <button
          onClick={prev}
          aria-label="Previous review"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1A1A2E] shadow-sm ring-1 ring-black/5 hover:bg-[#F5F5F5]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-1.5">
          {approvedReviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to review ${i + 1}`}
              className={`h-2 w-2 rounded-full transition ${
                i === index ? "bg-[#2E7D32]" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
        <button
          onClick={next}
          aria-label="Next review"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1A1A2E] shadow-sm ring-1 ring-black/5 hover:bg-[#F5F5F5]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function AddReview() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0 || !comment.trim()) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 text-center shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
          <Star className="h-5 w-5 fill-[#2E7D32] text-[#2E7D32]" />
        </div>
        <h3 className="font-['Poppins'] text-base font-semibold text-[#1A1A2E]">
          Thank you for your feedback
        </h3>
        <p className="mt-1 text-sm text-[#6B7280]">
          Your review has been submitted and will appear on this page once it's approved.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)] sm:p-8">
      <h3 className="font-['Poppins'] text-lg font-semibold text-[#1A1A2E]">
        Share Your Experience
      </h3>
      <p className="mt-1 text-sm text-[#6B7280]">
        Tell other families how your Hoku Health Care visit went.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#1A1A2E]">
            Your Rating
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
              >
                <Star
                  className={`h-7 w-7 transition ${
                    n <= (hoverRating || rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-200"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#1A1A2E]">
            Your Review
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Tell us about your care experience..."
            className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-[#2E7D32] py-2.5 text-sm font-medium text-white transition hover:bg-[#1B5E20]"
        >
          Submit Review
        </button>
      </form>
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] font-['Inter']">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#2E7D32]">
            Hoku Health Care
          </p>
          <h1 className="mt-2 font-['Poppins'] text-3xl font-bold text-[#1A1A2E] sm:text-4xl">
            Client Reviews
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[#6B7280] sm:text-base">
            Real stories from patients and families across Pakistan, the UAE, and the UK.
          </p>
        </div>

        <ReviewList />

        <div className="mt-14">
          <AddReview />
        </div>
      </div>
    </div>
  );
}
