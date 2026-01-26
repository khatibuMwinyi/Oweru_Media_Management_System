import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/oweru_logo.png";
import { Menu, X, ChevronDown } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Navbar = ({ onCategoryClick, selectedCategory }) => {
  const [open, setOpen] = useState(false);
  const [dropdowns, setDropdowns] = useState({});
  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const navbarRef = useRef(null);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const categoryIdMap = {
    rentals: "rentals",
    "property-sales": "property_sales",
    "construction-management": "construction_property_management",
    "lands-plots": "lands_and_plots",
    "property-services": "property_services",
    investment: "investment",
  };

  const categoryToIdMap = Object.fromEntries(
    Object.entries(categoryIdMap).map(([id, category]) => [category, id]),
  );

  const menuItems = [
    { name: "Home", id: "home" },
    {
      name: "Oweru Official",
      key: "official",
      subItems: [
        {
          name: "Lands & Plots",
          id: "lands-plots",
          category: "lands_and_plots",
        },
        {
          name: "Property Services",
          id: "property-services",
          category: "property_services",
        },
        { name: "Investment", id: "investment", category: "investment" },
      ],
    },
    {
      name: "Oweru Housing",
      key: "housing",
      subItems: [
        { name: "Rentals", id: "rentals", category: "rentals" },
        {
          name: "Property Sales",
          id: "property-sales",
          category: "property_sales",
        },
        {
          name: "Construction & Property Management",
          id: "construction-management",
          category: "construction_property_management",
        },
      ],
    },
    { name: "About", path: "/about", isRoute: true },
  ];

  const scrollToSection = (id) => {
    const categoryIds = [
      "rentals",
      "property-sales",
      "construction-management",
      "lands-plots",
      "property-services",
      "investment",
    ];

    if (categoryIds.includes(id) && onCategoryClick) {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          onCategoryClick(id);
        }, 100);
      } else {
        onCategoryClick(id);
      }
      setOpen(false);
      return;
    }

    if (id === "home" && location.pathname !== "/") {
      navigate("/");
      setOpen(false);
      return;
    }

    const section = document.getElementById(id);
    if (section && navbarRef.current) {
      const offset = navbarRef.current.offsetHeight;
      window.scrollTo({
        top: section.offsetTop - offset,
        behavior: "smooth",
      });
      setOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      if (!navbarRef.current) return;
      const offset = navbarRef.current.offsetHeight + 5;
      let current = "home";

      menuItems
        .flatMap((item) =>
          item.subItems ? item.subItems.map((s) => s.id) : item.id,
        )
        .forEach((id) => {
          const section = document.getElementById(id);
          if (section && window.scrollY + offset >= section.offsetTop) {
            current = id;
          }
        });
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      ref={navbarRef}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-lg" : "bg-white/95 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => scrollToSection("home")}
          >
            <img
              src={logo}
              alt="Oweru Logo"
              className="h-12 w-12 object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <span className="text-xl font-bold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Oweru Media Hub
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) =>
              item.subItems ? (
                <div key={item.key} className="relative group">
                  <button
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg text-gray-700 font-medium transition-all duration-200 hover:bg-gray-100 ${
                      item.subItems.some((s) => s.id === activeSection)
                        ? "text-[#C89128] bg-amber-50"
                        : ""
                    }`}
                  >
                    {item.name}
                    <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180 duration-200" />
                  </button>

                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 -translate-y-2">
                    <div className="py-2">
                      {item.subItems.map((sub) => {
                        const isSelected = selectedCategory === sub.category;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => scrollToSection(sub.id)}
                            className={`w-full text-left px-4 py-3 text-sm transition-colors duration-150 hover:bg-amber-50 flex items-center justify-between ${
                              isSelected
                                ? "text-[#C89128] bg-amber-50 font-medium"
                                : "text-gray-700"
                            }`}
                          >
                            {sub.name}
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-[#C89128]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : item.isRoute ? (
                <Link
                  key={item.path}
                  to={item.path}
                  className="px-4 py-2 rounded-lg text-gray-700 font-medium transition-all duration-200 hover:bg-gray-100"
                >
                  {item.name}
                </Link>
              ) : (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-gray-100 ${
                    activeSection === item.id
                      ? "text-[#C89128] bg-amber-50"
                      : "text-gray-700"
                  }`}
                >
                  {item.name}
                </button>
              ),
            )}
          </div>

          {/* Auth Buttons Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to={user.role === "admin" ? "/admin" : "/moderator"}
                  className="px-4 py-2 rounded-lg text-gray-700 font-medium transition-all duration-200 hover:bg-gray-100"
                >
                  {user.role === "admin" ? "Dashboard" : "Moderator"}
                </Link>
                <button
                  onClick={async () => {
                    await logout();
                    navigate("/login");
                  }}
                  className="px-5 py-2 rounded-lg bg-linear-to-r from-red-600 to-red-500 text-white font-semibold shadow-md hover:shadow-lg hover:from-red-700 hover:to-red-600 transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2 rounded-lg bg-linear-to-r from-[#C89128] to-[#B08020] text-white font-semibold shadow-md hover:shadow-lg hover:from-[#B08020] hover:to-[#9A7018] transition-all duration-200"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden bg-white border-t border-gray-100 overflow-hidden transition-all duration-300 ${
          open ? "max-h-screen shadow-lg" : "max-h-0"
        }`}
      >
        <div className="px-4 py-4 space-y-1 max-h-[calc(100vh-5rem)] overflow-y-auto">
          {menuItems.map((item) =>
            item.subItems ? (
              <div key={item.key} className="space-y-1">
                <button
                  onClick={() =>
                    setDropdowns((prev) => ({
                      ...prev,
                      [item.key]: !prev[item.key],
                    }))
                  }
                  className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-150"
                >
                  {item.name}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      dropdowns[item.key] ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`ml-4 space-y-1 overflow-hidden transition-all duration-200 ${
                    dropdowns[item.key] ? "max-h-96" : "max-h-0"
                  }`}
                >
                  {item.subItems.map((sub) => {
                    const isSelected = selectedCategory === sub.category;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => scrollToSection(sub.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors duration-150 flex items-center justify-between ${
                          isSelected
                            ? "text-[#C89128] bg-amber-50 font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {sub.name}
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#C89128]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : item.isRoute ? (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-150"
              >
                {item.name}
              </Link>
            ) : (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors duration-150 ${
                  activeSection === item.id
                    ? "text-[#C89128] bg-amber-50"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {item.name}
              </button>
            ),
          )}

          {/* Mobile Auth */}
          <div className="pt-4 mt-4 border-t border-gray-200 space-y-2">
            {user ? (
              <>
                <Link
                  to={user.role === "admin" ? "/admin" : "/moderator"}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-150"
                >
                  {user.role === "admin" ? "Dashboard" : "Moderator Dashboard"}
                </Link>
                <button
                  onClick={async () => {
                    await logout();
                    navigate("/login");
                    setOpen(false);
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-linear-to-r from-red-600 to-red-500 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-lg bg-linear-to-r from-[#C89128] to-[#B08020] text-white font-semibold text-center shadow-md hover:shadow-lg transition-all duration-200"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
