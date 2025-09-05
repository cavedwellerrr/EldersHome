import React from "react";
import AdminNavbar from "../components/staff/AdminNavbar";

const AdminLayout = ({ children }) => {
  return (
    <div>
      <AdminNavbar />
      <main  className="p-0 min-h-screen" data-theme="light">{children}</main>
    </div>
  );
};

export default AdminLayout;
