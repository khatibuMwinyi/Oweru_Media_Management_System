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
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [downloadingAll, setDownloadingAll] = useState(false);
  useEffect(() => {
    const fetchApprovedPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use the public approved posts endpoint instead of the protected one
        const response = await fetch(`${API_BASE_URL}/posts/approved`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const postsArray = data.data || data || [];
        
        if (Array.isArray(postsArray) && postsArray.length > 0) {
          setPosts(postsArray);
        } else {
          setPosts([]);
        }
      } catch (err) {
        let errorMessage = "Failed to load posts. ";
        if (err.status === 500) {
          errorMessage += "Server error. Please check Laravel logs.";
        } else if (err.status === 404) {
          errorMessage += "API endpoint not found. Please check API routes.";
        } else if (err.name === "TypeError" && err.message.includes("fetch")) {
          errorMessage += "Cannot connect to API server. Please check your connection.";
        } else {
          errorMessage += err.message || "Unknown error occurred.";
        }
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
        post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || post.category === selectedCategory;
      const matchesPostType =
        selectedPostType === "all" || post.post_type === selectedPostType;
      return matchesSearch && matchesCategory && matchesPostType;
    });
  }, [posts, searchQuery, selectedCategory, selectedPostType]);
  useEffect(() => {
    setPostsToShow(12);
  }, [searchQuery, selectedCategory, selectedPostType]);
  const displayedPosts = useMemo(() => {
    return filteredPosts.slice(0, postsToShow);
  }, [filteredPosts, postsToShow]);
  const hasMorePosts = filteredPosts.length > postsToShow;
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(posts.map((p) => p.category))].filter(
      Boolean,
    );
    return uniqueCategories;
  }, [posts]);
  const postTypes = useMemo(() => {
    const uniqueTypes = [...new Set(posts.map((p) => p.post_type))].filter(
      Boolean,
    );
    return uniqueTypes;
  }, [posts]);
  const stats = useMemo(() => {
    return {
      totalPosts: posts.length,
      staticPosts: posts.filter((p) => p.post_type === "Static").length,
      carouselPosts: posts.filter((p) => p.post_type === "Carousel").length,
      reelPosts: posts.filter((p) => p.post_type === "Reel").length,
      categories: categories.length,
    };
  }, [posts, categories]);

  const handleDownloadAll = async () => {
    setDownloadingAll(true);
    
    try {
      // Create a comprehensive HTML document with all posts
      const allPostsHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Oweru Media - All Posts</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { height: 80px; margin-bottom: 20px; }
        .title { font-size: 48px; font-weight: 800; color: #C89128; margin-bottom: 10px; }
        .subtitle { font-size: 20px; color: #6b7280; margin-bottom: 30px; }
        .stats { display: flex; justify-content: center; gap: 30px; margin-bottom: 40px; flex-wrap: wrap; }
        .stat-item { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; min-width: 120px; }
        .stat-number { font-size: 32px; font-weight: 700; color: #C89128; }
        .stat-label { font-size: 14px; color: #6b7280; margin-top: 5px; }
        .posts-container { max-width: 1200px; margin: 0 auto; }
        .post-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 30px; }
        .post-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); transition: transform 0.3s ease; }
        .post-card:hover { transform: translateY(-5px); }
        .post-media { width: 100%; height: 250px; background: black; position: relative; }
        .post-media img, .post-media video { width: 100%; height: 100%; object-fit: cover; }
        .post-content { padding: 20px; }
        .post-title { font-size: 20px; font-weight: 700; color: #1f2937; margin-bottom: 10px; }
        .post-meta { font-size: 12px; color: #6b7280; margin-bottom: 15px; }
        .post-description { color: #4b5563; line-height: 1.6; white-space: pre-wrap; }
        .category-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 10px; }
        .badge-rentals { background: #fef3c7; color: #92400e; }
        .badge-property_sales { background: #e5e7eb; color: #374151; }
        .badge-lands_and_plots { background: #fef3c7; color: #92400e; }
        .badge-property_services { background: #e5e7eb; color: #374151; }
        .badge-investment { background: #1f2937; color: white; }
        .badge-construction_property_management { background: #1f2937; color: white; }
        .footer { text-align: center; margin-top: 60px; padding: 40px; background: white; border-radius: 16px; }
        .contact-info { display: flex; justify-content: center; gap: 30px; margin-bottom: 20px; flex-wrap: wrap; }
        .contact-item { display: flex; align-items: center; gap: 8px; color: #374151; text-decoration: none; font-weight: 500; }
        .contact-item:hover { color: #C89128; }
        .generated-date { color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <img src="${logo}" alt="Oweru Logo" class="logo">
        <h1 class="title">Oweru Media</h1>
        <p class="subtitle">Real Estate Property Management System</p>
        <div class="stats">
            <div class="stat-item">
                <div class="stat-number">${stats.totalPosts}</div>
                <div class="stat-label">Total Posts</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${stats.staticPosts}</div>
                <div class="stat-label">Static Posts</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${stats.carouselPosts}</div>
                <div class="stat-label">Carousel Posts</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${stats.reelPosts}</div>
                <div class="stat-label">Video Posts</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${stats.categories}</div>
                <div class="stat-label">Categories</div>
            </div>
        </div>
    </div>
    
    <div class="posts-container">
        <div class="post-grid">
            ${filteredPosts.map(post => `
                <div class="post-card">
                    <div class="post-media">
                        ${post.post_type === 'Reel' && post.media?.filter(m => m.file_type === 'video').length > 0 ? 
                            `<video controls><source src="${post.media.filter(m => m.file_type === 'video')[0]?.url || ''}" type="video/mp4"></video>` :
                            post.media?.filter(m => m.file_type === 'image').length > 0 ?
                            `<img src="${post.media.filter(m => m.file_type === 'image')[0]?.url || ''}" alt="${post.title}">` :
                            '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white;">No media available</div>'
                        }
                    </div>
                    <div class="post-content">
                        <div class="category-badge badge-${post.category}">${post.category?.replace('_', ' ') || 'Uncategorized'}</div>
                        <h3 class="post-title">${post.title}</h3>
                        <div class="post-meta">${post.post_type} • ${new Date(post.created_at).toLocaleDateString()}</div>
                        <div class="post-description">${post.description}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    
    <div class="footer">
        <div class="contact-info">
            <a href="mailto:info@oweru.com" class="contact-item">📧 info@oweru.com</a>
            <a href="tel:+255711890764" class="contact-item">📞 +255 711 890 764</a>
            <a href="https://www.oweru.com" class="contact-item">🌐 oweru.com</a>
        </div>
        <div class="generated-date">
            Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
        </div>
    </div>
</body>
</html>`;

      const blob = new Blob([allPostsHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().getTime();
      link.download = `Oweru_Media_All_Posts_${timestamp}.html`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading all posts:', error);
      alert('Failed to download posts. Please try again.');
    } finally {
      setDownloadingAll(false);
    }
  };

  const categoryInfo = {
    rentals: {
      name: "Rentals",
      icon: Home,
      color: "from-emerald-500 to-emerald-600",
    },
    property_sales: {
      name: "Property Sales",
      icon: Building2,
      color: "from-blue-500 to-blue-600",
    },
    lands_and_plots: {
      name: "Lands & Plots",
      icon: MapPin,
      color: "from-green-500 to-green-600",
    },
    property_services: {
      name: "Property Services",
      icon: Wrench,
      color: "from-orange-500 to-orange-600",
    },
    investment: {
      name: "Investment",
      icon: Briefcase,
      color: "from-purple-500 to-purple-600",
    },
    construction_property_management: {
      name: "Construction & Management",
      icon: Hammer,
      color: "from-amber-500 to-amber-600",
    },
  };
  const handleCategoryFilter = (categoryId) => {
    const categoryMap = {
      rentals: "rentals",
      "property-sales": "property_sales",
      "construction-management": "construction_property_management",
      "lands-plots": "lands_and_plots",
      "property-services": "property_services",
      investment: "investment",
    };
    const category = categoryMap[categoryId];
    if (category) {
      setSelectedCategory(category);
      setTimeout(() => {
        const postsSection = document.getElementById("posts");
        if (postsSection) {
          const offset = 100;
          window.scrollTo({
            top: postsSection.offsetTop - offset,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  };
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
        <Navbar
          onCategoryClick={handleCategoryFilter}
          selectedCategory={selectedCategory}
        />
        {/* Hero Section */}
        <section
          id="home"
          className="relative pt-24 pb-20 overflow-hidden bg-linear-to-br from-gray-900 via-gray-800 to-gray-900"
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
            style={{
              backgroundImage: `url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")`,
            }}
          ></div>
          <div className="absolute inset-0 bg-g-to-b from-gray-900/50 via-gray-900/70 to-gray-900"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-16 lg:py-24">
              <div className="flex justify-center mb-8">
                <img
                  src={logo}
                  alt="Oweru Logo"
                  className="h-24 w-auto rounded-full shadow-2xl ring-4 ring-white/20 hover:ring-white/30 transition-all duration-300"
                />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                Oweru Media Management System
              </h1>
              <p className="text-xl sm:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
                Streamline your real estate content with professional post
                management, multi-format media support, and intelligent
                categorization
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/about"
                  className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                >
                  Learn More <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#posts"
                  className="px-8 py-4 bg-gray-800 text-white font-semibold rounded-xl border-2 border-gray-700 hover:bg-gray-700 hover:border-gray-600 transition-all duration-300"
                >
                  Explore Posts
                </a>
              </div>
            </div>
          </div>
        </section>
        {/* Posts Section */}
        <section id="posts" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                Latest Posts
              </h2>
              <p className="text-lg text-gray-600 font-medium">
                Discover our latest real estate content and property listings
              </p>
            </div>
            
            {/* Controls Bar */}
            <div className="mb-8 bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  {/* Post Type Filter */}
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    <select
                      value={selectedPostType}
                      onChange={(e) => setSelectedPostType(e.target.value)}
                      className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C89128] focus:border-transparent appearance-none bg-white text-gray-900 font-medium w-full sm:w-auto cursor-pointer"
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
                
                {/* View Controls */}
                <div className="flex items-center gap-3">
                  {/* View Mode Toggle */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`px-3 py-2 rounded-md transition-colors ${
                        viewMode === "grid"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                      title="Grid View"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`px-3 py-2 rounded-md transition-colors ${
                        viewMode === "list"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                      title="List View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Download All Button */}
                  <button
                    onClick={handleDownloadAll}
                    disabled={downloadingAll || filteredPosts.length === 0}
                    className="px-4 py-2 bg-gradient-to-r from-[#C89128] to-[#B08020] text-white rounded-lg hover:from-[#B08020] hover:to-[#9A7018] transition-all duration-300 font-semibold shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingAll ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download All</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              {/* Active Filters Display */}
              {(selectedCategory !== "all" ||
                selectedPostType !== "all" ||
                searchQuery) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedCategory !== "all" && (
                    <span className="px-4 py-2 bg-amber-50 text-amber-900 rounded-full text-sm font-medium flex items-center gap-2 border border-amber-200">
                      Category:{" "}
                      {categoryInfo[selectedCategory]?.name || selectedCategory}
                      <button
                        onClick={() => setSelectedCategory("all")}
                        className="hover:text-amber-700 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {selectedPostType !== "all" && (
                    <span className="px-4 py-2 bg-blue-50 text-blue-900 rounded-full text-sm font-medium flex items-center gap-2 border border-blue-200">
                      Type: {selectedPostType}
                      <button
                        onClick={() => setSelectedPostType("all")}
                        className="hover:text-blue-700 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="px-4 py-2 bg-gray-100 text-gray-900 rounded-full text-sm font-medium flex items-center gap-2 border border-gray-300">
                      Search: "{searchQuery}"
                      <button
                        onClick={() => setSearchQuery("")}
                        className="hover:text-gray-700 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
            {loading && (
              <div className="flex justify-center items-center py-16">
                <div className="text-gray-600 text-lg font-medium">
                  Loading posts...
                </div>
              </div>
            )}
            {error && !loading && (
              <div className="bg-red-50 border border-red-200 text-red-900 px-6 py-4 rounded-xl mb-6">
                <p className="font-semibold mb-2">Error loading posts</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
            {!loading && !error && filteredPosts.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl shadow-md border border-gray-200">
                <FileText className="w-20 h-20 mx-auto mb-4 text-gray-400" />
                <p className="text-xl text-gray-600 mb-3 font-semibold">
                  {posts.length === 0
                    ? "No approved posts available yet."
                    : "No posts match your filters."}
                </p>
                {(selectedCategory !== "all" ||
                  selectedPostType !== "all" ||
                  searchQuery) && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setSelectedPostType("all");
                    }}
                    className="mt-4 px-6 py-3 bg-g-to-r from-[#C89128] to-[#B08020] text-white rounded-lg hover:from-[#B08020] hover:to-[#9A7018] transition-all duration-300 font-semibold shadow-md"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
            {!loading && !error && filteredPosts.length > 0 && (
              <>
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="text-sm text-gray-600 font-medium">
                    Showing{" "}
                    <span className="font-bold text-gray-900">
                      {displayedPosts.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-gray-900">
                      {filteredPosts.length}
                    </span>{" "}
                    posts
                    {filteredPosts.length !== posts.length && (
                      <span className="text-gray-500">
                        {" "}
                        (filtered from {posts.length} total)
                      </span>
                    )}
                  </div>
                  {hasMorePosts && (
                    <button
                      onClick={() => setPostsToShow(filteredPosts.length)}
                      className="px-6 py-2 bg-g-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 font-semibold flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                      See All Posts <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                  {!hasMorePosts && postsToShow > 12 && (
                    <button
                      onClick={() => setPostsToShow(12)}
                      className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold flex items-center gap-2"
                    >
                      Show Less
                    </button>
                  )}
                </div>
                <div className={`${
                viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                  : "space-y-6"
              } mb-8`}>
                  {displayedPosts.map((post) => (
                    <div
                      key={post.id}
                      className={viewMode === "list" ? "flex flex-col lg:flex-row gap-6 bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" : ""}
                    >
                      <HomePostCard post={post} />
                      {viewMode === "list" && (
                        <div className="flex-1 p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                              <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                                <span className="px-2 py-1 bg-[#C89128]/10 text-[#C89128] rounded-full text-xs font-medium">
                                  {post.category?.replace('_', ' ')}
                                </span>
                                <span>{post.post_type}</span>
                                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 leading-relaxed mb-4 line-clamp-3">
                            {post.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <a href="mailto:info@oweru.com" className="hover:text-[#C89128] transition-colors">
                                📧 info@oweru.com
                              </a>
                              <a href="tel:+255711890764" className="hover:text-[#C89128] transition-colors">
                                📞 +255 711 890 764
                              </a>
                            </div>
                            <Link
                              to={`/post/${post.id}`}
                              className="px-4 py-2 bg-[#C89128] text-white rounded-lg hover:bg-[#B08020] transition-colors font-medium text-sm"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {hasMorePosts && (
                  <div className="text-center mt-10">
                    <button
                      onClick={() =>
                        setPostsToShow((prev) =>
                          Math.min(prev + 12, filteredPosts.length),
                        )
                      }
                      className="px-8 py-4 bg-g-to-r from-gray-800 to-gray-900 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 mx-auto"
                    >
                      Load More Posts <ArrowRight className="w-5 h-5" />
                    </button>
                    <p className="text-sm text-gray-500 mt-3 font-medium">
                      {filteredPosts.length - postsToShow} more posts available
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
        {/* Call to Action Section */}
        <section className="py-20 bg-#C89128 bg-linear-to-r from-[#C89128] to-[#B08020]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Award className="w-16 h-16 mx-auto mb-6 text-white" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Manage Your Content?
            </h2>
            <p className="text-xl text-white/90 mb-8 font-medium">
              Join our team of administrators and moderators to create and
              manage professional real estate content
            </p>
            <Link
              to="/login"
              className="inline-block px-8 py-4 bg-white text-[#C89128] font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Access Dashboard
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};
export default HomePage;
     











