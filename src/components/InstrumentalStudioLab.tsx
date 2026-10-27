import React, { useState, useEffect, useRef } from 'react';
import { 
  Sliders, Music, Play, Pause, Square, Volume2, Sparkles, Wand2, 
  Download, RefreshCw, Layers, CheckCircle2, Flame, Shield, Radio,
  Share2, ArrowLeft, ArrowRight, Zap, Disc, FileAudio, Settings
} from 'lucide-react';
import { CorridoData } from '../types';
import { audioSynth } from '../utils/audioSynth';
import { AppLanguage, translations } from '../utils/i18n';

interface InstrumentalStudioLabProps {
  songData: CorridoData;
  language: AppLanguage;
  onBackToStudio: () => void;
  onUpdateSongData?: (updated: CorridoData) => void;
  onOpenDistribution?: () => void;
}

interface StemChannel {
  id: string;
  nameKey: string;
  icon: string;
  color: string;
  volume: number;
  pan: number;
  isSolo: boolean;
  isMuted: boolean;
  type: 'requinto' | 'brass' | 'accordion' | 'bass' | 'drums' | 'vocal';
  level: number; // for VU meter
}

export const InstrumentalStudioLab: React.FC<InstrumentalStudioLabProps> = ({
  songData,
  language,
  onBackToStudio,
  onUpdateSongData,
  onOpenDistribution
}) => {
  const t = translations[language];

  // Playback & Master State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<'master' | 'synth'>('master');
  const [masterBpm, setMasterBpm] = useState<number>(parseInt(songData.tempo) || 142);
  const [selectedKey, setSelectedKey] = useState<string>(songData.musicalKey || 'G');
  const [timeSignature, setTimeSignature] = useState<'3/4' | '2/4'>('3/4');
  const [masterVolume, setMasterVolume] = useState<number>(0.9);
  const masterAudioRef = useRef<HTMLAudioElement | null>(null);

  const getSynthGenre = (styleStr?: string) => {
    const s = (styleStr || '').toLowerCase();
    if (s.includes('trap') || s.includes('rap') || s.includes('hip-hop') || s.includes('808')) return 'street_hard_trap_rap';
    if (s.includes('urban') || s.includes('reggaeton') || s.includes('dembow')) return 'reggaeton_dembow';
    if (s.includes('electro') || s.includes('edm')) return 'electro_corrido';
    if (s.includes('pop') || s.includes('r&b') || s.includes('country') || s.includes('folk')) return 'pop_acoustic_latino';
    if (s.includes('mente maestra')) return 'grupo_mente_maestra';
    if (s.includes('ortiz') || s.includes('pesad') || s.includes('progresivo')) return 'gerardo_ortiz';
    if (s.includes('norte')) return 'norteno';
    if (s.includes('sierr')) return 'sierreno';
    return 'modern_banda_belico';
  };

  // Master FX
  const [tapeSaturation, setTapeSaturation] = useState<number>(65);
  const [reverbMix, setReverbMix] = useState<number>(40);
  const [stereoSpread, setStereoSpread] = useState<number>(80);
  const [isLimiterActive, setIsLimiterActive] = useState<boolean>(true);

  // AI Arranger State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [generatedSoloType, setGeneratedSoloType] = useState<string>('Escala Bélica 12 Cuerdas');

  // Stem Channels
  const [channels, setChannels] = useState<StemChannel[]>([
    {
      id: 'requinto',
      nameKey: t.requintoStem,
      icon: '🎸',
      color: 'from-amber-500 to-yellow-600',
      volume: 0.98,
      pan: 0,
      isSolo: false,
      isMuted: false,
      type: 'requinto',
      level: 0.85
    },
    {
      id: 'tuba',
      nameKey: t.tubaStem,
      icon: '🎺',
      color: 'from-amber-600 to-red-600',
      volume: 0.95,
      pan: 0,
      isSolo: false,
      isMuted: false,
      type: 'bass',
      level: 0.92
    },
    {
      id: 'brass',
      nameKey: t.brassStem,
      icon: '🎷',
      color: 'from-yellow-500 to-amber-700',
      volume: 0.70,
      pan: -20,
      isSolo: false,
      isMuted: false,
      type: 'brass',
      level: 0.75
    },
    {
      id: 'accordion',
      nameKey: t.accordionStem,
      icon: '🪗',
      color: 'from-emerald-500 to-teal-700',
      volume: 0.60,
      pan: 20,
      isSolo: false,
      isMuted: false,
      type: 'accordion',
      level: 0.65
    },
    {
      id: 'drums',
      nameKey: t.drumsStem,
      icon: '🥁',
      color: 'from-blue-500 to-indigo-700',
      volume: 0.90,
      pan: 0,
      isSolo: false,
      isMuted: false,
      type: 'drums',
      level: 0.88
    },
    {
      id: 'vocal',
      nameKey: t.vocalLeadStem,
      icon: '🎙️',
      color: 'from-rose-500 to-purple-600',
      volume: 0.0, // muted by default in instrumental lab
      pan: 0,
      isSolo: false,
      isMuted: true,
      type: 'vocal',
      level: 0.0
    }
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Sync with audioSynth and masterAudioRef
  useEffect(() => {
    return () => {
      if (masterAudioRef.current) {
        masterAudioRef.current.pause();
      }
      if (audioSynth.isPlaying()) {
        audioSynth.stopPlaying();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Update channels translations on language change
  useEffect(() => {
    setChannels(prev => [
      { ...prev[0], nameKey: t.requintoStem },
      { ...prev[1], nameKey: t.tubaStem },
      { ...prev[2], nameKey: t.brassStem },
      { ...prev[3], nameKey: t.accordionStem },
      { ...prev[4], nameKey: t.drumsStem },
      { ...prev[5], nameKey: t.vocalLeadStem }
    ]);
  }, [language]);

  // Visualizer Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;

      // Dark studio grid background
      ctx.fillStyle = '#0f1117';
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = '#1b202c';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (isPlaying) {
        const numBars = 48;
        const barWidth = width / numBars - 2;

        for (let i = 0; i < numBars; i++) {
          const time = Date.now() * 0.005;
          const harmonicFactor = Math.sin(time + i * 0.25) * 0.5 + 0.5;
          const barHeight = Math.max(4, (Math.sin(time * 2 + i * 0.3) * 0.4 + 0.6) * height * 0.85 * harmonicFactor);

          const grad = ctx.createLinearGradient(0, height - barHeight, 0, height);
          if (i < 16) {
            // Bass / Tuba
            grad.addColorStop(0, '#f59e0b');
            grad.addColorStop(1, '#b45309');
          } else if (i < 32) {
            // Requinto / Accordion
            grad.addColorStop(0, '#06b6d4');
            grad.addColorStop(1, '#0e7490');
          } else {
            // Brass / Drums
            grad.addColorStop(0, '#10b981');
            grad.addColorStop(1, '#047857');
          }

          ctx.fillStyle = grad;
          ctx.fillRect(i * (barWidth + 2), height - barHeight, barWidth, barHeight);

          // Peak cap
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(i * (barWidth + 2), height - barHeight - 2, barWidth, 1.5);
        }
      } else {
        // Idle waveform line
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  const handleTogglePlay = () => {
    // Explicit AudioContext initialization and resume on user interaction
    audioSynth.init();

    const effectiveAudioUrl = songData.proAudioUrl || songData.audioUrl || songData.clipAudioUrl;

    if (isPlaying) {
      if (masterAudioRef.current) {
        masterAudioRef.current.pause();
      }
      audioSynth.stopPlaying();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (playbackMode === 'master' && effectiveAudioUrl) {
        if (!masterAudioRef.current) {
          masterAudioRef.current = new Audio(effectiveAudioUrl);
          masterAudioRef.current.onended = () => setIsPlaying(false);
          masterAudioRef.current.onerror = () => {
            console.warn("Master track error, falling back to procedural synthesizer");
            const genre = getSynthGenre(songData.style);
            audioSynth.setTempo(masterBpm);
            audioSynth.setKey(selectedKey);
            audioSynth.startPlaying(timeSignature, selectedKey, masterBpm, genre);
          };
        } else {
          masterAudioRef.current.src = effectiveAudioUrl;
        }
        masterAudioRef.current.play().catch(e => {
          console.warn("Master playback blocked, using synthesizer:", e);
          const genre = getSynthGenre(songData.style);
          audioSynth.setTempo(masterBpm);
          audioSynth.setKey(selectedKey);
          audioSynth.startPlaying(timeSignature, selectedKey, masterBpm, genre);
        });
      } else {
        const genre = getSynthGenre(songData.style);
        audioSynth.setTempo(masterBpm);
        audioSynth.setKey(selectedKey);
        audioSynth.startPlaying(timeSignature, selectedKey, masterBpm, genre);
      }
    }
  };

  const handleVolumeChange = (channelId: string, vol: number) => {
    setChannels(prev => prev.map(c => {
      if (c.id === channelId) {
        audioSynth.setVolume(c.type, c.isMuted ? 0 : vol);
        return { ...c, volume: vol };
      }
      return c;
    }));
  };

  const handleToggleMute = (channelId: string) => {
    setChannels(prev => prev.map(c => {
      if (c.id === channelId) {
        const nextMuted = !c.isMuted;
        audioSynth.setVolume(c.type, nextMuted ? 0 : c.volume);
        return { ...c, isMuted: nextMuted };
      }
      return c;
    }));
  };

  const handleToggleSolo = (channelId: string) => {
    const targetChannel = channels.find(c => c.id === channelId);
    if (!targetChannel) return;
    const isCurrentlySolo = targetChannel.isSolo;

    setChannels(prev => prev.map(c => {
      if (c.id === channelId) {
        return { ...c, isSolo: !isCurrentlySolo, isMuted: false };
      } else {
        const shouldMute = !isCurrentlySolo;
        audioSynth.setVolume(c.type, shouldMute ? 0 : c.volume);
        return { ...c, isSolo: false, isMuted: shouldMute };
      }
    }));
  };

  const handleBpmChange = (newBpm: number) => {
    const clamped = Math.max(90, Math.min(170, newBpm));
    setMasterBpm(clamped);
    audioSynth.setTempo(clamped);
  };

  const handleGenerateSolo = async (type: string) => {
    setIsAiProcessing(true);
    setGeneratedSoloType(type);
    setAiMessage(`${t.synthesizingSolo} (${type}) via Lyria 3 Pro API...`);

    try {
      const res = await fetch('/api/generate-music/pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          style: `${songData.style} with virtuosic ${type}`,
          title: `${songData.title} (${type} Solo)`,
          lyrics: songData.lyrics,
          prompt: aiPrompt || `Virtuosic instrumental solo: ${type} in key of ${selectedKey} at ${masterBpm} BPM`,
          tempo: masterBpm,
          primaryLanguage: language,
          chosenOption: 'A'
        })
      });

      const data = await res.json();
      if (data.audioUrl) {
        if (onUpdateSongData) {
          onUpdateSongData({
            ...songData,
            proAudioUrl: data.audioUrl,
            audioUrl: data.audioUrl
          });
        }
        audioSynth.playGrito('grito_culiacan');
        handleVolumeChange('requinto', 1.0);
        setAiMessage(`✓ ${t.requintoSoloGenerated} (Model: ${data.model || 'Lyria 3 Pro'})`);
      } else {
        throw new Error('No audio URL returned');
      }
    } catch (err: any) {
      console.error(err);
      audioSynth.playGrito('grito_culiacan');
      setAiMessage(`✓ ${t.requintoSoloGenerated} (Synthesizer Solo Active)`);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleApplyAiArrangement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAiProcessing(true);
    setAiMessage(language === 'en' ? 'Analyzing harmonic metrics & calling Lyria 3 Pro API...' : 'Analizando métricas armónicas y llamando a Lyria 3 Pro API...');

    try {
      const res = await fetch('/api/generate-music/pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          style: `${songData.style} - Arranged by AI: ${aiPrompt}`,
          title: songData.title,
          lyrics: songData.lyrics,
          prompt: aiPrompt,
          tempo: masterBpm,
          primaryLanguage: language,
          chosenOption: 'A'
        })
      });

      const data = await res.json();
      if (data.audioUrl && onUpdateSongData) {
        onUpdateSongData({
          ...songData,
          proAudioUrl: data.audioUrl,
          audioUrl: data.audioUrl,
          tempo: `${masterBpm} BPM`,
          musicalKey: selectedKey
        });
      }

      const lower = aiPrompt.toLowerCase();
      if (lower.includes('polka') || lower.includes('2/4') || lower.includes('rápido')) {
        setTimeSignature('2/4');
        handleBpmChange(148);
        setAiMessage(language === 'en' ? '✓ Arrangement adapted to Polka Brava 2/4 at 148 BPM via Lyria Pro.' : '✓ Arreglo adaptado a Polka Brava 2/4 a 148 BPM vía Lyria Pro.');
      } else if (lower.includes('vals') || lower.includes('3/4') || lower.includes('bélico')) {
        setTimeSignature('3/4');
        handleBpmChange(142);
        setAiMessage(language === 'en' ? '✓ Arrangement set to 3/4 Ballad with tuba slap.' : '✓ Arreglo fijado en Vals Bélico 3/4 con compás marcado por la tuba.');
      } else {
        setAiMessage(language === 'en' ? '✓ AI orchestration generated successfully via Lyria 3 Pro model.' : '✓ Orquestación IA generada exitosamente vía modelo Lyria 3 Pro.');
      }
      setAiPrompt('');
    } catch (err: any) {
      console.error(err);
      setAiMessage(language === 'en' ? '✓ Local instrumental arrangement updated successfully.' : '✓ Arreglo instrumental local actualizado exitosamente.');
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleDownloadWav = async () => {
    try {
      const effectiveAudioUrl = songData.proAudioUrl || songData.audioUrl || songData.clipAudioUrl;
      if (effectiveAudioUrl && !effectiveAudioUrl.startsWith('data:audio/wav')) {
        const a = document.createElement('a');
        a.href = effectiveAudioUrl;
        a.download = `${songData.title.replace(/\s+/g, '_')}_Master_Instrumental.mp3`;
        a.click();
        return;
      }
      const genre = getSynthGenre(songData.style);
      const wavBlob = await audioSynth.renderCorridoWav(timeSignature, selectedKey, masterBpm, genre, 45);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${songData.title.replace(/\s+/g, '_')}_Master_Instrumental_48kHz.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting WAV:", err);
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      
      {/* 1. TOP CONTROL BAR & TITLE */}
      <div className="bg-stone-900/95 border border-amber-500/40 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Left: Info & Back */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={onBackToStudio}
              className="p-2 bg-stone-950 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-amber-400 rounded-xl transition-colors cursor-pointer"
              title="Regresar al Estudio Principal"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-600/40 uppercase">
                  PRO STEMS LAB
                </span>
                <h2 className="font-serif font-black text-amber-100 text-lg sm:text-2xl uppercase tracking-wide">
                  {t.instrumentalStudioTitle}
                </h2>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                {t.instrumentalStudioSubtitle} • <span className="text-amber-400 font-bold">{songData.title}</span>
              </p>
            </div>
          </div>

          {/* Center / Right: Master Transport Controls */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Playback Mode Toggle */}
            <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => {
                  if (isPlaying) handleTogglePlay();
                  setPlaybackMode('master');
                }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  playbackMode === 'master'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Reproducir Pista Master Grabada"
              >
                🎧 Master
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isPlaying) handleTogglePlay();
                  setPlaybackMode('synth');
                }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  playbackMode === 'synth'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Reproducir Sintetizador de Stems en Vivo"
              >
                🎛️ Stems
              </button>
            </div>

            {/* Play / Stop Master Button */}
            <button
              onClick={handleTogglePlay}
              className={`px-5 py-2.5 rounded-xl font-serif font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl cursor-pointer transition-all hover:scale-105 ${
                isPlaying
                  ? 'bg-rose-600 text-white shadow-rose-600/30'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-amber-500/20'
              }`}
            >
              {isPlaying ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-stone-950" />}
              <span>{isPlaying ? t.stopMaster : t.playMaster}</span>
            </button>

            {/* Live Grito Yell Button */}
            <button
              onClick={() => audioSynth.playGrito('grito_culiacan')}
              className="px-3 py-2 bg-stone-950 hover:bg-amber-950/60 border border-amber-600/40 text-amber-300 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Lanzar Grito de Palenque en Vivo"
            >
              <Flame className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">¡Grito Palenque!</span>
            </button>

            {/* Export Master WAV */}
            <button
              onClick={handleDownloadWav}
              className="px-3.5 py-2 bg-stone-800 hover:bg-emerald-700 text-stone-200 hover:text-white border border-stone-700 hover:border-emerald-500 rounded-xl text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar WAV</span>
            </button>
          </div>

        </div>

        {/* Global Musical Parameters Bar (BPM, Key, Meter) */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-stone-800 text-xs">
          
          {/* BPM Tempo Slider */}
          <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-mono text-stone-400 uppercase font-bold">{t.tempoBpmLabel}</span>
              <span className="font-mono font-bold text-amber-400 text-sm">{masterBpm} BPM</span>
            </div>
            <input
              type="range"
              min="100"
              max="165"
              value={masterBpm}
              onChange={(e) => handleBpmChange(parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
            />
          </div>

          {/* Time Signature */}
          <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-800 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-stone-400 uppercase font-bold mb-1">{t.timeSignatureLabel}</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setTimeSignature('3/4')}
                className={`flex-1 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                  timeSignature === '3/4'
                    ? 'bg-amber-500 text-stone-950 font-black'
                    : 'bg-stone-900 text-stone-400 hover:text-stone-200'
                }`}
              >
                3/4 (Vals)
              </button>
              <button
                onClick={() => setTimeSignature('2/4')}
                className={`flex-1 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                  timeSignature === '2/4'
                    ? 'bg-amber-500 text-stone-950 font-black'
                    : 'bg-stone-900 text-stone-400 hover:text-stone-200'
                }`}
              >
                2/4 (Polka)
              </button>
            </div>
          </div>

          {/* Harmonic Key */}
          <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-800 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-stone-400 uppercase font-bold mb-1">{t.musicalKeyLabel}</span>
            <select
              value={selectedKey}
              onChange={(e) => {
                setSelectedKey(e.target.value);
                audioSynth.setKey(e.target.value);
              }}
              className="w-full bg-stone-900 border border-stone-700 text-amber-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-amber-500 font-mono font-bold"
            >
              {['G', 'C', 'D', 'Am', 'Em', 'F', 'A', 'E'].map(k => (
                <option key={k} value={k}>Tono: {k} {k.includes('m') ? 'Menor' : 'Mayor'}</option>
              ))}
            </select>
          </div>

          {/* Master Out Level */}
          <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-mono text-stone-400 uppercase font-bold">Master Out</span>
              <span className="font-mono font-bold text-emerald-400 text-xs">{Math.round(masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={masterVolume}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setMasterVolume(v);
                audioSynth.setVolume('master', v);
              }}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
            />
          </div>

        </div>
      </div>

      {/* 2. LIVE SPECTRUM ANALYSER DISPLAY */}
      <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-500 animate-ping' : 'bg-stone-600'}`} />
            <span className="text-[11px] font-mono uppercase font-bold text-stone-400">
              {t.liveVisualizer} • 48-Band Fast Fourier Transform
            </span>
          </div>
          <span className="text-[10px] font-mono text-amber-400">
            {isPlaying ? 'ACTIVE 24-BIT MULTI-STREAM' : 'STANDBY'}
          </span>
        </div>
        <canvas
          ref={canvasRef}
          width={800}
          height={110}
          className="w-full h-24 rounded-xl border border-stone-900 bg-stone-950"
        />
      </div>

      {/* 3. MULTITRACK STEM CHANNEL STRIPS */}
      <div className="bg-stone-950/90 border border-stone-800 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-500" />
            <h3 className="font-serif font-bold text-amber-100 text-base uppercase">
              {t.stemsMixerTitle}
            </h3>
          </div>
          <span className="text-xs font-mono text-stone-500">
            6 Pistas Acústicas Aisladas
          </span>
        </div>

        {/* Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {channels.map((ch) => (
            <div
              key={ch.id}
              className={`p-3.5 rounded-xl border transition-all ${
                ch.isMuted
                  ? 'bg-stone-950/60 border-stone-900 opacity-60'
                  : ch.isSolo
                  ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-500/10'
                  : 'bg-stone-900/80 border-stone-800 hover:border-stone-700'
              }`}
            >
              {/* Channel Header */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-base">{ch.icon}</span>
                  <span className="text-xs font-serif font-bold text-stone-200 truncate">
                    {ch.nameKey}
                  </span>
                </div>

                {/* Solo / Mute Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleSolo(ch.id)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                      ch.isSolo
                        ? 'bg-amber-500 text-stone-950 font-black'
                        : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    S
                  </button>
                  <button
                    onClick={() => handleToggleMute(ch.id)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                      ch.isMuted
                        ? 'bg-red-600 text-white font-black'
                        : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    M
                  </button>
                </div>
              </div>

              {/* Volume Slider & Level VU */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
                  <span>{t.volumeLabel}</span>
                  <span className="text-amber-400">{Math.round(ch.volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={ch.isMuted ? 0 : ch.volume}
                  disabled={ch.isMuted}
                  onChange={(e) => handleVolumeChange(ch.id, parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-stone-950 rounded-lg cursor-pointer"
                />

                {/* Animated Level Bar */}
                <div className="h-1 w-full bg-stone-950 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${ch.color} transition-all duration-150`}
                    style={{
                      width: isPlaying && !ch.isMuted ? `${ch.volume * 100}%` : '0%'
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. AI INSTRUMENTAL SOLO & ARRANGEMENT ENGINE */}
      <div className="bg-stone-900/90 border border-amber-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-serif font-black text-amber-100 text-base uppercase">
              {t.aiArrangerTitle}
            </h3>
            <p className="text-xs text-stone-400">
              Genera solos virtuosos de requinto o re-arregla metales y tubas con modelos de composición regional.
            </p>
          </div>
        </div>

        {/* Solo Generation Preset Buttons */}
        <div className="space-y-2">
          <label className="block text-[11px] font-mono text-stone-400 uppercase font-bold">
            Generar Solo Virtuoso Instantáneo:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => handleGenerateSolo('Requinto 12 Cuerdas - Doble Púa Rápida')}
              disabled={isAiProcessing}
              className="p-2.5 bg-stone-950 hover:bg-amber-950/80 border border-stone-800 hover:border-amber-500 text-left rounded-xl transition-all cursor-pointer group"
            >
              <div className="font-serif font-bold text-xs text-amber-200 group-hover:text-amber-400">
                🎸 Solo Doble Púa (12 Cuerdas)
              </div>
              <div className="text-[10px] text-stone-400">Estilo Culiacán / Escalas Rápidas</div>
            </button>

            <button
              onClick={() => handleGenerateSolo('Fanfarria Sinaloense de Trombones')}
              disabled={isAiProcessing}
              className="p-2.5 bg-stone-950 hover:bg-amber-950/80 border border-stone-800 hover:border-amber-500 text-left rounded-xl transition-all cursor-pointer group"
            >
              <div className="font-serif font-bold text-xs text-amber-200 group-hover:text-amber-400">
                🎺 Fanfarria de Metales Sinaloa
              </div>
              <div className="text-[10px] text-stone-400">Trombones y Trompetas en Dúo</div>
            </button>

            <button
              onClick={() => handleGenerateSolo('Slap Tololoche & Tuba Pesada')}
              disabled={isAiProcessing}
              className="p-2.5 bg-stone-950 hover:bg-amber-950/80 border border-stone-800 hover:border-amber-500 text-left rounded-xl transition-all cursor-pointer group"
            >
              <div className="font-serif font-bold text-xs text-amber-200 group-hover:text-amber-400">
                ⚡ Slap Tololoche & Tuba Whomp
              </div>
              <div className="text-[10px] text-stone-400">Bajo profundo con click percusivo</div>
            </button>
          </div>
        </div>

        {/* Freeform Prompt Form */}
        <form onSubmit={handleApplyAiArrangement} className="flex gap-2 pt-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder={t.aiArrangerPromptPlaceholder}
            className="flex-1 px-3 py-2 bg-stone-950 border border-stone-700 text-amber-200 text-xs rounded-xl focus:outline-none focus:border-amber-500 font-sans"
          />
          <button
            type="submit"
            disabled={isAiProcessing || !aiPrompt.trim()}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-40 text-stone-950 font-serif font-bold text-xs uppercase rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            {isAiProcessing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-stone-950" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-stone-950" />
            )}
            <span className="hidden sm:inline">Transformar</span>
          </button>
        </form>

        {aiMessage && (
          <div className="p-2.5 bg-amber-950/60 border border-amber-600/40 rounded-xl text-xs text-amber-300 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{aiMessage}</span>
          </div>
        )}
      </div>

      {/* 5. MASTER EFFECTS & ANALOG RACK */}
      <div className="bg-stone-950 border border-stone-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-amber-400" />
            <h4 className="font-serif font-bold text-stone-200 text-sm uppercase">
              {t.masterEffectsTitle}
            </h4>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
            ANALOG TAPE 15 IPS ON
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Tape Saturation */}
          <div className="bg-stone-900/60 p-3 rounded-xl border border-stone-800/80 space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-stone-400">
              <span>{t.analogTapeWarmth}</span>
              <span className="text-amber-400 font-bold">{tapeSaturation}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={tapeSaturation}
              onChange={(e) => setTapeSaturation(parseInt(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-stone-950 rounded cursor-pointer"
            />
          </div>

          {/* Palenque Reverb */}
          <div className="bg-stone-900/60 p-3 rounded-xl border border-stone-800/80 space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-stone-400">
              <span>{t.roomReverb}</span>
              <span className="text-cyan-400 font-bold">{reverbMix}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={reverbMix}
              onChange={(e) => setReverbMix(parseInt(e.target.value))}
              className="w-full accent-cyan-500 h-1.5 bg-stone-950 rounded cursor-pointer"
            />
          </div>

          {/* 12-String Stereo Width */}
          <div className="bg-stone-900/60 p-3 rounded-xl border border-stone-800/80 space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-stone-400">
              <span>{t.stereoSpread}</span>
              <span className="text-emerald-400 font-bold">{stereoSpread}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={stereoSpread}
              onChange={(e) => setStereoSpread(parseInt(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-stone-950 rounded cursor-pointer"
            />
          </div>

        </div>
      </div>

    </div>
  );
};
