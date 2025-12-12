import { postService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const getMediaUrl = (media) => {
    // If media has url attribute, use it
    if (media.url) {
      return media.url;
    }
    // Otherwise construct from file_path
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
    return `${baseUrl}/storage/${media.file_path}`;
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    setDeleting(true);
    try {
      await postService.delete(post.id);
      
      // Dispatch event to refresh post list
      window.dispatchEvent(new CustomEvent('postDeleted'));
      
      if (onDelete) {
        onDelete(post.id);
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert("Failed to delete post");
    } finally {
      setDeleting(false);
    }
  };

  const images = post.media?.filter((m) => m.file_type === "image") || [];
  const videos = post.media?.filter((m) => m.file_type === "video") || [];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{post.title}</h3>
            <p className="text-xs text-gray-500 mt-1">
              {post.post_type} • {post.category} •{" "}
              {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
          {user && user.id === post.user_id && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-600 hover:text-red-800 text-sm px-2 py-1 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>

        <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.description}</p>

        {/* Static Post - Single Image */}
        {post.post_type === "Static" && images.length > 0 && (
          <div className="mb-4">
            <img
              src={getMediaUrl(images[0])}
              alt={post.title}
              className="w-full h-auto rounded-lg object-cover max-h-96"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
              }}
            />
          </div>
        )}

        {/* Carousel Post - Multiple Images */}
        {post.post_type === "Carousel" && images.length > 0 && (
          <div className="mb-4">
            <div className="relative">
              <img
                src={getMediaUrl(images[carouselIndex])}
                alt={`${post.title} - Image ${carouselIndex + 1}`}
                className="w-full h-auto rounded-lg object-cover max-h-96"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
                }}
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCarouselIndex((prev) => (prev - 1 + images.length) % images.length)
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full hover:bg-opacity-70"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setCarouselIndex((prev) => (prev + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full hover:bg-opacity-70"
                  >
                    ›
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    {carouselIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCarouselIndex(idx)}
                    className={`flex-shrink-0 ${
                      idx === carouselIndex ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <img
                      src={getMediaUrl(img)}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/64x64?text=Image";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reel Post - Video */}
        {post.post_type === "Reel" && videos.length > 0 && (
          <div className="mb-4">
            <video
              controls
              className="w-full h-auto rounded-lg max-h-96"
              src={getMediaUrl(videos[0])}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;

