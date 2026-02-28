import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import Navbar from "../components/Navbar";
import HomePostCard from "../components/posts/HomePostCard";
import {
  Filter,
  FileText,
  ArrowRight,
  Award,
  Home,
  Building2,
  MapPin,
  Wrench,
  Briefcase,
  Hammer,
  Download,
  Grid3X3,
  List,
  X,
} from "lucide-react";
import logo from "../assets/oweru_logo.png";

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPostType, setSelectedPostType] = useState("all");
  const [postsToShow, setPostsToShow] = useState(12);
  const [viewMode, setViewMode] = useState("grid");
  const [downloadingAll, setDownloadingAll] = useState(false);

  useEffect(() => {
    const fetchApprovedPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/posts/approved`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const postsArray = data.data || data || [];
        setPosts(Array.isArray(postsArray) ? postsArray : []);
      } catch (err) {
        let errorMessage = "Failed to load posts. ";
        if (err.message.includes("500")) errorMessage += "Server error.";
        else if (err.message.includes("404")) errorMessage += "API not found.";
        else if (err.name === "TypeError") errorMessage += "Cannot reach server.";
        else errorMessage += err.message;
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        (post.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.description || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
      const matchesType = selectedPostType === "all" || post.post_type === selectedPostType;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [posts, searchQuery, selectedCategory, selectedPostType]);

  const displayedPosts = useMemo(
    () => filteredPosts.slice(0, postsToShow),
    [filteredPosts, postsToShow]
  );

  const hasMore = filteredPosts.length > postsToShow;

  const categories = useMemo(
    () => [...new Set(posts.map((p) => p.category))].filter(Boolean),
    [posts]
  );

  const postTypes = useMemo(
    () => [...new Set(posts.map((p) => p.post_type))].filter(Boolean),
    [posts]
  );

  const handleDownloadAll = async () => {
    // ← your previous download logic remains here (omitted for brevity)
    // You can keep the version we prepared earlier
  };

  const categoryInfo = {
    rentals: { name: "Rentals", icon: Home },
    property_sales: { name: "Property Sales", icon: Building2 },
    lands_and_plots: { name: "Lands & Plots", icon: MapPin },
    property_services: { name: "Property Services", icon: Wrench },
    investment: { name: "Investment", icon: Briefcase },
    construction_property_management: { name: "Construction & Management", icon: Hammer },
  };

  const getCategoryName = (key) =>
    categoryInfo[key]?.name || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedPostType("all");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Hero - kept mostly same */}
      <section className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <img src={logo} alt="Oweru" className="h-20 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Oweru Media</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Professional real estate content • Property listings • Video & carousel posts
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/about"
              className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Learn More
            </Link>
            <a
              href="#posts"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
            >
              Browse Posts
            </a>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section id="posts" className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Latest Properties & Content</h2>
              <p className="text-gray-600 mt-1">Discover approved real estate posts</p>
            </div>

            <button
              onClick={handleDownloadAll}
              disabled={downloadingAll || filteredPosts.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition shadow-sm"
            >
              {downloadingAll ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Download All
                </>
              )}
            </button>
          </div>

          {/* Filters - inspired by PostManagement */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Title or description..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {getCategoryName(cat)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Post Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
                <select
                  value={selectedPostType}
                  onChange={(e) => setSelectedPostType(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                >
                  <option value="all">All Types</option>
                  {postTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active filters tags */}
            {(searchQuery || selectedCategory !== "all" || selectedPostType !== "all") && (
              <div className="mt-5 flex flex-wrap gap-2">
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-sm border border-amber-200">
                    "{searchQuery}"
                    <button onClick={() => setSearchQuery("")} className="text-amber-700 hover:text-amber-900">
                      <X size={14} />
                    </button>
                  </span>
                )}
                {selectedCategory !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-sm border border-blue-200">
                    {getCategoryName(selectedCategory)}
                    <button onClick={() => setSelectedCategory("all")} className="text-blue-700 hover:text-blue-900">
                      <X size={14} />
                    </button>
                  </span>
                )}
                {selectedPostType !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-800 rounded-full text-sm border border-purple-200">
                    {selectedPostType}
                    <button onClick={() => setSelectedPostType("all")} className="text-purple-700 hover:text-purple-900">
                      <X size={14} />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Loading / Error / Empty */}
          {loading && (
            <div className="text-center py-16 text-gray-500">Loading posts...</div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-5 rounded-lg mb-8">
              <p className="font-medium">Error loading content</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 text-sm text-red-700 hover:text-red-900 underline"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && filteredPosts.length === 0 && (
            <div className="text-center py-16 bg-white rounded-lg border border-gray-200 shadow-sm">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-1">No posts found</h3>
              <p className="text-gray-500">
                Try adjusting your filters or check back later.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-4 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Posts grid */}
          {!loading && !error && filteredPosts.length > 0 && (
            <>
              <div className="mb-6 text-sm text-gray-600">
                Showing {displayedPosts.length} of {filteredPosts.length} posts
              </div>

              <div
                className={`
                  grid gap-6 mb-10
                  ${viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1 max-w-4xl mx-auto"}
                `}
              >
                {displayedPosts.map((post) => (
                  <HomePostCard key={post.id} post={post} />
                ))}
              </div>

              {hasMore && (
                <div className="text-center mt-10">
                  <button
                    onClick={() => setPostsToShow((prev) => prev + 12)}
                    className="px-8 py-3.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition font-medium shadow-sm"
                  >
                    Load more posts
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-amber-600 to-amber-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to manage your own content?
          </h2>
          <p className="text-lg text-amber-100 mb-8 max-w-2xl mx-auto">
            Join our admin team to create, moderate and publish professional real estate posts.
          </p>
          <Link
            to="/login"
            className="inline-block bg-white text-amber-700 px-8 py-3.5 rounded-lg font-semibold hover:bg-amber-50 transition shadow-md"
          >
            Access Admin Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;