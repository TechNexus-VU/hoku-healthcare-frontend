import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "@/components/doctor/Navbar";
import Sidebar from "@/components/doctor/Sidebar";

import DashboardContainer from "@/components/common/DashboardContainer";

export default function DoctorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = () => {
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Prevent background scrolling when the mobile sidebar is open
  useEffect(() => {
    if (!sidebarOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-[var(--dashboard-bg)] font-body text-[var(--body)]">
      <div className="flex min-h-screen">
        {/* Doctor sidebar */}
        <Sidebar
          open={sidebarOpen}
          onClose={closeSidebar}
        />

        {/* Main dashboard section */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Doctor top navbar */}
          <Navbar onMenuClick={openSidebar} />

          {/* Current doctor page */}
          <main className="min-w-0 flex-1 overflow-x-hidden bg-[var(--dashboard-bg)]">
            <DashboardContainer>
              <div className="min-w-0">
                <Outlet />
              </div>
            </DashboardContainer>
          </main>
        </div>
      </div>
    </div>
  );
}