import api from "./api";

const ADMIN_PATIENTS_ENDPOINT = "/admin/patients";

export const getAdminPatients = (params = {}) =>
  api.get(ADMIN_PATIENTS_ENDPOINT, {
    params,
  });

export const updateAdminPatientStatus = (
  patientId,
  isActive
) =>
  api.put(
    `${ADMIN_PATIENTS_ENDPOINT}/${patientId}/status`,
    {
      is_active: isActive,
    }
  );

export const extractPatients = (response) => {
  const payload = response?.data;

  const possibleLists = [
    payload?.data?.items,
    payload?.data?.patients,
    payload?.items,
    payload?.patients,
    payload?.data,
    payload,
  ];

  return (
    possibleLists.find((item) =>
      Array.isArray(item)
    ) || []
  );
};

export const extractPatient = (response) => {
  const payload = response?.data;

  return (
    payload?.data?.patient ||
    payload?.patient ||
    payload?.data ||
    payload ||
    null
  );
};