import { useState, useRef, useEffect } from "react";
import { Send, MessageCircle, Copy, Check, Share2 } from "lucide-react";
import oweruLogo from "../../assets/oweru_logo.png";

const HomePostCard = ({ post }) => {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Use hardcoded URL or environment variable
  const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://31.97.176.48:8081";

  const getMediaUrl = (media) => {
    if (!media) return "";
    
    if (media.url) {
      if (media.url.startsWith('http://') || media.url.startsWith('https://')) {
        return media.url;
      }
      return `${BASE_URL}${media.url.startsWith('/') ? '' : '/'}${media.url}`;
    }

    const filePath = media.file_path?.startsWith('/') 
      ? media.file_path.substring(1) 
      : media.file_path;

    return `${BASE_URL}/storage/${filePath}`;
  };

  const images = post.media?.filter((m) => m.file_type === "image") || [];
  const videos = post.media?.filter((m) => m.file_type === "video") || [];

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
        return "text-white/90";
      case "property_sales":
      case "property_services":
        return "text-gray-900";
      case "construction_property_management":
      case "investment":
        return "text-white";
      default:
        return "text-white";
    }
  };

  const getShareUrl = () => {
    return `${window.location.origin}/post/${post.id}`;
  };

  const getShareText = () => {
    return `${post.title}\n\n${post.description}\n\nCheck out this ${post.category} property on Oweru Media!`;
  };

  const handleShare = async (platform) => {
    const url = getShareUrl();
    const text = getShareText();
    const fullMessage = `${text}\n\n${url}`;

    // Use Web Share API for native and Instagram
    if (platform === 'native' || platform === 'instagram') {
      if (navigator.share) {
        try {
          await navigator.share({
            title: post.title,
            text: text,
            url: url,
          });
          setShowShareMenu(false);
          return;
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error('Web Share failed:', err);
          }
        }
      }
      
      // Fallback for Instagram if Web Share fails
      if (platform === 'instagram') {
        handleCopyLink();
        return;
      }
    }

    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);
    const encodedFullMessage = encodeURIComponent(fullMessage);

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodedFullMessage}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank');
        break;
      case 'copy':
        handleCopyLink();
        break;
      default:
        break;
    }
    setShowShareMenu(false);
  };

  const handleCopyLink = async () => {
    const url = getShareUrl();
    const text = getShareText();
    const fullText = `${text}\n\n${url}`;

    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowShareMenu(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = fullText;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
          setShowShareMenu(false);
        }, 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => console.error("Play failed:", err));
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  // Auto-play video when it comes into view (for mobile)
  useEffect(() => {
    if (post.post_type === "Reel" && videoRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Video is in view, try to play
              videoRef.current?.play()
                .then(() => setIsPlaying(true))
                .catch(() => {
                  // Auto-play blocked, user needs to click
                  setIsPlaying(false);
                });
            } else {
              // Video is out of view, pause it
              videoRef.current?.pause();
              setIsPlaying(false);
            }
          });
        },
        { threshold: 0.5 }
      );

      observer.observe(videoRef.current);

      return () => {
        if (videoRef.current) {
          observer.unobserve(videoRef.current);
        }
      };
    }
  }, [post.post_type]);

  return (
    <div className="shadow-lg overflow-hidden border border-gray-200 bg-white flex flex-col relative h-[700px]">
      {/* Media Section */}
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
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full hover:bg-opacity-70 z-10"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() =>
                      setCarouselIndex((prev) => (prev + 1) % images.length)
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full hover:bg-opacity-70 z-10"
                  >
                    ›
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs z-10">
                    {carouselIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Reel Post - Video (Mobile Optimized) */}
        {post.post_type === "Reel" && videos.length > 0 && (
          <div className="relative w-full h-full bg-black">
            <video
              ref={videoRef}
              playsInline
              webkit-playsinline="true"
              muted
              loop
              preload="auto"
              controls={isPlaying}
              className="w-full h-full object-cover cursor-pointer"
              onClick={handleVideoClick}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={(e) => {
                console.error("Video load error:", {
                  videoUrl: getMediaUrl(videos[0]),
                  error: e.target.error,
                  errorCode: e.target.error?.code
                });
              }}
            >
              <source src={getMediaUrl(videos[0])} type={videos[0].mime_type || 'video/mp4'} />
              <source src={getMediaUrl(videos[0])} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Custom Play Button - visible when paused */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="bg-white bg-opacity-90 rounded-full p-6 shadow-2xl pointer-events-auto">
                  <svg 
                    className="w-16 h-16 text-gray-900" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVideoClick();
                    }}
                  >
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            )}

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
              <div className="rounded-lg p-4 max-w-md w-full backdrop-blur-sm" style={{
                textShadow: '2px 2px 4px rgba(146, 131, 131, 0.8), -1px -1px 2px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)'
              }}>
                <h3 
                  className="text-lg font-bold text-white mb-2 text-center"
                  style={{
                    textShadow: '3px 3px 6px rgba(0,0,0,0.9), -1px -1px 3px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.8), 1px 1px 2px rgba(0,0,0,1)',
                    WebkitTextStroke: '0.5px rgba(0,0,0,0.5)'
                  }}
                >
                  {post.title}
                </h3>
                <p 
                  className="text-xs font-medium text-white mb-3 text-center"
                  style={{
                    textShadow: '2px 2px 4px rgba(0,0,0,0.9), -1px -1px 2px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.7)',
                    WebkitTextStroke: '0.3px rgba(0,0,0,0.4)'
                  }}
                >
                  {post.post_type} • {post.category}
                </p>
                <p 
                  className="text-white text-sm text-center whitespace-pre-wrap leading-relaxed font-medium"
                  style={{
                    textShadow: '2px 2px 4px rgba(0,0,0,0.9), -1px -1px 2px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.8), 1px 1px 3px rgba(0,0,0,1)',
                    WebkitTextStroke: '0.4px rgba(0,0,0,0.5)'
                  }}
                >
                  {post.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Section - Title and Description Below Media (hidden for Reel posts) */}
      {post.post_type !== "Reel" && (
        <>
          <div className={`flex flex-col ${getCategoryBackground(post.category)} rounded-b-lg`}>
            <div className="px-4 pt-4 pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg bg-gray-100 font-semibold text-gray-900 p-2 rounded-lg text-left">
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
            <div className="px-4 pb-3 flex justify-end items-center">
              <img
                src={oweruLogo}
                alt="Oweru logo"
                className="h-12 w-auto shadow-lg"
              />
            </div>
          </div>

          {/* Contact Information Footer - Always at bottom */}
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

          {/* Empty div with category-based background */}
          <div className={`${getCategoryBackground(post.category)} h-10 rounded-b-lg`}></div>
        </>
      )}

      {/* Share Button - Bottom Right */}
      <div className="absolute bottom-3 right-3 z-30">
        <div className="relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="bg-white hover:bg-gray-50 text-slate-900 p-2 rounded-full shadow-xl transition-all duration-200 flex items-center justify-center border-2 border-gray-300 hover:border-gray-400 backdrop-blur-sm"
            aria-label="Share post"
            style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}
          >
            <Send className="w-5 h-5" />
          </button>

          {/* Share Menu Dropdown */}
          {showShareMenu && (
            <>
              {/* Backdrop to close menu */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowShareMenu(false)}
              />

              {/* Menu - Opens upward from bottom */}
              <div className="absolute right-0 bottom-12 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[200px] z-20">
                {/* Native Share (Mobile) */}
                {navigator.share && (
                  <button
                    onClick={() => handleShare('native')}
                    className="w-full px-4 py-2.5 text-left hover:bg-gray-100 flex items-center gap-3 text-slate-900 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Share...</span>
                  </button>
                )}

                {/* WhatsApp */}
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="w-full px-4 py-2.5 text-left hover:bg-gray-100 flex items-center gap-3 text-slate-900 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <span>WhatsApp</span>
                </button>

                {/* Facebook */}
                <button
                  onClick={() => handleShare('facebook')}
                  className="w-full px-4 py-2.5 text-left hover:bg-gray-100 flex items-center gap-3 text-slate-900 transition-colors"
                >
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </button>

                {/* Twitter */}
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-full px-4 py-2.5 text-left hover:bg-gray-100 flex items-center gap-3 text-slate-900 transition-colors"
                >
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>Twitter</span>
                </button>

                {/* Instagram */}
                <button
                  onClick={() => handleShare('instagram')}
                  className="w-full px-4 py-2.5 text-left hover:bg-gray-100 flex items-center gap-3 text-slate-900 transition-colors"
                >
                  <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Instagram</span>
                </button>

                {/* Copy Link */}
                <button
                  onClick={() => handleShare('copy')}
                  className="w-full px-4 py-2.5 text-left hover:bg-gray-100 flex items-center gap-3 text-slate-900 transition-colors border-t border-gray-200 mt-1 pt-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePostCard;