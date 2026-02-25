import { useState, useRef } from "react";
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
  const [carouselIndex, setCarouselIndex] = useState(0);
  const videoRef = useRef(null);
  const cardRef = useRef(null);
  const downloadCardRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [postingToInstagram, setPostingToInstagram] = useState(false);
  const [instagramStatus, setInstagramStatus] = useState(null);

  const BASE_URL =
    import.meta.env.VITE_API_URL?.replace("/api", "") || "http://127.0.0.1:8000";

  const images = filterValidMedia(post.media, "image");
  const videos = filterValidMedia(post.media, "video");

  const getCategoryStyles = (category) => {
    switch (category) {
      case "rentals":
      case "lands_and_plots":
        return { bg: "bg-[#C89128]", text: "text-white", hex: "#C89128" };
      case "property_sales":
      case "property_services":
        return { bg: "bg-gray-300", text: "text-slate-700", hex: "#D1D5DB" };
      case "investment":
      case "construction_property_management":
        return { bg: "bg-slate-900", text: "text-white", hex: "#0F172A" };
      default:
        return { bg: "bg-slate-900", text: "text-white", hex: "#0F172A" };
    }
  };

  const categoryStyles = getCategoryStyles(post.category);

  const getShareUrl = () => `${window.location.origin}/post/${post.id}`;
  const getShareText = () =>
    `${post.title}\n\n${post.description}\n\nCheck out this ${post.category} property on Oweru Media!`;

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
          const response = await fetch(proxyUrl, {
            mode: "cors",
            credentials: "omit",
          });
          if (!response.ok)
            throw new Error(`${response.status} ${response.statusText}`);
          const blob = await response.blob();
          const fileName = `media_${i}.${
            media.file_type === "video" ? "mp4" : "jpg"
          }`;
          formData.append(`media[${i}]`, blob, fileName);
          mediaUploaded++;
        } catch (err) {
          console.error(`Failed to fetch media ${i}:`, err);
        }
      }

      if (mediaUploaded === 0)
        throw new Error("No media files were successfully loaded.");

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
        message:
          error.message ||
          "Failed to post to Instagram. Please try again.",
      });
    } finally {
      setPostingToInstagram(false);
    }
  };

  // ─── Share ───────────────────────────────────────────────────────────────────
  const handleShare = async (platform) => {
    const url = getShareUrl();
    const text = getShareText();

    if (
      (platform === "native" || platform === "instagram") &&
      navigator.share
    ) {
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
        window.open(
          `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
          "_blank"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&e=${encodedText}`,
          "_blank"
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
          "_blank"
        );
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

  /** Fetch a media file through your backend proxy and return a base64 data-URL */
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

  /** Load a data-URL (or regular URL) into an HTMLImageElement */
  const loadImage = (src) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null); // gracefully handle failures
      img.src = src;
    });

  /** Capture the first frame of a video element onto a canvas and return a data-URL */
  const captureVideoFrame = (videoEl) =>
    new Promise((resolve) => {
      // If the video already has a frame ready, grab it immediately
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
        // HAVE_CURRENT_DATA or better – can draw immediately
        attempt();
      } else {
        videoEl.addEventListener("loadeddata", attempt, { once: true });
        videoEl.addEventListener("error", () => resolve(null), { once: true });
        // Seek to a safe frame
        videoEl.currentTime = 0.1;
      }
    });

  /**
   * Wrap text onto canvas lines so it never overflows the given maxWidth.
   * Returns an array of { line, x, y } objects and the total height consumed.
   */
  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(" ");
    let line = "";
    let currentY = y;
    const lines = [];
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push({ line, x, y: currentY });
        currentY += lineHeight;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push({ line, x, y: currentY });
    return { lines, totalHeight: currentY + lineHeight - y };
  };

  // ─── Download Full Branded Post (pure Canvas 2D – no html2canvas) ────────────
  const handleDownloadPostAsImage = async () => {
    setDownloading(true);
    setShowShareMenu(false);

    try {
      const SCALE       = 2;
      const W           = 600 * SCALE;
      const PAD         = 24  * SCALE;
      const MEDIA_H     = 360 * SCALE;
      const HEADER_H    = 60  * SCALE;   
      const BADGE_H     = 28  * SCALE;
      const FOOTER_H    = 80  * SCALE;
      const TEXT_AREA_W = W - PAD * 2;

      // ── 1. Which media to show ─────────────────────────────────────────────
      // Carousel → always the currently-visible slide (carouselIndex)
      // Reel     → video frame
      // Static   → first image
      const isReel      = post.post_type === "Reel"     && videos.length > 0;
      const isCarousel  = post.post_type === "Carousel" && images.length > 0;
      const primaryMedia = isReel
        ? videos[0]
        : isCarousel
          ? images[carouselIndex]   // ← currently-viewed slide
          : (images[0] ?? null);

      // ── 2. Fetch logo ──────────────────────────────────────────────────────
      // oweruLogo is a relative asset URL resolved by Vite at build time
      const logoBitmap = await loadImage(oweruLogo).catch(() => null);

      // ── 3. Obtain media bitmap ─────────────────────────────────────────────
      let mediaBitmap = null;

      if (primaryMedia) {
        if (primaryMedia.file_type === "video") {
          // Try live videoRef first (already has a decoded frame)
          if (videoRef.current) {
            const fd = await captureVideoFrame(videoRef.current);
            if (fd) mediaBitmap = await loadImage(fd);
          }
          // Fallback: fetch via proxy → detached <video> → capture frame
          if (!mediaBitmap) {
            try {
              const dataUrl  = await fetchMediaAsDataUrl(primaryMedia);
              const tmpVideo = document.createElement("video");
              tmpVideo.muted = true;
              tmpVideo.src   = dataUrl;
              tmpVideo.style.cssText =
                "position:fixed;left:-9999px;top:0;width:1px;height:1px;";
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
          // Image: fetch via proxy → base64 data-URL → HTMLImageElement
          try {
            const dataUrl = await fetchMediaAsDataUrl(primaryMedia);
            mediaBitmap   = await loadImage(dataUrl);
          } catch (e) {
            console.warn("Proxy image fetch failed, trying direct URL:", e);
            mediaBitmap = await loadImage(getMediaUrl(primaryMedia));
          }
        }
      }

      // ── 4. Pre-measure text heights ───────────────────────────────────────
      const tmpCtx          = document.createElement("canvas").getContext("2d");
      const TITLE_FS        = 22 * SCALE;
      const DESC_FS         = 14 * SCALE;
      const LH_TITLE        = TITLE_FS * 1.35;
      const LH_DESC         = DESC_FS  * 1.6;
      const BADGE_MT        = 16 * SCALE;
      const TITLE_MT        = 12 * SCALE;
      const DESC_MT         = 10 * SCALE;
      const DIVIDER_M       = 16 * SCALE;

      tmpCtx.font = `800 ${TITLE_FS}px 'Segoe UI', Arial, sans-serif`;
      const { totalHeight: titleH } = wrapText(tmpCtx, post.title || "", PAD, 0, TEXT_AREA_W, LH_TITLE);

      tmpCtx.font = `400 ${DESC_FS}px 'Segoe UI', Arial, sans-serif`;
      const { totalHeight: descH } = wrapText(tmpCtx, post.description || "", PAD, 0, TEXT_AREA_W, LH_DESC);

      const CANVAS_H =
        HEADER_H +
        MEDIA_H +
        BADGE_MT + BADGE_H +
        TITLE_MT + titleH +
        DESC_MT  + descH  +
        DIVIDER_M * 2 +
        FOOTER_H;

      // ── 5. Create canvas ───────────────────────────────────────────────────
      const canvas  = document.createElement("canvas");
      canvas.width  = W;
      canvas.height = CANVAS_H;
      const ctx     = canvas.getContext("2d");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, CANVAS_H);

      let cursorY = 0;

      // ── 6. Header bar with logo ────────────────────────────────────────────
      ctx.fillStyle = categoryStyles.hex;
      ctx.fillRect(0, cursorY, W, HEADER_H);

      // Logo on the LEFT (40 px tall, proportional width, vertically centred)
      if (logoBitmap) {
        const logoH  = 40 * SCALE;
        const logoW  = logoBitmap.naturalWidth
          ? (logoBitmap.naturalWidth / logoBitmap.naturalHeight) * logoH
          : logoH * 3; // rough fallback aspect ratio
        const logoY  = cursorY + (HEADER_H - logoH) / 2;
        ctx.drawImage(logoBitmap, PAD, logoY, logoW, logoH);
      } else {
        // Fallback text if logo didn't load
        ctx.fillStyle    = "#ffffff";
        ctx.font         = `800 ${14 * SCALE}px 'Segoe UI', Arial, sans-serif`;
        ctx.textBaseline = "middle";
        ctx.textAlign    = "left";
        ctx.fillText("OWERU MEDIA", PAD, cursorY + HEADER_H / 2);
      }

      // Category + date on the RIGHT
      ctx.fillStyle    = "#ffffff";
      ctx.font         = `700 ${11 * SCALE}px 'Segoe UI', Arial, sans-serif`;
      ctx.textBaseline = "middle";
      ctx.textAlign    = "right";
      ctx.fillText(
        (post.category || "").replace(/_/g, " ").toUpperCase(),
        W - PAD,
        cursorY + HEADER_H / 2 - 9 * SCALE
      );
      ctx.globalAlpha = 0.75;
      ctx.font        = `400 ${10 * SCALE}px 'Segoe UI', Arial, sans-serif`;
      ctx.fillText(
        new Date(post.created_at).toLocaleDateString("en-GB", {
          day: "2-digit", month: "short", year: "numeric",
        }),
        W - PAD,
        cursorY + HEADER_H / 2 + 9 * SCALE
      );
      ctx.globalAlpha = 1;

      cursorY += HEADER_H;

      // ── 7. Media area ─────────────────────────────────────────────────────
      ctx.fillStyle = "#111111";
      ctx.fillRect(0, cursorY, W, MEDIA_H);

      if (mediaBitmap) {
        // cover-fit: scale to fill the area, crop overflow via clip
        const bW    = mediaBitmap.naturalWidth  || mediaBitmap.width  || 1;
        const bH    = mediaBitmap.naturalHeight || mediaBitmap.height || 1;
        const scale = Math.max(W / bW, MEDIA_H / bH);
        const dW    = bW * scale;
        const dH    = bH * scale;
        const dX    = (W  - dW) / 2;
        const dY    = cursorY + (MEDIA_H - dH) / 2;

        ctx.save();
        ctx.beginPath();
        ctx.rect(0, cursorY, W, MEDIA_H);
        ctx.clip();
        ctx.drawImage(mediaBitmap, dX, dY, dW, dH);
        ctx.restore();
      } else {
        ctx.fillStyle    = "#374151";
        ctx.font         = `400 ${14 * SCALE}px 'Segoe UI', Arial, sans-serif`;
        ctx.textAlign    = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("No media available", W / 2, cursorY + MEDIA_H / 2);
      }

      // Video overlay: just a thin bottom strip so the frame is clearly visible
      if (isReel && mediaBitmap) {
        // Very subtle gradient at the bottom only
        const grad = ctx.createLinearGradient(0, cursorY + MEDIA_H - 60 * SCALE, 0, cursorY + MEDIA_H);
        grad.addColorStop(0, "rgba(0,0,0,0)");
        grad.addColorStop(1, "rgba(0,0,0,0.55)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, cursorY + MEDIA_H - 60 * SCALE, W, 60 * SCALE);

        // Small "▶ REEL" pill bottom-left
        const pillH  = 22 * SCALE;
        const pillPX = 10 * SCALE;
        ctx.font     = `700 ${10 * SCALE}px 'Segoe UI', Arial, sans-serif`;
        const pillTW = ctx.measureText("▶  REEL").width;
        const pillW  = pillTW + pillPX * 2;
        const pillX  = PAD;
        const pillY  = cursorY + MEDIA_H - pillH - 10 * SCALE;
        const pillR  = pillH / 2;
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.beginPath();
        ctx.moveTo(pillX + pillR, pillY);
        ctx.arcTo(pillX + pillW, pillY, pillX + pillW, pillY + pillH, pillR);
        ctx.arcTo(pillX + pillW, pillY + pillH, pillX, pillY + pillH, pillR);
        ctx.arcTo(pillX, pillY + pillH, pillX, pillY, pillR);
        ctx.arcTo(pillX, pillY, pillX + pillW, pillY, pillR);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle    = "#ffffff";
        ctx.textBaseline = "middle";
        ctx.textAlign    = "left";
        ctx.fillText("▶  REEL", pillX + pillPX, pillY + pillH / 2);
      }

      // Carousel: dots showing which slide is currently shown
      if (isCarousel && images.length > 1) {
        const dotR       = 4  * SCALE;
        const dotGap     = 10 * SCALE;
        const totalDotsW = images.length * dotR * 2 + (images.length - 1) * dotGap;
        let   dotX       = (W - totalDotsW) / 2 + dotR;
        const dotY       = cursorY + MEDIA_H - 14 * SCALE;
        images.forEach((_, i) => {
          ctx.beginPath();
          ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2);
          ctx.fillStyle = i === carouselIndex ? "#ffffff" : "rgba(255,255,255,0.42)";
          ctx.fill();
          dotX += dotR * 2 + dotGap;
        });

        // "x / n" counter top-right of media
        ctx.fillStyle    = "rgba(0,0,0,0.50)";
        const counterW   = 52 * SCALE, counterH = 20 * SCALE, counterR = 6 * SCALE;
        const cX = W - PAD - counterW, cY = cursorY + 10 * SCALE;
        ctx.beginPath();
        ctx.moveTo(cX + counterR, cY);
        ctx.arcTo(cX + counterW, cY, cX + counterW, cY + counterH, counterR);
        ctx.arcTo(cX + counterW, cY + counterH, cX, cY + counterH, counterR);
        ctx.arcTo(cX, cY + counterH, cX, cY, counterR);
        ctx.arcTo(cX, cY, cX + counterW, cY, counterR);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle    = "#ffffff";
        ctx.font         = `600 ${10 * SCALE}px 'Segoe UI', Arial, sans-serif`;
        ctx.textAlign    = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          `${carouselIndex + 1} / ${images.length}`,
          cX + counterW / 2,
          cY + counterH / 2
        );
      }

      cursorY += MEDIA_H;

      // ── 8. Post-type badge ────────────────────────────────────────────────
      cursorY += BADGE_MT;
      const BADGE_FS   = 11 * SCALE;
      const BADGE_PX   = 10 * SCALE;
      ctx.font         = `700 ${BADGE_FS}px 'Segoe UI', Arial, sans-serif`;
      ctx.textBaseline = "middle";
      ctx.textAlign    = "left";
      const badgeLabel = (post.post_type || "").toUpperCase();
      const bTextW     = ctx.measureText(badgeLabel).width;
      const bW2        = bTextW + BADGE_PX * 2;
      const bR         = 4 * SCALE;

      ctx.fillStyle = categoryStyles.hex;
      ctx.beginPath();
      ctx.moveTo(PAD + bR, cursorY);
      ctx.arcTo(PAD + bW2, cursorY,          PAD + bW2, cursorY + BADGE_H, bR);
      ctx.arcTo(PAD + bW2, cursorY + BADGE_H, PAD,      cursorY + BADGE_H, bR);
      ctx.arcTo(PAD,       cursorY + BADGE_H, PAD,       cursorY,          bR);
      ctx.arcTo(PAD,       cursorY,           PAD + bW2, cursorY,          bR);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillText(badgeLabel, PAD + BADGE_PX, cursorY + BADGE_H / 2);
      cursorY += BADGE_H;

      // ── 9. Title ──────────────────────────────────────────────────────────
      cursorY += TITLE_MT;
      ctx.font         = `800 ${TITLE_FS}px 'Segoe UI', Arial, sans-serif`;
      ctx.fillStyle    = "#0f172a";
      ctx.textBaseline = "top";
      ctx.textAlign    = "left";
      const { lines: titleLines, totalHeight: tH } = wrapText(
        ctx, post.title || "", PAD, cursorY, TEXT_AREA_W, LH_TITLE
      );
      titleLines.forEach(({ line, x, y }) => ctx.fillText(line, x, y));
      cursorY += tH;

      // ── 10. Description ───────────────────────────────────────────────────
      cursorY += DESC_MT;
      ctx.font      = `400 ${DESC_FS}px 'Segoe UI', Arial, sans-serif`;
      ctx.fillStyle = "#475569";
      const { lines: descLines, totalHeight: dH } = wrapText(
        ctx, post.description || "", PAD, cursorY, TEXT_AREA_W, LH_DESC
      );
      descLines.forEach(({ line, x, y }) => ctx.fillText(line, x, y));
      cursorY += dH;

      // ── 11. Divider ───────────────────────────────────────────────────────
      cursorY += DIVIDER_M;
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth   = 1 * SCALE;
      ctx.beginPath();
      ctx.moveTo(PAD, cursorY);
      ctx.lineTo(W - PAD, cursorY);
      ctx.stroke();
      cursorY += DIVIDER_M;

      // ── 12. Footer: contact info (left) + logo repeat (right) ─────────────
      const CF   = 12 * SCALE;
      ctx.font         = `400 ${CF}px 'Segoe UI', Arial, sans-serif`;
      ctx.fillStyle    = "#64748b";
      ctx.textBaseline = "top";
      ctx.textAlign    = "left";
      ["✉  info@oweru.com", "✆  +255 711 890 764", "⌂  oweru.com"].forEach(
        (line, i) => ctx.fillText(line, PAD, cursorY + i * (CF * 1.75))
      );

      // Small logo in footer bottom-right
      if (logoBitmap) {
        const fLogoH = 30 * SCALE;
        const fLogoW = logoBitmap.naturalWidth
          ? (logoBitmap.naturalWidth / logoBitmap.naturalHeight) * fLogoH
          : fLogoH * 3;
        const fLogoX = W - PAD - fLogoW;
        const fLogoY = cursorY + (FOOTER_H - DIVIDER_M * 2 - fLogoH) / 2;
        ctx.drawImage(logoBitmap, fLogoX, fLogoY, fLogoW, fLogoH);
      }

      // ── 13. Trigger download ──────────────────────────────────────────────
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            alert("Failed to generate image. Please try again.");
            setDownloading(false);
            return;
          }
          const url  = URL.createObjectURL(blob);
          const link = document.createElement("a");
          const slug = (post.title || "post").replace(/[^a-z0-9]/gi, "_").substring(0, 30);
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

  // ─── Download card screenshot ────────────────────────────────────────────────
  const handleDownloadAsImage = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    setShowShareMenu(false);
    try {
      const shareBtn = cardRef.current.querySelector(".share-button-container");
      if (shareBtn) shareBtn.style.display = "none";
      if (videoRef.current && !videoRef.current.paused)
        videoRef.current.pause();

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
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          const sanitizedTitle = post.title
            .replace(/[^a-z0-9]/gi, "_")
            .substring(0, 30);
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
      const ext =
        media.file_type === "video"
          ? "mp4"
          : getMediaUrl(media).endsWith(".png")
          ? "png"
          : "jpg";
      const sanitizedTitle = post.title
        .replace(/[^a-z0-9]/gi, "_")
        .substring(0, 30);
      const fileName = `Oweru_${sanitizedTitle}_${i + 1}_${Date.now()}.${ext}`;

      try {
        // Fetch via proxy as a blob to avoid CORS/format issues
        const dataUrl = await fetchMediaAsDataUrl(media);

        // Convert data URL → Blob
        const res = await fetch(dataUrl);
        const blob = await res.blob();

        // Force correct MIME type so the file is playable
        const mimeType =
          media.file_type === "video" ? "video/mp4" : blob.type || "image/jpeg";
        const typedBlob = new Blob([blob], { type: mimeType });

        const objectUrl = URL.createObjectURL(typedBlob);
        const link = document.createElement("a");
        link.href = objectUrl;
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
  // ─── Download Reel as branded video (canvas composite + MediaRecorder) ────────
  const handleDownloadVideo = async () => {
    setDownloading(true);
    setShowShareMenu(false);

    if (videos.length === 0) {
      alert("No video available to download.");
      setDownloading(false);
      return;
    }

    try {
      const video    = videos[0];
      const logoImg  = await loadImage(oweruLogo).catch(() => null);

      // ── 1. Fetch video blob via proxy so we get a same-origin src ────────
      let videoSrc;
      try {
        const dataUrl = await fetchMediaAsDataUrl(video);
        videoSrc = dataUrl;
      } catch {
        // Fallback to direct URL
        videoSrc = getMediaUrl(video);
      }

      // ── 2. Create a hidden <video> element that plays the original ────────
      const srcVideo = document.createElement("video");
      srcVideo.src         = videoSrc;
      srcVideo.muted       = true;
      srcVideo.crossOrigin = "anonymous";
      srcVideo.playsInline = true;
      srcVideo.style.cssText = "position:fixed;left:-9999px;top:0;";
      document.body.appendChild(srcVideo);

      // Wait for metadata so we know duration + natural size
      await new Promise((res, rej) => {
        srcVideo.onloadedmetadata = res;
        srcVideo.onerror          = rej;
        srcVideo.load();
      });

      const vidW   = srcVideo.videoWidth  || 720;
      const vidH   = srcVideo.videoHeight || 1280;
      const duration = srcVideo.duration  || 30;

      // ── 3. Layout constants (match post card style) ───────────────────────
      // Keep the video's native aspect ratio, add header + footer bands
      const HEADER_H  = Math.round(vidH * 0.08);  // 8% of height
      const FOOTER_H  = Math.round(vidH * 0.22);  // 22% for title+desc+contacts
      const CANVAS_H  = vidH + HEADER_H + FOOTER_H;
      const CANVAS_W  = vidW;
      const PAD       = Math.round(CANVAS_W * 0.04);
      const accentHex = categoryStyles.hex;

      // ── 4. Create the composite canvas ────────────────────────────────────
      const canvas  = document.createElement("canvas");
      canvas.width  = CANVAS_W;
      canvas.height = CANVAS_H;
      const ctx     = canvas.getContext("2d");

      // Helper: draw one frame of the branded layout
      const drawFrame = () => {
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

        // ── White background ─────────────────────────────────────────────
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // ── Header bar ───────────────────────────────────────────────────
        ctx.fillStyle = accentHex;
        ctx.fillRect(0, 0, CANVAS_W, HEADER_H);

        // Logo left in header
        if (logoImg) {
          const lH = HEADER_H * 0.65;
          const lW = logoImg.naturalWidth
            ? (logoImg.naturalWidth / logoImg.naturalHeight) * lH
            : lH * 3;
          ctx.drawImage(logoImg, PAD, (HEADER_H - lH) / 2, lW, lH);
        } else {
          ctx.fillStyle    = "#ffffff";
          ctx.font         = `bold ${HEADER_H * 0.38}px 'Segoe UI', Arial, sans-serif`;
          ctx.textBaseline = "middle";
          ctx.textAlign    = "left";
          ctx.fillText("OWERU MEDIA", PAD, HEADER_H / 2);
        }

        // Category + date right in header
        ctx.fillStyle    = "#ffffff";
        ctx.textAlign    = "right";
        ctx.textBaseline = "middle";
        ctx.font = `bold ${HEADER_H * 0.30}px 'Segoe UI', Arial, sans-serif`;
        ctx.fillText(
          (post.category || "").replace(/_/g, " ").toUpperCase(),
          CANVAS_W - PAD,
          HEADER_H * 0.38
        );
        ctx.globalAlpha = 0.75;
        ctx.font = `${HEADER_H * 0.24}px 'Segoe UI', Arial, sans-serif`;
        ctx.fillText(
          new Date(post.created_at).toLocaleDateString("en-GB", {
            day: "2-digit", month: "short", year: "numeric",
          }),
          CANVAS_W - PAD,
          HEADER_H * 0.72
        );
        ctx.globalAlpha = 1;

        // ── Video frame in the middle ────────────────────────────────────
        ctx.drawImage(srcVideo, 0, HEADER_H, CANVAS_W, vidH);

        // ── Title + description overlay on the video (bottom portion) ────
        // Dark gradient from bottom of video upward
        const gradH = vidH * 0.45;
        const grad  = ctx.createLinearGradient(
          0, HEADER_H + vidH - gradH,
          0, HEADER_H + vidH
        );
        grad.addColorStop(0, "rgba(0,0,0,0)");
        grad.addColorStop(1, "rgba(0,0,0,0.82)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, HEADER_H + vidH - gradH, CANVAS_W, gradH);

        // Post-type badge pill on the video
        const badgeFS  = Math.round(vidH * 0.022);
        const badgePX  = badgeFS * 0.8;
        const badgePY  = badgeFS * 0.5;
        const badgeH   = badgeFS + badgePY * 2;
        ctx.font       = `bold ${badgeFS}px 'Segoe UI', Arial, sans-serif`;
        ctx.textBaseline = "middle";
        ctx.textAlign    = "left";
        const badgeLabel = (post.post_type || "REEL").toUpperCase();
        const badgeTW    = ctx.measureText(badgeLabel).width;
        const badgeW     = badgeTW + badgePX * 2;
        const badgeX     = PAD;
        const badgeY     = HEADER_H + vidH - gradH * 0.88;
        const badgeR     = badgeH / 2;
        ctx.fillStyle    = accentHex;
        ctx.beginPath();
        ctx.moveTo(badgeX + badgeR, badgeY);
        ctx.arcTo(badgeX + badgeW, badgeY, badgeX + badgeW, badgeY + badgeH, badgeR);
        ctx.arcTo(badgeX + badgeW, badgeY + badgeH, badgeX, badgeY + badgeH, badgeR);
        ctx.arcTo(badgeX, badgeY + badgeH, badgeX, badgeY, badgeR);
        ctx.arcTo(badgeX, badgeY, badgeX + badgeW, badgeY, badgeR);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.fillText(badgeLabel, badgeX + badgePX, badgeY + badgeH / 2);

        // Title on the video
        const titleFS  = Math.round(vidH * 0.038);
        const titleLH  = titleFS * 1.3;
        ctx.font       = `800 ${titleFS}px 'Segoe UI', Arial, sans-serif`;
        ctx.fillStyle  = "#ffffff";
        ctx.textBaseline = "top";
        const titleY   = badgeY + badgeH + titleFS * 0.6;
        const titleW   = CANVAS_W - PAD * 2;
        const { lines: tLines } = wrapText(
          ctx, post.title || "", PAD, titleY, titleW, titleLH
        );
        // Draw max 2 lines on video to avoid clutter
        tLines.slice(0, 2).forEach(({ line, x, y }) => ctx.fillText(line, x, y));

        // Description on the video (max 2 lines, smaller)
        const descFS   = Math.round(vidH * 0.026);
        const descLH   = descFS * 1.5;
        const descY    = titleY + Math.min(tLines.length, 2) * titleLH + descFS * 0.5;
        ctx.font       = `400 ${descFS}px 'Segoe UI', Arial, sans-serif`;
        ctx.fillStyle  = "rgba(255,255,255,0.85)";
        const { lines: dLines } = wrapText(
          ctx, post.description || "", PAD, descY, titleW, descLH
        );
        dLines.slice(0, 2).forEach(({ line, x, y }) => ctx.fillText(line, x, y));

        // ── Footer bar below video ───────────────────────────────────────
        const footerY = HEADER_H + vidH;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, footerY, CANVAS_W, FOOTER_H);

        // Accent top-border on footer
        ctx.fillStyle = accentHex;
        ctx.fillRect(0, footerY, CANVAS_W, 3);

        // Title again in footer (full, readable)
        const fTitleFS = Math.round(FOOTER_H * 0.18);
        const fTitleLH = fTitleFS * 1.3;
        ctx.font         = `800 ${fTitleFS}px 'Segoe UI', Arial, sans-serif`;
        ctx.fillStyle    = "#0f172a";
        ctx.textBaseline = "top";
        ctx.textAlign    = "left";
        const fTitleY    = footerY + PAD * 0.6;
        const { lines: ftLines } = wrapText(
          ctx, post.title || "", PAD, fTitleY, CANVAS_W - PAD * 2, fTitleLH
        );
        ftLines.slice(0, 2).forEach(({ line, x, y }) => ctx.fillText(line, x, y));

        // Description in footer
        const fDescFS  = Math.round(FOOTER_H * 0.12);
        const fDescLH  = fDescFS * 1.55;
        const fDescY   = fTitleY + Math.min(ftLines.length, 2) * fTitleLH + fDescFS * 0.4;
        ctx.font       = `400 ${fDescFS}px 'Segoe UI', Arial, sans-serif`;
        ctx.fillStyle  = "#475569";
        const { lines: fdLines } = wrapText(
          ctx, post.description || "", PAD, fDescY, CANVAS_W - PAD * 2, fDescLH
        );
        fdLines.slice(0, 3).forEach(({ line, x, y }) => ctx.fillText(line, x, y));

        // Contact info + logo at bottom of footer
        const contactFS  = Math.round(FOOTER_H * 0.10);
        const contactY   = footerY + FOOTER_H - PAD * 0.8 - contactFS;
        ctx.font         = `400 ${contactFS}px 'Segoe UI', Arial, sans-serif`;
        ctx.fillStyle    = "#64748b";
        ctx.textBaseline = "bottom";
        ctx.textAlign    = "left";
        ctx.fillText(
          "✉ info@oweru.com   ✆ +255 711 890 764   ⌂ oweru.com",
          PAD,
          contactY
        );

        // Logo bottom-right of footer
        if (logoImg) {
          const flH = FOOTER_H * 0.22;
          const flW = logoImg.naturalWidth
            ? (logoImg.naturalWidth / logoImg.naturalHeight) * flH
            : flH * 3;
          ctx.drawImage(logoImg, CANVAS_W - PAD - flW, contactY - flH - PAD * 0.2, flW, flH);
        }
      };

      // ── 5. Check MediaRecorder support ────────────────────────────────────
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : null;

      if (!mimeType) {
        // Browser doesn't support MediaRecorder — fall back to direct proxy download
        document.body.removeChild(srcVideo);
        const sanitizedTitle = (post.title || "reel").replace(/[^a-z0-9]/gi, "_").substring(0, 30);
        const fileName = `Oweru_${sanitizedTitle}_Reel_${Date.now()}.mp4`;
        const proxyUrl = `${BASE_URL}/api/media/download?url=${encodeURIComponent(getMediaUrl(video))}&filename=${encodeURIComponent(fileName)}`;
        const a = document.createElement("a");
        a.href = proxyUrl; a.download = fileName; a.target = "_blank";
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setDownloading(false);
        return;
      }

      // ── 6. Record the canvas while the video plays ────────────────────────
      const stream   = canvas.captureStream(30); // 30 fps
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 4_000_000, // 4 Mbps
      });
      const chunks = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      // Draw loop using requestAnimationFrame
      let rafId;
      let recording = true;
      const loop = () => {
        if (!recording) return;
        drawFrame();
        rafId = requestAnimationFrame(loop);
      };

      recorder.onstart = () => {
        srcVideo.currentTime = 0;
        srcVideo.play();
        loop();
      };

      await new Promise((resolve, reject) => {
        recorder.onstop = resolve;
        recorder.onerror = reject;

        recorder.start(100); // collect chunks every 100ms

        // Stop recording when video ends (or after duration + small buffer)
        srcVideo.onended = () => {
          recording = false;
          cancelAnimationFrame(rafId);
          recorder.stop();
        };

        // Safety timeout in case onended never fires
        setTimeout(() => {
          if (recorder.state === "recording") {
            recording = false;
            cancelAnimationFrame(rafId);
            recorder.stop();
          }
        }, (duration + 2) * 1000);
      });

      srcVideo.pause();
      document.body.removeChild(srcVideo);

      // ── 7. Save the recorded blob ─────────────────────────────────────────
      const ext      = mimeType.includes("mp4") ? "mp4" : "webm";
      const outBlob  = new Blob(chunks, { type: mimeType });
      const outUrl   = URL.createObjectURL(outBlob);
      const slug     = (post.title || "reel").replace(/[^a-z0-9]/gi, "_").substring(0, 30);
      const fileName = `Oweru_${slug}_Reel_${Date.now()}.${ext}`;
      const link     = document.createElement("a");
      link.href      = outUrl;
      link.download  = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(outUrl), 10000);

    } catch (error) {
      console.error("Branded video download error:", error);
      alert("Failed to create branded video. Please try again.");
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
            {instagramStatus.type === "success" ? (
              <Check size={18} />
            ) : (
              <X size={18} />
            )}
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
          <button
            onClick={() => setInstagramStatus(null)}
            className="text-white hover:text-gray-200 flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Card */}
      <div ref={cardRef} className="bg-white rounded-2xl shadow-lg overflow-hidden relative">

        {/* ── Media section ── */}
        <div className="relative">

          {/* Static */}
          {post.post_type === "Static" && (
            <div className="relative w-full h-80 bg-gray-100">
              {images.length > 0 ? (
                <img
                  src={getMediaUrl(images[0])}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = PLACEHOLDER_IMAGE;
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  No valid image available
                </div>
              )}
            </div>
          )}

          {/* Carousel */}
          {post.post_type === "Carousel" && (
            images.length > 0 ? (
              <div className="relative w-full h-80 bg-gray-100">
                <img
                  src={getMediaUrl(images[carouselIndex])}
                  alt={`${post.title} - ${carouselIndex + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = PLACEHOLDER_IMAGE;
                  }}
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCarouselIndex(
                          (p) => (p - 1 + images.length) % images.length
                        )
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white px-3 py-1 rounded-full font-bold"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() =>
                        setCarouselIndex((p) => (p + 1) % images.length)
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white px-3 py-1 rounded-full font-bold"
                    >
                      ›
                    </button>
                    <div className="absolute bottom-2 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                      {carouselIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-80 bg-gray-100 text-gray-400 text-sm">
                No valid images available
              </div>
            )
          )}

          {/* Reel */}
          {post.post_type === "Reel" && (
            videos.length > 0 ? (
              <div
                className="relative w-full h-96 bg-black cursor-pointer"
                onClick={() => {
                  if (videoRef.current) {
                    if (videoRef.current.paused) {
                      videoRef.current.play();
                      setIsPlaying(true);
                    } else {
                      videoRef.current.pause();
                      setIsPlaying(false);
                    }
                  }
                }}
              >
                <video
                  ref={videoRef}
                  src={getMediaUrl(videos[0])}
                  className="w-full h-full object-cover"
                  loop
                  playsInline
                  onError={() => console.error("Video load error")}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        videoRef.current?.play();
                      }}
                      className="bg-white rounded-full p-3 shadow-2xl hover:scale-110 transition-all duration-200"
                      aria-label="Play video"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="black"
                      >
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    </button>
                  </div>
                )}
                {/* Overlay for Reels */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <h3 className="text-white font-bold text-lg leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-white/70 text-xs mt-1">
                    {post.post_type} • {post.category}
                  </p>
                  <p className="text-white/80 text-sm mt-2 line-clamp-2">
                    {post.description}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 bg-gray-100 text-gray-400 text-sm">
                No valid video available
              </div>
            )
          )}
        </div>

        {/* ── Content below media (not for Reel) ── */}
        {post.post_type !== "Reel" && (
          <>
            {/* Category bar */}
            <div
              className={`${categoryStyles.bg} ${categoryStyles.text} px-4 py-2 flex items-center justify-between`}
            >
              <span className="text-xs font-bold uppercase tracking-wider">
                {post.post_type}
              </span>
              <span className="text-xs opacity-80">
                {new Date(post.created_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="p-4">
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                {post.title}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {post.category?.replace(/_/g, " ")}
              </p>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                {post.description}
              </p>

              {/* Contact info */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-3">
                <a
                  href="mailto:info@oweru.com"
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800"
                >
                  <Mail size={12} />
                  info@oweru.com
                </a>
                <a
                  href="tel:+255711890764"
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800"
                >
                  <Phone size={12} />
                  +255 711 890 764
                </a>
                <a
                  href="https://oweru.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800"
                >
                  <Globe size={12} />
                  oweru.com
                </a>
              </div>
            </div>
          </>
        )}

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
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowShareMenu(false)}
              />

              {/* Menu */}
              <div className="absolute top-14 right-0 z-20 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden min-w-[220px]">

                
                <div className="border-t border-gray-100" />

                {/* ── Download Reel as branded .webm video (only shown for Reels) ── */}
                {isReelPost && (
                  <button
                    onClick={handleDownloadVideo}
                    disabled={downloading}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-900 transition-colors font-medium disabled:opacity-50"
                  >
                    {downloading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#C89128] border-t-transparent rounded-full animate-spin" />
                        Creating branded video...
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

                {/* ── Download branded post image (ALL post types including Reel) ── */}
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

                {/* ── Screenshot of the live card (non-Reel only) ── */}
                {!isReelPost && (
                  <>
                   

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
                  </>
                )}

                {/* Copy link */}
                <div className="border-t border-gray-100" />
                <button
                  onClick={handleCopyLink}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-900 transition-colors font-medium"
                >
                  {copied ? (
                    <>
                      <Check size={16} className="text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={16} className="text-gray-400" />
                      Copy Link
                    </>
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

export default HomePostCard;