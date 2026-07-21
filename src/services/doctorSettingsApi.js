import api from "./api";

const CHANGE_PASSWORD_ENDPOINT =
  "/doctor/change-password";

export const changeDoctorPassword = (
  passwordData
) =>
  api.put(
    CHANGE_PASSWORD_ENDPOINT,
    passwordData
  );