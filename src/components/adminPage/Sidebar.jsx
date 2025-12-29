import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/oweru_logo.png";
import { useAuth } from "../../contexts/AuthContext";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation(); // Get current URL path
  const [openDropdown, setOpenDropdown] = useState(null); // Tracks which dropdown is open
  const { user } = useAuth();

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown((current) =>
      current === dropdownName ? null : dropdownName
    );
  };

  // Helper to apply active styling (monochrome: black & white)
  const isActive = (path) =>
    location.pathname === path
      ? "bg-black text-white font-semibold"
      : "text-black hover:bg-black/5";

  return (
    <>
      {/* Backdrop for mobile when sidebar is open */}
      <div
        className={`fixed inset-0 bg-black/40 z-30 md:hidden transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <aside
        className={`fixed left-0 top-0 bottom-0 transform z-40 w-56 sm:w-64 border-r border-black/5 shadow-sm bg-white transition-transform duration-200 md:top-0 md:bottom-0 md:fixed md:h-screen md:overflow-auto md:translate-x-0 md:inset-auto md:w-64 md:block ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="pt-14 md:pt-0 p-2 sm:p-4 text-lg sm:text-xl font-bold tracking-wide text-center">
          <img
            className="mx-auto mt-1.5 block h-20 sm:h-24 rounded-full"
            src={logo}
            alt="Oweru Logo"
          />
          <h2 className="text-black text-sm sm:text-base">
            Oweru Media Management System
          </h2>
        </div>
        <nav className="p-2 sm:p-4 space-y-1 sm:space-y-2">
          {/* Home link - accessible to both admin and moderator */}
          {(user?.role === "admin" || user?.role === "moderator") && (
            <Link
              className={`block px-3 py-2 rounded ${isActive("/")}`}
              to="/"
              onClick={onClose}
            >
              Home
            </Link>
          )}

          {/* Admin navigation */}
          {user?.role === "admin" && (
            <>
              <Link
                className={`block px-3 py-2 rounded ${isActive(
                  "/admin/dashboard"
                )}`}
                to="/admin/dashboard"
                onClick={onClose}
              >
                Dashboard
              </Link>

              <Link
                className={`block px-3 py-2 rounded ${isActive(
                  "/admin/posts"
                )}`}
                to="/admin/posts"
                onClick={onClose}
              >
                Post Management
              </Link>
            </>
          )}

          {/* Contacts - Available to both Admin and Moderator */}
          {(user?.role === "admin" || user?.role === "moderator") && (
            <Link
              className={`block px-3 py-2 rounded ${isActive(
                "/admin/contacts"
              )}`}
              to="/admin/contacts"
              onClick={onClose}
            >
              Contact Messages
            </Link>
          )}

          {/* Moderator navigation */}
          {user?.role === "moderator" && (
            <Link
              className={`block px-3 py-2 rounded ${isActive(
                "/admin/moderation"
              )}`}
              to="/admin/moderation"
              onClick={onClose}
            >
              Moderator Dashboard
            </Link>
          )}

          {/* Admin-only dropdowns */}
          {user?.role === "admin" && (
            <>
              {/* Oweru Housing Dropdown */}
              <div>
                <button
                  className="w-full text-left px-3 py-2 rounded text-black hover:bg-black/5"
                  onClick={() => toggleDropdown("housing")}
                >
                  Oweru Housing
                </button>
                {openDropdown === "housing" && (
                  <div className="pl-4 mt-1 space-y-1">
                    <Link
                      className={`block px-3 py-2 rounded ${isActive(
                        "/admin/rentals"
                      )}`}
                      to="/admin/rentals"
                      onClick={onClose}
                    >
                      Rentals
                    </Link>
                    <Link
                      className={`block px-3 py-2 rounded ${isActive(
                        "/admin/property-sales"
                      )}`}
                      to="/admin/property-sales"
                      onClick={onClose}
                    >
                      Property Sales
                    </Link>
                    <Link
                      className={`block px-3 py-2 rounded ${isActive(
                        "/admin/construction-property-management"
                      )}`}
                      to="/admin/construction-property-management"
                      onClick={onClose}
                    >
                      Construction & Property Management
                    </Link>
                  </div>
                )}
              </div>

              {/* Oweru Official Dropdown */}
              <div>
                <button
                  className="w-full text-left px-3 py-2 rounded text-black hover:bg-black/5"
                  onClick={() => toggleDropdown("official")}
                >
                  Oweru Official
                </button>
                {openDropdown === "official" && (
                  <div className="pl-4 mt-1 space-y-1">
                    <Link
                      className={`block px-3 py-2 rounded ${isActive(
                        "/admin/lands-and-plots"
                      )}`}
                      to="/admin/lands-and-plots"
                      onClick={onClose}
                    >
                      Lands and Plots
                    </Link>
                    <Link
                      className={`block px-3 py-2 rounded ${isActive(
                        "/admin/property-services"
                      )}`}
                      to="/admin/property-services"
                      onClick={onClose}
                    >
                      Land & Property Administration Services
                    </Link>
                    <Link
                      className={`block px-3 py-2 rounded ${isActive(
                        "/admin/investment"
                      )}`}
                      to="/admin/investment"
                      onClick={onClose}
                    >
                      Investment
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
