import React, { useState, useEffect } from 'react';
import {
  Rocket, Music, Disc, DollarSign, Share2, Shield, CheckCircle2,
  AlertCircle, Download, Copy, ExternalLink, Plus, RefreshCw,
  TrendingUp, Users, Radio, Globe, BarChart3, ChevronRight, X,
  FileCode, Play, Sparkles, Check, ArrowUpRight, Lock, Eye
} from 'lucide-react';
import { CorridoData } from '../types';
import { DSPIntegrationService, DSPSubmissionResult, ISRCLookupResult, EditorialPitchPackage } from '../utils/dspIntegrationService';

interface SovereignDistributionHubProps {
  isOpen: boolean;
  onClose: () => void;
  currentSong?: CorridoData | null;
  artistProfile?: { artistName?: string; label?: string; genre?: string; email?: string } | null;
}

export function SovereignDistributionHub({
  isOpen,
  onClose,
  currentSong,
  artistProfile
}: SovereignDistributionHubProps) {
  const [activeTab, setActiveTab] = useState<'catalog' | 'new_release' | 'splits' | 'bank' | 'hyperfollow' | 'content_id' | 'dsp_pipelines'>('catalog');
  const [releases, setReleases] = useState<any[]>([]);
  const [selectedRelease, setSelectedRelease] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // DSP Direct Pipeline State
  const [dspTesting, setDspTesting] = useState<'spotify' | 'apple_music' | 'tidal' | null>(null);
  const [dspAuthStatus, setDspAuthStatus] = useState<Record<string, { connected: boolean; token?: string; error?: string }>>({});
  const [dspSubmitting, setDspSubmitting] = useState(false);
  const [dspSubmissionReceipts, setDspSubmissionReceipts] = useState<DSPSubmissionResult[]>([]);
  const [isrcSearchInput, setIsrcSearchInput] = useState('');
  const [isrcSearchResult, setIsrcSearchResult] = useState<ISRCLookupResult | null>(null);
  const [isrcSearching, setIsrcSearching] = useState(false);
  const [pitchPackage, setPitchPackage] = useState<EditorialPitchPackage | null>(null);
  const [generatingPitch, setGeneratingPitch] = useState(false);

  // DDEX XML Modal State
  const [showDdexModal, setShowDdexModal] = useState(false);
  const [ddexXmlContent, setDdexXmlContent] = useState<string>('');
  const [ddexLoading, setDdexLoading] = useState(false);
  const [copiedDdex, setCopiedDdex] = useState(false);

  // Bank Data State
  const [bankData, setBankData] = useState<any | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawDestination, setWithdrawDestination] = useState<string>(artistProfile?.email || 'AlfredoJrMedi@gmail.com');
  const [withdrawMethod, setWithdrawMethod] = useState<'stripe' | 'bank_wire' | 'paypal'>('stripe');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Splits State
  const [currentSplits, setCurrentSplits] = useState<any[]>([]);
  const [splitsReleaseId, setSplitsReleaseId] = useState<string>('');
  const [splitsSaveSuccess, setSplitsSaveSuccess] = useState(false);

  // Whitelist State
  const [whitelistedChannels, setWhitelistedChannels] = useState<any[]>([]);
  const [newChannelPlatform, setNewChannelPlatform] = useState<'youtube' | 'tiktok' | 'instagram'>('youtube');
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelHandle, setNewChannelHandle] = useState('');

  // New Release Form State
  const [newTitle, setNewTitle] = useState(currentSong?.title || '');
  const [newArtist, setNewArtist] = useState(artistProfile?.artistName || 'Alfredo Medina');
  const [newFeatured, setNewFeatured] = useState('');
  const [newLabel, setNewLabel] = useState(artistProfile?.label || 'Sovereign Records LLC');
  const [newGenre, setNewGenre] = useState(currentSong?.musicalGenreTag || 'Regional Mexican / Bélico');
  const [newSubgenre, setNewSubgenre] = useState('Corridos Bélicos 2026');
  const [newExplicit, setNewExplicit] = useState<'not_explicit' | 'explicit' | 'clean'>('not_explicit');
  const [newBpm, setNewBpm] = useState<number>(144);
  const [newKey, setNewKey] = useState<string>(currentSong?.musicalKey || 'G Major');
  const [selectedStores, setSelectedStores] = useState<string[]>([
    'spotify', 'apple_music', 'youtube_music', 'tiktok', 'instagram_meta',
    'amazon_music', 'tidal', 'deezer', 'pandora', 'iheartradio', 'tencent_music'
  ]);

  // Load Releases & Bank
  const fetchDistributionData = async () => {
    setLoading(true);
    try {
      const [relRes, bankRes, wlRes] = await Promise.all([
        fetch('/api/distribution/releases').then(r => r.json()),
        fetch('/api/distribution/bank').then(r => r.json()),
        fetch('/api/distribution/whitelist').then(r => r.json())
      ]);

      if (relRes.success && relRes.releases) {
        setReleases(relRes.releases);
        if (!selectedRelease && relRes.releases.length > 0) {
          setSelectedRelease(relRes.releases[0]);
          fetchSplitsForRelease(relRes.releases[0].id);
        }
      }
      if (bankRes.success && bankRes.bank) {
        setBankData(bankRes.bank);
      }
      if (wlRes.success && wlRes.channels) {
        setWhitelistedChannels(wlRes.channels);
      }
    } catch (err) {
      console.error('Error fetching distribution data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSplitsForRelease = async (releaseId: string) => {
    try {
      const res = await fetch(`/api/distribution/splits/${releaseId}`).then(r => r.json());
      if (res.success && res.splits) {
        setCurrentSplits(res.splits);
        setSplitsReleaseId(releaseId);
      }
    } catch (e) {
      console.error('Error fetching splits:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDistributionData();
    }
  }, [isOpen]);

  // Sync with currentSong if changed
  useEffect(() => {
    if (currentSong?.title) {
      setNewTitle(currentSong.title);
    }
    if (currentSong?.musicalKey) {
      setNewKey(currentSong.musicalKey);
    }
  }, [currentSong]);

  if (!isOpen) return null;

  // Handle DDEX XML Generation
  const handleViewDdex = async (releaseId: string) => {
    setDdexLoading(true);
    setShowDdexModal(true);
    setCopiedDdex(false);
    try {
      const res = await fetch(`/api/distribution/releases/${releaseId}/ddex`).then(r => r.json());
      if (res.success && res.xml) {
        setDdexXmlContent(res.xml);
      } else {
        setDdexXmlContent('<!-- Error generando DDEX XML -->');
      }
    } catch (err) {
      setDdexXmlContent('<!-- Error en servidor al procesar el estándar DDEX ERN 4.2 -->');
    } finally {
      setDdexLoading(false);
    }
  };

  // Handle New Release Submission
  const handleCreateRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('Por favor ingresa el título de la canción');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: newTitle,
        artistName: newArtist,
        featuredArtists: newFeatured ? newFeatured.split(',').map(s => s.trim()) : [],
        label: newLabel,
        genre: newGenre,
        subgenre: newSubgenre,
        explicit: newExplicit,
        bpm: Number(newBpm) || 144,
        musicalKey: newKey,
        audioUrl: currentSong?.audioUrl || '/audio/pura_lumbre_1773738012675.wav',
        coverArtUrl: currentSong?.imageUrl || '/assets/corrido_art.jpg',
        targetDSPs: selectedStores,
        durationSec: 135
      };

      const res = await fetch('/api/distribution/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json());

      if (res.success && res.release) {
        setStatusMessage(`¡Lanzamiento "${res.release.title}" empaquetado exitosamente con ISRC ${res.release.isrc} y UPC ${res.release.upc}!`);
        await fetchDistributionData();
        setSelectedRelease(res.release);
        setActiveTab('catalog');
      }
    } catch (err) {
      console.error('Error creating release:', err);
      alert('Hubo un error al procesar el lanzamiento en el motor de distribución.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Splits Save
  const handleSaveSplits = async () => {
    if (!splitsReleaseId) return;
    const total = currentSplits.reduce((acc, curr) => acc + Number(curr.percentage || 0), 0);
    if (Math.abs(total - 100.0) > 0.01) {
      alert(`Los porcentajes deben sumar exactamente 100.0%. Suma actual: ${total.toFixed(1)}%`);
      return;
    }

    try {
      const res = await fetch('/api/distribution/splits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ releaseId: splitsReleaseId, splits: currentSplits })
      }).then(r => r.json());

      if (res.success) {
        setSplitsSaveSuccess(true);
        setTimeout(() => setSplitsSaveSuccess(false), 3000);
      } else {
        alert(res.error || 'Error al guardar divisiones');
      }
    } catch (err) {
      alert('Error en el servidor al guardar los acuerdos de regalías.');
    }
  };

  // Handle Bank Payout
  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Ingresa un monto válido para retirar.');
      return;
    }
    if (bankData && amount > bankData.availableBalanceUsd) {
      alert(`Saldo insuficiente. Tu balance disponible es de $${bankData.availableBalanceUsd.toFixed(2)} USD`);
      return;
    }

    setIsWithdrawing(true);
    try {
      const res = await fetch('/api/distribution/bank/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountUsd: amount,
          destination: withdrawDestination,
          method: withdrawMethod
        })
      }).then(r => r.json());

      if (res.success) {
        alert(`¡Retiro de $${amount.toFixed(2)} USD procesado con éxito! ID de Referencia: ${res.payout.referenceId}`);
        setWithdrawAmount('');
        await fetchDistributionData();
      } else {
        alert(res.error || 'No se pudo procesar el retiro.');
      }
    } catch (err) {
      alert('Error de conexión al procesar el pago.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Handle Add Channel to Whitelist
  const handleAddWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName || !newChannelHandle) {
      alert('Completa el nombre y URL o handle del canal.');
      return;
    }

    try {
      const res = await fetch('/api/distribution/whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: newChannelPlatform,
          channelName: newChannelName,
          handle: newChannelHandle
        })
      }).then(r => r.json());

      if (res.success) {
        setWhitelistedChannels([res.item, ...whitelistedChannels]);
        setNewChannelName('');
        setNewChannelHandle('');
      }
    } catch (err) {
      alert('Error al agregar canal a la lista blanca.');
    }
  };

  // --- DSP Integration Handlers ---
  const handleTestDspAuth = async (dsp: 'spotify' | 'apple_music' | 'tidal') => {
    setDspTesting(dsp);
    try {
      const res = await DSPIntegrationService.authenticate(dsp);
      setDspAuthStatus(prev => ({
        ...prev,
        [dsp]: {
          connected: res.success,
          token: res.token,
          error: res.error
        }
      }));
      if (res.success) {
        setStatusMessage(`Conexión oficial establecida exitosamente con ${dsp.toUpperCase().replace('_', ' ')} API.`);
      }
    } catch (err: any) {
      setDspAuthStatus(prev => ({
        ...prev,
        [dsp]: { connected: false, error: err.message }
      }));
    } finally {
      setDspTesting(null);
    }
  };

  const handleSubmitReleaseToDsps = async (releaseToSubmit?: any) => {
    const target = releaseToSubmit || selectedRelease || releases[0];
    if (!target) {
      alert('Selecciona o crea un lanzamiento primero.');
      return;
    }

    setDspSubmitting(true);
    try {
      const res = await DSPIntegrationService.submitReleaseToAllDSPs(target, ['spotify', 'apple_music', 'tidal']);
      if (res.success && res.results) {
        setDspSubmissionReceipts(res.results);
        setStatusMessage(`¡Lanzamiento '${target.title}' transmitido a Spotify, Apple Music y Tidal vía DDEX!`);
      } else {
        alert(res.error || 'Error al enviar a los DSPs.');
      }
    } catch (err: any) {
      alert(`Error en el pipeline de entrega: ${err.message}`);
    } finally {
      setDspSubmitting(false);
    }
  };

  const handleSearchIsrc = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = isrcSearchInput.trim();
    if (!clean) return;

    setIsrcSearching(true);
    try {
      const result = await DSPIntegrationService.lookupByISRC(clean);
      setIsrcSearchResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsrcSearching(false);
    }
  };

  const handleGeneratePitch = async () => {
    const target = selectedRelease || releases[0];
    if (!target) return;

    setGeneratingPitch(true);
    try {
      const pitch = await DSPIntegrationService.generateEditorialPitch(target);
      setPitchPackage(pitch);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingPitch(false);
    }
  };

  // Available DSP Stores List
  const DSP_STORES = [
    { id: 'spotify', name: 'Spotify & Spotify for Artists', icon: '🟢', type: 'Streaming' },
    { id: 'apple_music', name: 'Apple Music & iTunes', icon: '🍎', type: 'Lossless' },
    { id: 'youtube_music', name: 'YouTube Music & Content ID', icon: '🔴', type: 'Video & Audio' },
    { id: 'tiktok', name: 'TikTok SoundSync & CapCut', icon: '🎵', type: 'Social Sync' },
    { id: 'instagram_meta', name: 'Instagram & Facebook Reels', icon: '📸', type: 'Meta Sync' },
    { id: 'amazon_music', name: 'Amazon Music HD', icon: '📦', type: 'Hi-Res' },
    { id: 'tidal', name: 'TIDAL HiFi Masters', icon: '⬛', type: 'Master Audio' },
    { id: 'deezer', name: 'Deezer Worldwide', icon: '🟣', type: 'Streaming' },
    { id: 'pandora', name: 'Pandora Radio', icon: '📻', type: 'Radio DSP' },
    { id: 'iheartradio', name: 'iHeartRadio USA', icon: '🎙️', type: 'Radio DSP' },
    { id: 'tencent_music', name: 'Tencent Music (China / QQ Music)', icon: '🌏', type: 'Asia DSP' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-6xl bg-stone-900 border border-amber-600/60 shadow-2xl rounded-lg flex flex-col max-h-[92vh] overflow-hidden my-auto">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-stone-950 via-amber-950/40 to-stone-950 p-4 border-b border-amber-600/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-black text-lg sm:text-xl text-amber-100 uppercase tracking-wide">
                  Motor de Distribución Digital Global
                </h2>
                <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-600 text-emerald-400 text-[10px] font-mono font-bold uppercase rounded">
                  DDEX ERN 4.2 Activo
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Lanzamiento a 150+ tiendas, generación de ISRC/UPC oficial, SplitPay de regalías y Smart Links
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchDistributionData()}
              disabled={loading}
              className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded border border-stone-700 cursor-pointer transition-colors"
              title="Refrescar datos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded border border-stone-700 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Catalog Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 bg-stone-950/80 border-b border-stone-800 text-center divide-x divide-stone-800 text-xs py-2 px-3">
          <div className="p-1">
            <span className="text-stone-400 text-[11px] block">Lanzamientos en Catálogo</span>
            <span className="font-mono font-black text-amber-400 text-sm">{releases.length} Singles/EPs</span>
          </div>
          <div className="p-1">
            <span className="text-stone-400 text-[11px] block">Reproducciones Totales</span>
            <span className="font-mono font-black text-emerald-400 text-sm">
              {releases.reduce((acc, r) => acc + (r.stats?.totalStreams || 0), 0).toLocaleString()} Streams
            </span>
          </div>
          <div className="p-1">
            <span className="text-stone-400 text-[11px] block">Saldo Disponible en Banco</span>
            <span className="font-mono font-black text-amber-300 text-sm">
              ${bankData?.availableBalanceUsd?.toFixed(2) || '0.00'} USD
            </span>
          </div>
          <div className="p-1">
            <span className="text-stone-400 text-[11px] block">Pre-Saves Acumulados</span>
            <span className="font-mono font-black text-sky-400 text-sm">
              {releases.reduce((acc, r) => acc + (r.stats?.preSaves || 0), 0)} Fans
            </span>
          </div>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div className="bg-emerald-950/90 border-b border-emerald-600 px-4 py-2 flex items-center justify-between text-xs text-emerald-300 font-medium animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-emerald-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Tabs Navigation */}
        <div className="flex border-b border-stone-800 bg-stone-950 px-3 overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-2.5 text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'border-amber-500 text-amber-300 bg-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Disc className="w-3.5 h-3.5" />
            <span>Catálogo y Lanzamientos</span>
          </button>

          <button
            onClick={() => setActiveTab('new_release')}
            className={`px-3 py-2.5 text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'new_release'
                ? 'border-amber-500 text-amber-300 bg-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ Nuevo Lanzamiento</span>
          </button>

          <button
            onClick={() => setActiveTab('splits')}
            className={`px-3 py-2.5 text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'splits'
                ? 'border-amber-500 text-amber-300 bg-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>SplitPay (Regalías %)</span>
          </button>

          <button
            onClick={() => setActiveTab('bank')}
            className={`px-3 py-2.5 text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'bank'
                ? 'border-amber-500 text-amber-300 bg-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            <span>El Banco & Retiros</span>
          </button>

          <button
            onClick={() => setActiveTab('hyperfollow')}
            className={`px-3 py-2.5 text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'hyperfollow'
                ? 'border-amber-500 text-amber-300 bg-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Smart Links / Pre-Save</span>
          </button>

          <button
            onClick={() => setActiveTab('content_id')}
            className={`px-3 py-2.5 text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'content_id'
                ? 'border-amber-500 text-amber-300 bg-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Content ID & Whitelist</span>
          </button>

          <button
            onClick={() => setActiveTab('dsp_pipelines')}
            className={`px-3 py-2.5 text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'dsp_pipelines'
                ? 'border-amber-500 text-amber-300 bg-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-rose-400" />
            <span>API DSPs (Spotify / Apple / Tidal)</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-4 overflow-y-auto flex-1 bg-stone-900">
          
          {/* TAB 1: CATALOG */}
          {activeTab === 'catalog' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-950 p-3 border border-stone-800 rounded">
                <div>
                  <h3 className="text-sm font-bold text-amber-200 uppercase font-serif">
                    Discografía & Envíos Activos a DSPs
                  </h3>
                  <p className="text-xs text-stone-400">
                    Inspecciona metadatos ISRC/UPC, genera manifiestos DDEX ERN 4.2 y supervisa el estado de entrega en tiendas.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('new_release')}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase font-serif flex items-center gap-1.5 cursor-pointer rounded shadow"
                >
                  <Plus className="w-3.5 h-3.5" /> Nuevo Lanzamiento
                </button>
              </div>

              {releases.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-stone-800 rounded bg-stone-950/40">
                  <Disc className="w-12 h-12 text-stone-600 mx-auto mb-3 animate-pulse" />
                  <p className="text-stone-400 text-sm">No tienes lanzamientos registrados en el motor de distribución todavía.</p>
                  <button
                    onClick={() => setActiveTab('new_release')}
                    className="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase rounded cursor-pointer"
                  >
                    Publicar tu Primera Canción
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {releases.map((rel) => (
                    <div
                      key={rel.id}
                      className="bg-stone-950 border border-stone-800 hover:border-amber-600/80 p-4 rounded transition-all shadow flex flex-col justify-between"
                    >
                      <div>
                        {/* Title & Status */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-700 text-emerald-400 text-[10px] font-mono font-bold uppercase rounded">
                              ● {rel.status === 'live' ? 'En Vivo en 150+ Tiendas' : 'DDEX Empaquetado'}
                            </span>
                            <h4 className="font-serif font-black text-amber-100 text-base mt-1">
                              {rel.title}
                            </h4>
                            <p className="text-xs text-stone-400">
                              {rel.artistName} {rel.featuredArtists?.length ? `(feat. ${rel.featuredArtists.join(', ')})` : ''}
                            </p>
                          </div>
                          <span className="text-[11px] font-mono px-2 py-1 bg-stone-900 border border-stone-700 text-amber-400 rounded">
                            {rel.genre}
                          </span>
                        </div>

                        {/* Metadata Pills */}
                        <div className="grid grid-cols-2 gap-2 bg-stone-900/90 p-2.5 rounded border border-stone-800 text-xs mb-3 font-mono">
                          <div>
                            <span className="text-stone-500 text-[10px] block">ISRC (ISO 3901)</span>
                            <span className="text-amber-300 font-bold">{rel.isrc}</span>
                          </div>
                          <div>
                            <span className="text-stone-500 text-[10px] block">UPC / Código de Barras</span>
                            <span className="text-amber-300 font-bold">{rel.upc}</span>
                          </div>
                          <div>
                            <span className="text-stone-500 text-[10px] block">Sello Discográfico</span>
                            <span className="text-stone-300 truncate">{rel.label}</span>
                          </div>
                          <div>
                            <span className="text-stone-500 text-[10px] block">Reproducciones</span>
                            <span className="text-emerald-400 font-bold">{(rel.stats?.totalStreams || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-800/80">
                        <button
                          onClick={() => handleViewDdex(rel.id)}
                          className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-700 hover:border-amber-500 text-amber-300 text-xs font-mono font-bold rounded flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileCode className="w-3.5 h-3.5 text-amber-400" />
                          <span>Ver DDEX XML</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedRelease(rel);
                            fetchSplitsForRelease(rel.id);
                            setActiveTab('splits');
                          }}
                          className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-700 hover:border-amber-500 text-stone-300 text-xs font-mono font-bold rounded flex items-center gap-1.5 cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5 text-amber-400" />
                          <span>Splits %</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedRelease(rel);
                            setActiveTab('hyperfollow');
                          }}
                          className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-700 hover:border-amber-500 text-sky-300 text-xs font-mono font-bold rounded flex items-center gap-1.5 cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5 text-sky-400" />
                          <span>Smart Link</span>
                        </button>

                        <a
                          href={`/api/distribution/bank/csv?releaseId=${rel.id}`}
                          download
                          className="ml-auto p-1.5 text-stone-400 hover:text-amber-400 hover:bg-stone-800 rounded transition-colors"
                          title="Descargar Reporte CSV de Regalías"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: NEW RELEASE WIZARD */}
          {activeTab === 'new_release' && (
            <form onSubmit={handleCreateRelease} className="space-y-4 max-w-4xl mx-auto">
              <div className="bg-stone-950 p-4 border border-stone-800 rounded">
                <h3 className="font-serif font-black text-amber-200 text-base mb-1">
                  Paso 1: Metadatos del Lanzamiento
                </h3>
                <p className="text-xs text-stone-400 mb-4">
                  El sistema asignará automáticamente el código internacional de grabación (ISRC) y el código de producto (UPC).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-stone-300 mb-1">
                      Título Oficial de la Canción *
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                      placeholder="e.g., El General Firme (Master 2026)"
                      className="w-full bg-stone-900 border border-stone-700 text-stone-100 text-xs p-2.5 rounded focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-stone-300 mb-1">
                      Artista Principal (Nombre en Spotify/Apple) *
                    </label>
                    <input
                      type="text"
                      value={newArtist}
                      onChange={(e) => setNewArtist(e.target.value)}
                      required
                      placeholder="e.g., Alfredo Medina"
                      className="w-full bg-stone-900 border border-stone-700 text-stone-100 text-xs p-2.5 rounded focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-stone-300 mb-1">
                      Artistas Invitados (Featurings separados por coma)
                    </label>
                    <input
                      type="text"
                      value={newFeatured}
                      onChange={(e) => setNewFeatured(e.target.value)}
                      placeholder="e.g., Requinto Soloist, El Compa Checo"
                      className="w-full bg-stone-900 border border-stone-700 text-stone-100 text-xs p-2.5 rounded focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-stone-300 mb-1">
                      Sello Discográfico / Record Label
                    </label>
                    <input
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="e.g., Sovereign Records LLC"
                      className="w-full bg-stone-900 border border-stone-700 text-stone-100 text-xs p-2.5 rounded focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-stone-300 mb-1">
                      Género Primario
                    </label>
                    <select
                      value={newGenre}
                      onChange={(e) => setNewGenre(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 text-stone-100 text-xs p-2.5 rounded focus:border-amber-500 focus:outline-none"
                    >
                      <option value="Regional Mexican / Bélico">Regional Mexican / Bélico</option>
                      <option value="Corridos Tumbados">Corridos Tumbados</option>
                      <option value="Norteño Clásico">Norteño Clásico</option>
                      <option value="Banda Sinaloense">Banda Sinaloense</option>
                      <option value="Hip Hop / Hard Trap">Hip Hop / Hard Trap</option>
                      <option value="Houston Street Rap">Houston Street Rap</option>
                      <option value="Reggaeton / Latin Urban">Reggaeton / Latin Urban</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-stone-300 mb-1">
                      Clasificación de Contenido Explícito
                    </label>
                    <select
                      value={newExplicit}
                      onChange={(e: any) => setNewExplicit(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 text-stone-100 text-xs p-2.5 rounded focus:border-amber-500 focus:outline-none"
                    >
                      <option value="not_explicit">No Explícito (Apto para todo público)</option>
                      <option value="explicit">Explícito (Parental Advisory)</option>
                      <option value="clean">Clean (Versión Editada de Radio)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Paso 2: Selección de Tiendas y DSPs */}
              <div className="bg-stone-950 p-4 border border-stone-800 rounded">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-serif font-black text-amber-200 text-base">
                    Paso 2: Plataformas y Tiendas DSP Seleccionadas ({selectedStores.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedStores.length === DSP_STORES.length) {
                        setSelectedStores([]);
                      } else {
                        setSelectedStores(DSP_STORES.map(s => s.id));
                      }
                    }}
                    className="text-xs text-amber-400 hover:underline cursor-pointer"
                  >
                    {selectedStores.length === DSP_STORES.length ? 'Deseleccionar Todas' : 'Seleccionar Todas'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {DSP_STORES.map((store) => {
                    const isSelected = selectedStores.includes(store.id);
                    return (
                      <div
                        key={store.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedStores(selectedStores.filter(id => id !== store.id));
                          } else {
                            setSelectedStores([...selectedStores, store.id]);
                          }
                        }}
                        className={`p-2.5 rounded border cursor-pointer transition-all flex items-center justify-between text-xs ${
                          isSelected
                            ? 'bg-amber-950/40 border-amber-500 text-amber-200'
                            : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span>{store.icon}</span>
                          <span className="font-semibold truncate">{store.name}</span>
                        </div>
                        <Check className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-400' : 'opacity-0'}`} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('catalog')}
                  className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs uppercase rounded cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-serif font-black text-xs uppercase tracking-wider rounded flex items-center gap-2 cursor-pointer shadow-lg transition-transform hover:scale-105"
                >
                  <Rocket className="w-4 h-4" />
                  <span>{loading ? 'Generando Manifiesto DDEX...' : 'Empaquetar y Distribuir Lanzamiento'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: SPLITPAY */}
          {activeTab === 'splits' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="bg-stone-950 p-4 border border-stone-800 rounded flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif font-black text-amber-200 text-base mb-1">
                    SplitPay: División Automática de Regalías por Canción
                  </h3>
                  <p className="text-xs text-stone-400">
                    Define la participación de compositores, productores y sello discográfico. Todos los porcentajes deben sumar exactamente 100.0%.
                  </p>
                </div>

                {/* Release Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400">Canción:</span>
                  <select
                    value={splitsReleaseId}
                    onChange={(e) => {
                      setSplitsReleaseId(e.target.value);
                      fetchSplitsForRelease(e.target.value);
                    }}
                    className="bg-stone-900 border border-stone-700 text-amber-300 text-xs p-2 rounded focus:border-amber-500 focus:outline-none font-mono"
                  >
                    {releases.map(r => (
                      <option key={r.id} value={r.id}>{r.title} ({r.isrc})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Splits List Table */}
              <div className="space-y-2.5">
                {currentSplits.map((split, index) => (
                  <div
                    key={split.id || index}
                    className="bg-stone-950 border border-stone-800 p-3 rounded grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                  >
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-mono text-stone-500 uppercase">Nombre del Colaborador</label>
                      <input
                        type="text"
                        value={split.recipientName}
                        onChange={(e) => {
                          const copy = [...currentSplits];
                          copy[index].recipientName = e.target.value;
                          setCurrentSplits(copy);
                        }}
                        className="w-full bg-stone-900 border border-stone-700 text-stone-100 text-xs p-1.5 rounded"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-mono text-stone-500 uppercase">Correo Electrónico / Payout</label>
                      <input
                        type="email"
                        value={split.email}
                        onChange={(e) => {
                          const copy = [...currentSplits];
                          copy[index].email = e.target.value;
                          setCurrentSplits(copy);
                        }}
                        className="w-full bg-stone-900 border border-stone-700 text-stone-100 text-xs p-1.5 rounded font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-mono text-stone-500 uppercase">Rol</label>
                      <select
                        value={split.role}
                        onChange={(e: any) => {
                          const copy = [...currentSplits];
                          copy[index].role = e.target.value;
                          setCurrentSplits(copy);
                        }}
                        className="w-full bg-stone-900 border border-stone-700 text-stone-200 text-xs p-1.5 rounded"
                      >
                        <option value="songwriter">Compositor</option>
                        <option value="producer">Productor</option>
                        <option value="featured_artist">Artista Feat</option>
                        <option value="master_owner">Dueño Master</option>
                        <option value="label">Sello Discográfico</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-mono text-stone-500 uppercase">Porcentaje %</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="100"
                          value={split.percentage}
                          onChange={(e) => {
                            const copy = [...currentSplits];
                            copy[index].percentage = parseFloat(e.target.value) || 0;
                            setCurrentSplits(copy);
                          }}
                          className="w-full bg-stone-900 border border-stone-700 text-amber-300 font-bold text-xs p-1.5 rounded font-mono"
                        />
                        <span className="text-xs text-amber-500 font-mono">%</span>
                      </div>
                    </div>

                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentSplits(currentSplits.filter((_, i) => i !== index));
                        }}
                        className="p-1.5 text-stone-500 hover:text-red-400 transition-colors"
                        title="Eliminar colaborador"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Calculation Ribbon */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-950 p-4 border border-stone-800 rounded">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentSplits([
                        ...currentSplits,
                        {
                          id: `splt_${Date.now()}`,
                          releaseId: splitsReleaseId,
                          recipientName: 'Nuevo Colaborador',
                          email: 'colaborador@musica.com',
                          role: 'producer',
                          percentage: 0,
                          payoutMethod: 'stripe',
                          payoutAccount: 'default',
                          status: 'active'
                        }
                      ]);
                    }}
                    className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-amber-300 text-xs font-bold rounded flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar Colaborador
                  </button>

                  <div className="text-xs font-mono">
                    <span className="text-stone-400">Total asignado: </span>
                    <span className={`font-black ${
                      Math.abs(currentSplits.reduce((a, c) => a + Number(c.percentage || 0), 0) - 100.0) < 0.01
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}>
                      {currentSplits.reduce((a, c) => a + Number(c.percentage || 0), 0).toFixed(1)}% / 100.0%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {splitsSaveSuccess && (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4" /> ¡Splits Guardados!
                    </span>
                  )}
                  <button
                    onClick={handleSaveSplits}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-serif font-black text-xs uppercase tracking-wider rounded cursor-pointer shadow"
                  >
                    Guardar Acuerdo de Regalías
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: THE BANK */}
          {activeTab === 'bank' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-stone-950 p-4 border border-amber-600/50 rounded shadow">
                  <span className="text-stone-400 text-xs block mb-1">Saldo Disponible para Retiro</span>
                  <h3 className="font-serif font-black text-2xl text-amber-300 font-mono">
                    ${bankData?.availableBalanceUsd?.toFixed(2) || '0.00'} USD
                  </h3>
                  <span className="text-[10px] text-emerald-400 block mt-1">Listo para transferir vía Stripe / ACH</span>
                </div>

                <div className="bg-stone-950 p-4 border border-stone-800 rounded shadow">
                  <span className="text-stone-400 text-xs block mb-1">Pendiente por Liquidar (DSPs)</span>
                  <h3 className="font-serif font-black text-2xl text-stone-300 font-mono">
                    ${bankData?.pendingBalanceUsd?.toFixed(2) || '0.00'} USD
                  </h3>
                  <span className="text-[10px] text-stone-500 block mt-1">En proceso de conciliación mensual</span>
                </div>

                <div className="bg-stone-950 p-4 border border-stone-800 rounded shadow">
                  <span className="text-stone-400 text-xs block mb-1">Ganancias Históricas Totales</span>
                  <h3 className="font-serif font-black text-2xl text-emerald-400 font-mono">
                    ${bankData?.lifetimeEarningsUsd?.toFixed(2) || '0.00'} USD
                  </h3>
                  <span className="text-[10px] text-stone-500 block mt-1">100% de las regalías conservadas</span>
                </div>
              </div>

              {/* Withdraw Request Card */}
              <div className="bg-stone-950 p-4 border border-stone-800 rounded">
                <h3 className="font-serif font-black text-amber-200 text-base mb-1">
                  Solicitar Retiro de Regalías
                </h3>
                <p className="text-xs text-stone-400 mb-4">
                  Transfiere tus fondos acumulados a tu cuenta bancaria o Stripe Express vinculada.
                </p>

                <form onSubmit={handleRequestPayout} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1">
                      Monto a Retirar ($USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      max={bankData?.availableBalanceUsd || 1000}
                      placeholder={`Máx $${bankData?.availableBalanceUsd?.toFixed(2) || '0.00'}`}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      required
                      className="w-full bg-stone-900 border border-stone-700 text-amber-300 text-xs p-2 rounded font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1">
                      Método de Payout
                    </label>
                    <select
                      value={withdrawMethod}
                      onChange={(e: any) => setWithdrawMethod(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 text-stone-200 text-xs p-2 rounded"
                    >
                      <option value="stripe">Stripe Express Payout</option>
                      <option value="bank_wire">Transferencia Bancaria Directa (ACH)</option>
                      <option value="paypal">PayPal Direct</option>
                    </select>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isWithdrawing || !bankData?.availableBalanceUsd || bankData?.availableBalanceUsd <= 0}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-800 disabled:text-stone-600 text-stone-950 font-serif font-black text-xs uppercase tracking-wider rounded cursor-pointer transition-colors"
                    >
                      {isWithdrawing ? 'Procesando Pago...' : 'Transferir Fondos'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Payout History Ledger */}
              <div className="bg-stone-950 p-4 border border-stone-800 rounded">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-serif font-black text-stone-200 text-sm">
                    Historial de Transferencias & Liquidaciones
                  </h4>
                  <a
                    href="/api/distribution/bank/csv"
                    download
                    className="px-3 py-1 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-amber-300 text-xs font-mono font-bold rounded flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" /> Exportar CSV Oficial
                  </a>
                </div>

                <div className="divide-y divide-stone-800 text-xs">
                  {bankData?.payouts?.length ? (
                    bankData.payouts.map((po: any) => (
                      <div key={po.id} className="py-2.5 flex items-center justify-between font-mono">
                        <div>
                          <span className="text-stone-300 font-bold block">{po.destination}</span>
                          <span className="text-stone-500 text-[10px]">{po.date} • Ref: {po.referenceId}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-emerald-400 font-black text-sm block">-${po.amountUsd?.toFixed(2)} USD</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded uppercase">
                            {po.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-stone-500 text-xs py-4 text-center">No hay transferencias registradas todavía.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SMART LINKS / PRE-SAVE */}
          {activeTab === 'hyperfollow' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="bg-stone-950 p-4 border border-stone-800 rounded flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif font-black text-amber-200 text-base mb-1">
                    Smart Link / Página de Pre-Save Universal
                  </h3>
                  <p className="text-xs text-stone-400">
                    Página de aterrizaje inteligente para tus oyentes con enlaces directos a Spotify, Apple Music, YouTube y TikTok.
                  </p>
                </div>

                {selectedRelease && (
                  <div className="text-xs font-mono bg-stone-900 px-3 py-1.5 border border-stone-700 rounded text-amber-300">
                    URL: /release/{selectedRelease.slug}
                  </div>
                )}
              </div>

              {selectedRelease ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  {/* Smart Link Live Mobile Simulation (Col 5) */}
                  <div className="md:col-span-5 bg-stone-950 border-2 border-amber-600/70 rounded-2xl p-5 text-center shadow-2xl">
                    <div className="w-36 h-36 mx-auto rounded-lg overflow-hidden border border-amber-500/50 shadow mb-3 bg-stone-900">
                      <img
                        src={selectedRelease.coverArtUrl || '/assets/corrido_art.jpg'}
                        alt="Artwork"
                        className="w-full h-full object-cover"
                        onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60'; }}
                      />
                    </div>

                    <h4 className="font-serif font-black text-amber-100 text-base mb-0.5">
                      {selectedRelease.title}
                    </h4>
                    <p className="text-xs text-stone-400 mb-4">{selectedRelease.artistName}</p>

                    {/* Stream Action Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          fetch('/api/distribution/hyperfollow/presave', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ releaseId: selectedRelease.id, dsp: 'spotify' })
                          });
                          alert('¡Pre-Save registrado con éxito en Spotify!');
                        }}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs rounded flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <span>🟢 Pre-Guardar en Spotify</span>
                      </button>

                      <button
                        onClick={() => alert('Abriendo reproductor de Apple Music')}
                        className="w-full py-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 font-bold text-xs rounded flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <span>🍎 Escuchar en Apple Music</span>
                      </button>

                      <button
                        onClick={() => alert('Abriendo YouTube Music')}
                        className="w-full py-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 font-bold text-xs rounded flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <span>🔴 Ver en YouTube Music</span>
                      </button>
                    </div>
                  </div>

                  {/* Smart Link Conversion Metrics (Col 7) */}
                  <div className="md:col-span-7 bg-stone-950 border border-stone-800 p-4 rounded space-y-3">
                    <h4 className="font-serif font-black text-stone-200 text-sm">
                      Métricas de Conversión del Smart Link
                    </h4>

                    <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                      <div className="p-3 bg-stone-900 border border-stone-800 rounded">
                        <span className="text-stone-400 text-[10px] block">Clics Totales</span>
                        <span className="font-black text-amber-400 text-lg">
                          {(selectedRelease.stats?.smartLinkClicks || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="p-3 bg-stone-900 border border-stone-800 rounded">
                        <span className="text-stone-400 text-[10px] block">Pre-Saves Confirmados</span>
                        <span className="font-black text-emerald-400 text-lg">
                          {selectedRelease.stats?.preSaves || 0}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <span className="text-stone-400 text-xs block mb-2 font-mono">Desglose Geográfico:</span>
                      <div className="space-y-1.5 font-mono text-xs">
                        <div className="flex justify-between text-stone-300">
                          <span>🇺🇸 Estados Unidos (Texas, CA, AZ)</span>
                          <span className="text-amber-400 font-bold">60%</span>
                        </div>
                        <div className="flex justify-between text-stone-300">
                          <span>🇲🇽 México (Sinaloa, Sonora, CDMX)</span>
                          <span className="text-amber-400 font-bold">34%</span>
                        </div>
                        <div className="flex justify-between text-stone-300">
                          <span>🇨🇴 Colombia & Resto de Latam</span>
                          <span className="text-amber-400 font-bold">6%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-stone-400 text-sm text-center py-8">Selecciona un lanzamiento en el catálogo para ver su smart link.</p>
              )}
            </div>
          )}

          {/* TAB 6: CONTENT ID & WHITELIST */}
          {activeTab === 'content_id' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="bg-stone-950 p-4 border border-stone-800 rounded">
                <h3 className="font-serif font-black text-amber-200 text-base mb-1">
                  Protección Content ID & Lista Blanca de Creadores
                </h3>
                <p className="text-xs text-stone-400">
                  Agrega canales de YouTube, TikTok e Instagram a la lista blanca para autorizarlos a monetizar tu música sin recibir reclamos automáticos de copyright.
                </p>
              </div>

              {/* Add Whitelist Form */}
              <form onSubmit={handleAddWhitelist} className="bg-stone-950 p-4 border border-stone-800 rounded grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1">Plataforma</label>
                  <select
                    value={newChannelPlatform}
                    onChange={(e: any) => setNewChannelPlatform(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 text-stone-200 text-xs p-2 rounded"
                  >
                    <option value="youtube">YouTube Channel</option>
                    <option value="tiktok">TikTok Profile</option>
                    <option value="instagram">Instagram Account</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1">Nombre del Canal</label>
                  <input
                    type="text"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    required
                    placeholder="e.g., Alfredo Medina Oficial"
                    className="w-full bg-stone-900 border border-stone-700 text-stone-100 text-xs p-2 rounded"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1">URL o Handle (@)</label>
                  <input
                    type="text"
                    value={newChannelHandle}
                    onChange={(e) => setNewChannelHandle(e.target.value)}
                    required
                    placeholder="e.g., @AlfredoMedinaOfficial"
                    className="w-full bg-stone-900 border border-stone-700 text-stone-100 text-xs p-2 rounded font-mono"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-serif font-black text-xs uppercase tracking-wider rounded cursor-pointer transition-colors"
                  >
                    + Autorizar Canal
                  </button>
                </div>
              </form>

              {/* Whitelisted Channels List */}
              <div className="bg-stone-950 p-4 border border-stone-800 rounded divide-y divide-stone-800">
                <h4 className="font-serif font-black text-stone-200 text-sm mb-2">
                  Canales Autorizados Activos ({whitelistedChannels.length})
                </h4>
                {whitelistedChannels.map((ch) => (
                  <div key={ch.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-stone-200 block">{ch.channelName}</span>
                      <span className="text-stone-500 text-[10px] font-mono">{ch.platform.toUpperCase()} • {ch.channelUrlOrHandle}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-mono uppercase rounded">
                      ✓ Autorizado
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: DSP DIRECT INTEGRATION PIPELINES (SPOTIFY, APPLE MUSIC, TIDAL) */}
          {activeTab === 'dsp_pipelines' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* Header Box */}
              <div className="bg-stone-950 p-5 border border-amber-600/50 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-rose-400" />
                    <h3 className="font-serif font-black text-amber-100 text-base uppercase tracking-wide">
                      DSPIntegrationService • Conectores Oficiales de Streaming
                    </h3>
                  </div>
                  <p className="text-xs text-stone-400 mt-1 max-w-2xl">
                    Autenticación OAuth 2.0 y entrega automatizada de masters Hi-Res a Spotify Content Gateway, Apple Music Transporter/MusicKit y Tidal Open API.
                  </p>
                </div>

                <button
                  onClick={() => handleSubmitReleaseToDsps()}
                  disabled={dspSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:from-rose-500 hover:to-amber-500 text-stone-950 font-serif font-black text-xs uppercase tracking-wider rounded flex items-center gap-2 shadow-lg cursor-pointer transition-all hover:scale-105 disabled:opacity-50"
                >
                  <Rocket className={`w-4 h-4 ${dspSubmitting ? 'animate-spin' : ''}`} />
                  <span>{dspSubmitting ? 'Transmitiendo a DSPs...' : 'Transmitir Release Actual a DSPs'}</span>
                </button>
              </div>

              {/* 3 DSP Direct Authentication & Live Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Spotify */}
                <div className="bg-stone-950 p-4 border border-emerald-800/60 rounded-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🟢</span>
                        <h4 className="font-bold text-stone-100 text-sm">Spotify Content Gateway</h4>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold rounded ${
                        dspAuthStatus.spotify?.connected ? 'bg-emerald-950 text-emerald-400 border border-emerald-700' : 'bg-stone-900 text-stone-400'
                      }`}>
                        {dspAuthStatus.spotify?.connected ? 'Conectado' : 'Standby'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      Soporta OAuth 2.0 Client Credentials, transcodificación Vorbis 320kbps y catálogo Spotify for Artists.
                    </p>
                    {dspAuthStatus.spotify?.token && (
                      <div className="mt-2 p-2 bg-stone-900 rounded font-mono text-[10px] text-emerald-400 truncate">
                        Token: {dspAuthStatus.spotify.token}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-800">
                    <button
                      onClick={() => handleTestDspAuth('spotify')}
                      disabled={dspTesting === 'spotify'}
                      className="w-full py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 text-xs font-serif font-bold uppercase tracking-wider rounded flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${dspTesting === 'spotify' ? 'animate-spin' : ''}`} />
                      <span>{dspTesting === 'spotify' ? 'Verificando...' : 'Verificar Conexión Spotify'}</span>
                    </button>
                  </div>
                </div>

                {/* 2. Apple Music */}
                <div className="bg-stone-950 p-4 border border-rose-800/60 rounded-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🍎</span>
                        <h4 className="font-bold text-stone-100 text-sm">Apple Music Transporter</h4>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold rounded ${
                        dspAuthStatus.apple_music?.connected ? 'bg-rose-950 text-rose-400 border border-rose-700' : 'bg-stone-900 text-stone-400'
                      }`}>
                        {dspAuthStatus.apple_music?.connected ? 'Conectado' : 'Standby'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      Genera JWT MusicKit ES256 y verifica perfiles Apple Digital Masters (ADM 24-bit/96kHz ALAC).
                    </p>
                    {dspAuthStatus.apple_music?.token && (
                      <div className="mt-2 p-2 bg-stone-900 rounded font-mono text-[10px] text-rose-400 truncate">
                        MusicKit JWT: {dspAuthStatus.apple_music.token}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-800">
                    <button
                      onClick={() => handleTestDspAuth('apple_music')}
                      disabled={dspTesting === 'apple_music'}
                      className="w-full py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-300 text-xs font-serif font-bold uppercase tracking-wider rounded flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${dspTesting === 'apple_music' ? 'animate-spin' : ''}`} />
                      <span>{dspTesting === 'apple_music' ? 'Verificando...' : 'Verificar Conexión Apple'}</span>
                    </button>
                  </div>
                </div>

                {/* 3. Tidal */}
                <div className="bg-stone-950 p-4 border border-sky-800/60 rounded-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🌊</span>
                        <h4 className="font-bold text-stone-100 text-sm">Tidal Open API / MQA</h4>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold rounded ${
                        dspAuthStatus.tidal?.connected ? 'bg-sky-950 text-sky-400 border border-sky-700' : 'bg-stone-900 text-stone-400'
                      }`}>
                        {dspAuthStatus.tidal?.connected ? 'Conectado' : 'Standby'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      Inyección HiRes FLAC / MQA Lossless sin pérdida con programa de descubrimiento Tidal Rising.
                    </p>
                    {dspAuthStatus.tidal?.token && (
                      <div className="mt-2 p-2 bg-stone-900 rounded font-mono text-[10px] text-sky-400 truncate">
                        Tidal Bearer: {dspAuthStatus.tidal.token}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-800">
                    <button
                      onClick={() => handleTestDspAuth('tidal')}
                      disabled={dspTesting === 'tidal'}
                      className="w-full py-1.5 bg-sky-950 hover:bg-sky-900 border border-sky-700 text-sky-300 text-xs font-serif font-bold uppercase tracking-wider rounded flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${dspTesting === 'tidal' ? 'animate-spin' : ''}`} />
                      <span>{dspTesting === 'tidal' ? 'Verificando...' : 'Verificar Conexión Tidal'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Submission Receipts History */}
              {dspSubmissionReceipts.length > 0 && (
                <div className="bg-stone-950 p-4 border border-amber-500/60 rounded-lg animate-fadeIn">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <h4 className="font-serif font-black text-amber-200 text-sm uppercase">
                        Recibos Oficiales de Transmisión DSP (DDEX Batch Deliveries)
                      </h4>
                    </div>
                    <span className="text-xs text-stone-400 font-mono">
                      {dspSubmissionReceipts.length} DSPs procesados
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {dspSubmissionReceipts.map((rec) => (
                      <div key={rec.dsp} className="bg-stone-900 p-3 rounded border border-stone-800 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-400 uppercase">{rec.dsp.replace('_', ' ')}</span>
                          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 text-[10px] font-mono rounded">
                            {rec.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-stone-300 font-mono text-[11px]">
                          Batch ID: <span className="text-amber-200">{rec.batchId}</span>
                        </div>
                        <div className="text-stone-400 text-[11px]">
                          Formato: {rec.details.audioFormatAccepted}
                        </div>
                        <div className="text-stone-500 text-[10px]">
                          Salida programada: {rec.expectedLiveDate}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Live ISRC Cross-DSP Catalog Search Engine */}
              <div className="bg-stone-950 p-5 border border-stone-800 rounded-lg space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-amber-400" />
                  <h4 className="font-serif font-black text-stone-200 text-sm uppercase">
                    Búsqueda de Catálogo ISRC en Tiempo Real (Spotify / Apple / Tidal)
                  </h4>
                </div>
                <p className="text-xs text-stone-400">
                  Ingresa cualquier código ISRC internacional para verificar instantáneamente si el track ya se encuentra indexado en los servidores de los DSPs.
                </p>

                <form onSubmit={handleSearchIsrc} className="flex gap-2">
                  <input
                    type="text"
                    value={isrcSearchInput}
                    onChange={(e) => setIsrcSearchInput(e.target.value)}
                    placeholder="Ejemplo: US-MT7-26-89421"
                    className="flex-1 px-3 py-2 bg-stone-900 border border-stone-700 text-amber-300 font-mono text-xs rounded focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={isrcSearching}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-serif font-bold text-xs uppercase tracking-wider rounded cursor-pointer transition-colors"
                  >
                    {isrcSearching ? 'Buscando...' : 'Buscar ISRC'}
                  </button>
                </form>

                {isrcSearchResult && (
                  <div className="mt-3 p-3 bg-stone-900 border border-stone-800 rounded text-xs space-y-2">
                    <span className="font-mono font-bold text-amber-300 block">
                      Resultado para ISRC: {isrcSearchResult.isrc}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="p-2 bg-stone-950 rounded border border-stone-800">
                        <span className="text-emerald-400 font-bold block">Spotify</span>
                        {isrcSearchResult.foundInDSP.spotify?.found ? (
                          <span className="text-stone-300 text-[11px] block truncate">
                            ✓ {isrcSearchResult.foundInDSP.spotify.trackName} (Pop: {isrcSearchResult.foundInDSP.spotify.popularity}%)
                          </span>
                        ) : (
                          <span className="text-stone-500 text-[11px]">No indexado aún</span>
                        )}
                      </div>

                      <div className="p-2 bg-stone-950 rounded border border-stone-800">
                        <span className="text-rose-400 font-bold block">Apple Music</span>
                        {isrcSearchResult.foundInDSP.appleMusic?.found ? (
                          <span className="text-stone-300 text-[11px] block truncate">
                            ✓ {isrcSearchResult.foundInDSP.appleMusic.name}
                          </span>
                        ) : (
                          <span className="text-stone-500 text-[11px]">No indexado aún</span>
                        )}
                      </div>

                      <div className="p-2 bg-stone-950 rounded border border-stone-800">
                        <span className="text-sky-400 font-bold block">Tidal</span>
                        {isrcSearchResult.foundInDSP.tidal?.found ? (
                          <span className="text-stone-300 text-[11px] block truncate">
                            ✓ {isrcSearchResult.foundInDSP.tidal.title} ({isrcSearchResult.foundInDSP.tidal.audioQuality})
                          </span>
                        ) : (
                          <span className="text-stone-500 text-[11px]">No indexado aún</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Editorial Pitch Dossier Section */}
              <div className="bg-stone-950 p-5 border border-stone-800 rounded-lg space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <h4 className="font-serif font-black text-stone-200 text-sm uppercase">
                        Pitch Editorial para Curadores (Spotify for Artists & Apple Music)
                      </h4>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Genera la propuesta oficial para consideración en playlists editoriales (Viva Latino, Corridos Bélicos, etc.).
                    </p>
                  </div>

                  <button
                    onClick={handleGeneratePitch}
                    disabled={generatingPitch}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-serif font-bold uppercase tracking-wider rounded border border-amber-600/40 cursor-pointer transition-colors"
                  >
                    {generatingPitch ? 'Generando...' : 'Generar Pitch Editorial'}
                  </button>
                </div>

                {pitchPackage && (
                  <div className="bg-stone-900 border border-stone-800 p-4 rounded text-xs space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300 text-sm">{pitchPackage.songTitle}</span>
                      <span className="px-2 py-0.5 bg-amber-950 text-amber-400 text-[10px] font-mono rounded">
                        Alcance Estimado: ~{pitchPackage.socialMediaReachEstimate.toLocaleString()} Oyentes
                      </span>
                    </div>

                    <div>
                      <span className="text-stone-400 text-[11px] font-bold block">Historia para Editores de Spotify:</span>
                      <p className="text-stone-200 text-xs mt-1 bg-stone-950 p-2.5 rounded border border-stone-800">
                        {pitchPackage.editorialStory}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-stone-400 text-[11px] font-bold block">Playlists Objetivo:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {pitchPackage.targetPlaylists.map(pl => (
                            <span key={pl} className="px-2 py-0.5 bg-stone-950 border border-stone-800 text-stone-300 text-[10px] rounded">
                              {pl}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-stone-400 text-[11px] font-bold block">Instrumentación Destacada:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {pitchPackage.featuredInstruments.map(inst => (
                            <span key={inst} className="px-2 py-0.5 bg-stone-950 border border-stone-800 text-stone-300 text-[10px] rounded">
                              {inst}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* DDEX ERN 4.2 XML Inspection Modal */}
      {showDdexModal && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-stone-950 border border-amber-500 max-w-3xl w-full rounded-lg p-5 flex flex-col max-h-[85vh] shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif font-black text-amber-100 text-sm uppercase">
                  Manifiesto XML Estándar DDEX ERN 4.2
                </h3>
              </div>
              <button onClick={() => setShowDdexModal(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-stone-900 border border-stone-800 p-3 rounded font-mono text-[11px] text-amber-200/90 whitespace-pre-wrap select-all">
              {ddexLoading ? 'Generando estructura DDEX ERN 4.2...' : ddexXmlContent}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-800 mt-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(ddexXmlContent);
                  setCopiedDdex(true);
                  setTimeout(() => setCopiedDdex(false), 2000);
                }}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono font-bold rounded flex items-center gap-1.5 cursor-pointer"
              >
                {copiedDdex ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDdex ? 'Copiado' : 'Copiar XML'}</span>
              </button>

              <button
                onClick={() => setShowDdexModal(false)}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase rounded cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
