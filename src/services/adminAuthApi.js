import api from "./api";

export const ADMIN_TOKEN_KEY = "admin-token";
export const ADMIN_USER_KEY = "hoku-admin-user";

export const loginAdmin = (credentials) =>
  api.post("/auth/login", credentials);

export const getAdminToken = () =>
  localStorage.getItem(ADMIN_TOKEN_KEY);

export const getCurrentAdmin = () => {
  try {
    const storedAdmin = localStorage.getItem(
      ADMIN_USER_KEY
    );

    return storedAdmin
      ? JSON.parse(storedAdmin)
      : null;
  } catch (error) {
    console.error(
      "Unable to read Admin information:",
      error
    );

    return null;
  }
};

export const saveAdminAuthentication = (
  token,
  user
) => {
  if (!token || !user) {
    return;
  }

  localStorage.setItem(
    ADMIN_TOKEN_KEY,
    token
  );

  localStorage.setItem(
    ADMIN_USER_KEY,
    JSON.stringify(user)
  );
};

export const clearAdminAuthentication = () => {
  localStorage.removeItem(
    ADMIN_TOKEN_KEY
  );

  localStorage.removeItem(
    ADMIN_USER_KEY
  );
};

export const extractLoginData = (response) => {
  const payload = response?.data;

  const token =
    payload?.data?.access_token ||
    payload?.data?.accessToken ||
    payload?.data?.token ||
    payload?.access_token ||
    payload?.accessToken ||
    payload?.token ||
    null;

  const user =
    payload?.data?.user ||
    payload?.user ||
    null;

  return {
    token,
    user,
  };
};

export const isAdminRole = (role) => {
  const normalizedRole = String(role || "")
    .trim()
    .toLowerCase();

  return [
    "admin",
    "super_admin",
    "super-admin",
  ].includes(normalizedRole);
};

export const isAdminAuthenticated = () => {
  const token = getAdminToken();
  const admin = getCurrentAdmin();

  return Boolean(
    token &&
      admin &&
      isAdminRole(admin.role)
  );
};