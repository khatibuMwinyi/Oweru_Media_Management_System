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

  // ────────────────────────────────────────────────
  //  IMPROVED getMediaUrl – most common cases covered
  // ────────────────────────────────────────────────
  const getMediaUrl = (media) => {
    if (!media) return "";

    // Case 1: Already a full http(s) URL
    if (media.url?.startsWith("http")) {
      return media.url;
    }

    const baseUrl =
      import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
      "http://31.97.176.48:8081";

    let path = "";

    // Case 2: Has .url that looks like a Laravel storage path
    if (media.url) {
      path = media.url.startsWith("/") ? media.url : `/${media.url}`;
    }
    // Case 3: Has file_path (very common in Laravel uploads)
    else if (media.file_path) {
      // Remove leading /storage/ or / if present – we add it ourselves
      let cleaned = media.file_path.replace(/^\/?storage\//, "");
      cleaned = cleaned.replace(/^\//, "");
      path = `/storage/${cleaned}`;
    }
    // Case 4: filename only → assume it's in storage
    else if (media.filename || media.name) {
      path = `/storage/${media.filename || media.name}`;
    }
    else {
      console.warn("Media object has no usable path:", media);
      return "https://via.placeholder.com/400x300?text=No+Media+Path";
    }

    const fullUrl = `${baseUrl}${path}`;

    // Quick sanity check – helps during dev
    if (!path.includes("storage") && !media.url?.startsWith("http")) {
      console.warn(
        "Possibly incorrect media path (missing /storage/?) →",
        fullUrl,
        media
      );
    }

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

  const images = post.media?.filter((m) => m.file_type === "image") || [];
  const videos = post.media?.filter((m) => m.file_type === "video") || [];

  const getCategoryBackground = (cat) => {
    if (["rentals", "lands_and_plots"].includes(cat)) return "bg-[#C89128]";
    if (["property_sales", "property_services"].includes(cat)) return "bg-gray-300";
    return "bg-slate-900";
  };

  const getCategoryTextColor = (cat) => {
    if (["rentals", "lands_and_plots"].includes(cat)) return "text-gray-100";
    if (["property_sales", "property_services"].includes(cat)) return "text-gray-800";
    return "text-white";
  };

  const bg = getCategoryBackground(post.category);
  const textColor = getCategoryTextColor(post.category);
  const isReel = post.post_type === "Reel";

  return (
    <div
      className={`shadow-lg overflow-hidden border border-gray-200 ${bg} rounded-lg flex flex-col relative h-[700px]`}
    >
      {/* ─── Media Area ──────────────────────────────────────────────── */}
      <div className={`w-full ${isReel ? "h-full" : "h-64 flex-shrink-0"}`}>
        {/* Static – single image */}
        {post.post_type === "Static" && images.length > 0 && (
          <div className="w-full h-full bg-black flex items-center justify-center">
            <img
              src={getMediaUrl(images[0])}
              alt={post.title}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
                console.warn("Static image failed:", getMediaUrl(images[0]));
              }}
            />
          </div>
        )}

        {/* Carousel */}
        {post.post_type === "Carousel" && images.length > 0 && (
          <div className="relative w-full h-full">
            <img
              src={getMediaUrl(images[carouselIndex])}
              alt={`${post.title} – ${carouselIndex + 1}`}
              className="w-full h-full object-cover bg-black"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/400x300?text=Load+Failed";
              }}
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCarouselIndex((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 text-white px-3 py-2 rounded-full hover:bg-black/80"
                >
                  ‹
                </button>
                <button
                  onClick={() => setCarouselIndex((i) => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 text-white px-3 py-2 rounded-full hover:bg-black/80"
                >
                  ›
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded text-sm">
                  {carouselIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        )}

        {/* Reel – video + overlays */}
        {isReel && videos.length > 0 && (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              controls
              preload="metadata"
              playsInline
              className="w-full h-full object-cover"
              onError={() => setVideoError(true)}
            >
              <source src={getMediaUrl(videos[0])} type={videos[0].mime_type || "video/mp4"} />
              Your browser does not support video.
            </video>

            {videoError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white p-6 text-center">
                <div>
                  <p className="text-lg font-bold mb-2">Video failed to load</p>
                  <p className="text-sm opacity-80 break-all mb-4">
                    {getMediaUrl(videos[0])}
                  </p>
                  <a
                    href={getMediaUrl(videos[0])}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline"
                  >
                    Try opening directly
                  </a>
                </div>
              </div>
            )}

            {/* Logo */}
            <img
              src={oweruLogo}
              alt="Oweru"
              className="absolute top-4 left-4 h-10 w-auto bg-white/80 rounded p-1 shadow z-10"
            />

            {/* Admin / owner controls */}
            {(onEdit || (onDelete && user?.id === post.user_id)) && (
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                {onEdit && (
                  <button
                    onClick={() => onEdit(post)}
                    className="bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded text-sm"
                  >
                    Edit
                  </button>
                )}
                {onDelete && user?.id === post.user_id && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50"
                  >
                    {deleting ? "Deleting…" : "Delete"}
                  </button>
                )}
              </div>
            )}

            {/* Content overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-5">
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-5 max-w-lg w-full pointer-events-auto text-center">
                <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">
                  {post.title}
                </h3>
                <p className="text-xs text-gray-200 mb-3">
                  {post.post_type} • {post.category} • {new Date(post.created_at).toLocaleDateString()}
                </p>
                <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                  {post.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Non-Reel content ────────────────────────────────────────── */}
      {!isReel && (
        <>
          <div className="flex flex-col flex-grow px-4 pt-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 bg-white/90 p-2 rounded-lg inline-block">
                  {post.title}
                </h3>
                <p className={`text-xs ${textColor} mt-2`}>
                  {post.post_type} • {post.category} • {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-3">
                {onEdit && (
                  <button onClick={() => onEdit(post)} className="text-blue-600 hover:text-blue-800 text-sm">
                    Edit
                  </button>
                )}
                {onDelete && user?.id === post.user_id && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                  >
                    {deleting ? "Deleting…" : "Delete"}
                  </button>
                )}
              </div>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 mb-4">
              <p className={`${textColor} text-sm leading-relaxed whitespace-pre-wrap`}>
                {post.description}
              </p>
            </div>

            <div className="flex justify-end mb-3">
              <img src={oweruLogo} alt="Oweru" className="h-10 w-auto" />
            </div>
          </div>

          {/* Footer contact */}
          <div className="bg-white px-6 py-3 text-center text-sm text-gray-800 border-t">
            <a href="mailto:info@oweru.com" className="hover:underline mx-1">
              info@oweru.com
            </a>
            •
            <a href="tel:+255711890764" className="hover:underline mx-1">
              +255 711 890 764
            </a>
            •
            <a
              href="https://www.oweru.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline mx-1"
            >
              www.oweru.com
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default PostCard;