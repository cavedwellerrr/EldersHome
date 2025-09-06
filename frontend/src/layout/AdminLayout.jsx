import React from "react";
import AdminNavbar from "../components/staff/AdminNavbar";

const AdminLayout = ({ children }) => {
  return (
<div data-theme="forest" className="min-h-screen bg-base-200 text-base-content">
        <AdminNavbar />
      <main className="p-6">{children}</main>
    </div>
  );
};

export default AdminLayout;
