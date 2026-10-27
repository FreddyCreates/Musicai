import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CorridoData, GenreCategory } from '../types';
import { GENRE_SEPARATIONS, getGenreCategory, getGenreSeparationInfo, generateMarketingKit, MarketingCampaignKit } from '../utils/genreSeparations';
import { 
  Megaphone, X, Copy, Check, Radio, Target, Sparkles, TrendingUp, 
  Share2, Music, Hash, Tag, Layers, ArrowRight, ExternalLink, ShieldCheck 
} from 'lucide-react';

interface MarketingSeparationModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSong?: CorridoData | null;
  onSelectCategoryFilter?: (category: GenreCategory) => void;
}

export const MarketingSeparationModal: React.FC<MarketingSeparationModalProps> = ({
  isOpen,
  onClose,
  activeSong,
  onSelectCategoryFilter
}) => {
  const initialCat: GenreCategory = activeSong ? getGenreCategory(activeSong.style) : 'regional_belico';
  const [selectedCat, setSelectedCat] = useState<GenreCategory>(initialCat);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCatInfo = getGenreSeparationInfo(selectedCat);
  const marketingKit: MarketingCampaignKit = activeSong 
    ? generateMarketingKit(activeSong) 
    : {
        category: currentCatInfo,
        releaseTitle: 'Single Master Track',
        artistBrand: 'Medina Tech Artist Agent',
        tagline: `Campaña Oficial de Marketing para la Vertical ${currentCatInfo.name}`,
        pitchNote: `Presentamos el nuevo master oficial enfocado a las listas ${currentCatInfo.dspPitchCategory}. Masterizado con dinámica de alta resolución y metadatos ISRC/UPC listos para distribución digital.`,
        targetDemographic: currentCatInfo.targetAudience,
        playlistPitchCategories: [currentCatInfo.dspPitchCategory],
        socialMediaHooks: {
          tiktok: `🔥 Descubre el nuevo hit de ${currentCatInfo.shortLabel}. ¡Usa este audio oficial en tu próximo video!`,
          instagramReels: `✨ De estreno exclusivo. Suban el volumen a la producción master. #NewMusic`,
          youtubeShorts: `🎬 Premiere oficial en 1080p master quality.`
        },
        hashtags: currentCatInfo.trendingHashtags.join(' ') + ' #MedinaTech #GlobalRelease #Music2026',
        isrcPlaceholder: `MX-A68-26-${Math.floor(10000 + Math.random() * 90000)}`,
        upcPlaceholder: `750998${Math.floor(1000000 + Math.random() * 9000000)}`
      };

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleCopyFullDossier = () => {
    const fullText = `=== DOSSIER DE MARKETING Y SEPARACIÓN DE GÉNERO ===
VERTICAL: ${currentCatInfo.name} (${currentCatInfo.flagEmoji})
ETIQUETA DE MERCADO: ${currentCatInfo.marketTag}
TRACK: ${marketingKit.releaseTitle}
ARTISTA: ${marketingKit.artistBrand}
TEMPO / TONALIDAD: ${activeSong?.tempo || currentCatInfo.keyBpmRange} | ${activeSong?.musicalKey || 'Menor'}
PITCH DSP (SPOTIFY / APPLE MUSIC): ${marketingKit.pitchNote}
TARGET AUDIENCIA: ${marketingKit.targetDemographic}
PLAYLIST RECOMENDADA: ${currentCatInfo.dspPitchCategory}
HOOK TIKTOK: ${marketingKit.socialMediaHooks.tiktok}
HOOK REELS: ${marketingKit.socialMediaHooks.instagramReels}
HASHTAGS: ${marketingKit.hashtags}
ISRC: ${marketingKit.isrcPlaceholder} | UPC: ${marketingKit.upcPlaceholder}
===================================================`;
    handleCopy(fullText, 'full_dossier');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl bg-stone-950 border border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-950/50 overflow-hidden my-6 flex flex-col max-h-[92vh]"
        >
          {/* Top glowing gradient line */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-yellow-400 to-rose-600" />

          {/* Modal Header */}
          <div className="p-5 sm:p-6 pb-4 border-b border-stone-800 flex items-center justify-between bg-stone-900/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                <Megaphone className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-black text-amber-100 text-lg sm:text-xl uppercase tracking-wide">
                    Hub de Separación de Géneros y Marketing
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/40">
                    Suno-Grade
                  </span>
                </div>
                <p className="text-xs text-stone-400 font-mono mt-0.5">
                  Segmentación estratégica de audiencias, playlists oficiales y kits de campaña para marketing
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 border border-transparent hover:border-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category Tabs (Separations) */}
          <div className="px-4 sm:px-6 py-3 border-b border-stone-800/80 bg-stone-900/30 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider font-bold mr-1 shrink-0 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Separaciones:
            </span>
            {GENRE_SEPARATIONS.map((cat) => {
              const isSelected = selectedCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md shadow-amber-500/20 scale-102'
                      : 'bg-stone-900/90 text-stone-300 hover:text-white border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <span>{cat.flagEmoji}</span>
                  <span>{cat.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
            {/* Header Banner for Selected Separation */}
            <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-stone-900 via-stone-900/80 to-stone-950 border border-amber-500/30 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{currentCatInfo.flagEmoji}</span>
                    <h4 className="text-lg sm:text-xl font-serif font-black text-amber-200">
                      {currentCatInfo.name}
                    </h4>
                  </div>
                  <div className="inline-block px-2.5 py-0.5 rounded bg-amber-950/70 border border-amber-600/40 text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider">
                    {currentCatInfo.marketTag}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onSelectCategoryFilter && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCategoryFilter(selectedCat);
                        onClose();
                      }}
                      className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono font-bold text-xs uppercase tracking-wider transition-all shadow flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Crear en este Género</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCopyFullDossier}
                    className="px-3.5 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-amber-200 font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedSection === 'full_dossier' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-green-400">Dossier Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-amber-400" />
                        <span>Copiar Dossier Completo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Grid of Separation Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Target Demographic & Placement */}
              <div className="p-4 bg-stone-900/60 border border-stone-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                  <Target className="w-4 h-4 text-amber-400" />
                  <span>Perfil Demográfico & Mercado Objetivo</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {currentCatInfo.targetAudience}
                </p>
                <div className="pt-2 border-t border-stone-800/80 space-y-1">
                  <span className="text-[11px] font-mono text-stone-400">Rango de Tempo Recomendado:</span>
                  <div className="text-xs font-mono font-bold text-amber-400">
                    {currentCatInfo.keyBpmRange}
                  </div>
                </div>
              </div>

              {/* DSP Playlist Placement */}
              <div className="p-4 bg-stone-900/60 border border-stone-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span>Playlists Oficiales para Pitching (DSP)</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed font-mono">
                  {currentCatInfo.dspPitchCategory}
                </p>
                <div className="pt-2 border-t border-stone-800/80">
                  <div className="flex items-center justify-between text-xs font-mono text-stone-400">
                    <span>Estrategia de Lanzamiento:</span>
                    <span className="text-amber-300 font-bold">Release Viernes 00:00 EST</span>
                  </div>
                </div>
              </div>

              {/* Social Media Campaign Strategy */}
              <div className="p-4 bg-stone-900/60 border border-stone-800 rounded-xl space-y-3 md:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                    <Share2 className="w-4 h-4 text-amber-400" />
                    <span>Estrategia de Campaña en Redes Sociales (TikTok & Reels)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(currentCatInfo.recommendedCampaign, 'campaign')}
                    className="text-[11px] font-mono text-stone-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSection === 'campaign' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSection === 'campaign' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {currentCatInfo.recommendedCampaign}
                </p>

                {/* TikTok & Reels Hook Snippets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-stone-950/80 border border-stone-800 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-pink-400">TikTok Audio Hook</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(marketingKit.socialMediaHooks.tiktok, 'tiktok_hook')}
                        className="text-[10px] font-mono text-stone-400 hover:text-amber-300"
                      >
                        {copiedSection === 'tiktok_hook' ? '✓' : 'Copiar'}
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-300 leading-normal italic">
                      "{marketingKit.socialMediaHooks.tiktok}"
                    </p>
                  </div>

                  <div className="p-3 bg-stone-950/80 border border-stone-800 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-purple-400">Instagram Reels Caption</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(marketingKit.socialMediaHooks.instagramReels, 'reels_hook')}
                        className="text-[10px] font-mono text-stone-400 hover:text-amber-300"
                      >
                        {copiedSection === 'reels_hook' ? '✓' : 'Copiar'}
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-300 leading-normal italic">
                      "{marketingKit.socialMediaHooks.instagramReels}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Hashtag & Distribution Metadata */}
              <div className="p-4 bg-stone-900/60 border border-stone-800 rounded-xl space-y-3 md:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                    <Hash className="w-4 h-4 text-amber-400" />
                    <span>Pack de Hashtags Oficiales para Distribución</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(marketingKit.hashtags, 'hashtags')}
                    className="text-[11px] font-mono text-stone-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSection === 'hashtags' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSection === 'hashtags' ? 'Copiado' : 'Copiar Pack'}</span>
                  </button>
                </div>
                <div className="p-3 bg-stone-950/80 border border-stone-800 rounded-lg font-mono text-xs text-amber-300/90 select-all">
                  {marketingKit.hashtags}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-5 border-t border-stone-800/80 bg-stone-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-400 text-xs font-mono">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Separación de categorías certificada para no mezclar audiencias</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
            >
              Cerrar Hub
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
