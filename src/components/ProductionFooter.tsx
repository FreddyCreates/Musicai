import React from 'react';
import { AppLanguage, translations } from '../utils/i18n';
import { Sparkles, Shield, Globe, Award, Radio } from 'lucide-react';

interface ProductionFooterProps {
  language: AppLanguage;
  onNavigate?: (tab: string) => void;
}

export const ProductionFooter: React.FC<ProductionFooterProps> = ({ language, onNavigate }) => {
  const t = translations[language];
  const isEn = language === 'en';

  return (
    <footer className="w-full bg-[#05070B] border-t border-blue-950/60 text-stone-400 py-12 px-6 mt-16 shadow-2xl relative overflow-hidden">
      {/* Background Neon Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 relative z-10">
        
        {/* Brand Column */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white shadow-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-serif font-black text-stone-100 text-base tracking-wider uppercase">
              {t.brandName}
            </span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed font-sans">
            {t.brandTagline}
          </p>
          <div className="flex items-center gap-2 pt-2 text-[11px] font-mono text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>{isEn ? 'System Online • Neural Audio Engine v4.2' : 'Sistema en Línea • Motor Neural v4.2'}</span>
          </div>
        </div>

        {/* Navigation Modules Column */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-stone-200 text-xs uppercase tracking-widest text-blue-400">
            {t.navModules}
          </h4>
          <ul className="space-y-2 text-xs font-sans">
            <li>
              <button 
                onClick={() => onNavigate && onNavigate('studio')}
                className="hover:text-blue-300 transition-colors cursor-pointer text-left"
              >
                {t.navStudio}
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate && onNavigate('instrumentalLab')}
                className="hover:text-blue-300 transition-colors cursor-pointer text-left"
              >
                {t.navInstrumentalLab}
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate && onNavigate('library')}
                className="hover:text-blue-300 transition-colors cursor-pointer text-left"
              >
                {t.navLibrary}
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate && onNavigate('veo')}
                className="hover:text-blue-300 transition-colors cursor-pointer text-left"
              >
                {t.navVeoCinema}
              </button>
            </li>
          </ul>
        </div>

        {/* Enterprise & Distribution Column */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-stone-200 text-xs uppercase tracking-widest text-violet-400">
            {isEn ? 'Commercial & DDEX' : 'Comercial & DDEX'}
          </h4>
          <ul className="space-y-2 text-xs font-sans">
            <li>
              <button 
                onClick={() => onNavigate && onNavigate('distribution')}
                className="hover:text-violet-300 transition-colors cursor-pointer text-left"
              >
                {t.navDistribution}
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate && onNavigate('agentsHub')}
                className="hover:text-violet-300 transition-colors cursor-pointer text-left"
              >
                {t.navAgentsHub}
              </button>
            </li>
            <li>
              <span className="text-stone-500">{t.commercialTier}</span>
            </li>
          </ul>
        </div>

        {/* Security & Compliance Column */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-stone-200 text-xs uppercase tracking-widest text-cyan-400">
            {isEn ? 'Security & Royalty Rights' : 'Seguridad y Derechos'}
          </h4>
          <p className="text-xs text-stone-400 leading-relaxed">
            {isEn 
              ? 'All generated master audio and stems are 100% royalty-free with full commercial clearance for Spotify, Apple Music, and broadcast.' 
              : 'Todos los audios y stems generados son 100% libres de regalías con autorización comercial completa para Spotify y Apple Music.'}
          </p>
          <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-stone-400">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>ISRC & UPC Automated Generator</span>
          </div>
        </div>

      </div>

      {/* Bottom Legal / Copyright Bar */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-blue-950/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-stone-400 relative z-10">
        <div>
          © {new Date().getFullYear()} MelodyCraft Pro / Medina Tech Dallas & Miami. {isEn ? 'All rights reserved.' : 'Todos los derechos reservados.'}
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>{isEn ? 'Server Status: Operational' : 'Estado del Servidor: Operacional'}</span>
          <span>•</span>
          <span>{isEn ? 'Latency: 12ms' : 'Latencia: 12ms'}</span>
          <span>•</span>
          <span className="text-blue-400">Midnight & Neon Architecture</span>
        </div>
      </div>
    </footer>
  );
};
