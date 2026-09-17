import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { FaCompass } from "react-icons/fa";
import Icon from "../components/Icon";
import { clearSession, getToken, isAdmin } from "../utils/auth";
import { isInStandaloneMode, isIos, subscribeToPush } from "../utils/pushNotifications";
import "./Navbar.css";

interface NavLink {
  path: string;
  label: string;
}

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const token = getToken();

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  const handleEnableNotifications = async () => {
    const success = await subscribeToPush(token);
    if (success) setIsSubscribed(true);
  };

  const links: NavLink[] = [
    { path: "/add-visit", label: "Add Visit" },
    { path: "/edit-user", label: "Edit User" },
    { path: "/visit-dashboard", label: "Visit Dashboard" },
    ...(isAdmin() ? [{ path: "/users", label: "Users" }] : []),
  ];

  return (
    <nav className="navbar">
      <Link to="/visit-dashboard" className="navbar-brand" onClick={() => setIsOpen(false)}>
        <Icon icon={FaCompass} className="navbar-brand-icon" />
        <span className="navbar-brand-text">Tourist</span>
      </Link>

      <button
        type="button"
        className={`navbar-toggle ${isOpen ? "is-open" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle navigation"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`navbar-links ${isOpen ? "is-open" : ""}`}>
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`navbar-link ${isActive ? "is-active" : ""}`}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="navbar-actions">
        {token && (
          <>
            {isIos() && !isInStandaloneMode() ? (
              <p className="navbar-ios-banner">
                Add this site to your Home Screen to enable notifications.
              </p>
            ) : isSubscribed ? (
              <span className="navbar-notify-status">Notifications enabled</span>
            ) : (
              <button
                type="button"
                onClick={handleEnableNotifications}
                className="navbar-notify-btn"
              >
                Enable Notifications
              </button>
            )}
          </>
        )}
        <button onClick={handleLogout} className="navbar-logout">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
