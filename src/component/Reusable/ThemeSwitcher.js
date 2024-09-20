import React, { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";

const ThemeSwitcher = () => {
  // Initialize state based on localStorage or default to light theme
  const [darkTheme, setDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark" ? true : false;
  });

  useEffect(() => {
    // Apply the theme based on the state
    if (darkTheme) {
      document.documentElement.classList.add("dark-theme");
      localStorage.setItem("theme", "dark"); // Save to localStorage
    } else {
      document.documentElement.classList.remove("dark-theme");
      localStorage.setItem("theme", "light"); // Save to localStorage
    }
  }, [darkTheme]);

  return (
    <div className="theme-switcher me-3">
      <input
        type="checkbox"
        className="checkbox"
        id="theme-switcher-checkbox"
        checked={darkTheme}
        onChange={() => setDarkTheme(!darkTheme)}
      />
      <label htmlFor="theme-switcher-checkbox" className="checkbox-label">
        <FaSun className="fa-sun" />
        <FaMoon className="fa-moon" />
        <span className="ball"></span>
      </label>
    </div>
  );
};

export default ThemeSwitcher;
