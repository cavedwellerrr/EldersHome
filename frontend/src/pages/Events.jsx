import React, { useEffect, useState } from "react";
import axios from "axios";
import { Clock, Search, RefreshCw, Calendar, MapPin, Heart } from "lucide-react";

// ✅ Import images from src/assets
import healthImg from "../assets/health.jpg";
import movieImg from "../assets/movie.jpg";
import cardImg from "../assets/card.jpg";
import yogaImg from "../assets/yoga.jpg";       // replace with correct yoga image if needed
import gardeningImg from "../assets/gardening.jpg";

// ✅ Use imported images in the map
const imagesMap = {
  "Health Checkup Camp": healthImg,
  "Weekend Movie Night": movieImg,
  "Friendly Card Game Evening": cardImg,
  "Morning Yoga": yogaImg,
  "Gardening Workshop": gardeningImg,
};

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [time, setTime] = useState(new Date());

  // Fetch Events with Polling
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/events");
        const data = res.data.data || res.data;

        const eventsWithImages = data.map((event) => ({
          ...event,
          image: imagesMap[event.title] || event.image, // ❌ no default fallback
        }));

        setEvents(eventsWithImages);
      } catch (err) {
        console.error("Error fetching events:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Update Time Every Second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="px-8 py-4 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl">
              Join the Fun
            </button>
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-500" />
              </div>
              <span>View All Events</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-orange-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-orange-500">1,452</div>
              <div className="text-gray-600">Happy Residents</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-orange-500">3,452</div>
              <div className="text-gray-600">Events Hosted</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-orange-500">15</div>
              <div className="text-gray-600">Years Experience</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-orange-500">72</div>
              <div className="text-gray-600">Staff Members</div>
            </div>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-orange-100 px-4 py-2 rounded-full mb-4">
            <Calendar className="w-5 h-5 text-orange-500" />
            <span className="text-orange-600 font-semibold">UPCOMING EVENTS</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Upcoming Events ({filteredEvents.length})
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Join our vibrant community activities designed to bring joy and connection to your daily life.
          </p>
        </div>

        {/* Search Bar */}
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
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group hover:-translate-y-2"
              >
                <div className="relative">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4">
                    <div className="bg-orange-500 text-white text-sm font-semibold px-3 py-1 rounded-full flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      New
                    </div>
                  </div>
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
                      <span>Start: {new Date(event.start_time).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <span>End: {new Date(event.end_time).toLocaleString()}</span>
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
          <h2 className="text-4xl font-bold mb-6">Ready to Join Our Community?</h2>
          <p className="text-xl mb-8 opacity-90">
            Experience the warmth of belonging and create beautiful memories with us every day.
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
