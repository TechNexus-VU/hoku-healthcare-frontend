import api from "./api";

const DOCTOR_APPOINTMENTS_ENDPOINT =
  "/doctor/appointments";

export const getDoctorAppointments = (
  params = {}
) =>
  api.get(DOCTOR_APPOINTMENTS_ENDPOINT, {
    params,
  });

export const getDoctorAppointment = (
  appointmentId
) =>
  api.get(
    `${DOCTOR_APPOINTMENTS_ENDPOINT}/${appointmentId}`
  );

export const updateDoctorAppointmentStatus = (
  appointmentId,
  status
) =>
  api.put(
    `${DOCTOR_APPOINTMENTS_ENDPOINT}/${appointmentId}/status`,
    {
      status,
    }
  );

export const extractDoctorAppointments = (
  response
) => {
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

export const extractDoctorAppointment = (
  response
) => {
  const payload = response?.data;

  return (
    payload?.data?.appointment ||
    payload?.appointment ||
    payload?.data ||
    payload ||
    null
  );
};