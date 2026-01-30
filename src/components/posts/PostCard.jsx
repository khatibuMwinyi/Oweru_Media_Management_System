import { postService } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useState, useRef } from "react";
import oweruLogo from "../../assets/oweru_logo.png";

const PostCard = ({ post, onDelete, onEdit }) => {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  const getMediaUrl = (media) => {
    if (!media) {
      console.warn("No media object");
      return "https://placehold.co/400x300?text=No+Media";
    }

    // === MOST IMPORTANT FIX: Prefer the full URL sent by backend ===
    if (media.url) {
      // If it's already a full URL, use it directly
      if (media.url.startsWith("http://") || media.url.startsWith("https://")) {
        console.log("Using backend-provided full URL:", media.url);
        return media.url;
      }

      // If it's a relative path, prepend base URL
      const base = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "http://31.97.176.48:8081";
      const path = media.url.startsWith("/") ? media.url : `/${media.url}`;
      const full = `${base}${path}`;
      console.log("Using relative url + base:", full);
      return full;
    }

    // Fallback: only use file_path if url is missing
    const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "http://31.97.176.48:8081";

    if (!media.file_path || media.file_path.trim() === "" || media.file_path === "0" || media.file_path.length < 5) {
      console.warn("Invalid file_path (using placeholder):", media);
      return "https://placehold.co/400x300?text=Invalid+Media+Path";
    }

    let cleaned = media.file_path.replace(/^\/?storage\//, "").replace(/^\//, "");
    const path = `/storage/${cleaned}`;
    const fullUrl = `${baseUrl}${path}`;

    console.log("Fallback reconstruction:", fullUrl, media);

    return fullUrl;
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    setDeleting(true);
    try {
      await postService.delete(post.id);
      window.dispatchEvent(new CustomEvent("postDeleted"));
      onDelete?.(post.id);
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete post");
    } finally {
      setDeleting(false);
    }
  };

  const images = post.media?.filter((m) => m?.file_type === "image") || [];
  const videos = post.media?.filter((m) => m?.file_type === "video") || [];

  const getCategoryBackground = (category) => {
    switch (category) {
      case "rentals":
      case "lands_and_plots":
        return "bg-[#C89128]";
      case "property_sales":
      case "property_services":
        return "bg-gray-300";
      case "construction_property_management":
      case "investment":
        return "bg-slate-900";
      default:
        return "bg-slate-900";
    }
  };

  const getCategoryTextColor = (category) => {
    switch (category) {
      case "rentals":
      case "lands_and_plots":
        return "text-gray-100";
      case "property_sales":
      case "property_services":
        return "text-gray-800";
      case "construction_property_management":
      case "investment":
        return "text-white";
      default:
        return "text-white";
    }
  };

  const bg = getCategoryBackground(post.category);
  const textColor = getCategoryTextColor(post.category);
  const isReel = post.post_type === "Reel";

  return (
    <div
      className={`shadow-lg overflow-hidden border border-gray-200 ${bg} rounded-lg flex flex-col relative h-[700px]`}
    >
      {/* Media Section */}
      <div className={`w-full ${isReel ? "h-full" : "h-64 flex-shrink-0"}`}>
        {/* Static - single image */}
        {post.post_type === "Static" && images.length > 0 && (
          <div className="w-full h-full bg-black flex items-center justify-center">
            <img
              src={getMediaUrl(images[0])}
              alt={post.title || "Post image"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://placehold.co/400x300?text=Image+Not+Found";
                console.warn("Static image load failed:", getMediaUrl(images[0]));
              }}
            />
          </div>
        )}

        {/* Carousel */}
        {post.post_type === "Carousel" && images.length > 0 && (
          <div className="relative w-full h-full">
            <img
              src={getMediaUrl(images[carouselIndex])}
              alt={`${post.title || "Carousel"} - ${carouselIndex + 1}`}
              className="w-full h-full object-cover bg-black"
              onError={(e) => {
                e.target.src = "https://placehold.co/400x300?text=Image+Failed";
              }}
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCarouselIndex((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white px-4 py-2 rounded-full hover:bg-black/80 z-10"
                >
                  ‹
                </button>
                <button
                  onClick={() => setCarouselIndex((i) => (i + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white px-4 py-2 rounded-full hover:bg-black/80 z-10"
                >
                  ›
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-1 rounded-full text-sm">
                  {carouselIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        )}

        {/* Reel - video */}
        {isReel && videos.length > 0 && (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              controls
              preload="metadata"
              playsInline
              className="w-full h-full object-cover"
              onError={() => setVideoError(true)}
              onLoadedData={() => setVideoError(false)}
            >
              <source
                src={getMediaUrl(videos[0])}
                type={videos[0]?.mime_type || "video/mp4"}
              />
              Your browser does not support the video tag.
            </video>

            {videoError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white p-6 text-center z-20">
                <div>
                  <p className="text-xl font-bold mb-3">Video failed to load</p>
                  <p className="text-sm opacity-80 break-all mb-4">
                    {getMediaUrl(videos[0])}
                  </p>
                  <a
                    href={getMediaUrl(videos[0])}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Open video directly
                  </a>
                </div>
              </div>
            )}

            {/* Logo */}
            <img
              src={oweruLogo}
              alt="Oweru"
              className="absolute top-4 left-4 h-12 w-auto bg-white/80 rounded-lg p-2 shadow-lg z-10"
            />

            {/* Edit/Delete */}
            {(onEdit || (onDelete && user?.id === post.user_id)) && (
              <div className="absolute top-4 right-4 flex gap-3 z-10">
                {onEdit && (
                  <button
                    onClick={() => onEdit(post)}
                    className="bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Edit
                  </button>
                )}
                {onDelete && user?.id === post.user_id && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-red-600/80 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                )}
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-6">
              <div className="bg-black/50 backdrop-blur-md rounded-2xl p-6 max-w-lg w-full pointer-events-auto text-center border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-3 drop-shadow-lg">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-300 mb-4">
                  {post.post_type} • {post.category} •{" "}
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
                <p className="text-white text-base leading-relaxed whitespace-pre-wrap">
                  {post.description}
                </p>
              </div>
            </div>

            {/* Rejection note */}
            {user?.role === "admin" && post.status === "rejected" && (
              <div className="absolute top-20 left-6 right-6 z-20">
                <div className="p-4 rounded-xl border border-red-400 bg-red-50/90 backdrop-blur-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-bold uppercase text-red-700">Rejected</span>
                    {post.moderator?.name && (
                      <span className="text-xs text-gray-700">by {post.moderator.name}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-800">
                    <strong>Feedback:</strong>{" "}
                    {post.moderation_note || "Please review and resubmit."}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Non-Reel content */}
      {!isReel && (
        <>
          <div className="flex flex-col flex-grow px-5 pt-5">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 bg-white/90 px-4 py-2 rounded-lg inline-block shadow-sm">
                  {post.title}
                </h3>
                <p className={`text-sm ${textColor} mt-2 opacity-90`}>
                  {post.post_type} • {post.category} •{" "}
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-4">
                {onEdit && (
                  <button
                    onClick={() => onEdit(post)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Edit
                  </button>
                )}
                {onDelete && user?.id === post.user_id && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                )}
              </div>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 mb-6">
              <p className={`${textColor} text-sm leading-relaxed whitespace-pre-wrap`}>
                {post.description}
              </p>
            </div>

            <div className="flex justify-end mb-4">
              <img src={oweruLogo} alt="Oweru" className="h-10 w-auto opacity-90" />
            </div>
          </div>

          <div className="bg-white px-6 py-4 text-center text-sm text-gray-700 border-t">
            <a href="mailto:info@oweru.com" className="hover:underline mx-2">
              info@oweru.com
            </a>
            •
            <a href="tel:+255711890764" className="hover:underline mx-2">
              +255 711 890 764
            </a>
            •
            <a
              href="https://www.oweru.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline mx-2"
            >
              www.oweru.com
            </a>
          </div>
        </>
      )}

      {!isReel && <div className={`${bg} h-3 rounded-b-lg`}></div>}
    </div>
  );
};

export default PostCard;