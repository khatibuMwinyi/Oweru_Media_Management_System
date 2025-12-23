import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import HomePostCard from "../components/HomePostCard";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApprovedPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use the public endpoint for approved posts
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
        
        // Handle paginated response (Laravel pagination returns { data: [...], current_page: 1, ... })
        const postsArray = data.data || data || [];
        console.log('Posts array:', postsArray, 'Length:', postsArray.length);
        
        if (Array.isArray(postsArray) && postsArray.length > 0) {
          setPosts(postsArray);
        } else {
          // No posts, but not an error
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="w-full px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <section className="mb-6 max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Latest Posts
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Discover our latest content.
          </p>
        </section>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-500">Loading posts...</div>
          </div>
        )}

        {error && !loading && (
          <div className="max-w-7xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-semibold mb-2">Error loading posts</p>
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-2 text-red-600">
              Please make sure:
              <ul className="list-disc list-inside mt-1">
                <li>The Laravel API server is running (php artisan serve)</li>
                <li>The database is connected and has approved posts</li>
                <li>Check the browser console for more details</li>
              </ul>
            </p>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="max-w-7xl mx-auto text-center py-12 text-gray-500 bg-white rounded-lg shadow">
            <p>No approved posts available yet.</p>
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {posts.map((post) => (
              <HomePostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
