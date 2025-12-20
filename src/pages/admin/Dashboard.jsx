import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { postService } from "../../services/api";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalCategories: 6,
    recentPosts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await postService.getAll();
        const posts = response.data.data || response.data;
        setStats({
          totalPosts: posts.length || 0,
          totalCategories: 6,
          recentPosts: posts.slice(0, 5).length,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickActions = [
    {
      title: "Manage Posts",
      description: "Create, edit, and manage all posts",
      icon: "📝",
      route: "/admin/posts",
    },
    {
      title: "Rentals",
      description: "View rental properties",
      icon: "🏠",
      route: "/admin/rentals",
    },
    {
      title: "Property Sales",
      description: "Manage property sales",
      icon: "💰",
      route: "/admin/property-sales",
    },
    {
      title: "Investment",
      description: "Investment opportunities",
      icon: "📈",
      route: "/admin/investment",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white-100 rounded-lg sm:rounded-2xl mb-4 sm:mb-8 mx-2 sm:mx-4 md:mx-6">
        <div className="relative px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12 lg:py-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
              <div className="text-white mb-4 md:mb-0 text-center md:text-left w-full md:w-auto">
                <h1 className="text-2xl text-gray-800 sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3">
                  Welcome back admin
                </h1>
                <p className="text-base text-gray-600 sm:text-lg md:text-xl lg:text-2xl ">
                  Manage your media and property content with ease
                </p>
              </div>
              <div className="flex-shrink-0 w-full md:w-auto flex justify-center md:justify-end">
                <img
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&q=80"
                  alt="Property Management"
                  className="rounded-lg shadow-xl w-full max-w-xs sm:w-56 md:w-64 h-40 sm:h-44 md:h-48 object-cover border-2 sm:border-4 border-white/30"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-[#1e3a8a] transform hover:scale-105 transition duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Total Posts</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#1e3a8a] mt-1 sm:mt-2">
                  {loading ? "..." : stats.totalPosts}
                </p>
              </div>
              <div className="bg-[#1e3a8a]/10 rounded-full p-3 sm:p-4 ml-2">
                <span className="text-2xl sm:text-3xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-[#1e3a8a] transform hover:scale-105 transition duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Categories</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#1e3a8a] mt-1 sm:mt-2">
                  {stats.totalCategories}
                </p>
              </div>
              <div className="bg-[#1e3a8a]/10 rounded-full p-3 sm:p-4 ml-2">
                <span className="text-2xl sm:text-3xl">📁</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-[#1e3a8a] transform hover:scale-105 transition duration-300 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Recent Posts</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#1e3a8a] mt-1 sm:mt-2">
                  {loading ? "..." : stats.recentPosts}
                </p>
              </div>
              <div className="bg-[#1e3a8a]/10 rounded-full p-3 sm:p-4 ml-2">
                <span className="text-2xl sm:text-3xl">✨</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[#1e3a8a] mb-4 sm:mb-6 px-2 sm:px-0">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.route)}
                className="bg-white/90 active:bg-white/80 text-blue-600 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 transform hover:scale-105 active:scale-95 transition duration-300 text-left w-full"
              >
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{action.icon}</div>
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{action.title}</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Feature Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <img
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=400&fit=crop&q=80"
              alt="Property Management"
              className="w-full h-40 sm:h-48 object-cover"
            />
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-[#1e3a8a] mb-2">
                Property Management
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Efficiently manage all your property listings, rentals, and sales
                in one centralized platform.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop&q=80"
              alt="Media Management"
              className="w-full h-40 sm:h-48 object-cover"
            />
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-[#1e3a8a] mb-2">
                Media Management
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Upload, organize, and manage images and videos for your property
                listings with ease.
              </p>
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 border border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-[#1e3a8a] mb-4 sm:mb-6">System Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center p-3 sm:p-4 bg-[#1e3a8a]/5 rounded-lg border border-[#1e3a8a]/10">
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🏘️</div>
              <h4 className="font-semibold text-[#1e3a8a] mb-1 sm:mb-2 text-sm sm:text-base">Rentals</h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Manage rental properties and listings
              </p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-[#1e3a8a]/5 rounded-lg border border-[#1e3a8a]/10">
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🏗️</div>
              <h4 className="font-semibold text-[#1e3a8a] mb-1 sm:mb-2 text-sm sm:text-base">Construction</h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Track construction and property management
              </p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-[#1e3a8a]/5 rounded-lg border border-[#1e3a8a]/10 sm:col-span-2 lg:col-span-1">
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">💼</div>
              <h4 className="font-semibold text-[#1e3a8a] mb-1 sm:mb-2 text-sm sm:text-base">Investment</h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Explore investment opportunities
              </p>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
          <div className="bg-white/90 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 md:p-8 text-gray-600 mb-4 sm:mb-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 sm:gap-6">
            <div className="text-center sm:text-left mb-2 sm:mb-0 flex-1">
              <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
                Ready to get started?
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Start creating engaging content for your properties today!
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/posts")}
              className="bg-white text-[#1e3a8a] px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-gray-100 active:bg-gray-200 transition duration-300 transform hover:scale-105 active:scale-95 w-full sm:w-auto text-sm sm:text-base whitespace-nowrap"
            >
              Create New Post →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
