import React, { useContext } from "react";
import { User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Left links */}
        <div className="flex items-center space-x-6 text-lg font-medium">
          <Link to="/" className="transition hover:text-yellow-200">Home</Link>
          <Link to="/events" className="transition hover:text-yellow-200">Events</Link>
          <Link to="/donations" className="transition hover:text-yellow-200">Donations</Link>
          <Link to="/about" className="transition hover:text-yellow-200">About Us</Link>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-5 text-lg font-medium">
          {auth ? (
            <>
              <Link
                to="/profile"
                className="flex items-center space-x-2 transition hover:text-yellow-200"
              >
                <User size={22} />
                <span>{auth.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 transition hover:text-yellow-200"
              >
                <LogOut size={22} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center space-x-2 transition hover:text-yellow-200"
            >
              <User size={22} />
              <span>Profile</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
