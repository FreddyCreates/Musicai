import React, { useState, useEffect, useRef } from 'react';
import { 
  Music, Play, Pause, Search, Disc, Sliders, Globe, Filter, 
  Sparkles, Layers, Download, CheckCircle2, Award, Clock, ArrowRight,
  Clapperboard, Video, X, Volume2, VolumeX, Maximize2, Share2
} from 'lucide-react';
import { CorridoData } from '../types';
import { FEATURED_CORRIDOS, FeaturedSongItem } from '../data/featuredCorridos';
import { AppLanguage, translations } from '../utils/i18n';

interface MusicLibraryVaultProps {
  language: AppLanguage;
  onSelectSongForStudio: (song: CorridoData) => void;
  onSelectSongForInstrumental: (song: CorridoData) => void;
  onOpenDistribution: () => void;
  onOpenVeoStudio?: (song: CorridoData) => void;
}

export const MusicLibraryVault: React.FC<MusicLibraryVaultProps> = ({
  language,
  onSelectSongForStudio,
  onSelectSongForInstrumental,
  onOpenDistribution,
  onOpenVeoStudio
}) => {
  const t = translations[language];
  const isEn = language === 'en';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<string>('all');
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // Video Player Modal State
  const [selectedVideoSong, setSelectedVideoSong] = useState<FeaturedSongItem | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);

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
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    const url = song.clipAudioUrl || song.audioUrl || song.proAudioUrl || '/audio/codigo_214_rap_master.mp3';
    try {
      const audio = new Audio(url);

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };

      audio.onloadedmetadata = () => {
        setDuration(audio.duration || 180);
      };

      audio.onended = () => {
        setPlayingSongId(null);
        setCurrentTime(0);
      };

      audio.onerror = () => {
        console.warn("Audio playback error, attempting fallback track");
        const fallback = new Audio('/audio/codigo_214_rap_master.mp3');
        fallback.ontimeupdate = () => setCurrentTime(fallback.currentTime);
        fallback.onloadedmetadata = () => setDuration(fallback.duration || 180);
        fallback.onended = () => {
          setPlayingSongId(null);
          setCurrentTime(0);
        };
        fallback.play().catch(console.error);
        setCurrentAudio(fallback);
      };

      audio.play().catch((err) => {
        console.warn("Audio playback interrupted or blocked:", err);
        setPlayingSongId(null);
      });

      setCurrentAudio(audio);
      setPlayingSongId(id);
    } catch (err) {
      console.error("Failed to initialize audio player:", err);
      setPlayingSongId(null);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>, totalDuration: number) => {
    if (!currentAudio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * (totalDuration || 1);
    currentAudio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return '0:00';
    const mins = Math.floor(secs / 60);
    const remSecs = Math.floor(secs % 60);
    return `${mins}:${remSecs < 10 ? '0' : ''}${remSecs}`;
  };

  const handleOpenVideoModal = (song: FeaturedSongItem) => {
    if (currentAudio) {
      currentAudio.pause();
      setPlayingSongId(null);
    }
    setSelectedVideoSong(song);
    setIsVideoModalOpen(true);
  };

  const handleCloseVideoModal = () => {
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
    }
    setIsVideoModalOpen(false);
    setSelectedVideoSong(null);
  };

  const filteredSongs = FEATURED_CORRIDOS.filter((song) => {
    const matchesSearch = 
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artistTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (song.style || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.storySummary.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedGenreFilter === 'all') return true;
    if (selectedGenreFilter === 'video') return Boolean(song.hasMusicVideo);
    if (selectedGenreFilter === 'hip_hop') return song.genreKey === 'hip_hop';
    
    return song.genreKey.toLowerCase() === selectedGenreFilter.toLowerCase();
  });

  const videoSongsCount = FEATURED_CORRIDOS.filter(s => s.hasMusicVideo).length;
  const rapSongsCount = FEATURED_CORRIDOS.filter(s => s.genreKey === 'hip_hop').length;

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Disc className="w-5 h-5 text-amber-500 animate-spin" />
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              {t.libraryTitle}
            </span>
          </div>
          <h2 className="font-serif font-black text-amber-100 text-2xl uppercase tracking-wide mt-1 flex items-center gap-2.5">
            <span>Hit Masters & Reference Vault</span>
            <span className="px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-xs font-mono font-black rounded-full uppercase tracking-normal">
              4K Veo 3.1 Inside
            </span>
          </h2>
          <p className="text-xs text-stone-400 mt-1 max-w-xl">
            {t.librarySubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenVeoStudio && (
            <button
              onClick={() => onOpenVeoStudio(FEATURED_CORRIDOS[0])}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 rounded-xl text-xs font-serif font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg transition-transform hover:scale-105 border border-amber-300"
            >
              <Clapperboard className="w-4 h-4 fill-current" />
              <span>Estudio de Video Veo 3.1</span>
            </button>
          )}

          <button
            onClick={onOpenDistribution}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-850 border border-emerald-600/50 text-emerald-300 rounded-xl text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span>Ver Pipeline DDEX</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-3 py-1.5 bg-stone-900 border border-stone-700 text-amber-200 text-xs rounded-xl focus:outline-none focus:border-amber-500 font-sans"
          />
        </div>

        {/* Genre Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setSelectedGenreFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase cursor-pointer transition-all ${
              selectedGenreFilter === 'all'
                ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            {t.filterAll} ({FEATURED_CORRIDOS.length})
          </button>

          {/* Videos Musicales filter */}
          <button
            onClick={() => setSelectedGenreFilter('video')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase cursor-pointer transition-all flex items-center gap-1.5 ${
              selectedGenreFilter === 'video'
                ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                : 'bg-stone-900 text-amber-400 hover:text-amber-200 border border-amber-500/40'
            }`}
          >
            <Clapperboard className="w-3.5 h-3.5 fill-current" />
            <span>🎬 Videos Musicales ({videoSongsCount})</span>
          </button>

          {/* Rap & Hip-Hop filter */}
          <button
            onClick={() => setSelectedGenreFilter('hip_hop')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase cursor-pointer transition-all flex items-center gap-1.5 ${
              selectedGenreFilter === 'hip_hop'
                ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                : 'bg-stone-900 text-amber-300 hover:text-white border border-stone-800'
            }`}
          >
            <span>🎤 Rap & Hip-Hop ({rapSongsCount})</span>
          </button>

          <button
            onClick={() => setSelectedGenreFilter('belico')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase cursor-pointer transition-all ${
              selectedGenreFilter === 'belico'
                ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            Bélico Tech
          </button>
          <button
            onClick={() => setSelectedGenreFilter('sierreno')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase cursor-pointer transition-all ${
              selectedGenreFilter === 'sierreno'
                ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            Sierreño 12-String
          </button>
          <button
            onClick={() => setSelectedGenreFilter('banda')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase cursor-pointer transition-all ${
              selectedGenreFilter === 'banda'
                ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            Banda Sinaloense
          </button>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSongs.map((song) => (
          <div
            key={song.id}
            className={`bg-stone-950 border rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all hover:shadow-2xl group ${
              song.hasMusicVideo ? 'border-amber-500/60 shadow-lg shadow-amber-950/20' : 'border-stone-800 hover:border-amber-500/50'
            }`}
          >
            <div>
              {/* Image & Floating Quick Play Overlay */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-stone-900 mb-3 group/card">
                <img
                  src={song.imageUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'}
                  alt={song.title}
                  className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

                {/* Genre & Quality Badges */}
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
                  <span className="px-2 py-0.5 bg-stone-900/90 text-amber-300 border border-amber-600/40 text-[10px] font-mono font-bold rounded-md uppercase">
                    {song.genreKey.toUpperCase()}
                  </span>
                  {song.hasMusicVideo && (
                    <span className="px-2 py-0.5 bg-amber-500 text-stone-950 font-mono font-black text-[10px] rounded-md uppercase shadow flex items-center gap-1">
                      <Clapperboard className="w-3 h-3 fill-current" />
                      <span>Veo 3.1 4K</span>
                    </span>
                  )}
                </div>

                {/* Video Trigger Button (Top Right) */}
                {song.hasMusicVideo && (
                  <button
                    onClick={() => handleOpenVideoModal(song)}
                    className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-black/80 hover:bg-black text-amber-300 hover:text-white rounded-lg border border-amber-500/50 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg transition-transform hover:scale-105 z-10 cursor-pointer"
                    title="Ver Video Musical Oficial en 4K"
                  >
                    <Video className="w-3 h-3 text-amber-400" />
                    <span>Video 4K</span>
                  </button>
                )}

                {/* Center Floating 'Quick Play' Overlay Button */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePlay(song, song.id);
                    }}
                    className={`pointer-events-auto px-4 py-2.5 rounded-full flex items-center gap-2.5 shadow-2xl transition-all cursor-pointer transform hover:scale-110 active:scale-95 z-20 ${
                      playingSongId === song.id
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-serif font-black shadow-amber-500/50 ring-4 ring-amber-400/40 scale-105 animate-pulse'
                        : 'bg-stone-950/90 hover:bg-amber-500 text-amber-300 hover:text-stone-950 border-2 border-amber-500/60 font-serif font-bold text-xs uppercase tracking-wider backdrop-blur-md shadow-amber-950/40'
                    }`}
                    title={playingSongId === song.id ? 'Pausar Preview Directo' : 'Escuchar Quick Play Preview Directo'}
                  >
                    {playingSongId === song.id ? (
                      <>
                        <div className="flex items-center gap-0.5 h-3.5">
                          <span className="w-1 h-3 bg-stone-950 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1 h-4 bg-stone-950 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1 h-2 bg-stone-950 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <Pause className="w-4 h-4 fill-current" />
                        <span className="text-xs font-black uppercase tracking-wider">Pausar</span>
                      </>
                    ) : (
                      <>
                        <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-400/40 group-hover:bg-stone-950/20">
                          <Play className="w-4 h-4 ml-0.5 fill-current text-amber-400 group-hover/card:text-amber-300" />
                        </div>
                        <span className="text-xs uppercase font-black tracking-wider">Quick Play</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Active Audio Scrubber Strip */}
                {playingSongId === song.id && (
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-stone-950/95 backdrop-blur-md border-t border-amber-500/40 z-20 animate-fadeIn">
                    <div className="flex items-center justify-between text-[10px] font-mono text-amber-300 mb-1">
                      <span className="flex items-center gap-1 font-bold">
                        <Volume2 className="w-3 h-3 text-amber-400 animate-pulse" />
                        <span className="text-amber-200">En Reproducción</span>
                      </span>
                      <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                    </div>
                    <div
                      onClick={(e) => handleSeek(e, duration)}
                      className="w-full h-2 bg-stone-800 rounded-full overflow-hidden cursor-pointer relative group/seek border border-stone-700/60"
                    >
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 rounded-full transition-all duration-100"
                        style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 mb-1">
                <span className="truncate pr-2">{song.artistTag}</span>
                <span className="text-amber-400 whitespace-nowrap">{song.tempo} • {song.musicalKey}</span>
              </div>

              <h3 className="font-serif font-black text-stone-100 text-base group-hover:text-amber-300 transition-colors">
                {song.title}
              </h3>

              <p className="text-xs text-stone-400 line-clamp-2 mt-1.5 leading-relaxed">
                {song.storySummary}
              </p>

              {song.hasMusicVideo && (
                <div className="mt-2.5 p-2 bg-amber-950/30 border border-amber-500/30 rounded-lg flex items-center justify-between text-[11px]">
                  <span className="text-amber-300 font-mono font-bold flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-amber-400" />
                    <span>Video Musical Generado por el Sistema</span>
                  </span>
                  <button
                    onClick={() => handleOpenVideoModal(song)}
                    className="text-amber-400 hover:text-amber-200 font-bold underline cursor-pointer"
                  >
                    Ver Ahora
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-stone-900 flex flex-col gap-2">
              {song.hasMusicVideo && (
                <button
                  onClick={() => handleOpenVideoModal(song)}
                  className="w-full py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-serif font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all hover:scale-[1.02] border border-amber-300"
                >
                  <Clapperboard className="w-4 h-4 fill-current" />
                  <span>🎬 Ver Video Musical Oficial (4K)</span>
                </button>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectSongForStudio(song)}
                  className="flex-1 py-2 bg-stone-900 hover:bg-stone-850 text-stone-200 hover:text-amber-300 border border-stone-800 hover:border-amber-500/50 font-serif font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{t.editInStudio}</span>
                </button>

                {onOpenVeoStudio && (
                  <button
                    onClick={() => onOpenVeoStudio(song)}
                    className="px-3 py-2 bg-stone-900 hover:bg-stone-850 border border-amber-500/40 text-amber-400 font-serif font-bold text-xs uppercase rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                    title="Abrir en Estudio de Video Veo 3.1"
                  >
                    <Clapperboard className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Veo</span>
                  </button>
                )}

                <button
                  onClick={() => onSelectSongForInstrumental(song)}
                  className="px-3 py-2 bg-stone-900 hover:bg-stone-850 border border-stone-700 text-stone-400 hover:text-amber-300 font-serif font-bold text-xs uppercase rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                  title="Editar Instrumentales y Stems"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Stems</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DEDICATED MUSIC VIDEO PLAYER MODAL */}
      {isVideoModalOpen && selectedVideoSong && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-stone-950 border-2 border-amber-500/60 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400">
                  <Clapperboard className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-500 text-stone-950 text-[10px] font-mono font-black uppercase rounded">
                      Veo 3.1 Fast Master
                    </span>
                    <span className="text-[11px] font-mono text-stone-400">
                      ARRI Alexa 65 • 35mm Master Anamorphic • 4K UHD
                    </span>
                  </div>
                  <h3 className="font-serif font-black text-amber-100 text-lg uppercase tracking-wide">
                    {selectedVideoSong.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onOpenVeoStudio && (
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseVideoModal();
                      onOpenVeoStudio(selectedVideoSong);
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-serif font-black text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Personalizar en Veo Studio</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCloseVideoModal}
                  className="p-2 bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white rounded-lg border border-stone-800 cursor-pointer"
                  title="Cerrar reproductor"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Video + Lyrics Side-by-Side */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto flex-1">
              
              {/* Left: Video Player */}
              <div className="lg:col-span-8 bg-black flex flex-col justify-center items-center p-4 border-b lg:border-b-0 lg:border-r border-stone-800">
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-stone-950 border border-stone-800 shadow-2xl">
                  <video
                    ref={modalVideoRef}
                    src={selectedVideoSong.videoUrl}
                    poster={selectedVideoSong.videoPosterUrl || selectedVideoSong.imageUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold">
                    4K MASTER 24FPS
                  </div>
                </div>

                {/* Video Info Bar */}
                <div className="w-full mt-3 p-3 bg-stone-900/60 rounded-xl border border-stone-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 font-mono font-bold">
                      {selectedVideoSong.artistTag}
                    </span>
                    <span className="text-stone-500">•</span>
                    <span className="text-stone-400 font-mono">
                      {selectedVideoSong.tempo} • {selectedVideoSong.musicalKey}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={selectedVideoSong.videoUrl}
                      download="music_video_veo_3_1.mp4"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>Descargar MP4</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Right: Lyrics & Production Dossier */}
              <div className="lg:col-span-4 bg-stone-950 p-5 flex flex-col space-y-4 overflow-y-auto">
                <div>
                  <h4 className="text-xs font-serif font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5" /> Dossier de Producción
                  </h4>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    {selectedVideoSong.storySummary}
                  </p>
                </div>

                {selectedVideoSong.videoDirectorPrompt && (
                  <div className="p-3 bg-stone-900/70 border border-amber-500/30 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">
                      Prompt de Dirección Veo 3.1 Fast:
                    </span>
                    <p className="text-[11px] text-stone-300 italic leading-relaxed">
                      "{selectedVideoSong.videoDirectorPrompt}"
                    </p>
                  </div>
                )}

                {/* Lyrics Display */}
                <div className="space-y-2 flex-1">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">
                    Letras Oficiales (Rap):
                  </span>
                  <div className="space-y-3 bg-stone-900/50 p-3 rounded-xl border border-stone-800 max-h-64 overflow-y-auto text-xs">
                    {selectedVideoSong.lyrics?.map((stanza, idx) => (
                      <div key={idx} className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-amber-400/80 px-1.5 py-0.5 bg-stone-800 rounded">
                          {stanza.type}
                        </span>
                        <p className="text-stone-300 font-sans whitespace-pre-line leading-relaxed pl-1">
                          {stanza.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-stone-800 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseVideoModal();
                      onSelectSongForStudio(selectedVideoSong);
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-serif font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Cargar en Master DAW</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

