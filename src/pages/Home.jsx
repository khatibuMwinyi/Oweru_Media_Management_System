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
  setDownloadingAll(true);
  try {
    const allPostsHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Oweru Media - All Posts Export</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --color-gold:    #C89128;
      --color-gold-light: #f3f4f6;
      --color-gray:    #d1d5db;
      --color-dark:    #0f172a;
      --color-dark-text: #f3f4f6;
    }

    * { box-sizing: border-box; }
    body {
      font-family: 'Inter', system-ui, sans-serif;
      margin: 0;
      padding: 30px 20px;
      background: #f8f9fa;
      color: #1f2937;
      line-height: 1.5;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 50px; }
    .title { font-size: 3.2rem; font-weight: 800; color: var(--color-gold); margin: 0.3em 0; }
    .subtitle { color: #6b7280; font-size: 1.3rem; margin-bottom: 2rem; }
    .stats { display: flex; flex-wrap: wrap; justify-content: center; gap: 1.5rem; margin-bottom: 3rem; }
    .stat-item {
      background: white;
      padding: 1.2rem 1.8rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      min-width: 110px;
      text-align: center;
    }
    .stat-number { font-size: 2.1rem; font-weight: 700; color: var(--color-gold); }
    .stat-label { font-size: 0.9rem; color: #6b7280; margin-top: 0.3rem; }

    .post-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 2rem;
    }
    .post-card {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      background: white;
      display: flex;
      flex-direction: column;
      height: 720px;
      position: relative;
    }

    /* ─── Media Area ──────────────────────────────────────── */
    .media-wrapper {
      position: relative;
      width: 100%;
      height: 340px;
      flex-shrink: 0;
      overflow: hidden;
      background: #111;
    }
    .media-wrapper img,
    .media-wrapper video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .media-fallback {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.1rem;
      background: rgba(15, 23, 42, 0.85);
    }

    /* Reel overlay style — most important visual match */
    .reel-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.75) 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      color: white;
      text-align: center;
      text-shadow: 0 2px 6px rgba(0,0,0,0.9);
    }
    .reel-title {
      font-size: 1.6rem;
      font-weight: 700;
      margin-bottom: 0.8rem;
      line-height: 1.2;
    }
    .reel-meta {
      font-size: 0.95rem;
      opacity: 0.9;
      margin-bottom: 1.2rem;
    }
    .reel-desc {
      font-size: 1.05rem;
      max-width: 90%;
      line-height: 1.45;
      max-height: 45vh;
      overflow-y: auto;
    }

    /* Content area (non-reel) */
    .content-area {
      padding: 1.5rem;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }
    .post-title {
      font-size: 1.35rem;
      font-weight: 700;
      margin-bottom: 0.6rem;
      background: rgba(255,255,255,0.9);
      padding: 0.5rem 0.9rem;
      border-radius: 8px;
      display: inline-block;
    }
    .post-meta {
      font-size: 0.85rem;
      opacity: 0.8;
      margin-bottom: 1rem;
    }
    .post-desc {
      flex-grow: 1;
      font-size: 0.97rem;
      line-height: 1.55;
      overflow-y: auto;
      padding-right: 0.5rem;
    }
    .post-desc::-webkit-scrollbar { width: 6px; }
    .post-desc::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }

    /* Category backgrounds */
    .cat-rentals,       .cat-lands_and_plots              { background: var(--color-gold); color: var(--color-gold-light); }
    .cat-property_sales, .cat-property_services           { background: var(--color-gray);  color: #1f2937; }
    .cat-investment,     .cat-construction_property_management { background: var(--color-dark); color: white; }
    .cat-default                                  { background: var(--color-dark); color: white; }

    .footer {
      text-align: center;
      margin-top: 4rem;
      padding: 2.5rem;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    }
    .contact { display: flex; justify-content: center; gap: 2.2rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .contact a { color: #374151; text-decoration: none; font-weight: 500; }
    .contact a:hover { color: var(--color-gold); }
    .generated { color: #6b7280; font-size: 0.95rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">Oweru Media</h1>
      <p class="subtitle">Real Estate Content Overview — ${new Date().toLocaleDateString()}</p>
      <div class="stats">
        <div class="stat-item"><div class="stat-number">${stats.totalPosts}</div><div class="stat-label">Total</div></div>
        <div class="stat-item"><div class="stat-number">${stats.staticPosts}</div><div class="stat-label">Static</div></div>
        <div class="stat-item"><div class="stat-number">${stats.carouselPosts}</div><div class="stat-label">Carousel</div></div>
        <div class="stat-item"><div class="stat-number">${stats.reelPosts}</div><div class="stat-label">Reels</div></div>
      </div>
    </div>

    <div class="post-grid">
      ${filteredPosts.map(post => {
        const cat = post.category || 'default';
        const catClass = `cat-${cat}`;

        let mediaHTML = '';
        const firstImage = post.media?.find(m => m.file_type === 'image');
        const firstVideo = post.media?.find(m => m.file_type === 'video');

        if (post.post_type === 'Reel' && firstVideo) {
          mediaHTML = `
            <div class="media-wrapper">
              <video autoplay muted loop playsinline>
                <source src="${firstVideo.url || ''}" type="video/mp4">
              </video>
              <div class="reel-overlay">
                <div class="reel-title">${post.title || 'Untitled Reel'}</div>
                <div class="reel-meta">
                  ${post.post_type} • ${post.category || '—'} • ${new Date(post.created_at).toLocaleDateString()}
                </div>
                <div class="reel-desc">${post.description?.replace(/\n/g, '<br>') || 'No description'}</div>
              </div>
            </div>`;
        } else if (firstImage) {
          mediaHTML = `<div class="media-wrapper"><img src="${firstImage.url || ''}" alt="${post.title || ''}"></div>`;
        } else {
          mediaHTML = `
            <div class="media-wrapper ${catClass}">
              <div class="media-fallback">No media available</div>
            </div>`;
        }

        const contentHTML = post.post_type !== 'Reel' ? `
          <div class="content-area ${catClass}">
            <div class="post-title">${post.title || 'Untitled Post'}</div>
            <div class="post-meta">
              ${post.post_type || '?'} • ${post.category || 'Uncategorized'} • ${new Date(post.created_at).toLocaleDateString()}
            </div>
            <div class="post-desc">
              ${post.description?.replace(/\n/g, '<br>') || '<em>No description provided.</em>'}
            </div>
          </div>
        ` : '';

        return `
          <div class="post-card">
            ${mediaHTML}
            ${contentHTML}
          </div>`;
      }).join('\n      ')}
    </div>

    <div class="footer">
      <div class="contact">
        <a href="mailto:info@oweru.com">info@oweru.com</a>
        <a href="tel:+255711890764">+255 711 890 764</a>
        <a href="https://www.oweru.com" target="_blank">www.oweru.com</a>
      </div>
      <div class="generated">
        Generated on ${new Date().toLocaleString()}
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([allPostsHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `oweru-posts-${Date.now()}.html`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert('Failed to generate file. Please try again.');
  } finally {
    setDownloadingAll(false);
  }
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