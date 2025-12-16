import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { postService } from "../services/api";
import PostCard from "../components/PostCard";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApprovedPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Only approved posts should appear on the public landing page
        const response = await postService.getAll({ status: "approved" });
        const data = response.data;
        setPosts(data.data || data || []);
      } catch (err) {
        console.error("Failed to load posts for landing page:", err);
        setError("Failed to load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <section className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Latest Approved Posts
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Discover approved content from Oweru Media Management System.
          </p>
        </section>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-500">Loading posts...</div>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
            <p>No approved posts available yet.</p>
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
