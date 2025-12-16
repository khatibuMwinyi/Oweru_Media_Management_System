import { useState, useEffect } from "react";
import { postService } from "../../services/api";
import PostCard from "../../components/PostCard";
import EditPostModal from "../../components/EditPostModal";

const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [pagination, setPagination] = useState(null);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "rentals", label: "Rentals" },
    { value: "property_sales", label: "Property Sales" },
    { value: "lands_and_plots", label: "Lands and Plots" },
    { value: "property_services", label: "Property Services" },
    { value: "investment", label: "Investment" },
    { value: "construction_property_management", label: "Construction & Property Management" },
  ];

  const fetchPosts = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = { status: filterStatus, page };
      const response = filterCategory === "all"
        ? await postService.getAll(params)
        : await postService.getByCategory(filterCategory, params);

      if (response.data.data) {
        setPosts(response.data.data);
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total,
        });
      } else {
        setPosts(Array.isArray(response.data) ? response.data : []);
        setPagination(null);
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setError(err.response?.data?.message || "Failed to load posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filterCategory, filterStatus]);

  useEffect(() => {
    const handlePostChange = () => {
      fetchPosts();
    };
    window.addEventListener("postCreated", handlePostChange);
    window.addEventListener("postDeleted", handlePostChange);
    window.addEventListener("postUpdated", handlePostChange);

    return () => {
      window.removeEventListener("postCreated", handlePostChange);
      window.removeEventListener("postDeleted", handlePostChange);
      window.removeEventListener("postUpdated", handlePostChange);
    };
  }, [filterCategory]);

  const handleEdit = (post) => {
    setSelectedPost(post);
    setShowEditModal(true);
  };

  const handleDelete = (postId) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  const handlePageChange = (page) => {
    fetchPosts(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Post Management</h1>
        </div>

        {/* Filter */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C89128]"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C89128]"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>Error: {error}</p>
            <button
              onClick={() => fetchPosts()}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
            <p>No posts found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {posts.map((post) => (
                <div key={post.id} className="relative">
                  <div className="absolute top-2 left-2 z-10">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        post.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : post.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {post.status || "pending"}
                    </span>
                  </div>
                  <PostCard post={post} onDelete={handleDelete} onEdit={handleEdit} />
                </div>
              ))}
            </div>

            {pagination && pagination.last_page > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {pagination.current_page} of {pagination.last_page}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {showEditModal && selectedPost && (
          <EditPostModal
            post={selectedPost}
            onClose={() => {
              setShowEditModal(false);
              setSelectedPost(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PostManagement;

