import React, { useState, useRef, useEffect } from 'react';
import { LyricStanza } from '../types';
import { Video, Download, Youtube, Copy, Check, X, Play, Pause, Sparkles, RefreshCw, Layers, Music, Share2, Disc } from 'lucide-react';

interface YouTubeVideoExporterProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  storySummary?: string;
  lyrics: LyricStanza[];
  coverImageUrl?: string;
  audioUrl?: string | null;
  proAudioUrl?: string | null;
  clipAudioUrl?: string | null;
  take2AudioUrl?: string | null;
  style: string;
  tempo: number | string;
  musicalKey: string;
}

export const YouTubeVideoExporter: React.FC<YouTubeVideoExporterProps> = ({
  isOpen,
  onClose,
  title,
  storySummary,
  lyrics,
  coverImageUrl,
  audioUrl,
  proAudioUrl,
  clipAudioUrl,
  take2AudioUrl,
  style,
  tempo,
  musicalKey
}) => {
  const [videoFormat, setVideoFormat] = useState<'landscape' | 'shorts' | 'square'>('landscape');
  // Duration mode: 'full' for 2-3 minute master song, 'clip' for 45-second preview, 'hook' for 15s teaser hook
  const [durationMode, setDurationMode] = useState<'full' | 'clip' | 'hook'>(proAudioUrl ? 'full' : 'clip');
  // Selected track: 'pro' | 'clipA' | 'clipB'
  const [selectedTrackSource, setSelectedTrackSource] = useState<'pro' | 'clipA' | 'clipB'>(
    proAudioUrl ? 'pro' : clipAudioUrl ? 'clipA' : take2AudioUrl ? 'clipB' : 'pro'
  );
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | null>(null);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [copiedAllBundle, setCopiedAllBundle] = useState(false);
  const [activeLyricIndex, setActiveLyricIndex] = useState(0);

  // Sync default selection if proAudioUrl becomes available
  useEffect(() => {
    if (proAudioUrl) {
      setSelectedTrackSource('pro');
      setDurationMode('full');
    } else if (clipAudioUrl) {
      setSelectedTrackSource('clipA');
    } else if (take2AudioUrl) {
      setSelectedTrackSource('clipB');
    }
  }, [proAudioUrl, clipAudioUrl, take2AudioUrl]);

  // Determine current effective audio URL
  const currentAudioUrl =
    selectedTrackSource === 'pro'
      ? proAudioUrl || audioUrl
      : selectedTrackSource === 'clipA'
      ? clipAudioUrl || audioUrl
      : take2AudioUrl || audioUrl;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  if (!isOpen) return null;

  const width = videoFormat === 'landscape' ? 1280 : videoFormat === 'shorts' ? 720 : 1080;
  const height = videoFormat === 'landscape' ? 720 : videoFormat === 'shorts' ? 1280 : 1080;

  // Clean title
  const cleanTitle = (title || 'El Corrido').replace(/^"|"$/g, '');

  // Pre-formatted YouTube metadata
  const isFullMaster = durationMode === 'full' && !!proAudioUrl;
  const youtubeTitle = `${cleanTitle} - Corrido Oficial (${isFullMaster ? 'Canción Completa Master HD' : durationMode === 'hook' ? 'Hook Viral 15s' : 'Clip Promocional HD'}) [${style || 'Regional Mexicano'}]`;
  
  const fullLyricsText = (lyrics || [])
    .map((l) => `[${(l.type || 'verso').toUpperCase()}]:\n${l.text}`)
    .join('\n\n');

  const youtubeDescription = `🎧 Escucha el Corrido Oficial "${cleanTitle}".
Estilo: ${style || 'Corrido Tumbado Bélico'}
Tempo: ${tempo} | Tono: ${musicalKey}

📖 HISTORIA & LEYENDA:
${storySummary || 'Un corrido de valentía, honor y superación.'}

📜 LETRA OFICIAL COMPLETA:
${fullLyricsText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 Producido y masterizado con Corrido AI de Medina Tech.
Arreglos inspirados en los sonidos auténticos del Norte de México.

#CorridosTumbados #CorridoBélico #RegionalMexicano #Mexicali #LosJuniorsDeMexicali #LosDareyesDeLaSierra #TitoDoubleP #CorridoAI #MedinaTech`;

  // Handle Copy Actions
  const handleCopyTitle = () => {
    navigator.clipboard.writeText(youtubeTitle);
    setCopiedTitle(true);
    setTimeout(() => setCopiedTitle(false), 2000);
  };

  const handleCopyDesc = () => {
    navigator.clipboard.writeText(youtubeDescription);
    setCopiedDesc(true);
    setTimeout(() => setCopiedDesc(false), 2000);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(`TÍTULO PARA YOUTUBE:\n${youtubeTitle}\n\nDESCRIPCIÓN:\n${youtubeDescription}`);
    setCopiedAllBundle(true);
    setTimeout(() => setCopiedAllBundle(false), 2000);
  };

  // Download Package (Cover Art + Audio + Lyrics Text file)
  const handleDownloadPackage = () => {
    // 1. Download Lyrics TXT
    const txtContent = `CORRIDO: ${cleanTitle}\nESTILO: ${style}\nTEMPO: ${tempo}\nTONO: ${musicalKey}\n\nSINOPSIS:\n${storySummary}\n\nLETRAS:\n${fullLyricsText}`;
    const txtBlob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    const txtUrl = URL.createObjectURL(txtBlob);
    const txtLink = document.createElement('a');
    txtLink.href = txtUrl;
    txtLink.download = `${cleanTitle.replace(/\s+/g, '_')}_Letras_Oficiales.txt`;
    txtLink.click();

    // 2. Download Cover Art if available
    if (coverImageUrl) {
      const imgLink = document.createElement('a');
      imgLink.href = coverImageUrl;
      imgLink.download = `${cleanTitle.replace(/\s+/g, '_')}_Cover_Art.png`;
      imgLink.target = '_blank';
      imgLink.click();
    }

    // 3. Download Audio if available
    if (audioUrl) {
      const audioLink = document.createElement('a');
      audioLink.href = audioUrl;
      audioLink.download = `${cleanTitle.replace(/\s+/g, '_')}_Master_Audio.mp3`;
      audioLink.click();
    }
  };

  // Video Generation Engine with Canvas + MediaRecorder
  const handleStartVideoRender = async () => {
    if (!canvasRef.current) return;
    setIsRendering(true);
    setRenderProgress(0);
    setRenderedVideoUrl(null);
    recordedChunksRef.current = [];

    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load Cover Image
    let coverImg: HTMLImageElement | null = null;
    if (coverImageUrl) {
      coverImg = new Image();
      coverImg.crossOrigin = 'anonymous';
      coverImg.src = coverImageUrl;
      await new Promise((res) => {
        coverImg!.onload = res;
        coverImg!.onerror = res;
      });
    }

    // Audio setup
    let audioStream: MediaStream | null = null;
    const audioEl = new Audio();
    if (currentAudioUrl) {
      audioEl.crossOrigin = 'anonymous';
      audioEl.src = currentAudioUrl;
      // Wait for audio metadata if possible to get exact duration
      await new Promise((resolve) => {
        if (audioEl.readyState >= 1) return resolve(null);
        audioEl.onloadedmetadata = () => resolve(null);
        audioEl.onerror = () => resolve(null);
        setTimeout(() => resolve(null), 1500);
      });
    }

    // Canvas Stream at 30 fps
    const canvasStream = canvas.captureStream(30);

    // Try combining audio stream if available
    let combinedStream = canvasStream;
    try {
      if (currentAudioUrl) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaElementSource(audioEl);
        const dest = audioCtx.createMediaStreamDestination();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        source.connect(dest);

        audioStream = dest.stream;
        const audioTrack = audioStream.getAudioTracks()[0];
        if (audioTrack) {
          combinedStream = new MediaStream([
            ...canvasStream.getVideoTracks(),
            audioTrack
          ]);
        }
      }
    } catch (e) {
      console.warn("Audio stream capture fallback:", e);
    }

    // Initialize MediaRecorder
    let mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = '';
    }

    try {
      const recorder = new MediaRecorder(combinedStream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRenderedVideoUrl(url);
        setIsRendering(false);
        setRenderProgress(100);

        // Auto download video
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        const formatTag = videoFormat === 'square' ? 'X_POST_1x1' : videoFormat === 'shorts' ? 'SHORTS_9x16' : 'YOUTUBE_16x9';
        const modeTag = durationMode === 'full' ? '2MIN_MASTER' : durationMode === 'hook' ? '15S_HOOK' : '45S_PROMO';
        downloadLink.download = `${cleanTitle.replace(/\s+/g, '_')}_${formatTag}_${modeTag}.webm`;
        downloadLink.click();
      };

      recorder.start(1000); // 1-second chunks

      // Start Audio playback
      if (currentAudioUrl) {
        audioEl.play().catch(err => console.warn("Audio playback warn:", err));
      }

      // Calculate total duration
      let totalDurationSec = durationMode === 'full' ? 120 : durationMode === 'hook' ? 18 : 45;
      if (durationMode === 'hook') {
        totalDurationSec = 18; // 18s viral hook cut
      } else if (audioEl.duration && isFinite(audioEl.duration) && audioEl.duration > 20) {
        totalDurationSec = Math.round(audioEl.duration);
      } else if (durationMode === 'full') {
        totalDurationSec = 120; // 2 minutes full song
      }

      const startTime = performance.now();

      // Render Loop
      const renderFrame = (now: number) => {
        // Dynamically refine duration if audio metadata became available
        if (durationMode !== 'hook' && audioEl.duration && isFinite(audioEl.duration) && audioEl.duration > 15) {
          totalDurationSec = Math.round(audioEl.duration);
        }

        const elapsedSec = (now - startTime) / 1000;
        const progress = Math.min(100, Math.round((elapsedSec / totalDurationSec) * 100));
        setRenderProgress(progress);

        // Calculate active lyric based on all stanzas across full duration
        if (lyrics && lyrics.length > 0) {
          const stanzaDuration = totalDurationSec / lyrics.length;
          const currentIdx = Math.min(lyrics.length - 1, Math.floor(elapsedSec / stanzaDuration));
          setActiveLyricIndex(currentIdx);
        }

        // Draw Background
        ctx.fillStyle = '#0f0c08';
        ctx.fillRect(0, 0, width, height);

        // Draw Background Glow / Ambience
        const grad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width * 0.7);
        grad.addColorStop(0, '#78350f');
        grad.addColorStop(0.5, '#291807');
        grad.addColorStop(1, '#0c0a09');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Draw Cover Art
        if (coverImg && coverImg.complete && coverImg.naturalWidth > 0) {
          if (videoFormat === 'landscape') {
            // Landscape: Centered album art with dark gold border on left/center
            const artSize = 390;
            const artX = (width - artSize) / 2;
            const artY = 55;

            // Subtle gentle pulse zoom
            const pulse = 1.0 + 0.015 * Math.sin(now * 0.003);
            ctx.save();
            ctx.translate(artX + artSize / 2, artY + artSize / 2);
            ctx.scale(pulse, pulse);
            ctx.drawImage(coverImg, -artSize / 2, -artSize / 2, artSize, artSize);
            ctx.restore();

            // Gold Ornamental Border
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 6;
            ctx.strokeRect(artX - 3, artY - 3, artSize + 6, artSize + 6);
          } else if (videoFormat === 'shorts') {
            // Shorts 9:16: Full cover background with blur + crisp center square
            const artSize = 520;
            const artX = (width - artSize) / 2;
            const artY = 240;

            ctx.drawImage(coverImg, artX, artY, artSize, artSize);
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 8;
            ctx.strokeRect(artX - 4, artY - 4, artSize + 8, artSize + 8);
          } else {
            // Square 1:1: Standard for X (Twitter) and Instagram feed video posts
            const artSize = 600;
            const artX = (width - artSize) / 2;
            const artY = 170;

            const pulse = 1.0 + 0.012 * Math.sin(now * 0.003);
            ctx.save();
            ctx.translate(artX + artSize / 2, artY + artSize / 2);
            ctx.scale(pulse, pulse);
            ctx.drawImage(coverImg, -artSize / 2, -artSize / 2, artSize, artSize);
            ctx.restore();

            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 6;
            ctx.strokeRect(artX - 3, artY - 3, artSize + 6, artSize + 6);
          }
        } else {
          // Fallback graphic
          ctx.fillStyle = '#451a03';
          ctx.fillRect(width / 2 - 180, height / 3 - 180, 360, 360);
          ctx.font = '72px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('🤠', width / 2, height / 3 + 20);
        }

        // Draw Animated Spectrum Visualizer
        const numBars = videoFormat === 'square' ? 44 : 36;
        const barWidth = videoFormat === 'landscape' ? 18 : videoFormat === 'square' ? 14 : 12;
        const barGap = 6;
        const totalVisWidth = numBars * (barWidth + barGap);
        const visStartX = (width - totalVisWidth) / 2;
        const visY = videoFormat === 'landscape' ? 490 : videoFormat === 'shorts' ? 810 : 815;

        for (let b = 0; b < numBars; b++) {
          const freqFactor = Math.sin(now * 0.006 + b * 0.28) * 0.5 + 0.5;
          const bassBoost = b < 10 ? 1.4 : 1.0;
          const barHeight = Math.max(8, freqFactor * 60 * bassBoost);

          const barGrad = ctx.createLinearGradient(0, visY - barHeight, 0, visY);
          barGrad.addColorStop(0, '#fef08a');
          barGrad.addColorStop(0.5, '#f59e0b');
          barGrad.addColorStop(1, '#b45309');

          ctx.fillStyle = barGrad;
          ctx.fillRect(visStartX + b * (barWidth + barGap), visY - barHeight, barWidth, barHeight);
        }

        // Title & Header Text
        ctx.textAlign = 'center';
        ctx.font = videoFormat === 'square' ? '900 34px "Cinzel", "Playfair Display", serif' : '900 30px "Cinzel", "Playfair Display", serif';
        ctx.fillStyle = '#fef3c7';
        const titleY = videoFormat === 'landscape' ? 535 : videoFormat === 'shorts' ? 170 : 105;
        ctx.fillText(cleanTitle.toUpperCase(), width / 2, titleY);

        ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#f59e0b';
        const badgeLabel = durationMode === 'full' ? 'VIDEO OFICIAL • 2 MIN MASTER' : durationMode === 'hook' ? 'HOOK VIRAL • 15 SEGUNDOS' : 'PREVIEW CLIP • 45 SEGUNDOS';
        ctx.fillText(`${badgeLabel} • ${(style || 'CORRIDO BÉLICO').toUpperCase()} • TONO ${musicalKey}`, width / 2, titleY + 28);

        // Draw Karaoke Subtitles / Active Lyric Box
        if (lyrics && lyrics.length > 0) {
          const stanza = lyrics[activeLyricIndex] || lyrics[0];
          const lyricBoxY = videoFormat === 'landscape' ? 580 : videoFormat === 'shorts' ? 860 : 850;
          const lyricBoxHeight = videoFormat === 'landscape' ? 105 : videoFormat === 'shorts' ? 220 : 180;
          const lyricBoxWidth = width * 0.90;
          const lyricBoxX = (width - lyricBoxWidth) / 2;

          // Box background
          ctx.fillStyle = 'rgba(15, 10, 5, 0.90)';
          ctx.fillRect(lyricBoxX, lyricBoxY, lyricBoxWidth, lyricBoxHeight);
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 2;
          ctx.strokeRect(lyricBoxX, lyricBoxY, lyricBoxWidth, lyricBoxHeight);

          // Type Tag (VERSO / CORO) + Stanza Counter
          ctx.font = 'bold 11px monospace';
          ctx.fillStyle = '#fbbf24';
          ctx.textAlign = 'left';
          ctx.fillText(`● ESTROFA ${activeLyricIndex + 1}/${lyrics.length}: ${(stanza.type || 'estrofa').toUpperCase()} (LETRA REAL CANTADA)`, lyricBoxX + 16, lyricBoxY + 20);

          // Lyric Lines - Render up to 4 lines
          ctx.font = videoFormat === 'landscape' ? 'italic bold 16px "Cinzel", serif' : 'italic bold 17px "Cinzel", serif';
          ctx.fillStyle = '#fffbeb';
          ctx.textAlign = 'center';
          const lines = stanza.text.split('\n').filter(Boolean).slice(0, 3);
          lines.forEach((line, lineIdx) => {
            ctx.fillText(`"${line}"`, width / 2, lyricBoxY + 44 + lineIdx * 22);
          });
        }

        // Time Counter & Watermark
        const mins = Math.floor(elapsedSec / 60);
        const secs = Math.floor(elapsedSec % 60).toString().padStart(2, '0');
        const totMins = Math.floor(totalDurationSec / 60);
        const totSecs = Math.floor(totalDurationSec % 60).toString().padStart(2, '0');

        ctx.textAlign = 'left';
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(`⏱ ${mins}:${secs} / ${totMins}:${totSecs}`, 20, height - 16);

        ctx.textAlign = 'right';
        ctx.font = '10px monospace';
        ctx.fillStyle = '#78716c';
        ctx.fillText('CORRIDO AI • 1080P MASTER OFICIAL', width - 20, height - 16);

        // Stop condition: when time elapsed or audio element has finished playing
        const audioHasEnded = currentAudioUrl && audioEl.ended && elapsedSec > 5;
        if (elapsedSec < totalDurationSec && !audioHasEnded) {
          animFrameRef.current = requestAnimationFrame(renderFrame);
        } else {
          // Finished
          if (recorder.state === 'recording') {
            recorder.stop();
          }
          audioEl.pause();
        }
      };

      animFrameRef.current = requestAnimationFrame(renderFrame);
    } catch (recorderErr) {
      console.error("MediaRecorder start failed:", recorderErr);
      setIsRendering(false);
    }
  };

  const handleCancelRender = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRendering(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-stone-900 border-2 border-amber-500 shadow-2xl p-6 md:p-8 relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-amber-400 cursor-pointer bg-stone-950 border border-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 border-b border-amber-900/50 pb-4">
          <div className="p-3 bg-red-600/20 border border-red-500 text-red-400 rounded">
            <Youtube className="w-7 h-7" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 bg-red-950 border border-red-700 text-red-400 text-[10px] font-mono font-bold uppercase tracking-widest rounded">
              Exportador Oficial de Video HD
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-black text-amber-100 uppercase tracking-tight mt-1">
              Crear Video y Compartir en YouTube
            </h2>
            <p className="text-stone-400 text-xs mt-0.5">
              Une la portada de arte generada con el audio master para crear un video MP4/WEBM con letras sincronizadas y ecualizador animado listo para subir a YouTube o TikTok.
            </p>
          </div>
        </div>

        {/* Duration Mode & Audio Source Selector */}
        <div className="mb-6 p-4 bg-stone-950 border border-amber-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs font-mono text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 1. Elige el Tipo de Video y Audio
            </span>
            {isFullMaster && (
              <span className="text-[10px] font-mono bg-emerald-950 border border-emerald-700 text-emerald-300 px-2 py-0.5 font-bold">
                ● Master Completo de 2 Minutos Listo
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 2-Minute Full Master Video */}
            <button
              type="button"
              onClick={() => {
                setDurationMode('full');
                if (proAudioUrl) setSelectedTrackSource('pro');
              }}
              disabled={isRendering}
              className={`p-3.5 border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                durationMode === 'full'
                  ? 'bg-amber-950/80 border-amber-400 ring-1 ring-amber-400 text-amber-100'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
              }`}
            >
              <Video className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-200 uppercase tracking-wider">
                    Canción Completa (~2 Min)
                  </span>
                  <span className="text-[9px] font-mono font-black text-red-400 bg-red-950/80 px-1 py-0.5">
                    MASTER
                  </span>
                </div>
                <span className="text-[11px] text-stone-400 block mt-1 leading-snug">
                  Video con la letra oficial completa cantada de principio a fin.
                </span>
              </div>
            </button>

            {/* 45-Second Promotional Clip */}
            <button
              type="button"
              onClick={() => {
                setDurationMode('clip');
                if (!proAudioUrl) {
                  setSelectedTrackSource(clipAudioUrl ? 'clipA' : 'clipB');
                }
              }}
              disabled={isRendering}
              className={`p-3.5 border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                durationMode === 'clip'
                  ? 'bg-amber-950/80 border-amber-400 ring-1 ring-amber-400 text-amber-100'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
              }`}
            >
              <Layers className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-200 uppercase tracking-wider">
                    Clip Promo (45 Seg)
                  </span>
                  <span className="text-[9px] font-mono text-amber-400 bg-amber-950/80 px-1 py-0.5">
                    PROMO
                  </span>
                </div>
                <span className="text-[11px] text-stone-400 block mt-1 leading-snug">
                  Vista previa rápida para reels, stories y avances oficiales.
                </span>
              </div>
            </button>

            {/* 15-Second Viral Hook */}
            <button
              type="button"
              onClick={() => {
                setDurationMode('hook');
                if (!proAudioUrl) {
                  setSelectedTrackSource(clipAudioUrl ? 'clipA' : 'clipB');
                }
              }}
              disabled={isRendering}
              className={`p-3.5 border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                durationMode === 'hook'
                  ? 'bg-amber-950/80 border-amber-400 ring-1 ring-amber-400 text-amber-100'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
              }`}
            >
              <Sparkles className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-200 uppercase tracking-wider">
                    Hook Viral (15-18 Seg)
                  </span>
                  <span className="text-[9px] font-mono text-sky-400 bg-sky-950/80 px-1 py-0.5">
                    X / VIRAL
                  </span>
                </div>
                <span className="text-[11px] text-stone-400 block mt-1 leading-snug">
                  Corte explosivo del coro para enganchar al instante en el feed de X.
                </span>
              </div>
            </button>
          </div>

          {/* Audio Source Selector Buttons if multiple available */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-800 text-xs">
            <span className="text-[11px] text-stone-400 font-mono">Pista de Audio Utilizada:</span>
            {proAudioUrl && (
              <button
                type="button"
                onClick={() => setSelectedTrackSource('pro')}
                className={`px-2.5 py-1 text-[11px] font-mono cursor-pointer border ${
                  selectedTrackSource === 'pro'
                    ? 'bg-amber-600 text-stone-950 font-bold border-amber-400'
                    : 'bg-stone-900 text-stone-300 border-stone-700 hover:border-stone-500'
                }`}
              >
                🎤 Master Completo (2-3 Min)
              </button>
            )}
            {clipAudioUrl && (
              <button
                type="button"
                onClick={() => setSelectedTrackSource('clipA')}
                className={`px-2.5 py-1 text-[11px] font-mono cursor-pointer border ${
                  selectedTrackSource === 'clipA'
                    ? 'bg-amber-600 text-stone-950 font-bold border-amber-400'
                    : 'bg-stone-900 text-stone-300 border-stone-700 hover:border-stone-500'
                }`}
              >
                ⚡ Opción A (126 BPM)
              </button>
            )}
            {take2AudioUrl && (
              <button
                type="button"
                onClick={() => setSelectedTrackSource('clipB')}
                className={`px-2.5 py-1 text-[11px] font-mono cursor-pointer border ${
                  selectedTrackSource === 'clipB'
                    ? 'bg-amber-600 text-stone-950 font-bold border-amber-400'
                    : 'bg-stone-900 text-stone-300 border-stone-700 hover:border-stone-500'
                }`}
              >
                🪕 Opción B (114 BPM)
              </button>
            )}
          </div>
        </div>

        {/* Format Selector: 3 Options (YouTube 16:9, Shorts/Reels 9:16, X/Instagram 1:1) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setVideoFormat('landscape')}
            disabled={isRendering}
            className={`p-3.5 border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
              videoFormat === 'landscape'
                ? 'bg-amber-950/80 border-amber-400 ring-1 ring-amber-400 text-amber-100'
                : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
            }`}
          >
            <Video className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-xs block text-amber-200 uppercase">YouTube 16:9</span>
              <span className="text-[11px] text-stone-400 block mt-0.5 leading-tight">
                Panorámico (1280x720). Ideal para canales oficiales y computadoras.
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setVideoFormat('shorts')}
            disabled={isRendering}
            className={`p-3.5 border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
              videoFormat === 'shorts'
                ? 'bg-amber-950/80 border-amber-400 ring-1 ring-amber-400 text-amber-100'
                : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
            }`}
          >
            <Layers className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-xs block text-amber-200 uppercase">TikTok / Reels 9:16</span>
              <span className="text-[11px] text-stone-400 block mt-0.5 leading-tight">
                Vertical (720x1280). Perfecto para YouTube Shorts, TikTok y Stories.
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setVideoFormat('square')}
            disabled={isRendering}
            className={`p-3.5 border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
              videoFormat === 'square'
                ? 'bg-amber-950/80 border-amber-400 ring-1 ring-amber-400 text-amber-100'
                : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
            }`}
          >
            <Disc className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-xs block text-amber-200 uppercase">Post de X (Twitter) 1:1</span>
              <span className="text-[11px] text-stone-400 block mt-0.5 leading-tight">
                Cuadrado (1080x1080). El formato preferido para video posts en el timeline de X.
              </span>
            </div>
          </button>
        </div>

        {/* Video Canvas Stage & Render Progress */}
        <div className="bg-stone-950 border border-stone-800 p-4 mb-6">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-amber-400 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Renderizador de Video en Vivo ({width}x{height}) • {videoFormat.toUpperCase()}
            </span>
            {isRendering && (
              <span className="font-mono text-amber-300 animate-pulse font-bold">
                Renderizando video con arte y audio... {renderProgress}%
              </span>
            )}
            {renderedVideoUrl && (
              <span className="font-mono text-emerald-400 font-bold">
                ✓ Video Listo para Descargar y Subir
              </span>
            )}
          </div>

          {/* Canvas Element */}
          <div className="w-full flex items-center justify-center bg-black/60 overflow-hidden border border-stone-800 relative min-h-[260px] max-h-[380px]">
            <canvas
              ref={canvasRef}
              className="max-h-[360px] max-w-full object-contain shadow-2xl"
              style={{ aspectRatio: videoFormat === 'landscape' ? '16/9' : videoFormat === 'shorts' ? '9/16' : '1/1' }}
            />

            {!isRendering && !renderedVideoUrl && (
              <div className="absolute inset-0 bg-stone-950/80 flex flex-col items-center justify-center p-6 text-center">
                <Video className="w-12 h-12 text-amber-500/60 mb-2" />
                <p className="font-serif text-lg font-bold text-amber-200">
                  {durationMode === 'full'
                    ? `Listo para Crear el Video de la Canción Completa (~2 Minutos)`
                    : durationMode === 'hook'
                    ? `Listo para Crear el Hook Viral (15s) de "${cleanTitle}"`
                    : `Listo para Crear el Clip de 45s de "${cleanTitle}"`}
                </p>
                <p className="text-xs text-stone-400 max-w-md mt-1">
                  Se generará el archivo de video con la portada en alta resolución, las ondas del ecualizador dinámico y las letras sincronizadas para {videoFormat === 'square' ? 'X (Twitter) e Instagram' : videoFormat === 'shorts' ? 'TikTok y Reels' : 'YouTube'}.
                </p>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {isRendering && (
            <div className="w-full bg-stone-900 h-3 mt-3 border border-stone-800 overflow-hidden">
              <div
                className="bg-amber-500 h-full transition-all duration-300"
                style={{ width: `${renderProgress}%` }}
              />
            </div>
          )}

          {/* Action Buttons for Video Render */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            {!isRendering ? (
              <button
                type="button"
                onClick={handleStartVideoRender}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-stone-100 font-serif font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg transition-all"
              >
                <Video className="w-4 h-4" />
                <span>
                  {videoFormat === 'square'
                    ? `🎬 Renderizar Video 1:1 para X (${durationMode === 'full' ? '2 Min' : durationMode === 'hook' ? '15s' : '45s'})`
                    : videoFormat === 'shorts'
                    ? `⚡ Renderizar 9:16 para Reels/Shorts (${durationMode === 'full' ? '2 Min' : durationMode === 'hook' ? '15s' : '45s'})`
                    : `🎬 Renderizar 16:9 para YouTube (${durationMode === 'full' ? '2 Min' : durationMode === 'hook' ? '15s' : '45s'})`}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancelRender}
                className="px-6 py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 font-serif font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
                <span>Cancelar Renderizado</span>
              </button>
            )}

            {renderedVideoUrl && (
              <a
                href={renderedVideoUrl}
                download={`${cleanTitle.replace(/\s+/g, '_')}_${videoFormat.toUpperCase()}_${durationMode.toUpperCase()}.webm`}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-serif font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow transition-all"
              >
                <Download className="w-4 h-4 text-stone-950" />
                <span>Volver a Descargar Video</span>
              </a>
            )}

            <button
              type="button"
              onClick={handleDownloadPackage}
              className="px-4 py-3 bg-stone-950 hover:bg-stone-800 border border-amber-800 text-amber-400 font-serif font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
              title="Descarga la portada PNG, el audio master y las letras en un archivo TXT"
            >
              <Download className="w-4 h-4 text-amber-500" />
              <span>Descargar Paquete (Portada + Audio MP3 + Letras)</span>
            </button>
          </div>
        </div>

        {/* Direct YouTube Upload & Metadata Suite */}
        <div className="bg-stone-950/80 border border-amber-900/40 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-red-500" />
              <h3 className="font-serif text-sm font-black uppercase text-amber-300 tracking-wider">
                Publicar en YouTube Studio en 3 Pasos
              </h3>
            </div>
            <a
              href="https://studio.youtube.com/channel?d=ud"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-stone-100 text-xs font-bold font-serif uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors shadow"
            >
              <Youtube className="w-4 h-4 fill-current" />
              <span>Abrir YouTube Studio Upload ↗</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Box 1: Pre-formatted YouTube Title */}
            <div className="bg-stone-900 p-3.5 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono">
                <span className="font-bold text-amber-400 uppercase">1. Título Recomendado:</span>
                <button
                  type="button"
                  onClick={handleCopyTitle}
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedTitle ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTitle ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>
              <p className="bg-stone-950 p-2.5 border border-stone-800 text-stone-200 font-sans select-all line-clamp-2">
                {youtubeTitle}
              </p>
            </div>

            {/* Box 2: Pre-formatted Description */}
            <div className="bg-stone-900 p-3.5 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono">
                <span className="font-bold text-amber-400 uppercase">2. Descripción & Hashtags:</span>
                <button
                  type="button"
                  onClick={handleCopyDesc}
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedDesc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDesc ? '¡Copiada!' : 'Copiar'}</span>
                </button>
              </div>
              <p className="bg-stone-950 p-2.5 border border-stone-800 text-stone-400 font-mono text-[10px] select-all line-clamp-2">
                {youtubeDescription.substring(0, 160)}...
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleCopyAll}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer font-bold"
            >
              {copiedAllBundle ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedAllBundle ? '¡Todo el paquete copiado al portapapeles!' : 'Copiar Título + Letras + Descripción Completa en 1 Clic'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
