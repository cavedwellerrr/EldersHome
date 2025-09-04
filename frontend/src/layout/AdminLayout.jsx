import React from "react";
import AdminNavbar from "../components/staff/AdminNavbar";

const AdminLayout = ({ children }) => {
  return (
    <div>
      <AdminNavbar />
      <main className="p-0 min-h-screen bg-base-100">{children}</main>
    </div>
  );
};

export default AdminLayout;
