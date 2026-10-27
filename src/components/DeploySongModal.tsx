import React, { useState, useEffect } from 'react';
import { 
  X, 
  Rocket, 
  CheckCircle2, 
  ExternalLink, 
  RefreshCw, 
  Sparkles, 
  Share2, 
  Music, 
  Youtube, 
  ShieldCheck, 
  Copy, 
  Check, 
  Radio, 
  Sliders, 
  Calendar, 
  Building2, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { CorridoData, ChannelType, ChannelConnection, SongDeployment, DeploymentChannelResult } from '../types';

interface DeploySongModalProps {
  isOpen: boolean;
  onClose: () => void;
  songData: CorridoData | null;
  artistProfile?: { artistName?: string; label?: string; genre?: string } | null;
  onOpenChannelsModal?: () => void;
}

export function DeploySongModal({
  isOpen,
  onClose,
  songData,
  artistProfile,
  onOpenChannelsModal
}: DeploySongModalProps) {
  const [availableChannels, setAvailableChannels] = useState<ChannelConnection[]>([]);
  const [selectedChannelKeys, setSelectedChannelKeys] = useState<ChannelType[]>([
    'spotify',
    'youtube',
    'tiktok',
    'apple_music',
    'distrokid'
  ]);
  const [artistName, setArtistName] = useState(artistProfile?.artistName || 'El Compa Chuy');
  const [songTitle, setSongTitle] = useState(songData?.title || 'Corrido Bélico 2026');
  const [label, setLabel] = useState(artistProfile?.label || 'Medina Tech Records (Dallas, TX)');
  const [releaseDate, setReleaseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isExplicit, setIsExplicit] = useState(true);
  const [audioSource, setAudioSource] = useState<'full_master' | 'preview_clip'>('full_master');
  
  // Pipeline status
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState<number>(0);
  const [deploymentResult, setDeploymentResult] = useState<SongDeployment | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync initial song data
  useEffect(() => {
    if (songData) {
      setSongTitle(songData.title || 'Corrido Bélico 2026');
      if (songData.proAudioUrl) {
        setAudioSource('full_master');
      } else {
        setAudioSource('preview_clip');
      }
    }
  }, [songData]);

  // Fetch channels status
  useEffect(() => {
    if (isOpen) {
      fetch('/api/channels/status')
        .then(res => res.json())
        .then(data => {
          if (data.channels) {
            setAvailableChannels(data.channels);
          }
        })
        .catch(err => console.error('Failed to fetch channels:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleChannel = (key: ChannelType) => {
    if (selectedChannelKeys.includes(key)) {
      setSelectedChannelKeys(selectedChannelKeys.filter(k => k !== key));
    } else {
      setSelectedChannelKeys([...selectedChannelKeys, key]);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  // Launch Deployment Pipeline
  const handleStartDeployment = async () => {
    if (!songData || selectedChannelKeys.length === 0) return;

    try {
      setIsDeploying(true);
      setErrorMsg(null);
      setDeployStep(1); // 1. Audio check & mastering

      await new Promise(r => setTimeout(r, 600));
      setDeployStep(2); // 2. Metadata & ISRC generation

      await new Promise(r => setTimeout(r, 700));
      setDeployStep(3); // 3. Artwork packaging & DSP dispatch

      const response = await fetch('/api/deploy/song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songData: {
            ...songData,
            title: songTitle,
          },
          selectedChannels: selectedChannelKeys,
          releaseConfig: {
            artistName,
            label,
            releaseDate,
            explicit: isExplicit,
            audioSource
          }
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Error al procesar la distribución');
      }

      setDeployStep(4); // 4. Final verification & live link minting
      await new Promise(r => setTimeout(r, 600));

      const data = await response.json();
      setDeploymentResult(data.deployment);
      setDeployStep(5); // Complete
    } catch (err: any) {
      console.error('Deployment error:', err);
      setErrorMsg(err.message || 'Ocurrió un problema durante la distribución');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fadeIn">
      <div className="bg-stone-950 border-2 border-amber-500 w-full max-w-3xl max-h-[94vh] flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-stone-800 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 font-black shadow">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg sm:text-xl text-amber-100 font-bold uppercase tracking-wider">
                  Despachador de Distribución y Lanzamientos
                </h2>
                <span className="px-2 py-0.5 bg-amber-950 border border-amber-700 text-amber-300 text-[10px] font-black uppercase">
                  ISRC + DSP Auto-Ingest
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Publica tu corrido bélico directamente a Spotify, YouTube, TikTok y plataformas globales en segundos.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-amber-200 cursor-pointer p-1.5 rounded hover:bg-stone-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* If already completed deployment, show success live screen */}
          {deploymentResult ? (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 bg-emerald-950/60 border border-emerald-500/70 text-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-900 border border-emerald-400 rounded-full flex items-center justify-center text-xl shadow">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-emerald-100">
                      ¡Canción Distribuida y Publicada con Éxito!
                    </h3>
                    <p className="text-xs text-emerald-300/80">
                      ISRC: <span className="font-mono font-bold text-emerald-200">{deploymentResult.isrc}</span> • UPC: <span className="font-mono text-emerald-200">{deploymentResult.upc}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDeploymentResult(null)}
                  className="px-3 py-1 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-bold uppercase cursor-pointer"
                >
                  Nuevo Despacho
                </button>
              </div>

              {/* Published Channels List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-amber-400" /> Enlaces y Estado en Vivo por Plataforma:
                </h4>

                <div className="grid grid-cols-1 gap-2.5">
                  {deploymentResult.channels.map((res, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-stone-900/90 border border-stone-800 hover:border-amber-700/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-stone-950 border border-stone-700 flex items-center justify-center text-base shrink-0">
                          {res.channel === 'spotify' ? '🎵' : res.channel === 'youtube' ? '▶️' : res.channel === 'tiktok' ? '⚡' : res.channel === 'apple_music' ? '🍎' : res.channel === 'soundcloud' ? '☁️' : '🚀'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-stone-100">{res.name}</span>
                            <span className="px-1.5 py-0.5 bg-emerald-950 border border-emerald-500 text-emerald-300 text-[9px] font-black uppercase">
                              EN VIVO
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-400 mt-0.5">{res.message}</p>
                        </div>
                      </div>

                      {/* Live Action Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {res.liveUrl && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleCopy(res.liveUrl!, `${res.channel}_${idx}`)}
                              className="px-2.5 py-1 bg-stone-950 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs flex items-center gap-1 cursor-pointer"
                            >
                              {copiedLink === `${res.channel}_${idx}` ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" /> Copiado
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-stone-400" /> Copiar Link
                                </>
                              )}
                            </button>
                            <a
                              href={res.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              Ver <ExternalLink className="w-3 h-3" />
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Release Metadata Summary */}
              <div className="p-3.5 bg-stone-950 border border-stone-800 text-xs space-y-2">
                <div className="font-bold text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Metadatos Oficiales de la Grabación:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-stone-400">
                  <div>
                    <span className="text-stone-400 block">Artista:</span>
                    <span className="text-stone-200 font-bold">{deploymentResult.artistName}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Sello Discográfico:</span>
                    <span className="text-stone-200 font-bold">{deploymentResult.label}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Fecha de Lanzamiento:</span>
                    <span className="text-stone-200 font-bold">{deploymentResult.releaseDate}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Contenido Explícito:</span>
                    <span className="text-amber-400 font-bold">{deploymentResult.explicit ? 'Sí (Parental Advisory)' : 'Limpio'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Configuration & Pre-Deploy Form */
            <div className="space-y-5">
              
              {/* Song Overview Card */}
              <div className="p-3.5 bg-gradient-to-r from-stone-900 via-stone-900/90 to-stone-950 border border-stone-800 flex items-center gap-4">
                {songData?.imageUrl ? (
                  <img
                    src={songData.imageUrl}
                    alt={songTitle}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 object-cover border border-amber-500/40 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 bg-stone-950 border border-stone-800 flex items-center justify-center text-2xl shrink-0">
                    🎵
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider">
                    {songData?.style || 'Corrido Bélico 2026'}
                  </span>
                  <h3 className="font-serif font-bold text-base text-amber-100 truncate">
                    {songTitle}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-stone-400 mt-0.5">
                    <span>Tempo: <strong className="text-stone-300">{songData?.tempo || '144 BPM'}</strong></span>
                    <span>Tonalidad: <strong className="text-stone-300">{songData?.musicalKey || 'G Menor'}</strong></span>
                    <span>Master: <strong className="text-emerald-400">{songData?.proAudioUrl ? 'Audio Completo 2-3 Min' : 'Clip 45s'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Channel Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-amber-400" /> Selecciona Canales Destino ({selectedChannelKeys.length} seleccionados)
                  </label>
                  {onOpenChannelsModal && (
                    <button
                      type="button"
                      onClick={onOpenChannelsModal}
                      className="text-[11px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                    >
                      Administrar Conexiones
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'spotify', name: 'Spotify for Artists', icon: '🎵', badge: 'Recomendado' },
                    { id: 'youtube', name: 'YouTube & Music', icon: '▶️', badge: 'Visualizer 4K' },
                    { id: 'tiktok', name: 'TikTok SoundSync', icon: '⚡', badge: 'Viral Clip' },
                    { id: 'apple_music', name: 'Apple Music', icon: '🍎', badge: 'Lossless' },
                    { id: 'distrokid', name: 'DistroKid (150+ DSPs)', icon: '🚀', badge: 'Global' },
                    { id: 'soundcloud', name: 'SoundCloud Pro', icon: '☁️', badge: 'HQ Audio' },
                  ].map((ch) => {
                    const isSelected = selectedChannelKeys.includes(ch.id as ChannelType);
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => toggleChannel(ch.id as ChannelType)}
                        className={`p-2.5 border text-left cursor-pointer transition-all flex items-start gap-2.5 relative ${
                          isSelected
                            ? 'bg-amber-950/40 border-amber-500 shadow-md text-amber-100'
                            : 'bg-stone-900/40 border-stone-800/80 text-stone-400 hover:border-stone-700'
                        }`}
                      >
                        <span className="text-lg shrink-0">{ch.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold truncate text-stone-200">{ch.name}</div>
                          <span className="text-[9px] text-amber-400/90 font-mono block">{ch.badge}</span>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 bg-amber-500 text-stone-950 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Release Metadata Form */}
              <div className="space-y-3 pt-1">
                <label className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" /> Parámetros del Lanzamiento
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-stone-300 font-bold mb-1">Nombre del Artista</label>
                    <input
                      type="text"
                      value={artistName}
                      onChange={(e) => setArtistName(e.target.value)}
                      placeholder="Ej. El Compa Chuy"
                      className="w-full bg-stone-900 border border-stone-700 text-amber-100 text-xs px-3 py-2 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-300 font-bold mb-1">Título de la Canción</label>
                    <input
                      type="text"
                      value={songTitle}
                      onChange={(e) => setSongTitle(e.target.value)}
                      placeholder="Título oficial..."
                      className="w-full bg-stone-900 border border-stone-700 text-amber-100 text-xs px-3 py-2 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-300 font-bold mb-1 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-amber-400" /> Sello Discográfico
                    </label>
                    <input
                      type="text"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder="Medina Tech Records"
                      className="w-full bg-stone-900 border border-stone-700 text-amber-100 text-xs px-3 py-2 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-300 font-bold mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-400" /> Fecha de Lanzamiento
                    </label>
                    <input
                      type="date"
                      value={releaseDate}
                      onChange={(e) => setReleaseDate(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 text-amber-100 text-xs px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Toggles: Audio Source & Explicit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-2.5 bg-stone-900/60 border border-stone-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-stone-200">Pista de Audio</div>
                      <div className="text-[10px] text-stone-400">
                        {songData?.proAudioUrl ? 'Master completo disponible' : 'Solo preview disponible'}
                      </div>
                    </div>
                    <select
                      value={audioSource}
                      onChange={(e) => setAudioSource(e.target.value as any)}
                      className="bg-stone-950 border border-stone-700 text-amber-300 text-xs px-2 py-1 focus:outline-none cursor-pointer"
                    >
                      <option value="full_master" disabled={!songData?.proAudioUrl}>
                        Master 2-3 Min {songData?.proAudioUrl ? '(HQ)' : '(No generado)'}
                      </option>
                      <option value="preview_clip">Clip Preview 45s</option>
                    </select>
                  </div>

                  <div className="p-2.5 bg-stone-900/60 border border-stone-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-stone-200">Etiqueta Parental</div>
                      <div className="text-[10px] text-stone-400">Contenido Explícito Bélico</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsExplicit(!isExplicit)}
                      className={`px-3 py-1 text-xs font-black uppercase cursor-pointer border ${
                        isExplicit
                          ? 'bg-amber-950 border-amber-600 text-amber-300'
                          : 'bg-stone-950 border-stone-700 text-stone-400'
                      }`}
                    >
                      {isExplicit ? 'EXPLICIT [E]' : 'CLEAN'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Deploy Stepper UI */}
              {isDeploying && (
                <div className="p-4 bg-stone-900 border border-amber-500/80 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-200">
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      Procesando Despacho a {selectedChannelKeys.length} Canales...
                    </span>
                    <span className="font-mono">{deployStep * 20}%</span>
                  </div>

                  <div className="w-full bg-stone-950 h-2 border border-stone-800 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-600 to-amber-400 h-full transition-all duration-500"
                      style={{ width: `${deployStep * 20}%` }}
                    />
                  </div>

                  <div className="space-y-1 text-[11px] text-stone-400">
                    <div className={deployStep >= 1 ? 'text-amber-300 font-bold' : ''}>
                      {deployStep >= 1 ? '✓' : '•'} 1. Verificación y normalización de audio máster (24-bit WAV)...
                    </div>
                    <div className={deployStep >= 2 ? 'text-amber-300 font-bold' : ''}>
                      {deployStep >= 2 ? '✓' : '•'} 2. Acuñación de código ISRC (US-MTR-26) y código de barras UPC...
                    </div>
                    <div className={deployStep >= 3 ? 'text-amber-300 font-bold' : ''}>
                      {deployStep >= 3 ? '✓' : '•'} 3. Empaquetado de arte de portada y despacho a Spotify & YouTube Ingest...
                    </div>
                    <div className={deployStep >= 4 ? 'text-amber-300 font-bold' : ''}>
                      {deployStep >= 4 ? '✓' : '•'} 4. Sincronización en catálogos y generación de enlaces en vivo...
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-red-950/80 border border-red-500 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!deploymentResult && (
          <div className="p-4 border-t border-stone-800 bg-stone-950 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-stone-400 text-xs">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>100% de Regalías Directas para el Artista (Medina Tech Records).</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                disabled={isDeploying}
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeploying || selectedChannelKeys.length === 0}
                onClick={handleStartDeployment}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isDeploying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Publicando...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" /> Publicar a {selectedChannelKeys.length} Canales Ahora
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
