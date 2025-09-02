import React from "react";
import CaretakerNavbar from "../components/staff/CaretakerNavbar";

const CaretakerLayout = ({ children }) => {
  return (
    <div>
      <CaretakerNavbar />
      <main className="p-6">{children}</main>
    </div>
  );
};

export default CaretakerLayout;
