import api from "./api";

const ADMIN_DOCTORS_ENDPOINT = "/admin/doctors";

/**
 * GET /api/admin/doctors
 */
export const getAdminDoctors = (params = {}) => {
  return api.get(ADMIN_DOCTORS_ENDPOINT, {
    params,
  });
};

/**
 * GET /api/admin/doctors/:id
 */
export const getAdminDoctorById = (id) => {
  return api.get(`${ADMIN_DOCTORS_ENDPOINT}/${id}`);
};

/**
 * POST /api/admin/doctors
 */
export const createAdminDoctor = (payload) => {
  return api.post(ADMIN_DOCTORS_ENDPOINT, payload);
};

/**
 * PUT /api/admin/doctors/:id
 */
export const updateAdminDoctor = (id, payload) => {
  return api.put(
    `${ADMIN_DOCTORS_ENDPOINT}/${id}`,
    payload
  );
};

/**
 * PATCH /api/admin/doctors/:id/availability
 */
export const updateAdminDoctorAvailability = (
  id,
  available
) => {
  return api.patch(
    `${ADMIN_DOCTORS_ENDPOINT}/${id}/availability`,
    {
      available,
    }
  );
};

/**
 * DELETE /api/admin/doctors/:id
 */
export const deleteAdminDoctor = (id) => {
  return api.delete(`${ADMIN_DOCTORS_ENDPOINT}/${id}`);
};

/**
 * Safely extracts the doctors array from different API responses.
 */
export const extractDoctors = (response) => {
  const payload = response?.data;

  const possibleLists = [
    payload?.data?.items,
    payload?.data?.doctors,
    payload?.items,
    payload?.doctors,
    payload?.data,
    payload,
  ];

  return (
    possibleLists.find((item) => Array.isArray(item)) || []
  );
};

/**
 * Safely extracts one doctor from a create/update response.
 */
export const extractDoctor = (response) => {
  const payload = response?.data;

  return (
    payload?.data?.doctor ||
    payload?.doctor ||
    payload?.data ||
    payload ||
    null
  );
};