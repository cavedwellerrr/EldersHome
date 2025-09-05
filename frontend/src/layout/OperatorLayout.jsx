import React from "react";
import OperatorNavbar from "../components/staff/OperatorNavbar";

const OperatorLayout = ({ children }) => {
  return (
    <div>
      <OperatorNavbar />
      <main className="p-0 min-h-screen" data-theme="light">{children}</main>
    </div>
  );
};

export default OperatorLayout;
