import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, Download, RefreshCw, HelpCircle, X, Music, CheckCircle2, Zap, Radio, Hash, Check } from 'lucide-react';
import { useLyriaClipTrack } from '../hooks/useLyriaMusic';

export interface PreviewClipPlayerProps {
  title: string;
  lyrics: any[];
  style: string;
  tempo: number;
  storySummary?: string;
  songHash?: string;
  chosenOption?: 'A' | 'B';
  initialAudioUrl?: string | null;
  onAudioChange?: (url: string | null) => void;
  onTake2AudioChange?: (url: string | null) => void;
  onLoadingChange?: (loading: boolean) => void;
  onOptionChange?: (option: 'A' | 'B') => void;
  onExtendToFull?: (chosenOption: 'A' | 'B') => void;
  isParentGeneratingPro?: boolean;
}

export const PreviewClipPlayer: React.FC<PreviewClipPlayerProps> = ({
  title,
  lyrics,
  style,
  tempo,
  storySummary,
  songHash: initialHash,
  chosenOption: externalChosenOption,
  initialAudioUrl,
  onAudioChange,
  onTake2AudioChange,
  onLoadingChange,
  onOptionChange,
  onExtendToFull,
  isParentGeneratingPro = false,
}) => {
  const {
    isGeneratingClip,
    isGeneratingTake2,
    clipProgress,
    clipAudioUrl,
    take2AudioUrl,
    take1Flavor,
    take2Flavor,
    songHash: hookSongHash,
    setClipAudioUrl,
    setTake2AudioUrl,
    generateDualClips,
    generateClipTrack,
    generateTake2Track,
    clearClipError,
    clipError
  } = useLyriaClipTrack(initialAudioUrl);

  // The active chosen option for the song: Option A (Modern) vs Option B (Campirano)
  const [selectedOption, setSelectedOption] = useState<'A' | 'B'>(externalChosenOption || 'A');
  const [copiedHash, setCopiedHash] = useState(false);

  const lastNotifiedActiveUrlRef = useRef<string | null>(null);
  const lastNotifiedOptionRef = useRef<'A' | 'B'>(externalChosenOption || 'A');
  const lastNotifiedTake2Ref = useRef<string | null>(null);
  const lastNotifiedLoadingRef = useRef<boolean>(false);

  // Determine current active song hash
  const currentSongHash = hookSongHash || initialHash || `#CRD-${Math.abs(title.split('').reduce((acc, c) => ((acc << 5) - acc) + c.charCodeAt(0), 0)).toString(16).toUpperCase().slice(0, 6)}`;

  // Sync external audio changes if provided
  useEffect(() => {
    if (initialAudioUrl !== undefined && initialAudioUrl !== clipAudioUrl) {
      setClipAudioUrl(initialAudioUrl || null);
    }
  }, [initialAudioUrl]);

  // When selected option changes, notify parent of active audio
  useEffect(() => {
    const activeUrl = selectedOption === 'A' ? (clipAudioUrl || take2AudioUrl) : (take2AudioUrl || clipAudioUrl);
    if (onAudioChange && lastNotifiedActiveUrlRef.current !== activeUrl) {
      lastNotifiedActiveUrlRef.current = activeUrl;
      onAudioChange(activeUrl);
    }
    if (onOptionChange && lastNotifiedOptionRef.current !== selectedOption) {
      lastNotifiedOptionRef.current = selectedOption;
      onOptionChange(selectedOption);
    }
    if (onTake2AudioChange && lastNotifiedTake2Ref.current !== take2AudioUrl) {
      lastNotifiedTake2Ref.current = take2AudioUrl;
      onTake2AudioChange(take2AudioUrl);
    }
  }, [selectedOption, clipAudioUrl, take2AudioUrl, onAudioChange, onOptionChange, onTake2AudioChange]);

  // Notify parent on loading state change
  const isGeneratingAny = isGeneratingClip || isGeneratingTake2;
  useEffect(() => {
    if (onLoadingChange && lastNotifiedLoadingRef.current !== isGeneratingAny) {
      lastNotifiedLoadingRef.current = isGeneratingAny;
      onLoadingChange(isGeneratingAny);
    }
  }, [isGeneratingAny, onLoadingChange]);

  const serializeLyrics = () => (lyrics || []).map((item) => ({
    type: item.type || 'ESTROFA',
    text: item.text || ''
  }));

  // Single-Click Trigger: Generates BOTH options simultaneously (User Directive: "It's one button")
  const handleTriggerDualClips = async () => {
    console.log('[PreviewClipPlayer] Single-click dual clip generation initiated (base tempo:', tempo, 'BPM)');
    await generateDualClips({
      title,
      lyrics: serializeLyrics(),
      style,
      tempo,
      songHash: currentSongHash,
      instrumentation: 'Batería acústica completa con tarola y bombo, bajo eléctrico, guitarras de doce cuerdas (docerolas) y tuba sousafón',
      prompt: `Muestra de 45 segundos con requintos y tololoche: ${title}. ${storySummary || ''}`
    });
  };

  const handleCopyHash = () => {
    if (currentSongHash) {
      navigator.clipboard.writeText(currentSongHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  // Primary hook line from lyrics for preview display
  const mainChorusText = lyrics?.find(l => (l.type || '').toLowerCase().includes('coro'))?.text || lyrics?.[0]?.text || 'No hay letra disponible';

  const fastTempo = Math.min(160, Math.max(115, (tempo || 128) + 3));
  const slowTempo = Math.max(110, Math.min(155, (tempo || 128) - 4));

  return (
    <div
      id="preview-clip-player-card"
      className={`p-5 bg-stone-950/95 border transition-all duration-300 flex flex-col justify-between ${
        (clipAudioUrl || take2AudioUrl) ? 'border-amber-400 shadow-xl shadow-amber-950/60' : 'border-stone-800'
      }`}
    >
      <div>
        {/* Header Badges & Song Hash */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="px-2.5 py-1 bg-amber-600/20 border border-amber-400/60 text-amber-200 text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Radio className={`w-3.5 h-3.5 ${isGeneratingAny ? 'animate-spin text-amber-400' : 'text-amber-500'}`} />
            MUESTRAS DE AUDIO • 45 SEGUNDOS (2 OPCIONES)
          </span>

          {/* Song Hash Badge (User Directive: "Every song that gets made gets a hash so people know what song was theirs") */}
          <button
            type="button"
            onClick={handleCopyHash}
            title="Copiar Hash Único de la Canción"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-amber-300 text-[11px] font-mono cursor-pointer transition-colors"
          >
            <Hash className="w-3 h-3 text-amber-400" />
            <span>{currentSongHash}</span>
            {copiedHash ? (
              <span className="text-[10px] text-emerald-400 font-bold ml-1 flex items-center gap-0.5">
                <Check className="w-3 h-3" /> Copiado
              </span>
            ) : null}
          </button>
        </div>

        <h4 className="font-serif font-black text-amber-100 text-base uppercase tracking-tight mb-1">
          Muestras Musicales de Prueba (45s)
        </h4>
        <p className="text-stone-400 text-xs leading-relaxed mb-4">
          Con un solo clic se generan <strong>dos arreglos diferentes</strong> para tu corrido cantado. Escucha ambas opciones y elige tu favorita para extenderla a la canción completa.
        </p>

        {/* Both Options Displayed for Comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* OPTION A CARD */}
          <div
            onClick={() => setSelectedOption('A')}
            className={`p-3.5 border transition-all cursor-pointer flex flex-col justify-between ${
              selectedOption === 'A'
                ? 'bg-amber-950/40 border-amber-400 ring-1 ring-amber-400 shadow-md'
                : 'bg-stone-900/80 border-stone-800 hover:border-amber-700/60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="font-serif font-black text-xs uppercase tracking-wider text-amber-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Opción A: Enérgico
                </span>
                {selectedOption === 'A' ? (
                  <span className="text-[10px] font-mono font-bold bg-amber-500 text-stone-950 px-1.5 py-0.2 rounded-xs flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> ELEGIDA
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-stone-400">Clic para elegir</span>
                )}
              </div>
              <p className="text-[11px] text-stone-300 font-mono mb-2">
                {fastTempo} BPM • Metales en vivo, trombones y docerola rápida
              </p>
            </div>

            {clipAudioUrl ? (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> 45s Listo
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const audioEl = e.currentTarget.parentElement?.nextElementSibling as HTMLAudioElement;
                      if (audioEl) {
                        audioEl.playbackRate = audioEl.playbackRate === 0.78 ? 1.0 : 0.78;
                      }
                    }}
                    className="px-1.5 py-0.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-600/70 text-amber-300 text-[9px] font-mono font-bold uppercase tracking-wider cursor-pointer"
                    title="Chopped & Screwed (H-Town DJ Screw Style)"
                  >
                    🎛️ Screw
                  </button>
                </div>
                <audio src={clipAudioUrl} controls className="w-full h-8" />
                <div className="flex items-center justify-between text-[10px] text-stone-400 pt-0.5">
                  <span className="text-stone-300">Opción A (Rápida / Bélica)</span>
                  <a
                    href={clipAudioUrl}
                    download={`${title.replace(/\s+/g, '_')}_Opcion_A_45s.mp3`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-amber-400 hover:underline flex items-center gap-0.5"
                  >
                    <Download className="w-3 h-3" /> MP3
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 bg-stone-950/60 border border-stone-800/80 text-[11px] text-stone-400">
                <span>Sin generar aún</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    generateClipTrack({
                      title,
                      lyrics: serializeLyrics(),
                      style,
                      tempo,
                      songHash: currentSongHash,
                      instrumentation: 'Batería acústica completa con tarola y bombo, bajo eléctrico, guitarras de doce cuerdas (docerolas) y tuba sousafón',
                      prompt: `Muestra 45s Opción A con voz y banda completa: ${title}`
                    });
                  }}
                  disabled={isGeneratingAny}
                  className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-stone-950 font-mono font-bold text-[10px] uppercase cursor-pointer"
                >
                  ⚡ Generar A
                </button>
              </div>
            )}
          </div>

          {/* OPTION B CARD */}
          <div
            onClick={() => setSelectedOption('B')}
            className={`p-3.5 border transition-all cursor-pointer flex flex-col justify-between ${
              selectedOption === 'B'
                ? 'bg-amber-950/40 border-amber-400 ring-1 ring-amber-400 shadow-md'
                : 'bg-stone-900/80 border-stone-800 hover:border-amber-700/60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="font-serif font-black text-xs uppercase tracking-wider text-amber-300 flex items-center gap-1">
                  <Music className="w-3.5 h-3.5 text-amber-400" /> Opción B: Campirano
                </span>
                {selectedOption === 'B' ? (
                  <span className="text-[10px] font-mono font-bold bg-amber-500 text-stone-950 px-1.5 py-0.2 rounded-xs flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> ELEGIDA
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-stone-400">Clic para elegir</span>
                )}
              </div>
              <p className="text-[11px] text-stone-300 font-mono mb-2">
                {slowTempo} BPM • Tololoche acústico pesado y terceras campiranas
              </p>
            </div>

            {take2AudioUrl ? (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> 45s Listo
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const audioEl = e.currentTarget.parentElement?.nextElementSibling as HTMLAudioElement;
                      if (audioEl) {
                        audioEl.playbackRate = audioEl.playbackRate === 0.78 ? 1.0 : 0.78;
                      }
                    }}
                    className="px-1.5 py-0.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-600/70 text-amber-300 text-[9px] font-mono font-bold uppercase tracking-wider cursor-pointer"
                    title="Chopped & Screwed (H-Town DJ Screw Style)"
                  >
                    🎛️ Screw
                  </button>
                </div>
                <audio src={take2AudioUrl} controls className="w-full h-8" />
                <div className="flex items-center justify-between text-[10px] text-stone-400 pt-0.5">
                  <span className="text-stone-300">Opción B (Campirano / Tololoche)</span>
                  <a
                    href={take2AudioUrl}
                    download={`${title.replace(/\s+/g, '_')}_Opcion_B_45s.mp3`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-amber-400 hover:underline flex items-center gap-0.5"
                  >
                    <Download className="w-3 h-3" /> MP3
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 bg-stone-950/60 border border-stone-800/80 text-[11px] text-stone-400">
                <span>Sin generar aún</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    generateTake2Track({
                      title,
                      lyrics: serializeLyrics(),
                      style,
                      tempo,
                      songHash: currentSongHash,
                      instrumentation: 'Batería acústica en vivo, bajo eléctrico, tololoche acústico slap, docerolas y tuba',
                      prompt: `Muestra 45s Opción B con voz y tololoche: ${title}`
                    });
                  }}
                  disabled={isGeneratingAny}
                  className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-stone-950 font-mono font-bold text-[10px] uppercase cursor-pointer"
                >
                  ⚡ Generar B
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Selected Option Detail Box & Lyrics */}
        <div className="p-3 bg-stone-900 border border-stone-800 mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-mono text-amber-400 font-bold">
              Letra Cantada en las Muestras ({selectedOption === 'A' ? 'Opción A Seleccionada' : 'Opción B Seleccionada'}):
            </span>
            <span className="text-[10px] font-mono text-stone-400">
              {selectedOption === 'A' ? `${fastTempo} BPM` : `${slowTempo} BPM`}
            </span>
          </div>
          <p className="font-serif italic text-amber-200 text-xs leading-relaxed">
            "{mainChorusText}"
          </p>

          {/* Extend to Master Button (User Directive: "whichever one that chose, that's the one that can choose to keep it going") */}
          {(clipAudioUrl || take2AudioUrl) && onExtendToFull && (
            <button
              type="button"
              onClick={() => onExtendToFull(selectedOption)}
              disabled={isParentGeneratingPro}
              className="w-full mt-3 py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-serif font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow transition-all hover:scale-[1.01]"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>
                {isParentGeneratingPro
                  ? 'Generando Master...'
                  : `⭐ Extender Opción ${selectedOption} a Canción Completa (2-3 Min)`}
              </span>
            </button>
          )}
        </div>

        {/* Loading Indicator */}
        {isGeneratingAny && (
          <div
            id="preview-clip-loading-indicator"
            className="p-3 bg-amber-950/80 border border-amber-500/70 text-amber-200 text-xs my-3 flex items-center gap-2.5 animate-pulse"
          >
            <RefreshCw className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
            <div className="flex-1">
              <span className="font-mono text-[11px] font-bold block text-amber-300">
                {clipProgress?.status || 'Generando ambas opciones de 45 segundos con Lyria 3 Clip...'}
              </span>
              {clipProgress?.formattedSize && (
                <span className="font-mono text-[10px] text-stone-400 block">
                  Descargado: {clipProgress.formattedSize}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Error Indicator */}
        {clipError && (
          <div className="p-2.5 bg-red-950/90 border border-red-700 text-red-200 text-xs my-3 flex items-center justify-between">
            <span className="leading-tight">{clipError}</span>
            <button
              onClick={clearClipError}
              className="p-1 hover:text-white cursor-pointer transition-colors"
              title="Cerrar advertencia"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Trigger Action: ONE Button for the 45s clips */}
      <div className="mt-2 pt-3 border-t border-stone-800">
        <button
          id="preview-clip-trigger-btn"
          onClick={handleTriggerDualClips}
          disabled={isGeneratingAny}
          className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-serif font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg hover:scale-[1.01] disabled:opacity-50"
        >
          {isGeneratingAny ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
              <span>GENERANDO AMBAS MUESTRAS (45s)...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-current" />
              <span>
                {take2AudioUrl || clipAudioUrl
                  ? '🔄 RE-GENERAR MUESTRAS (OPCIÓN A Y B)'
                  : '⚡ GENERAR MUESTRAS (OPCIÓN A Y B • 45s)'}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
