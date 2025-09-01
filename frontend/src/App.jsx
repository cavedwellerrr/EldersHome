import React from 'react'
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/guardian/Login";
import Register from "./pages/guardian/Register";
import Profile from "./pages/guardian/Profile";
import AboutUs from './pages/AboutUs';
import Donations from './pages/Donations';
import Events from './pages/Events';

import Navbar from './components/Navbar';
import MealPage from './pages/MealPage';


const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/donations" element={<Donations />} />
        <Route path="/events" element={<Events />} />
        <Route path="/meals" element={<MealPage />} />

      </Routes>
      {/* <Footer /> */}
    </>

  );
};

export default App;