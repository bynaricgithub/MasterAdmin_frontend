import React, { useState } from "react";
import Collapse from "react-bootstrap/Collapse";
import {
  FaBell,
  FaBook,
  FaCaretDown,
  FaCaretUp,
  FaEnvelope,
  FaHome,
  FaImage,
  FaLink,
  FaNewspaper,
  FaSignOutAlt,
  FaUser,
  FaVideo,
} from "react-icons/fa"; // Importing all necessary icons
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../Store/AllReducers/userSlice";

export const sidebarList = {
  Dashboard: { path: "/home", icon: <FaHome /> },
  Home: [
    { name: "Manage Links", pathname: "/manageLinks", icon: <FaLink /> },
    {
      name: "Manage Notice Board",
      pathname: "/manageNoticeBoard",
      icon: <FaNewspaper />,
    },
    {
      name: "Manage Slider Images",
      pathname: "/manageSliderImages",
      icon: <FaImage />,
    },
    {
      name: "Manage Latest Update",
      pathname: "/manageLatestUpdate",
      icon: <FaBell />,
    },
    {
      name: "Manage News and Events",
      pathname: "/manageNewsAndEvents",
      icon: <FaNewspaper />,
    },
    { name: "Manage Members", pathname: "/manageMembers", icon: <FaUser /> },
    {
      name: "Manage Circular",
      pathname: "/manageCircular",
      icon: <FaBook />,
    },
    {
      name: "Manage Articles",
      pathname: "/manageArticle",
      icon: <FaNewspaper />,
    },
    {
      name: "Manage Videos",
      pathname: "/manageVideos",
      icon: <FaVideo />,
    },
  ],

  "Contact Us": { path: "/", icon: <FaEnvelope /> },
};

const BASE_PATH = "/admin";

const SidebarMain = () => {
  const [open, setOpen] = useState("");
  const [currentTab, setCurrentTab] = useState("");
  const { myUser } = useSelector((state) => state.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleToggle = (key) => {
    setOpen((prev) => (prev === key ? "" : key));
  };

  return (
    <nav id="sidebar">
      <div className="p-2 py-3 user-profile">
        <img src={myUser?.image || "/assets/images/user.png"} alt="User" />
        <div className="user-info">
          <h4>{myUser ? myUser.name : "No Name"}</h4>
          <p>Admin</p>
        </div>
      </div>
      <ul className="list-unstyled components">
        {Object.keys(sidebarList).map((key, i) => (
          <li key={i} className="active">
            {Array.isArray(sidebarList[key]) ? (
              <>
                <span
                  onClick={() => handleToggle(key)}
                  aria-controls={key}
                  aria-expanded={open === key}
                  className="admin-mainHead w-100 border-0 text-left mt-1"
                  style={{ marginTop: "1px" }}
                  role="button"
                >
                  <span className="d-flex justify-content-between align-items-center">
                    <span>
                      {sidebarList[key][0]?.icon}
                      {key}
                    </span>
                    {open === key ? (
                      <FaCaretUp className="mx-2" />
                    ) : (
                      <FaCaretDown className="mx-2" />
                    )}
                  </span>
                </span>
                <Collapse in={open === key}>
                  <div id={key}>
                    <ul className="list-unstyled">
                      {sidebarList[key].map((item2, j) => (
                        <li key={j} onClick={() => setCurrentTab(item2.name)}>
                          <Link
                            to={{ pathname: BASE_PATH + item2.pathname }}
                            className={`admin-subHead  px-4 ${
                              item2.name === currentTab ? "active" : ""
                            }`}
                          >
                            <span className="me-2"> {item2.icon}</span>
                            {item2.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Collapse>
              </>
            ) : (
              <Link
                to={{ pathname: BASE_PATH + sidebarList[key].path }}
                className="text-decoration-none admin-mainHead w-100 border-0 text-left mt-1"
                onClick={() => setCurrentTab(key)}
                aria-controls={key}
                aria-expanded={open === key}
              >
                {sidebarList[key].icon}
                {key}
              </Link>
            )}
          </li>
        ))}
      </ul>
      <div className="fixedBtn">
        <button
          onClick={() => dispatch(logout(navigate))}
          className="btn btn-primary w-100 p-3 border-0 rounded-0"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default SidebarMain;
