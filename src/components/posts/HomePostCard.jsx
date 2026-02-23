import { useState, useRef } from "react";
import { Send, MessageCircle, Copy, Check, Share2, Mail, Phone, Globe, Download, Instagram, X } from "lucide-react";
import oweruLogo from "../../assets/oweru_logo.png";
import html2canvas from "html2canvas";
import {
  getMediaUrl,
  filterValidMedia,
  PLACEHOLDER_IMAGE,
} from "../../utils/mediaUtils";

const HomePostCard = ({ post }) => {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const videoRef = useRef(null);
  const cardRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [postingToInstagram, setPostingToInstagram] = useState(false);
  const [instagramStatus, setInstagramStatus] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://127.0.0.1:8000";

  const images = filterValidMedia(post.media, "image");
  const videos = filterValidMedia(post.media, "video");

  const getCategoryStyles = (category) => {
    switch (category) {
      case "rentals":
      case "lands_and_plots":
        return { bg: "bg-[#C89128]", text: "text-white" };
      case "property_sales":
      case "property_services":
        return { bg: "bg-gray-300", text: "text-slate-700" };
      case "investment":
      case "construction_property_management":
        return { bg: "bg-slate-900", text: "text-white" };
      default:
        return { bg: "bg-slate-900", text: "text-white" };
    }
  };

  const categoryStyles = getCategoryStyles(post.category);

  const getShareUrl = () => `${window.location.origin}/post/${post.id}`;

  const getShareText = () =>
    `${post.title}\n\n${post.description}\n\nCheck out this ${post.category} property on Oweru Media!`;

  // ─── Instagram ───────────────────────────────────────────────────────────────
  const handlePostToInstagram = async () => {
    setPostingToInstagram(true);
    setInstagramStatus(null);
    setShowShareMenu(false);

    try {
      const formData = new FormData();

      let instagramPostType = "feed";
      if (post.post_type === "Carousel") instagramPostType = "carousel";
      else if (post.post_type === "Reel" && videos.length > 0) instagramPostType = "reel";

      const mediaToPost = instagramPostType === "reel" ? videos : images;
      let mediaUploaded = 0;

      for (let i = 0; i < mediaToPost.length; i++) {
        const media = mediaToPost[i];
        let relativePath;
        if (media.url) {
          relativePath = media.url.replace(/^https?:\/\/[^/]+\/storage\//, "");
        } else if (media.file_path) {
          relativePath = media.file_path.startsWith("/") ? media.file_path.substring(1) : media.file_path;
        } else {
          console.error("Media has no url or file_path:", media);
          continue;
        }

        const proxyUrl = `${BASE_URL}/api/proxy/media/${relativePath}`;

        try {
          const response = await fetch(proxyUrl, { mode: "cors", credentials: "omit" });
          if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
          const blob = await response.blob();
          const fileName = `media_${i}.${media.file_type === "video" ? "mp4" : "jpg"}`;
          formData.append(`media[${i}]`, blob, fileName);
          mediaUploaded++;
        } catch (err) {
          console.error(`Failed to fetch media ${i}:`, err);
        }
      }

      if (mediaUploaded === 0) throw new Error("No media files were successfully loaded.");

      const caption = `${post.title}\n\n${post.description}\n\n📍 ${post.category}\n\n#OweruMedia #RealEstate #Property #Tanzania`;
      formData.append("caption", caption);
      formData.append("post_type", instagramPostType);
      formData.append("post_id", post.id);

      const response = await fetch(`${BASE_URL}/api/instagram/post`, { method: "POST", body: formData });

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server returned non-JSON response.");
      }

      const data = await response.json();
      if (response.ok && data.success) {
        setInstagramStatus({ type: "success", message: data.message || "Successfully posted to Instagram!", permalink: data.permalink });
      } else {
        throw new Error(data.message || "Failed to post to Instagram");
      }
    } catch (error) {
      console.error("Instagram posting error:", error);
      setInstagramStatus({ type: "error", message: error.message || "Failed to post to Instagram. Please try again." });
    } finally {
      setPostingToInstagram(false);
    }
  };

  // ─── Share ────────────────────────────────────────────────────────────────────
  const handleShare = async (platform) => {
    const url = getShareUrl();
    const text = getShareText();

    if ((platform === "native" || platform === "instagram") && navigator.share) {
      try {
        await navigator.share({ title: post.title, text, url });
        setShowShareMenu(false);
        return;
      } catch (err) {
        if (err.name !== "AbortError") console.error("Web Share failed:", err);
      }
    }

    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);

    switch (platform) {
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodedText}%20${encodedUrl}`, "_blank");
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`, "_blank");
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, "_blank");
        break;
      case "instagram":
      case "copy":
        handleCopyLink();
        return;
      default:
        break;
    }
    setShowShareMenu(false);
  };

  const handleCopyLink = async () => {
    const fullText = `${getShareText()}\n\n${getShareUrl()}`;
    try {
      await navigator.clipboard.writeText(fullText);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = fullText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowShareMenu(false);
  };

  // ─── Download Complete Post with styling (title, description, colors) ────────────────────────────────────────────────────
  const handleDownloadPostAsImage = async () => {
    if (!cardRef.current) {
      throw new Error('Card reference not found');
    }
    
    setDownloading(true);
    setShowShareMenu(false);
    
    try {
      // Hide share button temporarily
      const shareButton = cardRef.current.querySelector('.share-button-container');
      if (shareButton) shareButton.style.display = 'none';
      
      // Pause video if playing
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
      }
      
      // Create canvas from the entire card to capture complete post with styling
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scale: 3,
        logging: false,
        // Capture the full scrollable height to ensure all content is included
        height: cardRef.current.scrollHeight,
        width: cardRef.current.scrollWidth,
        imageTimeout: 5000, // Give more time for complex content to render
        // Use window height to capture full content
        windowHeight: cardRef.current.scrollHeight || window.innerHeight
      });
      
      if (shareButton) shareButton.style.display = 'block';
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Failed to generate image');
        }
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().getTime();
        const sanitizedTitle = post.title.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
        
        // Determine file extension based on content
        const extension = 'jpg'; // Use JPG for better compatibility
        
        link.download = `Oweru_${sanitizedTitle}_CompletePost_${timestamp}.${extension}`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        
        console.log(`Successfully downloaded complete post as image: Oweru_${sanitizedTitle}_CompletePost_${timestamp}.${extension}`);
        console.log('Note: This captures the complete post layout with all styling, colors, title, and description.');
        
        setDownloading(false);
      }, 'image/jpeg', 0.95);
      
    } catch (error) {
      console.error('Error generating complete post image:', error);
      setDownloading(false);
      
      const shareButton = cardRef.current?.querySelector('.share-button-container');
      if (shareButton) shareButton.style.display = 'block';
    }
  };

  // ─── Download card as PNG screenshot ─────────────────────────────────────────
  const handleDownloadAsImage = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    setShowShareMenu(false);

    try {
      const shareBtn = cardRef.current.querySelector(".share-button-container");
      if (shareBtn) shareBtn.style.display = "none";
      if (videoRef.current && !videoRef.current.paused) videoRef.current.pause();

      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        scale: 3,
        logging: false,
        width: cardRef.current.scrollWidth,
        height: cardRef.current.scrollHeight,
      });

      if (shareBtn) shareBtn.style.display = "block";

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const sanitizedTitle = post.title.replace(/[^a-z0-9]/gi, "_").substring(0, 30);
        link.download = `Oweru_${sanitizedTitle}_${Date.now()}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        setDownloading(false);
      }, "image/png", 0.95);
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to download image. Please try again.");
      setDownloading(false);
      const shareBtn = cardRef.current?.querySelector(".share-button-container");
      if (shareBtn) shareBtn.style.display = "block";
    }
  };

  // ─── Download raw media files via backend proxy ───────────────────────────────
  const handleDownloadMedia = async () => {
    setDownloading(true);
    setShowShareMenu(false);

    try {
      const mediaToDownload = post.post_type === "Reel" && videos.length > 0 ? videos : images;

      if (mediaToDownload.length === 0) {
        alert("No media files available to download.");
        setDownloading(false);
        return;
      }

      for (let i = 0; i < mediaToDownload.length; i++) {
        const media = mediaToDownload[i];
        const mediaUrl = getMediaUrl(media);
        const ext = media.file_type === "video" ? "mp4" : mediaUrl.endsWith(".png") ? "png" : "jpg";
        const sanitizedTitle = post.title.replace(/[^a-z0-9]/gi, "_").substring(0, 30);
        const fileName = `Oweru_${sanitizedTitle}_${i + 1}_${Date.now()}.${ext}`;

        const proxyUrl = `${BASE_URL}/api/media/download?url=${encodeURIComponent(mediaUrl)}&filename=${encodeURIComponent(fileName)}`;

        const link = document.createElement("a");
        link.href = proxyUrl;
        link.download = fileName;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (i < mediaToDownload.length - 1) {
          await new Promise((r) => setTimeout(r, 800));
        }
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download media files. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 3px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #888; border-radius: 3px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #555; }
      `}</style>

      <div
        ref={cardRef}
        className="shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white flex flex-col relative h-[700px] hover:shadow-xl transition-shadow duration-300"
      >
        {/* ── Instagram status notification ── */}
        {instagramStatus && (
          <div className={`absolute top-4 left-4 right-4 z-50 p-4 rounded-lg shadow-xl text-white ${instagramStatus.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
            <div className="flex items-start gap-3">
              {instagramStatus.type === "success"
                ? <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                : <X className="w-5 h-5 flex-shrink-0 mt-0.5" />}
              <div className="flex-1">
                <p className="font-semibold">{instagramStatus.message}</p>
                {instagramStatus.permalink && (
                  <a href={instagramStatus.permalink} target="_blank" rel="noopener noreferrer" className="text-sm underline mt-1 inline-block">
                    View on Instagram →
                  </a>
                )}
              </div>
              <button onClick={() => setInstagramStatus(null)} className="text-white hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ── Media section ── */}
        <div className={`w-full ${post.post_type === "Reel" ? "h-full" : "h-64 shrink-0"}`}>

          {/* Static */}
          {post.post_type === "Static" && (
            <div className="w-full h-full flex items-center justify-center bg-black rounded-t-xl overflow-hidden">
              {images.length > 0 ? (
                <img
                  src={getMediaUrl(images[0])}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <p className="text-white text-center px-4">No valid image available</p>
                </div>
              )}
            </div>
          )}

          {/* Carousel */}
          {post.post_type === "Carousel" && (
            images.length > 0 ? (
              <div className="w-full h-full flex flex-col rounded-t-xl overflow-hidden">
                <div className="relative w-full h-full">
                  <img
                    src={getMediaUrl(images[carouselIndex])}
                    alt={`${post.title} - Image ${carouselIndex + 1}`}
                    className="w-full h-full object-cover bg-black"
                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCarouselIndex((p) => (p - 1 + images.length) % images.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white px-3 py-1 rounded-full font-bold"
                      >‹</button>
                      <button
                        onClick={() => setCarouselIndex((p) => (p + 1) % images.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white px-3 py-1 rounded-full font-bold"
                      >›</button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {carouselIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-t-xl">
                <p className="text-white text-center px-4">No valid images available</p>
              </div>
            )
          )}

          {/* Reel */}
          {post.post_type === "Reel" && videos.length > 0 ? (
            <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                controls={isPlaying}
                playsInline
                preload="metadata"
                className="w-full h-full object-cover"
                aria-label="Play video"
                onError={() => console.error("Video load error")}
              >
                <source src={getMediaUrl(videos[0])} type={videos[0].mime_type || "video/mp4"} />
              </video>
              {!isPlaying && (
                <div className="absolute bottom-6 left-6 z-50">
                  <button
                    onClick={(e) => { e.stopPropagation(); videoRef.current?.play(); }}
                    className="bg-white rounded-full p-3 shadow-2xl hover:scale-110 transition-all duration-200"
                    aria-label="Play video"
                  >
                    <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-t-xl">
              <p className="text-white text-center px-4">No valid video available</p>
            </div>
          )
          }
        </div>

        {/* ── Content below media (not for Reel) ── */}
        {post.post_type !== "Reel" && (
          <>
            <div className={`flex flex-col ${categoryStyles.bg}`}>
              <div className="px-4 pt-4 pb-3">
                <h3 className="text-lg font-bold bg-white text-gray-900 p-3 rounded-lg shadow-sm">
                  {post.title}
                </h3>
                <p className={`text-xs ${categoryStyles.text} mt-3 font-medium opacity-90`}>
                  {post.post_type} • {post.category} • {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="px-4 py-4 h-32 overflow-y-auto scrollbar-thin shrink-0">
                <p className={`${categoryStyles.text} whitespace-pre-wrap text-sm leading-relaxed font-medium`}>
                  {post.description}
                </p>
              </div>
              <div className="px-4 pb-3 flex justify-end items-center">
                <img src={oweruLogo} alt="Oweru logo" className="h-12 w-auto shadow-lg rounded-lg" />
              </div>
            </div>

            <div className="bg-white px-4 py-3 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-700">
                <a href="mailto:info@oweru.com" className="flex items-center gap-1.5 hover:text-[#C89128] transition-colors font-medium">
                  <Mail className="w-4 h-4" /><span>info@oweru.com</span>
                </a>
                <a href="tel:+255711890764" className="flex items-center gap-1.5 hover:text-[#C89128] transition-colors font-medium">
                  <Phone className="w-4 h-4" /><span>+255 711 890 764</span>
                </a>
                <a href="https://www.oweru.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#C89128] transition-colors font-medium">
                  <Globe className="w-4 h-4" /><span>oweru.com</span>
                </a>
              </div>
            </div>

            <div className={`${categoryStyles.bg} h-3 rounded-b-xl`} />
          </>
        )}

        {/* ── Share button ── */}
        <div className="absolute bottom-3 right-3 z-20 share-button-container">
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              disabled={downloading}
              className="bg-white hover:bg-gray-50 text-gray-900 p-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center border-2 border-gray-200 hover:border-[#C89128]"
              aria-label="Share post"
            >
              {downloading
                ? <div className="w-5 h-5 border-2 border-gray-300 border-t-[#C89128] rounded-full animate-spin" />
                : <Send className="w-5 h-5" />}
            </button>

            {showShareMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowShareMenu(false)} />
                <div className="absolute right-0 bottom-14 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 min-w-[210px] z-20">

                  {/* Post to Instagram */}
                  <button
                    onClick={handlePostToInstagram}
                    disabled={postingToInstagram}
                    className="w-full px-4 py-3 text-left hover:bg-purple-50 flex items-center gap-3 text-gray-900 transition-colors font-medium border-b border-gray-200"
                  >
                    {postingToInstagram ? (
                      <><div className="w-5 h-5 border-2 border-pink-300 border-t-pink-600 rounded-full animate-spin" /><span className="text-gray-500">Posting...</span></>
                    ) : (
                      <><Instagram className="w-5 h-5 text-pink-600" /><span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Post to Instagram</span></>
                    )}
                  </button>

                  {/* Native share */}
                  {navigator.share && (
                    <button onClick={() => handleShare("native")} className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-900 transition-colors font-medium">
                      <Share2 className="w-5 h-5" /><span>Share...</span>
                    </button>
                  )}

                  {/* WhatsApp */}
                  <button onClick={() => handleShare("whatsapp")} className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-900 transition-colors font-medium">
                    <MessageCircle className="w-5 h-5 text-green-600" /><span>WhatsApp</span>
                  </button>

                  {/* Facebook */}
                  <button onClick={() => handleShare("facebook")} className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-900 transition-colors font-medium">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>Facebook</span>
                  </button>

                  {/* Twitter / X */}
                  <button onClick={() => handleShare("twitter")} className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-900 transition-colors font-medium">
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span>Twitter</span>
                  </button>

                  {/* Copy link */}
                  <button onClick={() => handleShare("copy")} className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-900 transition-colors font-medium border-t border-gray-200">
                    {copied ? (
                      <><Check className="w-5 h-5 text-green-600" /><span className="text-green-600">Copied!</span></>
                    ) : (
                      <><Copy className="w-5 h-5" /><span>Copy Link</span></>
                    )}
                  </button>

                  {/* Download card as PNG */}
                  <button
                    onClick={handleDownloadAsImage}
                    disabled={downloading}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-900 transition-colors font-medium border-t border-gray-200"
                  >
                    {downloading ? (
                      <><div className="w-5 h-5 border-2 border-gray-300 border-t-[#C89128] rounded-full animate-spin" /><span className="text-gray-500">Downloading...</span></>
                    ) : (
                      <><Download className="w-5 h-5 text-[#C89128]" /><span>Download as Image</span></>
                    )}
                  </button>

                  {/* Download original media files */}
                  <button
                    onClick={handleDownloadMedia}
                    disabled={downloading}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-900 transition-colors font-medium border-t border-gray-200"
                  >
                    {downloading ? (
                      <><div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" /><span className="text-gray-500">Downloading...</span></>
                    ) : (
                      <><Download className="w-5 h-5 text-blue-600" /><span>Download Media Files</span></>
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