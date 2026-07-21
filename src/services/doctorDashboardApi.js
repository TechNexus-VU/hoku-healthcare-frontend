import api from "./api";

const DOCTOR_DASHBOARD_ENDPOINT =
  "/doctor/dashboard";

export const getDoctorDashboard = () =>
  api.get(DOCTOR_DASHBOARD_ENDPOINT);

export const extractDoctorDashboard = (
  response
) =>
  response?.data?.data ||
  response?.data ||
  {};

export const extractDoctorStatistics = (
  response
) => {
  const dashboard =
    extractDoctorDashboard(response);

  return dashboard?.statistics || {};
};

export const extractDoctorAppointments = (
  response
) => {
  const dashboard =
    extractDoctorDashboard(response);

  if (
    Array.isArray(
      dashboard?.upcoming_appointments
    )
  ) {
    return dashboard.upcoming_appointments;
  }

  if (
    Array.isArray(
      dashboard?.recent_appointments
    )
  ) {
    return dashboard.recent_appointments;
  }

  return [];
};

export const extractRecentPatients = (
  response
) => {
  const dashboard =
    extractDoctorDashboard(response);

  return Array.isArray(
    dashboard?.recent_patients
  )
    ? dashboard.recent_patients
    : [];
};