import { useState, useRef } from "react";
import { Send, MessageCircle, Copy, Check, Share2 } from "lucide-react";
import oweruLogo from "../../assets/oweru_logo.png";

const HomePostCard = ({ post }) => {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Optimized for your 31.97.176.48:8081 environment
  const getMediaUrl = (media) => {
    if (!media) return "";
    
    // 1. If the API already gave us a full URL, use it
    if (media.url && (media.url.startsWith('http://') || media.url.startsWith('https://'))) {
      return media.url;
    }

    // 2. Construct URL from the IP/Port you are using
    const baseUrl = "http://31.97.176.48:8081"; 
    
    // 3. Handle file_path (ensure no double slashes)
    const filePath = media.file_path?.startsWith('/') ? media.file_path.substring(1) : media.file_path;
    
    // Your Nginx is configured to serve /storage/ from the Laravel public folder
    return `${baseUrl}/storage/${filePath}`;
  };

  const images = post.media?.filter((m) => m.file_type === "image") || [];
  const videos = post.media?.filter((m) => m.file_type === "video") || [];

  const getCategoryBackground = (category) => {
    switch (category) {
      case "rentals":
      case "lands_and_plots": return "bg-[#C89128]";
      case "property_sales":
      case "property_services": return "bg-gray-300";
      default: return "bg-slate-900";
    }
  };

  const getCategoryTextColor = (category) => {
    switch (category) {
      case "property_sales":
      case "property_services": return "text-gray-900";
      default: return "text-white";
    }
  };

  const getShareUrl = () => `${window.location.origin}/post/${post.id}`;
  
  const getShareText = () => {
    return `${post.title}\n\nCheck out this ${post.category} property on Oweru Media!\nView here: `;
  };

  const handleShare = async (platform) => {
    const url = getShareUrl();
    const text = getShareText();
    const fullMessage = `${text} ${url}`;

    // Note: navigator.share (Native) ONLY works on HTTPS. 
    // Since you are on HTTP (IP address), this will likely fallback to the switch cases below.
    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({ title: post.title, text: text, url: url });
        setShowShareMenu(false);
        return;
      } catch (err) { console.error(err); }
    }

    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(fullMessage)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
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
    const fullText = `${getShareText()} ${getShareUrl()}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => { setCopied(false); setShowShareMenu(false); }, 2000);
    } catch (err) {
      alert("Link Copied!");
    }
  };

  const handleVideoPlay = () => {
    if (videoRef.current) {
      // Mobile fix: Always ensure muted is handled if auto-playing
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.log("Playback failed:", err));
    }
  };

  return (
    <div className="shadow-lg overflow-hidden border border-gray-200 bg-white flex flex-col relative h-[700px]">
      <div className={`w-full ${post.post_type === "Reel" ? "h-full" : "h-64 shrink-0"}`}>
        
        {/* VIDEO / REEL SECTION */}
        {post.post_type === "Reel" && videos.length > 0 && (
          <div className="relative w-full h-full bg-black">
            <video
              ref={videoRef}
              playsInline
              muted // REQUIRED for most mobile browsers to allow playback
              loop
              preload="auto"
              className="w-full h-full object-cover"
              onClick={() => isPlaying ? videoRef.current.pause() : handleVideoPlay()}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source src={getMediaUrl(videos[0])} type="video/mp4" />
            </video>

            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="bg-white/20 backdrop-blur-md rounded-full p-6">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            )}

            {/* Reel Overlays */}
            <div className="absolute top-2 left-2 z-10">
              <img src={oweruLogo} alt="Logo" className="h-10 w-auto bg-white/80 rounded p-1" />
            </div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4 pointer-events-none">
                <div className="text-center">
                    <h3 className="text-lg font-bold text-white drop-shadow-lg">{post.title}</h3>
                    <p className="text-white text-sm drop-shadow-md">{post.description}</p>
                </div>
            </div>
          </div>
        )}

        {/* IMAGE SECTION */}
        {post.post_type !== "Reel" && images.length > 0 && (
          <img
            src={getMediaUrl(images[carouselIndex])}
            className="w-full h-full object-cover bg-black"
            alt={post.title}
          />
        )}
      </div>

      {/* Description below (Non-Reels) */}
      {post.post_type !== "Reel" && (
        <div className={`p-4 flex-1 ${getCategoryBackground(post.category)}`}>
           <h3 className={`text-lg font-bold ${getCategoryTextColor(post.category)}`}>{post.title}</h3>
           <p className={`text-sm mt-2 ${getCategoryTextColor(post.category)}`}>{post.description}</p>
        </div>
      )}

      {/* Share UI */}
      <div className="absolute bottom-3 right-3 z-30">
        <button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="bg-white p-3 rounded-full shadow-2xl border border-gray-200"
        >
          <Send className="w-5 h-5 text-gray-900" />
        </button>

        {showShareMenu && (
          <div className="absolute right-0 bottom-14 bg-white rounded-xl shadow-2xl border p-2 min-w-[180px]">
            <button onClick={() => handleShare('whatsapp')} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
              <MessageCircle className="w-5 h-5 text-green-500" /> <span>WhatsApp</span>
            </button>
            <button onClick={() => handleShare('copy')} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
              {copied ? <Check className="text-green-500" /> : <Copy className="text-gray-400" />} 
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePostCard;