import api from "./api";

const APPOINTMENTS_ENDPOINT = "/appointments";

export const getAdminAppointments = (params = {}) =>
  api.get(APPOINTMENTS_ENDPOINT, {
    params,
  });

export const updateAdminAppointmentStatus = (
  appointmentId,
  status
) =>
  api.put(
    `${APPOINTMENTS_ENDPOINT}/${appointmentId}/status`,
    {
      status: String(status).toLowerCase(),
    }
  );

export const extractAppointments = (response) => {
  const payload = response?.data;

  const possibleLists = [
    payload?.data?.items,
    payload?.data?.appointments,
    payload?.items,
    payload?.appointments,
    payload?.data,
    payload,
  ];

  return (
    possibleLists.find((item) =>
      Array.isArray(item)
    ) || []
  );
};

export const extractAppointment = (response) => {
  const payload = response?.data;

  return (
    payload?.data?.appointment ||
    payload?.appointment ||
    payload?.data ||
    payload ||
    null
  );
};