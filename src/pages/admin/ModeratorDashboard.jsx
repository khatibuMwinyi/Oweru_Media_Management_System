import { useEffect, useState } from "react";
import { postService } from "../../services/api";
import PostCard from "../../components/posts/PostCard";

const ModeratorDashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({}); // postId → true/false
  const [error, setError] = useState(null);
  const [activeRejectId, setActiveRejectId] = useState(null);
  const [rejectNotes, setRejectNotes] = useState({});
  
  // Toast / notification state
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchPending = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await postService.getAll({ status: "pending" });
      const postsData = response.data?.data || response.data || [];
      setPosts(postsData);
    } catch (err) {
      console.error("Fetch pending failed:", err);
      setError(err.response?.data?.message || "Unable to load pending posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (postId) => {
    if (actionLoading[postId]) return;
    setActionLoading((prev) => ({ ...prev, [postId]: true }));

    try {
      await postService.approve(postId);
      showNotification("Post approved and published successfully.", "success");
      fetchPending();
    } catch (err) {
      console.error("Approve failed:", err);
      const msg = err.response?.data?.message || "Could not approve this post. Please try again.";
      showNotification(msg, "error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleReject = async (postId) => {
    if (actionLoading[postId]) return;

    const note = rejectNotes[postId]?.trim() || "";
    if (!note) {
      showNotification("Please provide a reason for rejection.", "warning");
      return;
    }

    setActionLoading((prev) => ({ ...prev, [postId]: true }));

    try {
      await postService.reject(postId, note);
      showNotification("Post has been rejected successfully.", "success");
      
      // Clean up
      setRejectNotes((prev) => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
      setActiveRejectId(null);
      fetchPending();
    } catch (err) {
      console.error("Reject failed:", err);
      const msg = err.response?.data?.message || "Could not reject this post. Please try again.";
      showNotification(msg, "error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const pendingPosts = posts.filter((post) => post.status === "pending");

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500 animate-pulse">Loading pending posts...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto relative">
        {/* Notification / Toast */}
        {notification && (
          <div
            className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white flex items-center gap-3 transition-all duration-300 transform translate-y-0 ${
              notification.type === "success"
                ? "bg-green-600"
                : notification.type === "error"
                ? "bg-red-600"
                : "bg-amber-600"
            }`}
          >
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Moderator Dashboard</h1>
            <p className="text-gray-600 mt-1">Review and moderate pending content</p>
          </div>
          <button
            onClick={fetchPending}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            Refresh List
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-5 py-4 rounded-lg mb-6 flex justify-between items-center">
            <div>
              <p className="font-medium">{error}</p>
            </div>
            <button
              onClick={fetchPending}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded transition text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {pendingPosts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No pending posts</h3>
            <p className="text-gray-500">All content has been reviewed or the queue is currently empty.</p>
            <button
              onClick={fetchPending}
              className="mt-6 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingPosts.map((post) => {
              const isLoading = actionLoading[post.id] || false;

              return (
                <div
                  key={post.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 flex flex-col h-full hover:shadow transition-shadow"
                >
                  <div className="flex-1">
                    <PostCard post={post} onDelete={null} onEdit={null} />
                  </div>

                  <div className="border-t border-gray-200 bg-gray-50 px-5 py-5">
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                          post.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : post.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {post.status}
                      </span>
                    </div>

                    <div className="flex gap-3 mb-4">
                      <button
                        onClick={() => handleApprove(post.id)}
                        disabled={isLoading}
                        className={`flex-1 py-2.5 px-5 rounded-lg font-medium text-white transition ${
                          isLoading
                            ? "bg-green-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700 active:bg-green-800"
                        }`}
                      >
                        {isLoading ? "Approving..." : "Approve"}
                      </button>

                      <button
                        onClick={() =>
                          setActiveRejectId((prev) =>
                            prev === post.id ? null : post.id
                          )
                        }
                        disabled={isLoading}
                        className={`flex-1 py-2.5 px-5 rounded-lg font-medium text-white transition ${
                          isLoading
                            ? "bg-red-400 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700 active:bg-red-800"
                        }`}
                      >
                        {isLoading ? "Processing..." : "Reject"}
                      </button>
                    </div>

                    {activeRejectId === post.id && (
                      <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <label className="block text-sm font-medium text-red-800 mb-2">
                          Reason for rejection (required)
                        </label>
                        <textarea
                          rows={3}
                          value={rejectNotes[post.id] || ""}
                          onChange={(e) =>
                            setRejectNotes((prev) => ({
                              ...prev,
                              [post.id]: e.target.value,
                            }))
                          }
                          placeholder="Please explain why this content doesn't meet community guidelines..."
                          className="w-full px-3 py-2.5 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 text-sm resize-none"
                        />
                        <div className="mt-4 flex justify-end gap-3">
                          <button
                            onClick={() => {
                              setActiveRejectId(null);
                              setRejectNotes((prev) => {
                                const next = { ...prev };
                                delete next[post.id];
                                return next;
                              });
                            }}
                            className="px-5 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReject(post.id)}
                            disabled={isLoading || !rejectNotes[post.id]?.trim()}
                            className={`px-5 py-2 text-sm rounded-lg text-white font-medium transition ${
                              isLoading || !rejectNotes[post.id]?.trim()
                                ? "bg-red-400 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700 active:bg-red-800"
                            }`}
                          >
                            {isLoading ? "Rejecting..." : "Confirm Rejection"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModeratorDashboard;