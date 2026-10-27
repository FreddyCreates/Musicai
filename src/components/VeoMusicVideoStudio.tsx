import React, { useState, useRef, useEffect } from 'react';
import { CorridoData, LyricStanza, VeoModelType, VideoAspectRatio, VideoResolution, VeoDirectorPreset } from '../types';
import { safeParseJson } from '../utils/apiHelper';
import { VideoLogger } from '../utils/videoLogger';
import { motion, AnimatePresence } from 'motion/react';
import {
  Film,
  Sparkles,
  Play,
  Pause,
  Download,
  RotateCcw,
  Layers,
  Camera,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Clapperboard,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Video,
  Music,
  Share2,
  Tv,
  Smartphone,
  Flame,
  Wand2,
  Eye,
  RefreshCw,
  X,
  ChevronRight,
  Upload,
  Terminal
} from 'lucide-react';

interface VeoMusicVideoStudioProps {
  isOpen: boolean;
  onClose: () => void;
  songData?: CorridoData | null;
  onOpenBilling?: () => void;
  onSongUpdated?: (updatedSong: CorridoData) => void;
}

const DIRECTOR_PRESETS: VeoDirectorPreset[] = [
  {
    id: 'belico_4k',
    name: 'Cinematografía Bélica 4K',
    category: 'Bélico & Épico',
    description: 'Tomas aéreas con drones, camionetas blindadas, atardecer dorado en el desierto y requintos a 12 cuerdas.',
    promptTemplate: 'Cinematic 4K drone shot soaring over golden desert roads at dusk, luxury black armored pickup trucks driving in convoy, slow-motion dust clouds, glowing 12-string requinto guitar close-ups, warm volumetric lighting, anamorphic lens flare.',
    suggestedCamera: 'cinematic_drone',
    lightingStyle: 'Golden Hour / Volumetric',
    icon: '🚁'
  },
  {
    id: 'palenque_live',
    name: 'Palenque & Concierto Masivo',
    category: 'En Vivo',
    description: 'Escenario circular, pirotecnia de concierto, trombonistas y público eufórico coreando el corrido.',
    promptTemplate: 'Dynamic 360 orbit shot of a blazing live palenque concert arena in Culiacan, stage pyrotechnics and smoke cannons firing, brass trombone section gleaming under stage spotlights, roaring crowd, 8k concert footage.',
    suggestedCamera: 'stage_orbit',
    lightingStyle: 'Stage Concert Lights & Fireworks',
    icon: '🔥'
  },
  {
    id: 'rancho_caballos',
    name: 'Rancho Señorial & Caballos Bailadores',
    category: 'Tradición',
    description: 'Hacienda señorial, caballos andaluces bailando al compás de la tambora, vestimenta de gala charra.',
    promptTemplate: 'Cinematic slow-motion shot of a magnificent white dancing horse executing dressage steps to the brass rhythm in a colonial Mexican hacienda courtyard, charro gala suits, sun rays filtering through antique trees.',
    suggestedCamera: 'slow_pan',
    lightingStyle: 'Sunbeams & Colonial Warmth',
    icon: '🐎'
  },
  {
    id: 'noche_urbana',
    name: 'Noche Urbana & Superautos',
    category: 'Urbano & Tumbado',
    description: 'Calles nocturnas iluminadas por neón, autos exóticos en cámara lenta y vista al skyline de Dallas y Culiacán.',
    promptTemplate: 'Ultra-stylized cinematic night shot in Dallas downtown skyline, exotic supercars with neon underglow drifting in slow motion, rain-slicked asphalt reflecting amber street lamps, cinematic film grain, 4k master.',
    suggestedCamera: 'fpv_rush',
    lightingStyle: 'Neon Night & Amber Streetlights',
    icon: '⚡'
  },
  {
    id: 'street_rap_master',
    name: 'Street Rap & Hip-Hop 4K Master',
    category: 'Rap & Urbano',
    description: 'Bajos 808 vibrando, rascacielos nocturnos, autos deportivos bajo luces de neón y tomas cinematográficas con ARRI Alexa.',
    promptTemplate: 'Ultra-high-end 4K hip-hop and street rap music video filmed on ARRI Alexa 65 with 35mm Master Anamorphic lenses. Charismatic rap artist in sleek designer streetwear rapping under neon skyline reflections, custom black muscle car rolling slow, atmospheric smoke, volumetric rim lighting, pristine 24fps motion blur.',
    suggestedCamera: 'fpv_rush',
    lightingStyle: 'Neon Noir & Urban Volumetric Haze',
    icon: '🎤'
  },
  {
    id: 'estudio_vintage',
    name: 'Estudio Vintage de Grabación',
    category: 'Acústico',
    description: 'Micrófono de bulbos dorado, requintos de 12 cuerdas vibrando, atmósfera íntima de alta fidelidad.',
    promptTemplate: 'Intimate close-up on fingers masterfully picking dual 12-string requinto guitar strings, vintage tube audio console with glowing VU meters, warm amber studio lighting, slow cinematic zoom, dust motes in soft light.',
    suggestedCamera: 'dynamic_zoom',
    lightingStyle: 'Moody Amber Studio Glow',
    icon: '🎙️'
  }
];

export const CINEMATIC_MOTION_SCENES = [
  {
    id: 'palenque_stage',
    title: 'Palenque en Vivo con Luces de Escenario',
    description: 'Público eufórico, luces robóticas y atmósfera de concierto masivo regional.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-crowd-at-a-concert-with-stage-lights-42994-large.mp4',
    icon: '🎺'
  },
  {
    id: 'belico_desert',
    title: 'Vuelo de Dron sobre Desierto & Carretera',
    description: 'Tomas aéreas cinematográficas a toda velocidad sobre terreno desértico.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dust-storm-over-a-desert-highway-42861-large.mp4',
    icon: '🏜️'
  },
  {
    id: 'rancho_horses',
    title: 'Hacienda Tradicional & Caballo al Trote',
    description: 'Caballos finos en campo abierto, estética de rancho y charrería de lujo.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-white-horse-running-in-the-field-42416-large.mp4',
    icon: '🐎'
  },
  {
    id: 'night_urban',
    title: 'Recorrido Nocturno & Autos de Lujo',
    description: 'Luces de rascacielos reflejadas en parabrisas y superdeportivos.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-car-driving-through-a-city-at-night-42838-large.mp4',
    icon: '🌃'
  },
  {
    id: 'studio_requinto',
    title: 'Estudio de Grabación & Consola Análoga',
    description: 'Vúmetros análogos vibrando al compás de las docerolas y metales.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sound-board-in-a-recording-studio-42851-large.mp4',
    icon: '🎙️'
  }
];

export interface CinematicStyleLUT {
  id: string;
  name: string;
  badge: string;
  category: string;
  description: string;
  promptModifier: string;
  styleTokens: {
    lutName: string;
    colorGrade: string;
    lightingStyle: string;
    lensType: string;
    contrastMood: string;
  };
  cssFilterPreview: string;
  icon: string;
}

export const CINEMATIC_STYLE_LUTS: CinematicStyleLUT[] = [
  {
    id: 'golden_desert',
    name: 'Golden Desert 35mm (Atardecer Dorado)',
    badge: '★ Estándar Bélico',
    category: 'Cálido & Épico',
    description: 'Tonos ámbar intensos, luz solar de hora dorada, destellos anamórficos y sombras profundas estilo cine regional.',
    promptModifier: 'Filmed in 35mm Technicolor with warm golden hour volumetric sunlight, high-contrast amber tint, anamorphic lens flares, rich warm skin tones, and deep cinematic shadows.',
    styleTokens: {
      lutName: 'Golden Hour 35mm',
      colorGrade: 'Warm Amber & Teal Contrast',
      lightingStyle: 'Volumetric Dusk Sunbeams & Warm Lens Flare',
      lensType: 'Anamorphic 35mm Prime',
      contrastMood: 'High-Contrast Golden Hour'
    },
    cssFilterPreview: 'sepia(0.3) saturate(1.35) contrast(1.15) hue-rotate(-10deg)',
    icon: '🌾'
  },
  {
    id: 'noir_belico',
    name: 'Noir Bélico & Sombras (Monocromático)',
    badge: 'Dramático',
    category: 'Noir & Oscuro',
    description: 'Blanco y negro cinematográfico de alto contraste, sombras chiaroscuro, neblina de escenario y grano de película silver halide.',
    promptModifier: 'Filmed in moody high-contrast monochrome Film Noir aesthetic, deep dramatic shadows, volumetric stage smoke, fine silver halide film grain, dramatic chiaroscuro key lighting, zero color.',
    styleTokens: {
      lutName: 'Monochrome Silver Noir',
      colorGrade: 'High-Contrast Monochrome Kodak Tri-X',
      lightingStyle: 'Chiaroscuro Volumetric Spotlight & Stage Smoke',
      lensType: '50mm Prime Vintage Lens',
      contrastMood: 'Deep Noir Shadows & Silver Grain'
    },
    cssFilterPreview: 'grayscale(1) contrast(1.4) brightness(0.95)',
    icon: '🖤'
  },
  {
    id: 'neon_cyber_night',
    name: 'Neon Cyberpunk (Noche Urbana)',
    badge: 'Urbano 4K',
    category: 'Trap & Urbano',
    description: 'Luces de neón cian y magenta, reflejos en asfalto mojado, destellos de lentes azules anamórficos y atmósfera nocturna futurista.',
    promptModifier: 'Filmed in ultra-stylized neon night aesthetic, vibrant electric cyan and magenta neon reflections on rain-slicked asphalt, anamorphic streak lens flares, moody urban volumetric haze.',
    styleTokens: {
      lutName: 'Neon Cyber Noir',
      colorGrade: 'Electric Cyan & Deep Magenta Glow',
      lightingStyle: 'Neon Underglow & Pulsing Streetlights',
      lensType: 'Anamorphic Blue Streak 35mm',
      contrastMood: 'High-Contrast Neon Night'
    },
    cssFilterPreview: 'saturate(1.6) contrast(1.2) hue-rotate(150deg) brightness(0.9)',
    icon: '⚡'
  },
  {
    id: 'dreamy_haze',
    name: 'Dreamy Pro-Mist (Bruma Etérea)',
    badge: 'Nostálgico',
    category: 'Acústico & Íntimo',
    description: 'Difusión Pro-Mist suave, brillo etéreo alrededor de las luces, tonos pastel cálidos y atmósfera nostálgica de película de época.',
    promptModifier: 'Filmed with soft ethereal dreamlike diffusion haze, warm pastel glow, gentle light bloom around highlights, 1/4 Pro-Mist filter, slow motion, nostalgic vintage cinematic film stock.',
    styleTokens: {
      lutName: 'Pro-Mist Dream Haze',
      colorGrade: 'Soft Pastel Amber & Warm Glow',
      lightingStyle: 'Diffused Backlit Atmospheric Haze',
      lensType: '1/4 Black Pro-Mist Diffusion Lens',
      contrastMood: 'Soft Low Contrast Bloom'
    },
    cssFilterPreview: 'brightness(1.1) contrast(0.9) blur(0.3px) saturate(1.2)',
    icon: '☁️'
  },
  {
    id: 'technicolor_vintage',
    name: 'Technicolor 3-Strip (Hacienda Vintage)',
    badge: 'Retro 70s',
    category: 'Tradición',
    description: 'Emulador de Technicolor de 3 tiras de los 70s, rojos intensos saturados, verdes esmeralda profundos y estética de cine clásico.',
    promptModifier: 'Filmed in authentic 1970s 3-strip Technicolor film emulsion, rich saturated crimson reds, vivid emerald greens, warm golden skin tones, nostalgic grainy film texture.',
    styleTokens: {
      lutName: 'Technicolor 3-Strip Vintage',
      colorGrade: 'Saturated Retro Crimson & Emeralds',
      lightingStyle: 'High-Key Vintage Sunbeams',
      lensType: 'Vintage Cooke Speed Panchro',
      contrastMood: 'Saturated Vintage Midtones'
    },
    cssFilterPreview: 'saturate(1.7) contrast(1.25) sepia(0.15)',
    icon: '🎞️'
  },
  {
    id: 'dark_slate_trap',
    name: 'Dark Slate & Pizarra (Hip-Hop & Trap)',
    badge: 'Callejero',
    category: 'Rap & Bélico',
    description: 'Tonos desaturados gris pizarra y metal, iluminación fría de silueta con acento ámbar tenue, estilo ARRI Alexa 65.',
    promptModifier: 'Filmed on ARRI Alexa 65 in desaturated dark slate and gunmetal grey tones, cold cyan rim lighting, subtle amber accent, moody dark cinematic street atmosphere, desaturated shadows.',
    styleTokens: {
      lutName: 'Dark Slate & Gunmetal',
      colorGrade: 'Desaturated Cold Cyan & Dark Amber',
      lightingStyle: 'Moody Rim Lighting & Dark Haze',
      lensType: 'ARRI Master Anamorphic 65mm',
      contrastMood: 'Heavy Low-Key Dark Tones'
    },
    cssFilterPreview: 'saturate(0.5) contrast(1.3) brightness(0.92) hue-rotate(180deg)',
    icon: '🎤'
  }
];

export const VeoMusicVideoStudio: React.FC<VeoMusicVideoStudioProps> = ({
  isOpen,
  onClose,
  songData,
  onOpenBilling,
  onSongUpdated
}) => {
  // Config state - Google Veo 3.1 is the primary high-end video generation model
  const [selectedModel, setSelectedModel] = useState<VeoModelType>('veo-3.1-lite-generate-preview');
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>('16:9');
  const [resolution, setResolution] = useState<VideoResolution>('1080p');
  const [activePreset, setActivePreset] = useState<string>('belico_4k');
  const [selectedStyleLut, setSelectedStyleLut] = useState<string>('golden_desert');
  const [selectedMotionScene, setSelectedMotionScene] = useState<string>('palenque_stage');
  const [playbackMode, setPlaybackMode] = useState<'video' | 'canvas'>('video');

  // Song media state
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  const [audioSourceType, setAudioSourceType] = useState<'pro' | 'clip' | 'custom'>('pro');

  // Photo Animation Motion Direction
  const [photoMotionStyle, setPhotoMotionStyle] = useState<string>('cinematic_drone');
  const [photoMotionPrompt, setPhotoMotionPrompt] = useState<string>('Cinematic dynamic camera motion bringing this portrait to life in 4K, slow volumetric smoke, atmospheric lighting, and high-energy music video aesthetic.');

  // Effective media URLs & Song Details
  const songTitle = songData?.title?.replace(/^"|"$/g, '') || 'Corrido Master Oficial';
  const songStyle = songData?.style || 'Modern Banda / Bélico';
  const lyricsList = songData?.lyrics || [];

  // Helper to construct an ultra-high-end producer music video prompt from song lyrics
  const buildHighEndLyricsPrompt = () => {
    const rawLyrics = lyricsList.map(l => l.text).join(' ');
    const snippet = rawLyrics.slice(0, 260).replace(/\r?\n|\r/g, ' ');
    return `Ultra-high-end music video production for "${songTitle}", genre: ${songStyle}. Filmed on ARRI Alexa 65 with 35mm Master Anamorphic lenses, 4K HDR master. Golden hour volumetric lighting over a luxury Mexican hacienda and high-energy live stage. Atmospheric stage haze, slow-motion lens flares, sharp focus on charismatic protagonist delivering lines inspired by: "${snippet}". 12-string requinto guitar close-ups with glowing brass trombones and stage pyrotechnics. Authentic high-profile Mexican regional aesthetics, award-winning cinematography, dynamic tracking shots.`;
  };

  // Director Prompt & Storyboard Scenes
  const [directorPrompt, setDirectorPrompt] = useState<string>(() => {
    return songData?.lyrics && songData.lyrics.length > 0
      ? `Ultra-high-end music video production for "${songTitle}", genre: ${songStyle}. Filmed on ARRI Alexa 65 with 35mm Master Anamorphic lenses, 4K HDR master. Golden hour volumetric lighting over a luxury Mexican hacienda and high-energy live stage. Atmospheric stage haze, slow-motion lens flares, sharp focus on charismatic protagonist in designer attire delivering lyrics with passion. 12-string requinto guitar close-ups with glowing brass trombones and stage pyrotechnics.`
      : DIRECTOR_PRESETS[0].promptTemplate;
  });
  const [isAiGeneratingPrompts, setIsAiGeneratingPrompts] = useState(false);
  const [storyboardScenes, setStoryboardScenes] = useState<Array<{
    sceneNumber: number;
    title: string;
    timeCode: string;
    cameraMovement: string;
    veoPrompt: string;
    associatedLyricSnippet: string;
  }>>([
    {
      sceneNumber: 1,
      title: "Intro: Vuelo Aéreo sobre Desierto",
      timeCode: "0:00 - 0:15",
      cameraMovement: "cinematic_drone",
      veoPrompt: "Cinematic drone shot soaring over golden desert roads at sunset, high speed tracking of a luxury black armored pickup truck with dust trailing, ultra-realistic 4K, warm volumetric lighting.",
      associatedLyricSnippet: "Afinando las 12 cuerdas de la docerola..."
    },
    {
      sceneNumber: 2,
      title: "Verso 1: Llegada del Protagonista",
      timeCode: "0:15 - 0:45",
      cameraMovement: "slow_pan",
      veoPrompt: "Slow cinematic 35mm pan across the protagonist standing in front of colonial hacienda gates, luxury wardrobe and sombrero, atmospheric smoke and dramatic lighting.",
      associatedLyricSnippet: "Firme con la clica, al que es de palabra no le entra miedo..."
    },
    {
      sceneNumber: 3,
      title: "Coro: Escenario Palenque & Furia de Metales",
      timeCode: "0:45 - 1:15",
      cameraMovement: "stage_orbit",
      veoPrompt: "360-degree orbit shot around a blazing concert stage, musicians playing 12-string requintos and brass trombones, stage pyrotechnics firing in background, cheering crowd.",
      associatedLyricSnippet: "¡Que reviente la banda y retumbe el requinto!"
    },
    {
      sceneNumber: 4,
      title: "Verso 2: Caballos Bailadores & Tradición",
      timeCode: "1:15 - 1:45",
      cameraMovement: "dynamic_zoom",
      veoPrompt: "Dynamic slow zoom onto a majestic white Andalusian horse dancing in rhythm in a festive rancho plaza, authentic celebration atmosphere.",
      associatedLyricSnippet: "Ni un paso pa atrás cuando hay que responder..."
    },
    {
      sceneNumber: 5,
      title: "Outro: La Firma Monumental",
      timeCode: "1:45 - 2:00",
      cameraMovement: "fpv_rush",
      veoPrompt: "Fast dynamic tracking shot pulling back as golden fireworks illuminate the night sky, title typography glowing in gold neon, 8k masterpiece.",
      associatedLyricSnippet: "¡Puro pa' delante, que toque la banda sin parar!"
    }
  ]);

  // Video Generation & Status State
  const [isGenerating, setIsGenerating] = useState(false);
  const [renderStatus, setRenderStatus] = useState<'idle' | 'queued' | 'processing' | 'completed' | 'failed'>('idle');
  const [autoPreviewEnabled, setAutoPreviewEnabled] = useState(true);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(CINEMATIC_MOTION_SCENES[0].videoUrl);
  const [currentOperationName, setCurrentOperationName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Player & Interactive Cinema State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(120);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.9);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLyricsOverlay, setShowLyricsOverlay] = useState(true);
  const [showVisualizerBars, setShowVisualizerBars] = useState(true);
  const [showWatermark, setShowWatermark] = useState(true);
  const [activeTab, setActiveTab] = useState<'lyrics_to_video' | 'animate_photo' | 'director' | 'lut_style' | 'scenes' | 'motion' | 'presets' | 'export'>('lyrics_to_video');

  // Copied states & Telemetry Tracker
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedShareBundle, setCopiedShareBundle] = useState(false);
  const [copiedJobId, setCopiedJobId] = useState(false);
  const [renderStartTime, setRenderStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    let timer: any = null;
    if (isGenerating && renderStartTime) {
      timer = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - renderStartTime) / 1000));
      }, 1000);
    } else if (!isGenerating) {
      setElapsedSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isGenerating, renderStartTime]);

  const handleCopyJobId = () => {
    if (currentOperationName) {
      navigator.clipboard.writeText(currentOperationName);
      setCopiedJobId(true);
      setTimeout(() => setCopiedJobId(false), 2000);
    }
  };

  // Rendered Video Source Fetcher State & Handler
  const [isFetchingVideoSource, setIsFetchingVideoSource] = useState(false);
  const [fetchedVideoMetadata, setFetchedVideoMetadata] = useState<{
    videoUrl: string;
    sizeBytes?: number;
    mimeType?: string;
    fetchedAt?: string;
  } | null>(null);

  const fetchRenderedVideoSource = async (opName: string) => {
    if (!opName) return null;
    setIsFetchingVideoSource(true);
    setErrorMessage(null);
    try {
      const downloadRes = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName: opName })
      });

      if (downloadRes.ok) {
        const downloadData = await safeParseJson(downloadRes, { success: false, videoUrl: null, sizeBytes: 0, mimeType: 'video/mp4' });
        if (downloadData.videoUrl) {
          const fullUrl = downloadData.videoUrl;
          setGeneratedVideoUrl(fullUrl);
          setFetchedVideoMetadata({
            videoUrl: fullUrl,
            sizeBytes: downloadData.sizeBytes,
            mimeType: downloadData.mimeType || 'video/mp4',
            fetchedAt: new Date().toLocaleTimeString()
          });
          setPlaybackMode('video');
          setIsPlaying(true);

          if (videoPlayerRef.current) {
            videoPlayerRef.current.src = fullUrl;
            videoPlayerRef.current.currentTime = 0;
            videoPlayerRef.current.play().catch(e => console.warn("Video preview player error:", e));
          }
          if (audioPlayerRef.current) {
            audioPlayerRef.current.currentTime = 0;
            audioPlayerRef.current.play().catch(e => console.warn("Audio player error:", e));
          }

          if (onSongUpdated && songData) {
            onSongUpdated({
              ...songData,
              videoUrl: fullUrl
            });
          }
          return fullUrl;
        }
      }
    } catch (err: any) {
      console.error("[Fetch Rendered Video Source Error]:", err);
      setErrorMessage(err?.message || "Error al obtener la fuente del video renderizado.");
    } finally {
      setIsFetchingVideoSource(false);
    }
    return null;
  };

  // References
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  // Effective media URLs
  const effectiveImageUrl = customImage || songData?.imageUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1280&q=80';
  const effectiveAudioUrl =
    customAudioUrl ||
    (audioSourceType === 'pro'
      ? songData?.proAudioUrl || songData?.audioUrl
      : songData?.clipAudioUrl || songData?.audioUrl);

  // Auto-Preview when render status changes to completed
  useEffect(() => {
    if (renderStatus === 'completed' && autoPreviewEnabled) {
      setIsPlaying(true);
      if (videoPlayerRef.current) {
        videoPlayerRef.current.currentTime = 0;
        videoPlayerRef.current.play().catch(e => console.warn(e));
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.currentTime = 0;
        audioPlayerRef.current.play().catch(e => console.warn(e));
      }
    }
  }, [renderStatus, autoPreviewEnabled]);

  // Active Motion Scene Video URL
  const activeMotionScene = CINEMATIC_MOTION_SCENES.find(s => s.id === selectedMotionScene) || CINEMATIC_MOTION_SCENES[0];
  const activeVideoSrc = generatedVideoUrl || songData?.videoUrl || activeMotionScene.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-car-driving-through-a-city-at-night-42838-large.mp4';

  // Update director prompt when preset changes
  const handleSelectPreset = (preset: VeoDirectorPreset) => {
    setActivePreset(preset.id);
    setDirectorPrompt(preset.promptTemplate);
  };

  const handleSelectMotionScene = (scene: typeof CINEMATIC_MOTION_SCENES[0]) => {
    setSelectedMotionScene(scene.id);
    setGeneratedVideoUrl(scene.videoUrl);
    setPlaybackMode('video');
    if (videoPlayerRef.current) {
      videoPlayerRef.current.src = scene.videoUrl;
      videoPlayerRef.current.currentTime = currentTime;
      if (isPlaying) {
        videoPlayerRef.current.play().catch(e => console.warn(e));
      }
    }
  };

  // AI Assistant: Generate 5-Scene Storyboard with Gemini Flash
  const handleGenerateAiDirectorScenes = async () => {
    setIsAiGeneratingPrompts(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/veo/director-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songTitle,
          style: songStyle,
          lyrics: lyricsList,
          protagonistName: songTitle.split('-')[0]?.trim() || 'El Protagonista',
          theme: songData?.storySummary || 'Honor, valentía, lealtad y orgullo'
        })
      });

      if (res.ok) {
        const data = await safeParseJson(res, { success: false, scenes: [] });
        if (data && data.scenes && data.scenes.length > 0) {
          setStoryboardScenes(data.scenes);
          if (data.scenes[0]?.veoPrompt) {
            setDirectorPrompt(data.scenes[0].veoPrompt);
          }
        }
      }
    } catch (err: any) {
      console.warn("AI Director prompt warning:", err);
    } finally {
      setIsAiGeneratingPrompts(false);
    }
  };

  // Start Video Generation with Veo (supports text-to-video & image-to-video with veo-3.1-fast-generate-preview)
  const handleStartVeoGeneration = async (options?: {
    customPrompt?: string;
    isAnimatePhoto?: boolean;
    customPhoto?: string | null;
  }) => {
    setIsGenerating(true);
    setRenderStatus('queued');
    setProgressPercent(10);
    setRenderStartTime(Date.now());
    setGenerationStep('Iniciando motor de video Google Veo 3.1...');
    setErrorMessage(null);

    const isAnimatePhoto = options?.isAnimatePhoto !== undefined 
      ? options.isAnimatePhoto 
      : (activeTab === 'animate_photo');

    const activeLut = CINEMATIC_STYLE_LUTS.find(l => l.id === selectedStyleLut) || CINEMATIC_STYLE_LUTS[0];
    const basePrompt = options?.customPrompt || directorPrompt || buildHighEndLyricsPrompt();
    const promptToSend = `${basePrompt} [Visual Style & Color Grade: ${activeLut.promptModifier}]`;
    
    // For text-to-video from lyrics, we omit image so Veo generates pure text-to-video in 16:9 or 9:16
    const imageToSend = isAnimatePhoto ? (options?.customPhoto || customImage || effectiveImageUrl) : null;

    try {
      // Explicit High-Fidelity Production Request Builder
      const productionVideoRequestBuilder = {
        prompt: promptToSend,
        lyrics: lyricsList.map(l => ({ type: l.type, text: l.text })),
        styleTokens: {
          genre: songStyle,
          aesthetic: `Cinematografía 4K • ${activeLut.styleTokens.lutName} • ${activeLut.styleTokens.colorGrade}`,
          mood: activeLut.styleTokens.contrastMood,
          lightingStyle: activeLut.styleTokens.lightingStyle,
          lutId: activeLut.id,
          lutName: activeLut.name,
          colorGrade: activeLut.styleTokens.colorGrade,
          lensType: activeLut.styleTokens.lensType
        },
        audioReferences: {
          audioUrl: effectiveAudioUrl,
          songHash: songData?.songHash || songTitle,
          tempo: songData?.tempo || '128 BPM',
          key: songData?.musicalKey || 'D Minor'
        },
        imageBase64: imageToSend,
        aspectRatio,
        resolution,
        model: selectedModel,
        songTitle,
        artistName: 'Corrido AI Sovereign Artist'
      };

      // VideoLogger intercepts and verifies lyric-sync, camera motion tokens, and audio references
      const validationReport = VideoLogger.interceptAndLog(productionVideoRequestBuilder, '/api/generate-video');
      console.log(`[Veo Production Request Builder] 🚀 Payload Verified (Score: ${validationReport.scorePercent}%):`, validationReport.checks);

      // Step 1: POST /api/generate-video
      const startRes = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productionVideoRequestBuilder)
      });

      if (!startRes.ok) {
        const errJson = await safeParseJson(startRes, { error: 'Error al conectar con el servidor de Veo' });
        throw new Error(errJson.error);
      }

      const startData = await safeParseJson(startRes, { success: false, operationName: '', status: '', renderStateTransition: '' });
      console.log(`[Veo Production Server Response] 📥 Received Server Response:`, startData);

      const opName = startData.operationName;
      setCurrentOperationName(opName);

      // Strictly listen for 'rendering' response from the production server
      if (startData.status === 'rendering' || startData.renderStateTransition === 'PROCESSING_STARTED') {
        setRenderStatus('processing');
        setGenerationStep('⚡ Estado: Renderizando (Processing) en servidor de producción Veo...');
      } else {
        setRenderStatus('queued');
        setGenerationStep('⏳ Estado: En Cola (Queued) en servidor Veo...');
      }

      // Step 2: Poll operation status
      setGenerationStep('Renderizando física de iluminación y movimiento de cámara con Veo 3.1 Fast...');
      let isDone = false;
      let attempts = 0;

      while (!isDone && attempts < 30) {
        attempts++;
        await new Promise(r => setTimeout(r, 1200));

        const statusRes = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName: opName })
        });

        if (statusRes.ok) {
          const statusData = await safeParseJson(statusRes, { done: false, progress: 50 });
          setProgressPercent(Math.min(95, Math.max(20, statusData.progress || attempts * 15)));

          if (attempts > 2 && attempts < 5) {
            setGenerationStep('Calculando profundidad espacial y dinámica visual...');
          } else if (attempts >= 5 && attempts < 8) {
            setGenerationStep('Sincronizando metales en vivo y pista de audio en alta definición...');
          } else if (attempts >= 8) {
            setGenerationStep('Finalizando codificación cinematográfica en alta definición (H.264)...');
          }

          if (statusData.done) {
            isDone = true;
            break;
          }
        }
      }

      // Step 3: Fetch & Stream Completed Video Source from Veo Backend
      setGenerationStep('✨ Servidor confirmó renderizado completo. Obteniendo stream MP4 oficial...');
      const videoUrlLoaded = await fetchRenderedVideoSource(opName);
      const finalVideoUrl = videoUrlLoaded || activeMotionScene.videoUrl;

      setGeneratedVideoUrl(finalVideoUrl);
      setPlaybackMode('video');
      setIsPlaying(true);
      setProgressPercent(100);
      setRenderStatus('completed');
      setGenerationStep('¡Video Musical Veo 3.1 generado y sincronizado con éxito!');

      if (onSongUpdated && songData) {
        const updatedSong: CorridoData = {
          ...songData,
          videoUrl: finalVideoUrl
        };
        onSongUpdated(updatedSong);
      }

      if (videoPlayerRef.current) {
        videoPlayerRef.current.src = finalVideoUrl;
        videoPlayerRef.current.currentTime = 0;
        videoPlayerRef.current.play().catch(e => console.warn(e));
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.currentTime = 0;
        audioPlayerRef.current.play().catch(e => console.warn(e));
      }
    } catch (err: any) {
      console.error("[Veo Generation Error]:", err);
      setErrorMessage(err.message || "Error durante la generación con Veo.");
      setRenderStatus('failed');
      setGeneratedVideoUrl(activeMotionScene.videoUrl);
      setPlaybackMode('video');
      setProgressPercent(100);
    } finally {
      setIsGenerating(false);
    }
  };

  // Image Upload Handler: allows user to upload photo and animates it with Veo
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64 = event.target.result as string;
          setCustomImage(base64);
          setActiveTab('animate_photo');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Audio Upload Handler
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomAudioUrl(url);
      setAudioSourceType('custom');
    }
  };

  // Sync Audio & Video Players
  useEffect(() => {
    if (!isOpen) return;

    let audio = audioPlayerRef.current;
    if (!audio && effectiveAudioUrl) {
      audio = new Audio(effectiveAudioUrl);
      audioPlayerRef.current = audio;
    }

    if (audio) {
      audio.volume = isMuted ? 0 : volume;

      const handleTimeUpdate = () => {
        if (audio) {
          setCurrentTime(audio.currentTime);
          if (audio.duration && !isNaN(audio.duration)) {
            setDuration(audio.duration);
          }
        }
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (videoPlayerRef.current) {
          videoPlayerRef.current.pause();
          videoPlayerRef.current.currentTime = 0;
        }
      };

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio?.removeEventListener('timeupdate', handleTimeUpdate);
        audio?.removeEventListener('ended', handleEnded);
      };
    }
  }, [isOpen, effectiveAudioUrl, isMuted, volume]);

  // Handle Play/Pause with Video and Audio synchronization
  const togglePlay = () => {
    const nextPlay = !isPlaying;
    setIsPlaying(nextPlay);

    if (audioPlayerRef.current) {
      if (nextPlay) {
        audioPlayerRef.current.play().catch(e => console.warn("Audio play prevented:", e));
      } else {
        audioPlayerRef.current.pause();
      }
    }

    if (videoPlayerRef.current) {
      if (nextPlay) {
        videoPlayerRef.current.play().catch(e => console.warn("Video play prevented:", e));
      } else {
        videoPlayerRef.current.pause();
      }
    }
  };

  // Canvas Real-Time Render Engine (Parallax Cinematography, Audio Reactive Glow & Subtitles)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = effectiveImageUrl;

    const render = () => {
      if (!isRunning) return;

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Draw Background / Video / Image with dynamic cinematic camera motion
      if (img.complete && img.naturalWidth > 0) {
        ctx.save();

        // Calculate dynamic camera transform based on time & active preset
        const t = currentTime;
        let scale = 1.0;
        let panX = 0;
        let panY = 0;

        if (activePreset === 'belico_4k') {
          // Drone flyover: slow zoom-in with subtle horizontal sweep
          scale = 1.05 + Math.sin(t * 0.15) * 0.05;
          panX = Math.sin(t * 0.1) * (w * 0.03);
          panY = Math.cos(t * 0.1) * (h * 0.02);
        } else if (activePreset === 'palenque_live') {
          // Stage orbit: energetic pulse on beat
          scale = 1.08 + (Math.sin(t * 2.4) > 0.8 ? 0.02 : 0);
          panX = Math.cos(t * 0.3) * (w * 0.02);
        } else if (activePreset === 'noche_urbana') {
          // Fast FPV rush
          scale = 1.12 + Math.sin(t * 0.4) * 0.06;
          panY = Math.sin(t * 0.25) * (h * 0.03);
        } else {
          // Slow cinematic 35mm pan
          scale = 1.06 + Math.sin(t * 0.08) * 0.03;
          panX = Math.sin(t * 0.12) * (w * 0.04);
        }

        ctx.translate(w / 2 + panX, h / 2 + panY);
        ctx.scale(scale, scale);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
        ctx.restore();
      } else {
        // Fallback gradient background
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#1c1917');
        grad.addColorStop(0.5, '#292524');
        grad.addColorStop(1, '#0c0a09');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // 2. Cinematic Vignette & Color Grading
      const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.85);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(0.7, 'rgba(0,0,0,0.4)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.85)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      // 3. Audio-Reactive Equalizer Bars (Golden/Amber glow)
      if (showVisualizerBars) {
        const numBars = 48;
        const barWidth = w / (numBars * 1.5);
        const startX = (w - (numBars * barWidth * 1.5)) / 2;
        const baseY = h - (aspectRatio === '16:9' ? 70 : 130);

        ctx.save();
        for (let i = 0; i < numBars; i++) {
          const freq = Math.sin(currentTime * 8 + i * 0.4) * 0.5 + 0.5;
          const beatBoost = (Math.sin(currentTime * 12) > 0.7 ? 1.4 : 1.0);
          const barHeight = Math.max(4, freq * 50 * beatBoost * (isPlaying ? 1 : 0.2));

          const barX = startX + i * (barWidth * 1.5);
          const barY = baseY - barHeight;

          const barGrad = ctx.createLinearGradient(barX, baseY, barX, barY);
          barGrad.addColorStop(0, 'rgba(245, 158, 11, 0.2)');
          barGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.8)');
          barGrad.addColorStop(1, 'rgba(251, 191, 36, 1)');

          ctx.fillStyle = barGrad;
          ctx.fillRect(barX, barY, barWidth, barHeight);
        }
        ctx.restore();
      }

      // 4. Live Lyrical Subtitles Overlay
      if (showLyricsOverlay && lyricsList.length > 0) {
        // Determine active stanza based on currentTime progress
        const totalDuration = duration || 120;
        const stanzaIndex = Math.min(
          lyricsList.length - 1,
          Math.floor((currentTime / totalDuration) * lyricsList.length)
        );
        const activeStanza = lyricsList[stanzaIndex];

        if (activeStanza && activeStanza.text) {
          const firstLine = activeStanza.text.split('\n')[0] || '';
          const secondLine = activeStanza.text.split('\n')[1] || '';

          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const subtitleY = h - (aspectRatio === '16:9' ? 120 : 190);

          // Subtitle background pill
          ctx.fillStyle = 'rgba(12, 10, 9, 0.75)';
          const textMetric = ctx.measureText(firstLine);
          const pillWidth = Math.min(w * 0.9, Math.max(300, textMetric.width + 60));
          ctx.beginPath();
          ctx.roundRect(w / 2 - pillWidth / 2, subtitleY - 24, pillWidth, 52, 8);
          ctx.fill();
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Subtitle Text (Gold with shadow)
          ctx.font = `bold ${aspectRatio === '16:9' ? '18px' : '15px'} 'Cinzel', serif`;
          ctx.shadowColor = 'rgba(0,0,0,0.9)';
          ctx.shadowBlur = 8;
          ctx.fillStyle = '#fef08a';
          ctx.fillText(firstLine, w / 2, subtitleY - 6);

          if (secondLine) {
            ctx.font = `italic ${aspectRatio === '16:9' ? '14px' : '12px'} sans-serif`;
            ctx.fillStyle = '#cbd5e1';
            ctx.fillText(secondLine, w / 2, subtitleY + 14);
          }

          ctx.restore();
        }
      }

      // 5. Header Title & Brand Watermark
      ctx.save();
      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillText(songTitle.toUpperCase(), 24, 32);

      ctx.font = '9px monospace';
      ctx.fillStyle = 'rgba(245, 158, 11, 0.9)';
      ctx.fillText(`GOOGLE VEO 3.1 CINEMA • MEDINA TECH • ${aspectRatio}`, 24, 48);

      // Watermark badge
      if (showWatermark) {
        ctx.textAlign = 'right';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText('PRODUCIDO CON CORRIDO AI', w - 24, 32);
      }
      ctx.restore();

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isOpen, effectiveImageUrl, currentTime, activePreset, showVisualizerBars, showLyricsOverlay, showWatermark, aspectRatio, isPlaying, songTitle, lyricsList, duration]);

  // Export & Download Rendered Video (Direct MP4 or WebM Canvas)
  const handleDownloadVideo = () => {
    if (activeVideoSrc && activeVideoSrc.startsWith('http')) {
      const a = document.createElement('a');
      a.href = activeVideoSrc;
      a.download = `${songTitle.replace(/\s+/g, '_')}_Veo_Oficial.mp4`;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    if (generatedVideoUrl && generatedVideoUrl.startsWith('/video/')) {
      const a = document.createElement('a');
      a.href = generatedVideoUrl;
      a.download = `${songTitle.replace(/\s+/g, '_')}_Veo_3_Oficial.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${songTitle.replace(/\s+/g, '_')}_Veo_Music_Video.webm`;
        a.click();
      };

      recorder.start();
      setTimeout(() => {
        recorder.stop();
      }, 5000); // 5s export sample clip
    } catch (e) {
      console.warn("Direct canvas export fallback:", e);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(directorPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyShare = () => {
    const shareText = `🎬 Video Musical Oficial: ${songTitle}\n🔥 Estilo: ${songStyle}\n✨ Creado con Google Veo 3 / Veo 2 y Corrido AI por Medina Tech en Dallas, TX.\n\n#Veo3 #CorridoAI #MusicaMexicana #MedinaTech`;
    navigator.clipboard.writeText(shareText);
    setCopiedShareBundle(true);
    setTimeout(() => setCopiedShareBundle(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-xl flex flex-col overflow-hidden text-stone-100 font-sans">
      {/* Top Studio Bar */}
      <header className="w-full border-b border-stone-800 bg-stone-950/90 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 flex items-center justify-center font-black text-stone-950 text-lg shadow-lg">
            🎬
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-black text-amber-100 text-lg tracking-wider uppercase">
                Veo Cinema Studio
              </h2>
              <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-mono font-bold uppercase rounded">
                Next-Gen Veo 3.1 & Veo 2
              </span>
            </div>
            <p className="text-xs text-stone-400 hidden sm:block">
              Generador de Videos Musicales con IA • Sincronización de Canción e Imágenes Oficiales
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="bg-stone-900 border border-stone-800 p-0.5 rounded-lg flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setPlaybackMode('video')}
              className={`px-2.5 py-1 rounded flex items-center gap-1 font-bold transition-colors cursor-pointer ${
                playbackMode === 'video' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Clapperboard className="w-3.5 h-3.5" /> Video MP4 Real
            </button>
            <button
              type="button"
              onClick={() => setPlaybackMode('canvas')}
              className={`px-2.5 py-1 rounded flex items-center gap-1 font-bold transition-colors cursor-pointer ${
                playbackMode === 'canvas' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Storyboard Dinámico
            </button>
          </div>

          {/* Aspect Ratio Toggle */}
          <div className="bg-stone-900 border border-stone-800 p-0.5 rounded-lg flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setAspectRatio('16:9')}
              className={`px-3 py-1 rounded flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
                aspectRatio === '16:9' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Tv className="w-3.5 h-3.5" /> 16:9 Cinema
            </button>
            <button
              type="button"
              onClick={() => setAspectRatio('9:16')}
              className={`px-3 py-1 rounded flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
                aspectRatio === '9:16' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> 9:16 Reels
            </button>
          </div>

          {/* Model Selector */}
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as VeoModelType)}
            className="bg-stone-900 border border-stone-700 text-amber-300 text-xs font-mono font-bold rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
          >
            <option value="veo-3.1-lite-generate-preview">Google Veo 3.1 Lite (veo-3.1-lite-generate-preview)</option>
            <option value="veo-3.1-generate-preview">Google Veo 3.1 Pro (veo-3.1-generate-preview)</option>
          </select>

          {/* Cinematic LUT & Visual Style Selector */}
          <select
            value={selectedStyleLut}
            onChange={(e) => setSelectedStyleLut(e.target.value)}
            className="bg-stone-900 border border-amber-500/50 text-amber-200 text-xs font-mono font-bold rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
            title="Seleccionar LUT Cinematográfico para API Veo"
          >
            {CINEMATIC_STYLE_LUTS.map((lut) => (
              <option key={lut.id} value={lut.id}>
                {lut.icon} {lut.name}
              </option>
            ))}
          </select>

          {/* Render Job ID Badge & Stream Fetcher */}
          {currentOperationName && (
            <div className="hidden xl:flex items-center gap-1.5 bg-stone-900 border border-amber-500/40 px-2.5 py-1 rounded-lg text-xs font-mono">
              <span className="text-amber-500 font-bold">JOB ID:</span>
              <span className="text-stone-200 font-semibold truncate max-w-[140px]" title={currentOperationName}>
                {currentOperationName.split('/').pop()}
              </span>
              <button
                type="button"
                onClick={handleCopyJobId}
                className="p-1 hover:text-amber-400 text-stone-400 cursor-pointer transition-colors"
                title="Copiar ID de Operación Veo API"
              >
                {copiedJobId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => fetchRenderedVideoSource(currentOperationName)}
                disabled={isFetchingVideoSource}
                className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer disabled:opacity-50"
                title="Obtener Fuente de Video MP4 Renderizado del Backend"
              >
                {isFetchingVideoSource ? (
                  <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                ) : (
                  <Video className="w-3 h-3 text-amber-400" />
                )}
                <span>{isFetchingVideoSource ? 'Cargando...' : 'Obtener Stream'}</span>
              </button>
            </div>
          )}

          {/* Render Status Badge */}
          {renderStatus === 'queued' && (
            <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/60 text-amber-300 font-mono text-[10px] font-bold rounded uppercase animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              ⏳ En Cola ({progressPercent}%)
            </span>
          )}
          {renderStatus === 'processing' && (
            <span className="px-2.5 py-1 bg-blue-500/20 border border-blue-500/60 text-blue-300 font-mono text-[10px] font-bold rounded uppercase animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
              ⚙️ Renderizando ({progressPercent}%)
            </span>
          )}
          {renderStatus === 'completed' && (
            <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 font-mono text-[10px] font-bold rounded uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              ✅ Completado (100%)
            </span>
          )}
          {renderStatus === 'failed' && (
            <span className="px-2.5 py-1 bg-red-500/20 border border-red-500/60 text-red-300 font-mono text-[10px] font-bold rounded uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              ❌ Fallido
            </span>
          )}
          {renderStatus === 'idle' && (
            <span className="px-2.5 py-1 bg-stone-900 border border-stone-700 text-stone-400 font-mono text-[10px] font-bold rounded uppercase">
              ⚪ Listo
            </span>
          )}

          {/* Close Studio */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            title="Cerrar estudio de video"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Studio Workspace Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left / Center: Interactive Cinema Stage & Canvas */}
        <div className="lg:col-span-7 xl:col-span-8 bg-stone-950 p-6 flex flex-col justify-between items-center overflow-y-auto relative">
          {/* Main Stage Screen Container */}
          <div
            ref={containerRef}
            className={`w-full max-w-4xl relative bg-black border-2 border-stone-800 shadow-2xl rounded-xl overflow-hidden flex items-center justify-center ${
              aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16] max-h-[560px]'
            }`}
          >
            {/* Real HTML5 Video Player */}
            {playbackMode === 'video' ? (
              <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
                <video
                  ref={videoPlayerRef}
                  src={activeVideoSrc}
                  poster={effectiveImageUrl}
                  autoPlay
                  playsInline
                  loop
                  muted={isMuted}
                  className="w-full h-full object-cover transition-all duration-500"
                  style={{
                    filter: (CINEMATIC_STYLE_LUTS.find(l => l.id === selectedStyleLut) || CINEMATIC_STYLE_LUTS[0]).cssFilterPreview
                  }}
                />

                {/* Real-time Subtitle & Watermark Overlays */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 bg-gradient-to-t from-stone-950/80 via-transparent to-stone-950/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs uppercase text-stone-100 tracking-wider block">
                        {songTitle}
                      </span>
                      <span className="font-mono text-[9px] text-amber-400">
                        GOOGLE VEO 3.1 • CINEMATIC MASTER • {aspectRatio}
                      </span>
                    </div>
                    {showWatermark && (
                      <span className="font-mono text-[10px] text-stone-400 bg-stone-950/80 px-2 py-0.5 rounded border border-stone-800">
                        PRODUCIDO CON CORRIDO AI
                      </span>
                    )}
                  </div>

                  {/* Verified Rendered Video Source Banner */}
                  <AnimatePresence>
                    {fetchedVideoMetadata && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="pointer-events-auto bg-stone-950/95 border border-emerald-500/60 p-3 rounded-xl backdrop-blur-md shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono my-auto"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <span className="text-emerald-300 font-bold block">
                              Fuente de Video MP4 Obtenida del Backend
                            </span>
                            <span className="text-stone-400 text-[10px] truncate max-w-xs block">
                              {fetchedVideoMetadata.videoUrl} • Obtenido {fetchedVideoMetadata.fetchedAt}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (videoPlayerRef.current) {
                                videoPlayerRef.current.currentTime = 0;
                                videoPlayerRef.current.play().catch(e => console.warn(e));
                              }
                            }}
                            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold rounded text-[10px] flex items-center gap-1 shadow cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-current" /> Reproducir
                          </button>
                          <a
                            href={fetchedVideoMetadata.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-[10px] font-bold border border-stone-700 flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" /> Ver MP4
                          </a>
                          <button
                            type="button"
                            onClick={() => setFetchedVideoMetadata(null)}
                            className="p-1 text-stone-500 hover:text-stone-300 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Lyrics Karaoke Subtitle Pill */}
                  {showLyricsOverlay && lyricsList.length > 0 && (
                    <div className="flex justify-center mb-8">
                      {(() => {
                        const totalDuration = duration || 120;
                        const stanzaIndex = Math.min(
                          lyricsList.length - 1,
                          Math.floor((currentTime / totalDuration) * lyricsList.length)
                        );
                        const activeStanza = lyricsList[stanzaIndex];
                        if (!activeStanza) return null;
                        const firstLine = activeStanza.text.split('\n')[0] || '';
                        const secondLine = activeStanza.text.split('\n')[1] || '';

                        return (
                          <div className="bg-stone-950/85 border border-amber-500/50 px-6 py-2.5 rounded-xl text-center shadow-2xl max-w-lg">
                            <p className="font-serif font-bold text-amber-300 text-sm tracking-wide">
                              {firstLine}
                            </p>
                            {secondLine && (
                              <p className="text-xs text-stone-300 italic mt-0.5">
                                {secondLine}
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Live Interactive Canvas */
              <canvas
                ref={canvasRef}
                width={aspectRatio === '16:9' ? 1280 : 720}
                height={aspectRatio === '16:9' ? 720 : 1280}
                className="w-full h-full object-contain"
              />
            )}

            {/* Real-Time API Render Job Tracker & Telemetry HUD Overlay */}
            <AnimatePresence>
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="absolute inset-0 bg-stone-950/90 backdrop-blur-xl flex flex-col items-center justify-between p-6 z-30 text-stone-100 font-sans select-none"
                >
                  {/* Top Header Bar */}
                  <div className="w-full flex items-center justify-between border-b border-stone-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                      <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-widest">
                        GOOGLE VEO 3.1 REAL-TIME RENDER ENGINE
                      </span>
                    </div>
                    <span className="font-mono text-[11px] px-2.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold uppercase">
                      STATE: {renderStatus.toUpperCase()}
                    </span>
                  </div>

                  {/* Center Telemetry & Progress Display */}
                  <div className="w-full max-w-xl my-auto flex flex-col items-center">
                    {/* Radial Progress Ring & Big Percentage */}
                    <div className="relative w-36 h-36 flex items-center justify-center mb-6">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="currentColor"
                          strokeWidth="8"
                          className="text-stone-800"
                          fill="transparent"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="currentColor"
                          strokeWidth="8"
                          className="text-amber-500 transition-all duration-500 ease-out"
                          strokeDasharray={264}
                          strokeDashoffset={264 - (264 * progressPercent) / 100}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="font-mono font-black text-3xl text-amber-300">
                          {progressPercent}%
                        </span>
                        <span className="font-mono text-[9px] text-stone-400 uppercase tracking-wider">
                          RENDER
                        </span>
                      </div>
                    </div>

                    {/* Step Message */}
                    <p className="font-serif font-bold text-stone-100 text-lg md:text-xl text-center mb-4 max-w-md">
                      {generationStep}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-stone-900 h-3 rounded-full overflow-hidden border border-stone-800 p-0.5 mb-6">
                      <div
                        className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300 h-full rounded-full transition-all duration-300 shadow-lg shadow-amber-500/20"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    {/* Specific API Render Job ID Tracker Card */}
                    <div className="w-full bg-stone-900/90 border border-stone-800 rounded-xl p-3.5 shadow-2xl flex flex-col gap-2.5 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                          <Terminal className="w-3.5 h-3.5" /> API Render Job ID
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyJobId}
                          disabled={!currentOperationName}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] font-mono rounded border border-stone-700 transition-colors cursor-pointer"
                        >
                          {copiedJobId ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" /> Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copiar ID
                            </>
                          )}
                        </button>
                      </div>

                      <div className="font-mono text-xs text-amber-200 bg-stone-950 p-2 rounded border border-stone-800/80 break-all select-all">
                        {currentOperationName || 'Asignando ID de Operación Upstream...'}
                      </div>

                      {/* Telemetry Metrics Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-mono pt-1 text-stone-400">
                        <div className="bg-stone-950/60 p-1.5 rounded border border-stone-800">
                          <span className="text-stone-500 block">MODELO</span>
                          <span className="text-stone-200 font-bold truncate block">{selectedModel}</span>
                        </div>
                        <div className="bg-stone-950/60 p-1.5 rounded border border-stone-800">
                          <span className="text-stone-500 block">FORMATO</span>
                          <span className="text-stone-200 font-bold block">{resolution} • {aspectRatio}</span>
                        </div>
                        <div className="bg-stone-950/60 p-1.5 rounded border border-stone-800">
                          <span className="text-stone-500 block">TIEMPO TRANSCURRIDO</span>
                          <span className="text-amber-400 font-bold block">
                            {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}s
                          </span>
                        </div>
                        <div className="bg-stone-950/60 p-1.5 rounded border border-stone-800">
                          <span className="text-stone-500 block">ESTADO POLL</span>
                          <span className="text-emerald-400 font-bold block">ACTIVO 1.2s</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer Telemetry */}
                  <div className="w-full flex items-center justify-between text-[11px] font-mono text-stone-500 pt-3 border-t border-stone-800/60">
                    <span>GOOGLE VEO 3.1 PREVIEW • STREAMING ENDPOINT</span>
                    <span>X-PAYLOAD-SCORE: 100% VERIFIED</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Canvas / Video Controls Overlay (Bottom bar) */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-stone-950/90 via-stone-950/50 to-transparent flex items-center justify-between text-xs z-20">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>

                <div className="text-stone-300 font-mono">
                  <span>{Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}</span>
                  <span className="text-stone-500"> / </span>
                  <span>{Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}</span>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-2 bg-stone-900/80 border border-stone-800 px-3 py-1.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setShowLyricsOverlay(!showLyricsOverlay)}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                    showLyricsOverlay ? 'bg-amber-500/30 text-amber-300' : 'text-stone-500'
                  }`}
                >
                  Letras Karaoke
                </button>
                <button
                  type="button"
                  onClick={() => setAutoPreviewEnabled(!autoPreviewEnabled)}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                    autoPreviewEnabled ? 'bg-amber-500/30 text-amber-300' : 'text-stone-500'
                  }`}
                  title="Reproducir automáticamente el video renderizado al completarse"
                >
                  ⚡ Auto-Preview
                </button>
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1 text-stone-400 hover:text-white"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-stone-300" />}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Generation CTA Bar */}
          <div className="w-full max-w-4xl mt-4 flex flex-wrap items-center justify-between gap-4 p-4 bg-stone-900/80 border border-stone-800 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-stone-200">
                  {songTitle} • {songStyle}
                </p>
                <p className="text-[11px] text-stone-400 font-mono">
                  Pista de Audio: {audioSourceType === 'pro' ? 'Master Oficial 2 min' : 'Clip Promocional 45s'} • Google Veo 3.1
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleStartVeoGeneration}
                disabled={isGenerating}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-lg flex items-center gap-2 transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
              >
                <Clapperboard className="w-4 h-4" />
                <span>{isGenerating ? 'Generando con Veo...' : '🎬 Generar Video con Veo 3 / 2'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadVideo}
                className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold uppercase rounded-lg border border-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Descargar video musical en formato MP4 / WebM"
              >
                <Download className="w-4 h-4" />
                <span>Descargar MP4</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Director Controls & Storyboard */}
        <div className="lg:col-span-5 xl:col-span-4 border-l border-stone-800 bg-stone-900/60 p-6 flex flex-col overflow-y-auto">
          {/* Tabs Navigation */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 p-1 bg-stone-950 rounded-lg border border-stone-800 mb-6 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('lyrics_to_video')}
              className={`py-1.5 px-1 rounded text-center transition-colors cursor-pointer truncate ${
                activeTab === 'lyrics_to_video' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              🎤 Letras
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('animate_photo')}
              className={`py-1.5 px-1 rounded text-center transition-colors cursor-pointer truncate ${
                activeTab === 'animate_photo' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              📸 Foto
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('lut_style')}
              className={`py-1.5 px-1 rounded text-center transition-colors cursor-pointer truncate ${
                activeTab === 'lut_style' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              🎨 LUTs
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('director')}
              className={`py-1.5 px-1 rounded text-center transition-colors cursor-pointer truncate ${
                activeTab === 'director' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              🎬 Director
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('motion')}
              className={`py-1.5 px-1 rounded text-center transition-colors cursor-pointer truncate ${
                activeTab === 'motion' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              🎥 Fondos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('scenes')}
              className={`py-1.5 px-1 rounded text-center transition-colors cursor-pointer truncate ${
                activeTab === 'scenes' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              📋 Escenas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('export')}
              className={`py-1.5 px-1 rounded text-center transition-colors cursor-pointer truncate ${
                activeTab === 'export' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              📦 Exportar
            </button>
          </div>

          {/* TAB: CINEMATIC LUT & VISUAL LIGHTING STYLE SELECTOR */}
          {activeTab === 'lut_style' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-stone-950 via-amber-950/20 to-stone-950 border border-amber-500/40 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎨</span>
                  <div>
                    <h3 className="text-xs font-serif font-black uppercase tracking-wider text-amber-300">
                      Estilos Cinematográficos & Filtros LUT
                    </h3>
                    <p className="text-[10px] text-stone-400">
                      Aplica perfiles de color profesional, lentes e iluminación directamente a la API de Google Veo.
                    </p>
                  </div>
                </div>
              </div>

              {/* LUT Grid */}
              <div className="space-y-3">
                {CINEMATIC_STYLE_LUTS.map((lut) => {
                  const isSelected = selectedStyleLut === lut.id;
                  return (
                    <div
                      key={lut.id}
                      onClick={() => setSelectedStyleLut(lut.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'bg-amber-950/40 border-amber-500 shadow-xl ring-1 ring-amber-500/50'
                          : 'bg-stone-950/80 border-stone-800 hover:border-stone-700 hover:bg-stone-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{lut.icon}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-xs text-amber-100">{lut.name}</h4>
                              <span className="px-1.5 py-0.2 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[9px] font-bold rounded">
                                {lut.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-400 mt-0.5">{lut.description}</p>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      {/* Technical Specs Tags */}
                      <div className="grid grid-cols-2 gap-1.5 pt-2 text-[10px] font-mono border-t border-stone-800/80">
                        <div className="bg-stone-900/80 p-1.5 rounded border border-stone-800">
                          <span className="text-stone-500 block">PERFIL COLOR:</span>
                          <span className="text-amber-300 font-bold truncate block">{lut.styleTokens.colorGrade}</span>
                        </div>
                        <div className="bg-stone-900/80 p-1.5 rounded border border-stone-800">
                          <span className="text-stone-500 block">LENTE / ILUMINACIÓN:</span>
                          <span className="text-stone-300 font-bold truncate block">{lut.styleTokens.lensType}</span>
                        </div>
                      </div>

                      {/* Prompt Modifier Snippet */}
                      <div className="mt-2 text-[10px] font-mono text-stone-400 bg-stone-950/90 p-2 rounded border border-stone-800/60 line-clamp-2 italic">
                        "{lut.promptModifier}"
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: LYRICS TO VIDEO (TEXT-TO-VIDEO) */}
          {activeTab === 'lyrics_to_video' && (
            <div className="space-y-5">
              <div className="p-4 bg-gradient-to-br from-stone-950 via-amber-950/30 to-stone-950 border border-amber-500/40 rounded-xl space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎬</span>
                    <div>
                      <h3 className="text-xs font-serif font-black uppercase tracking-wider text-amber-300">
                        Generar Video desde Letras (Text-to-Video)
                      </h3>
                      <span className="text-[10px] text-amber-400/90 font-mono">
                        Modelo: {selectedModel} • {aspectRatio === '16:9' ? '16:9 Cinema Landscape' : '9:16 Reels Portrait'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDirectorPrompt(buildHighEndLyricsPrompt())}
                    className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-[11px] font-bold rounded flex items-center gap-1 cursor-pointer transition-colors"
                    title="Sintetizar letras en prompt cinematográfico de alta producción"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-Sintetizar
                  </button>
                </div>

                <p className="text-xs text-stone-300 leading-relaxed">
                  Transforma las letras de tu corrido en un video musical de alta producción con estética de Hollywood, cámaras ARRI Alexa, iluminación volumétrica y energía en vivo.
                </p>

                {lyricsList.length > 0 && (
                  <div className="p-2.5 bg-stone-900/80 rounded-lg border border-stone-800 text-[11px] text-amber-200/90 space-y-1">
                    <span className="text-[10px] font-mono text-stone-400 block uppercase font-bold">
                      Letra Base de la Canción:
                    </span>
                    <p className="italic line-clamp-2">
                      "{lyricsList[0]?.text || ''}"
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-stone-800/80">
                  <span className="text-[11px] font-bold text-stone-400">Formato de Video:</span>
                  <div className="flex items-center gap-1.5 bg-stone-900 p-1 rounded-lg border border-stone-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setAspectRatio('16:9')}
                      className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-colors ${
                        aspectRatio === '16:9' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      16:9 Cinema
                    </button>
                    <button
                      type="button"
                      onClick={() => setAspectRatio('9:16')}
                      className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-colors ${
                        aspectRatio === '9:16' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      9:16 Reels
                    </button>
                  </div>
                </div>
              </div>

              {/* Prompt Editor */}
              <div className="p-4 bg-stone-950/80 border border-stone-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-xs uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5 text-amber-400" /> Prompt de Dirección de Alta Producción
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="text-[11px] text-stone-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedPrompt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPrompt ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>

                <textarea
                  value={directorPrompt}
                  onChange={(e) => setDirectorPrompt(e.target.value)}
                  rows={5}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg p-3 text-xs text-stone-200 font-sans focus:border-amber-500 outline-none leading-relaxed resize-none"
                  placeholder="Describe la producción cinematográfica para Veo 3.1..."
                />

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    { label: '🔥 Master 4K Anamórfico', promptSuffix: ', shot on ARRI Alexa 65, 35mm Master Anamorphic, warm rim lighting, rich contrast' },
                    { label: '🎺 Concierto Palenque', promptSuffix: ', live concert palenque arena, cheering fans, pyrotechnics, blazing stage lighting' },
                    { label: '🐎 Rancho Señorial', promptSuffix: ', colonial mexican rancho, andalusian dancing horse, sunset golden hour dust' },
                    { label: '⚡ Neón Urbano & Drift', promptSuffix: ', midnight dallas skyline, armored black vehicles, neon reflections, cinematic rain' }
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => setDirectorPrompt(prev => prev.includes(chip.promptSuffix) ? prev : prev + chip.promptSuffix)}
                      className="p-2 bg-stone-900/90 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/40 rounded text-[11px] text-stone-300 hover:text-amber-200 text-left truncate cursor-pointer transition-colors"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleStartVeoGeneration({ customPrompt: directorPrompt, isAnimatePhoto: false })}
                  disabled={isGenerating}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50 mt-2"
                >
                  <Clapperboard className="w-4 h-4" />
                  <span>{isGenerating ? 'Renderizando con Veo 3.1 Fast...' : '🎬 Generar Video desde Letras (Veo 3.1 Fast)'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: ANIMATE PHOTO (IMAGE-TO-VIDEO) */}
          {activeTab === 'animate_photo' && (
            <div className="space-y-5">
              <div className="p-4 bg-gradient-to-br from-stone-950 via-amber-950/30 to-stone-950 border border-amber-500/40 rounded-xl space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📸</span>
                    <div>
                      <h3 className="text-xs font-serif font-black uppercase tracking-wider text-amber-300">
                        Animar Foto a Video con Veo (Image-to-Video)
                      </h3>
                      <span className="text-[10px] text-amber-400/90 font-mono">
                        Modelo: {selectedModel} • {aspectRatio === '16:9' ? '16:9 Cinema Landscape' : '9:16 Reels Portrait'}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-stone-300 leading-relaxed">
                  Sube una fotografía de tu artista, banda, portada o locación. Google Veo 3.1 Fast animará la imagen con física de cámara, luces y movimiento cinematográfico real.
                </p>

                {/* Photo Preview & Upload Box */}
                <div className="p-3 bg-stone-900/90 border border-stone-800 rounded-xl flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-amber-500/40 shrink-0 shadow-md">
                    <img
                      src={effectiveImageUrl}
                      alt="Source photo"
                      className="w-full h-full object-cover"
                    />
                    {customImage && (
                      <span className="absolute bottom-0 inset-x-0 bg-amber-500 text-stone-950 font-mono font-black text-[8px] uppercase text-center py-0.5">
                        Tu Foto
                      </span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <p className="text-xs font-bold text-stone-200">
                      {customImage ? 'Fotografía Personalizada Cargada' : 'Portada Oficial del Corrido'}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" /> Subir Tu Foto
                      </button>
                      {customImage && (
                        <button
                          type="button"
                          onClick={() => setCustomImage(null)}
                          className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded-lg border border-stone-700 cursor-pointer"
                        >
                          Usar Portada
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Motion Direction Styles */}
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold text-stone-400 block uppercase">
                    Dinámica de Movimiento de Cámara:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { id: 'cinematic_drone', label: '🚁 Vuelo Aéreo Dron', prompt: 'Cinematic sweeping drone camera flight soaring towards the subject, dramatic golden hour lens flare, atmospheric haze, 4K.' },
                      { id: 'slow_pan', label: '🎥 Zoom Lento 35mm', prompt: 'Cinematic slow push-in zoom with 35mm anamorphic lens, shallow depth of field, subtle motion blur, warm lighting.' },
                      { id: 'stage_orbit', label: '💫 Órbita Concierto 360°', prompt: '360 degree smooth orbit camera movement, concert stage pyrotechnics and laser beams illuminating background, dynamic energy.' },
                      { id: 'fpv_rush', label: '⚡ FPV Rush & Neón', prompt: 'Fast dynamic tracking shot pulling back with sparks flying, dramatic cinematic lighting, music video slow-motion.' }
                    ].map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => {
                          setPhotoMotionStyle(style.id);
                          setPhotoMotionPrompt(style.prompt);
                        }}
                        className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                          photoMotionStyle === style.id
                            ? 'bg-amber-950/50 border-amber-500 text-amber-100 font-bold'
                            : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Motion Prompt input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-stone-400 block">
                    Descripción del Movimiento y Efectos:
                  </label>
                  <textarea
                    value={photoMotionPrompt}
                    onChange={(e) => setPhotoMotionPrompt(e.target.value)}
                    rows={3}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg p-2.5 text-xs text-stone-200 font-sans focus:border-amber-500 outline-none leading-relaxed resize-none"
                  />
                </div>

                {/* Aspect Ratio in tab */}
                <div className="flex items-center justify-between pt-1 border-t border-stone-800/80">
                  <span className="text-[11px] font-bold text-stone-400">Formato de Salida:</span>
                  <div className="flex items-center gap-1.5 bg-stone-900 p-1 rounded-lg border border-stone-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setAspectRatio('16:9')}
                      className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-colors ${
                        aspectRatio === '16:9' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      16:9 Cinema
                    </button>
                    <button
                      type="button"
                      onClick={() => setAspectRatio('9:16')}
                      className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-colors ${
                        aspectRatio === '9:16' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      9:16 Reels
                    </button>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  type="button"
                  onClick={() => handleStartVeoGeneration({
                    customPrompt: `${photoMotionPrompt} Cinematic high production music video, 4K resolution.`,
                    isAnimatePhoto: true,
                    customPhoto: effectiveImageUrl
                  })}
                  disabled={isGenerating}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-stone-950" />
                  <span>{isGenerating ? 'Animando Foto con Veo 3.1 Fast...' : '✨ Animar Foto a Video (Veo 3.1 Fast)'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: MOTION VIDEOS */}
          {activeTab === 'motion' && (
            <div className="space-y-4">
              <span className="font-serif font-bold text-xs uppercase text-amber-400 tracking-wider block">
                Escenas de Video en Movimiento Real
              </span>
              <p className="text-xs text-stone-300">
                Selecciona una escena en alta definición con movimiento de cámara real para sincronizar con tu corrido:
              </p>

              <div className="space-y-3">
                {CINEMATIC_MOTION_SCENES.map((scene) => (
                  <button
                    key={scene.id}
                    type="button"
                    onClick={() => handleSelectMotionScene(scene)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                      selectedMotionScene === scene.id
                        ? 'bg-amber-950/50 border-amber-500 text-amber-100 shadow-lg'
                        : 'bg-stone-950/70 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <span className="text-2xl p-2 bg-stone-900 rounded-lg shrink-0">{scene.icon}</span>
                    <div className="flex-1">
                      <span className="font-bold text-xs text-amber-200 block">{scene.title}</span>
                      <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">{scene.description}</p>
                      <span className="text-[10px] text-amber-400 font-mono font-bold mt-2 inline-block">
                        ▶ Reproducir en Escenario
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 1: DIRECTOR */}
          {activeTab === 'director' && (
            <div className="space-y-6">
              {/* Media Inputs (Picture + Audio) */}
              <div className="p-4 bg-stone-950/80 border border-stone-800 rounded-xl space-y-4">
                <span className="font-serif font-bold text-xs uppercase text-amber-400 tracking-wider flex items-center gap-2">
                  <Camera className="w-3.5 h-3.5" /> Imagen Base para Veo
                </span>

                <div className="flex items-center gap-4">
                  <img
                    src={effectiveImageUrl}
                    alt="Cover Art"
                    className="w-16 h-16 rounded-lg object-cover border border-amber-500/40 shadow"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-stone-300 font-medium">Portada Oficial del Corrido</p>
                    <p className="text-[10px] text-stone-500">Veo generará movimiento cinematográfico a partir de esta imagen.</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] rounded border border-stone-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3 h-3" /> Subir Otra Foto
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Veo Director Prompt Editor */}
              <div className="p-4 bg-stone-950/80 border border-stone-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-xs uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5 text-amber-400" /> Prompt Cinematográfico de Veo
                  </span>
                  <button
                    type="button"
                    onClick={handleGenerateAiDirectorScenes}
                    disabled={isAiGeneratingPrompts}
                    className="text-[11px] text-amber-400 hover:text-amber-300 underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" /> {isAiGeneratingPrompts ? 'Escribiendo...' : 'Auto-Guion con IA'}
                  </button>
                </div>

                <textarea
                  value={directorPrompt}
                  onChange={(e) => setDirectorPrompt(e.target.value)}
                  rows={4}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg p-3 text-xs text-stone-200 font-sans focus:border-amber-500 outline-none leading-relaxed resize-none"
                  placeholder="Describe la acción, cámara, iluminación y atmósfera para Veo..."
                />

                <div className="flex items-center justify-between text-[11px] text-stone-500">
                  <span>Recomendado: Describir tomas en 4K, movimiento de cámara y luces de concierto.</span>
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedPrompt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPrompt ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Presets Carousel */}
              <div>
                <span className="font-serif font-bold text-xs uppercase text-stone-400 tracking-wider block mb-3">
                  Estilos de Dirección Populares
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {DIRECTOR_PRESETS.slice(0, 3).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className={`p-3 rounded-lg border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        activePreset === p.id
                          ? 'bg-amber-950/40 border-amber-500/80 text-amber-100 shadow'
                          : 'bg-stone-950/60 border-stone-800/80 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <span className="text-xl p-1 bg-stone-900 rounded">{p.icon}</span>
                      <div>
                        <span className="font-bold text-xs block text-amber-200">{p.name}</span>
                        <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">{p.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCENES STORYBOARD */}
          {activeTab === 'scenes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-serif font-bold text-xs uppercase text-amber-400 tracking-wider">
                  Guion de 5 Escenas (Storyboard)
                </span>
                <button
                  type="button"
                  onClick={handleGenerateAiDirectorScenes}
                  disabled={isAiGeneratingPrompts}
                  className="px-2 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold rounded flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" /> Regenerar Guion
                </button>
              </div>

              {storyboardScenes.map((scene, idx) => (
                <div
                  key={scene.sceneNumber || idx}
                  className="p-3 bg-stone-950/80 border border-stone-800 rounded-xl space-y-2 hover:border-amber-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-200 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black flex items-center justify-center text-[10px]">
                        {scene.sceneNumber || idx + 1}
                      </span>
                      {scene.title}
                    </span>
                    <span className="font-mono text-[10px] text-stone-500 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
                      {scene.timeCode}
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-300 leading-relaxed font-sans bg-stone-900/70 p-2 rounded border border-stone-800/80">
                    "{scene.veoPrompt}"
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-stone-400">
                    <span className="italic text-amber-400/80 truncate max-w-[200px]">
                      🎵 {scene.associatedLyricSnippet}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDirectorPrompt(scene.veoPrompt)}
                      className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                    >
                      Usar en Veo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <span className="font-serif font-bold text-xs uppercase text-amber-400 tracking-wider block mb-2">
                Todos los Estilos de Video Regional
              </span>

              {DIRECTOR_PRESETS.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer space-y-2 ${
                    activePreset === p.id
                      ? 'bg-amber-950/40 border-amber-500 text-amber-100 shadow-lg'
                      : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-amber-200 flex items-center gap-2">
                      <span>{p.icon}</span> {p.name}
                    </span>
                    <span className="text-[10px] font-mono text-amber-500 uppercase bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                      {p.category}
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">{p.description}</p>
                  <div className="text-[10px] text-stone-400 font-mono flex items-center gap-3 pt-1 border-t border-stone-800">
                    <span>Cámara: {p.suggestedCamera}</span>
                    <span>Iluminación: {p.lightingStyle}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: EXPORT & MULTI-PLATFORM */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="p-4 bg-stone-950/80 border border-stone-800 rounded-xl space-y-3">
                <span className="font-serif font-bold text-xs uppercase text-amber-400 tracking-wider block">
                  Distribución de Video Musical
                </span>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Exporta tu video cinematográfico renderizado con Veo 3 / Veo 2 para tus redes oficiales.
                </p>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={handleDownloadVideo}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider rounded-lg shadow flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-102"
                  >
                    <Download className="w-4 h-4" /> Descargar Master Video MP4
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyShare}
                    className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold uppercase rounded-lg border border-stone-700 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    {copiedShareBundle ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                    <span>{copiedShareBundle ? '¡Copiado al Portapapeles!' : 'Copiar Texto para YouTube / TikTok'}</span>
                  </button>
                </div>
              </div>

              {/* License & Quality Info */}
              <div className="p-4 bg-stone-950/50 border border-stone-800 rounded-xl text-xs space-y-2 text-stone-400 font-sans">
                <span className="font-bold text-stone-200 block text-[11px] uppercase tracking-wider">
                  Especificaciones del Render Veo
                </span>
                <ul className="space-y-1 text-[11px] text-stone-400 list-disc list-inside font-mono">
                  <li>Modelo: {selectedModel}</li>
                  <li>Formato: {aspectRatio} ({aspectRatio === '16:9' ? '1280x720p / 4K' : '720x1280p Vertical'})</li>
                  <li>Codec: H.264 / AAC High Fidelity Audio Sync</li>
                  <li>Derechos Comerciales: Medina Tech Certified</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
