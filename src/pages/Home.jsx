import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import HomePostCard from "../components/posts/HomePostCard";
import { 
  Image, 
  Video, 
  Images, 
  Search, 
  Filter, 
  TrendingUp, 
  Shield, 
  Zap, 
  BarChart3,
  CheckCircle2,
  FileText,
  PlayCircle,
  Grid3x3,
  ArrowRight,
  Users,
  Award,
  Globe
} from "lucide-react";
import logo from "../assets/oweru_logo.png";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPostType, setSelectedPostType] = useState("all");
  const [postsToShow, setPostsToShow] = useState(12); // Initial number of posts to display

  useEffect(() => {
    const fetchApprovedPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        console.log('Fetching from:', `${API_BASE_URL}/posts/approved`);
        
        const response = await fetch(`${API_BASE_URL}/posts/approved`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        console.log('Response status:', response.status, response.statusText);

        if (!response.ok) {
          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
            console.error('Error response data:', errorData);
          } catch (e) {
            const text = await response.text();
            console.error('Error response text:', text);
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('Response data:', data);
        
        const postsArray = data.data || data || [];
        console.log('Posts array:', postsArray, 'Length:', postsArray.length);
        
        if (Array.isArray(postsArray) && postsArray.length > 0) {
          setPosts(postsArray);
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.error("Failed to load posts for landing page:", err);
        console.error("Error name:", err.name);
        console.error("Error message:", err.message);
        
        let errorMessage = "Failed to load posts. ";
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
          errorMessage += "Cannot connect to the API server. Please make sure the Laravel server is running (php artisan serve).";
        } else if (err.message.includes('404')) {
          errorMessage += "API endpoint not found. Please check the API routes.";
        } else if (err.message.includes('500')) {
          errorMessage += "Server error. Please check the Laravel logs.";
        } else {
          errorMessage += err.message;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedPosts();
  }, []);

  // Filter posts based on search, category, and post type
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

  // Reset posts to show when filters change
  useEffect(() => {
    setPostsToShow(12);
  }, [searchQuery, selectedCategory, selectedPostType]);

  // Get posts to display (limited initially)
  const displayedPosts = useMemo(() => {
    return filteredPosts.slice(0, postsToShow);
  }, [filteredPosts, postsToShow]);

  const hasMorePosts = filteredPosts.length > postsToShow;

  // Get unique categories and post types
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(posts.map(p => p.category))].filter(Boolean);
    return uniqueCategories;
  }, [posts]);

  const postTypes = useMemo(() => {
    const uniqueTypes = [...new Set(posts.map(p => p.post_type))].filter(Boolean);
    return uniqueTypes;
  }, [posts]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      totalPosts: posts.length,
      staticPosts: posts.filter(p => p.post_type === "Static").length,
      carouselPosts: posts.filter(p => p.post_type === "Carousel").length,
      reelPosts: posts.filter(p => p.post_type === "Reel").length,
      categories: categories.length,
    };
  }, [posts, categories]);

  const categoryInfo = {
    rentals: { name: "Rentals", icon: "🏠", color: "from-slate-600 to-slate-700" },
    property_sales: { name: "Property Sales", icon: "🏘️", color: "from-slate-700 to-slate-800" },
    lands_and_plots: { name: "Lands & Plots", icon: "🌳", color: "from-slate-600 to-slate-700" },
    property_services: { name: "Property Services", icon: "🔧", color: "from-slate-700 to-slate-800" },
    investment: { name: "Investment", icon: "💼", color: "from-slate-600 to-slate-700" },
    construction_property_management: { name: "Construction & Management", icon: "🏗️", color: "from-slate-700 to-slate-800" },
  };
  // Function to handle category filter from navbar
  const handleCategoryFilter = (categoryId) => {
    // Map navbar IDs to actual category values
    const categoryMap = {
      "rentals": "rentals",
      "property-sales": "property_sales",
      "construction-management": "construction_property_management",
      "lands-plots": "lands_and_plots",
      "property-services": "property_services",
      "investment": "investment",
    };

    const category = categoryMap[categoryId];
    if (category) {
      setSelectedCategory(category);
      // Scroll to posts section after a brief delay to ensure state is updated
      setTimeout(() => {
        const postsSection = document.getElementById("posts");
        if (postsSection) {
          const offset = 100; // Account for navbar height
          window.scrollTo({
            top: postsSection.offsetTop - offset,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar 
        onCategoryClick={handleCategoryFilter} 
        selectedCategory={selectedCategory}
      />
      {/* Hero Section */}       
      <section id="home" className="relative pt-24 pb-16 overflow-hidden bg-slate-900">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25"
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")`
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/70 to-slate-900/90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12 sm:py-16 lg:py-20">
            <div className="flex justify-center mb-6">
          <img src={logo} alt="Oweru Logo" className="h-20 w-auto rounded-full shadow-2xl ring-4 ring-white/20" />
        </div>
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
    Oweru Media Management System
  </h1>
<p className="text-xl sm:text-2xl text-slate-200 mb-8 max-w-3xl mx-auto leading-relaxed">
Streamline your real estate content with professional post management, multi-format media support, and intelligent categorization
  </p>
    <div className="flex flex-wrap justify-center gap-4">
        <Link to="/about"
                className="px-8 py-4 bg-white text-slate-900 font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                Learn More <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#posts"
                className="px-8 py-4 bg-slate-800 text-white font-semibold rounded-lg border border-slate-700 hover:bg-slate-700 transition-all duration-300"
              >
                Explore Posts
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      {/* <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center p-6 bg-slate-900 rounded-xl shadow-sm">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-white" />
              <div className="text-3xl font-bold text-white">{stats.totalPosts}</div>
              <div className="text-sm text-slate-300 mt-1">Total Posts</div>
            </div>
            <div className="text-center p-6 bg-slate-900 rounded-xl shadow-sm">
              <Image className="w-8 h-8 mx-auto mb-2 text-white" />
              <div className="text-3xl font-bold text-white">{stats.staticPosts}</div>
              <div className="text-sm text-slate-300 mt-1">Static Posts</div>
            </div>
            <div className="text-center p-6 bg-slate-900 rounded-xl shadow-sm">
              <Images className="w-8 h-8 mx-auto mb-2 text-white" />
              <div className="text-3xl font-bold text-white">{stats.carouselPosts}</div>
              <div className="text-sm text-slate-300 mt-1">Carousels</div>
            </div>
            <div className="text-center p-6 bg-slate-900 rounded-xl shadow-sm">
              <Video className="w-8 h-8 mx-auto mb-2 text-white" />
              <div className="text-3xl font-bold text-white">{stats.reelPosts}</div>
              <div className="text-sm text-slate-300 mt-1">Reels</div>
            </div>
            <div className="text-center p-6 bg-slate-900 rounded-xl shadow-sm">
              <Grid3x3 className="w-8 h-8 mx-auto mb-2 text-white" />
              <div className="text-3xl font-bold text-white">{stats.categories}</div>
              <div className="text-sm text-slate-300 mt-1">Categories</div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Features Section */}
      {/* <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to manage and showcase your real estate content professionally
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-200">
              <div className="w-14 h-14 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
                <Image className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Multiple Post Types</h3>
              <p className="text-slate-600 leading-relaxed">
                Create Static posts, multi-image Carousels, and engaging Reel videos to showcase properties in the best way.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-200">
              <div className="w-14 h-14 bg-slate-800 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Moderation System</h3>
              <p className="text-slate-600 leading-relaxed">
                Robust approval workflow with admin and moderator roles ensuring quality content before publication.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-200">
              <div className="w-14 h-14 bg-slate-800 rounded-lg flex items-center justify-center mb-4">
                <Grid3x3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Categorization</h3>
              <p className="text-slate-600 leading-relaxed">
                Organize content across 6 categories: Rentals, Property Sales, Lands & Plots, Services, Investment, and Construction.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-200">
              <div className="w-14 h-14 bg-slate-800 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Fast & Responsive</h3>
              <p className="text-slate-600 leading-relaxed">
                Optimized performance with modern React architecture ensuring smooth browsing on all devices.
              </p>
            </div>

                <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-200">
              <div className="w-14 h-14 bg-slate-800 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Quality Assurance</h3>
              <p className="text-slate-600 leading-relaxed">
                All posts go through a review process to maintain professional standards and brand consistency.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-200">
              <div className="w-14 h-14 bg-slate-800 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Public & Secure</h3>
              <p className="text-slate-600 leading-relaxed">
                Public-facing homepage with secure admin dashboard for content management and moderation.
              </p>
            </div>
          </div>
        </div>
      </section> */}
      {/* Category Highlights */}
      {/* {categories.length > 0 && (
        <section className="py-16 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Explore Categories
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Browse our diverse range of real estate offerings
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => {
                const info = categoryInfo[category] || { name: category, icon: "📋", color: "from-slate-400 to-slate-600" };
                const count = posts.filter(p => p.category === category).length;
                return (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category === selectedCategory ? "all" : category);
                      document.getElementById("posts")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`p-6 rounded-xl bg-slate-900 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${
                      selectedCategory === category ? "ring-4 ring-slate-400" : ""
                    }`}
                  >
                    <div className="text-4xl mb-2">{info.icon}</div>
                    <div className="font-bold text-sm mb-1">{info.name}</div>
                    <div className="text-xs text-slate-300">{count} posts</div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )} */}

      {/* Posts Section */}
      <section id="posts" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Latest Posts
            </h2>
            <p className="text-lg text-slate-600">
              Discover our latest real estate content and property listings
            </p>
          </div>

          {/* Filters */}
                <div className="mb-8 bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              {/* <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search posts by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 text-slate-900 focus:border-transparent bg-white"
                />
              </div> */}
              {/* Category Filter */}
              {/* <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent appearance-none bg-white text-slate-900"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {categoryInfo[cat]?.name || cat}
                    </option>
                  ))}
                </select>
              </div> */}

              {/* Post Type Filter */}
              <div className="relative">
                <select
                  value={selectedPostType}
                  onChange={(e) => setSelectedPostType(e.target.value)}
                  className="pl-4 pr-8 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent appearance-none bg-white text-slate-900"
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

            {/* Active Filters Display */}
            {(selectedCategory !== "all" || selectedPostType !== "all" || searchQuery) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedCategory !== "all" && (
                  <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-sm flex items-center gap-2">
                    Category: {categoryInfo[selectedCategory]?.name || selectedCategory}
                    <button onClick={() => setSelectedCategory("all")} className="hover:text-slate-900">×</button>
                  </span>
                )}
                {selectedPostType !== "all" && (
                  <span className="px-3 py-1 bg-slate-200 text-slate-800 rounded-full text-sm flex items-center gap-2">
                    Type: {selectedPostType}
                    <button onClick={() => setSelectedPostType("all")} className="hover:text-slate-900">×</button>
                  </span>
                )}
                {searchQuery && (
                  <span className="px-3 py-1 bg-slate-300 text-slate-900 rounded-full text-sm flex items-center gap-2">
                    Search: "{searchQuery}"
                    <button onClick={() => setSearchQuery("")} className="hover:text-slate-900">×</button>
                  </span>
                )}
              </div>
            )}
          </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
              <div className="text-slate-500 text-lg">Loading posts...</div>
          </div>
        )}

        {error && !loading && (
            <div className="max-w-7xl mx-auto bg-slate-100 border border-slate-300 text-slate-900 px-6 py-4 rounded-lg mb-6">
            <p className="font-semibold mb-2">Error loading posts</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

          {!loading && !error && filteredPosts.length === 0 && (
            <div className="max-w-7xl mx-auto text-center py-16 bg-white rounded-xl shadow border border-slate-200">
              <FileText className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <p className="text-xl text-slate-600 mb-2">
                {posts.length === 0 ? "No approved posts available yet." : "No posts match your filters."}
              </p>
              {(selectedCategory !== "all" || selectedPostType !== "all" || searchQuery) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedPostType("all");
                  }}
                  className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Clear Filters
                </button>
              )}
          </div>
        )}

          {!loading && !error && filteredPosts.length > 0 && (
            <>
              <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-sm text-slate-600">
                  Showing <span className="font-semibold text-slate-900">{displayedPosts.length}</span> of{" "}
                  <span className="font-semibold text-slate-900">{filteredPosts.length}</span> posts
                  {filteredPosts.length !== posts.length && (
                    <span className="text-slate-500"> (filtered from {posts.length} total)</span>
                  )}
                </div>
                {hasMorePosts && (
                  <button
                    onClick={() => setPostsToShow(filteredPosts.length)}
                    className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-semibold flex items-center gap-2 shadow-md hover:shadow-lg"
                  >
                    See All Posts <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                {!hasMorePosts && postsToShow > 12 && (
                  <button
                    onClick={() => setPostsToShow(12)}
                    className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-semibold flex items-center gap-2"
                  >
                    Show Less
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {displayedPosts.map((post) => (
                  <HomePostCard key={post.id} post={post} />
                ))}
              </div>

              {hasMorePosts && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => setPostsToShow(prev => Math.min(prev + 12, filteredPosts.length))}
                    className="px-8 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-lg hover:from-slate-700 hover:to-slate-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 mx-auto"
                  >
                    Load More Posts <ArrowRight className="w-5 h-5" />
                  </button>
                  <p className="text-sm text-slate-500 mt-2">
                    {filteredPosts.length - postsToShow} more posts available
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Award className="w-16 h-16 mx-auto mb-6 text-white" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Manage Your Content?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join our team of administrators and moderators to create and manage professional real estate content
          </p>
          <Link
            to="/login"
            className="inline-block px-8 py-4 bg-white text-slate-900 font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Access Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;