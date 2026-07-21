import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  Check,
  CheckCircle2,
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

const HOKU_PRIMARY = "#1E63C6";

const sentimentMeta = {
  positive: {
    icon: Smile,
    label: "Positive",
    style:
      "border border-[#B7CF35]/40 bg-[#B7CF35]/15 text-[#61720E]",
    iconStyle:
      "bg-[#B7CF35]/20 text-[#61720E]",
  },

  neutral: {
    icon: Meh,
    label: "Neutral",
    style:
      "border border-amber-200 bg-amber-50 text-amber-700",
    iconStyle:
      "bg-amber-100 text-amber-700",
  },

  negative: {
    icon: Frown,
    label: "Negative",
    style:
      "border border-red-200 bg-red-50 text-red-700",
    iconStyle:
      "bg-red-100 text-red-600",
  },
};

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1E63C6] focus:ring-4 focus:ring-[#1E63C6]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

function normalizeSentiment(value, rating) {
  const sentiment = String(value || "")
    .trim()
    .toLowerCase();

  if (sentimentMeta[sentiment]) {
    return sentiment;
  }

  const numericRating =
    Number(rating) || 0;

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
    Math.max(
      Number(review.rating) || 0,
      0
    ),
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

function StarRow({
  rating,
  size = "h-4 w-4",
}) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map(
        (number) => (
          <Star
            key={number}
            className={`${size} ${
              number <= rating
                ? "fill-amber-400 text-amber-400"
                : "fill-slate-100 text-slate-200"
            }`}
          />
        )
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  valueSuffix = "",
}) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {value}
            {valueSuffix}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconClassName}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

function ApprovalBadge({ approved }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
        approved
          ? "border-[#B7CF35]/40 bg-[#B7CF35]/15 text-[#61720E]"
          : "border-amber-200 bg-amber-50 text-amber-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          approved
            ? "bg-[#8DAA18]"
            : "bg-amber-500"
        }`}
      />

      {approved
        ? "Approved"
        : "Pending"}
    </span>
  );
}

function DeleteModal({
  review,
  deleting,
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    if (!review) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    const handleEscape = (event) => {
      if (
        event.key === "Escape" &&
        !deleting
      ) {
        onCancel();
      }
    };

    document.body.style.overflow =
      "hidden";

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [review, deleting, onCancel]);

  if (!review) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-review-title"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !deleting
        ) {
          onCancel();
        }
      }}
    >
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 text-center shadow-2xl sm:p-7">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <Trash2 className="h-6 w-6" />
        </div>

        <h2
          id="delete-review-title"
          className="mt-5 text-xl font-bold text-slate-900"
        >
          Delete review?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          The review submitted by{" "}
          <span className="font-semibold text-slate-700">
            {review.patient}
          </span>{" "}
          will be permanently removed.
          This action cannot be undone.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting && (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            )}

            {deleting
              ? "Deleting..."
              : "Delete review"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  approving,
  onApprove,
  onDelete,
}) {
  const sentimentData =
    sentimentMeta[review.sentiment] ||
    sentimentMeta.neutral;

  const SentimentIcon =
    sentimentData.icon;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:border-[#1E63C6]/20 hover:shadow-md">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1E63C6]/10 text-sm font-bold text-[#1E63C6]">
              {getInitials(
                review.patient
              )}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold text-slate-900 sm:text-base">
                {review.patient}
              </h2>

              <p className="mt-1 truncate text-xs text-slate-500 sm:text-sm">
                Reviewed{" "}
                <span className="font-semibold text-slate-700">
                  {review.doctor}
                </span>
              </p>

              <div className="mt-2 flex items-center gap-2">
                <StarRow
                  rating={review.rating}
                />

                <span className="text-xs font-semibold text-slate-500">
                  {review.rating.toFixed(
                    1
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${sentimentData.style}`}
            >
              <SentimentIcon className="h-3.5 w-3.5" />

              {sentimentData.label}
            </span>

            <ApprovalBadge
              approved={review.approved}
            />
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex items-start gap-3">
            <MessageSquareText className="mt-0.5 h-5 w-5 shrink-0 text-[#1E63C6]" />

            <p className="text-sm leading-7 text-slate-600">
              {review.comment}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
        {!review.approved && (
          <button
            type="button"
            onClick={() =>
              onApprove(review)
            }
            disabled={approving}
            style={{
              backgroundColor:
                HOKU_PRIMARY,
            }}
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {approving ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}

            {approving
              ? "Approving..."
              : "Approve review"}
          </button>
        )}

        <button
          type="button"
          onClick={() =>
            onDelete(review)
          }
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 sm:w-auto"
        >
          <Trash2 className="h-4 w-4" />

          Delete
        </button>
      </div>
    </article>
  );
}

export default function ReviewManagement() {
  const [reviews, setReviews] =
    useState([]);

  const [query, setQuery] =
    useState("");

  const [filter, setFilter] =
    useState("All");

  const [loading, setLoading] =
    useState(true);

  const [pageError, setPageError] =
    useState("");

  const [
    approvingId,
    setApprovingId,
  ] = useState(null);

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState(null);

  const [deleting, setDeleting] =
    useState(false);

  const loadReviews =
    useCallback(async () => {
      setLoading(true);
      setPageError("");

      try {
        const response =
          await getAdminReviews({
            page: 1,
            limit: 100,
          });

        const reviewList =
          extractReviews(response);

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

  const filteredReviews =
    useMemo(() => {
      const normalizedQuery = query
        .trim()
        .toLowerCase();

      return reviews.filter(
        (review) => {
          const matchesQuery =
            !normalizedQuery ||
            review.patient
              .toLowerCase()
              .includes(
                normalizedQuery
              ) ||
            review.doctor
              .toLowerCase()
              .includes(
                normalizedQuery
              ) ||
            review.comment
              .toLowerCase()
              .includes(
                normalizedQuery
              );

          const matchesFilter =
            filter === "All" ||
            (filter === "Pending" &&
              !review.approved) ||
            (filter === "Approved" &&
              review.approved) ||
            filter ===
              review.sentiment;

          return (
            matchesQuery &&
            matchesFilter
          );
        }
      );
    }, [reviews, query, filter]);

  const pendingCount = useMemo(
    () =>
      reviews.filter(
        (review) =>
          !review.approved
      ).length,
    [reviews]
  );

  const approvedCount =
    reviews.length - pendingCount;

  const averageRating = useMemo(() => {
    if (!reviews.length) {
      return "0.0";
    }

    const total = reviews.reduce(
      (sum, review) =>
        sum +
        Number(review.rating || 0),
      0
    );

    return (
      total / reviews.length
    ).toFixed(1);
  }, [reviews]);

  const hasFilters =
    Boolean(query.trim()) ||
    filter !== "All";

  const approveReview = async (
    review
  ) => {
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
        await approveAdminReview(
          review.id
        );

      const responseReview =
        extractReview(response);

      const updatedReview =
        normalizeReview({
          ...review,

          ...(responseReview &&
          typeof responseReview ===
            "object"
            ? responseReview
            : {}),

          id:
            responseReview?.id ??
            responseReview?._id ??
            review.id,

          approved: true,
          is_approved: true,
        });

      setReviews(
        (currentReviews) =>
          currentReviews.map(
            (currentReview) =>
              currentReview.id ===
              review.id
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
      await deleteAdminReview(
        deleteTarget.id
      );

      setReviews(
        (currentReviews) =>
          currentReviews.filter(
            (review) =>
              review.id !==
              deleteTarget.id
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

  const closeDeleteModal =
    useCallback(() => {
      if (deleting) {
        return;
      }

      setDeleteTarget(null);
    }, [deleting]);

  const clearFilters = () => {
    setQuery("");
    setFilter("All");
  };

  return (
    <section className="space-y-6 font-['Inter']">
      <header>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#1E63C6]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#1E63C6]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#B7CF35]" />

          Patient feedback
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Review Management
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
          Review patient feedback,
          approve public testimonials,
          and remove inappropriate or
          outdated reviews.
        </p>
      </header>

      {pageError && (
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

            <span>{pageError}</span>
          </div>

          <button
            type="button"
            onClick={() =>
              setPageError("")
            }
            aria-label="Dismiss error"
            className="rounded-lg p-1 transition hover:bg-red-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total reviews"
          value={reviews.length}
          icon={MessageSquareText}
          iconClassName="bg-[#1E63C6]/10 text-[#1E63C6]"
        />

        <StatCard
          label="Awaiting approval"
          value={pendingCount}
          icon={AlertCircle}
          iconClassName="bg-amber-50 text-amber-600"
        />

        <StatCard
          label="Approved reviews"
          value={approvedCount}
          icon={CheckCircle2}
          iconClassName="bg-[#B7CF35]/20 text-[#61720E]"
        />

        <StatCard
          label="Average rating"
          value={averageRating}
          valueSuffix="/5"
          icon={Star}
          iconClassName="bg-amber-50 text-amber-500"
        />
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value
                )
              }
              placeholder="Search patient, doctor, or feedback..."
              className={`${inputClassName} pl-10`}
            />
          </div>

          <div className="relative lg:w-56">
            <select
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target.value
                )
              }
              className={`${inputClassName} appearance-none pr-10`}
            >
              <option value="All">
                All reviews
              </option>

              <option value="Pending">
                Pending approval
              </option>

              <option value="Approved">
                Approved
              </option>

              <option value="positive">
                Positive sentiment
              </option>

              <option value="neutral">
                Neutral sentiment
              </option>

              <option value="negative">
                Negative sentiment
              </option>
            </select>

            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          <button
            type="button"
            onClick={loadReviews}
            disabled={loading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredReviews.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {reviews.length}
            </span>{" "}
            reviews
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-semibold text-[#1E63C6] transition hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-16 text-center shadow-sm">
          <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-[#1E63C6]" />

          <p className="mt-3 text-sm font-semibold text-slate-700">
            Loading reviews...
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Fetching the latest patient
            feedback.
          </p>
        </div>
      ) : filteredReviews.length ===
        0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1E63C6]/10 text-[#1E63C6]">
            <MessageSquareText className="h-6 w-6" />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900">
            No reviews found
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            {hasFilters
              ? "Try changing the search term or selected filter."
              : "Patient reviews will appear here when they are submitted."}
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl border border-[#1E63C6]/20 bg-[#1E63C6]/5 px-4 text-sm font-semibold text-[#1E63C6] transition hover:bg-[#1E63C6]/10"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filteredReviews.map(
            (review) => (
              <ReviewCard
                key={review.id}
                review={review}
                approving={
                  approvingId ===
                  review.id
                }
                onApprove={
                  approveReview
                }
                onDelete={
                  setDeleteTarget
                }
              />
            )
          )}
        </div>
      )}

      <DeleteModal
        review={deleteTarget}
        deleting={deleting}
        onCancel={closeDeleteModal}
        onConfirm={confirmDelete}
      />
    </section>
  );
}