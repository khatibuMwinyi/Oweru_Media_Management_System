import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config/api";
import { postService } from "../../services/api";
import PostCard from "../../components/posts/PostCard";
import EditPostModal from "../../components/posts/EditPostModal";
import ConfirmationModal from "../../components/posts/ConfirmationModal";            
import Toast from "../../components/posts/Toast";
import { Edit, Trash2 } from "lucide-react";
const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");    
  const [pagination, setPagination] = useState(null);
  
  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    postId: null,
  });
  
  // Toast notification state
  const [toast, setToast] = useState(null);
  
  // Delete/Edit loading state
  const [actionLoading, setActionLoading] = useState({});
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
      // Use authenticated endpoint to fetch all posts with status filtering
      let response;
      const params = { page };
      
      // Add status filter if not "all"
      if (filterStatus !== "all") {
        params.status = filterStatus;
      }
      
      // Add category filter if not "all"
      if (filterCategory !== "all") {
        params.category = filterCategory;
      }

      // Use the authenticated postService which includes authorization header
      response = await postService.getAll(params);
      
      console.log("Fetched posts response:", response.data);
      
      if (response.data.data) {
        setPosts(response.data.data);
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total,
        });
      } else {
        const postsArray = Array.isArray(response.data) ? response.data : [];
        setPosts(postsArray);
        setPagination(null);
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      console.error("Error response:", err.response?.data);
      setError(err.message || "Failed to load posts");
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
  }, []);
  const handleEdit = (post) => {
    setSelectedPost(post);
    setShowEditModal(true);
  };

  const handleDeleteClick = (postId) => {
    setConfirmModal({ isOpen: true, postId });
  };

  const handleConfirmDelete = async () => {
    const { postId } = confirmModal;
    setActionLoading((prev) => ({ ...prev, [postId]: true }));

    try {
      console.log(`Attempting to delete post ${postId}`);
      const deleteResponse = await postService.delete(postId);
      console.log("Delete response:", deleteResponse);
      
      setToast({
        type: "success",
        message: "Post deleted successfully.",
      });
      
      setConfirmModal({ isOpen: false, postId: null });
      window.dispatchEvent(new CustomEvent("postDeleted"));
      
      // Wait a bit for backend to process, then refetch from page 1
      setTimeout(async () => {
        console.log("Starting refetch after delete...");
        setLoading(true);
        setPosts([]); // Clear posts immediately
        try {
          await new Promise(resolve => setTimeout(resolve, 300)); // Small delay
          const params = { page: 1 };
          
          if (filterStatus !== "all") {
            params.status = filterStatus;
          }
          if (filterCategory !== "all") {
            params.category = filterCategory;
          }

          console.log("Fetching with params:", params);
          const response = await postService.getAll(params);
          console.log("Refetch response:", response.data);
          
          if (response.data.data) {
            setPosts(response.data.data);
            setPagination({
              current_page: response.data.current_page,
              last_page: response.data.last_page,
              per_page: response.data.per_page,
              total: response.data.total,
            });
          }
          setLoading(false);
        } catch (refetchErr) {
          console.error("Refetch error:", refetchErr);
          setLoading(false);
        }
      }, 500);
    } catch (err) {
      console.error("Failed to delete post:", err);
      console.error("Error status:", err.response?.status);
      console.error("Error data:", err.response?.data);
      
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to delete post. Please try again.";
      setToast({
        type: "error",
        message: errorMsg,
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleCancelDelete = () => {
    setConfirmModal({ isOpen: false, postId: null });
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
                <div key={post.id} className="flex flex-col">
                  {/* Post Card - Now displays with its footer */}
                  <PostCard post={post} onDelete={null} onEdit={null} />
                  
                  {/* Bottom Action Bar - Status, Edit, Delete */}
                  <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 mt-2 rounded-b-lg">
                    <div className="flex items-center justify-between gap-3">
                      {/* Status Badge */}
                      <span
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wide whitespace-nowrap ${
                          post.status === "approved"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : post.status === "rejected"
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                        }`}
                      >
                        {post.status || "pending"}
                      </span>
                      {/* Action Buttons */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(post)}
                          className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm"
                          title="Edit post"
                          aria-label="Edit post"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(post.id)}
                          disabled={actionLoading[post.id]}
                          className="p-2 text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-md transition-colors shadow-sm disabled:cursor-not-allowed"
                          title="Delete post"
                          aria-label="Delete post"
                        >
                          {actionLoading[post.id] ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
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
            onSuccess={() => {
              setShowEditModal(false);
              setSelectedPost(null);
              setToast({
                type: "success",
                message: "Post updated successfully.",
              });
              fetchPosts();
            }}
            onError={(errorMsg) => {
              setToast({
                type: "error",
                message: errorMsg || "Failed to update post. Please try again.",
              });
            }}
          />
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          title="Delete Post?"
          message="This action cannot be undone. The post will be permanently deleted."
          confirmText="Delete"
          cancelText="Cancel"
          isDangerous={true}
          isLoading={actionLoading[confirmModal.postId]}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />

        {/* Toast Notification */}
        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};
export default PostManagement;

