import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import Navbar from "../components/Navbar";
import { ArrowLeft, Home } from "lucide-react";

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use the public approved post endpoint instead of the protected one
        const response = await fetch(`${API_BASE_URL}/posts/approved/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Post not found");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setPost(data);

        // Update page title and meta tags for better sharing
        if (data.title) {
          document.title = `${data.title} | Oweru Media`;
        }
      } catch (err) {
        let errorMessage = "Failed to load post. ";
        if (err.status === 404) {
          errorMessage = "Post not found";
        } else if (err.status === 500) {
          errorMessage += "Server error. Please check Laravel logs.";
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

    if (id) {
      fetchPost();
    }
  }, [id]);

  const handleShare = async () => {
    if (!post) return;

    const shareData = {
      title: post.title,
      text: `${post.title}\n\n${post.description}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== "AbortError") {
          // Fallback: copy link
          try {
            await navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
          } catch (clipErr) {
            console.error("Share and copy failed:", clipErr);
          }
        }
      }
    } else {
      // Fallback: copy link
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard! Share it anywhere.");
      } catch (err) {
        console.error("Copy failed:", err);
      }
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
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header with Back and Share Buttons */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 hover:text-[#C89128] transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Posts</span>
            </button>

            {post && (
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-[#C89128] to-[#B08020] text-white rounded-lg font-semibold hover:from-[#B08020] hover:to-[#9A7018] transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share Post</span>
                <span className="sm:hidden">Share</span>
              </button>
            )}
          </div>

          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#C89128]" />
              <span className="ml-3 text-gray-700 font-medium">
                Loading post...
              </span>
            </div>
          )}

          {error && !loading && (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Post Not Found
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-[#C89128] to-[#B08020] text-white rounded-lg font-semibold hover:from-[#B08020] hover:to-[#9A7018] transition-all duration-300 shadow-md"
              >
                <ArrowLeft className="w-5 h-5" />
                Go to Home
              </Link>
            </div>
          )}

          {post && !loading && (
            <>
              {/* Post Card */}
              <div className="flex justify-center mb-8">
                <div className="w-full max-w-md">
                  <HomePostCard post={post} />
                </div>
              </div>

              {/* Additional Post Info Section (Optional) */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  About This Post
                </h2>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Category:</span>
                    <span className="font-semibold text-[#C89128]">
                      {post.category?.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Type:</span>
                    <span className="font-semibold text-gray-900">
                      {post.post_type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="font-medium text-gray-700">Posted:</span>
                    <span className="text-gray-900">
                      {new Date(post.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Share Section (Mobile Friendly) */}
              <div className="mt-6 bg-linear-to-r from-[#C89128] to-[#B08020] rounded-xl shadow-lg p-6 text-center">
                <h3 className="text-xl font-bold text-white mb-3">
                  Love this post?
                </h3>
                <p className="text-white/90 mb-4 font-medium">
                  Share it with your friends and family!
                </p>
                <button
                  onClick={handleShare}
                  className="px-6 py-3 bg-white text-[#C89128] rounded-lg font-bold hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-lg inline-flex items-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Share This Post
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PostDetail;
