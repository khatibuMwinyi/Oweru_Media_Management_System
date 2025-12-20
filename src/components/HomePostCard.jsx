import { useState, useRef } from "react";

const HomePostCard = ({ post }) => {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const videoRef = useRef(null);

  const getMediaUrl = (media) => {
    // If media has url attribute, use it (from API)
    if (media.url) {
      // If URL is already absolute, use it
      if (media.url.startsWith('http://') || media.url.startsWith('https://')) {
        return media.url;
      }
      // If relative, prepend base URL
      const baseUrl =
        import.meta.env.VITE_API_URL?.replace("/api", "") ||
        "http://localhost:8000";
      return `${baseUrl}${media.url.startsWith('/') ? '' : '/'}${media.url}`;
    }
    // Otherwise construct from file_path
    const baseUrl =
      import.meta.env.VITE_API_URL?.replace("/api", "") ||
      "http://localhost:8000";
    const filePath = media.file_path?.startsWith('/') ? media.file_path.substring(1) : media.file_path;
    const url = `${baseUrl}/storage/${filePath}`;
    return url;
  };

  const images = post.media?.filter((m) => m.file_type === "image") || [];
  const videos = post.media?.filter((m) => m.file_type === "video") || [];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          {post.title}
        </h3>

        {/* Description */}
        <p className="text-gray-700 mb-4 whitespace-pre-wrap">
          {post.description}
        </p>

        {/* Static Post - Single Image */}
        {post.post_type === "Static" && images.length > 0 && (
          <div className="mb-4">
            <img
              src={getMediaUrl(images[0])}
              alt={post.title}
              className="w-full h-auto rounded-lg object-cover max-h-96"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/400x300?text=Image+Not+Found";
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
                  e.target.src =
                    "https://via.placeholder.com/400x300?text=Image+Not+Found";
                }}
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCarouselIndex(
                        (prev) => (prev - 1 + images.length) % images.length
                      )
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full hover:bg-opacity-70"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() =>
                      setCarouselIndex((prev) => (prev + 1) % images.length)
                    }
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
                    className={`shrink-0 ${
                      idx === carouselIndex ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <img
                      src={getMediaUrl(img)}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/64x64?text=Image";
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
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                controls
                preload="metadata"
                playsInline
                className="w-full"
                style={{ 
                  minHeight: '200px', 
                  maxHeight: '500px',
                  display: 'block',
                  backgroundColor: '#000'
                }}
              >
                <source src={getMediaUrl(videos[0])} type={videos[0].mime_type || 'video/mp4'} />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePostCard;

