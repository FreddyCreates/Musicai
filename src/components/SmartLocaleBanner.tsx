import React, { useMemo } from 'react';
import { Globe, Sparkles, Clock, MapPin, Radio, Gift, Disc, Layers } from 'lucide-react';
import { AppLanguage } from '../utils/i18n';

interface SmartLocaleBannerProps {
  language: AppLanguage;
}

export const SmartLocaleBanner: React.FC<SmartLocaleBannerProps> = ({ language }) => {
  const localeInfo = useMemo(() => {
    const userLocale = typeof navigator !== 'undefined' ? navigator.language || 'en-US' : 'en-US';
    const timeZone = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' : 'UTC';
    const now = new Date();
    const hours = now.getHours();

    const isSpanishLocale = userLocale.toLowerCase().startsWith('es');
    const isFrenchLocale = userLocale.toLowerCase().startsWith('fr');
    const isGermanLocale = userLocale.toLowerCase().startsWith('de');
    const isJapaneseLocale = userLocale.toLowerCase().startsWith('ja');
    const isPortugueseLocale = userLocale.toLowerCase().startsWith('pt');

    let greeting = '';
    let newsText = '';
    let regionTag = '';

    if (isSpanishLocale || language === 'es') {
      if (hours >= 5 && hours < 12) greeting = '¡Buenos días!';
      else if (hours >= 12 && hours < 19) greeting = '¡Buenas tardes!';
      else greeting = '¡Buenas noches!';

      newsText = 'Novedades 2026: Motor de Música Universal activo. Compón en Pop, Country, Hip-Hop, Rock, Reggaeton y Corridos con tarjetas de regalo dedicadas.';
      regionTag = `Región Detectada: ${timeZone.replace('_', ' ')}`;
    } else if (isFrenchLocale) {
      greeting = hours < 18 ? 'Bonjour !' : 'Bonsoir !';
      newsText = 'Nouveautés 2026 : Studio de Musique Universelle. Composez en Pop, Hip-Hop, Country, Rock & Reggaeton.';
      regionTag = `Région : ${timeZone.replace('_', ' ')}`;
    } else if (isGermanLocale) {
      greeting = hours < 12 ? 'Guten Morgen!' : hours < 18 ? 'Guten Tag!' : 'Guten Abend!';
      newsText = 'Neu 2026: Universelles Musik-Studio. Komponieren Sie Pop, Country, Hip-Hop, Rock & Reggaeton.';
      regionTag = `Region: ${timeZone.replace('_', ' ')}`;
    } else if (isJapaneseLocale) {
      greeting = hours < 12 ? 'おはようございます！' : hours < 18 ? 'こんにちは！' : 'こんばんは！';
      newsText = '2026年最新機能: ユニバーサルAIミュージックエンジン。ポップス、ヒップホップ、カントリー、ロックの楽曲制作対応。';
      regionTag = `地域: ${timeZone.replace('_', ' ')}`;
    } else if (isPortugueseLocale) {
      greeting = hours < 12 ? 'Bom dia!' : hours < 18 ? 'Boa tarde!' : 'Boa noite!';
      newsText = 'Novidades 2026: Estúdio de Música Universal. Componha Pop, Hip-Hop, Country, Reggaeton e Rock.';
      regionTag = `Região: ${timeZone.replace('_', ' ')}`;
    } else {
      if (hours >= 5 && hours < 12) greeting = 'Good morning!';
      else if (hours >= 12 && hours < 19) greeting = 'Good afternoon!';
      else greeting = 'Good evening!';

      newsText = '2026 Platform Update: Universal AI Music Engine Active. Compose Pop, Country, Hard Trap, Rock, Reggaeton & Custom Gift Songs.';
      regionTag = `Detected Region: ${timeZone.replace('_', ' ')}`;
    }

    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      userLocale,
      timeZone,
      greeting,
      newsText,
      regionTag,
      timeString
    };
  }, [language]);

  return (
    <div className="w-full bg-gradient-to-r from-amber-950/80 via-stone-950 to-stone-900 border-b border-amber-500/40 p-3 sm:p-4 text-amber-100 shadow-xl relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Left: Greeting & Locale Detection */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-2 py-0.5 bg-amber-500 text-stone-950 font-mono font-black text-[10px] uppercase rounded flex items-center gap-1 shadow">
            <Globe className="w-3 h-3 text-stone-950" />
            {localeInfo.userLocale}
          </span>

          <h2 className="font-serif font-black text-amber-200 text-sm sm:text-base tracking-tight flex items-center gap-1.5">
            <span>{localeInfo.greeting}</span>
            <span className="text-amber-400 font-normal hidden sm:inline">|</span>
            <span className="text-stone-300 font-sans font-medium text-xs hidden sm:inline">
              Welcome to Universal AI Music Studio
            </span>
          </h2>
        </div>

        {/* Center: Live Platform News Ticker */}
        <div className="flex items-center gap-2 bg-stone-900/90 border border-amber-500/30 px-3 py-1.5 rounded-full text-[11px] font-mono text-amber-300 max-w-xl truncate">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
          <span className="truncate">{localeInfo.newsText}</span>
        </div>

        {/* Right: Timezone & Clock Badge */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-stone-400 shrink-0">
          <span className="bg-stone-900/80 border border-stone-800 px-2.5 py-1 rounded-full flex items-center gap-1">
            <MapPin className="w-3 h-3 text-amber-400" />
            <span>{localeInfo.regionTag}</span>
          </span>
          <span className="bg-amber-950/60 border border-amber-800/60 px-2 py-1 rounded-full text-amber-300 font-bold flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{localeInfo.timeString}</span>
          </span>
        </div>

      </div>
    </div>
  );
};
