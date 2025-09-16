import React from "react";
import {
  Heart,
  Users,
  Shield,
  Award,
  Clock,
  MapPin,
  Phone,
  Mail,
  Star,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const AboutUs = () => {
  const stats = [
    { number: "1,452", label: "Happy Residents", icon: Users },
    { number: "15", label: "Years Experience", icon: Award },
    { number: "72", label: "Staff Members", icon: Heart },
    { number: "24/7", label: "Care & Support", icon: Clock },
  ];

  const services = [
    {
      icon: Heart,
      title: "Medical Care",
      description:
        "Comprehensive healthcare services with qualified medical professionals available round the clock.",
    },
    {
      icon: Users,
      title: "Expert Team",
      description:
        "Experienced caregivers, nurses, and specialists dedicated to providing exceptional care.",
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description:
        "Round-the-clock assistance and monitoring to ensure safety and peace of mind.",
    },
    {
      icon: Shield,
      title: "Safe Environment",
      description:
        "Secure, comfortable living spaces designed with senior safety and accessibility in mind.",
    },
  ];

  const values = [
    {
      title: "Compassionate Care",
      description:
        "Every resident receives personalized attention with dignity and respect, ensuring they feel valued and loved.",
    },
    {
      title: "Family Atmosphere",
      description:
        "We create a warm, home-like environment where residents can build meaningful relationships and feel a sense of belonging.",
    },
    {
      title: "Quality of Life",
      description:
        "Our programs and activities are designed to enhance physical, mental, and emotional well-being for a fulfilling lifestyle.",
    },
    {
      title: "Professional Excellence",
      description:
        "Our highly trained staff maintains the highest standards of care with continuous education and compassionate service.",
    },
  ];

  const teamMembers = [
    {
      name: "Dr. Sarah Johnson",
      role: "Medical Director",
      experience: "15+ years in geriatric medicine",
      image: "/images/doctor1.jpg",
    },
    {
      name: "Maria Rodriguez",
      role: "Head of Nursing",
      experience: "12+ years in senior care",
      image: "/images/nurse1.jpg",
    },
    {
      name: "James Chen",
      role: "Activities Coordinator",
      experience: "8+ years in recreational therapy",
      image: "/images/coordinator1.jpg",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-white">
      {/* ✅ Removed navbar */}

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-orange-50 via-white to-orange-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-orange-100 px-4 py-2 rounded-full mb-6">
              <Heart className="w-5 h-5 text-orange-500" />
              <span className="text-orange-600 font-semibold">About ElderCare</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
              Makes The Rest Of Your
              <br />
              <span className="text-orange-500">Life Have a Happy Memory</span>
              <br />
              till end
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              At Senora Elder Care, we believe every senior deserves to live
              with dignity, joy, and purpose. For over 15 years, we've been
              creating a loving community where golden years truly shine.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={index}
                  className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100"
                >
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-orange-500" />
                  </div>
                  <div className="text-3xl font-bold text-orange-500 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <img
            src="/images/our-story.jpg"
            alt="Our Story"
            className="rounded-3xl shadow-xl w-full object-cover"
          />
          <div>
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Story</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Founded in 2008, Senora Elder Care began with a vision to provide
              exceptional care and create a nurturing environment for seniors.
              What started as a small initiative has now grown into a
              comprehensive elder care community serving hundreds of residents
              with love and dedication.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-orange-500 mt-1" />
                <span className="text-gray-700">
                  Holistic approach to elder care
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-orange-500 mt-1" />
                <span className="text-gray-700">
                  Focus on community and belonging
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-orange-500 mt-1" />
                <span className="text-gray-700">
                  Commitment to continuous improvement
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-orange-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Guided by compassion, we uphold values that ensure the highest
              quality of life for every resident.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            {values.map((value, index) => (
              <div
                key={index}
                className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100"
              >
                <h3 className="text-2xl font-bold text-orange-500 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              What We Offer
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our comprehensive services are designed to meet every need of our
              residents, ensuring comfort and peace of mind.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={index}
                  className="p-8 bg-orange-50 rounded-2xl shadow-md hover:shadow-xl transition"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow">
                    <IconComponent className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-20 bg-orange-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Team</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Meet the dedicated professionals who make Senora Elder Care a
              trusted home for our residents.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-orange-500 font-medium mb-2">
                    {member.role}
                  </p>
                  <p className="text-gray-600">{member.experience}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-6">Join Our Loving Community</h2>
          <p className="text-xl mb-8">
            Discover the comfort, care, and companionship that make ElderCare truly special.
          </p>
          <button className="bg-white text-orange-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition inline-flex items-center space-x-2">
            <span>Contact Us Today</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ✅ Footer */}
      {/* <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-white text-xl font-bold mb-4">Senora Elder Care</h3>
            <p className="text-gray-400">
              Creating joyful memories and compassionate care for over 15 years.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>About Us</li>
              <li>Our Services</li>
              <li>Our Team</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <p className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-orange-400" />
              <span>123 Care Street, Colombo</span>
            </p>
            <p className="flex items-center space-x-2 mt-2">
              <Phone className="w-4 h-4 text-orange-400" />
              <span>+94 11 234 5678</span>
            </p>
            <p className="flex items-center space-x-2 mt-2">
              <Mail className="w-4 h-4 text-orange-400" />
              <span>info@senora.com</span>
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Senora Elder Care. All rights reserved.
        </div>
      </footer> */}
    </div>
  );
};

export default AboutUs;