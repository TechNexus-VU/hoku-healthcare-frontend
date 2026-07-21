import api from "./api";

const DOCTOR_AVAILABILITY_ENDPOINT =
  "/doctor/availability";

export const getDoctorAvailability = () =>
  api.get(DOCTOR_AVAILABILITY_ENDPOINT);

export const updateDoctorAvailability = (
  availability
) =>
  api.put(DOCTOR_AVAILABILITY_ENDPOINT, {
    availability,
  });

export const extractDoctorAvailability = (
  response
) => {
  const payload = response?.data;

  const availability =
    payload?.data?.availability ||
    payload?.availability ||
    payload?.data ||
    [];

  return Array.isArray(availability)
    ? availability
    : [];
};