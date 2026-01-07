import { useState, useRef } from "react";
import { Send, MessageCircle, Copy, Check, Share2 } from "lucide-react";
import oweruLogo from "../../assets/oweru_logo.png";

const HomePostCard = ({ post }) => {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // HARDCODED BASE URL
  const BASE_URL = "http://31.97.176.48:8081";

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

  const getShareUrl = () => `${BASE_URL}/post/${post.id}`;

  const handleShare = async (platform) => {
    const url = getShareUrl();
    const text = `${post.title}\n\n${post.description}\n\nCheck out this ${post.category} property on Oweru Media!`;

    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({ title: post.title, text: text, url: url });
        setShowShareMenu(false);
        return;
      } catch (err) {
        console.error('Web Share failed:', err);
      }
    }

    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodedText}%20${encodedUrl}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank');
        break;
      case 'copy':
        handleCopyLink(text, url);
        break;
      default:
        break;
    }
    setShowShareMenu(false);
  };

  const handleCopyLink = async (text, url) => {
    const fullText = `${text}\n\n${url}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = fullText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="shadow-lg overflow-hidden border border-gray-200 bg-white flex flex-col relative h-[700px]">
      {/* Media Section */}
      <div className={`w-full ${post.post_type === "Reel" ? "h-full" : "h-64 shrink-0"}`}>
        {/* Static Post */}
        {post.post_type === "Static" && images.length > 0 && (
          <div className="w-full h-full flex items-center justify-center bg-black">
            <img
              src={getMediaUrl(images[0])}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found"; }}
            />
          </div>
        )}

        {/* Carousel Post */}
        {post.post_type === "Carousel" && images.length > 0 && (
          <div className="relative w-full h-full">
            <img
              src={getMediaUrl(images[carouselIndex])}
              alt={`${post.title} - Image ${carouselIndex + 1}`}
              className="w-full h-full object-cover bg-black"
            />
            {images.length > 1 && (
              <>
                <button onClick={() => setCarouselIndex((prev) => (prev - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-1 rounded-full">‹</button>
                <button onClick={() => setCarouselIndex((prev) => (prev + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-1 rounded-full">›</button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-xs">{carouselIndex + 1} / {images.length}</div>
              </>
            )}
          </div>
        )}

        {/* Reel Post - Video Fixed for Mobile */}
        {post.post_type === "Reel" && videos.length > 0 && (
          <div className="relative w-full h-full bg-black">
            <video
              ref={videoRef}
              key={getMediaUrl(videos[0])}
              playsInline
              muted // Mandatory for mobile autoplay
              autoPlay
              loop
              preload="metadata"
              className="w-full h-full object-cover cursor-pointer"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onClick={() => {
                if (videoRef.current?.paused) {
                  videoRef.current.muted = false; // Unmute on interaction
                  videoRef.current?.play();
                } else {
                  videoRef.current?.pause();
                }
              }}
            >
              <source src={getMediaUrl(videos[0])} type="video/mp4" />
            </video>

            {/* Play Button - Positioned Bottom Left */}
            {!isPlaying && (
              <div className="absolute bottom-6 left-6 z-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (videoRef.current) {
                      videoRef.current.muted = false; 
                      videoRef.current.play();
                    }
                  }}
                  className="bg-white/90 rounded-full p-4 shadow-2xl hover:scale-110 transition-all border-2 border-gray-100"
                >
                  <svg className="w-10 h-10 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              </div>
            )}

            {/* Logo */}
            <div className="absolute top-4 left-4 z-20">
              <img src={oweruLogo} alt="Logo" className="h-10 w-auto shadow-lg bg-white/80 rounded p-1" />
            </div>

            {/* Text Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4 pointer-events-none">
              <div className="rounded-lg p-4 max-w-md w-full pointer-events-auto backdrop-blur-[2px]" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                <h3 className="text-xl font-bold text-white mb-2 text-center drop-shadow-xl">{post.title}</h3>
                <p className="text-white text-sm text-center whitespace-pre-wrap leading-relaxed font-medium">{post.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Content (Static/Carousel Only) */}
      {post.post_type !== "Reel" && (
        <div className={`flex flex-col flex-1 ${getCategoryBackground(post.category)}`}>
          <div className="px-4 pt-4 pb-2">
            <h3 className="text-lg bg-white/90 font-semibold text-gray-900 p-2 rounded-lg text-left inline-block">
              {post.title}
            </h3>
            <p className={`text-xs ${getCategoryTextColor(post.category)} mt-2 text-left font-bold`}>
              {post.post_type} • {post.category} • {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="px-4 py-2 flex-1 overflow-y-auto">
            <p className={`${getCategoryTextColor(post.category)} text-left whitespace-pre-wrap text-sm leading-relaxed font-medium`}>
              {post.description}
            </p>
          </div>
          <div className="px-4 pb-3 flex justify-between items-center bg-white/10 mt-auto">
             <div className="text-[10px] text-white/80 text-left">
                info@oweru.com | +255 711 890 764
             </div>
             <img src={oweruLogo} alt="Oweru" className="h-10 w-auto drop-shadow-md" />
          </div>
        </div>
      )}

      {/* Floating Share Button */}
      <div className="absolute bottom-4 right-4 z-30">
        <button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="bg-white text-slate-900 p-3 rounded-full shadow-2xl border border-gray-200"
        >
          <Send className="w-5 h-5" />
        </button>

        {showShareMenu && (
          <div className="absolute right-0 bottom-14 bg-white rounded-lg shadow-2xl border min-w-[180px] py-2 overflow-hidden">
             <button onClick={() => handleShare('whatsapp')} className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"><MessageCircle className="w-4 h-4 text-green-500"/> WhatsApp</button>
             <button onClick={() => handleShare('facebook')} className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"><Share2 className="w-4 h-4 text-blue-600"/> Facebook</button>
             <button onClick={() => handleShare('copy')} className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 border-t mt-1">{copied ? <Check className="w-4 h-4 text-green-500"/> : <Copy className="w-4 h-4"/>} {copied ? "Copied!" : "Copy Link"}</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePostCard;