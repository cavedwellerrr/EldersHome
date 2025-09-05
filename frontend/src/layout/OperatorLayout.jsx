import React from "react";
import OperatorNavbar from "../components/staff/OperatorNavbar";

const OperatorLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#FFF7F2] text-neutral-800">

      <OperatorNavbar />
      <main className="p-6">{children}</main>
    </div>
  );
};

export default OperatorLayout;
