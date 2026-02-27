// src/utils/mediaUtils.js

/**
 * Inline SVG placeholders that work without internet connection
 */
export const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,' + btoa(`
  <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="300" fill="#374151"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="18" fill="#9CA3AF" text-anchor="middle" dominant-baseline="middle">
      Image Not Available
    </text>
  </svg>
`);

export const PLACEHOLDER_THUMBNAIL = 'data:image/svg+xml;base64,' + btoa(`
  <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" fill="#374151"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="10" fill="#9CA3AF" text-anchor="middle" dominant-baseline="middle">
      N/A
    </text>
  </svg>
`);

/**
 * Check if a media object has valid URL or file_path
 * @param {Object} media - The media object to validate
 * @returns {boolean} - True if media is valid, false otherwise
 */
export const isValidMedia = (media) => {
  if (!media) return false;
  
  // Check if URL is valid
  if (media.url) {
    if (media.url.startsWith("http://") || media.url.startsWith("https://")) {
      return true;
    }
    if (media.url.length > 1) {
      return true;
    }
  }
  
  // Check if file_path is valid (not "0", not empty)
  if (media.file_path && media.file_path !== "0" && media.file_path.length > 1) {
    return true;
  }
  
  console.warn("Invalid media filtered out:", media);
  return false;
};

/**
 * Get the full URL for a media object using proxy to avoid CORS issues
 * @param {Object} media - The media object with url or file_path
 * @returns {string} - The full URL or a placeholder if invalid
 */
export const getMediaUrl = (media) => {
  // Return placeholder if media is invalid
  if (!media) {
    console.error("Invalid media object:", media);
    return PLACEHOLDER_IMAGE;
  }

  // Use the correct hosted server URL
  const baseUrl =
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "http://31.97.176.48:8081";

  // Handle direct URL
  if (media.url) {
    if (media.url.startsWith("http://") || media.url.startsWith("https://")) {
      return media.url;
    }
    // Route through proxy to avoid CORS issues
    const cleanUrl = media.url.startsWith("/") ? media.url.substring(1) : media.url;
    return `${baseUrl}/api/proxy/media/${cleanUrl}`;
  }

  // Handle file_path
  if (media.file_path) {
    const cleanPath = media.file_path.startsWith("/") ? media.file_path.substring(1) : media.file_path;
    return `${baseUrl}/api/proxy/media/${cleanPath}`;
  }

  // Log the error for debugging
  console.error("Invalid media data:", media);
  
  // Return placeholder for invalid media
  return PLACEHOLDER_IMAGE;
};

/**
 * Filter an array of media objects to only include valid ones
 * @param {Array} mediaArray - Array of media objects
 * @param {string} fileType - Optional file type to filter by (e.g., 'image', 'video')
 * @returns {Array} - Filtered array of valid media objects
 */
export const filterValidMedia = (mediaArray, fileType = null) => {
  if (!Array.isArray(mediaArray)) return [];
  
  return mediaArray.filter(media => {
    // Check file type if specified
    if (fileType && media.file_type !== fileType) {
      return false;
    }
    // Check if media is valid
    return isValidMedia(media);
  });
};