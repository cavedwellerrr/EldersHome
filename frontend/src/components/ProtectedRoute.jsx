import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="staff/login" />;
  }

  if (!allowedRoles.includes(role)) {
    // redirect user to their own dashboard if role mismatch
    switch (role) {
      case "admin":
        return <Navigate to="/staff/admin-dashboard" />;
      case "operator":
        return <Navigate to="/staff/operator-dashboard" />;
      case "caretaker":
        return <Navigate to="/staff/caretaker-dashboard" />;
      case "doctor":
        return <Navigate to="/staff/doctor-dashboard" />;
      default:
        return <Navigate to="/staff/login" />;
    }
  }

  return children;
};

export default ProtectedRoute;
