import React, { useEffect, useState } from "react";
import { FaCaretDown, FaCaretRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API from "../../API"; // Replace with your actual API instance
import { sidebarList } from "../../layout/Sidebar"; // Import your sidebarList

const AdminHome = () => {
  const [openMenus, setOpenMenus] = useState({});
  const [menuCounts, setMenuCounts] = useState({});
  const navigate = useNavigate();

  // Define a mapping for table names from your sidebarList keys
  const tableMapping = {
    "Manage Links": "homemenu",
    "Manage Notice Board": "notice_boards",
    "Manage Slider Images": "home_page_slider",
    "Manage Latest Update": "latest_update",
    "Manage News and Events": "news_and_events",
    "Manage Members": "members",
    "Manage Circular": "circulars",
    "Manage Articles": "news_and_events",
  };

  // Fetch counts for each menu/submenu
  useEffect(() => {
    const fetchMenuCounts = async () => {
      try {
        const counts = {};
        for (let key in sidebarList) {
          if (
            key === "Dashboard" ||
            key === "Contact Us" ||
            key === "Manage Videos"
          ) {
            counts[key] = 0;
            continue;
          }
          if (Array.isArray(sidebarList[key])) {
            counts[key] = {};
            for (let submenu of sidebarList[key]) {
              const tableName = tableMapping[submenu.name];
              if (tableName) {
                const res = await API.get(`/count/${tableName.trim()}`);
                counts[key][submenu.name] = res.data.count || 0;
              } else {
                counts[key][submenu.name] = 0;
              }
            }
          } else {
            const tableName = tableMapping[key];
            if (tableName) {
              const res = await API.get(`/count/${tableName.trim()}`);
              counts[key] = res.data.count || 0;
            } else {
              counts[key] = 0;
            }
          }
        }
        setMenuCounts(counts);
      } catch (error) {
        console.error("Failed to fetch counts", error);
      }
    };

    fetchMenuCounts();
  }, []);

  const toggleMenu = (menu) => {
    setOpenMenus((prevState) => ({
      ...prevState,
      [menu]: !prevState[menu],
    }));
  };

  return (
    <div className="container-fluid fade-in-top my-4">
      <div className="card shadow">
        <div className="card-header">
          <h2 className="text-center mt-3">Welcome to Admin</h2>
        </div>
        <div className="card-body p-4">
          <div className="row">
            {Object.keys(sidebarList).map((key) => (
              <div key={key} className="col-lg-12 p-2">
                {!Array.isArray(sidebarList[key]) ? (
                  <div
                    className="d-flex align-items-center rounded-3 shadow p-3 main-menu"
                    role="button"
                    onClick={() => navigate("/admin" + sidebarList[key].path)}
                  >
                    <span className="me-2">{sidebarList[key].icon}</span>
                    {key}
                    {/* Show count for main menu */}
                    {menuCounts[key] !== undefined && (
                      <span
                        className={`badge ${
                          menuCounts[key] === 0 ? "bg-danger" : "bg-primary"
                        } ms-auto`}
                      >
                        {menuCounts[key]}
                      </span>
                    )}
                  </div>
                ) : (
                  <>
                    <div
                      className="d-flex align-items-center rounded-3 shadow p-3 main-menu border"
                      role="button"
                      onClick={() => toggleMenu(key)}
                    >
                      <div className="d-flex align-items-center w-100">
                        {openMenus[key] ? (
                          <FaCaretDown className="me-2" />
                        ) : (
                          <FaCaretRight className="me-2" />
                        )}
                        <div>{key}</div>
                      </div>
                    </div>
                    {openMenus[key] && (
                      <div className="row mx-3 p-2">
                        {sidebarList[key].map((submenu, idx) => (
                          <div
                            key={idx}
                            className="col-lg-4 p-2"
                            role="button"
                            onClick={() =>
                              navigate("/admin" + submenu.pathname)
                            }
                          >
                            <div className="d-flex align-items-center rounded-3 shadow p-3 border">
                              <span className="me-2">{submenu.icon}</span>
                              {submenu.name}
                              {/* Show count for submenu */}
                              {menuCounts[key] &&
                                menuCounts[key][submenu.name] !== undefined && (
                                  <span
                                    className={`badge ${
                                      menuCounts[key][submenu.name] === 0
                                        ? "btn-danger"
                                        : "btn-primary"
                                    } ms-auto`}
                                  >
                                    {menuCounts[key][submenu.name]}
                                  </span>
                                )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
