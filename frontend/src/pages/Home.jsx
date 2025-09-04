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
          Our goal is to provide exceptional care for our elders, giving them the best service we can.
          Explore our services, events, and ways to get involved.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`card ${card.bgColor} ${card.hoverColor} p-6 shadow-lg transition-all duration-300 cursor-pointer`}
              onClick={() => scrollToSection(card.sectionId)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && scrollToSection(card.sectionId)}
              aria-label={`View details for ${card.title}`}
            >
              <h2 className="text-2xl font-semibold mb-2 text-black">
                {card.title}
              </h2>
              <p className="text-black">
                {card.description}
              </p>
            </div>
          ))}
        </div>
        {/* Details Sections */}
        <div className="max-w-4xl mx-auto text-left space-y-12">
          <div
            id="quality-care-details"
            className={`bg-transparent p-6 rounded-lg transition-all duration-500 ${
              highlightedSection === "quality-care-details" ? "border-2 border-primary" : "border-2 border-transparent"
            }`}
          >
            <h2 className={`text-3xl font-semibold mb-4 ${textColor}`}>
              Quality Care
            </h2>
            <p className={`mb-4 ${cardTextColor}`}>
              Our team of trained professionals provides personalized care, including medical support, daily activities, and emotional well-being programs tailored to each elder’s needs.
            </p>
            <ul className={`list-disc list-inside mb-4 ${cardTextColor}`}>
              <li>24/7 medical supervision</li>
              <li>Personalized care plans</li>
              <li>Nutritional meal planning</li>
            </ul>
            <a href="/about" className="btn btn-primary transition-transform duration-300 cursor-pointer">
              Learn More
            </a>
          </div>
          <div
            id="community-events-details"
            className={`bg-transparent p-6 rounded-lg transition-all duration-500 ${
              highlightedSection === "community-events-details" ? "border-2 border-primary" : "border-2 border-transparent"
            }`}
          >
            <h2 className={`text-3xl font-semibold mb-4 ${textColor}`}>
              Community Events
            </h2>
            <p className={`mb-4 ${cardTextColor}`}>
              We host a variety of events to foster community, including spiritual programs, music therapy sessions, and seasonal celebrations that bring joy to our elders.
            </p>
            <ul className={`list-disc list-inside mb-4 ${cardTextColor}`}>
              <li>Weekly spiritual programs</li>
              <li>Monthly music and dance events</li>
              <li>Annual family day celebrations</li>
            </ul>
            <a href="/events" className="btn btn-accent transition-transform duration-300 cursor-pointer">
              View Events
            </a>
          </div>
          <div
            id="support-us-details"
            className={`bg-transparent p-6 rounded-lg transition-all duration-500 ${
              highlightedSection === "support-us-details" ? "border-2 border-primary" : "border-2 border-transparent"
            }`}
          >
            <h2 className={`text-3xl font-semibold mb-4 ${textColor}`}>
              Support Us
            </h2>
            <p className={`mb-4 ${cardTextColor}`}>
              Your support helps us continue providing top-quality care. Whether through donations or volunteering, you can make a meaningful impact.
            </p>
            <ul className={`list-disc list-inside mb-4 ${cardTextColor}`}>
              <li>Flexible volunteering opportunities</li>
              <li>Donation programs for facility upgrades</li>
              <li>Community outreach initiatives</li>
            </ul>
            <a href="/donations" className="btn btn-secondary transition-transform duration-300 cursor-pointer">
              Donate Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;