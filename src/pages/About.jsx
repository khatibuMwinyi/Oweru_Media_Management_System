import React from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/oweru_logo.png";
import CatalogueCard from "../components/CatalogueCard";
import { catalogueServices } from "../data/catalogueServices";
import { contactInfo } from "../data/catalogueServices";

const About = () => {
  return (
    <div>
      <div>
        {/* Navbar */}
        <nav className="w-full fixed top-0 left-0 z-50 border-b border-black/5 bg-white bg-opacity-50 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
            {/* Logo + Brand Name */}
            <div className="flex items-center gap-3 flex-[1.2]">
              <img
                src={logo}
                alt="Oweru Logo"
                className="h-8 w-auto rounded-full"
              />
              <h1 className="text-xl font-semibold cursor-pointer text-gray-800">
                <Link to="/">Oweru Media Hub</Link>
              </h1>
            </div>

            {/* Right */}
            <div className="flex items-center justify-end flex-1 gap-3">
              <Link
                to="/login"
                className="hidden sm:inline-block px-3 py-2 rounded bg-slate-800 text-gray-100 font-semibold hover:brightness-105 transition"
              >
                Login
              </Link>
            </div>
          </div>
        </nav>
        {/* Hero Section */}
        <section
          className="relative h-screen bg-cover bg-center flex items-center justify-center"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(15,15,64,0.85), rgba(15,15,64,0.4)), url('/images/hero.jpg')",
          }}
        >
          <div className="max-w-4xl px-6 text-center">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white">
              Smart, Secure Real Estate Powered by Technology
            </h1>

            <p className="mt-6 text-lg text-gray-200">
              Oweru International Ltd is a Tanzanian real estate and investment
              company built to help individuals, families, and investors make
              smart property decisions with safe returns through verified
              properties, transparent processes, and innovative technology.
            </p>
          </div>
        </section>
        {/* Catalogue Section */}
        <section
          className="
        py-10 sm:py-20 lg:py-18
        bg-gray-50
      "
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Title */}
            <header className="max-w-2xl mx-auto text-center mb-12 sm:mb-14">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Our Catalogue
              </h2>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">
                Discover our trusted real estate, property, and investment
                solutions.
              </p>
            </header>

            {/* Responsive Grid */}
            <div
              className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-6 sm:gap-8
          "
            >
              {catalogueServices.map((service, index) => (
                <CatalogueCard
                  key={index}
                  title={service.title}
                  description={service.description}
                  Icon={service.icon}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Contact Info Section */}
        <section className="py-6 bg-gray-50 w-full">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
              Contact Us
            </h2>

            <ul className="space-y-4 text-gray-700">
              {contactInfo.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <li key={idx} className="flex items-center gap-3">
                    <Icon size={24} className="text-[#f0a71e] shrink-0" />
                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {item.info}
                      </a>
                    ) : (
                      <span>{item.info}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
