import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Mic, Square, RotateCcw, 
  Download, Sliders, RefreshCw, CheckCircle2, AlertCircle, 
  Clock, Sparkles, Disc, Radio, Music, ArrowRight, Layers
} from 'lucide-react';
import { CorridoData } from '../types';
import { customAudioStorage } from '../utils/customAudioStorage';
import { AppLanguage, translations } from '../utils/i18n';

interface CustomInstrumentalDeckProps {
  data: CorridoData;
  language: AppLanguage;
  vocalAudioUrl?: string | null;
  onUpdateVocalAudioUrl?: (url: string) => void;
  onOpenImportModal: () => void;
}

export const CustomInstrumentalDeck: React.FC<CustomInstrumentalDeckProps> = ({
  data,
  language,
  vocalAudioUrl,
  onUpdateVocalAudioUrl,
  onOpenImportModal
}) => {
  const t = translations[language];

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(data.customAudioDuration || 180);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [syncOffsetMs, setSyncOffsetMs] = useState(0); // -500ms to +500ms

  // Microphone Recording State
  const [isRecordingModeOpen, setIsRecordingModeOpen] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownNum, setCountdownNum] = useState(3);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedVocalUrl, setRecordedVocalUrl] = useState<string | null>(data.recordedVocalUrl || null);
  const [isPlayingRecordedVocals, setIsPlayingRecordedVocals] = useState(false);
  const [micInputLevel, setMicInputLevel] = useState(0);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);

  // Mixdown Export State
  const [isExportingMix, setIsExportingMix] = useState(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);

  // Audio References
  const instrumentalAudioRef = useRef<HTMLAudioElement | null>(null);
  const vocalAudioRef = useRef<HTMLAudioElement | null>(null);
  const recordedVocalAudioRef = useRef<HTMLAudioElement | null>(null);

  // Mic Stream & Recorder References
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const micAnimFrameRef = useRef<any>(null);

  // Peaks for waveform
  const peaks = data.customAudioPeaks || Array.from({ length: 100 }, (_, i) => Math.abs(Math.sin(i / 6)) * 0.7 + 0.25);

  // Initialize instrumental audio element
  useEffect(() => {
    if (!data.customAudioUrl) return;

    if (!instrumentalAudioRef.current) {
      instrumentalAudioRef.current = new Audio(data.customAudioUrl);
      instrumentalAudioRef.current.crossOrigin = 'anonymous';
    } else {
      instrumentalAudioRef.current.src = data.customAudioUrl;
    }

    const audio = instrumentalAudioRef.current;
    audio.volume = isMuted ? 0 : volume;

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      if (isLooping) {
        audio.currentTime = 0;
        audio.play().catch(console.warn);
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
        if (vocalAudioRef.current) {
          vocalAudioRef.current.pause();
          vocalAudioRef.current.currentTime = 0;
        }
      }
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, [data.customAudioUrl, isLooping]);

  // Update volume
  useEffect(() => {
    if (instrumentalAudioRef.current) {
      instrumentalAudioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Clean up mic and timers on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (micAnimFrameRef.current) cancelAnimationFrame(micAnimFrameRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Toggle synchronized play of instrumental + vocal track
  const handleTogglePlay = () => {
    if (!instrumentalAudioRef.current) return;

    if (isPlaying) {
      instrumentalAudioRef.current.pause();
      if (vocalAudioRef.current) vocalAudioRef.current.pause();
      if (recordedVocalAudioRef.current) recordedVocalAudioRef.current.pause();
      setIsPlaying(false);
    } else {
      const activeVocal = recordedVocalUrl || vocalAudioUrl;

      // Start vocal track with sync offset
      if (activeVocal) {
        if (!vocalAudioRef.current) {
          vocalAudioRef.current = new Audio(activeVocal);
        } else {
          vocalAudioRef.current.src = activeVocal;
        }
        const offsetSec = syncOffsetMs / 1000;
        const targetVocalTime = Math.max(0, instrumentalAudioRef.current.currentTime + offsetSec);
        vocalAudioRef.current.currentTime = targetVocalTime;
        vocalAudioRef.current.volume = 0.95;
        vocalAudioRef.current.play().catch(console.warn);
      }

      instrumentalAudioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Playback error:', err);
          setIsPlaying(false);
        });
    }
  };

  const handleSeek = (percentage: number) => {
    if (!instrumentalAudioRef.current || !duration) return;
    const target = percentage * duration;
    instrumentalAudioRef.current.currentTime = target;
    setCurrentTime(target);

    if (vocalAudioRef.current) {
      vocalAudioRef.current.currentTime = Math.max(0, target + syncOffsetMs / 1000);
    }
  };

  // Start Mic Recording Workflow
  const handleStartMicSetup = async () => {
    setMicPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Setup audio analyzer for VU meter
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      micAnalyserRef.current = analyser;

      const monitorLevel = () => {
        if (!micAnalyserRef.current) return;
        const dataArr = new Uint8Array(micAnalyserRef.current.frequencyBinCount);
        micAnalyserRef.current.getByteFrequencyData(dataArr);
        let sum = 0;
        for (let i = 0; i < dataArr.length; i++) sum += dataArr[i];
        const avg = sum / dataArr.length;
        setMicInputLevel(Math.min(100, Math.round((avg / 255) * 130)));
        micAnimFrameRef.current = requestAnimationFrame(monitorLevel);
      };
      monitorLevel();

      setIsRecordingModeOpen(true);
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setMicPermissionError(
        language === 'en'
          ? 'Microphone permission denied. Please allow microphone access in your browser settings.'
          : 'Acceso al micrófono denegado. Permite el uso del micrófono en la barra de direcciones de tu navegador.'
      );
    }
  };

  const handleStartRecordingCountdown = () => {
    setIsCountingDown(true);
    setCountdownNum(3);

    const countInterval = setInterval(() => {
      setCountdownNum((prev) => {
        if (prev <= 1) {
          clearInterval(countInterval);
          setIsCountingDown(false);
          startActualRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startActualRecording = () => {
    if (!mediaStreamRef.current) return;

    audioChunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : MediaRecorder.isTypeSupported('audio/mp4')
      ? 'audio/mp4'
      : '';

    const recorder = new MediaRecorder(mediaStreamRef.current, mimeType ? { mimeType } : undefined);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        audioChunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
      const vocalUrl = URL.createObjectURL(blob);
      setRecordedVocalUrl(vocalUrl);
      if (onUpdateVocalAudioUrl) {
        onUpdateVocalAudioUrl(vocalUrl);
      }
    };

    recorder.start(100);
    setIsRecording(true);
    setRecordingSeconds(0);

    // Play instrumental backing track into headphones while user records
    if (instrumentalAudioRef.current) {
      instrumentalAudioRef.current.currentTime = 0;
      instrumentalAudioRef.current.play().catch(console.warn);
      setIsPlaying(true);
    }

    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    if (instrumentalAudioRef.current) {
      instrumentalAudioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Mixdown & Master WAV Export
  const handleExportMixdown = async () => {
    if (!data.customAudioUrl) return;

    setIsExportingMix(true);
    setExportProgress(language === 'en' ? 'Decoding Audio Buffers...' : 'Decodificando Pistas de Audio...');

    try {
      const activeVocal = recordedVocalUrl || vocalAudioUrl || null;
      setExportProgress(language === 'en' ? 'Rendering Master 44.1kHz Mixdown...' : 'Masterizando Mezcla Estéreo 44.1kHz...');

      const wavBlob = await customAudioStorage.mixAndExportWav(
        data.customAudioUrl,
        activeVocal,
        volume,
        0.95,
        syncOffsetMs / 1000,
        data.title
      );

      setExportProgress(language === 'en' ? 'Downloading Master WAV...' : 'Descargando Master WAV...');
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      const cleanTitle = (data.title || 'Cancion').replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `${cleanTitle}_Master_Mixdown.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => {
        setIsExportingMix(false);
        setExportProgress(null);
      }, 1500);
    } catch (err: any) {
      console.error('Error rendering mixdown:', err);
      setIsExportingMix(false);
      setExportProgress(null);
      alert(language === 'en' ? 'Failed to export mixdown: ' + err.message : 'Error al exportar mezcla: ' + err.message);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-br from-[#121622] via-[#0d1017] to-[#121622] border-2 border-amber-500/60 rounded-2xl p-6 shadow-2xl mb-8 space-y-6 animate-fadeIn">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#22293d] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-lg">
            <Music className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
                Pista Instrumental Personalizada
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] font-bold rounded-full uppercase border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> Conectada al Studio DAW
              </span>
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-black text-amber-100 uppercase tracking-wide">
              {data.title}
            </h3>
            <p className="text-xs text-stone-400 font-mono mt-0.5">
              Archivo: <span className="text-amber-300">{data.customAudioFileName || 'Pista de Audio'}</span> • {data.tempo} • {data.musicalKey}
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenImportModal}
            className="px-3 py-2 bg-[#191f2e] hover:bg-[#222b3e] border border-amber-500/40 text-amber-300 text-xs font-serif font-bold uppercase rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
            title="Cambiar o importar otra pista instrumental"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Change Beat' : 'Cambiar Pista'}</span>
          </button>

          <button
            onClick={handleExportMixdown}
            disabled={isExportingMix}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-serif font-black uppercase rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-md hover:scale-105 disabled:opacity-50"
            title="Descargar la mezcla final combinando tu instrumental con las voces"
          >
            {isExportingMix ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isExportingMix ? (exportProgress || 'Mezclando...') : '💾 Exportar Master WAV'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Waveform Display */}
      <div className="bg-[#0b0e14] border border-[#202738] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-stone-400">
          <div className="flex items-center gap-2">
            <Radio className={`w-3.5 h-3.5 ${isPlaying ? 'text-amber-400 animate-pulse' : 'text-stone-500'}`} />
            <span className="text-amber-300 font-bold">{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-stone-400">
              Sincronización Vocal: <strong className="text-amber-400">{syncOffsetMs > 0 ? `+${syncOffsetMs}` : syncOffsetMs} ms</strong>
            </span>
            <span className="text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> 44.1 kHz Hi-Fi
            </span>
          </div>
        </div>

        {/* Waveform Bars with Scrub Click */}
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const pct = Math.max(0, Math.min(1, clickX / rect.width));
            handleSeek(pct);
          }}
          className="h-20 bg-[#121622] rounded-xl p-2.5 flex items-center gap-1 cursor-pointer relative overflow-hidden group select-none"
        >
          {/* Progress Overlay */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-amber-500/10 pointer-events-none transition-all duration-75"
            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
          />

          {/* Scrub Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10 pointer-events-none shadow-[0_0_8px_#f59e0b]"
            style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
          />

          {peaks.map((peak, idx) => {
            const barPos = idx / peaks.length;
            const currentPos = currentTime / (duration || 1);
            const isPassed = barPos <= currentPos;

            return (
              <div
                key={idx}
                className={`flex-1 rounded-full transition-all duration-75 ${
                  isPassed
                    ? isPlaying
                      ? 'bg-amber-400'
                      : 'bg-amber-500'
                    : 'bg-[#2b3348] group-hover:bg-[#38425d]'
                }`}
                style={{
                  height: `${Math.max(12, peak * 100)}%`
                }}
              />
            );
          })}
        </div>

        {/* Deck Primary Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          {/* Play, Rewind, Loop */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSeek(0)}
              className="p-2.5 rounded-xl bg-[#191f2e] text-stone-300 hover:text-amber-400 hover:bg-[#232b3e] transition-colors cursor-pointer"
              title="Regresar al inicio"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleTogglePlay}
              className={`px-5 py-2.5 rounded-xl font-serif font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg transition-all ${
                isPlaying
                  ? 'bg-amber-500 text-stone-950 scale-105 shadow-amber-500/30'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              <span>{isPlaying ? 'Pausar Pista' : 'Reproducir Pista'}</span>
            </button>

            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`px-3 py-2 text-xs font-mono font-bold uppercase rounded-xl border transition-colors cursor-pointer ${
                isLooping
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-[#191f2e] text-stone-400 border-stone-800 hover:text-stone-200'
              }`}
            >
              🔁 Loop {isLooping ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 w-44">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-stone-400 hover:text-amber-400 cursor-pointer"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-full accent-amber-500 bg-stone-800 h-1.5 rounded cursor-pointer"
            />
            <span className="text-[10px] font-mono text-stone-400 w-8 text-right">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>

          {/* Beat Vocal Alignment Offset */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-stone-400 uppercase">Alineación Vocal:</span>
            <input
              type="range"
              min="-400"
              max="400"
              step="20"
              value={syncOffsetMs}
              onChange={(e) => setSyncOffsetMs(parseInt(e.target.value, 10))}
              className="w-24 accent-amber-500 bg-stone-800 h-1.5 rounded cursor-pointer"
            />
            <button
              onClick={() => setSyncOffsetMs(0)}
              className="text-[9px] font-mono text-stone-500 hover:text-amber-400 uppercase cursor-pointer"
              title="Restablecer desfase"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Live Microphone Recording Section */}
      <div className="bg-[#10141f] border border-[#252c40] rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-red-500 animate-pulse" />
              <h4 className="font-serif font-black text-amber-200 text-sm uppercase tracking-wide">
                {language === 'en' ? 'Live Vocal Studio (Record with Your Microphone)' : 'Estudio de Grabación Vocal en Vivo (Graba con Micrófono)'}
              </h4>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              {language === 'en'
                ? 'Sing or rap directly over your instrumental beat using your microphone. Hear the beat in your headphones as you perform!'
                : 'Canta o rapea directo sobre tu pista instrumental con tu micrófono. ¡Escucha el beat con audífonos mientras grabas!'}
            </p>
          </div>

          {!isRecordingModeOpen ? (
            <button
              onClick={handleStartMicSetup}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-serif font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition-all shrink-0"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Open Mic Recording Studio' : 'Activar Micrófono'}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (isRecording) handleStopRecording();
                setIsRecordingModeOpen(false);
              }}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-serif font-bold rounded-lg cursor-pointer transition-colors"
            >
              Cerrar Grabador
            </button>
          )}
        </div>

        {micPermissionError && (
          <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{micPermissionError}</span>
          </div>
        )}

        {/* Active Mic Studio Panel */}
        {isRecordingModeOpen && (
          <div className="p-4 bg-[#0a0d14] border border-red-900/50 rounded-xl space-y-4 animate-fadeIn">
            {/* VU Meter & Record Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* VU Meter */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
                  <span>NIVEL DE ENTRADA (VU METER)</span>
                  <span className={micInputLevel > 70 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                    {micInputLevel}%
                  </span>
                </div>
                <div className="h-3 bg-stone-900 rounded-full overflow-hidden p-0.5 border border-stone-800">
                  <div
                    className={`h-full rounded-full transition-all duration-75 ${
                      micInputLevel > 75
                        ? 'bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500'
                        : micInputLevel > 35
                        ? 'bg-gradient-to-r from-emerald-500 to-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${micInputLevel}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {isCountingDown ? (
                  <div className="px-6 py-2.5 bg-amber-500 text-stone-950 font-black text-sm rounded-xl font-mono animate-bounce">
                    ¡Preparado! {countdownNum}...
                  </div>
                ) : isRecording ? (
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/80 border border-red-500 text-red-300 text-xs font-mono font-bold rounded-lg animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Grabando {formatTime(recordingSeconds)}
                    </span>
                    <button
                      onClick={handleStopRecording}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-serif font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-lg cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Detener</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleStartRecordingCountdown}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-serif font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg hover:scale-105 transition-all cursor-pointer"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Empezar Grabación</span>
                  </button>
                )}
              </div>
            </div>

            {/* Recorded Vocal Playback Strip */}
            {recordedVocalUrl && (
              <div className="pt-3 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-serif font-bold text-xs text-amber-200">
                      Toma Vocal Grabada con Éxito
                    </span>
                    <p className="text-[10px] text-stone-400 font-mono">
                      Lista para mezclarse con tu instrumental en el master final.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (!recordedVocalAudioRef.current) {
                        recordedVocalAudioRef.current = new Audio(recordedVocalUrl);
                        recordedVocalAudioRef.current.onended = () => setIsPlayingRecordedVocals(false);
                      }
                      if (isPlayingRecordedVocals) {
                        recordedVocalAudioRef.current.pause();
                        setIsPlayingRecordedVocals(false);
                      } else {
                        recordedVocalAudioRef.current.play().then(() => setIsPlayingRecordedVocals(true));
                      }
                    }}
                    className="px-3 py-1.5 bg-[#191f2e] hover:bg-[#232b3e] text-amber-300 text-xs font-serif font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    {isPlayingRecordedVocals ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                    <span>{isPlayingRecordedVocals ? 'Pausar Voz' : 'Escuchar Voz Grabada'}</span>
                  </button>

                  <a
                    href={recordedVocalUrl}
                    download={`${data.title || 'Voz'}_Grabada.webm`}
                    className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-serif font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Voz</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
