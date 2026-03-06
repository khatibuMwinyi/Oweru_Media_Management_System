import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { API_BASE_URL } from "../config/api";

const PostContext = createContext(null);

// Cache configuration
const CACHE_KEY = "oweru_approved_posts_cache";
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

export const usePostData = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error("usePostData must be used within PostProvider");
  }
  return context;
};

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const loadCachedPosts = () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const cacheAge = Date.now() - timestamp;
          
          // If cache is still fresh (within 30 minutes)
          if (cacheAge < CACHE_DURATION) {
            setPosts(data);
            setLastFetchTime(timestamp);
            setLoading(false);
            return true;
          }
        }
      } catch (err) {
        console.error("Failed to load cached posts:", err);
      }
      return false;
    };

    const cacheLoaded = loadCachedPosts();
    
    // If cache was fresh enough, don't fetch
    if (cacheLoaded) {
      return;
    }

    // Otherwise, fetch fresh data
    fetchPosts();
  }, []);

  const fetchPosts = useCallback(async (forceRefresh = false) => {
    // Prevent duplicate concurrent requests
    if (isFetching && !forceRefresh) {
      return;
    }

    // Check if cache is still valid (unless forced refresh)
    if (!forceRefresh && lastFetchTime) {
      const cacheAge = Date.now() - lastFetchTime;
      if (cacheAge < CACHE_DURATION) {
        return; // Use cached data
      }
    }

    setIsFetching(true);
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
      const validPosts = Array.isArray(postsArray) ? postsArray : [];

      // Cache in localStorage
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data: validPosts,
          timestamp: Date.now(),
        })
      );

      setPosts(validPosts);
      setLastFetchTime(Date.now());
    } catch (err) {
      let errorMessage = "Failed to load posts. ";
      if (err.message.includes("500")) errorMessage += "Server error.";
      else if (err.message.includes("404")) errorMessage += "API not found.";
      else if (err.name === "TypeError") errorMessage += "Cannot reach server.";
      else errorMessage += err.message;

      setError(errorMessage);
      console.error("Error fetching posts:", err);
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  }, [isFetching, lastFetchTime]);

  const refreshPosts = useCallback(async () => {
    setLoading(true);
    await fetchPosts(true);
  }, [fetchPosts]);

  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    setPosts([]);
    setError(null);
    setLastFetchTime(null);
    setLoading(true);
  }, []);

  return (
    <PostContext.Provider
      value={{
        posts,
        loading,
        error,
        refreshPosts,
        clearCache,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};
