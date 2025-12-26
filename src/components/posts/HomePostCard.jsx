import { useState, useRef } from "react";
import oweruLogo from "../../assets/oweru_logo.png";

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

  // Get background color based on category
  const getCategoryBackground = (category) => {
    switch (category) {
      case "rentals":
      case "lands_and_plots":
        return "bg-amber-400"; // Gold background
      case "property_sales":
      case "property_services":
        return "bg-white/92"; // Gray background
      case "construction_property_management":
      case "investment":
        return "bg-slate-900"; // Keep original
      default:
        return "bg-slate-900"; // Default to original
    }
  };
  // Get text color based on category for readability
  const getCategoryTextColor = (category) => {
    switch (category) {
      case "rentals":
      case "lands_and_plots":
        return "text-red-900"; // Dark text on gold background
      case "property_sales":
      case "property_services":
        return "text-gray-900"; // White text on gray background
      case "construction_property_management":
      case "investment":              
        return "text-white"; // Keep original white text
      default:
        return "text-white"; // Default to white text
    }
  };

  return (
    <div className="shadow-lg overflow-hidden border border-gray-200 bg-white flex flex-col relative h-[700px]">
      {/* Media Section - Full height for Reel, fixed for others */}
      <div className={`w-full ${post.post_type === "Reel" ? "h-full" : "h-64 shrink-0"}`}>
        {/* Static Post - Single Image */}
        {post.post_type === "Static" && images.length > 0 && (
          <div className="w-full h-full flex items-center justify-center bg-black">
            <img
              src={getMediaUrl(images[0])}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
              }}
            />
          </div>
        )}

        {/* Carousel Post - Multiple Images */}
        {post.post_type === "Carousel" && images.length > 0 && (
          <div className="w-full h-full flex flex-col">
            <div className="relative w-full h-full">
              <img
                src={getMediaUrl(images[carouselIndex])}
                alt={`${post.title} - Image ${carouselIndex + 1}`}
                className="w-full h-full object-cover bg-black"
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
              <div className="absolute bottom-0 left-0 right-0 flex gap-2 p-2 overflow-x-auto bg-black bg-opacity-50">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCarouselIndex(idx)}
                    className={`shrink-0 ${idx === carouselIndex ? "ring-2 ring-white" : ""}`}
                  >
                    <img
                      src={getMediaUrl(img)}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-10 h-10 object-cover rounded"
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
        {/* Reel Post - Video with Overlays */}
        {post.post_type === "Reel" && videos.length > 0 && (
          <div className="relative w-full h-full bg-black">
            <video
              ref={videoRef}
              controls
              preload="metadata"
              playsInline
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error("Video load error:", {
                  videoUrl: getMediaUrl(videos[0]),
                  media: videos[0]
                });
              }}
            >
              <source src={getMediaUrl(videos[0])} type={videos[0].mime_type || 'video/mp4'} />
              Your browser does not support the video tag.
            </video>
            
            {/* Logo at top left */}
            <div className="absolute top-2 left-2 z-10">
              <img
                src={oweruLogo}
                alt="Oweru logo"
                className="h-10 w-auto shadow-lg bg-white bg-opacity-80 rounded p-1"
              />
            </div>

            {/* Content overlay in the middle */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4 pointer-events-none">
              <div className="bg-transparent bg-opacity-60 rounded-lg p-4 max-w-md w-full pointer-events-auto">
                <h3 className="text-lg font-semibold text-white mb-2 text-center">
                  {post.title}
                </h3>
                <p className="text-xs text-gray-200 mb-3 text-center">
                  {post.post_type} • {post.category} • {new Date(post.created_at).toLocaleDateString()}
                </p>
                <p className="text-white text-sm text-center whitespace-pre-wrap leading-relaxed">
                  {post.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Content Section - Title and Description Below Media (hidden for Reel posts) */}
      {post.post_type !== "Reel" && (
        <div className={`flex flex-col ${getCategoryBackground(post.category)} rounded-b-lg`}>
          <div className="px-4 pt-4 pb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg bg-gray-100 font-semibold w-50 text-gray-900 p-2 rounded-lg text-left">
                  {post.title}
                </h3>
                <p className={`text-xs ${getCategoryTextColor(post.category)} mt-2 text-left`}>
                  {post.post_type} • {post.category} • {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="px-4 py-4 h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 shrink-0">
            <p className={`${getCategoryTextColor(post.category)} text-left whitespace-pre-wrap text-sm leading-relaxed`}>
              {post.description}
            </p>
          </div>

          {/* Oweru Logo - Below description, always visible */}
          <div className="px-4 pb-3  flex justify-end items-center">
            <img
              src={oweruLogo}
              alt="Oweru logo"
              className="h-12 w-auto shadow-lg"
            />
          </div>
        </div>
      )}

      {/* Contact Information Footer - Always at bottom (hidden for Reel posts) */}
      {post.post_type !== "Reel" && (
      <div className="bg-white px-2 py-1 mt-2 rounded-b-lg">
        <div className="text-left text-gray-800">
          <div className="text-sm whitespace-nowrap">
            <span className="inline-block">
              <a href="mailto:info@oweru.com" className="text-gray-950 hover:underline">
                info@oweru.com
              </a>
            </span> &nbsp;
            <span className="inline-block">
              <a href="tel:+255711890764" className="text-gray-950 hover:underline">
                +255 711 890 764
              </a>
            </span> &nbsp;
            <span className="inline-block">
              <a
                href="https://www.oweru.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-950 hover:underline"
              >
                www.oweru.com
              </a>
            </span>
          </div>
        </div>
      </div>
      )}

      {/* Empty div with category-based background (hidden for Reel posts) */}
      {post.post_type !== "Reel" && (
        <div className={`${getCategoryBackground(post.category)} h-10 rounded-b-lg`}></div>
      )}
    </div>
  );
};

export default HomePostCard;

