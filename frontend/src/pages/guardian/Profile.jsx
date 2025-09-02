import React, { useContext, useEffect } from "react";
import { useNavigate,Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import CreateElderRequest from "./CreateElderRequest";

const Profile = () => {
  const { auth, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !auth) {
      // Redirect to login if not logged in
      navigate("/login");
    }
  }, [auth, loading, navigate]);

  if (loading) return <p>Loading...</p>;
  if (!auth) return null; // will redirect anyway

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Welcome, {auth.name}</h2>
      <p>Email: {auth.email}</p>
      <p>Phone: {auth.phone}</p>
      <p>Address: {auth.address}</p>

      <div className="mt-4 flex flex-col gap-2">
        {/* Button to navigate to Create Elder Request page */}
        <Link
          to="/elder-request/create"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-500 text-center"
        >
          Create Elder Request
        </Link>

        {/* Logout button */}
        <button
          onClick={logout}
          className="bg-red-600 text-white p-2 rounded hover:bg-red-500"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
