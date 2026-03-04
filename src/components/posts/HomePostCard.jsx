import { useState, useRef, memo } from "react";
import {
  Send,
  MessageCircle,
  Copy,
  Check,
  Share2,
  Mail,
  Phone,
  Globe,
  Download,
  Instagram,
  X,
} from "lucide-react";
import oweruLogo from "../../assets/oweru_logo.png";
import html2canvas from "html2canvas";
import {
  getMediaUrl,
  filterValidMedia,
  PLACEHOLDER_IMAGE,
} from "../../utils/mediaUtils";

const HomePostCard = ({ post }) => {
  const videoRef = useRef(null);
  const cardRef = useRef(null);
  const downloadCardRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [postingToInstagram, setPostingToInstagram] = useState(false);
  const [instagramStatus, setInstagramStatus] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [imageCache, setImageCache] = useState(new Map());

  const BASE_URL =
    import.meta.env.VITE_API_URL?.replace("/api", "") || "http://31.97.176.48:8081";

  const images = filterValidMedia(post.media, "image");
  const videos = filterValidMedia(post.media, "video");

  // ─── Category styles (unchanged) ───────────────────────────────────────────
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

  const getCategoryHex = (category) => {
    switch (category) {
      case "rentals":
      case "lands_and_plots":
        return "#C89128";
      case "property_sales":
      case "property_services":
        return "#D1D5DB";
      case "construction_property_management":
      case "investment":
        return "#0F172A";
      default:
        return "#0F172A";
    }
  };

  const getCategoryTextHex = (category) => {
    switch (category) {
      case "rentals":
      case "lands_and_plots":
        return "#F3F4F6";
      case "property_sales":
      case "property_services":
        return "#1F2937";
      case "construction_property_management":
      case "investment":
        return "#FFFFFF";
      default:
        return "#FFFFFF";
    }
  };

  const categoryHex = getCategoryHex(post.category);
  const categoryTextHex = getCategoryTextHex(post.category);

  const getShareUrl = () => `${window.location.origin}/post/${post.id}`;
  const getShareText = () =>
    `${post.title}\n\n${post.description}\n\nCheck out this ${post.category} property on Oweru Media!`;

  // ─── Cached image URL ───────────────────────────────────────────────────────
  const getCachedMediaUrl = (media) => {
    const cacheKey = `${media.id}-${media.updated_at || media.created_at}`;
    if (imageCache.has(cacheKey)) return imageCache.get(cacheKey);
    const url = getMediaUrl(media);
    setImageCache(prev => new Map(prev).set(cacheKey, url));
    return url;
  };

  // ─── Instagram ──────────────────────────────────────────────────────────────
  const handlePostToInstagram = async () => {
    setPostingToInstagram(true);
    setInstagramStatus(null);
    setShowShareMenu(false);
    try {
      const formData = new FormData();
      let instagramPostType = "feed";
      if (post.post_type === "Carousel") instagramPostType = "carousel";
      else if (post.post_type === "Reel" && videos.length > 0)
        instagramPostType = "reel";

      const mediaToPost = instagramPostType === "reel" ? videos : images;
      let mediaUploaded = 0;

      for (let i = 0; i < mediaToPost.length; i++) {
        const media = mediaToPost[i];
        let relativePath;
        if (media.url) {
          relativePath = media.url.replace(/^https?:\/\/[^/]+\/storage\//, "");
        } else if (media.file_path) {
          relativePath = media.file_path.startsWith("/")
            ? media.file_path.substring(1)
            : media.file_path;
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

      const response = await fetch(`${BASE_URL}/api/instagram/post`, {
        method: "POST",
        body: formData,
      });

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server returned non-JSON response.");
      }

      const data = await response.json();
      if (response.ok && data.success) {
        setInstagramStatus({
          type: "success",
          message: data.message || "Successfully posted to Instagram!",
          permalink: data.permalink,
        });
      } else {
        throw new Error(data.message || "Failed to post to Instagram");
      }
    } catch (error) {
      console.error("Instagram posting error:", error);
      setInstagramStatus({
        type: "error",
        message: error.message || "Failed to post to Instagram. Please try again.",
      });
    } finally {
      setPostingToInstagram(false);
    }
  };

  // ─── Share ───────────────────────────────────────────────────────────────────
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
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&e=${encodedText}`, "_blank");
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

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const fetchMediaAsDataUrl = async (media) => {
    let relativePath;
    if (media.url) {
      relativePath = media.url.replace(/^https?:\/\/[^/]+\/storage\//, "");
    } else if (media.file_path) {
      relativePath = media.file_path.startsWith("/")
        ? media.file_path.substring(1)
        : media.file_path;
    } else {
      throw new Error("Media has no url or file_path");
    }
    const proxyUrl = `${BASE_URL}/api/proxy/media/${relativePath}`;
    const res = await fetch(proxyUrl, { mode: "cors", credentials: "omit" });
    if (!res.ok) throw new Error(`Proxy fetch failed: ${res.status}`);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const loadImage = (src) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });

  const captureVideoFrame = (videoEl) =>
    new Promise((resolve) => {
      const attempt = () => {
        try {
          const tmpCanvas = document.createElement("canvas");
          tmpCanvas.width = videoEl.videoWidth || 640;
          tmpCanvas.height = videoEl.videoHeight || 360;
          tmpCanvas.getContext("2d").drawImage(videoEl, 0, 0, tmpCanvas.width, tmpCanvas.height);
          resolve(tmpCanvas.toDataURL("image/jpeg", 0.95));
        } catch {
          resolve(null);
        }
      };

      if (videoEl.readyState >= 2) {
        attempt();
      } else {
        videoEl.addEventListener("loadeddata", attempt, { once: true });
        videoEl.addEventListener("error", () => resolve(null), { once: true });
        videoEl.currentTime = 0.1;
      }
    });

  const wrapTextLines = (ctx, text, maxWidth, maxLines = null) => {
    const paragraphs = text.split("\n");
    const lines = [];
    for (const para of paragraphs) {
      if (para.trim() === "") { lines.push(""); continue; }
      const words = para.split(" ");
      let line = "";
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth && line) {
          lines.push(line);
          line = word;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);
    }
    if (maxLines && lines.length > maxLines) {
      const trimmed = lines.slice(0, maxLines);
      const last = trimmed[trimmed.length - 1];
      trimmed[trimmed.length - 1] = last.replace(/\s+\S*$/, "") + "…";
      return trimmed;
    }
    return lines;
  };

  const roundRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  // ─── Download: Branded Post Image ────────────────────────────────────────────
  const handleDownloadPostAsImage = async () => {
    setDownloading(true);
    setShowShareMenu(false);

    try {
      const SCALE   = 2;
      const W       = 600 * SCALE;
      const H       = 700 * SCALE;
      const PAD     = 16 * SCALE;
      const PAD_X   = 24 * SCALE;
      const RADIUS  = 8 * SCALE;

      const MEDIA_H    = 256 * SCALE;
      const ACCENT_H   =  40 * SCALE;
      const FOOTER_H   =  48 * SCALE;
      const CONTENT_H  = H - MEDIA_H - FOOTER_H - ACCENT_H;

      const isReel     = post.post_type === "Reel" && videos.length > 0;
      const isCarousel = post.post_type === "Carousel" && images.length > 0;
      const primaryMedia = isReel
        ? videos[0]
        : isCarousel ? images[carouselIndex] : (images[0] ?? null);

      const logoBitmap = await loadImage(oweruLogo).catch(() => null);

      let mediaBitmap = null;
      if (primaryMedia) {
        if (primaryMedia.file_type === "video") {
          if (videoRef.current) {
            const fd = await captureVideoFrame(videoRef.current);
            if (fd) mediaBitmap = await loadImage(fd);
          }
          if (!mediaBitmap) {
            try {
              const dataUrl = await fetchMediaAsDataUrl(primaryMedia);
              const tmpVideo = document.createElement("video");
              tmpVideo.muted = true;
              tmpVideo.src = dataUrl;
              tmpVideo.style.cssText = "position:fixed;left:-9999px;top:0;width:1px;height:1px;";
              document.body.appendChild(tmpVideo);
              tmpVideo.currentTime = 0.5;
              const fd = await captureVideoFrame(tmpVideo);
              document.body.removeChild(tmpVideo);
              if (fd) mediaBitmap = await loadImage(fd);
            } catch (e) {
              console.warn("Video frame fallback failed:", e);
            }
          }
        } else {
          try {
            const dataUrl = await fetchMediaAsDataUrl(primaryMedia);
            mediaBitmap = await loadImage(dataUrl);
          } catch (e) {
            console.warn("Proxy image fetch failed, trying direct URL:", e);
            mediaBitmap = await loadImage(getMediaUrl(primaryMedia));
          }
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width  = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#FFFFFF";
      roundRect(ctx, 0, 0, W, H, RADIUS);
      ctx.fill();
      ctx.save();
      roundRect(ctx, 0, 0, W, H, RADIUS);
      ctx.clip();

      let cursorY = 0;

      // ── Media ──
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, cursorY, W, MEDIA_H);

      if (mediaBitmap) {
        const bW = mediaBitmap.naturalWidth  || mediaBitmap.width  || 1;
        const bH = mediaBitmap.naturalHeight || mediaBitmap.height || 1;
        const scaleX = W / bW;
        const scaleY = MEDIA_H / bH;
        const s = Math.max(scaleX, scaleY);
        const dW = bW * s;
        const dH = bH * s;
        const dX = (W - dW) / 2;
        const dY = cursorY + (MEDIA_H - dH) / 2;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, cursorY, W, MEDIA_H);
        ctx.clip();
        ctx.drawImage(mediaBitmap, dX, dY, dW, dH);
        ctx.restore();
      }

      // Reel overlay on static thumbnail
      if (isReel) {
        // Bottom gradient scrim
        const scrim = ctx.createLinearGradient(0, cursorY, 0, cursorY + MEDIA_H);
        scrim.addColorStop(0,   "rgba(0,0,0,0)");
        scrim.addColorStop(0.45,"rgba(0,0,0,0.15)");
        scrim.addColorStop(1,   "rgba(0,0,0,0.82)");
        ctx.fillStyle = scrim;
        ctx.fillRect(0, cursorY, W, MEDIA_H);

        // Logo pill — top left
        if (logoBitmap) {
          const lH = 36 * SCALE;
          const lW = (logoBitmap.naturalWidth / logoBitmap.naturalHeight) * lH;
          const lPad = 6 * SCALE;
          const lx = PAD, ly = cursorY + PAD;
          ctx.fillStyle = "rgba(255,255,255,0.92)";
          roundRect(ctx, lx - lPad, ly - lPad * 0.6, lW + lPad * 2, lH + lPad * 1.2, 20 * SCALE);
          ctx.fill();
          ctx.drawImage(logoBitmap, lx, ly, lW, lH);
        }

        // "REEL" badge — top right
        const badgeText = "● REEL";
        const badgeFontSize = 11 * SCALE;
        ctx.font = `700 ${badgeFontSize}px 'Segoe UI', Arial, sans-serif`;
        const badgeW = ctx.measureText(badgeText).width + 20 * SCALE;
        const badgeH = badgeFontSize + 14 * SCALE;
        const bx = W - PAD - badgeW, by = cursorY + PAD;
        ctx.fillStyle = "rgba(220,38,38,0.9)";
        roundRect(ctx, bx, by, badgeW, badgeH, badgeH / 2);
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(badgeText, bx + badgeW / 2, by + badgeH / 2);

        // Title — large, bottom of media area
        const titleFontSize = 22 * SCALE;
        ctx.font = `800 ${titleFontSize}px 'Segoe UI', Arial, sans-serif`;
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.shadowColor = "rgba(0,0,0,0.9)";
        ctx.shadowBlur  = 14 * SCALE;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 3 * SCALE;
        const titleLines = wrapTextLines(ctx, post.title || "", W - PAD * 4, 2);
        const titleLineH = titleFontSize * 1.25;
        const titleBottomY = cursorY + MEDIA_H - 36 * SCALE;
        titleLines.slice().reverse().forEach((line, i) => {
          ctx.fillText(line, W / 2, titleBottomY - i * titleLineH);
        });

        // Meta chip just above title block
        ctx.shadowBlur = 0;
        ctx.shadowColor = "transparent";
        const metaFontSize = 10 * SCALE;
        ctx.font = `600 ${metaFontSize}px 'Segoe UI', Arial, sans-serif`;
        const metaStr = `${post.category.replace(/_/g, " ").toUpperCase()}  •  ${new Date(post.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
        const metaW = ctx.measureText(metaStr).width + 24 * SCALE;
        const metaH = metaFontSize + 12 * SCALE;
        const metaX = (W - metaW) / 2;
        const metaY = titleBottomY - titleLines.length * titleLineH - metaH - 10 * SCALE;
        ctx.fillStyle = `${categoryHex}CC`; // category color at ~80% opacity
        roundRect(ctx, metaX, metaY, metaW, metaH, metaH / 2);
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(metaStr, W / 2, metaY + metaH / 2);
      }

      cursorY += MEDIA_H;

      // ── Content section ──
      ctx.fillStyle = categoryHex;
      ctx.fillRect(0, cursorY, W, CONTENT_H);

      const contentStartY = cursorY;
      const titleAreaTop = contentStartY + PAD;

      const TITLE_PAD_X  = 8  * SCALE;
      const TITLE_PAD_Y  = 8  * SCALE;
      const TITLE_FONT_SIZE = 18 * SCALE;
      ctx.font = `600 ${TITLE_FONT_SIZE}px 'Segoe UI', Arial, sans-serif`;

      const titleText  = post.title || "Untitled Post";
      const titleW     = Math.min(ctx.measureText(titleText).width + TITLE_PAD_X * 2, W - PAD * 2);
      const titleH     = TITLE_FONT_SIZE + TITLE_PAD_Y * 2;

      ctx.fillStyle = "#F3F4F6";
      roundRect(ctx, PAD, titleAreaTop, titleW, titleH, 8 * SCALE);
      ctx.fill();

      ctx.fillStyle    = "#111827";
      ctx.textAlign    = "left";
      ctx.textBaseline = "top";
      ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
      ctx.fillText(titleText, PAD + TITLE_PAD_X, titleAreaTop + TITLE_PAD_Y);

      const metaTop = titleAreaTop + titleH + 8 * SCALE;
      ctx.fillStyle = categoryTextHex;
      ctx.font = `400 ${12 * SCALE}px 'Segoe UI', Arial, sans-serif`;
      ctx.textBaseline = "top";
      const metaStr = `${post.post_type} • ${post.category} • ${new Date(post.created_at).toLocaleDateString()}`;
      ctx.fillText(metaStr, PAD, metaTop);

      const DESC_AREA_H = 128 * SCALE;
      const descTop = metaTop + 12 * SCALE + PAD;
      ctx.fillStyle    = categoryTextHex;
      ctx.font         = `400 ${14 * SCALE}px 'Segoe UI', Arial, sans-serif`;
      ctx.textBaseline = "top";
      ctx.textAlign    = "left";

      const maxDescLines = Math.floor(DESC_AREA_H / (14 * SCALE * 1.6));
      const descLines = wrapTextLines(ctx, post.description || "No description available.", W - PAD * 2, maxDescLines);
      const descLineH = 14 * SCALE * 1.6;
      descLines.forEach((line, i) => {
        ctx.fillText(line, PAD, descTop + i * descLineH);
      });

      const logoAreaTop = descTop + DESC_AREA_H;
      if (logoBitmap) {
        const lH = 48 * SCALE;
        const lW = logoBitmap.naturalWidth
          ? (logoBitmap.naturalWidth / logoBitmap.naturalHeight) * lH
          : lH * 3;
        ctx.drawImage(logoBitmap, W - PAD - lW, logoAreaTop, lW, lH);
      }

      cursorY = contentStartY + CONTENT_H;

      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, cursorY, W, FOOTER_H);

      ctx.fillStyle    = "#030712";
      ctx.font         = `400 ${13 * SCALE}px 'Segoe UI', Arial, sans-serif`;
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      const footerMidY = cursorY + FOOTER_H / 2;

      const contacts = ["info@oweru.com", "+255 711 890 764", "www.oweru.com"];
      const colW = W / 3;
      contacts.forEach((c, i) => {
        ctx.fillText(c, colW * i + colW / 2, footerMidY);
      });

      cursorY += FOOTER_H;

      ctx.fillStyle = categoryHex;
      ctx.fillRect(0, cursorY, W, ACCENT_H);

      ctx.restore();

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            alert("Failed to generate image. Please try again.");
            setDownloading(false);
            return;
          }
          const url  = URL.createObjectURL(blob);
          const link = document.createElement("a");
          const slug   = (post.title || "post").replace(/[^a-z0-9]/gi, "_").substring(0, 30);
          const suffix = isCarousel ? `_slide${carouselIndex + 1}` : "";
          link.download = `Oweru_${slug}${suffix}_Post_${Date.now()}.jpg`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          setDownloading(false);
        },
        "image/jpeg",
        0.95
      );
    } catch (error) {
      console.error("Error generating branded post image:", error);
      alert("Failed to download post image. Please try again.");
      setDownloading(false);
    }
  };

  // ─── Download: html2canvas screenshot ────────────────────────────────────────
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

      canvas.toBlob(
        (blob) => {
          const url  = URL.createObjectURL(blob);
          const link = document.createElement("a");
          const sanitizedTitle = post.title.replace(/[^a-z0-9]/gi, "_").substring(0, 30);
          link.download = `Oweru_${sanitizedTitle}_${Date.now()}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          setDownloading(false);
        },
        "image/png",
        0.95
      );
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to download image. Please try again.");
      setDownloading(false);
      const shareBtn = cardRef.current?.querySelector(".share-button-container");
      if (shareBtn) shareBtn.style.display = "block";
    }
  };

  // ─── Download: raw media files ────────────────────────────────────────────────
  const handleDownloadMedia = async () => {
    setDownloading(true);
    setShowShareMenu(false);
    try {
      const mediaToDownload =
        post.post_type === "Reel" && videos.length > 0 ? videos : images;

      if (mediaToDownload.length === 0) {
        alert("No media files available to download.");
        setDownloading(false);
        return;
      }

      for (let i = 0; i < mediaToDownload.length; i++) {
        const media = mediaToDownload[i];
        const ext = media.file_type === "video"
          ? "mp4"
          : getMediaUrl(media).endsWith(".png") ? "png" : "jpg";
        const sanitizedTitle = post.title.replace(/[^a-z0-9]/gi, "_").substring(0, 30);
        const fileName = `Oweru_${sanitizedTitle}_${i + 1}_${Date.now()}.${ext}`;

        try {
          const dataUrl  = await fetchMediaAsDataUrl(media);
          const res      = await fetch(dataUrl);
          const blob     = await res.blob();
          const mimeType = media.file_type === "video" ? "video/mp4" : blob.type || "image/jpeg";
          const typedBlob  = new Blob([blob], { type: mimeType });
          const objectUrl  = URL.createObjectURL(typedBlob);
          const link = document.createElement("a");
          link.href     = objectUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
        } catch (itemErr) {
          console.error(`Failed to download media item ${i}:`, itemErr);
          alert(`Failed to download file ${i + 1}. Please try again.`);
        }

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

  // ─── Download: Branded Reel Video ────────────────────────────────────────────
  const handleDownloadVideo = async () => {
    setDownloading(true);
    setShowShareMenu(false);

    if (videos.length === 0) {
      alert("No video available to download.");
      setDownloading(false);
      return;
    }

    try {
      // Fetch video blob
      let videoBlobUrl;
      try {
        const dataUrl = await fetchMediaAsDataUrl(videos[0]);
        const res     = await fetch(dataUrl);
        const blob    = await res.blob();
        videoBlobUrl  = URL.createObjectURL(blob);
      } catch {
        videoBlobUrl = getMediaUrl(videos[0]);
      }

      // Hidden video element
      const srcVideo = document.createElement("video");
      srcVideo.src         = videoBlobUrl;
      srcVideo.muted       = false;
      srcVideo.crossOrigin = "anonymous";
      srcVideo.preload     = "auto";
      srcVideo.style.cssText = "position:fixed;left:-9999px;top:0;width:1px;height:1px;";
      document.body.appendChild(srcVideo);

      await new Promise((resolve, reject) => {
        srcVideo.onloadedmetadata = resolve;
        srcVideo.onerror = reject;
        srcVideo.load();
      });

      const VW = srcVideo.videoWidth  || 1080;
      const VH = srcVideo.videoHeight || 1920;

      const logoBitmap = await loadImage(oweruLogo).catch(() => null);

      // ── Layout constants (proportional to video dimensions) ──
      const PAD_V   = VW * 0.04;
      const BASE    = VW / 390;

      // Logo
      const LOGO_H  = VH * 0.048;
      const LOGO_W  = logoBitmap
        ? (logoBitmap.naturalWidth / logoBitmap.naturalHeight) * LOGO_H
        : LOGO_H * 3;
      const LOGO_PAD = VW * 0.012;

      // Fonts
      const TITLE_FS   = Math.round(24 * BASE);
      const META_FS    = Math.round(11 * BASE);
      const DESC_FS    = Math.round(14 * BASE);
      const LINE_H     = DESC_FS * 1.65;
      const OVERLAY_W  = Math.min(VW * 0.82, 420 * BASE);

      // Pre-wrap description
      const offCtx = document.createElement("canvas").getContext("2d");
      offCtx.font = `500 ${DESC_FS}px 'Segoe UI', Arial, sans-serif`;
      const descLines = wrapTextLines(offCtx, post.description || "", OVERLAY_W, 4);

      // Bottom block heights
      const BLOCK_PAD     = 20 * BASE;
      const TITLE_LINE_H  = TITLE_FS * 1.25;
      const titleLines    = wrapTextLines(offCtx, post.title || "", OVERLAY_W, 2);

      // Heights of each block
      const metaBadgeH    = META_FS + 14 * BASE;
      const titleBlockH   = titleLines.length * TITLE_LINE_H;
      const descBoxPadY   = 14 * BASE;
      const descBoxPadX   = 18 * BASE;
      const descBoxH      = descLines.length * LINE_H + descBoxPadY * 2;
      const totalH = metaBadgeH + BLOCK_PAD * 0.5 + titleBlockH + BLOCK_PAD + descBoxH;
      const blockBottomY  = VH - PAD_V * 2; // bottom margin
      const blockTopY     = blockBottomY - totalH;

      // Offscreen canvas
      const canvas = document.createElement("canvas");
      canvas.width  = VW;
      canvas.height = VH;
      const ctx = canvas.getContext("2d");

      // ── Overlay draw (every frame) ──────────────────────────────────────────
      const drawOverlay = () => {
        // Bottom gradient scrim — tall, cinematic
        const scrim = ctx.createLinearGradient(0, VH * 0.3, 0, VH);
        scrim.addColorStop(0,    "rgba(0,0,0,0)");
        scrim.addColorStop(0.35, "rgba(0,0,0,0.18)");
        scrim.addColorStop(0.7,  "rgba(0,0,0,0.6)");
        scrim.addColorStop(1,    "rgba(0,0,0,0.88)");
        ctx.fillStyle = scrim;
        ctx.fillRect(0, 0, VW, VH);

        // ── Logo pill — top left ──
        if (logoBitmap) {
          const lx = PAD_V, ly = PAD_V;
          ctx.fillStyle = "rgba(255,255,255,0.92)";
          roundRect(ctx, lx - LOGO_PAD, ly - LOGO_PAD * 0.6,
            LOGO_W + LOGO_PAD * 2, LOGO_H + LOGO_PAD * 1.2, 24 * BASE);
          ctx.fill();
          ctx.drawImage(logoBitmap, lx, ly, LOGO_W, LOGO_H);
        }

        // ── REEL badge — top right ──
        const badgeFS = Math.round(10 * BASE);
        ctx.font = `700 ${badgeFS}px 'Segoe UI', Arial, sans-serif`;
        const badgeLabel = "● REEL";
        const badgeW = ctx.measureText(badgeLabel).width + 20 * BASE;
        const badgeH = badgeFS + 14 * BASE;
        const bx = VW - PAD_V - badgeW;
        const by = PAD_V;
        ctx.fillStyle = "rgba(220,38,38,0.88)";
        roundRect(ctx, bx, by, badgeW, badgeH, badgeH / 2);
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(badgeLabel, bx + badgeW / 2, by + badgeH / 2);

        // ── Meta badge ──
        let curY = blockTopY;
        const metaStr = `${post.category.replace(/_/g, " ").toUpperCase()}  •  ${new Date(post.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
        ctx.font = `600 ${META_FS}px 'Segoe UI', Arial, sans-serif`;
        const metaBW = ctx.measureText(metaStr).width + 24 * BASE;
        const metaBH = META_FS + 14 * BASE;
        const metaBX = (VW - metaBW) / 2;
        ctx.fillStyle = `${categoryHex}DD`;
        roundRect(ctx, metaBX, curY, metaBW, metaBH, metaBH / 2);
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
        ctx.fillText(metaStr, VW / 2, curY + metaBH / 2);

        curY += metaBH + BLOCK_PAD * 0.5;

        // ── Title lines ──
        ctx.font = `800 ${TITLE_FS}px 'Segoe UI', Arial, sans-serif`;
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.shadowColor   = "rgba(0,0,0,0.85)";
        ctx.shadowBlur    = TITLE_FS * 0.5;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = TITLE_FS * 0.06;
        titleLines.forEach((line, i) => {
          ctx.fillText(line, VW / 2, curY + i * TITLE_LINE_H);
        });
        curY += titleLines.length * TITLE_LINE_H + BLOCK_PAD;

        // ── Description frosted card ──
        ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
        const descBoxX = (VW - OVERLAY_W) / 2 - descBoxPadX;
        const descBoxW = OVERLAY_W + descBoxPadX * 2;
        ctx.fillStyle = "rgba(0,0,0,0.42)";
        roundRect(ctx, descBoxX, curY, descBoxW, descBoxH, 12 * BASE);
        ctx.fill();

        // frosted border
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.lineWidth   = 1.5 * BASE;
        roundRect(ctx, descBoxX, curY, descBoxW, descBoxH, 12 * BASE);
        ctx.stroke();

        ctx.font = `400 ${DESC_FS}px 'Segoe UI', Arial, sans-serif`;
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.shadowColor   = "rgba(0,0,0,0.6)";
        ctx.shadowBlur    = 6 * BASE;
        descLines.forEach((line, i) => {
          ctx.fillText(line, VW / 2, curY + descBoxPadY + i * LINE_H);
        });

        ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
      };

      // Set up MediaRecorder
      const fps = Math.min(srcVideo.playbackRate || 30, 30);
      let combinedStream;
      try {
        const audioCtx  = new AudioContext();
        const srcNode   = audioCtx.createMediaElementSource(srcVideo);
        const dest      = audioCtx.createMediaStreamDestination();
        srcNode.connect(dest);
        srcNode.connect(audioCtx.destination);
        combinedStream = new MediaStream([
          ...canvas.captureStream(fps).getTracks(),
          ...dest.stream.getTracks(),
        ]);
      } catch {
        combinedStream = canvas.captureStream(fps);
      }

      const mimeType = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"]
        .find((m) => MediaRecorder.isTypeSupported(m)) || "video/webm";

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 4_000_000,
      });
      const chunks = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      let rafId;
      const renderFrame = () => {
        if (srcVideo.paused || srcVideo.ended) return;
        ctx.drawImage(srcVideo, 0, 0, VW, VH);
        drawOverlay();
        rafId = requestAnimationFrame(renderFrame);
      };

      recorder.start(100);
      srcVideo.currentTime = 0;
      await srcVideo.play();
      renderFrame();

      await new Promise((resolve) => {
        srcVideo.onended = resolve;
        setTimeout(resolve, (srcVideo.duration || 60) * 1000 + 5000);
      });

      cancelAnimationFrame(rafId);
      recorder.stop();

      await new Promise((resolve) => { recorder.onstop = resolve; });

      const finalBlob = new Blob(chunks, { type: mimeType });
      const url  = URL.createObjectURL(finalBlob);
      const link = document.createElement("a");
      const sanitizedTitle = (post.title || "reel").replace(/[^a-z0-9]/gi, "_").substring(0, 30);
      link.download = `Oweru_${sanitizedTitle}_Branded_Reel_${Date.now()}.webm`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 10_000);

      srcVideo.pause();
      document.body.removeChild(srcVideo);
      if (videoBlobUrl.startsWith("blob:")) URL.revokeObjectURL(videoBlobUrl);

    } catch (error) {
      console.error("Branded reel download error:", error);
      alert("Failed to generate branded reel. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const isReelPost = post.post_type === "Reel" && videos.length > 0;

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Instagram status notification */}
      {instagramStatus && (
        <div
          className={`fixed top-4 right-4 z-50 max-w-sm rounded-xl shadow-2xl p-4 flex items-start gap-3 text-white ${
            instagramStatus.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {instagramStatus.type === "success" ? <Check size={18} /> : <X size={18} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{instagramStatus.message}</p>
            {instagramStatus.permalink && (
              <a
                href={instagramStatus.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline mt-1 block hover:text-white/80"
              >
                View on Instagram →
              </a>
            )}
          </div>
          <button onClick={() => setInstagramStatus(null)} className="text-white hover:text-gray-200 flex-shrink-0">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Card */}
      <div
        ref={cardRef}
        className={`shadow-lg overflow-hidden border border-gray-200 ${getCategoryBackground(post.category)} rounded-lg flex flex-col relative h-[700px]`}
      >
        {/* ── Media Section ── */}
        <div className="w-full h-64 flex-shrink-0">

          {/* Static */}
          {post.post_type === "Static" && (
            <div className="w-full h-full flex items-center justify-center bg-black">
              {images.length > 0 ? (
                <img
                  src={getCachedMediaUrl(images[0])}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
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
              <div className="w-full h-full flex flex-col">
                <div className="relative w-full h-full">
                  <img
                    src={getCachedMediaUrl(images[carouselIndex])}
                    alt={`${post.title} - Image ${carouselIndex + 1}`}
                    className="w-full h-full object-cover bg-black"
                    loading="lazy"
                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCarouselIndex((prev) => (prev - 1 + images.length) % images.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full hover:bg-opacity-70"
                      >‹</button>
                      <button
                        onClick={() => setCarouselIndex((prev) => (prev + 1) % images.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full hover:bg-opacity-70"
                      >›</button>
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
                          src={getCachedMediaUrl(img)}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-10 h-10 object-cover rounded"
                          loading="lazy"
                          onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <p className="text-white text-center px-4">No valid images available</p>
              </div>
            )
          )}

          {/* ── REEL — polished cinematic overlay ── */}
          {post.post_type === "Reel" && (
            videos.length > 0 ? (
              <div className={`relative w-full h-full ${getCategoryBackground(post.category)}`}>
                <video
                  ref={videoRef}
                  controls
                  preload="metadata"
                  playsInline
                  muted={false}
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover"
                  onError={() => {
                    setVideoError(true);
                    console.error("Video load error:", getMediaUrl(videos[0]));
                  }}
                  onLoadStart={() => setVideoError(false)}
                >
                  <source
                    src={getMediaUrl(videos[0])}
                    type={videos[0].mime_type || "video/mp4"}
                  />
                  Your browser does not support the video tag.
                </video>

                {videoError && (
                  <div className="absolute top-0 left-0 right-0 p-3 bg-red-50 border border-red-200 text-sm z-20">
                    <p className="text-red-700 font-semibold mb-1">Video failed to load</p>
                    <p className="text-red-600 text-xs mb-2 break-all">URL: {getMediaUrl(videos[0])}</p>
                    <a href={getMediaUrl(videos[0])} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">
                      Open video directly
                    </a>
                  </div>
                )}

                {/* Bottom gradient scrim */}
                <div
                  className="absolute inset-0 pointer-events-none z-[5]"
                  style={{
                    background: "linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,0.18) 55%, rgba(0,0,0,0.72) 100%)",
                  }}
                />

                {/* Logo — top left, white pill */}
                <div className="absolute top-3 left-3 z-10 flex items-center">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg flex items-center">
                    <img
                      src={oweruLogo}
                      alt="Oweru logo"
                      className="h-7 w-auto"
                    />
                  </div>
                </div>

                {/* REEL badge — top right */}
                <div className="absolute top-3 right-3 z-10">
                  <span className="inline-flex items-center gap-1.5 bg-red-600/90 backdrop-blur-sm text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
                    REEL
                  </span>
                </div>

                {/* Bottom content block — title, meta badge, description */}
                <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-4 pointer-events-none">
                  {/* Meta chip */}
                  <div className="flex justify-center mb-2">
                    <span
                      className="inline-block text-white text-[10px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
                      style={{ backgroundColor: `${categoryHex}CC` }}
                    >
                      {post.category.replace(/_/g, " ")} &nbsp;•&nbsp; {new Date(post.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    className="text-white text-xl font-extrabold text-center leading-tight mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                    style={{ WebkitTextStroke: "0.3px rgba(0,0,0,0.4)" }}
                  >
                    {post.title}
                  </h3>

                  {/* Description — frosted card */}
                  <div
                    className="rounded-xl px-4 py-3 text-white/90 text-xs text-center leading-relaxed"
                    style={{
                      background: "rgba(0,0,0,0.42)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                    }}
                  >
                    <p className="line-clamp-3 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                      {post.description}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <p className="text-white text-center px-4">No valid video available</p>
              </div>
            )
          )}
        </div>

        {/* ── Content Section (hidden for Reel) ── */}
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

            <div className="px-4 py-4 h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 flex-shrink-0">
              <p className={`${getCategoryTextColor(post.category)} text-left whitespace-pre-wrap text-sm leading-relaxed`}>
                {post.description}
              </p>
            </div>

            <div className="px-4 pb-3 flex justify-end items-center">
              <img src={oweruLogo} alt="Oweru logo" className="h-12 w-auto shadow-lg" />
            </div>
          </div>
        )}

        {/* ── Contact footer ── */}
        <div className="bg-white px-6 py-3 mt-2 rounded-b-lg">
          <div className="text-center text-gray-800">
            <div className="text-sm whitespace-nowrap">
              <span className="inline-block">
                <a href="mailto:info@oweru.com" className="text-gray-950 text-sm hover:underline">info@oweru.com</a>
              </span>{" "}&nbsp;
              <span className="inline-block">
                <a href="tel:+255711890764" className="text-gray-950 hover:underline">+255 711 890 764</a>
              </span>{" "}&nbsp;
              <span className="inline-block">
                <a href="https://www.oweru.com" target="_blank" rel="noopener noreferrer" className="text-gray-950 hover:underline">www.oweru.com</a>
              </span>
            </div>
          </div>
        </div>

        {/* ── Bottom accent strip ── */}
        <div className={`${getCategoryBackground(post.category)} h-10 rounded-b-lg`} />

        {/* ── Share button ── */}
        <div className="share-button-container absolute top-3 right-3 z-10">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            disabled={downloading}
            className="bg-white hover:bg-gray-50 text-gray-900 p-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center border-2 border-gray-200 hover:border-[#C89128]"
            aria-label="Share post"
          >
            {downloading ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Share2 size={18} />
            )}
          </button>

          {showShareMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowShareMenu(false)} />
              <div className="absolute top-14 right-0 z-20 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden min-w-[220px]">
                <div className="border-t border-gray-100" />

                {isReelPost && (
                  <button
                    onClick={handleDownloadVideo}
                    disabled={downloading}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-900 transition-colors font-medium disabled:opacity-50"
                  >
                    {downloading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#C89128] border-t-transparent rounded-full animate-spin" />
                        Encoding branded reel…
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C89128" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                          <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
                          <line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/>
                          <line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/>
                          <line x1="17" y1="7" x2="22" y2="7"/>
                        </svg>
                        Download Branded Reel (video)
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={handleDownloadPostAsImage}
                  disabled={downloading}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-900 transition-colors font-medium disabled:opacity-50"
                >
                  {downloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#C89128] border-t-transparent rounded-full animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download size={16} className="text-[#C89128]" />
                      {isReelPost ? "Download Branded Post (image)" : "Download Branded Post"}
                    </>
                  )}
                </button>

                {!isReelPost && (
                  <button
                    onClick={handleDownloadMedia}
                    disabled={downloading}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-900 transition-colors font-medium disabled:opacity-50"
                  >
                    {downloading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download size={16} className="text-slate-700" />
                        Download Media Files
                      </>
                    )}
                  </button>
                )}

                <div className="border-t border-gray-100" />
                <button
                  onClick={handleCopyLink}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-900 transition-colors font-medium"
                >
                  {copied ? (
                    <><Check size={16} className="text-green-500" />Copied!</>
                  ) : (
                    <><Copy size={16} className="text-gray-400" />Copy Link</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default memo(HomePostCard);