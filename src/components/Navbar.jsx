import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/oweru_logo.png";
import { Menu, X, ChevronDown } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Navbar = ({ onCategoryClick, selectedCategory }) => {
  const [open, setOpen] = useState(false);
  const [dropdowns, setDropdowns] = useState({});
  const [activeSection, setActiveSection] = useState("home");
  const navbarRef = useRef(null);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Map navbar IDs to actual category values for comparison
  const categoryIdMap = {
    "rentals": "rentals",
    "property-sales": "property_sales",
    "construction-management": "construction_property_management",
    "lands-plots": "lands_and_plots",
    "property-services": "property_services",
    "investment": "investment",
  };

  // Reverse map: category value to navbar ID
  const categoryToIdMap = Object.fromEntries(
    Object.entries(categoryIdMap).map(([id, category]) => [category, id])
  );

  const menuItems = [
    { name: "Home", id: "home" },
    {
      name: "Oweru Official",
      key: "official",
      subItems: [
        { name: "Lands & Plots", id: "lands-plots", category: "lands_and_plots" },
        { name: "Property Services", id: "property-services", category: "property_services" },
        { name: "Investment", id: "investment", category: "investment" },
      ],
    },
    {
      name: "Oweru Housing",
      key: "housing",
      subItems: [
        { name: "Rentals", id: "rentals", category: "rentals" },
        { name: "Property Sales", id: "property-sales", category: "property_sales" },
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
    // If it's a category ID and we have the callback, use it to filter
    const categoryIds = ["rentals", "property-sales", "construction-management", "lands-plots", "property-services", "investment"];
    
    if (categoryIds.includes(id) && onCategoryClick) {
      // If we're not on the home page, navigate there first
      if (location.pathname !== "/") {
        navigate("/");
        // Wait for navigation, then apply filter
        setTimeout(() => {
          onCategoryClick(id);
        }, 100);
      } else {
        onCategoryClick(id);
      }
      setOpen(false);
      return;
    }

    // If we're not on home page and clicking home, navigate first
    if (id === "home" && location.pathname !== "/") {
      navigate("/");
      setOpen(false);
      return;
    }

    // Otherwise, just scroll to the section
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

  // Scroll spy
  useEffect(() => {
    const handleScroll = () => {
      if (!navbarRef.current) return;
      const offset = navbarRef.current.offsetHeight + 5;
      let current = "home";

      menuItems
        .flatMap((item) =>
          item.subItems ? item.subItems.map((s) => s.id) : item.id
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

  const linkBase = "relative cursor-pointer transition-colors duration-300";
  const underline =
    "after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:bg-[#C89128] after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100";

  return (
    <nav
      ref={navbarRef}
      className="w-full fixed top-0 left-0 z-50 border-b bg-white bg-opacity-50 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
        {/* Logo + Brand Name */}
        <div className="flex items-center gap-3 flex-[1.2]">
          <img
            src={logo}
            alt="Oweru Logo"
            className="h-8 w-auto rounded-full"
          />
          <h1
            className={`text-xl font-semibold cursor-pointer ${
              activeSection === "home" ? "text-[#141C36]" : "text-[#253155]"
            }`}
            onClick={() => scrollToSection("home")}
          >
            Oweru Media Hub
          </h1>
        </div>

        {/* Center Menu */}
        <div className="hidden md:flex items-center justify-center flex-2 gap-12 text-gray-800">
          {menuItems.map((item) =>
            item.subItems ? (
              <div key={item.name} className="relative group">
                <span
                  className={`${linkBase} ${underline} ${
                    item.subItems.some((s) => s.id === activeSection)
                      ? "after:scale-x-100"
                      : ""
                  }`}
                >
                  {item.name}
                </span>

                <div className="absolute left-0 mt-3 bg-[#EBEDF2] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 min-w-max">
                  <ul className="py-2 text-sm">
                    {item.subItems.map((sub) => {
                      const isSelected = selectedCategory === sub.category;
                      return (
                        <li
                          key={sub.id}
                          className={`px-4 py-2 cursor-pointer hover:bg-white/40 transition-colors ${
                            activeSection === sub.id || isSelected
                              ? "font-semibold text-[#141C36] bg-white/60"
                              : ""
                          }`}
                          onClick={() => scrollToSection(sub.id)}
                        >
                          {sub.name}
                          {isSelected && (
                            <span className="ml-2 text-[#C89128]">●</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ) : item.isRoute ? (
              <Link
                key={item.name}
                to={item.path}
                className={`${linkBase} ${underline} ${
                  location.pathname === item.path ? "after:scale-x-100" : ""
                }`}
              >
                {item.name}
              </Link>
            ) : (
              <span
                key={item.id}
                className={`${linkBase} ${underline} ${
                  activeSection === item.id ? "after:scale-x-100" : ""
                }`}
                onClick={() => scrollToSection(item.id)}
              >
                {item.name}
              </span>
            )
          )}
        </div>

        {/* Right */}
        <div className="flex items-center justify-end flex-1 gap-3">
          {user ? (
            <>
              <Link
                to={
                  user.role === "admin"
                    ? "/admin/dashboard"
                    : "/admin/moderation"
                }
                className="hidden sm:inline-block px-3 py-2 rounded bg-slate-800 text-gray-100 hover:bg-slate-700 font-semibold hover:brightness-105 transition"
              >
                {user.role === "admin" ? "Dashboard" : "Moderator"}
              </Link>
              <button
                onClick={async () => {
                  await logout();
                  navigate("/login");
                }}
                className="hidden sm:inline-block px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-semibold hover:brightness-105 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline-block px-3 py-2 rounded bg-slate-800 text-gray-100 hover:bg-slate-700 font-semibold hover:brightness-105 transition"
            >
              Login
            </Link>
          )}

          <button
            className="md:hidden text-[#141C36]"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={30} /> : <Menu size={30} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-white overflow-hidden transition-[max-height] duration-300 border-t border-gray-200 ${
          open ? "max-h-[1000px]" : "max-h-0"
        }`}
      >
        <ul className="flex flex-col px-6 py-4 text-gray-800">
          {menuItems.map((item) =>
            item.subItems ? (
              <li key={item.key} className="py-2">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() =>
                    setDropdowns((prev) => ({
                      ...prev,
                      [item.key]: !prev[item.key],
                    }))
                  }
                >
                  {item.name}
                  <ChevronDown
                    size={18}
                    className={`transition ${
                      dropdowns[item.key] ? "rotate-180" : ""
                    }`}
                  />
                </div>
                <ul
                  className="ml-4 mt-2 overflow-hidden transition-[max-height] duration-300"
                  style={{
                    maxHeight: dropdowns[item.key] ? "500px" : "0",
                  }}
                >
                  {item.subItems.map((sub) => {
                    const isSelected = selectedCategory === sub.category;
                    return (
                      <li
                        key={sub.id}
                        className={`py-1 cursor-pointer transition-colors ${
                          isSelected
                            ? "text-[#C89128] font-semibold"
                            : "hover:text-[#C89128]"
                        }`}
                        onClick={() => scrollToSection(sub.id)}
                      >
                        {sub.name}
                        {isSelected && (
                          <span className="ml-2 text-[#C89128]">●</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ) : item.isRoute ? (
              <Link
                key={item.name}
                to={item.path}
                className="py-2 block"
                onClick={() => setOpen(false)}
              >
                {item.name}
              </Link>
            ) : (
              <li
                key={item.id}
                className="py-2 cursor-pointer"
                onClick={() => scrollToSection(item.id)}
              >
                {item.name}
              </li>
            )
          )}
          {/* Auth links for mobile */}
          {user ? (
            <>
              <Link
                to={
                  user.role === "admin"
                    ? "/admin/dashboard"
                    : "/admin/moderation"
                }
                className="py-2 block border-t border-gray-200 mt-2 pt-4"
                onClick={() => setOpen(false)}
              >
                {user.role === "admin" ? "Dashboard" : "Moderator Dashboard"}
              </Link>
              <button
                onClick={async () => {
                  await logout();
                  navigate("/login");
                  setOpen(false);
                }}
                className="py-2 block text-left w-full border-t border-gray-200 mt-2 pt-4"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="py-2 block border-t border-gray-200 mt-2 pt-4"
              onClick={() => setOpen(false)}
            >
              Login
            </Link>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
