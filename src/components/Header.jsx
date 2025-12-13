import React from "react";
import { useAuth } from "../contexts/AuthContext";

const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 border-b border-[#E1E3E8] flex justify-between items-center shadow-sm w-full">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 sm:p-3 rounded bg-gray-100 hover:bg-gray-200"
          aria-label="Toggle sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <h1 className="text-base sm:text-lg md:text-xl font-semibold">
          Admin Dashboard
        </h1>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        {user && (
          <span className="text-xs sm:text-sm text-gray-600">{user.name}</span>
        )}
        <button
          onClick={handleLogout}
          className="px-2 sm:px-3 md:px-4 py-1.5 md:py-2 rounded bg-gray-200 hover:bg-gray-300 text-xs sm:text-sm md:text-base"
        >
          Log Out
        </button>
      </div>
    </header>
  );
};

export default Header;
