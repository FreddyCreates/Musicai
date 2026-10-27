import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Sliders, Radio, Bot, Shield, Film, Megaphone, 
  CreditCard, Rocket, HelpCircle, ChevronDown, ChevronRight, Play, 
  Pause, Disc, Globe, Layers, User, Award, CheckCircle2, Search,
  Music, Languages, Video, Upload
} from 'lucide-react';
import { CorridoData, UserLicenseState } from '../types';
import { AppLanguage, translations } from '../utils/i18n';

interface EnterpriseNavbarProps {
  currentView: 'home' | 'studio' | 'instrumental' | 'library' | 'agents';
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  onNavigate: (view: 'home' | 'studio' | 'instrumental' | 'library' | 'agents') => void;
  onOpenAgentsHub: () => void;
  onOpenDistribution: () => void;
  onOpenVeoStudio: () => void;
  onOpenMarketing: () => void;
  onOpenBilling: () => void;
  onOpenChannels: () => void;
  onOpenTutorial: () => void;
  onOpenAccount: () => void;
  onOpenCustomInstrumental?: () => void;
  activeSong?: CorridoData | null;
  licenseState: UserLicenseState;
  userProfile?: { artistName: string; genre: string } | null;
}

export const EnterpriseNavbar: React.FC<EnterpriseNavbarProps> = ({
  currentView,
  language,
  onLanguageChange,
  onNavigate,
  onOpenAgentsHub,
  onOpenDistribution,
  onOpenVeoStudio,
  onOpenMarketing,
  onOpenBilling,
  onOpenChannels,
  onOpenTutorial,
  onOpenAccount,
  onOpenCustomInstrumental,
  activeSong,
  licenseState,
  userProfile
}) => {
  const t = translations[language];
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement | null>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target as Node)) {
        setIsToolsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0c0d12]/95 border-b border-[#222736] backdrop-blur-md shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        
        {/* Brand & Studio Identity */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/40 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-stone-950 font-black" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-black text-stone-100 text-lg sm:text-xl tracking-wider uppercase group-hover:text-amber-400 transition-colors">
                  MELODY <span className="text-amber-500">CRAFT</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-600/40 uppercase">
                  PRO 2026
                </span>
              </div>
              <p className="text-[10px] text-stone-400 -mt-1 font-mono hidden md:block">
                {t.brandTagline}
              </p>
            </div>
          </button>
        </div>

        {/* SINGLE UNIFIED PRIMARY NAVIGATION BAR */}
        <nav className="hidden md:flex items-center gap-1 bg-[#141721] p-1 rounded-xl border border-[#272d3d] shadow-inner">
          
          {/* 0. Home Creator */}
          <button
            onClick={() => onNavigate('home')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'home'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Home' : 'Inicio'}</span>
          </button>

          {/* 1. Studio DAW */}
          <button
            onClick={() => onNavigate('studio')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'studio'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{t.navStudio}</span>
          </button>

          {/* 2. Instrumental Lab */}
          <button
            onClick={() => onNavigate('instrumental')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'instrumental'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t.navInstrumentalLab}</span>
          </button>

          {/* 3. Music Library */}
          <button
            onClick={() => onNavigate('library')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'library'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>{t.navLibrary}</span>
          </button>

          {/* 4. Veo 4K Cinema Video Studio */}
          <button
            onClick={onOpenVeoStudio}
            className="px-3 py-1.5 rounded-lg text-xs font-serif font-bold uppercase tracking-wider text-cyan-300 hover:text-cyan-100 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/50 flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
            title="Generador de Videos Musicales Cinematográficos en 4K"
          >
            <Film className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'en' ? 'Veo 4K Video' : 'Video 4K'}</span>
          </button>

          {/* 5. Digital Artist (First-Class Tab) */}
          <button
            onClick={() => onNavigate('agents')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              currentView === 'agents'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'text-amber-300 hover:text-white hover:bg-stone-800/60 border border-amber-500/40'
            }`}
            title="Bóvedas de Artistas Digitales Autónomos (.MD)"
          >
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'en' ? 'Digital Artist' : 'Artista Digital'}</span>
          </button>

          {/* Import User's Own Instrumental Track */}
          {onOpenCustomInstrumental && (
            <button
              onClick={onOpenCustomInstrumental}
              className="px-3 py-1.5 rounded-lg text-xs font-serif font-bold uppercase tracking-wider text-emerald-300 hover:text-emerald-100 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
              title="Trae tus propias pistas instrumentales o beats para trabajar con el studio"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'en' ? 'My Beats' : 'Subir Beat'}</span>
            </button>
          )}

          {/* 4. More Pro Modules Dropdown */}
          <div className="relative" ref={toolsMenuRef}>
            <button
              onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
              className="px-3 py-1.5 rounded-lg text-xs font-serif font-bold uppercase tracking-wider text-stone-300 hover:text-amber-300 hover:bg-stone-800/60 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>{t.navModules}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isToolsMenuOpen ? 'rotate-180 text-amber-400' : ''}`} />
            </button>

            {isToolsMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#11141c] border border-[#2c3345] rounded-xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-fadeIn space-y-1">
                {onOpenCustomInstrumental && (
                  <button
                    onClick={() => {
                      setIsToolsMenuOpen(false);
                      onOpenCustomInstrumental();
                    }}
                    className="w-full p-2 rounded-lg text-left text-xs text-stone-200 hover:bg-stone-800/80 hover:text-amber-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-bold">{language === 'en' ? 'Bring Your Own Beat' : 'Subir Instrumental Propia'}</div>
                      <div className="text-[10px] text-stone-400">MP3 / WAV / Mic Vocal Studio</div>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsToolsMenuOpen(false);
                    onOpenAgentsHub();
                  }}
                  className="w-full p-2 rounded-lg text-left text-xs text-stone-200 hover:bg-stone-800/80 hover:text-amber-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Bot className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="font-bold">{t.navAgentsHub}</div>
                    <div className="text-[10px] text-stone-400">AI Producer Band & Memory</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsToolsMenuOpen(false);
                    onOpenDistribution();
                  }}
                  className="w-full p-2 rounded-lg text-left text-xs text-stone-200 hover:bg-stone-800/80 hover:text-emerald-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-bold">{t.navDistribution}</div>
                    <div className="text-[10px] text-stone-400">DDEX ERN 4.2 / Spotify / Apple</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsToolsMenuOpen(false);
                    onOpenVeoStudio();
                  }}
                  className="w-full p-2 rounded-lg text-left text-xs text-stone-200 hover:bg-stone-800/80 hover:text-cyan-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Film className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="font-bold">{t.navVeoCinema}</div>
                    <div className="text-[10px] text-stone-400">Cinematic 4K Music Videos</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsToolsMenuOpen(false);
                    onOpenMarketing();
                  }}
                  className="w-full p-2 rounded-lg text-left text-xs text-stone-200 hover:bg-stone-800/80 hover:text-violet-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Megaphone className="w-4 h-4 text-violet-400" />
                  <div>
                    <div className="font-bold">{t.navMarketing}</div>
                    <div className="text-[10px] text-stone-400">Genre Separation & Pitching</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Right Side: Language Switcher, Credits, Account, and Compose CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* LANGUAGE SWITCHER BUTTON (EN / ES) */}
          <div className="flex items-center bg-[#141721] p-0.5 rounded-lg border border-[#272d3d]">
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Switch to English"
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('es')}
              className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                language === 'es'
                  ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Cambiar a Español"
            >
              ES
            </button>
          </div>

          {/* Quick Tutorial */}
          <button
            onClick={onOpenTutorial}
            title={t.tutorialButton}
            className="p-2 text-stone-400 hover:text-amber-300 hover:bg-stone-900 rounded-lg transition-colors cursor-pointer hidden sm:block"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Credits Balance Pill */}
          <button
            onClick={onOpenBilling}
            className="px-2.5 py-1 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-600/40 rounded-lg flex items-center gap-1.5 text-xs font-mono text-amber-300 transition-all cursor-pointer"
            title="Commercial Master Credits"
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold">{licenseState.masterCredits} {t.creditsLabel}</span>
          </button>

          {/* User Account / Profile */}
          <button
            onClick={onOpenAccount}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              userProfile?.artistName
                ? 'bg-[#181d2a] hover:bg-[#202738] border-amber-500/50 text-amber-300'
                : 'bg-gradient-to-r from-amber-950/60 to-stone-900 hover:from-amber-900/60 border-amber-600/40 text-stone-200 hover:text-white'
            }`}
            title={userProfile?.artistName ? `Artist Account: ${userProfile.artistName}` : 'Create Account / Sign In (+5 Bonus Master Credits)'}
          >
            {userProfile?.artistName ? (
              <>
                <span className="text-sm">{userProfile.avatar || '🤠'}</span>
                <span className="font-serif font-bold text-xs truncate max-w-[100px]">{userProfile.artistName}</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-serif font-bold text-xs uppercase hidden sm:inline text-amber-200">
                  {language === 'en' ? 'Account' : 'Cuenta'}
                </span>
                <span className="px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  +5
                </span>
              </>
            )}
          </button>

          {/* New Track / Compose CTA */}
          <button
            onClick={() => onNavigate('home')}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-stone-950 font-serif font-black text-xs uppercase tracking-wider rounded-lg shadow-lg flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.newTrack}</span>
          </button>

        </div>

      </div>
    </header>
  );
};
