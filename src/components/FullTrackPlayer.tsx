import React, { useEffect, useRef } from 'react';
import { Disc, Download, RefreshCw, HelpCircle, Sparkles, X, Hash, Video, Award, ShieldCheck, Rocket, Gift } from 'lucide-react';
import { useLyriaProTrack } from '../hooks/useLyriaMusic';

export interface FullTrackPlayerProps {
  title: string;
  lyrics: any[];
  style: string;
  tempo: number;
  storySummary?: string;
  songHash?: string;
  chosenOption?: 'A' | 'B';
  initialAudioUrl?: string | null;
  onAudioChange?: (url: string | null) => void;
  onLoadingChange?: (loading: boolean) => void;
  triggerRef?: React.MutableRefObject<(() => Promise<string | null>) | null>;
  onOpenVideoExporter?: () => void;
  onOpenGiftModal?: () => void;
  onOpenBilling?: () => void;
  onOpenLicense?: () => void;
  onOpenDeploy?: () => void;
  isUnlocked?: boolean;
}

export const FullTrackPlayer: React.FC<FullTrackPlayerProps> = ({
  title,
  lyrics,
  style,
  tempo,
  storySummary,
  songHash,
  chosenOption = 'A',
  initialAudioUrl,
  onAudioChange,
  onLoadingChange,
  triggerRef,
  onOpenVideoExporter,
  onOpenGiftModal,
  onOpenBilling,
  onOpenLicense,
  onOpenDeploy,
  isUnlocked = true,
}) => {
  const {
    isGeneratingPro,
    proProgress,
    proAudioUrl,
    proError,
    generateProTrack,
    setProAudioUrl,
    clearProError
  } = useLyriaProTrack(initialAudioUrl);

  const lastNotifiedAudioRef = useRef<string | null>(proAudioUrl || null);
  const lastNotifiedLoadingRef = useRef<boolean>(isGeneratingPro);

  // Sync external initial audio changes
  useEffect(() => {
    if (initialAudioUrl !== undefined && initialAudioUrl !== proAudioUrl) {
      setProAudioUrl(initialAudioUrl || null);
    }
  }, [initialAudioUrl]);

  // Notify parent on audio ready
  useEffect(() => {
    if (onAudioChange && lastNotifiedAudioRef.current !== proAudioUrl) {
      lastNotifiedAudioRef.current = proAudioUrl;
      onAudioChange(proAudioUrl);
    }
  }, [proAudioUrl, onAudioChange]);

  // Notify parent on loading state change
  useEffect(() => {
    if (onLoadingChange && lastNotifiedLoadingRef.current !== isGeneratingPro) {
      lastNotifiedLoadingRef.current = isGeneratingPro;
      onLoadingChange(isGeneratingPro);
    }
  }, [isGeneratingPro, onLoadingChange]);

  // Dedicated independent API trigger for full 2-3 minute master track
  const handleTriggerPro = async (): Promise<string | null> => {
    console.log('[FullTrackPlayer] Independent API trigger fired for 2-3 min master track (tempo:', tempo, 'BPM)');
    const serializedLyrics = (lyrics || []).map((item) => ({
      type: item.type || 'ESTROFA',
      text: item.text || ''
    }));

    return await generateProTrack({
      title,
      lyrics: serializedLyrics,
      style,
      tempo,
      songHash,
      instrumentation: 'Batería acústica en vivo con tarolas, bajo eléctrico, sousafón tuba de latón, y requintos de 12 cuerdas docerolas',
      chosenOption: chosenOption === 'B' ? 'B' : 'A',
      prompt: `Canción de Corrido Master Oficial: ${title}. Arreglo Opción ${chosenOption || 'A'}. ${storySummary || ''}`
    });
  };

  // Expose trigger to parent/sibling (e.g. extension from 45s clip)
  useEffect(() => {
    if (triggerRef) {
      triggerRef.current = handleTriggerPro;
    }
    return () => {
      if (triggerRef) {
        triggerRef.current = null;
      }
    };
  }, [triggerRef, handleTriggerPro]);

  return (
    <div
      id="full-track-player-card"
      className={`p-5 bg-stone-950/95 border transition-all duration-300 flex flex-col justify-between ${
        proAudioUrl ? 'border-amber-500 shadow-xl shadow-amber-950/60' : 'border-stone-800'
      }`}
    >
      <div>
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/60 text-amber-300 text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Disc className={`w-3.5 h-3.5 ${isGeneratingPro ? 'animate-spin' : ''}`} />
            CANAL MASTER: Lyria 3 Pro (2-3 Minutos)
          </span>
          <div className="flex items-center gap-2">
            {songHash && (
              <span className="text-[10px] text-stone-300 font-mono bg-stone-900 border border-stone-800 px-2 py-0.5 flex items-center gap-1">
                <Hash className="w-3 h-3 text-amber-400" /> {songHash}
              </span>
            )}
            <span className="text-[10px] text-amber-300 font-mono bg-amber-950/70 border border-amber-800/60 px-2 py-0.5">
              Opción {chosenOption}
            </span>
          </div>
        </div>

        <h4 className="font-serif font-black text-amber-100 text-base uppercase tracking-tight mb-1">
          Canción Completa Master (2 - 3 Minutos)
        </h4>
        <p className="text-stone-400 text-xs leading-relaxed mb-4">
          Produce la obra completa masterizada con instrumentación norteña auténtica: requinto de acero en 12 cuerdas, trombones de vara pesados, charcheta en contratiempo, tololoche de madera y batería con tarolazos.
        </p>

        {/* Independent Audio Player */}
        {proAudioUrl ? (
          <div className="p-3 bg-stone-900 border border-amber-600/60 mb-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-amber-300 font-bold font-mono">
              <span>▶️ REPRODUCTOR MASTER (2-3 MIN)</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const audioEl = document.getElementById('full-track-audio-element') as HTMLAudioElement;
                    if (audioEl) {
                      audioEl.playbackRate = audioEl.playbackRate === 0.78 ? 1.0 : 0.78;
                    }
                  }}
                  className="px-2 py-0.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-600/70 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1"
                  title="Activar efecto Chopped & Screwed (Estilo DJ Screw / H-Town)"
                >
                  🎛️ Chopped & Screwed
                </button>
                <span className="text-emerald-400 font-sans text-[11px]">● Master Listo</span>
              </div>
            </div>
            <audio id="full-track-audio-element" src={proAudioUrl} controls className="w-full h-10" />
          </div>
        ) : (
          <div className="p-3.5 bg-stone-900/60 border border-stone-800 text-stone-400 text-xs mb-3 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Haz clic abajo para generar la pista completa (2-3 min) con Lyria 3 Pro.</span>
          </div>
        )}

        {/* Independent Loading State & Stream Progress Indicator */}
        {isGeneratingPro && (
          <div
            id="full-track-loading-indicator"
            className="p-3 bg-amber-950/80 border border-amber-600/70 text-amber-200 text-xs mb-3 flex items-center gap-2.5 animate-pulse"
          >
            <RefreshCw className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
            <div className="flex-1">
              <span className="font-mono text-[11px] font-bold block text-amber-300">
                {proProgress?.status || 'Iniciando generación de Master de 2-3 minutos con Lyria 3 Pro...'}
              </span>
              {proProgress?.formattedSize && (
                <span className="font-mono text-[10px] text-stone-400 block">
                  Descargado: {proProgress.formattedSize}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Independent Error Indicator */}
        {proError && (
          <div className="p-2.5 bg-red-950/90 border border-red-700 text-red-200 text-xs mb-3 flex items-center justify-between">
            <span className="leading-tight">{proError}</span>
            <button
              onClick={clearProError}
              className="p-1 hover:text-white cursor-pointer transition-colors"
              title="Cerrar advertencia"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Independent API Trigger & Download Controls */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-800">
        <button
          id="full-track-trigger-btn"
          onClick={handleTriggerPro}
          disabled={isGeneratingPro}
          className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-serif font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg hover:scale-[1.02] disabled:opacity-50"
        >
          {isGeneratingPro ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>RECIBIENDO MASTER LYRIA 3 PRO (2-3 MIN)...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-current" />
              <span>{proAudioUrl ? '🔄 RE-GENERAR MASTER (2-3 MIN)' : '🎤 GENERAR MASTER COMPLETO (2-3 MIN)'}</span>
            </>
          )}
        </button>

        {proAudioUrl && onOpenGiftModal && (
          <button
            type="button"
            onClick={onOpenGiftModal}
            className="py-3 px-3.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-serif font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-all"
            title="Crear Tarjeta Digital de Dedicatoria y Regalo Musical"
          >
            <Gift className="w-4 h-4 text-stone-950" />
            <span>🎁 DEDICAR REGALO</span>
          </button>
        )}

        {proAudioUrl && onOpenDeploy && (
          <button
            type="button"
            onClick={onOpenDeploy}
            className="py-3 px-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-stone-950 font-serif font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-all"
            title="Publicar en Spotify, YouTube, TikTok y 150+ plataformas"
          >
            <Rocket className="w-4 h-4" />
            <span>🚀 DISTRIBUIR</span>
          </button>
        )}

        {proAudioUrl && onOpenLicense && (
          <button
            type="button"
            onClick={onOpenLicense}
            className="py-3 px-3 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/60 text-amber-300 font-serif font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-all"
            title="Ver Certificado Oficial de Licencia Comercial"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>LICENCIA</span>
          </button>
        )}

        {proAudioUrl && onOpenVideoExporter && (
          <button
            type="button"
            onClick={onOpenVideoExporter}
            className="py-3 px-3 bg-red-600 hover:bg-red-500 text-stone-100 font-serif font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-all"
            title="Crear Video de la Canción Completa (~2 Minutos)"
          >
            <Video className="w-4 h-4" />
            <span>🎬 VIDEO 2 MIN</span>
          </button>
        )}

        {proAudioUrl && (
          <a
            id="full-track-download-btn"
            href={proAudioUrl}
            download={`${title.replace(/\s+/g, '_')}_Lyria3Pro_Master.mp3`}
            className="p-3 bg-stone-900 hover:bg-stone-800 border border-amber-600/60 text-amber-400 text-xs font-bold rounded cursor-pointer transition-colors"
            title="Descargar Audio Master Pro"
          >
            <Download className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
};
