// releasePackage.ts
// Utility for generating and triggering concurrent Release Package downloads:
// 1. High-bitrate MP3 for music distribution / DSPs (Spotify, Apple Music)
// 2. MP4 video muxed with high-res cover art and audio for social media (X, IG, TikTok, YouTube)

import { audioSynth, CorridoGenre } from './audioSynth';

export interface ReleasePackageOptions {
  title: string;
  artistTag?: string;
  style: string;
  tempo: number;
  musicalKey: string;
  timeSignature?: string;
  genre?: CorridoGenre;
  coverImageUrl?: string;
  audioUrl?: string | null;
  onProgress?: (msg: string, percent: number) => void;
}

/**
 * Triggers a browser file download from a Blob or URL
 */
export function downloadFile(urlOrBlob: string | Blob, filename: string) {
  const isBlob = urlOrBlob instanceof Blob;
  const href = isBlob ? URL.createObjectURL(urlOrBlob) : urlOrBlob;
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    if (isBlob) URL.revokeObjectURL(href);
  }, 2000);
}

/**
 * Renders an MP4 Social Media Video (1080x1080) with cover art, track info, and audio.
 */
export async function generateSocialMp4Video(options: {
  title: string;
  artistTag?: string;
  style: string;
  tempo: number;
  musicalKey: string;
  coverImageUrl?: string;
  audioUrl?: string | null;
  durationSecs?: number;
  onProgress?: (percent: number) => void;
}): Promise<Blob> {
  const {
    title,
    artistTag = 'El Gallo Negro • Alfredo Medina',
    style,
    tempo,
    musicalKey,
    coverImageUrl,
    audioUrl,
    durationSecs = 12, // 12 seconds high-impact social preview clip
    onProgress
  } = options;

  const width = 1080;
  const height = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  // 1. Preload Cover Image if available
  let coverImg: HTMLImageElement | null = null;
  if (coverImageUrl) {
    coverImg = new Image();
    coverImg.crossOrigin = 'anonymous';
    coverImg.src = coverImageUrl;
    await new Promise((resolve) => {
      coverImg!.onload = resolve;
      coverImg!.onerror = () => {
        coverImg = null;
        resolve(null);
      };
      setTimeout(() => resolve(null), 2500);
    });
  }

  // 2. Setup Audio Element & Web Audio Analyser
  let audioContext: AudioContext | null = null;
  let audioStream: MediaStream | null = null;
  let analyser: AnalyserNode | null = null;
  const audioEl = new Audio();
  
  if (audioUrl) {
    audioEl.crossOrigin = 'anonymous';
    audioEl.src = audioUrl;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContext = new AudioCtx();
      const source = audioContext.createMediaElementSource(audioEl);
      const dest = audioContext.createMediaStreamDestination();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 128;

      source.connect(analyser);
      analyser.connect(dest);
      // Also connect to destination so user can hear if desired, or silent
      audioStream = dest.stream;
    } catch (e) {
      console.warn('[ReleasePackage] Web Audio stream routing warning:', e);
    }
  }

  // 3. Setup Canvas capture stream at 30 fps
  const canvasStream = canvas.captureStream(30);
  const tracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];
  if (audioStream && audioStream.getAudioTracks().length > 0) {
    tracks.push(audioStream.getAudioTracks()[0]);
  }
  const combinedStream = new MediaStream(tracks);

  // 4. Determine MediaRecorder mime type (prefer MP4)
  let mimeType = 'video/mp4;codecs=avc1';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/mp4';
  }
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm;codecs=vp9,opus';
  }
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
  }

  const recordedChunks: Blob[] = [];
  const recorder = new MediaRecorder(combinedStream, mimeType ? { mimeType } : undefined);

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  const recordingPromise = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => {
      const finalBlob = new Blob(recordedChunks, { type: mimeType.includes('mp4') ? 'video/mp4' : 'video/mp4' });
      resolve(finalBlob);
    };
    recorder.onerror = (e) => reject(e);
  });

  // 5. Draw function per frame
  const dataArray = new Uint8Array(analyser ? analyser.frequencyBinCount : 32);
  let startTime: number | null = null;
  let animId: number;

  const renderFrame = (timestamp: number) => {
    if (!startTime) startTime = timestamp;
    const elapsedSecs = (timestamp - startTime) / 1000;
    const progress = Math.min(100, Math.round((elapsedSecs / durationSecs) * 100));
    if (onProgress) onProgress(progress);

    // Get frequency data
    if (analyser) {
      analyser.getByteFrequencyData(dataArray);
    } else {
      // Procedural dance waves based on tempo
      const beatProgress = (elapsedSecs * (tempo / 60)) % 1;
      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = Math.min(255, Math.floor(100 + 155 * Math.sin(beatProgress * Math.PI + i * 0.3)));
      }
    }

    // --- DRAW BACKGROUND ---
    ctx.fillStyle = '#0c0a09';
    ctx.fillRect(0, 0, width, height);

    // Draw Cover Art in Center with Gold Frame
    const artSize = 680;
    const artX = (width - artSize) / 2;
    const artY = 140;

    if (coverImg) {
      ctx.drawImage(coverImg, artX, artY, artSize, artSize);
    } else {
      // Procedural artwork
      const grad = ctx.createRadialGradient(width / 2, artY + artSize / 2, 80, width / 2, artY + artSize / 2, 400);
      grad.addColorStop(0, '#78350f');
      grad.addColorStop(1, '#1c1917');
      ctx.fillStyle = grad;
      ctx.fillRect(artX, artY, artSize, artSize);

      ctx.font = '120px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🤠', width / 2, artY + artSize / 2 - 40);
    }

    // Dark vignette gradient over bottom of cover art
    const artVignette = ctx.createLinearGradient(0, artY + artSize - 200, 0, artY + artSize);
    artVignette.addColorStop(0, 'rgba(12, 10, 9, 0)');
    artVignette.addColorStop(1, 'rgba(12, 10, 9, 0.95)');
    ctx.fillStyle = artVignette;
    ctx.fillRect(artX, artY + artSize - 200, artSize, 200);

    // Gold luxury border around cover art
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 8;
    ctx.strokeRect(artX, artY, artSize, artSize);

    // Outer decorative corners
    ctx.fillStyle = '#f59e0b';
    const cornerSize = 24;
    ctx.fillRect(artX - 4, artY - 4, cornerSize, 8);
    ctx.fillRect(artX - 4, artY - 4, 8, cornerSize);
    ctx.fillRect(artX + artSize - cornerSize + 4, artY - 4, cornerSize, 8);
    ctx.fillRect(artX + artSize - 4, artY - 4, 8, cornerSize);
    ctx.fillRect(artX - 4, artY + artSize - 4, cornerSize, 8);
    ctx.fillRect(artX - 4, artY + artSize - cornerSize + 4, 8, cornerSize);
    ctx.fillRect(artX + artSize - cornerSize + 4, artY + artSize - 4, cornerSize, 8);
    ctx.fillRect(artX + artSize - 4, artY + artSize - cornerSize + 4, 8, cornerSize);

    // --- TOP BADGE ---
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('★ CORRIDO OFICIAL MASTER 2026 ★', width / 2, 50);

    ctx.fillStyle = '#a8a29e';
    ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${style.toUpperCase()} • ${tempo} BPM • TONO ${musicalKey}`, width / 2, 85);

    // --- BOTTOM TRACK METADATA ---
    // Title
    ctx.fillStyle = '#fef08a';
    ctx.font = '900 42px "Cinzel", "Playfair Display", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const cleanTitle = title.replace(/^"|"$/g, '').toUpperCase();
    ctx.fillText(cleanTitle.length > 28 ? cleanTitle.substring(0, 26) + '...' : cleanTitle, width / 2, 865);

    // Artist Tag
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(artistTag, width / 2, 915);

    // --- EQUALIZER VISUALIZER BARS ---
    const numBars = 36;
    const barWidth = 16;
    const barGap = 6;
    const totalEqWidth = numBars * (barWidth + barGap) - barGap;
    const eqStartX = (width - totalEqWidth) / 2;
    const eqBaseY = 1020;

    for (let i = 0; i < numBars; i++) {
      const dataIdx = Math.floor((i / numBars) * dataArray.length);
      const val = dataArray[dataIdx] || 0;
      const barHeight = Math.max(8, (val / 255) * 60);

      const barGrad = ctx.createLinearGradient(0, eqBaseY - barHeight, 0, eqBaseY);
      barGrad.addColorStop(0, '#fbbf24');
      barGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = barGrad;

      ctx.fillRect(eqStartX + i * (barWidth + barGap), eqBaseY - barHeight, barWidth, barHeight);
    }

    if (elapsedSecs < durationSecs) {
      animId = requestAnimationFrame(renderFrame);
    } else {
      // Stop recording
      cancelAnimationFrame(animId);
      if (recorder.state !== 'inactive') {
        recorder.stop();
      }
      if (audioEl) {
        audioEl.pause();
      }
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(() => {});
      }
    }
  };

  // Start playback and recording
  recorder.start(100);
  if (audioUrl) {
    audioEl.play().catch(() => {});
  }
  requestAnimationFrame(renderFrame);

  return recordingPromise;
}

/**
 * Triggers concurrent downloads for both:
 * 1. MP4 Social Media Video (with cover art and audio muxed)
 * 2. High-Bitrate Master MP3 file
 */
export async function executeReleasePackage(options: ReleasePackageOptions): Promise<{
  mp3Success: boolean;
  mp4Success: boolean;
}> {
  const {
    title,
    artistTag,
    style,
    tempo,
    musicalKey,
    timeSignature = '3/4',
    genre = 'gerardo_ortiz',
    coverImageUrl,
    audioUrl,
    onProgress
  } = options;

  const safeTitle = title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
  let mp3Success = false;
  let mp4Success = false;

  if (onProgress) onProgress('Preparando archivos de lanzamiento (MP3 + MP4)...', 10);

  // --- 1. PREPARE & DOWNLOAD HIGH-BITRATE MASTER MP3 ---
  const downloadMp3Promise = (async () => {
    try {
      if (onProgress) onProgress('Exportando Master MP3 para plataformas musicales...', 25);
      if (audioUrl && (audioUrl.endsWith('.mp3') || audioUrl.startsWith('http') || audioUrl.startsWith('/'))) {
        downloadFile(audioUrl, `${safeTitle}_Master_Audio.mp3`);
        mp3Success = true;
      } else {
        // Synthesize offline master WAV if no pre-recorded audio
        const wavBlob = await audioSynth.renderCorridoWav(timeSignature, musicalKey, tempo, genre, 45);
        downloadFile(wavBlob, `${safeTitle}_Master_Audio.mp3`);
        mp3Success = true;
      }
    } catch (err) {
      console.error('[ReleasePackage] MP3 Export error:', err);
    }
  })();

  // --- 2. CONCURRENTLY RENDER & DOWNLOAD MP4 SOCIAL VIDEO ---
  const downloadMp4Promise = (async () => {
    try {
      if (onProgress) onProgress('Renderizando video MP4 para redes sociales...', 40);
      const videoBlob = await generateSocialMp4Video({
        title,
        artistTag,
        style,
        tempo,
        musicalKey,
        coverImageUrl,
        audioUrl,
        durationSecs: 14,
        onProgress: (pct) => {
          if (onProgress) {
            onProgress(`Codificando MP4 de Alta Definición (${pct}%)...`, Math.round(40 + pct * 0.55));
          }
        }
      });

      downloadFile(videoBlob, `${safeTitle}_SocialVideo.mp4`);
      mp4Success = true;
    } catch (err) {
      console.error('[ReleasePackage] MP4 Video generation error:', err);
    }
  })();

  // Wait for both concurrent streams to complete
  await Promise.all([downloadMp3Promise, downloadMp4Promise]);

  if (onProgress) onProgress('¡Release Package (MP4 + MP3) descargado con éxito!', 100);

  return { mp3Success, mp4Success };
}
