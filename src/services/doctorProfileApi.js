import api from "./api";

const DOCTOR_PROFILE_ENDPOINT =
  "/doctor/profile";

export const getDoctorProfile = () =>
  api.get(DOCTOR_PROFILE_ENDPOINT);

export const updateDoctorProfile = (
  profileData
) =>
  api.put(
    DOCTOR_PROFILE_ENDPOINT,
    profileData
  );

export const extractDoctorProfile = (
  response
) =>
  response?.data?.data ||
  response?.data ||
  null;