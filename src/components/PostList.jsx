import { useState, useEffect, useCallback } from "react";
import { postService } from "../services/api";
import PostCard from "./PostCard";

const PostList = ({ category = null, showTitle = true }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchPosts = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = category
        ? await postService.getByCategory(category)
        : await postService.getAll();

      // Handle paginated response
      if (response.data.data) {
        setPosts(response.data.data);
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total,
        });
      } else {
        // Handle non-paginated response
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
  }, [category]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Listen for post creation/update events to refresh the list
  useEffect(() => {
    const handlePostChange = () => {
      fetchPosts();
    };

    window.addEventListener('postCreated', handlePostChange);
    window.addEventListener('postDeleted', handlePostChange);

    return () => {
      window.removeEventListener('postCreated', handlePostChange);
      window.removeEventListener('postDeleted', handlePostChange);
    };
  }, [fetchPosts]);

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

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Error: {error}</p>
        <button
          onClick={() => fetchPosts()}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No posts found.</p>
        {category && <p className="text-sm mt-2">Create your first {category} post above!</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Posts` : "All Posts"}
        </h2>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onDelete={handleDelete} />
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
    </div>
  );
};

export default PostList;

