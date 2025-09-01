import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/guardian/Login";
import Register from "./pages/guardian/Register";
import Profile from "./pages/guardian/Profile";
import AboutUs from "./pages/AboutUs";
import Donations from "./pages/Donations";
import Events from "./pages/Events";

import StaffLogin from "./pages/staff/StaffLogin";
import StaffRegister from "./pages/staff/StaffRegister";
import ViewStaff from "./pages/staff/ViewStaff";

import AdminDashboard from "./pages/staff/AdminDashboard";
import OperatorDashboard from "./pages/staff/OperatorDashboard";
import CaretakerDashboard from "./pages/staff/CaretakerDashboard";
import DoctorDashboard from "./pages/staff/DoctorDashboard";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/donations" element={<Donations />} />
        <Route path="/events" element={<Events />} />

        {/* Guardian protected routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["guardian"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Staff routes */}
        <Route path="/staff/login" element={<StaffLogin />} />

        {/* Separate dashboards by role */}
        <Route
          path="/staff/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/operator-dashboard"
          element={
            <ProtectedRoute allowedRoles={["operator"]}>
              <OperatorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/caretaker-dashboard"
          element={
            <ProtectedRoute allowedRoles={["caretaker"]}>
              <CaretakerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/doctor-dashboard"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Staff management routes (only admin should access usually) */}
        <Route
          path="/staff/staff-register"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <StaffRegister />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/view-staff"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ViewStaff />
            </ProtectedRoute>
          }
        />
      </Routes>
      {/* <Footer /> */}
    </>
  );
};

export default App;
