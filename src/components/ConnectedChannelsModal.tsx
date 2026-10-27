import React, { useState, useEffect } from 'react';
import { 
  X, 
  Radio, 
  CheckCircle2, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles, 
  Link2, 
  Music, 
  Youtube, 
  Share2, 
  Settings2, 
  Check, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { ChannelConnection, ChannelType } from '../types';

interface ConnectedChannelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDeployModal?: () => void;
  artistProfile?: { artistName?: string; label?: string; genre?: string; email?: string } | null;
}

export function ConnectedChannelsModal({ isOpen, onClose, onOpenDeployModal, artistProfile }: ConnectedChannelsModalProps) {
  const [channels, setChannels] = useState<ChannelConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingId, setConnectingId] = useState<ChannelType | null>(null);
  const [activeTab, setActiveTab] = useState<'channels' | 'setup_guide'>('channels');
  const [editingChannel, setEditingChannel] = useState<ChannelType | null>(null);
  const [customHandle, setCustomHandle] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Fetch channels from server
  const fetchChannels = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/channels/status');
      if (res.ok) {
        const data = await res.json();
        setChannels(data.channels || []);
      }
    } catch (err) {
      console.error('Failed to load channel connections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchChannels();
    }
  }, [isOpen]);

  // Listen for OAuth success popup messages (Standard OAuth postMessage pattern)
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      // Accept messages from preview or localhost
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const provider = event.data.provider || 'spotify';
        setStatusMessage(`¡Cuenta de ${provider.toUpperCase()} conectada con éxito!`);
        setTimeout(() => setStatusMessage(null), 4000);
        fetchChannels();
        setConnectingId(null);
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  // Handle Connect / OAuth Flow
  const handleConnectChannel = async (channel: ChannelConnection) => {
    try {
      setConnectingId(channel.id);

      if (channel.authType === 'oauth' && channel.oauthEndpoint) {
        // Fetch OAuth URL from backend
        const res = await fetch(channel.oauthEndpoint);
        if (res.ok) {
          const { url } = await res.json();
          if (url) {
            // Open provider OAuth URL directly in popup
            const width = 600;
            const height = 700;
            const left = window.screen.width / 2 - width / 2;
            const top = window.screen.height / 2 - height / 2;
            const authWindow = window.open(
              url,
              `oauth_${channel.id}`,
              `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
            );

            if (!authWindow) {
              alert('Por favor habilita las ventanas emergentes (popups) para vincular tu cuenta.');
              setConnectingId(null);
            }
            return;
          }
        }
      }

      // Fallback or partner ingest direct connection
      const toggleRes = await fetch('/api/channels/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: channel.id,
          connected: !channel.connected,
          accountName: channel.accountName || `Medina Tech (${channel.name})`
        })
      });

      if (toggleRes.ok) {
        const data = await toggleRes.json();
        setStatusMessage(
          channel.connected
            ? `Canal ${channel.name} desvinculado.`
            : `¡Canal ${channel.name} vinculado y listo para distribución!`
        );
        setTimeout(() => setStatusMessage(null), 3500);
        fetchChannels();
      }
    } catch (err) {
      console.error('Channel connection error:', err);
    } finally {
      setConnectingId(null);
    }
  };

  // Save manual handle/ID
  const handleSaveCustomHandle = async (channelId: ChannelType) => {
    if (!customHandle.trim()) return;
    try {
      await fetch('/api/channels/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId,
          connected: true,
          accountName: customHandle.trim()
        })
      });
      setEditingChannel(null);
      setCustomHandle('');
      fetchChannels();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const connectedCount = channels.filter(c => c.connected).length;
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-jnezyze2sji33tfwn3ttkq-624602357517.us-west2.run.app';
  const callbackUrl = `${currentOrigin}/auth/callback`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fadeIn">
      <div className="bg-stone-950 border-2 border-amber-500/80 w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-stone-800 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/40 text-amber-400">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg sm:text-xl text-amber-100 font-bold uppercase tracking-wider">
                  Canales y Cuentas de Distribución
                </h2>
                <span className="px-2 py-0.5 bg-amber-950/80 border border-amber-700/60 text-amber-300 text-[10px] font-black uppercase">
                  {connectedCount} de {channels.length} Activos
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Conecta tus perfiles de artista para publicar canciones completas directamente a Spotify, YouTube, TikTok y 150+ plataformas.
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-stone-800/80 bg-stone-900/40">
          <button
            type="button"
            onClick={() => setActiveTab('channels')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'channels'
                ? 'border-amber-500 text-amber-300 bg-amber-950/20'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" /> Canales Disponibles ({channels.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('setup_guide')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'setup_guide'
                ? 'border-amber-500 text-amber-300 bg-amber-950/20'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" /> Guía de Credenciales OAuth
          </button>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/60 text-emerald-300 px-5 py-2.5 text-xs flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {statusMessage}
            </span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === 'channels' ? (
            <>
              {loading ? (
                <div className="py-16 text-center text-stone-400 space-y-3">
                  <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                  <p className="text-xs uppercase tracking-wider font-mono">Cargando estado de conexiones...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {channels.map((channel) => {
                    const isConnecting = connectingId === channel.id;
                    const isEditing = editingChannel === channel.id;

                    return (
                      <div
                        key={channel.id}
                        className={`border transition-all p-4 relative flex flex-col justify-between ${
                          channel.connected
                            ? 'bg-gradient-to-b from-stone-900/90 to-stone-950 border-amber-600/70 shadow-lg shadow-black/40'
                            : 'bg-stone-900/30 border-stone-800/80 opacity-80 hover:opacity-100 hover:border-stone-700'
                        }`}
                      >
                        <div>
                          {/* Top Row: Icon & Status Badge */}
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-stone-950 border border-stone-700 flex items-center justify-center text-xl shrink-0">
                                {channel.icon}
                              </div>
                              <div>
                                <h3 className="font-serif font-bold text-sm text-stone-100 flex items-center gap-1.5">
                                  {channel.name}
                                  {channel.connected && (
                                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                                  )}
                                </h3>
                                <p className="text-[11px] text-stone-400">{channel.subtitle}</p>
                              </div>
                            </div>

                            <span
                              className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider shrink-0 ${
                                channel.connected
                                  ? 'bg-emerald-950/80 border border-emerald-500/70 text-emerald-300'
                                  : 'bg-stone-800 text-stone-400'
                              }`}
                            >
                              {channel.connected ? 'VINCULADO' : 'NO VINCULADO'}
                            </span>
                          </div>

                          {/* Account Info or Edit Form */}
                          {channel.connected ? (
                            <div className="bg-stone-950/80 border border-stone-800 p-2.5 mb-3 space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-stone-400 font-mono">Cuenta activa:</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingChannel(isEditing ? null : channel.id);
                                    setCustomHandle(channel.accountName || '');
                                  }}
                                  className="text-[10px] text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
                                >
                                  <Settings2 className="w-3 h-3" /> Editar
                                </button>
                              </div>
                              {isEditing ? (
                                <div className="flex items-center gap-1.5 pt-1">
                                  <input
                                    type="text"
                                    value={customHandle}
                                    onChange={(e) => setCustomHandle(e.target.value)}
                                    placeholder="Nombre de canal o ID..."
                                    className="bg-stone-900 border border-stone-700 text-amber-100 text-xs px-2 py-1 flex-1 focus:outline-none focus:border-amber-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSaveCustomHandle(channel.id)}
                                    className="px-2 py-1 bg-amber-600 text-stone-950 font-bold text-xs cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <p className="text-xs font-bold text-amber-200 truncate">
                                  {channel.accountName || 'Perfil Verificado'}
                                </p>
                              )}
                              {channel.lastSynced && (
                                <p className="text-[10px] text-stone-400 font-mono">
                                  Sincronizado: {new Date(channel.lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="p-2.5 mb-3 bg-stone-950/40 border border-stone-800/60 text-[11px] text-stone-400">
                              Vincular para habilitar la publicación con 1 clic al momento de masterizar tus corridos.
                            </div>
                          )}

                          {/* Features List */}
                          <div className="space-y-1 mb-4">
                            {channel.features.map((feat, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-[11px] text-stone-400">
                                <span className="text-amber-500 font-black">•</span>
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Bottom Action Button */}
                        <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between">
                          <span className="text-[10px] text-stone-400 uppercase font-mono">
                            {channel.authType === 'oauth' ? 'OAuth 2.0 Auth' : channel.authType === 'partner_ingest' ? 'Partner Direct Feed' : 'API Key Auth'}
                          </span>

                          <button
                            type="button"
                            disabled={isConnecting}
                            onClick={() => handleConnectChannel(channel)}
                            className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider cursor-pointer flex items-center gap-1.5 transition-all ${
                              channel.connected
                                ? 'bg-stone-800 hover:bg-red-950 hover:border-red-600 border border-stone-700 text-stone-300 hover:text-red-200'
                                : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 shadow'
                            }`}
                          >
                            {isConnecting ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Conectando...
                              </>
                            ) : channel.connected ? (
                              'Desvincular'
                            ) : (
                              <>
                                <Link2 className="w-3.5 h-3.5" /> Conectar Canal
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            /* Setup Guide Tab */
            <div className="bg-stone-900/60 border border-stone-800 p-5 space-y-4 text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Configuración de OAuth para Spotify y YouTube
              </div>
              <p className="text-stone-300 leading-relaxed">
                Para producción o sincronización directa con tus propias credenciales de desarrollador de Spotify for Artists y Google Cloud Console (YouTube):
              </p>

              <div className="space-y-3 pt-1">
                <div className="p-3 bg-stone-950 border border-amber-900/40 space-y-1.5">
                  <div className="font-bold text-amber-200 text-xs">1. Callback URL de Redirección (MANDATORIO):</div>
                  <p className="text-stone-400 text-[11px]">
                    Agrega esta URL exacta en la lista de <strong className="text-stone-200">Redirect URIs</strong> de tu Spotify Developer Dashboard y Google Cloud Credentials:
                  </p>
                  <div className="bg-black/90 p-2 border border-stone-800 font-mono text-[11px] text-amber-300 select-all flex items-center justify-between">
                    <span>{callbackUrl}</span>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(callbackUrl)}
                      className="text-[10px] bg-stone-800 hover:bg-stone-700 px-2 py-0.5 text-stone-300 cursor-pointer"
                    >
                      Copiar
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-stone-950 border border-stone-800 space-y-1.5">
                  <div className="font-bold text-amber-200 text-xs">2. Variables de Entorno en AI Studio (Secrets):</div>
                  <p className="text-stone-400 text-[11px]">
                    Configura las siguientes variables en el menú de Secrets de AI Studio:
                  </p>
                  <ul className="list-disc list-inside text-stone-300 font-mono text-[11px] space-y-1 pl-1">
                    <li><span className="text-amber-400 font-bold">SPOTIFY_CLIENT_ID</span> & <span className="text-amber-400 font-bold">SPOTIFY_CLIENT_SECRET</span></li>
                    <li><span className="text-amber-400 font-bold">YOUTUBE_CLIENT_ID</span> & <span className="text-amber-400 font-bold">YOUTUBE_CLIENT_SECRET</span></li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-800 bg-stone-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-stone-400 text-xs">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Encriptación AES-256 en bóveda Medina Tech Records (Dallas, TX).</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Cerrar
            </button>
            {onOpenDeployModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDeployModal();
                }}
                className="flex-1 sm:flex-none px-5 py-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> Ir a Distribuir Canción
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
