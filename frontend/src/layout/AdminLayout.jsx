import React from "react";
import AdminNavbar from "../components/staff/AdminNavbar";

const AdminLayout = ({ children }) => {
  return (
    <div>
      <AdminNavbar />
      <main className="p-6">{children}</main>
    </div>
  );
};

export default AdminLayout;
