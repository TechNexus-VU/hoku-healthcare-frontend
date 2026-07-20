import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000/api";

export const TOKEN_KEYS = {
  doctor: "doctor-token",
  patient: "patient-token",
  admin: "admin-token",
};

const LOGIN_ROUTES = {
  doctor: "/doctor/login",
  patient: "/patient/login",
  admin: "/admin/login",
};

const getPortalFromPath = () => {
  const pathname = window.location.pathname.toLowerCase();

  if (pathname.startsWith("/admin")) {
    return "admin";
  }

  if (pathname.startsWith("/patient")) {
    return "patient";
  }

  if (pathname.startsWith("/doctor")) {
    return "doctor";
  }

  return null;
};

const getAvailablePortal = () => {
  const pathPortal = getPortalFromPath();

  if (
    pathPortal &&
    localStorage.getItem(TOKEN_KEYS[pathPortal])
  ) {
    return pathPortal;
  }

  if (localStorage.getItem(TOKEN_KEYS.admin)) {
    return "admin";
  }

  if (localStorage.getItem(TOKEN_KEYS.doctor)) {
    return "doctor";
  }

  if (localStorage.getItem(TOKEN_KEYS.patient)) {
    return "patient";
  }

  return pathPortal || "doctor";
};

const getTokenForPortal = (portal) => {
  const tokenKey = TOKEN_KEYS[portal];

  if (!tokenKey) {
    return null;
  }

  return localStorage.getItem(tokenKey);
};

const clearPortalAuthentication = (portal) => {
  const tokenKey = TOKEN_KEYS[portal];

  if (tokenKey) {
    localStorage.removeItem(tokenKey);
  }
};

const extractAccessToken = (response) =>
  response?.data?.data?.access_token ||
  response?.data?.data?.accessToken ||
  response?.data?.access_token ||
  response?.data?.accessToken ||
  response?.data?.token ||
  null;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const portal = getAvailablePortal();
    const token = getTokenForPortal(portal);

    /*
     * Store the portal on the request so the response
     * interceptor knows which token to refresh.
     */
    config.authPortal = portal;

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let refreshPromise = null;

const refreshAccessToken = async (portal) => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      )
      .then((response) => {
        const newToken = extractAccessToken(response);

        if (!newToken) {
          throw new Error(
            "Refresh endpoint did not return an access token."
          );
        }

        localStorage.setItem(
          TOKEN_KEYS[portal],
          newToken
        );

        return newToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const isUnauthorized = status === 401;

    const requestUrl =
      originalRequest.url?.toLowerCase() || "";

    const isRefreshRequest =
      requestUrl.includes("/auth/refresh");

    if (
      !isUnauthorized ||
      originalRequest._retry ||
      isRefreshRequest
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const portal =
      originalRequest.authPortal ||
      getAvailablePortal();

    try {
      const newToken =
        await refreshAccessToken(portal);

      originalRequest.headers =
        originalRequest.headers || {};

      originalRequest.headers.Authorization =
        `Bearer ${newToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      /*
       * Save the correct login route before clearing
       * the authentication data.
       */
      const loginRoute =
        LOGIN_ROUTES[portal] ||
        "/doctor/login";

      clearPortalAuthentication(portal);

      window.location.replace(loginRoute);

      return Promise.reject(refreshError);
    }
  }
);

export default api;