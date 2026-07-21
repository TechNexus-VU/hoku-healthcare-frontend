import api from "./api";

/* Doctor dashboard */
export const getDashboardData = () =>
  api.get("/doctor/dashboard");

/* Doctor appointments */
export const getAppointments = (
  params = {}
) =>
  api.get("/doctor/appointments", {
    params,
  });

export const getAppointmentById = (
  appointmentId
) =>
  api.get(
    `/doctor/appointments/${appointmentId}`
  );

export const updateAppointment = (
  appointmentId,
  payload
) => {
  const status =
    typeof payload === "string"
      ? payload
      : payload?.status;

  return api.put(
    `/doctor/appointments/${appointmentId}/status`,
    {
      status,
    }
  );
};

/* Doctor patients */
export const getPatients = (
  params = {}
) =>
  api.get("/doctor/patients", {
    params,
  });

export const getPatientById = (
  patientId
) =>
  api.get(
    `/doctor/patients/${patientId}`
  );

export const getPatientAppointments = (
  patientId
) =>
  api.get(
    `/doctor/patients/${patientId}/appointments`
  );

/* Doctor availability */
export const getAvailability = () =>
  api.get("/doctor/availability");

export const updateAvailability = (
  availability
) =>
  api.put("/doctor/availability", {
    availability,
  });

/* Doctor profile */
export const getProfile = () =>
  api.get("/doctor/profile");

export const updateProfile = (
  payload
) =>
  api.put("/doctor/profile", payload);


export const registerDoctor = (payload) =>
  api.post("/auth/register/doctor", payload);

export const loginDoctor = (credentials) =>
  api.post("/auth/login", credentials);