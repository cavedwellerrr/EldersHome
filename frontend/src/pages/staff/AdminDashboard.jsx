
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const name = localStorage.getItem("staffName");
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {name}</p>
      <Link to="/staff-register">
        <button>Register New Staff</button>
      </Link>
      
      <Link to="/view-staff" className="btn btn-info m-2">
            View Staff Members
      </Link>
    </div>
  );
};

export default AdminDashboard;
