import React from "react";
import { Toaster } from "react-hot-toast";
import CaretakerNavbar from "../components/staff/CaretakerNavbar";

const CaretakerLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#FFF7F2] text-neutral-800">
      <CaretakerNavbar />


      {/* 🔔 Caretaker-only toaster */}
      <Toaster
        position="top-right"
        toastOptions={{
          className:
            "border rounded-xl shadow-md text-sm font-medium tracking-tight",
          style: {
            background: "#FFFFFF",         // white surface
            color: "#1F1F1F",              // neutral text
            borderColor: "#F4D7C8",        // soft peach border
          },
          success: {
            iconTheme: {
              primary: "#F29B77",          // orange accent
              secondary: "#FFFFFF",        // white inner icon
            },
          },
          error: {
            iconTheme: {
              primary: "#E34242",          // soft red for errors
              secondary: "#FFFFFF",
            },
          },
        }}
      />


      <main className="p-6">{children}</main>
    </div>
  );
};

export default CaretakerLayout;
