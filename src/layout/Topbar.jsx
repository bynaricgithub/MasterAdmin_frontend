import React from "react";
import { Button, Dropdown } from "react-bootstrap";
import { FaBars, FaCog } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../Store/AllReducers/userSlice";
import ThemeSwitcher from "../component/Reusable/ThemeSwitcher";

const TopBar = ({ onSidebarToggle }) => {
  const { myUser } = useSelector((state) => state.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <div className={`bg-light border top-bar`}>
      <div className="container-fluid">
        <div className="top-bar d-flex justify-content-between align-items-center">
          <Button
            id="sidebarCollapse"
            onClick={onSidebarToggle}
            className="btn admin-btn-primary rounded-1"
          >
            <FaBars />
          </Button>

          <div className="d-flex align-items-center">
            {/* Integrating the Theme Switcher */}
            <ThemeSwitcher />

            {/* User Settings */}
            <div className="user-settings">
              <Dropdown>
                <Dropdown.Toggle variant="primary" id="dropdown-basic">
                  <FaCog />
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item
                    href="#"
                    onClick={() => dispatch(logout(navigate))}
                  >
                    <i className="fa fa-sign-out pe-2"></i> Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
