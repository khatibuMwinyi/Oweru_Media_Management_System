import { useState, useRef } from "react";
import { Send, MessageCircle, Copy, Check, Share2, Mail, Phone, Globe, Download, Camera } from "lucide-react";
import oweruLogo from "../../assets/oweru_logo.png";
import html2canvas from "html2canvas";

const HomePostCard = ({ post }) => {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const videoRef = useRef(null);
  const cardRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const BASE_URL = "http://31.97.176.48:8081";

  const getMediaUrl = (media) => {
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

  const getCategoryStyles = (category) => {
    switch (category) {
      case "rentals":
        return { bg: "bg-[#C89128]", text: "text-white" }; // Gold background
      case "property_sales":
        return { bg: "bg-gray-300", text: "text-slate-700" };
      case "lands_and_plots":
        return { bg: "bg-[#C89128]", text: "text-white" };
      case "property_services":
        return { bg: "bg-gray-300", text: "text-slate-700" };
      case "investment":
        return { bg: "bg-slate-900", text: "text-white" };
      case "construction_property_management":
        return { bg: "bg-slate-900", text: "text-white" };
      default:
        return { bg: "bg-slate-900", text: "text-white" };
    }
  };

  const categoryStyles = getCategoryStyles(post.category);

  const getShareUrl = () => {
    // Use the current window location as base, then add the post route
    const baseUrl = window.location.origin; // Gets https://yourdomain.com
    return `${baseUrl}/post/${post.id}`;
  };

  const getShareText = () => {
    return `${post.title}\n\n${post.description}\n\nCheck out this ${post.category} property on Oweru Media!`;
  };

  const handleShare = async (platform) => {
    const url = getShareUrl();
    const text = getShareText();

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
    }

    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodedText}%20${encodedUrl}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank');
        break;
      case 'instagram':
        handleCopyLink();
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
    setShowShareMenu(false);
  };

  const handleDownloadAsImage = async () => {
    if (!cardRef.current) return;
    
    setDownloading(true);
    setShowShareMenu(false);
    
    try {
      // Hide the share button temporarily
      const shareButton = cardRef.current.querySelector('.share-button-container');
      if (shareButton) shareButton.style.display = 'none';
      
      // For video posts, pause the video
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
      }
      
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        logging: false,
        imageTimeout: 0,
      });
      
      // Show share button again
      if (shareButton) shareButton.style.display = 'block';
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().getTime();
        link.download = `${post.title.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        setDownloading(false);
      }, 'image/png');
      
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to download image. Please try again.');
      setDownloading(false);
      
      // Make sure share button is visible again
      const shareButton = cardRef.current.querySelector('.share-button-container');
      if (shareButton) shareButton.style.display = 'block';
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        .font-inter {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>

      <div className="shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white flex flex-col relative h-[700px] font-inter hover:shadow-xl transition-shadow duration-300" ref={cardRef}>
        {/* Media Section */}
        <div className={`w-full ${post.post_type === "Reel" ? "h-full" : "h-64 shrink-0"}`}>
          {/* Static Post */}
          {post.post_type === "Static" && images.length > 0 && (
            <div className="w-full h-full flex items-center justify-center bg-black rounded-t-xl overflow-hidden">
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

          {/* Carousel Post */}
          {post.post_type === "Carousel" && images.length > 0 && (
            <div className="w-full h-full flex flex-col rounded-t-xl overflow-hidden">
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
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white px-3 py-1 rounded-full transition-all duration-200 font-bold"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() =>
                        setCarouselIndex((prev) => (prev + 1) % images.length)
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white px-3 py-1 rounded-full transition-all duration-200 font-bold"
                    >
                      ›
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {carouselIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Reel Post - Video */}
          {post.post_type === "Reel" && videos.length > 0 && (
            <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                controls={isPlaying}
                playsInline
                preload="metadata"
                className="w-full h-full object-cover"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onClick={() => {
                  if (videoRef.current?.paused) {
                    videoRef.current?.play();
                  } else {
                    videoRef.current?.pause();
                  }
                }}
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
              
              {/* Custom Play Button */}
              {!isPlaying && (
                <div className="absolute bottom-6 left-6 z-50">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      videoRef.current?.play();
                    }}
                    className="bg-white rounded-full p-3 shadow-2xl hover:scale-110 transition-all duration-200"
                    aria-label="Play video"
                  >
                    <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                </div>
              )}
              
              {/* Logo */}
              <div className="absolute top-4 left-4 z-10">
                <img
                  src={oweruLogo}
                  alt="Oweru logo"
                  className="h-12 w-auto shadow-lg bg-white/90 rounded-lg p-2"
                />
              </div>
              
              {/* Text Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4 pointer-events-none">
                <div className="rounded-xl p-6 max-w-md w-full pointer-events-auto backdrop-blur-sm bg-black/20" style={{
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)'
                }}>
                  <h3 
                    className="text-xl font-bold text-white mb-3 text-center"
                    style={{
                      textShadow: '3px 3px 6px rgba(0,0,0,0.9), -1px -1px 3px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.8)',
                      WebkitTextStroke: '0.5px rgba(0,0,0,0.5)'
                    }}
                  >
                    {post.title}
                  </h3>
                  <p 
                    className="text-sm font-semibold text-white mb-4 text-center"
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
                      textShadow: '2px 2px 4px rgba(0,0,0,0.9), -1px -1px 2px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.8)',
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

        {/* Content below media (not for Reel) */}
        {post.post_type !== "Reel" && (
          <>
            <div className={`flex flex-col ${categoryStyles.bg}`}>
              <div className="px-4 pt-4 pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold bg-white text-gray-900 p-3 rounded-lg shadow-sm">
                      {post.title}
                    </h3>
                    <p className={`text-xs ${categoryStyles.text} mt-3 font-medium opacity-90`}>
                      {post.post_type} • {post.category} • {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="px-4 py-4 h-32 overflow-y-auto scrollbar-thin shrink-0">
                <p className={`${categoryStyles.text} whitespace-pre-wrap text-sm leading-relaxed font-medium`}>
                  {post.description}
                </p>
              </div>
              
              <div className="px-4 pb-3 flex justify-end items-center">
                <img
                  src={oweruLogo}
                  alt="Oweru logo"
                  className="h-12 w-auto shadow-lg rounded-lg"
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white px-4 py-3 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-700">
                <a href="mailto:info@oweru.com" className="flex items-center gap-1.5 hover:text-[#C89128] transition-colors font-medium">
                  <Mail className="w-4 h-4" />
                  <span>info@oweru.com</span>
                </a>
                <a href="tel:+255711890764" className="flex items-center gap-1.5 hover:text-[#C89128] transition-colors font-medium">
                  <Phone className="w-4 h-4" />
                  <span>+255 711 890 764</span>
                </a>
                <a
                  href="https://www.oweru.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-[#C89128] transition-colors font-medium"
                >
                  <Globe className="w-4 h-4" />
                  <span>oweru.com</span>
                </a>
              </div>
            </div>
            
            <div className={`${categoryStyles.bg} h-3 rounded-b-xl`}></div>
          </>
        )}

        {/* Share Button */}
        <div className="absolute bottom-3 right-3 z-20 share-button-container">
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="bg-white hover:bg-gray-50 text-gray-900 p-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center border-2 border-gray-200 hover:border-[#C89128]"
              aria-label="Share post"
              disabled={downloading}
            >
              {downloading ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-[#C89128] rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
            
            {showShareMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowShareMenu(false)} />
                <div className="absolute right-0 bottom-14 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 min-w-[200px] z-20">
                  {navigator.share && (
                    <button
                      onClick={() => handleShare('native')}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-900 transition-colors font-medium"
                    >
                      <Share2 className="w-5 h-5" />
                      <span>Share...</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-900 transition-colors font-medium"
                  >
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-900 transition-colors font-medium"
                  >
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-900 transition-colors font-medium"
                  >
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span>Twitter</span>
                  </button>
                  <button
                    onClick={() => handleShare('instagram')}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-900 transition-colors font-medium"
                  >
                    <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span>Instagram</span>
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-900 transition-colors border-t border-gray-200 mt-1 pt-3 font-medium"
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
                  
                  <button
                    onClick={handleDownloadAsImage}
                    disabled={downloading}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-900 transition-colors font-medium border-t border-gray-200"
                  >
                    {downloading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-[#C89128] rounded-full animate-spin" />
                        <span className="text-gray-500">Downloading...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 text-[#C89128]" />
                        <span>Download as Image</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePostCard;