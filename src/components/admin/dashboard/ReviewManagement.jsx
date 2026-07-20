import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  Check,
  ChevronDown,
  Frown,
  LoaderCircle,
  Meh,
  MessageSquareText,
  RefreshCw,
  Search,
  Smile,
  Star,
  Trash2,
  X,
} from "lucide-react";

import {
  approveAdminReview,
  deleteAdminReview,
  extractReview,
  extractReviews,
  getAdminReviews,
} from "@/services/adminReviewsApi";

const sentimentMeta = {
  positive: {
    icon: Smile,
    style:
      "bg-green-50 text-[#2E7D32] ring-1 ring-green-200",
  },

  neutral: {
    icon: Meh,
    style:
      "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  },

  negative: {
    icon: Frown,
    style:
      "bg-red-50 text-[#DC2626] ring-1 ring-red-200",
  },
};

function normalizeSentiment(value, rating) {
  const sentiment = String(value || "")
    .trim()
    .toLowerCase();

  if (sentimentMeta[sentiment]) {
    return sentiment;
  }

  const numericRating = Number(rating) || 0;

  if (numericRating >= 4) {
    return "positive";
  }

  if (numericRating === 3) {
    return "neutral";
  }

  return "negative";
}

function normalizeReview(review = {}) {
  const rating = Math.min(
    Math.max(Number(review.rating) || 0, 0),
    5
  );

  return {
    ...review,

    id:
      review.id ??
      review._id ??
      review.review_id ??
      review.reviewId,

    patient:
      review.patient ||
      review.patient_name ||
      review.patientName ||
      review.user_name ||
      review.userName ||
      review.user?.full_name ||
      review.user?.name ||
      "Anonymous Patient",

    doctor:
      review.doctor ||
      review.doctor_name ||
      review.doctorName ||
      review.doctor?.full_name ||
      review.doctor?.name ||
      "HOKU Health Care",

    rating,

    comment:
      review.comment ||
      review.review ||
      review.message ||
      "No written feedback provided.",

    sentiment: normalizeSentiment(
      review.sentiment,
      rating
    ),

    approved: Boolean(
      review.approved ??
        review.is_approved ??
        review.isApproved ??
        false
    ),
  };
}

function getInitials(name = "") {
  const initials = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return initials || "PT";
}

function getErrorMessage(
  error,
  fallback = "Something went wrong."
) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function StarRow({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((number) => (
        <Star
          key={number}
          className={`h-4 w-4 ${
            number <= rating
              ? "fill-amber-400 text-amber-400"
              : "text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([]);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [approvingId, setApprovingId] =
    useState(null);

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const [deleting, setDeleting] =
    useState(false);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const response = await getAdminReviews({
        page: 1,
        limit: 100,
      });

      const reviewList = extractReviews(response);

      setReviews(
        reviewList.map((review) =>
          normalizeReview(review)
        )
      );
    } catch (error) {
      setReviews([]);

      setPageError(
        getErrorMessage(
          error,
          "Unable to load reviews from the server."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const filteredReviews = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLowerCase();

    return reviews.filter((review) => {
      const matchesQuery =
        !normalizedQuery ||
        review.patient
          .toLowerCase()
          .includes(normalizedQuery) ||
        review.doctor
          .toLowerCase()
          .includes(normalizedQuery) ||
        review.comment
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesFilter =
        filter === "All" ||
        (filter === "Pending" &&
          !review.approved) ||
        (filter === "Approved" &&
          review.approved) ||
        filter === review.sentiment;

      return matchesQuery && matchesFilter;
    });
  }, [reviews, query, filter]);

  const pendingCount = useMemo(
    () =>
      reviews.filter(
        (review) => !review.approved
      ).length,
    [reviews]
  );

  const averageRating = useMemo(() => {
    if (!reviews.length) {
      return "0.0";
    }

    const total = reviews.reduce(
      (sum, review) =>
        sum + Number(review.rating || 0),
      0
    );

    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const approveReview = async (review) => {
    if (
      review.id === undefined ||
      approvingId !== null
    ) {
      return;
    }

    setApprovingId(review.id);
    setPageError("");

    try {
      const response =
        await approveAdminReview(review.id);

      const responseReview =
        extractReview(response);

      const updatedReview = normalizeReview({
        ...review,

        ...(responseReview &&
        typeof responseReview === "object"
          ? responseReview
          : {}),

        id:
          responseReview?.id ??
          responseReview?._id ??
          review.id,

        approved: true,
        is_approved: true,
      });

      setReviews((currentReviews) =>
        currentReviews.map((currentReview) =>
          currentReview.id === review.id
            ? updatedReview
            : currentReview
        )
      );
    } catch (error) {
      setPageError(
        getErrorMessage(
          error,
          "Unable to approve the review."
        )
      );
    } finally {
      setApprovingId(null);
    }
  };

  const confirmDelete = async () => {
    if (
      !deleteTarget ||
      deleteTarget.id === undefined
    ) {
      return;
    }

    setDeleting(true);
    setPageError("");

    try {
      await deleteAdminReview(deleteTarget.id);

      setReviews((currentReviews) =>
        currentReviews.filter(
          (review) =>
            review.id !== deleteTarget.id
        )
      );

      setDeleteTarget(null);
    } catch (error) {
      setPageError(
        getErrorMessage(
          error,
          "Unable to delete the review."
        )
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-['Inter']">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#2E7D32]">
            Hoku Health Care
          </p>

          <h1 className="font-['Poppins'] text-2xl font-bold text-[#1A1A2E] sm:text-3xl">
            Review Management
          </h1>

          <p className="mt-1 text-sm text-[#6B7280]">
            Approve patient reviews before they
            appear on the public site.
          </p>
        </div>

        {pageError && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{pageError}</span>
            </div>

            <button
              type="button"
              onClick={() => setPageError("")}
              aria-label="Dismiss error"
              className="rounded p-1 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
            <p className="text-xs text-[#6B7280]">
              Total Reviews
            </p>

            <p className="font-['Poppins'] text-xl font-bold text-[#1A1A2E]">
              {reviews.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
            <p className="text-xs text-[#6B7280]">
              Awaiting Approval
            </p>

            <p className="font-['Poppins'] text-xl font-bold text-amber-600">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
            <p className="text-xs text-[#6B7280]">
              Average Rating
            </p>

            <div className="flex items-center gap-2">
              <p className="font-['Poppins'] text-xl font-bold text-[#1A1A2E]">
                {averageRating}
              </p>

              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />

            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search by patient, doctor, or comment..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20"
            />
          </div>

          <div className="relative sm:w-56">
            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value)
              }
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-4 pr-9 text-sm outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20"
            >
              <option value="All">
                All Reviews
              </option>

              <option value="Pending">
                Pending Approval
              </option>

              <option value="Approved">
                Approved
              </option>

              <option value="positive">
                Sentiment: Positive
              </option>

              <option value="neutral">
                Sentiment: Neutral
              </option>

              <option value="negative">
                Sentiment: Negative
              </option>
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
          </div>

          <button
            type="button"
            onClick={loadReviews}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[#1A1A2E] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />

            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
            <LoaderCircle className="mb-3 h-7 w-7 animate-spin text-[#2E7D32]" />

            <p className="text-sm font-medium text-[#1A1A2E]">
              Loading reviews...
            </p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F5F5]">
              <MessageSquareText className="h-6 w-6 text-[#6B7280]" />
            </div>

            <h3 className="font-['Poppins'] text-base font-semibold text-[#1A1A2E]">
              No reviews found
            </h3>

            <p className="mt-1 max-w-xs text-sm text-[#6B7280]">
              Try a different search term or filter.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => {
              const sentimentData =
                sentimentMeta[
                  review.sentiment
                ] || sentimentMeta.neutral;

              const SentimentIcon =
                sentimentData.icon;

              const isApproving =
                approvingId === review.id;

              return (
                <div
                  key={review.id}
                  className="rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.08)] sm:p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1565C0]/10 text-xs font-semibold text-[#1565C0]">
                        {getInitials(
                          review.patient
                        )}
                      </span>

                      <div>
                        <p className="font-medium text-[#1A1A2E]">
                          {review.patient}
                        </p>

                        <p className="text-xs text-[#6B7280]">
                          Reviewed {review.doctor}
                        </p>

                        <div className="mt-1.5">
                          <StarRow
                            rating={review.rating}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${sentimentData.style}`}
                      >
                        <SentimentIcon className="h-3.5 w-3.5" />

                        {review.sentiment
                          .charAt(0)
                          .toUpperCase() +
                          review.sentiment.slice(1)}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          review.approved
                            ? "bg-green-50 text-[#2E7D32] ring-1 ring-green-200"
                            : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                        }`}
                      >
                        {review.approved
                          ? "Approved"
                          : "Pending"}
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-[#1A1A2E]">
                    {review.comment}
                  </p>

                  <div className="mt-4 flex justify-end gap-2 border-t border-gray-100 pt-4">
                    {!review.approved && (
                      <button
                        type="button"
                        onClick={() =>
                          approveReview(review)
                        }
                        disabled={isApproving}
                        className="flex items-center gap-1.5 rounded-lg bg-[#2E7D32] px-4 py-2 text-xs font-medium text-white hover:bg-[#1B5E20] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isApproving ? (
                          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}

                        {isApproving
                          ? "Approving..."
                          : "Approve"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget(review)
                      }
                      className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-[#DC2626] hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <Trash2 className="h-5 w-5 text-[#DC2626]" />
            </div>

            <h3 className="font-['Poppins'] text-base font-semibold text-[#1A1A2E]">
              Delete this review?
            </h3>

            <p className="mt-1 text-sm text-[#6B7280]">
              This review from{" "}
              {deleteTarget.patient} will be
              permanently removed.
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(null)
                }
                disabled={deleting}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-[#1A1A2E] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#DC2626] py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting && (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                )}

                {deleting
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}