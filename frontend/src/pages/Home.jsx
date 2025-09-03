import React, { useContext } from "react";
import HappyNurse from "../assets/happy_nurse.jpg";
import { ThemeContext } from "../context/ThemeContext"; // Import the context

const Home = () => {
  const { theme } = useContext(ThemeContext); // Access the current theme

  // Determine text color based on theme
  const textColor = theme === "dark" ? "text-gray-300" : "text-gray-700";
  const cardTextColor = theme === "dark" ? "text-gray-400" : "text-gray-600";

  return (
    <div className="min-h-screen bg-base-100 text-base-content p-10">
      <div className="max-w-4xl mx-auto text-center">
        <img
          src={HappyNurse}
          alt="Happy nurse with elderly"
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
        <h1 className={`text-5xl font-bold mb-6 text-primary ${textColor}`}>
          Welcome to EldersHome
        </h1>
        <p className={`text-xl mb-8 ${textColor}`}>
          A compassionate home providing exceptional care and support for our elders.
          Explore our services, events, and ways to get involved.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card bg-base-200 p-6 shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
            <h2 className={`text-2xl font-semibold mb-2 ${textColor}`}>Quality Care</h2>
            <p className={`text-gray-600 ${cardTextColor}`}>Dedicated staff ensuring the well-being of every elder.</p>
          </div>
          <div className="card bg-base-200 p-6 shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
            <h2 className={`text-2xl font-semibold mb-2 ${textColor}`}>Community Events</h2>
            <p className={`text-gray-600 ${cardTextColor}`}>Join us for engaging activities and celebrations.</p>
          </div>
          <div className="card bg-base-200 p-6 shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
            <h2 className={`text-2xl font-semibold mb-2 ${textColor}`}>Support Us</h2>
            <p className={`text-gray-600 ${cardTextColor}`}>Donate or volunteer to make a difference.</p>
          </div>
        </div>
        <div className="space-x-4">
          <a href="/about" className="btn btn-primary transition-transform duration-300 cursor-pointer">Learn More</a>
          <a href="/donations" className="btn btn-secondary transition-transform duration-300 cursor-pointer">Donate Now</a>
          <a href="/events" className="btn btn-accent transition-transform duration-300 cursor-pointer">View Events</a>
        </div>
      </div>
    </div>
  );
};

export default Home;