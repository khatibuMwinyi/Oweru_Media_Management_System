import { postService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useState, useRef } from "react";
import canvaTemplate from "../assets/templates/Oweru.png";

const PostCard = ({ post, onDelete, onEdit }) => {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  const getMediaUrl = (media) => {
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

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    setDeleting(true);
    try {
      await postService.delete(post.id);

      // Dispatch event to refresh post list
      window.dispatchEvent(new CustomEvent("postDeleted"));

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
    <div 
      className="rounded-lg shadow-md overflow-hidden border border-gray-200 relative"
      style={{
        backgroundImage: `url("${canvaTemplate}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '400px',
      }}
    >
      {/* Overlay to ensure content is readable - reduced opacity to show template */}
      <div className="absolute inset-0 bg-white bg-opacity-40"></div>
      
      {/* Content Container */}
      <div className="p-4 relative z-10">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {post.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {post.post_type} • {post.category} •{" "}
              {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(post)}
                className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1"
              >
                Edit
              </button>
            )}
            {onDelete && user && user.id === post.user_id && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-red-600 hover:text-red-800 text-sm px-2 py-1 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>
        </div>

        {/* Admin-only view of moderation result when a post is rejected */}
        {user?.role === "admin" && post.status === "rejected" && (
          <div className="mb-3 p-3 rounded border border-red-300 bg-red-50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-red-700">
                Status: Rejected
              </span>
              {post.moderator?.name && (
                <span className="text-[11px] text-gray-600">
                  Reviewed by {post.moderator.name}
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-800 leading-relaxed">
              <span className="font-semibold">Feedback from moderator:</span>{" "}
              {post.moderation_note || "This post was rejected. Please review and update the content before submitting again."}
            </p>
          </div>
        )}

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
                onError={(e) => {
                  setVideoError(true);
                  const video = e.target;
                  const errorDetails = {
                    error: video.error,
                    code: video.error?.code,
                    message: video.error?.message,
                    networkState: video.networkState,
                    readyState: video.readyState,
                    src: video.src,
                    currentSrc: video.currentSrc,
                    videoUrl: getMediaUrl(videos[0]),
                    media: videos[0]
                  };
                  console.error("Video load error:", errorDetails);
                  alert(`Video failed to load. Check console for details. URL: ${getMediaUrl(videos[0])}`);
                }}
                onLoadStart={() => {
                  setVideoError(false);
                  console.log("Video load started. URL:", getMediaUrl(videos[0]));
                }}
                onLoadedMetadata={() => {
                  console.log("Video metadata loaded. Duration:", videoRef.current?.duration, "URL:", getMediaUrl(videos[0]));
                }}
                onLoadedData={() => {
                  console.log("Video data loaded successfully. URL:", getMediaUrl(videos[0]));
                }}
                onCanPlay={() => {
                  console.log("Video can play. URL:", getMediaUrl(videos[0]));
                }}
              >
                <source src={getMediaUrl(videos[0])} type={videos[0].mime_type || 'video/mp4'} />
                Your browser does not support the video tag.
              </video>
            </div>
            
            {videoError && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm">
                <p className="text-red-700 font-semibold mb-1">Video failed to load</p>
                <p className="text-red-600 text-xs mb-2 break-all">
                  URL: {getMediaUrl(videos[0])}
                </p>
                <a
                  href={getMediaUrl(videos[0])}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-xs"
                >
                  Try opening video URL directly
                </a>
              </div>
            )}
            
            <div className="mt-2 flex gap-2 flex-wrap">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (videoRef.current) {
                    videoRef.current.muted = false;
                    videoRef.current.volume = 1;
                    videoRef.current.play().catch(err => {
                      console.error("Play with sound failed:", err);
                      alert("Browser blocked autoplay with sound. Please click the play button on the video.");
                    });
                  }
                }}
                className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                🔊 Play with Sound
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (videoRef.current) {
                    videoRef.current.muted = true;
                    videoRef.current.play().catch(err => console.error("Muted play failed:", err));
                  }
                }}
                className="text-xs px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                🔇 Play Muted
              </button>
              <a
                href={getMediaUrl(videos[0])}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors inline-block"
              >
                🔗 Open Video URL
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-1 break-all">
              Video URL: {getMediaUrl(videos[0])}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
