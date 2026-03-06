import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { API_BASE_URL } from "../config/api";

const PostContext = createContext(null);

// Cache configuration
const CACHE_KEY = "oweru_approved_posts_cache";
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

// Global variable to store the refetch function
let globalRefetchFunction = null;

// Function to invalidate cache from outside the context and trigger refetch
export const invalidateApprovedPostsCache = () => {
  console.log('Invalidating approved posts cache...');
  localStorage.removeItem(CACHE_KEY);
  // Trigger refetch if available
  if (globalRefetchFunction) {
    console.log('Triggering global refetch function...');
    globalRefetchFunction();
  } else {
    console.log('No global refetch function available');
  }
};

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
    console.log('fetchPosts called, forceRefresh:', forceRefresh);
    
    // Prevent duplicate concurrent requests
    if (isFetching && !forceRefresh) {
      console.log('Already fetching, skipping...');
      return;
    }

    // Check if cache is still valid (unless forced refresh)
    if (!forceRefresh && lastFetchTime) {
      const cacheAge = Date.now() - lastFetchTime;
      console.log('Cache age:', cacheAge, 'Cache duration:', CACHE_DURATION);
      if (cacheAge < CACHE_DURATION) {
        console.log('Using cached data');
        return; // Use cached data
      }
    }

    console.log('Fetching fresh data from API...');
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
      console.log('API response data:', data);
      const postsArray = data.data || data || [];
      const validPosts = Array.isArray(postsArray) ? postsArray : [];
      console.log('Setting posts:', validPosts.length, 'posts:', validPosts);
      
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
      console.log('Posts updated in state and cached');
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
    console.log('refreshPosts called - forcing refresh');
    setLoading(true);
    await fetchPosts(true);
  }, [fetchPosts]);

  // Store the refetch function globally so it can be called from outside
  useEffect(() => {
    globalRefetchFunction = refreshPosts;
    return () => {
      globalRefetchFunction = null;
    };
  }, [refreshPosts]);

  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    setPosts([]);
    setError(null);
    setLastFetchTime(null);
    setLoading(true);
  }, []);

  const invalidateCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    setLastFetchTime(null);
    // Trigger a fresh fetch
    fetchPosts(true);
  }, [fetchPosts]);

  return (
    <PostContext.Provider
      value={{
        posts,
        loading,
        error,
        refreshPosts,
        clearCache,
        invalidateCache,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};
