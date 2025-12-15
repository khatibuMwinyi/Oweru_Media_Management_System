import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/oweru_logo.png";
import { Menu, X, ChevronDown, House } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [dropdowns, setDropdowns] = useState({});
  const [activeSection, setActiveSection] = useState("home");
  const navbarRef = useRef(null);

  const menuItems = [
    { name: "Home"  , id: "home" },
    {
      name: "Oweru Official",
      key: "official",
      subItems: [
        { name: "Lands & Plots", id: "lands-plots" },
        { name: "Property Services", id: "property-services" },
        { name: "Investment", id: "investment" },
      ],
    },
    {
      name: "Oweru Housing",
      key: "housing",
      subItems: [
        { name: "Rentals", id: "rentals" },
        { name: "Property Sales", id: "property-sales" },
        {
          name: "Construction & Property Management",
          id: "construction-management",
        },
      ],
    },
  ];

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section && navbarRef.current) {
      const offset = navbarRef.current.offsetHeight;
      window.scrollTo({ top: section.offsetTop - offset, behavior: "smooth" });
      setOpen(false);
    }
  };

  // Highlight active section
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
          if (section && window.scrollY + offset >= section.offsetTop)
            current = id;
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
      className="w-full fixed top-0 left-0 z-50 border-b border-[#E1E3E8] bg-white bg-opacity-50 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
        <img
          src={logo}
          alt="Oweru Logo"
          className="h-8 w-auto mr-4 rounded-full"
        />
        <div className="flex items-center flex-1">
          <h1
            className={`text-xl font-semibold cursor-pointer ${
              activeSection === "home" ? "text-[#141C36]" : "text-[#253155]"
            }`}
            onClick={() => scrollToSection("home")}
          >
            Oweru Media Hub
          </h1>
        </div>

        {/* Center: Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 justify-center flex-1 text-amber-100">
          {menuItems.map((item) =>
            item.subItems ? (
              <div key={item.name} className="relative group">
                <div
                  className={`flex items-center cursor-pointer text-[#141C36] ${
                    item.subItems.some((s) => s.id === activeSection)
                      ? "underline decoration-2"
                      : ""
                  }`}
                >
                  {item.name}
                </div>
                <div className="absolute left-0 mt-2 bg-[#EBEDF2] border border-white/10 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transform -translate-y-2 group-hover:translate-y-0 transition-all duration-300 min-w-max">
                  <ul className="py-2 text-sm">
                    {item.subItems.map((sub) => (
                      <li
                        key={sub.id}
                        className={`px-4 py-2 hover:bg-white/10 text-[#141C36] cursor-pointer ${
                          activeSection === sub.id
                            ? "underline decoration-2"
                            : ""
                        }`}
                        onClick={() => scrollToSection(sub.id)}
                      >
                        {sub.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <span
                key={item.id}
                className={`cursor-pointer hover:text-[#141C36] transition ${
                  activeSection === item.id ? "text-[#141C36]" : ""
                }`}
                onClick={() => scrollToSection(item.id)}
              >
                {item.name}
              </span>
            )
          )}
        </div>

        {/* Right: Login + Mobile Menu Button */}
        <div className="flex items-center justify-end gap-3 flex-1">
          <Link
            to="/login"
            className="hidden sm:inline-block px-3 py-2 rounded bg-[#f0a71e] text-[#141C36] font-semibold hover:translate-x-0.5 transition-all duration-200"
          >
            Login
          </Link>

          <button
            className="md:hidden text-amber-100"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={30} /> : <Menu size={30} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-[#c89128] border-t border-[#E1E3E8] overflow-hidden transition-[max-height] duration-300 ${
          open ? "max-h-[1000px]" : "max-h-0"
        }`}
      >
        <ul className="flex flex-col px-6 py-4 text-amber-100">
          {menuItems.map((item) =>
            item.subItems ? (
              <li key={item.key} className="py-2">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() =>
                    setDropdowns((prev) => {
                      const newState = {};
                      // Close all other dropdowns
                      Object.keys(prev).forEach((k) => {
                        if (k !== item.key) {
                          newState[k] = false;
                        }
                      });
                      // Toggle the clicked dropdown
                      newState[item.key] = !prev[item.key];
                      return newState;
                    })
                  }
                >
                  <span
                    className={`${
                      item.subItems.some((s) => s.id === activeSection)
                        ? "text-[#F6C049]"
                        : ""
                    }`}
                  >
                    {item.name}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`${
                      dropdowns[item.key] ? "rotate-180" : ""
                    } transition`}
                  />
                </div>
                <ul
                  className="ml-4 mt-2 overflow-hidden transition-[max-height] duration-300"
                  style={{ maxHeight: dropdowns[item.key] ? "500px" : "0" }}
                >
                  {item.subItems.map((sub) => (
                    <li
                      key={sub.id}
                      className={`py-1 hover:text-[#F6C049] cursor-pointer ${
                        activeSection === sub.id ? "text-[#F6C049]" : ""
                      }`}
                      onClick={() => scrollToSection(sub.id)}
                    >
                      {sub.name}
                    </li>
                  ))}
                </ul>
              </li>
            ) : (
              <li
                key={item.id}
                className={`py-2 cursor-pointer hover:text-[#F6C049] ${
                  activeSection === item.id ? "text-[#F6C049]" : ""
                }`}
                onClick={() => scrollToSection(item.id)}
              >
                {item.name}
              </li>
            )
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
