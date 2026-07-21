import {
    useCallback,
    useEffect,
    useState,
  } from "react";
  
  import {
    Outlet,
    useLocation,
    useNavigate,
  } from "react-router-dom";
  
  import Sidebar from "@/components/admin/dashboard/Sidebar";
  import Topbar from "@/components/admin/dashboard/Topbar";
  
  import DashboardContainer from "@/components/common/DashboardContainer";
  
  import {
    clearAdminAuthentication,
    getCurrentAdmin,
  } from "@/services/adminAuthApi";
  
  const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] =
      useState(false);
  
    const location = useLocation();
    const navigate = useNavigate();
  
    const admin = getCurrentAdmin();
  
    const openSidebar = useCallback(() => {
      setSidebarOpen(true);
    }, []);
  
    const closeSidebar = useCallback(() => {
      setSidebarOpen(false);
    }, []);
  
    const handleLogout = useCallback(() => {
      clearAdminAuthentication();
  
      navigate("/admin/login", {
        replace: true,
      });
    }, [navigate]);
  
    // Close the mobile sidebar after route navigation.
    useEffect(() => {
      setSidebarOpen(false);
    }, [location.pathname]);
  
    // Close the mobile sidebar when switching
    // to the desktop breakpoint.
    useEffect(() => {
      const desktopMediaQuery =
        window.matchMedia(
          "(min-width: 1024px)"
        );
  
      const handleViewportChange = (
        event
      ) => {
        if (event.matches) {
          setSidebarOpen(false);
        }
      };
  
      desktopMediaQuery.addEventListener(
        "change",
        handleViewportChange
      );
  
      return () => {
        desktopMediaQuery.removeEventListener(
          "change",
          handleViewportChange
        );
      };
    }, []);
  
    // Lock page scrolling and support Escape
    // while the mobile sidebar is open.
    useEffect(() => {
      if (!sidebarOpen) {
        return undefined;
      }
  
      const previousOverflow =
        document.body.style.overflow;
  
      const handleEscape = (event) => {
        if (event.key === "Escape") {
          setSidebarOpen(false);
        }
      };
  
      document.body.style.overflow =
        "hidden";
  
      document.addEventListener(
        "keydown",
        handleEscape
      );
  
      return () => {
        document.body.style.overflow =
          previousOverflow;
  
        document.removeEventListener(
          "keydown",
          handleEscape
        );
      };
    }, [sidebarOpen]);
  
    return (
      <div className="min-h-dvh bg-[var(--dashboard-bg)] font-body text-[var(--body)]">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          user={admin}
          onLogout={handleLogout}
        />
  
        <div className="flex min-h-dvh min-w-0 flex-col lg:pl-[var(--sidebar-width)]">
          <Topbar
            onMenuClick={openSidebar}
            user={admin}
            onLogout={handleLogout}
          />
  
          <main className="relative min-w-0 flex-1 overflow-x-hidden">
            <DashboardContainer>
              <div className="min-w-0">
                <Outlet />
              </div>
            </DashboardContainer>
          </main>
        </div>
      </div>
    );
  };
  
  export default AdminLayout;