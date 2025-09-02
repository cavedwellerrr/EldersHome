import React from "react";
import DoctorNavbar from "../components/staff/DoctorNavbar";

const DoctorLayout = ({ children }) => {
  return (
    <div>
      <DoctorNavbar />
      <main className="p-6">{children}</main>
    </div>
  );
};

export default DoctorLayout;
