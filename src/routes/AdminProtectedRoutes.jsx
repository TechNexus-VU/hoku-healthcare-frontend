import {
    Navigate,
    Outlet,
    useLocation,
  } from "react-router-dom";
  
  import {
    clearAdminAuthentication,
    getAdminToken,
    getCurrentAdmin,
    isAdminRole,
  } from "@/services/adminAuthApi";
  
  export default function AdminProtectedRoute() {
    const location = useLocation();
  
    const token = getAdminToken();
    const admin = getCurrentAdmin();
  
    const hasAdminAccess =
      Boolean(token) &&
      Boolean(admin) &&
      isAdminRole(admin.role);
  
    if (!hasAdminAccess) {
      clearAdminAuthentication();
  
      return (
        <Navigate
          to="/admin/login"
          replace
          state={{ from: location }}
        />
      );
    }
  
    return <Outlet />;
  }