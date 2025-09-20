
import React, { useEffect, useState } from "react";
import { Clock, Search, RefreshCw, MapPin, Heart } from "lucide-react";

// ✅ Import images from src/assets
import healthImg from "../assets/health.jpg";
import movieImg from "../assets/movie.jpg";
import cardImg from "../assets/card.jpg";
import yogaImg from "../assets/yoga.jpg";
import gardeningImg from "../assets/gardening.jpg";

const Events = () => {
  // Static events data with imported images
  const staticEvents = [
    {
      _id: "1",
      title: "Health Checkup Camp",
      description:
        "Comprehensive health screening and consultation with qualified medical professionals. Regular health monitoring is essential for maintaining wellness in our golden years.",
      location: "Medical Center - Room A",
      start_time: "2025-09-20T09:00:00Z",
      end_time: "2025-09-20T12:00:00Z",
      image: healthImg,
    },
    {
      _id: "2",
      title: "Weekend Movie Night",
      description:
        "Enjoy classic films in our comfortable theater room with popcorn and refreshments. A perfect evening for relaxation and entertainment with friends.",
      location: "Community Theater",
      start_time: "2025-09-21T19:00:00Z",
      end_time: "2025-09-21T21:30:00Z",
      image: movieImg,
    },
    {
      _id: "3",
      title: "Friendly Card Game Evening",
      description:
        "Join us for an evening of bridge, poker, and other classic card games. Meet new friends and enjoy friendly competition in a relaxed atmosphere.",
      location: "Game Room B",
      start_time: "2025-09-22T15:00:00Z",
      end_time: "2025-09-22T18:00:00Z",
      image: cardImg,
    },
    {
      _id: "4",
      title: "Morning Yoga",
      description:
        "Start your day with gentle yoga exercises designed for seniors. Improve flexibility, balance, and mental well-being in a supportive group environment.",
      location: "Garden Pavilion",
      start_time: "2025-09-23T08:00:00Z",
      end_time: "2025-09-23T09:30:00Z",
      image: yogaImg,
    },
    {
      _id: "5",
      title: "Gardening Workshop",
      description:
        "Learn about seasonal gardening, plant care, and herb cultivation. Get your hands dirty and create something beautiful while connecting with nature.",
      location: "Community Garden",
      start_time: "2025-09-24T10:00:00Z",
      end_time: "2025-09-24T12:00:00Z",
      image: gardeningImg,
    },
  ];

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Simulate loading and set static events
  useEffect(() => {
    const loadEvents = () => {
      setTimeout(() => {
        setEvents(staticEvents);
        setLoading(false);
      }, 1000); // Simulate loading time
    };

    loadEvents();
  }, []);

  // Filter Events Based on Search
  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <RefreshCw className="w-12 h-12 animate-spin text-orange-500 mb-4" />
          <p className="text-2xl text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-orange-50 via-white to-orange-50 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-orange-100 px-4 py-2 rounded-full mb-6">
            <Heart className="w-5 h-5 text-orange-500" />
            <span className="text-orange-600 font-semibold">LIVE EVENTS</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight">
            Makes The Rest Of Your
            <br />
            <span className="text-orange-500">Life Have a Happy Memory</span>
            <br />
            till end
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed">
            Dive into a world of vibrant activities, joyful celebrations, and
            heartwarming community moments—updated in real-time!
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex justify-center mb-12">
          <div className="relative max-w-md w-full">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-4 pl-12 pr-4 rounded-full bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-500 shadow-sm"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-orange-500" />
            </div>
            <p className="text-xl text-gray-600">No events match your search.</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event, index) => (
              <div
                key={event._id || index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 
                           overflow-hidden border-2 border-orange-200 hover:border-orange-400 
                           group hover:-translate-y-2"
              >
                <div className="relative">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                <div className="p-6 flex flex-col gap-4 min-h-[300px]">
                  <h3 className="text-2xl font-bold text-gray-800 group-hover:text-orange-500 transition-colors leading-tight">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {event.description && event.description.length > 120
                      ? event.description.slice(0, 120) + "..."
                      : event.description}
                  </p>

                  <div className="space-y-3 text-sm text-gray-600 flex-grow">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <span>
                        Start: {new Date(event.start_time).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <span>
                        End: {new Date(event.end_time).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="py-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Experience the warmth of belonging and create beautiful memories
            with us every day.
          </p>
          <button className="px-10 py-4 bg-white text-orange-500 font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl">
            Get Started Today
          </button>
        </div>
      </div>
    </div>
  );
};

export default Events;