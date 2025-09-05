import React, { useState, useEffect } from "react";
import api from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Donations = () => {
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donationType, setDonationType] = useState("");
  const [amount, setAmount] = useState("");
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [listAcknowledgment, setListAcknowledgment] = useState(false);
  const [donors, setDonors] = useState([]);

  // Fetch donor list on load
  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const res = await api.get("/donors");
        setDonors(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Error fetching donor list");
      }
    };

    fetchDonors();
    const interval = setInterval(fetchDonors, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!donationType) {
      toast.error("Please select a donation type");
      return;
    }

    // Simulate API call
    const submitDonation = async () => {
      try {
        await api.post("/donations", {
          donorName,
          donorEmail,
          donationType,
          amount: donationType === "cash" ? Number(amount) : undefined,
          itemName: donationType === "item" ? itemName : undefined,
          quantity: donationType === "item" ? Number(quantity) : undefined,
          listAcknowledgment,
        });

        toast.success("Donation submitted successfully!");

        // Reset form
        setDonorName("");
        setDonorEmail("");
        setDonationType("");
        setAmount("");
        setItemName("");
        setQuantity(1);
        setListAcknowledgment(false);

        // Refetch donor list
        const res = await api.get("/donors");
        setDonors(res.data);
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "Error submitting donation");
      }
    };

    submitDonation();
  };

  const scrollToForm = () => {
    document.getElementById('donation-form').scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <div className="min-h-screen" data-theme="light">
      <ToastContainer />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-white">
        <div className="absolute inset-0 bg-white/60"></div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-orange-200 rounded-full opacity-20 -translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-300 rounded-full opacity-10 translate-x-48 translate-y-48"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Make a 
                  <span className="text-orange-500"> Difference</span> 
                  <br />Today
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Your generosity creates ripples of positive change. Every donation, 
                  no matter the size, helps us build a better tomorrow for those in need.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={scrollToForm}
                  className="btn bg-orange-500 hover:bg-orange-600 text-white border-none px-8 py-3 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Donate Now
                </button>
                <button className="btn btn-outline border-orange-500 text-orange-500 hover:bg-orange-500 hover:border-orange-500 px-8 py-3 text-lg rounded-full">
                  Learn More
                </button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500">1,000</div>
                  <div className="text-sm text-gray-600">Lives Impacted</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500">$125K</div>
                  <div className="text-sm text-gray-600">Funds Raised</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500">50</div>
                  <div className="text-sm text-gray-600">Active Donors</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              {/* Hero Image Placeholder */}
              <div className="relative bg-gradient-to-br from-orange-100 to-orange-200 rounded-3xl p-8 shadow-2xl">
                <div className="aspect-square bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 bg-orange-500 rounded-full mx-auto flex items-center justify-center">
                      <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <div className="text-gray-700">
                      <div className="font-semibold text-lg">Together We Can</div>
                      <div className="text-sm">Make Change Happen</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-orange-400 rounded-full opacity-60 animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-orange-300 rounded-full opacity-40 animate-bounce"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Your Impact in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how your contributions are making real change in our community
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Events Support</h3>
              <p className="text-gray-600 mb-4">Hosting new events for elders to take part in</p>
              <div className="text-2xl font-bold text-orange-500">10+ Events</div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Healthcare Facilities</h3>
              <p className="text-gray-600 mb-4">Funding medical treatments and healthcare facilities for our elderly residents</p>
              <div className="text-2xl font-bold text-orange-500">1,000+ Elderly Residents</div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Quality Staff</h3>
              <p className="text-gray-600 mb-4">Hiring the best staff we can find to provide the best service</p>
              <div className="text-2xl font-bold text-orange-500">50+ Staff Members</div>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Form Section */}
      <div id="donation-form" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  Ready to Make Your Donation?
                </h2>
                <p className="text-xl text-gray-600">
                  Fill out the form below and join our community of changemakers
                </p>
              </div>

              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-orange-100">
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Full Name</label>
                      <input
                        type="text"
                        placeholder="Enter your name"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        className="input input-bordered w-full h-14 bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-500 rounded-xl text-lg"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Email Address</label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        className="input input-bordered w-full h-14 bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-500 rounded-xl text-lg"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Donation Type</label>
                    <select
                      value={donationType}
                      onChange={(e) => setDonationType(e.target.value)}
                      className="select select-bordered w-full h-14 bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-500 rounded-xl text-lg"
                      required
                    >
                      <option value="" disabled>Choose donation type</option>
                      <option value="cash">💰 Cash Donation</option>
                      <option value="item">📦 Item Donation</option>
                    </select>
                  </div>

                  {donationType === "cash" && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Amount</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-semibold">
                          $
                        </span>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="input input-bordered w-full h-14 bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-500 rounded-xl text-lg pl-8"
                          required
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {[25, 50, 100, 250, 500].map(presetAmount => (
                          <button
                            key={presetAmount}
                            type="button"
                            onClick={() => setAmount(presetAmount.toString())}
                            className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors text-sm font-medium"
                          >
                            ${presetAmount}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {donationType === "item" && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Item Name</label>
                        <input
                          type="text"
                          placeholder="What are you donating?"
                          value={itemName}
                          onChange={(e) => setItemName(e.target.value)}
                          className="input input-bordered w-full h-14 bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-500 rounded-xl text-lg"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Quantity</label>
                        <input
                          type="number"
                          placeholder="1"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          className="input input-bordered w-full h-14 bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-500 rounded-xl text-lg"
                          min={1}
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="bg-orange-50 rounded-xl p-4">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={listAcknowledgment}
                        onChange={(e) => setListAcknowledgment(e.target.checked)}
                        className="checkbox checkbox-warning mt-0.5"
                      />
                      <div className="space-y-1">
                        <span className="font-medium text-gray-800">Public Recognition</span>
                        <p className="text-sm text-gray-600">Allow my name to be listed publicly as a donor to inspire others</p>
                      </div>
                    </label>
                  </div>

                  <button 
                    onClick={handleSubmit}
                    className="w-full btn bg-orange-500 hover:bg-orange-600 text-white border-none h-14 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    Complete Donation ❤️
                  </button>
                </div>
              </div>
            </div>

            {/* Donor List Section */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A2.99 2.99 0 0 0 16.85 6c-.47 0-.91.17-1.25.47L14 7.75V12c0 1.11-.89 2-2 2s-2-.89-2-2V5c0-1.11.89-2 2-2s2 .89 2 2v3l4.05-2.76c.85-.58 2-.58 2.85 0L22 8v14h-2z"/>
                    </svg>
                  </span>
                  Our Amazing Donors
                </h3>
                <p className="text-gray-600 mb-6">
                  Join these wonderful people who are making a difference in our community
                </p>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {donors.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-orange-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                      <p className="text-gray-500">Be the first donor!</p>
                    </div>
                  ) : (
                    donors.map((donor) => (
                      <div key={donor._id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                            {donor.donorName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{donor.donorName}</div>
                            <div className="text-sm text-orange-600">Thank you for your generosity!</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Contact Info */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h3>
                <p className="text-gray-600 mb-4">
                  Have questions about donating? We're here to help!
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600">support@donations.org</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600">+1 (555) 123-4567</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Every Donation Creates Hope
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join thousands of donors who believe in making the world a better place
          </p>
          <button 
            onClick={scrollToForm}
            className="btn bg-white text-orange-500 hover:bg-gray-100 border-none px-8 py-3 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Start Donating Today
          </button>
        </div>
      </div>
        
                    
      
    </div>
  );
};

export default Donations;