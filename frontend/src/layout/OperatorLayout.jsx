import React from "react";
import OperatorNavbar from "../components/staff/OperatorNavbar";

const OperatorLayout = ({ children }) => {
  return (
    <div>
      <OperatorNavbar />
      <main className="p-6">{children}</main>
    </div>
  );
};

export default OperatorLayout;
