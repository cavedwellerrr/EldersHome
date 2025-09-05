import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// Public pages
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import Donations from "./pages/Donations";
import Events from "./pages/Events";


// Guardian pages
import Login from "./pages/guardian/Login";
import Register from "./pages/guardian/Register";
import Profile from "./pages/guardian/Profile";
import ElderRegisterPage from "./pages/elderRegister";

// Staff pages
import StaffLogin from "./pages/staff/StaffLogin";
import AdminDashboard from "./pages/staff/AdminDashboard";
import ViewStaff from "./pages/staff/ViewStaff";
import StaffRegister from "./pages/staff/StaffRegister";
import OperatorDashboard from "./pages/staff/OperatorDashboard";
import CaretakerDashboard from "./pages/staff/CaretakerDashboard";
import DoctorDashboard from "./pages/staff/DoctorDashboard";
import AdminDonations from "./pages/staff/AdminDonations";
import AdminEvents from "./pages/staff/AdminEvents";

//caretaker
import CaretakerMeals from "./pages/staff/CaretakerMeals";
import CaretakerEvents from "./pages/staff/CaretakerEvents";
// import CaretakerRooms from "./pages/staff/CaretakerRooms";
import AssignedElders from "./pages/staff/AssignedElders";
import ElderProfile from "./pages/staff/ElderProfile";

//Doctor
import DoctorAppointments from "./pages/staff/DoctorAppointments";
import DoctorConsultations from "./pages/staff/DoctorConsultations";
import DoctorElders from "./pages/staff/DoctorElders";

//Operator
import AssignCaretakers from "./pages/staff/AssignCaretakers";
import PendingPaymentsDashboard from "./pages/staff/PendingPaymentsDashboard";
import OperatorRooms from "./pages/staff/OperatorRooms"

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layout/AdminLayout";
import CaretakerLayout from "./layout/CaretakerLayout";
import DoctorLayout from "./layout/DoctorLayout";
import OperatorLayout from "./layout/OperatorLayout";

const App = () => {
  const location = useLocation();

  // Hide main site navbar for all staff routes
  const showNavbar = !location.pathname.startsWith("/staff");

  return (
    <>

      {showNavbar && <Navbar />}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/donations" element={<Donations />} />
        <Route path="/events" element={<Events />} />


        {/* Guardian routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/elder-register" element={<ElderRegisterPage />} />

        {/* Staff routes */}
        <Route path="/staff/login" element={<StaffLogin />} />

        {/* Admin routes with layout */}
        <Route
          path="/staff/admin-dashboard/*"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <Routes>
                  <Route index element={<AdminDashboard />} />
                  <Route path="view-staff" element={<ViewStaff />} />
                  <Route path="staff-register" element={<StaffRegister />} />
                  <Route path="donations" element={<AdminDonations />} />
                  <Route path="events" element={<AdminEvents />} />
                  {/* <Route path="donations" element={<AdminDonations />} /> */}
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Operator / Caretaker / Doctor */}
        <Route
          path="/staff/operator-dashboard/*"
          element={
            <ProtectedRoute allowedRoles={["operator"]}>
              <OperatorLayout>
                <Routes>
                  <Route index element={<OperatorDashboard />} />
                  <Route path="elder-requests" element={<PendingPaymentsDashboard />} />
                  <Route path="assign-caretaker" element={<AssignCaretakers />} />
                  <Route path="manage-rooms" element={<OperatorRooms />} />
                </Routes>
              </OperatorLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/caretaker-dashboard/*"
          element={
            <ProtectedRoute allowedRoles={["caretaker"]}>
              <CaretakerLayout>
                <Routes>
                  <Route index element={<CaretakerDashboard />} />
                  <Route path="assigned-elders" element={<AssignedElders />} />
                  <Route path="meals" element={<CaretakerMeals />} />
                  {/* <Route path="rooms" element={<CaretakerRooms />} /> */}
                  <Route path="events" element={<CaretakerEvents />} />
                  <Route path="elders/:id" element={<ElderProfile />} />
                </Routes>
              </CaretakerLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/doctor-dashboard/*"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorLayout>
                <Routes>
                  <Route index element={<DoctorDashboard />} />
                  <Route path="elders" element={<DoctorElders />} />
                  {/* <Route path="elders/:elderId" element={<ElderProfile />} /> */}
                  <Route path="appointments" element={<DoctorAppointments />} />
                  <Route path="consultations" element={<DoctorConsultations />} />
                </Routes>
              </DoctorLayout>
            </ProtectedRoute>
          }
        />
      </Routes>

    </>
  );
};

export default App;
