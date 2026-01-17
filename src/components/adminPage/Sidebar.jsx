import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/oweru_logo.png";
import { useAuth } from "../../contexts/AuthContext";
import { ChevronDown, Home, LayoutDashboard, FileText, MessageSquare, Building2, Briefcase, MapPin, Landmark, TrendingUp, ShoppingBag, Hammer } from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);
  const { user } = useAuth();

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown((current) =>
      current === dropdownName ? null : dropdownName
    );
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, children, icon: Icon, onClick }) => (
    <Link
      to={to}
      onClick={onClick || onClose}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group font-inter ${
        isActive(to)
          ? "bg-gradient-to-r from-[#C89128] to-[#B08020] text-white shadow-md"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {Icon && (
        <Icon
          className={`w-5 h-5 transition-transform duration-200 ${
            isActive(to) ? "" : "group-hover:scale-110"
          }`}
        />
      )}
      <span className="font-medium text-sm">{children}</span>
    </Link>
  );

  const DropdownButton = ({ onClick, children, isOpen, icon: Icon }) => (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-all duration-200 group font-inter"
    >
      <span className="flex items-center gap-3">
        {Icon && <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />}
        <span className="text-sm">{children}</span>
      </span>
      <ChevronDown
        className={`w-4 h-4 transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>
  );

  const SubLink = ({ to, children, icon: Icon }) => (
    <Link
      to={to}
      onClick={onClose}
      className={`flex items-center gap-3 pl-12 pr-4 py-2.5 rounded-lg transition-all duration-200 font-inter ${
        isActive(to)
          ? "text-[#C89128] bg-amber-50 font-semibold"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {Icon ? (
        <Icon className={`w-4 h-4 ${isActive(to) ? "text-[#C89128]" : "text-gray-400"}`} />
      ) : (
        <span
          className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
            isActive(to) ? "bg-[#C89128] w-2 h-2" : "bg-gray-400"
          }`}
        />
      )}
      <span className="text-sm">{children}</span>
    </Link>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        .font-inter {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>

      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-40 w-72 bg-white border-r border-gray-200 shadow-xl transition-transform duration-300 md:translate-x-0 overflow-y-auto font-inter ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <img
                src={logo}
                alt="Oweru Logo"
                className="h-20 w-20 object-contain rounded-full shadow-lg ring-4 ring-amber-50"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-[#C89128] to-[#B08020] rounded-full border-2 border-white" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent tracking-tight">
                Oweru Media
              </h2>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">Management System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {/* Home - Both roles */}
          {(user?.role === "admin" || user?.role === "moderator") && (
            <NavLink to="/" icon={Home}>
              Home
            </NavLink>
          )}

          {/* Admin Navigation */}
          {user?.role === "admin" && (
            <>
              <NavLink to="/admin/dashboard" icon={LayoutDashboard}>
                Dashboard
              </NavLink>

              <NavLink to="/admin/posts" icon={FileText}>
                Post Management
              </NavLink>
            </>
          )}

          {/* Contact Messages - Both roles */}
          {(user?.role === "admin" || user?.role === "moderator") && (
            <NavLink to="/admin/contacts" icon={MessageSquare}>
              Contact Messages
            </NavLink>
          )}

          {/* Moderator Dashboard */}
          {user?.role === "moderator" && (
            <NavLink to="/admin/moderator" icon={LayoutDashboard}>
              Moderator Dashboard
            </NavLink>
          )}

          {/* Admin Dropdowns */}
          {user?.role === "admin" && (
            <>
              {/* Oweru Housing */}
              <div className="space-y-1">
                <DropdownButton
                  onClick={() => toggleDropdown("housing")}
                  isOpen={openDropdown === "housing"}
                  icon={Building2}
                >
                  Oweru Housing
                </DropdownButton>
                
                <div
                  className={`space-y-1 overflow-hidden transition-all duration-300 ${
                    openDropdown === "housing" ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <SubLink to="/admin/rentals" icon={Home}>Rentals</SubLink>
                  <SubLink to="/admin/property-sales" icon={ShoppingBag}>Property Sales</SubLink>
                  <SubLink to="/admin/construction-property-management" icon={Hammer}>
                    Construction & Property Management
                  </SubLink>
                </div>
              </div>

              {/* Oweru Official */}
              <div className="space-y-1">
                <DropdownButton
                  onClick={() => toggleDropdown("official")}
                  isOpen={openDropdown === "official"}
                  icon={Briefcase}
                >
                  Oweru Official
                </DropdownButton>
                
                <div
                  className={`space-y-1 overflow-hidden transition-all duration-300 ${
                    openDropdown === "official" ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <SubLink to="/admin/lands-and-plots" icon={MapPin}>Lands and Plots</SubLink>
                  <SubLink to="/admin/property-services" icon={Landmark}>
                    Land & Property Administration Services
                  </SubLink>
                  <SubLink to="/admin/investment" icon={TrendingUp}>Investment</SubLink>
                </div>
              </div>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent p-4 mt-auto">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-100">
            <p className="text-xs text-gray-600 font-medium">
              Logged in as{" "}
              <span className="text-[#C89128] font-semibold capitalize">
                {user?.role}
              </span>
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;