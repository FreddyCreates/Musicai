import React from 'react';
import { 
  Sparkles, Sliders, Disc, Bot, Globe, Play, Pause, ChevronUp, Music
} from 'lucide-react';
import { CorridoData } from '../types';
import { AppLanguage } from '../utils/i18n';

interface MobileBottomNavProps {
  currentView: 'home' | 'studio' | 'instrumental' | 'library' | 'agents';
  language: AppLanguage;
  onNavigate: (view: 'home' | 'studio' | 'instrumental' | 'library' | 'agents') => void;
  onOpenDistribution: () => void;
  activeSong?: CorridoData | null;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  language,
  onNavigate,
  onOpenDistribution,
  activeSong,
  isPlaying = false,
  onTogglePlay
}) => {
  const isEn = language === 'en';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-auto">
      {/* Mini Audio Player Bar (when active song exists) */}
      {activeSong && (
        <div className="bg-[#121520]/95 backdrop-blur-md border-t border-amber-500/30 px-3 py-2 flex items-center justify-between gap-3 shadow-2xl max-w-lg mx-auto sm:rounded-t-2xl">
          <div 
            onClick={() => onNavigate('studio')}
            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 overflow-hidden flex items-center justify-center shrink-0 relative">
              {activeSong.imageUrl ? (
                <img src={activeSong.imageUrl} alt={activeSong.title} className="w-full h-full object-cover" />
              ) : (
                <Music className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                <span className="font-bold truncate">{activeSong.tempo || '142 BPM'}</span>
                <span className="text-stone-500">·</span>
                <span className="truncate">{activeSong.musicalKey || 'G'}</span>
              </div>
              <p className="font-serif text-xs font-bold text-stone-100 truncate group-hover:text-amber-300 transition-colors">
                {activeSong.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onTogglePlay && (
              <button
                type="button"
                onClick={onTogglePlay}
                className="w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg cursor-pointer transition-transform active:scale-95"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigate('studio')}
              className="p-2 bg-stone-900 border border-stone-800 text-stone-300 hover:text-amber-300 rounded-xl cursor-pointer"
              title="Open Studio DAW"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Bottom Navigation Bar */}
      <nav className="bg-[#0a0b10]/98 backdrop-blur-xl border-t border-[#1c2232] px-2 py-2 flex items-center justify-around max-w-lg mx-auto shadow-2xl safe-area-bottom">
        
        {/* Tab 1: Create */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl min-w-[60px] min-h-[44px] transition-all cursor-pointer ${
            currentView === 'home'
              ? 'text-amber-400 bg-amber-500/10 font-bold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sparkles className={`w-5 h-5 ${currentView === 'home' ? 'text-amber-400 scale-110' : 'text-stone-400'}`} />
          <span className="text-[10px] font-mono tracking-tight mt-0.5">
            {isEn ? 'Create' : 'Crear'}
          </span>
        </button>

        {/* Tab 2: Studio DAW */}
        <button
          type="button"
          onClick={() => onNavigate('studio')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl min-w-[60px] min-h-[44px] transition-all cursor-pointer ${
            currentView === 'studio' || currentView === 'instrumental'
              ? 'text-amber-400 bg-amber-500/10 font-bold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sliders className={`w-5 h-5 ${currentView === 'studio' || currentView === 'instrumental' ? 'text-amber-400 scale-110' : 'text-stone-400'}`} />
          <span className="text-[10px] font-mono tracking-tight mt-0.5">
            {isEn ? 'Studio DAW' : 'Estudio'}
          </span>
        </button>

        {/* Tab 3: Library / Vault */}
        <button
          type="button"
          onClick={() => onNavigate('library')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl min-w-[60px] min-h-[44px] transition-all cursor-pointer ${
            currentView === 'library'
              ? 'text-amber-400 bg-amber-500/10 font-bold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Disc className={`w-5 h-5 ${currentView === 'library' ? 'text-amber-400 scale-110' : 'text-stone-400'}`} />
          <span className="text-[10px] font-mono tracking-tight mt-0.5">
            {isEn ? 'Library' : 'Catálogo'}
          </span>
        </button>

        {/* Tab 4: Copilots */}
        <button
          type="button"
          onClick={() => onNavigate('agents')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl min-w-[60px] min-h-[44px] transition-all cursor-pointer ${
            currentView === 'agents'
              ? 'text-cyan-400 bg-cyan-500/10 font-bold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Bot className={`w-5 h-5 ${currentView === 'agents' ? 'text-cyan-400 scale-110' : 'text-stone-400'}`} />
          <span className="text-[10px] font-mono tracking-tight mt-0.5">
            {isEn ? 'Copilots' : 'Copilotos'}
          </span>
        </button>

        {/* Tab 5: Distro */}
        <button
          type="button"
          onClick={onOpenDistribution}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl min-w-[60px] min-h-[44px] transition-all cursor-pointer text-stone-400 hover:text-stone-200"
        >
          <Globe className="w-5 h-5 text-emerald-400" />
          <span className="text-[10px] font-mono tracking-tight mt-0.5">
            {isEn ? 'Distro' : 'Distribuir'}
          </span>
        </button>

      </nav>
    </div>
  );
};
