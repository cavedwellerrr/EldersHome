import React from 'react'
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/guardian/Login";
import Register from "./pages/guardian/Register";
import Profile from "./pages/guardian/Profile";


const App = () => {
  return (
    <>
      {/* <Header /> */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      {/* <Footer /> */}
    </>

  );
};

export default App;