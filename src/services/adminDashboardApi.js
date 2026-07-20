import api from "./api";

const ADMIN_DASHBOARD_ENDPOINT = "/admin/dashboard";

export const getAdminDashboard = () =>
  api.get(ADMIN_DASHBOARD_ENDPOINT);

export const extractAdminDashboard = (response) =>
  response?.data?.data ||
  response?.data ||
  {};