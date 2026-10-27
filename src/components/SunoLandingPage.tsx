import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Play, Pause, Flame, Bot, Image as ImageIcon, 
  Video, Music, Disc, Wand2, RefreshCw, CheckCircle2, 
  Sliders, Globe, Layers, Zap, Upload, Gift, 
  FolderGit2, Download, Plus, ChevronRight, Palette, Volume2
} from 'lucide-react';
import { CorridoData, ComposerInputs, CustomAudioTrack } from '../types';
import { AppLanguage, translations } from '../utils/i18n';
import { FEATURED_CORRIDOS } from '../data/featuredCorridos';
import { customAudioStorage } from '../utils/customAudioStorage';

interface CorridoStudioLandingProps {
  language: AppLanguage;
  onGenerateClip: (inputs: ComposerInputs) => void;
  onOpenInStudio: (song: CorridoData) => void;
  onOpenInstrumentalLab: (song: CorridoData) => void;
  onOpenDistribution: () => void;
  onOpenAgentsHub: () => void;
  onOpenVeoStudio: (song: CorridoData) => void;
  onOpenCustomInstrumentalModal?: () => void;
  isGenerating: boolean;
  generatedSong?: CorridoData | null;
}

export const SunoLandingPage: React.FC<CorridoStudioLandingProps> = ({
  language,
  onGenerateClip,
  onOpenInStudio,
  onOpenInstrumentalLab,
  onOpenDistribution,
  onOpenAgentsHub,
  onOpenVeoStudio,
  onOpenCustomInstrumentalModal,
  isGenerating,
  generatedSong
}) => {
  const t = translations[language];
  const isEn = language === 'en';

  // Composer Form States
  const [promptText, setPromptText] = useState('');
  const [protagonistName, setProtagonistName] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('Corrido Bélico Tech 2026');
  const [selectedVoice, setSelectedVoice] = useState<'Fenrir' | 'Charon' | 'Puck' | 'Zephyr'>('Fenrir');
  const [selectedInstrument, setSelectedInstrument] = useState<string>('Requinto (12 Cuerdas)');
  const [attachedImage, setAttachedImage] = useState<{ url: string; name: string } | null>(null);

  // AI Cover Art Generator States
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [coverStyle, setCoverStyle] = useState<'cinematic' | 'vintage_gold' | 'neon_cyberpunk' | 'oil_painting'>('cinematic');

  // Audio Playback & Progress State
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  // Recent Projects Feed State
  const [customTracks, setCustomTracks] = useState<CustomAudioTrack[]>([]);
  const [recentProjects, setRecentProjects] = useState<CorridoData[]>(() => {
    try {
      const saved = localStorage.getItem('melodycraft_recent_projects_vault');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Could not read recent projects from localStorage:", e);
    }
    return [];
  });

  // Featured Content State
  const [featuredGenreFilter, setFeaturedGenreFilter] = useState<string>('all');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const composerFormRef = useRef<HTMLDivElement | null>(null);

  const GENRE_CHIPS = [
    { label: '🔥 Bélico Tumbado', value: 'Corrido Bélico Tech 2026', bpm: '142 BPM', inst: 'Requinto (12 Cuerdas)' },
    { label: '🎤 Street Rap & 808s', value: 'Modern Trap & Rap (Metro Boomin / Drake / Hard 808s & Fast Hi-Hats)', bpm: '90 BPM', inst: 'Hard 808 Bass & Snare' },
    { label: '🎺 Banda Sinaloense', value: 'Corrido de Banda Sinaloense Brava', bpm: '148 BPM', inst: 'Tuba y Tambora Sinaloense' },
    { label: '⚡ Synthwave Pop', value: 'Electronic Synthwave & Pop Anthem', bpm: '128 BPM', inst: 'Analog Synths & House Beat' },
    { label: '🌙 Smooth R&B', value: 'Smooth R&B & Neo-Soul Slow Jam', bpm: '88 BPM', inst: 'Rhodes Piano & 808 Sub' },
    { label: '🎸 Acoustic Folk', value: 'Acoustic Indie Folk & Americana', bpm: '104 BPM', inst: 'Steel Guitars & Cello' }
  ];

  // Load custom tracks from IndexedDB storage
  useEffect(() => {
    let mounted = true;
    customAudioStorage.getAllCustomTracks()
      .then(tracks => {
        if (mounted) setCustomTracks(tracks);
      })
      .catch(err => console.warn("Failed to load user custom tracks:", err));
    return () => { mounted = false; };
  }, []);

  // Sync generatedSong into recentProjects cache
  useEffect(() => {
    if (generatedSong && generatedSong.title) {
      setRecentProjects(prev => {
        const exists = prev.some(p => 
          (p.songHash && p.songHash === generatedSong.songHash) || 
          p.title === generatedSong.title
        );
        let updated: CorridoData[];
        if (exists) {
          updated = prev.map(p => 
            ((p.songHash && p.songHash === generatedSong.songHash) || p.title === generatedSong.title)
              ? generatedSong 
              : p
          );
        } else {
          updated = [generatedSong, ...prev.slice(0, 9)];
        }
        try {
          localStorage.setItem('melodycraft_recent_projects_vault', JSON.stringify(updated));
        } catch (e) {
          console.warn("Failed to save recent projects:", e);
        }
        return updated;
      });
    }
  }, [generatedSong]);

  // Clean audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
      }
    };
  }, [currentAudio]);

  const handleTogglePlay = (song: CorridoData, id: string) => {
    if (currentAudio) {
      currentAudio.pause();
    }

    if (playingSongId === id) {
      setPlayingSongId(null);
      setCurrentAudio(null);
      setAudioProgress(0);
      return;
    }

    const url = song.clipAudioUrl || song.audioUrl || song.proAudioUrl || '/audio/codigo_214_rap_master.mp3';

    try {
      const audio = new Audio(url);
      
      audio.ontimeupdate = () => {
        if (audio.duration) {
          setAudioCurrentTime(audio.currentTime);
          setAudioDuration(audio.duration);
          setAudioProgress((audio.currentTime / audio.duration) * 100);
        }
      };

      audio.onended = () => {
        setPlayingSongId(null);
        setCurrentAudio(null);
        setAudioProgress(0);
      };

      audio.onerror = (e) => {
        console.warn("Audio playback error, attempting fallback:", e);
        const fallback = new Audio('/audio/codigo_214_rap_master.mp3');
        fallback.ontimeupdate = () => {
          if (fallback.duration) {
            setAudioCurrentTime(fallback.currentTime);
            setAudioDuration(fallback.duration);
            setAudioProgress((fallback.currentTime / fallback.duration) * 100);
          }
        };
        fallback.onended = () => {
          setPlayingSongId(null);
          setCurrentAudio(null);
          setAudioProgress(0);
        };
        fallback.play().catch(console.error);
        setCurrentAudio(fallback);
      };

      audio.play().catch((err) => {
        console.warn("Audio playback failed:", err);
        setPlayingSongId(null);
        setCurrentAudio(null);
      });
      
      setCurrentAudio(audio);
      setPlayingSongId(id);
    } catch (err) {
      console.error("Failed to initialize audio player:", err);
      setPlayingSongId(null);
      setCurrentAudio(null);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentAudio || !audioDuration) return;
    const newPercent = parseFloat(e.target.value);
    const newTime = (newPercent / 100) * audioDuration;
    currentAudio.currentTime = newTime;
    setAudioProgress(newPercent);
    setAudioCurrentTime(newTime);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleGenerateAICover = async () => {
    setIsGeneratingCover(true);
    try {
      const stylePrompts = {
        cinematic: 'Cinematic 4K studio lighting, ultra-realistic portrait, gold reflections, 8k resolution',
        vintage_gold: 'Vintage Mexican regional gold ornamental frame, rustic desert sunset, heroic legend portrait',
        neon_cyberpunk: 'Futuristic neon cyberpunk night city skyline, vibrant purple and cyan glowing album art',
        oil_painting: 'Classic oil painting portrait, dramatic Rembrandt lighting, high-art vinyl cover'
      };

      const res = await fetch('/api/generate-cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: protagonistName || 'Master Release',
          coverPrompt: `${stylePrompts[coverStyle]}. Concept: ${promptText || selectedGenre}`
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.imageUrl) {
          setAttachedImage({
            url: data.imageUrl,
            name: `AI Cover (${coverStyle})`
          });
        }
      }
    } catch (err) {
      console.warn("Failed to generate AI cover:", err);
    } finally {
      setIsGeneratingCover(false);
    }
  };

  const handleDownloadTrack = (song: CorridoData) => {
    const url = song.proAudioUrl || song.audioUrl || song.clipAudioUrl || '/audio/codigo_214_rap_master.mp3';
    const a = document.createElement('a');
    a.href = url;
    a.download = `${song.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Master.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAttachedImage({
          url: reader.result,
          name: file.name
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim() && !protagonistName.trim() && !attachedImage) {
      alert(isEn ? 'Please enter a concept, name, or attach a visual reference.' : 'Ingresa una idea, nombre o pega una imagen de inspiración.');
      return;
    }

    const inputs: ComposerInputs = {
      name: protagonistName.trim() || (isEn ? 'The Protagonist' : 'El Protagonista'),
      story: promptText.trim() || (attachedImage ? (isEn ? 'Inspired by the attached conceptual visual with themes of honor, grit, and triumph.' : 'Inspirado en la imagen conceptual de honor y superación.') : (isEn ? 'A modern hard-hitting corrido of ambition and victory.' : 'Un corrido bélico y moderno de superación y éxito.')),
      style: selectedGenre as any,
      instrument: selectedInstrument as any,
      partner: 'La Empresa & Dallas Crew',
      storyTheme: isEn ? 'Grit, ambition, loyalty, and relentless triumph' : 'Superación, poder, negocios firmes y lealtad',
      locationSetting: 'Dallas, TX / México',
      slangHook: isEn ? 'Puro pa delante y con el tiro arriba!' : '¡Puro pa\' delante y con el tiro arriba!',
      selectedVoice
    };

    onGenerateClip(inputs);
  };

  const activeMasterProject = generatedSong || (recentProjects.length > 0 ? recentProjects[0] : FEATURED_CORRIDOS[0]);

  const filteredFeaturedSongs = featuredGenreFilter === 'all'
    ? FEATURED_CORRIDOS
    : FEATURED_CORRIDOS.filter(s => s.genreKey === featuredGenreFilter);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5 pb-28 animate-fadeIn">
      
      {/* ========================================================================= */}
      {/* 1. MOBILE APP HERO COMPOSER CARD                                         */}
      {/* ========================================================================= */}
      <section ref={composerFormRef} className="bg-[#10121a] border border-[#222838] p-4 sm:p-6 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#1c2232] pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-stone-950 font-black shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-black text-stone-100 text-base uppercase tracking-tight">
                {isEn ? 'AI Song Creator' : 'Creador de Canciones IA'}
              </h2>
              <p className="text-[10px] text-stone-400 font-mono">
                {isEn ? 'Compose, generate cover art & produce' : 'Escribe, genera portada e inicia producción'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full">
            Ready
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main Story Prompt Input */}
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-amber-400 mb-1">
              {t.storyLabel}
            </label>
            <textarea
              rows={3}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder={t.storyPlaceholder}
              className="w-full px-3.5 py-2.5 bg-[#08090f] border border-[#202738] text-amber-100 text-xs sm:text-sm rounded-2xl focus:outline-none focus:border-amber-500 font-sans resize-none leading-relaxed"
            />
          </div>

          {/* Protagonist Name / Title */}
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-amber-400 mb-1">
              {t.protagonistLabel}
            </label>
            <input
              type="text"
              value={protagonistName}
              onChange={(e) => setProtagonistName(e.target.value)}
              placeholder={t.protagonistPlaceholder}
              className="w-full px-3.5 py-2.5 bg-[#08090f] border border-[#202738] text-amber-100 text-xs sm:text-sm rounded-2xl focus:outline-none focus:border-amber-500 font-sans"
            />
          </div>

          {/* 1-Tap Genre Concept Chips */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono uppercase text-stone-400 font-bold">
              {isEn ? 'Genre & Style:' : 'Estilo y Género:'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {GENRE_CHIPS.map((chip) => (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => {
                    setSelectedGenre(chip.value);
                    setSelectedInstrument(chip.inst);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
                    selectedGenre === chip.value
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-stone-950 border border-amber-400 shadow-md font-black'
                      : 'bg-[#08090f] text-stone-300 hover:text-amber-300 border border-[#1c2230]'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Cover Art Generation Panel */}
          <div className="bg-[#080a10] border border-[#1f2638] p-3 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-serif font-bold">
                <Palette className="w-4 h-4 text-amber-400" />
                <span>{isEn ? 'AI Cover Artwork Generator' : 'Generador de Portada IA'}</span>
              </div>

              <div className="flex items-center gap-1">
                {(['cinematic', 'vintage_gold', 'neon_cyberpunk', 'oil_painting'] as const).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setCoverStyle(style)}
                    className={`px-2 py-0.5 rounded text-[9px] font-mono capitalize transition-all cursor-pointer ${
                      coverStyle === style
                        ? 'bg-amber-500 text-stone-950 font-bold'
                        : 'bg-[#121622] text-stone-400 hover:text-stone-200 border border-[#202738]'
                    }`}
                  >
                    {style.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              {attachedImage ? (
                <div className="flex items-center gap-2.5 bg-[#121622] border border-amber-500/40 p-1.5 rounded-xl flex-1 min-w-0">
                  <img src={attachedImage.url} alt="Cover" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-xs font-serif font-bold text-amber-200 truncate">{attachedImage.name}</p>
                    <p className="text-[10px] text-stone-400 font-mono">1024x1024 8K Master</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachedImage(null)}
                    className="text-stone-400 hover:text-red-400 font-bold px-2 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isGeneratingCover}
                  onClick={handleGenerateAICover}
                  className="w-full py-2 bg-gradient-to-r from-amber-950 to-stone-900 hover:from-amber-900 border border-amber-600/50 text-amber-300 font-serif font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  {isGeneratingCover ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      <span>{isEn ? 'Generating Artwork...' : 'Generando Portada IA...'}</span>
                    </>
                  ) : (
                    <>
                      <Palette className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isEn ? 'Generate AI Cover Image (8K)' : 'Generar Portada de Disco (8K)'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Voice Model & Upload Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1b212f]">
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 bg-[#090b10] hover:bg-[#141824] border border-[#22293b] text-stone-300 text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Upload Custom Photo</span>
              </button>

              {onOpenCustomInstrumentalModal && (
                <button
                  type="button"
                  onClick={onOpenCustomInstrumentalModal}
                  className="px-3 py-2 bg-[#121622] hover:bg-[#1a2133] border border-emerald-600/50 text-emerald-300 text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isEn ? 'My Beats' : 'Subir Beat'}</span>
                </button>
              )}
            </div>

            {/* Voice Model Chips */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-stone-400 font-mono text-[10px]">Singer:</span>
              {(['Fenrir', 'Charon', 'Puck', 'Zephyr'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSelectedVoice(v)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    selectedVoice === v
                      ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                      : 'bg-[#090b10] text-stone-400 hover:text-stone-200 border border-[#1f2536]'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action CTA Button */}
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 disabled:opacity-50 text-stone-950 font-serif font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                <span>{t.generatingClip}</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 text-stone-950" />
                <span>{t.generateClipButton}</span>
              </>
            )}
          </button>
        </form>
      </section>

      {/* ========================================================================= */}
      {/* 2. ACTIVE SESSION SPOTLIGHT AUDIO PLAYER CARD                             */}
      {/* ========================================================================= */}
      <section className="bg-[#10121a] border-2 border-emerald-500/60 p-4 sm:p-5 rounded-3xl shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-[#1c2232] pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="font-serif font-bold text-stone-100 text-xs uppercase tracking-wide">
              {isEn ? 'Active Master Session' : 'Sesión Activa de Estudio'}
            </h3>
          </div>
          <span className="text-[10px] font-mono text-stone-400">
            {activeMasterProject.tempo || '142 BPM'} · {activeMasterProject.musicalKey || 'G Major'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 overflow-hidden flex items-center justify-center shrink-0 shadow-md relative group">
            {activeMasterProject.imageUrl ? (
              <img src={activeMasterProject.imageUrl} alt={activeMasterProject.title} className="w-full h-full object-cover" />
            ) : (
              <Music className="w-8 h-8 text-amber-400" />
            )}
            <button
              onClick={() => handleTogglePlay(activeMasterProject, 'active-project-spotlight')}
              className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              {playingSongId === 'active-project-spotlight' ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="font-serif font-black text-stone-100 text-sm sm:text-base uppercase truncate">
              {activeMasterProject.title}
            </h4>
            <p className="text-[11px] text-stone-400 truncate mt-0.5">
              {activeMasterProject.style || 'Universal AI Production'}
            </p>

            {/* Real-Time Seek & Time Display */}
            {playingSongId === 'active-project-spotlight' && (
              <div className="mt-2 space-y-1">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={audioProgress}
                  onChange={handleSeek}
                  className="w-full accent-amber-500 h-1 bg-[#1a2030] rounded-lg cursor-pointer"
                />
                <div className="flex items-center justify-between text-[9px] font-mono text-amber-400">
                  <span>{formatTime(audioCurrentTime)}</span>
                  <span>{formatTime(audioDuration)}</span>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleTogglePlay(activeMasterProject, 'active-project-spotlight')}
            className="w-11 h-11 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg cursor-pointer shrink-0 transition-transform active:scale-95"
          >
            {playingSongId === 'active-project-spotlight' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1c2232]">
          <button
            onClick={() => onOpenInStudio(activeMasterProject)}
            className="py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-stone-950 font-serif font-black text-xs uppercase rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Studio DAW</span>
          </button>

          <button
            onClick={() => onOpenVeoStudio(activeMasterProject)}
            className="py-2.5 bg-[#1a1420] border border-rose-600/40 text-rose-300 font-serif font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Video className="w-3.5 h-3.5" />
            <span>4K Video</span>
          </button>

          <button
            onClick={() => handleDownloadTrack(activeMasterProject)}
            className="py-2.5 bg-[#141824] border border-[#273044] text-amber-300 font-serif font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. QUICK WORKFLOW LAUNCHERS GRID                                          */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-2 gap-3">
        {/* Module 1: Song Studio */}
        <div 
          onClick={() => onOpenInStudio(activeMasterProject)}
          className="p-3.5 bg-[#10121a] border border-[#222838] hover:border-amber-500/70 rounded-2xl shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-amber-400 font-mono">DAW</span>
          </div>
          <div>
            <h3 className="font-serif font-bold text-stone-100 text-xs uppercase group-hover:text-amber-300">
              {isEn ? 'Studio DAW' : 'Estudio DAW'}
            </h3>
            <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">
              {isEn ? 'Multi-track Stems & Mix' : 'Mezcla y Stems WAV'}
            </p>
          </div>
        </div>

        {/* Module 2: Custom Beat Studio */}
        <div 
          onClick={() => {
            if (onOpenCustomInstrumentalModal) onOpenCustomInstrumentalModal();
          }}
          className="p-3.5 bg-[#10121a] border border-[#222838] hover:border-emerald-500/70 rounded-2xl shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Upload className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">WAV/MP3</span>
          </div>
          <div>
            <h3 className="font-serif font-bold text-stone-100 text-xs uppercase group-hover:text-emerald-300">
              {isEn ? 'Custom Beats' : 'Subir Beat'}
            </h3>
            <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">
              {isEn ? 'Import Instrumental Tracks' : 'BPM Automático'}
            </p>
          </div>
        </div>

        {/* Module 3: Veo 4K Cinema Video */}
        <div 
          onClick={() => onOpenVeoStudio(activeMasterProject)}
          className="p-3.5 bg-[#10121a] border border-[#222838] hover:border-rose-500/70 rounded-2xl shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300">
              <Video className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-rose-300 font-mono">Veo 3.1</span>
          </div>
          <div>
            <h3 className="font-serif font-bold text-stone-100 text-xs uppercase group-hover:text-rose-300">
              {isEn ? '4K Video Studio' : 'Video 4K Veo'}
            </h3>
            <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">
              {isEn ? 'Cinematic Music Videos' : 'Video Cinemático'}
            </p>
          </div>
        </div>

        {/* Module 4: Artist Copilots */}
        <div 
          onClick={onOpenAgentsHub}
          className="p-3.5 bg-[#10121a] border border-[#222838] hover:border-cyan-500/70 rounded-2xl shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Bot className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-cyan-300 font-mono">.MD Vault</span>
          </div>
          <div>
            <h3 className="font-serif font-bold text-stone-100 text-xs uppercase group-hover:text-cyan-300">
              {isEn ? 'Artist Copilots' : 'Copilotos IA'}
            </h3>
            <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">
              {isEn ? 'Autonomous Producers' : 'Bóvedas de Estilo'}
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FEATURED CATALOG HITS LIST                                             */}
      {/* ========================================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1 border-b border-[#1c2232] pb-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <h3 className="font-serif font-bold text-stone-100 text-xs uppercase tracking-wide">
              {isEn ? 'Featured Catalog Hits' : 'Catálogo de Éxitos'}
            </h3>
          </div>
          <span className="text-[10px] font-mono text-stone-400">
            {FEATURED_CORRIDOS.length} Master Hits
          </span>
        </div>

        {/* Streamlined Song Card List */}
        <div className="space-y-2.5">
          {filteredFeaturedSongs.map((song) => (
            <div 
              key={song.id}
              className="p-3 bg-[#10121a] border border-[#222838] hover:border-amber-500/50 rounded-2xl flex flex-col space-y-2 transition-all group"
            >
              <div className="flex items-center justify-between gap-3 min-w-0">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 overflow-hidden flex items-center justify-center shrink-0 relative">
                    {song.imageUrl ? (
                      <img src={song.imageUrl} alt={song.title} className="w-full h-full object-cover" />
                    ) : (
                      <Music className="w-5 h-5 text-amber-400" />
                    )}
                    <button
                      onClick={() => handleTogglePlay(song, song.id)}
                      className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      {playingSongId === song.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-mono">
                      <span className="font-bold">{song.tempo}</span>
                      <span className="text-stone-500">·</span>
                      <span className="truncate">{song.musicalKey}</span>
                    </div>
                    <h4 className="font-serif font-bold text-stone-100 text-xs uppercase truncate group-hover:text-amber-300">
                      {song.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleTogglePlay(song, song.id)}
                    className="w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
                  >
                    {playingSongId === song.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  <button
                    onClick={() => onOpenInStudio(song)}
                    className="px-2.5 py-1.5 bg-[#141824] hover:bg-[#1f2638] border border-[#273044] text-amber-300 text-[10px] font-mono font-bold uppercase rounded-lg cursor-pointer"
                  >
                    DAW
                  </button>
                </div>
              </div>

              {/* Progress bar when this song is playing */}
              {playingSongId === song.id && (
                <div className="pt-1 border-t border-[#1c2232] space-y-1">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={audioProgress}
                    onChange={handleSeek}
                    className="w-full accent-amber-500 h-1 bg-[#1a2030] rounded-lg cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[9px] font-mono text-amber-400">
                    <span>{formatTime(audioCurrentTime)}</span>
                    <span>{formatTime(audioDuration)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
