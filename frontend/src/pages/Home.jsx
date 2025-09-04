import React, { useContext, useState } from "react";
import HappyNurse from "../assets/happy_nurse.jpg";
import { ThemeContext } from "../context/ThemeContext";

const Home = () => {
  const { theme } = useContext(ThemeContext);
  const textColor = theme === "dark" ? "text-gray-300" : "text-gray-700";
  const cardTextColor = theme === "dark" ? "text-gray-400" : "text-gray-600";

  // State to track which section is highlighted
  const [highlightedSection, setHighlightedSection] = useState(null);

  // Card data with titles, descriptions, section IDs, and colors
  const cards = [
    {
      title: "Quality Care",
      description: "Dedicated staff ensuring the well-being of every elder.",
      sectionId: "quality-care-details",
      bgColor: "bg-blue-200",
      hoverColor: "hover:bg-blue-300",
    },
    {
      title: "Community Events",
      description: "Join us for engaging activities and celebrations.",
      sectionId: "community-events-details",
      bgColor: "bg-green-200",
      hoverColor: "hover:bg-green-300",
    },
    {
      title: "Support Us",
      description: "Donate or volunteer to make a difference.",
      sectionId: "support-us-details",
      bgColor: "bg-yellow-200",
      hoverColor: "hover:bg-yellow-300",
    },
  ];

  // Scroll to the section and highlight it temporarily
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setHighlightedSection(sectionId);
      // Remove highlight after 3 seconds
      setTimeout(() => {
        setHighlightedSection(null);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 text-base-content p-10">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome to Our Site!</h1>
        <p className="text-xl">Experience the retro vibes with DaisyUI 🎉</p>
        <button className="btn btn-primary mt-6">Get Started</button>
      </div>
    </div>
  );
};

export default Home;