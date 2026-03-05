import { useState, useRef, memo } from "react";
import { Copy, Check, Share2, Download, X } from "lucide-react";
import oweruLogo from "../../assets/oweru_logo.png";
import html2canvas from "html2canvas";
import {
  getMediaUrl,
  filterValidMedia,
  PLACEHOLDER_IMAGE,
} from "../../utils/mediaUtils";

const HomePostCard = ({ post }) => {
  const videoRef = useRef(null);
  const cardRef  = useRef(null);
  const [videoError,       setVideoError]       = useState(false);
  const [showShareMenu,    setShowShareMenu]     = useState(false);
  const [copied,           setCopied]            = useState(false);
  const [downloading,      setDownloading]       = useState(false);
  const [downloadProgress, setDownloadProgress]  = useState(0);
  const [instagramStatus,  setInstagramStatus]   = useState(null);
  const [carouselIndex,    setCarouselIndex]     = useState(0);
  const [imageCache,       setImageCache]        = useState(new Map());

  const BASE_URL =
    import.meta.env.VITE_API_URL?.replace("/api", "") || "http://31.97.176.48:8081";

  const images = filterValidMedia(post.media, "image");
  const videos = filterValidMedia(post.media, "video");

  // ─── Category styles (UNCHANGED) ───────────────────────────────────────────
  const getCategoryBackground = (c) => {
    switch (c) {
      case "rentals": case "lands_and_plots":                        return "bg-[#C89128]";
      case "property_sales": case "property_services":               return "bg-gray-300";
      case "construction_property_management": case "investment":    return "bg-slate-900";
      default:                                                       return "bg-slate-900";
    }
  };
  const getCategoryTextColor = (c) => {
    switch (c) {
      case "rentals": case "lands_and_plots":                        return "text-gray-100";
      case "property_sales": case "property_services":               return "text-gray-800";
      case "construction_property_management": case "investment":    return "text-white";
      default:                                                       return "text-white";
    }
  };
  const getCategoryHex = (c) => {
    switch (c) {
      case "rentals": case "lands_and_plots":                        return "#C89128";
      case "property_sales": case "property_services":               return "#D1D5DB";
      case "construction_property_management": case "investment":    return "#0F172A";
      default:                                                       return "#0F172A";
    }
  };
  const getCategoryTextHex = (c) => {
    switch (c) {
      case "rentals": case "lands_and_plots":                        return "#F3F4F6";
      case "property_sales": case "property_services":               return "#1F2937";
      case "construction_property_management": case "investment":    return "#FFFFFF";
      default:                                                       return "#FFFFFF";
    }
  };

  const categoryHex     = getCategoryHex(post.category);
  const categoryTextHex = getCategoryTextHex(post.category);

  // ─── Utility helpers ─────────────────────────────────────────────────────────
  const getShareUrl  = () => `${window.location.origin}/post/${post.id}`;
  const getShareText = () =>
    `${post.title}\n\n${post.description}\n\nCheck out this ${post.category} property on Oweru Media!`;

  const getCachedMediaUrl = (media) => {
    const key = `${media.id}-${media.updated_at || media.created_at}`;
    if (imageCache.has(key)) return imageCache.get(key);
    const url = getMediaUrl(media);
    setImageCache(prev => new Map(prev).set(key, url));
    return url;
  };

  const fetchMediaAsDataUrl = async (media) => {
    let p = media.url
      ? media.url.replace(/^https?:\/\/[^/]+\/storage\//, "")
      : media.file_path?.startsWith("/") ? media.file_path.substring(1) : media.file_path;
    if (!p) throw new Error("Media has no url or file_path");
    const res = await fetch(`${BASE_URL}/api/proxy/media/${p}`, { mode: "cors", credentials: "omit" });
    if (!res.ok) throw new Error(`Proxy fetch failed: ${res.status}`);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload  = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  };

  const loadImage = (src) =>
    new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload  = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });

  const wrapTextLines = (ctx, text, maxWidth, maxLines = null) => {
    const lines = [];
    for (const para of text.split("\n")) {
      if (!para.trim()) { lines.push(""); continue; }
      let line = "";
      for (const word of para.split(" ")) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; }
        else line = test;
      }
      if (line) lines.push(line);
    }
    if (maxLines && lines.length > maxLines) {
      const t = lines.slice(0, maxLines);
      t[t.length - 1] = t[t.length - 1].replace(/\s+\S*$/, "") + "…";
      return t;
    }
    return lines;
  };

  const roundRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  // ─── Share / Copy ────────────────────────────────────────────────────────────
  const handleCopyLink = async () => {
    const txt = `${getShareText()}\n\n${getShareUrl()}`;
    try { await navigator.clipboard.writeText(txt); }
    catch {
      const ta = document.createElement("textarea");
      ta.value = txt; document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); document.body.removeChild(ta);
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
    setShowShareMenu(false);
  };

  // ─── Instagram ──────────────────────────────────────────────────────────────
  const handlePostToInstagram = async () => {
    setInstagramStatus(null); setShowShareMenu(false);
    try {
      const fd = new FormData();
      const type = post.post_type === "Carousel" ? "carousel"
        : post.post_type === "Reel" && videos.length ? "reel" : "feed";
      const media = type === "reel" ? videos : images;
      let uploaded = 0;
      for (let i = 0; i < media.length; i++) {
        const m = media[i];
        const p2 = m.url
          ? m.url.replace(/^https?:\/\/[^/]+\/storage\//, "")
          : m.file_path?.startsWith("/") ? m.file_path.substring(1) : m.file_path;
        if (!p2) continue;
        try {
          const r = await fetch(`${BASE_URL}/api/proxy/media/${p2}`, { mode: "cors", credentials: "omit" });
          if (!r.ok) throw new Error(r.status);
          fd.append(`media[${i}]`, await r.blob(), `media_${i}.${m.file_type === "video" ? "mp4" : "jpg"}`);
          uploaded++;
        } catch (e) { console.error(e); }
      }
      if (!uploaded) throw new Error("No media loaded.");
      fd.append("caption", `${post.title}\n\n${post.description}\n\n📍 ${post.category}\n\n#OweruMedia #RealEstate #Property #Tanzania`);
      fd.append("post_type", type); fd.append("post_id", post.id);
      const r2 = await fetch(`${BASE_URL}/api/instagram/post`, { method: "POST", body: fd });
      if (!r2.headers.get("content-type")?.includes("application/json")) throw new Error("Non-JSON response.");
      const d = await r2.json();
      if (r2.ok && d.success) setInstagramStatus({ type: "success", message: d.message || "Posted!", permalink: d.permalink });
      else throw new Error(d.message || "Failed.");
    } catch (e) { setInstagramStatus({ type: "error", message: e.message }); }
  };

  // ─── Download: Static branded post image ────────────────────────────────────
  const handleDownloadPostAsImage = async () => {
    setDownloading(true); setShowShareMenu(false);
    try {
      const S = 2, W = 600*S, H = 700*S, PAD = 16*S, R = 8*S;
      const MH = 256*S, AH = 40*S, FH = 48*S, CH = H - MH - FH - AH;
      const isReel = post.post_type === "Reel" && videos.length > 0;
      const isCarousel = post.post_type === "Carousel";
      const pMedia = isReel ? videos[0] : isCarousel ? images[carouselIndex] : images[0] ?? null;
      const logo = await loadImage(oweruLogo).catch(() => null);
      let img = null;
      if (pMedia) {
        if (pMedia.file_type === "video" && videoRef.current) {
          const tmp = document.createElement("canvas");
          tmp.width = videoRef.current.videoWidth || 640;
          tmp.height = videoRef.current.videoHeight || 360;
          try { tmp.getContext("2d").drawImage(videoRef.current,0,0); img = await loadImage(tmp.toDataURL("image/jpeg",.9)); } catch {}
        } else {
          try { img = await loadImage(await fetchMediaAsDataUrl(pMedia)); }
          catch { img = await loadImage(getMediaUrl(pMedia)); }
        }
      }

      const c = document.createElement("canvas"); c.width = W; c.height = H;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#FFF"; roundRect(ctx,0,0,W,H,R); ctx.fill();
      ctx.save(); roundRect(ctx,0,0,W,H,R); ctx.clip();

      let cy = 0;
      // Media
      ctx.fillStyle = "#111"; ctx.fillRect(0,cy,W,MH);
      if (img) {
        const bw = img.naturalWidth||1, bh = img.naturalHeight||1;
        const s2 = Math.max(W/bw, MH/bh), dw = bw*s2, dh = bh*s2;
        ctx.save(); ctx.beginPath(); ctx.rect(0,cy,W,MH); ctx.clip();
        ctx.drawImage(img,(W-dw)/2,cy+(MH-dh)/2,dw,dh); ctx.restore();
      }
      if (isReel) {
        const scrim = ctx.createLinearGradient(0,cy,0,cy+MH);
        scrim.addColorStop(0,"rgba(0,0,0,0)"); scrim.addColorStop(.5,"rgba(0,0,0,.25)"); scrim.addColorStop(1,"rgba(0,0,0,.88)");
        ctx.fillStyle = scrim; ctx.fillRect(0,cy,W,MH);
        // Logo pill
        if (logo) {
          const lH=30*S, lW=(logo.naturalWidth/logo.naturalHeight)*lH, lp=7*S;
          ctx.fillStyle="rgba(255,255,255,.95)"; roundRect(ctx,PAD-lp,cy+PAD-lp*.5,lW+lp*2,lH+lp,36*S); ctx.fill();
          ctx.drawImage(logo,PAD,cy+PAD,lW,lH);
        }
        // REEL badge
        const bfs=9*S; ctx.font=`700 ${bfs}px Georgia,serif`;
        const bl="REEL", bw2=ctx.measureText(bl).width+18*S, bh2=bfs+12*S, bx2=W-PAD-bw2, by2=cy+PAD;
        ctx.fillStyle="#DC2626"; roundRect(ctx,bx2,by2,bw2,bh2,bh2/2); ctx.fill();
        ctx.fillStyle="#FFF"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(bl,bx2+bw2/2,by2+bh2/2);
        // Title
        const tfs=19*S; ctx.font=`700 ${tfs}px Georgia,serif`;
        ctx.fillStyle="#FFF"; ctx.textAlign="center"; ctx.textBaseline="bottom";
        ctx.shadowColor="rgba(0,0,0,.95)"; ctx.shadowBlur=12*S; ctx.shadowOffsetY=2*S;
        const tl=wrapTextLines(ctx,post.title||"",W-PAD*4,2), tlh=tfs*1.3, tbot=cy+MH-24*S;
        [...tl].reverse().forEach((l,i)=>ctx.fillText(l,W/2,tbot-i*tlh));
        // Category chip
        ctx.shadowColor="transparent"; ctx.shadowBlur=0; ctx.shadowOffsetY=0;
        const cfs=9*S; ctx.font=`600 ${cfs}px Georgia,serif`;
        const cl=post.category.replace(/_/g," ").toUpperCase(), cw2=ctx.measureText(cl).width+18*S, ch2=cfs+10*S;
        const cx3=(W-cw2)/2, cy3=tbot-tl.length*tlh-ch2-8*S;
        ctx.fillStyle=`${categoryHex}E0`; roundRect(ctx,cx3,cy3,cw2,ch2,ch2/2); ctx.fill();
        ctx.fillStyle="#FFF"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(cl,cx3+cw2/2,cy3+ch2/2);
      }
      cy += MH;

      // Content section
      ctx.fillStyle = categoryHex; ctx.fillRect(0,cy,W,CH);
      const tfs2=17*S; ctx.font=`600 ${tfs2}px Georgia,serif`;
      const ttxt=post.title||"Untitled", tw=Math.min(ctx.measureText(ttxt).width+14*S,W-PAD*2), th=tfs2+14*S;
      ctx.fillStyle="#F9FAFB"; roundRect(ctx,PAD,cy+PAD,tw,th,5*S); ctx.fill();
      ctx.fillStyle="#111"; ctx.textAlign="left"; ctx.textBaseline="middle";
      ctx.shadowColor="transparent"; ctx.shadowBlur=0;
      ctx.fillText(ttxt,PAD+7*S,cy+PAD+th/2);
      const my2=cy+PAD+th+7*S;
      ctx.fillStyle=categoryTextHex; ctx.font=`400 ${10*S}px Georgia,serif`; ctx.textBaseline="top";
      ctx.fillText(`${post.post_type} • ${post.category} • ${new Date(post.created_at).toLocaleDateString()}`,PAD,my2);
      const dy=my2+14*S+PAD;
      ctx.font=`400 ${12*S}px Georgia,serif`;
      const dl=wrapTextLines(ctx,post.description||"",W-PAD*2,Math.floor(120*S/(12*S*1.6)));
      dl.forEach((l,i)=>ctx.fillText(l,PAD,dy+i*12*S*1.6));
      if (logo) {
        const lH2=42*S, lW2=(logo.naturalWidth/logo.naturalHeight)*lH2;
        ctx.drawImage(logo,W-PAD-lW2,cy+CH-PAD-lH2,lW2,lH2);
      }
      cy += CH;

      // Footer
      ctx.fillStyle="#FFF"; ctx.fillRect(0,cy,W,FH);
      ctx.fillStyle="#111"; ctx.font=`400 ${11*S}px Georgia,serif`; ctx.textAlign="center"; ctx.textBaseline="middle";
      const fm=cy+FH/2, fw=W/3;
      ["info@oweru.com","+255 711 890 764","www.oweru.com"].forEach((t,i)=>ctx.fillText(t,fw*i+fw/2,fm));
      cy += FH;
      ctx.fillStyle=categoryHex; ctx.fillRect(0,cy,W,AH);
      ctx.restore();

      c.toBlob(blob => {
        if (!blob) { alert("Failed."); setDownloading(false); return; }
        const u=URL.createObjectURL(blob), a=document.createElement("a");
        a.download=`Oweru_${(post.title||"post").replace(/[^a-z0-9]/gi,"_").substring(0,30)}_Post_${Date.now()}.jpg`;
        a.href=u; a.click(); URL.revokeObjectURL(u); setDownloading(false);
      },"image/jpeg",.95);
    } catch(e) { console.error(e); alert("Failed to download."); setDownloading(false); }
  };

  const handleDownloadMedia = async () => {
    setDownloading(true); setShowShareMenu(false);
    try {
      const items = post.post_type==="Reel"&&videos.length ? videos : images;
      if (!items.length) { alert("No media available."); return; }
      for (let i=0;i<items.length;i++) {
        const m=items[i], ext=m.file_type==="video"?"mp4":getMediaUrl(m).endsWith(".png")?"png":"jpg";
        try {
          const blob=await(await fetch(await fetchMediaAsDataUrl(m))).blob();
          const obj=URL.createObjectURL(new Blob([blob],{type:m.file_type==="video"?"video/mp4":blob.type||"image/jpeg"}));
          const a=document.createElement("a"); a.href=obj;
          a.download=`Oweru_${(post.title||"").replace(/[^a-z0-9]/gi,"_").substring(0,30)}_${i+1}.${ext}`;
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
          setTimeout(()=>URL.revokeObjectURL(obj),10000);
        } catch(e){console.error(e); alert(`Failed to download file ${i+1}.`);}
        if (i<items.length-1) await new Promise(r=>setTimeout(r,800));
      }
    } catch(e){console.error(e); alert("Failed.");}
    finally { setDownloading(false); }
  };

  // ─── Download: Branded Reel — seek-and-capture (smooth, no real-time playback) ─
  const handleDownloadVideo = async () => {
    setDownloading(true); setDownloadProgress(1); setShowShareMenu(false);
    if (!videos.length) { alert("No video available."); setDownloading(false); return; }

    try {
      // 1. Fetch video blob for accurate seeking
      let blobUrl;
      try {
        const dataUrl = await fetchMediaAsDataUrl(videos[0]);
        const blob    = await (await fetch(dataUrl)).blob();
        blobUrl = URL.createObjectURL(blob);
      } catch { blobUrl = getMediaUrl(videos[0]); }

      // 2. Load video, get metadata
      const vid = document.createElement("video");
      vid.src = blobUrl; vid.muted = true; vid.preload = "auto"; vid.crossOrigin = "anonymous";
      vid.style.cssText = "position:fixed;left:-9999px;top:0;width:1px;height:1px;";
      document.body.appendChild(vid);
      await new Promise((res,rej) => { vid.onloadedmetadata=res; vid.onerror=rej; vid.load(); });

      const duration   = vid.duration;
      const FPS        = 30;
      const INTERVAL   = 1 / FPS;
      const totalFrames = Math.ceil(duration * FPS);
      const VW = vid.videoWidth  || 1080;
      const VH = vid.videoHeight || 1920;

      // 3. Prepare overlay assets & layout
      const logo   = await loadImage(oweruLogo).catch(() => null);
      const BASE   = VW / 390;
      const PAD_V  = VW * 0.045;

      const LOGO_H = VH * 0.05;
      const LOGO_W = logo ? (logo.naturalWidth / logo.naturalHeight) * LOGO_H : LOGO_H * 3;

      const TITLE_FS = Math.round(22 * BASE);
      const META_FS  = Math.round(10 * BASE);
      const DESC_FS  = Math.round(13 * BASE);
      const DESC_LH  = DESC_FS * 1.65;
      const OW       = Math.min(VW * 0.84, 420 * BASE);

      const offCtx = document.createElement("canvas").getContext("2d");
      offCtx.font  = `700 ${TITLE_FS}px Georgia,serif`;
      const titleLines = wrapTextLines(offCtx, post.title || "", OW, 2);
      offCtx.font  = `400 ${DESC_FS}px Georgia,serif`;
      const descLines  = wrapTextLines(offCtx, post.description || "", OW, 4);

      const TITLE_LH  = TITLE_FS * 1.3;
      const META_H    = META_FS + 12 * BASE;
      const DESC_H    = descLines.length * DESC_LH + 28 * BASE;
      const TITLE_H   = titleLines.length * TITLE_LH;
      const GAP       = 16 * BASE;
      const BLOCK_BOT = VH - PAD_V * 2.5;
      const BLOCK_TOP = BLOCK_BOT - (META_H + GAP * 0.5 + TITLE_H + GAP + DESC_H);

      // 4. Capture canvas + draw overlay function
      const canvas = document.createElement("canvas");
      canvas.width = VW; canvas.height = VH;
      const ctx = canvas.getContext("2d");

      const drawOverlay = () => {
        // Cinematic scrim
        const scrim = ctx.createLinearGradient(0, VH * 0.2, 0, VH);
        scrim.addColorStop(0,    "rgba(0,0,0,0)");
        scrim.addColorStop(0.3,  "rgba(0,0,0,0.1)");
        scrim.addColorStop(0.65, "rgba(0,0,0,0.55)");
        scrim.addColorStop(1,    "rgba(0,0,0,0.92)");
        ctx.fillStyle = scrim; ctx.fillRect(0, 0, VW, VH);

        // Logo pill
        if (logo) {
          const LP = VW * 0.014;
          ctx.fillStyle = "rgba(255,255,255,0.95)";
          roundRect(ctx, PAD_V-LP, PAD_V-LP*.6, LOGO_W+LP*2, LOGO_H+LP*1.2, 40*BASE); ctx.fill();
          ctx.drawImage(logo, PAD_V, PAD_V, LOGO_W, LOGO_H);
        }

        // REEL badge
        const BFS = Math.round(9*BASE); ctx.font = `700 ${BFS}px Georgia,serif`;
        const BW = ctx.measureText("REEL").width + 18*BASE, BH = BFS + 14*BASE, BX = VW - PAD_V - BW;
        ctx.fillStyle = "#DC2626"; roundRect(ctx, BX, PAD_V, BW, BH, BH/2); ctx.fill();
        ctx.fillStyle = "#FFF"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("REEL", BX+BW/2, PAD_V+BH/2);

        // Bottom block
        let CY = BLOCK_TOP;

        // Category meta chip
        ctx.font = `600 ${META_FS}px Georgia,serif`;
        const ML = post.category.replace(/_/g," ").toUpperCase() + "  •  "
          + new Date(post.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
        const MW = ctx.measureText(ML).width + 22*BASE, MH2 = META_FS + 12*BASE, MX = (VW-MW)/2;
        ctx.fillStyle = `${categoryHex}E6`; roundRect(ctx, MX, CY, MW, MH2, MH2/2); ctx.fill();
        ctx.fillStyle = "#FFF"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
        ctx.fillText(ML, VW/2, CY + MH2/2);
        CY += MH2 + GAP*0.5;

        // Title
        ctx.font = `700 ${TITLE_FS}px Georgia,serif`;
        ctx.fillStyle = "#FFF"; ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.shadowColor = "rgba(0,0,0,.92)"; ctx.shadowBlur = TITLE_FS*.4; ctx.shadowOffsetY = TITLE_FS*.05;
        titleLines.forEach((l,i) => ctx.fillText(l, VW/2, CY + i*TITLE_LH));
        CY += TITLE_H + GAP;

        // Frosted description box
        ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
        const DBX = (VW-OW)/2 - 16*BASE, DBW = OW + 32*BASE;
        ctx.fillStyle = "rgba(0,0,0,0.5)"; roundRect(ctx, DBX, CY, DBW, DESC_H, 14*BASE); ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.09)"; ctx.lineWidth = 1.5*BASE;
        roundRect(ctx, DBX, CY, DBW, DESC_H, 14*BASE); ctx.stroke();
        ctx.font = `400 ${DESC_FS}px Georgia,serif`;
        ctx.fillStyle = "rgba(255,255,255,0.88)"; ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 4*BASE;
        descLines.forEach((l,i) => ctx.fillText(l, VW/2, CY + 14*BASE + i*DESC_LH));

        // Gold rule
        ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
        const ry = VH - PAD_V * 0.9;
        ctx.strokeStyle = `${categoryHex}88`; ctx.lineWidth = 1.5*BASE;
        ctx.beginPath(); ctx.moveTo(PAD_V*2, ry); ctx.lineTo(VW-PAD_V*2, ry); ctx.stroke();
      };

      // 5. Seek-and-capture each frame (no live playback — avoids all stutter)
      const frames = [];
      setDownloadProgress(3);

      for (let f = 0; f < totalFrames; f++) {
        // Seek to target timestamp
        await new Promise(res => {
          const done = () => { vid.removeEventListener("seeked", done); res(); };
          vid.addEventListener("seeked", done, { once: true });
          vid.currentTime = Math.min(f * INTERVAL, duration - 0.001);
        });

        // Composite: video frame + overlay
        ctx.drawImage(vid, 0, 0, VW, VH);
        drawOverlay();

        // Snapshot as ImageBitmap (fast, no encoding overhead)
        frames.push(await createImageBitmap(canvas));

        if (f % 8 === 0) setDownloadProgress(3 + Math.round((f / totalFrames) * 72));
      }

      setDownloadProgress(76);

      // 6. Playback captured frames into a recording canvas at exact FPS
      //    This produces a clean, smooth video with no seeking artifacts
      const recCanvas = document.createElement("canvas");
      recCanvas.width = VW; recCanvas.height = VH;
      const recCtx    = recCanvas.getContext("2d");
      const stream    = recCanvas.captureStream(FPS);

      const mime = ["video/webm;codecs=vp9,opus","video/webm;codecs=vp8,opus","video/webm"]
        .find(m => MediaRecorder.isTypeSupported(m)) || "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 5_000_000 });
      const chunks   = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.start();

      const MS = 1000 / FPS;
      for (let f = 0; f < frames.length; f++) {
        recCtx.drawImage(frames[f], 0, 0);
        await new Promise(r => setTimeout(r, MS));
        if (f % 10 === 0) setDownloadProgress(76 + Math.round((f / frames.length) * 20));
      }

      recorder.stop();
      await new Promise(r => { recorder.onstop = r; });

      setDownloadProgress(98);

      // Release bitmaps
      frames.forEach(b => b.close());

      // 7. Trigger download
      const finalBlob = new Blob(chunks, { type: mime });
      const url  = URL.createObjectURL(finalBlob);
      const link = document.createElement("a");
      link.download = `Oweru_${(post.title||"reel").replace(/[^a-z0-9]/gi,"_").substring(0,30)}_Branded_${Date.now()}.webm`;
      link.href = url; document.body.appendChild(link); link.click(); document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 15000);

      // Cleanup
      vid.pause(); try { document.body.removeChild(vid); } catch {}
      if (blobUrl.startsWith("blob:")) URL.revokeObjectURL(blobUrl);

      setDownloadProgress(100);
      setTimeout(() => setDownloadProgress(0), 1500);

    } catch (err) {
      console.error("Branded reel error:", err);
      alert("Failed to generate branded reel. Please try again.");
    } finally { setDownloading(false); }
  };

  const isReelPost = post.post_type === "Reel" && videos.length > 0;

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Instagram toast */}
      {instagramStatus && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm rounded-xl shadow-2xl p-4 flex items-start gap-3 text-white ${instagramStatus.type==="success"?"bg-green-600":"bg-red-600"}`}>
          <div className="flex-shrink-0 mt-0.5">{instagramStatus.type==="success"?<Check size={18}/>:<X size={18}/>}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{instagramStatus.message}</p>
            {instagramStatus.permalink && <a href={instagramStatus.permalink} target="_blank" rel="noopener noreferrer" className="text-xs underline mt-1 block">View on Instagram →</a>}
          </div>
          <button onClick={()=>setInstagramStatus(null)}><X size={16}/></button>
        </div>
      )}

      {/* Card */}
      <div
        ref={cardRef}
        className={`shadow-lg overflow-hidden border border-gray-200 ${getCategoryBackground(post.category)} rounded-lg flex flex-col relative h-[700px]`}
      >
        {/* ── Media ── */}
        <div className="w-full h-64 flex-shrink-0">

          {/* Static */}
          {post.post_type === "Static" && (
            <div className="w-full h-full bg-black">
              {images.length > 0
                ? <img src={getCachedMediaUrl(images[0])} alt={post.title} className="w-full h-full object-cover" loading="lazy" onError={e=>e.target.src=PLACEHOLDER_IMAGE}/>
                : <div className="w-full h-full flex items-center justify-center bg-gray-800"><p className="text-white px-4 text-center">No valid image available</p></div>
              }
            </div>
          )}

          {/* Carousel */}
          {post.post_type === "Carousel" && (
            images.length > 0 ? (
              <div className="w-full h-full flex flex-col">
                <div className="relative w-full h-full">
                  <img src={getCachedMediaUrl(images[carouselIndex])} alt={`${post.title} - ${carouselIndex+1}`} className="w-full h-full object-cover bg-black" loading="lazy" onError={e=>e.target.src=PLACEHOLDER_IMAGE}/>
                  {images.length > 1 && <>
                    <button onClick={()=>setCarouselIndex(p=>(p-1+images.length)%images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-1 rounded-full">‹</button>
                    <button onClick={()=>setCarouselIndex(p=>(p+1)%images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-1 rounded-full">›</button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-xs">{carouselIndex+1} / {images.length}</div>
                  </>}
                </div>
                {images.length > 1 && (
                  <div className="absolute bottom-0 left-0 right-0 flex gap-2 p-2 overflow-x-auto bg-black/50">
                    {images.map((img,idx)=>(
                      <button key={idx} onClick={()=>setCarouselIndex(idx)} className={`shrink-0 ${idx===carouselIndex?"ring-2 ring-white":""}`}>
                        <img src={getCachedMediaUrl(img)} alt={`Thumb ${idx+1}`} className="w-10 h-10 object-cover rounded" loading="lazy" onError={e=>e.target.src=PLACEHOLDER_IMAGE}/>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800"><p className="text-white px-4 text-center">No valid images available</p></div>
            )
          )}

          {/* Reel */}
          {post.post_type === "Reel" && (
            videos.length > 0 ? (
              <div className="relative w-full h-full overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  controls
                  preload="metadata"
                  playsInline
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover"
                  onError={() => setVideoError(true)}
                  onLoadStart={() => setVideoError(false)}
                >
                  <source src={getMediaUrl(videos[0])} type={videos[0].mime_type || "video/mp4"}/>
                </video>

                {videoError && (
                  <div className="absolute top-0 left-0 right-0 p-3 bg-red-50 border-b border-red-200 z-30">
                    <p className="text-red-700 font-semibold text-xs">Video failed to load</p>
                    <a href={getMediaUrl(videos[0])} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">Open directly →</a>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <p className="text-white px-4 text-center">No valid video available</p>
              </div>
            )
          )}
        </div>

        {/* ── Unified content section (all post types) ── */}
        <div className={`flex flex-col flex-grow ${getCategoryBackground(post.category)} rounded-b-lg`}>
          <div className="px-4 pt-4 pb-2">
            <h3 className="text-base bg-gray-100 font-semibold text-gray-900 p-2.5 rounded-lg text-left line-clamp-2">{post.title}</h3>
            <p className={`text-xs ${getCategoryTextColor(post.category)} mt-2 text-left`}>
              {post.post_type} • {post.category.replace(/_/g, " ")} • {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="px-4 py-3 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <p className={`${getCategoryTextColor(post.category)} text-left whitespace-pre-wrap text-sm leading-relaxed`}>{post.description}</p>
          </div>
          <div className="px-4 pb-3 flex justify-end">
            <img src={oweruLogo} alt="Oweru logo" className="h-10 w-auto shadow-lg"/>
          </div>
        </div>

        {/* ── Contact footer ── */}
        <div className="bg-white px-4 py-2.5 text-center">
          <div className="text-xs text-gray-950 space-y-0.5">
            <div className="flex justify-center gap-2 flex-wrap text-center">
              <a href="mailto:info@oweru.com" className="hover:underline">info@oweru.com</a>
              <span>•</span>
              <a href="tel:+255711890764" className="hover:underline">+255 711 890 764</a>
              <span>•</span>
              <a href="https://www.oweru.com" target="_blank" rel="noopener noreferrer" className="hover:underline">www.oweru.com</a>
            </div>
          </div>
        </div>

        {/* ── Bottom accent strip ── */}
        <div className={`${getCategoryBackground(post.category)} h-1.5 rounded-b-lg`}/>

        {/* ── Share button ── */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            disabled={downloading}
            className="bg-white hover:bg-gray-50 text-gray-900 p-2.5 rounded-full shadow-xl border-2 border-gray-200 hover:border-[#C89128] transition-all duration-200"
            aria-label="Share post"
          >
            {downloading
              ? <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"/>
              : <Share2 size={18}/>
            }
          </button>

          {/* Progress indicator */}
          {downloading && downloadProgress > 0 && (
            <div className="absolute top-12 right-0 w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-30">
              <p className="text-xs text-gray-600 mb-1.5 font-medium flex justify-between">
                <span>
                  {downloadProgress < 75 ? "Capturing frames…"
                  : downloadProgress < 95 ? "Encoding video…"
                  : "Finalising…"}
                </span>
                <span className="font-bold text-[#C89128]">{downloadProgress}%</span>
              </p>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%`, backgroundColor: "#C89128" }}
                />
              </div>
            </div>
          )}

          {showShareMenu && !downloading && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowShareMenu(false)}/>
              <div className="absolute top-12 right-0 z-20 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden min-w-[230px]">

                {isReelPost && (
                  <button onClick={handleDownloadVideo} disabled={downloading}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-900 transition-colors font-medium disabled:opacity-50 border-b border-gray-50">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C89128" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
                      <line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/>
                      <line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>
                    </svg>
                    Download Branded Reel
                  </button>
                )}

                <button onClick={handleDownloadPostAsImage} disabled={downloading}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-900 transition-colors font-medium disabled:opacity-50">
                  <Download size={16} className="text-[#C89128]"/>
                  {isReelPost ? "Download as Image" : "Download Branded Post"}
                </button>

                {!isReelPost && (
                  <button onClick={handleDownloadMedia} disabled={downloading}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-900 transition-colors font-medium disabled:opacity-50">
                    <Download size={16} className="text-slate-600"/>
                    Download Media Files
                  </button>
                )}

                <div className="border-t border-gray-100"/>
                <button onClick={handleCopyLink}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-900 transition-colors font-medium">
                  {copied
                    ? <><Check size={16} className="text-green-500"/>Copied!</>
                    : <><Copy size={16} className="text-gray-400"/>Copy Link</>
                  }
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