import React from "react";
import { useSelector } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import App from "./App";
import Login from "./component/Super/Login";
import Authenticator from "./utils/Authenticator"; // A component to handle authentication
import Navigator from "./utils/Navigator"; // To handle navigation (e.g., sidebar)

import "react-toastify/dist/ReactToastify.css";
import "./assets/css/admin.css"; // Admin-specific styles

const MainApp = () => {
  const { show } = useSelector((state) => state.message); // Toggle loader

  return (
    <BrowserRouter>
      <Navigator /> {/* Sidebar and other navigation components */}
      {show && <div className="longloader"></div>} {/* Loader when needed */}
      <Routes>
        {/* Admin-specific routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/*" element={<Authenticator />} />

        {/* Default fallback to public app */}
        <Route path="/*" element={<App />} />
      </Routes>
      {/* Toast notifications */}
      <ToastContainer autoClose={3000} stacked={true} />
    </BrowserRouter>
  );
};

export default MainApp;
