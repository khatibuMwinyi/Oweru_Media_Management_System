import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { postService } from "../../services/api";
import {
  FileText,
  Home,
  DollarSign,
  TrendingUp,
  BarChart3,
  Folder,
  Sparkles,
  Building2,
  Hammer,
  Briefcase,
  ArrowRight,
  Image,
} from "lucide-react";

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
      icon: FileText,
      route: "/admin/posts",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Rentals",
      description: "View rental properties",
      icon: Home,
      route: "/admin/rentals",
      gradient: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Property Sales",
      description: "Manage property sales",
      icon: DollarSign,
      route: "/admin/property-sales",
      gradient: "from-amber-500 to-amber-600",
    },
    {
      title: "Investment",
      description: "Investment opportunities",
      icon: TrendingUp,
      route: "/admin/investment",
      gradient: "from-purple-500 to-purple-600",
    },
  ];

  const StatCard = ({ icon: Icon, label, value, gradient }) => (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium mb-2">{label}</p>
          <p className="text-3xl font-bold text-gray-900">
            {loading ? <span className="text-gray-400">...</span> : value}
          </p>
        </div>
        <div className={`bg-linear-to-br ${gradient} rounded-xl p-4`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        .font-inter {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 font-inter">
        {/* Hero Section */}
        <div className="bg-white mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-black text-center md:text-left">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
                  Welcome back, Admin
                </h1>
                <p className="text-lg sm:text-xl text-black/90 font-medium">
                  Manage your media and property content with ease
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              icon={BarChart3}
              label="Total Posts"
              value={stats.totalPosts}
              gradient="from-blue-500 to-blue-600"
            />
            <StatCard
              icon={Folder}
              label="Categories"
              value={stats.totalCategories}
              gradient="from-emerald-500 to-emerald-600"
            />
            <StatCard
              icon={Sparkles}
              label="Recent Posts"
              value={stats.recentPosts}
              gradient="from-purple-500 to-purple-600"
            />
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={() => navigate(action.route)}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg p-6 transform hover:scale-105 active:scale-95 transition-all duration-300 text-left border border-gray-100 group"
                  >
                    <div
                      className={`bg-gr-to-br ${action.gradient} rounded-lg p-3 w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {action.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feature Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg overflow-hidden border border-gray-100 transition-shadow duration-300">
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=400&fit=crop&q=80"
                alt="Property Management"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-gr-to-br from-blue-500 to-blue-600 rounded-lg p-2">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Property Management
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Efficiently manage all your property listings, rentals, and
                  sales in one centralized platform.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md hover:shadow-lg overflow-hidden border border-gray-100 transition-shadow duration-300">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop&q=80"
                alt="Media Management"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-gr-to-br from-purple-500 to-purple-600 rounded-lg p-2">
                    <Image className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Media Management
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Upload, organize, and manage images and videos for your
                  property listings with ease.
                </p>
              </div>
            </div>
          </div>

          {/* System Overview */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              System Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gr-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                <div className="bg-gr-to-br from-emerald-500 to-emerald-600 rounded-xl p-3 w-fit mx-auto mb-4">
                  <Home className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2 text-lg">
                  Rentals
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Manage rental properties and listings
                </p>
              </div>
              <div className="text-center p-6 bg-gr-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="bg-gr-to-br from-blue-500 to-blue-600 rounded-xl p-3 w-fit mx-auto mb-4">
                  <Hammer className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2 text-lg">
                  Construction
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Track construction and property management
                </p>
              </div>
              <div className="text-center p-6 bg-gr-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 sm:col-span-2 lg:col-span-1">
                <div className="bg-gr-to-br from-purple-500 to-purple-600 rounded-xl p-3 w-fit mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2 text-lg">
                  Investment
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Explore investment opportunities
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gr-to-r from-[#C89128] to-[#B08020] rounded-xl shadow-lg p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Ready to get started?
                </h3>
                <p className="text-white/90 font-medium">
                  Start creating engaging content for your properties today!
                </p>
              </div>
              <button
                onClick={() => navigate("/admin/posts")}
                className="bg-white text-[#C89128] px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 active:bg-gray-100 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 shadow-md whitespace-nowrap"
              >
                Create New Post
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
