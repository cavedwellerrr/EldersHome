import React, { useState, useEffect } from "react";
import { Heart, Users, Calendar, Stethoscope, Phone, Mail, MapPin, Star, Clock, Shield } from "lucide-react";

const Home = () => {
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting
          }));
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('[id^="section-"]');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const events = [
    {
      title: "Spiritual Programs",
      description: "Weekly meditation sessions, prayer groups, and spiritual guidance to nourish the soul",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      schedule: "Sundays & Wednesdays"
    },
    {
      title: "Board Games & Activities", 
      description: "Strategic thinking games, puzzles, and social activities that keep minds sharp and engaged",
      image: "https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=400&h=300&fit=crop",
      schedule: "Daily 2-4 PM"
    },
    {
      title: "Exercise Programs",
      description: "Gentle fitness routines, yoga, and physical therapy designed for senior wellness",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
      schedule: "Mon, Wed, Fri"
    }
  ];

  const services = [
    {
      icon: <Stethoscope className="w-8 h-8" />,
      title: "Medical Care",
      description: "24/7 professional healthcare services with qualified medical staff"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Expert Team",
      description: "Dedicated caregivers committed to providing personalized attention"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "24/7 Support",
      description: "Round-the-clock assistance whenever you need it most"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Safety First",
      description: "Secure environment with emergency response systems"
    }
  ];

  const stats = [
    { number: "1,000", label: "Happy Residents" },
    { number: "2,000", label: "Care Hours" },
    { number: "15", label: "Years Experience" },
    { number: "50", label: "Staff Members" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold text-gray-800">ElderCare</span>
            </div>
           
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="section-hero" className="relative bg-gradient-to-br from-orange-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className={`transform transition-all duration-1000 ${isVisible['section-hero'] ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-800 leading-tight mb-6">
                Makes The Rest Of Your
                <span className="text-orange-500"> Life Have a Happy Memory</span> till end
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Experience compassionate care in a warm, family-like environment where every day brings joy, comfort, and meaningful connections.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/login">
                <button className="bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-600 transform hover:scale-105 transition-all duration-300 shadow-lg">
                  Get Started
                </button>
              </a>
              </div>
            </div>
            <div className={`transform transition-all duration-1000 delay-300 ${isVisible['section-hero'] ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=500&fit=crop" 
                  alt="Happy seniors with caregiver"
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">4.9/5 Rating</p>
                      <p className="text-sm text-gray-600">From 1,200+ families</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="section-services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transform transition-all duration-1000 ${isVisible['section-services'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Care Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive healthcare and support services designed to enhance quality of life for our residents
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div 
                key={index}
                className={`bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-500 hover:-translate-y-2 ${isVisible['section-services'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="text-orange-500 mb-4">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="section-events" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transform transition-all duration-1000 ${isVisible['section-events'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Enriching Events & Activities</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Engaging programs designed to promote physical, mental, and spiritual wellness
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <div 
                key={index}
                className={`group cursor-pointer transform transition-all duration-500 hover:-translate-y-2 ${isVisible['section-events'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                  <div className="relative overflow-hidden">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {event.schedule}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-orange-500 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{event.description}</p>
                    <a href="/events">
                    <button className="flex items-center space-x-2 text-orange-500 hover:text-orange-600 font-semibold">
                      <span>Learn More</span>
                      <div className="w-2 h-2 border-r-2 border-b-2 border-orange-500 transform rotate-[-45deg] group-hover:translate-x-1 transition-transform"></div>
                    </button>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Healthcare Services */}
      <section id="section-healthcare" className="py-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid md:grid-cols-2 gap-12 items-center transform transition-all duration-1000 ${isVisible['section-healthcare'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div>
              <h2 className="text-4xl font-bold mb-6">Professional Healthcare Services</h2>
              <p className="text-xl mb-8 text-orange-100">
                Our qualified medical team provides comprehensive healthcare services including regular check-ups, medication management, physical therapy, and emergency care - all within our comfortable facility.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Licensed nurses and medical professionals</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>24/7 medical monitoring and emergency response</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Specialized care for chronic conditions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Physical and occupational therapy</span>
                </div>
              </div>
            
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&h=500&fit=crop" 
                alt="Healthcare services"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="section-stats" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 transform transition-all duration-1000 ${isVisible['section-stats'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-orange-500 mb-2">{stat.number}+</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="section-cta" className="py-20 bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`transform transition-all duration-1000 ${isVisible['section-cta'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-4xl font-bold mb-6">Ready to Join Our Family?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Experience the warmth and care that makes ElderCare the perfect place to call home
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors shadow-lg">
                Schedule a Visit
              </button>
              <div className="flex items-center space-x-4 text-gray-300">
                <Phone className="w-5 h-5" />
                <span>+94 8156 284 948</span>
                <Mail className="w-5 h-5" />
                <span>info@ElderCare.lk</span>
              </div>
            </div>
          </div>
        </div>
      </section>

     
    </div>
  );
};

export default Home;