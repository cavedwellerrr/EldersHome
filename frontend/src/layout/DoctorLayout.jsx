import React from "react";
import DoctorNavbar from "../components/staff/DoctorNavbar";

const DoctorLayout = ({ children }) => {
  return (
    <div>
      <DoctorNavbar />
      <main  className="p-0 min-h-screen" data-theme="light">{children}</main>
    </div>
  );
};

export default DoctorLayout;
