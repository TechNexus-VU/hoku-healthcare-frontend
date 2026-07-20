import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";
import DoctorLayout from "@/layouts/DoctorLayout";

import Home from "@/pages/HomePage";
import Services from "@/pages/ServicesPage";
import ServiceDetailsPage from "@/pages/ServiceDetailsPage";
import Contact from "@/pages/ContactPage";
import Specialists from "@/pages/SpecialistsPage";

import Dashboard from "@/pages/doctor/Dashboard";
import Appointments from "@/pages/doctor/Appointments";
import PatientHistory from "@/pages/doctor/PatientHistory";
import Availability from "@/pages/doctor/Availability";
import Profile from "@/pages/doctor/Profile";

import DoctorLogin from "@/pages/auth/DoctorLogin";
import DoctorRegister from "@/pages/auth/DoctorRegister";
import PatientLogin from "@/pages/auth/PatientLogin";
import PatientRegister from "@/pages/auth/PatientRegister";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";

import AdminDashboardPage from "@/pages/AdminDashboard";
import AdminLogin from "@/pages/auth/AdminLogin";
import AdminProtectedRoute from "./AdminProtectedRoutes";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* =========================
          Public website
      ========================== */}
      <Route element={<MainLayout />}>
        <Route
          index
          element={<Home />}
        />

        <Route
          path="/services"
          element={<Services />}
        />

        <Route
          path="/services/:slug"
          element={<ServiceDetailsPage />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

        <Route
          path="/specialists"
          element={<Specialists />}
        />
      </Route>

      {/* =========================
          Public authentication
      ========================== */}
      <Route
        path="/doctor/login"
        element={<DoctorLogin />}
      />

      <Route
        path="/doctor/register"
        element={<DoctorRegister />}
      />

      <Route
        path="/patient/login"
        element={<PatientLogin />}
      />

      <Route
        path="/patient/register"
        element={<PatientRegister />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

      {/* =========================
          Admin authentication
      ========================== */}
      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />

      {/* =========================
          Protected Admin portal
      ========================== */}
      <Route element={<AdminProtectedRoute />}>
        <Route
          path="/admin"
          element={
            <Navigate
              to="/admin/dashboard"
              replace
            />
          }
        />

        <Route
          path="/admin/dashboard"
          element={<AdminDashboardPage />}
        />
      </Route>

      {/* =========================
          Protected Doctor portal
      ========================== */}
      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <RoleRoute
              allowedRoles={["doctor"]}
            />
          }
        >
          <Route
            path="/doctor"
            element={<DoctorLayout />}
          >
            <Route
              index
              element={
                <Navigate
                  to="dashboard"
                  replace
                />
              }
            />

            <Route
              path="dashboard"
              element={<Dashboard />}
            />

            <Route
              path="appointments"
              element={<Appointments />}
            />

            <Route
              path="patients"
              element={<PatientHistory />}
            />

            <Route
              path="availability"
              element={<Availability />}
            />

            <Route
              path="profile"
              element={<Profile />}
            />

            <Route
              path="settings"
              element={
                <div className="rounded-[28px] border border-border bg-white p-6 shadow-soft">
                  Settings page coming soon.
                </div>
              }
            />
          </Route>
        </Route>
      </Route>

      {/* =========================
          Unknown route
      ========================== */}
      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
};

export default AppRoutes;