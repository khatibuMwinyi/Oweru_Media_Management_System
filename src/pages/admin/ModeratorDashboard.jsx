import { useEffect, useState } from "react";
import { postService } from "../../services/api";
import PostCard from "../../components/PostCard";

const ModeratorDashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeRejectId, setActiveRejectId] = useState(null);
  const [rejectNotes, setRejectNotes] = useState({});

  const fetchPending = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await postService.getAll({ status: "pending" });
      setPosts(response.data.data || response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load pending posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (postId) => {
    try {
      await postService.approve(postId);
      fetchPending();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve post");
    }
  };

  const handleReject = async (postId) => {
    const note = rejectNotes[postId] || "";
    if (!note.trim()) {
      alert("Please provide a brief reason for rejecting this post.");
      return;
    }

    try {
      await postService.reject(postId, note);
      setRejectNotes((prev) => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
      setActiveRejectId(null);
      fetchPending();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject post");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading pending posts...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Moderator</h1>
            <p className="text-gray-600 text-sm">
              Review pending posts and provide clear feedback when rejecting.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>Error: {error}</p>
            <button
              onClick={fetchPending}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {posts.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow">
            <p>No pending posts. You're all caught up!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <div key={post.id} className="relative">
                <div className="absolute top-2 left-2 z-10">
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">
                    Pending
                  </span>
                </div>
                <PostCard post={post} />
                <div className="mt-3 space-y-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(post.id)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        setActiveRejectId((current) =>
                          current === post.id ? null : post.id
                        )
                      }
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>

                  {activeRejectId === post.id && (
                    <div className="border border-red-200 bg-red-50 rounded p-3">
                      <label className="block text-xs font-semibold text-red-800 mb-1">
                        Reason for rejection
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
                        placeholder="Explain briefly why this post is rejected and how it can be improved."
                        className="w-full px-3 py-2 border border-red-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                      />
                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveRejectId(null);
                            setRejectNotes((prev) => {
                              const next = { ...prev };
                              delete next[post.id];
                              return next;
                            });
                          }}
                          className="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(post.id)}
                          className="px-4 py-1.5 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                        >
                          Send rejection
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModeratorDashboard;

