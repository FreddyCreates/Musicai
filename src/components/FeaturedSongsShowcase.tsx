import React, { useState, useEffect, useRef } from 'react';
import { FEATURED_CORRIDOS, FeaturedSongItem } from '../data/featuredCorridos';
import { CorridoData } from '../types';
import { Play, Pause, Disc, ArrowRight, Sparkles, Volume2, Music2, Clapperboard } from 'lucide-react';
import { AppLanguage } from '../utils/i18n';

interface FeaturedSongsShowcaseProps {
  language?: AppLanguage;
  onOpenInStudio: (song: CorridoData) => void;
  onUseAsTemplate?: (song: CorridoData) => void;
  onOpenVeoStudio?: (song: CorridoData) => void;
}

export function FeaturedSongsShowcase({ language = 'en', onOpenInStudio, onOpenVeoStudio }: FeaturedSongsShowcaseProps) {
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'hip_hop' | 'electronic' | 'rnb' | 'latin_urban' | 'country' | 'banda' | 'tumbado'>('all');
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Stop audio when component unmounts
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const filteredSongs = FEATURED_CORRIDOS.filter((song) => {
    if (!song) return false;
    if (activeFilter === 'all') return true;
    return song.genreKey === activeFilter;
  });

  const handleTogglePlay = (song: FeaturedSongItem) => {
    // Stop any existing audio first
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    if (playingSongId === song.id) {
      setPlayingSongId(null);
      setPlaybackProgress(0);
      setCurrentTime(0);
      return;
    }

    if (song.audioUrl) {
      const audio = new Audio(song.audioUrl);
      currentAudioRef.current = audio;

      audio.ontimeupdate = () => {
        if (audio.duration) {
          setCurrentTime(audio.currentTime);
          setDuration(audio.duration);
          setPlaybackProgress((audio.currentTime / audio.duration) * 100);
        }
      };

      audio.play().then(() => {
        setPlayingSongId(song.id);
      }).catch((err) => {
        console.error("Error playing real song audio:", err);
        setPlayingSongId(null);
      });

      audio.onended = () => {
        setPlayingSongId(null);
        setPlaybackProgress(0);
        setCurrentTime(0);
        currentAudioRef.current = null;
      };
      audio.onerror = (e) => {
        console.error("Audio playback error for song:", song.title, e);
        setPlayingSongId(null);
      };
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentAudioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(1, clickX / rect.width));
    currentAudioRef.current.currentTime = newProgress * duration;
    setPlaybackProgress(newProgress * 100);
  };

  const handleOpenStudio = (song: FeaturedSongItem) => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setPlayingSongId(null);
    onOpenInStudio(song);
  };

  const isEn = language === 'en';

  return (
    <section className="w-full mb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-amber-900/40 pb-4">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-widest rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> {isEn ? 'MelodyCraft Pro Master Vault' : 'Bóveda Master MelodyCraft Pro'}
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-black text-amber-100 uppercase tracking-tight">
            {isEn ? 'Featured Hit Master Catalog' : 'Catálogo de Éxitos Master Destacados'}
          </h2>
          <p className="text-stone-400 text-xs md:text-sm mt-1 max-w-2xl">
            {isEn ? 'Explore pre-produced multi-genre hits (Pop, Electronic, R&B, Corridos), listen to instant 30s clips, and load directly into the DAW.' : 'Explora éxitos pre-producidos de múltiples géneros (Pop, Electrónica, R&B, Corridos), escucha clips instantáneos y cárgalos directo al DAW.'}
          </p>
        </div>

        {playingSongId && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-950/80 border border-amber-500 text-amber-300 text-xs font-bold rounded">
            <Volume2 className="w-4 h-4 animate-bounce text-amber-400" />
            <span>{isEn ? 'Live Preview Playing' : 'Reproduciendo en vivo'}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
              : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800'
          }`}
        >
          🔥 {isEn ? 'All Hits' : 'Todos los Éxitos'} ({FEATURED_CORRIDOS.length})
        </button>
        <button
          onClick={() => setActiveFilter('hip_hop')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeFilter === 'hip_hop'
              ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
              : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800'
          }`}
        >
          <span>🎤 {isEn ? 'Street Rap & Hip-Hop (4K Video)' : 'Rap Callejero & Hip-Hop (Video 4K)'}</span>
        </button>
        <button
          onClick={() => setActiveFilter('tumbado')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeFilter === 'tumbado'
              ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
              : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800'
          }`}
        >
          <span>🔥 {isEn ? 'Tumbados & Corridos' : 'Tumbados & Bélicos'}</span>
        </button>
        <button
          onClick={() => setActiveFilter('bajacali')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeFilter === 'bajacali'
              ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
              : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800'
          }`}
        >
          <span>🌊 Baja Cali (Mexicali)</span>
        </button>
        <button
          onClick={() => setActiveFilter('sierreno')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
            activeFilter === 'sierreno'
              ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
              : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800'
          }`}
        >
          ⛰️ {isEn ? 'Sierra & Requintos' : 'Sierra & Requintos'}
        </button>
        <button
          onClick={() => setActiveFilter('norteno')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
            activeFilter === 'norteno'
              ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
              : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800'
          }`}
        >
          🦁 {isEn ? 'Modern Norteño' : 'Norteño con Tarolas'}
        </button>
        <button
          onClick={() => setActiveFilter('banda')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeFilter === 'banda'
              ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
              : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800'
          }`}
        >
          <span>🎺 {isEn ? 'Banda Sinaloense' : 'Banda Sinaloense'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {filteredSongs.map((song) => {
          const isPlaying = playingSongId === song.id;

          return (
            <div
              key={song.id}
              className={`group bg-stone-950/90 border transition-all duration-300 rounded-lg overflow-hidden flex flex-col justify-between relative shadow-xl hover:shadow-2xl ${
                isPlaying ? 'border-amber-500 ring-1 ring-amber-500/50' : 'border-[#222838] hover:border-amber-600/50'
              }`}
            >
              {/* Top Image & Overlay */}
              <div className="relative h-48 w-full overflow-hidden bg-stone-900">
                {song.imageUrl ? (
                  <img
                    src={song.imageUrl}
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-stone-900 text-amber-500">
                    <Music2 className="w-12 h-12" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />

                {/* Genre Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded text-[10px] font-mono font-black uppercase tracking-wider bg-stone-950/90 text-amber-300 border border-amber-600/60 shadow-md">
                    {song.badge}
                  </span>
                </div>

                {/* ISRC / Master ID */}
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-stone-900/90 text-stone-300 border border-stone-700">
                    US-MT1-26-001
                  </span>
                </div>

                {/* Song Title & Subtitle on Image */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-serif font-black text-stone-100 text-lg uppercase tracking-wide drop-shadow-md">
                    {song.title}
                  </h3>
                  <p className="text-xs text-amber-300/90 font-medium truncate">
                    {song.artistTag}
                  </p>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
                <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed font-sans">
                  {song.storySummary}
                </p>

                {/* Audio Progress Bar if playing */}
                {isPlaying && (
                  <div className="space-y-1">
                    <div 
                      onClick={handleSeek}
                      className="w-full bg-stone-800 h-1.5 rounded-full cursor-pointer relative overflow-hidden"
                    >
                      <div 
                        className="bg-amber-500 absolute top-0 left-0 bottom-0 transition-all duration-150"
                        style={{ width: `${playbackProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-stone-400">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration || 30)}</span>
                    </div>
                  </div>
                )}

                {/* Metadata badges */}
                <div className="grid grid-cols-3 gap-1.5 py-2 border-t border-stone-800/80 text-[11px] font-mono">
                  <div className="bg-stone-900/80 p-1.5 rounded border border-stone-800 text-center">
                    <span className="block text-[9px] text-stone-400 uppercase">{isEn ? 'Tempo' : 'Tempo'}</span>
                    <span className="font-bold text-amber-300">{song.tempo}</span>
                  </div>
                  <div className="bg-stone-900/80 p-1.5 rounded border border-stone-800 text-center">
                    <span className="block text-[9px] text-stone-400 uppercase">{isEn ? 'Key' : 'Tonalidad'}</span>
                    <span className="font-bold text-amber-300 truncate block">{song.musicalKey.split(' ')[0]}</span>
                  </div>
                  <div className="bg-stone-900/80 p-1.5 rounded border border-stone-800 text-center">
                    <span className="block text-[9px] text-stone-400 uppercase">{isEn ? 'Meter' : 'Compás'}</span>
                    <span className="font-bold text-amber-300">{song.timeSignature.split(' ')[0]}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-2 pt-2 border-t border-stone-800/80 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePlay(song)}
                      className={`flex-1 py-2 px-3 rounded font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                        isPlaying
                          ? 'bg-amber-600 text-stone-950'
                          : 'bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-800/60'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>{isEn ? 'Pause' : 'Pausar'}</span>
                        </>
                      ) : (
                        <>
                          <Disc className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isEn ? 'Listen' : 'Escuchar'}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleOpenStudio(song)}
                      className="flex-1 py-2 px-3 rounded font-serif font-black text-xs uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg hover:scale-[1.02]"
                    >
                      <span>{isEn ? 'Open DAW' : 'Estudio'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Direct Veo 3 / 2 Cinema Music Video Studio Button */}
                  <button
                    onClick={() => {
                      const songCorridoData: CorridoData = {
                        title: song.title,
                        storySummary: song.storySummary,
                        lyrics: song.lyrics || [],
                        coverPrompt: song.coverPrompt || 'Cinematic cover art',
                        tempo: String(song.tempo || '132 BPM'),
                        musicalKey: song.musicalKey || 'G Minor (Sol Menor)',
                        timeSignature: song.timeSignature || '3/4 (Vals Corrido Bélico)',
                        imageUrl: song.imageUrl,
                        audioUrl: song.audioUrl,
                        proAudioUrl: song.audioUrl,
                        clipAudioUrl: song.clipAudioUrl || song.audioUrl,
                        style: song.style as any,
                        songHash: song.songHash || song.id,
                        hasMusicVideo: song.hasMusicVideo,
                        videoUrl: song.videoUrl,
                        videoPosterUrl: song.videoPosterUrl,
                        videoModel: song.videoModel,
                        videoAspectRatio: song.videoAspectRatio,
                        videoResolution: song.videoResolution,
                        videoDirectorPrompt: song.videoDirectorPrompt
                      };
                      if (onOpenVeoStudio) {
                        onOpenVeoStudio(songCorridoData);
                      } else {
                        handleOpenStudio(song);
                      }
                    }}
                    className={`w-full py-2 px-3 rounded font-serif font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow ${
                      song.hasMusicVideo
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 border border-amber-300 shadow-amber-900/30'
                        : 'bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 hover:from-amber-900 hover:to-stone-900 text-amber-300 border border-amber-600/50'
                    }`}
                  >
                    <Clapperboard className="w-3.5 h-3.5 fill-current" />
                    <span>
                      {song.hasMusicVideo
                        ? (isEn ? '🎬 Watch & Customize 4K Music Video (Veo 3.1)' : '🎬 Ver & Personalizar Video 4K (Veo 3.1)')
                        : (isEn ? '🎬 Create 4K Music Video with Veo 3.1' : '🎬 Crear Video Musical con Veo 3.1')}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
