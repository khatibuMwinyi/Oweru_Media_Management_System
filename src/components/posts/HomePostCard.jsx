import { useState, useRef, useEffect } from "react";
import { Send, MessageCircle, Copy, Check, Share2 } from "lucide-react";
import oweruLogo from "../../assets/oweru_logo.png";

const HomePostCard = ({ post }) => {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const videoRef = useRef(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Helper to get Base URL (removes /api and trailing slashes)
  const getBaseUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL || "http://31.97.176.48:8081/api";
    return envUrl.replace(/\/api\/?$/, "");
  };

  const getMediaUrl = (media) => {
    if (!media) return "";
    if (media.url && (media.url.startsWith('http'))) return media.url;
    
    const baseUrl = getBaseUrl();
    const filePath = media.file_path?.replace(/^\//, ""); 
    return `${baseUrl}/storage/${filePath}`;
  };

  const images = post.media?.filter((m) => m.file_type === "image") || [];
  const videos = post.media?.filter((m) => m.file_type === "video") || [];

  const getShareUrl = () => `${window.location.origin}/post/${post.id}`;
  const getShareText = () => `${post.title}\n\nCheck out this ${post.category} property on Oweru Media!`;

  const handleShare = async (platform) => {
    const url = getShareUrl();
    const text = getShareText();
    const fullMessage = `${text}\n${url}`;

    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({ title: post.title, text: text, url: url });
      } catch (err) { console.log(err); }
    } else if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(fullMessage)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'copy') {
      handleCopyLink(fullMessage);
    }
    setShowShareMenu(false);
  };

  const handleCopyLink = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert("Link copied to clipboard");
    }
  };

  return (
    <div className="shadow-lg overflow-hidden border border-gray-200 bg-white flex flex-col relative h-[700px]">
      <div className={`w-full ${post.post_type === "Reel" ? "h-full" : "h-64 shrink-0"}`}>
        
        {/* REEL / VIDEO SECTION */}
        {post.post_type === "Reel" && videos.length > 0 && (
          <div className="relative w-full h-full bg-black">
            <video
              ref={videoRef}
              controls
              playsInline
              muted // Crucial for Mobile Auto-play
              loop
              preload="auto"
              className="w-full h-full object-cover"
            >
              <source src={getMediaUrl(videos[0])} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Overlays */}
            <div className="absolute top-2 left-2 z-10">
              <img src={oweruLogo} alt="Logo" className="h-10 w-auto bg-white/80 rounded p-1" />
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4 pointer-events-none">
              <div className="p-4 max-w-md w-full pointer-events-auto backdrop-blur-sm text-center">
                <h3 className="text-lg font-bold text-white drop-shadow-md">{post.title}</h3>
                <p className="text-white text-sm whitespace-pre-wrap mt-2">{post.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* STATIC / CAROUSEL SECTION */}
        {post.post_type !== "Reel" && images.length > 0 && (
           <img 
            src={getMediaUrl(images[carouselIndex])} 
            className="w-full h-full object-cover bg-black" 
            alt="Post"
           />
        )}
      </div>

      {/* Description Area (Hidden for Reels) */}
      {post.post_type !== "Reel" && (
        <div className="p-4 flex-1 overflow-y-auto">
          <h3 className="text-lg font-bold">{post.title}</h3>
          <p className="text-sm text-gray-600 mb-2">{post.category}</p>
          <p className="text-sm">{post.description}</p>
        </div>
      )}

      {/* Shared Footer and Buttons logic remains same... */}
      <div className="absolute bottom-3 right-3 z-20">
         <button onClick={() => setShowShareMenu(!showShareMenu)} className="bg-white p-3 rounded-full shadow-lg border border-gray-200">
            <Send className="w-5 h-5" />
         </button>
         {showShareMenu && (
            <div className="absolute right-0 bottom-14 bg-white shadow-2xl rounded-xl p-2 min-w-[150px] border">
                <button onClick={() => handleShare('whatsapp')} className="w-full p-2 text-left flex gap-2"><MessageCircle className="text-green-500"/> WhatsApp</button>
                <button onClick={() => handleShare('native')} className="w-full p-2 text-left flex gap-2"><Share2 /> More...</button>
                <button onClick={() => handleShare('copy')} className="w-full p-2 text-left flex gap-2"><Copy /> {copied ? 'Copied!' : 'Copy Link'}</button>
            </div>
         )}
      </div>
    </div>
  );
};

export default HomePostCard;