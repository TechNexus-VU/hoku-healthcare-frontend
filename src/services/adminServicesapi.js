import api from "./api";

const SERVICES_ENDPOINT = "/services";

export const getAdminServices = (params = {}) =>
  api.get(SERVICES_ENDPOINT, {
    params,
  });

export const getAdminServiceById = (serviceId) =>
  api.get(`${SERVICES_ENDPOINT}/${serviceId}`);

export const createAdminService = (payload) =>
  api.post(SERVICES_ENDPOINT, payload);

export const updateAdminService = (
  serviceId,
  payload
) =>
  api.put(
    `${SERVICES_ENDPOINT}/${serviceId}`,
    payload
  );

export const deleteAdminService = (serviceId) =>
  api.delete(`${SERVICES_ENDPOINT}/${serviceId}`);

export const extractServices = (response) => {
  const payload = response?.data;

  const possibleLists = [
    payload?.data?.items,
    payload?.data?.services,
    payload?.items,
    payload?.services,
    payload?.data,
    payload,
  ];

  return (
    possibleLists.find((item) =>
      Array.isArray(item)
    ) || []
  );
};

export const extractService = (response) => {
  const payload = response?.data;

  return (
    payload?.data?.service ||
    payload?.service ||
    payload?.data ||
    payload ||
    null
  );
};