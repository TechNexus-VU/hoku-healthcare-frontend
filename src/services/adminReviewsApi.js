import api from "./api";

const REVIEWS_ENDPOINT = "/reviews";

export const getAdminReviews = (params = {}) =>
  api.get(REVIEWS_ENDPOINT, {
    params,
  });

export const approveAdminReview = (reviewId) =>
  api.put(`${REVIEWS_ENDPOINT}/${reviewId}/approve`);

export const deleteAdminReview = (reviewId) =>
  api.delete(`${REVIEWS_ENDPOINT}/${reviewId}`);

export const extractReviews = (response) => {
  const payload = response?.data;

  const possibleLists = [
    payload?.data?.items,
    payload?.data?.reviews,
    payload?.items,
    payload?.reviews,
    payload?.data,
    payload,
  ];

  return (
    possibleLists.find((item) => Array.isArray(item)) || []
  );
};

export const extractReview = (response) => {
  const payload = response?.data;

  return (
    payload?.data?.review ||
    payload?.review ||
    payload?.data ||
    payload ||
    null
  );
};