import React from "react";
import CaretakerNavbar from "../components/staff/CaretakerNavbar";

const CaretakerLayout = ({ children }) => {
  return (
    <div>
      <CaretakerNavbar />
      <main className="p-0 min-h-screen" data-theme="light">{children}</main>
    </div>
  );
};

export default CaretakerLayout;
