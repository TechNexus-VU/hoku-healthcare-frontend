import api from "./api";

const DOCTOR_PATIENTS_ENDPOINT =
  "/doctor/patients";

export const getDoctorPatients = (
  params = {}
) =>
  api.get(DOCTOR_PATIENTS_ENDPOINT, {
    params,
  });

export const getDoctorPatient = (
  patientId
) =>
  api.get(
    `${DOCTOR_PATIENTS_ENDPOINT}/${patientId}`
  );

export const getDoctorPatientAppointments = (
  patientId
) =>
  api.get(
    `${DOCTOR_PATIENTS_ENDPOINT}/${patientId}/appointments`
  );

export const extractDoctorPatients = (
  response
) => {
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
    possibleLists.find(Array.isArray) || []
  );
};

export const extractDoctorPatient = (
  response
) => {
  const payload = response?.data;

  return (
    payload?.data?.patient ||
    payload?.patient ||
    payload?.data ||
    payload ||
    null
  );
};

export const extractPatientAppointments = (
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
    possibleLists.find(Array.isArray) || []
  );
};