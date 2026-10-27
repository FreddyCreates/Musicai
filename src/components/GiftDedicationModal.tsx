import React, { useState, useRef } from 'react';
import { Gift, Heart, Sparkles, Share2, Download, Printer, Copy, Check, QrCode, Play, Pause, Music, Disc, Award, User, X, Globe } from 'lucide-react';

export interface GiftDedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  songTitle: string;
  senderName?: string;
  recipientName?: string;
  occasion?: string;
  dedicationNote?: string;
  audioUrl?: string | null;
  lyrics?: any[];
  style?: string;
  songHash?: string;
  initialLanguage?: 'en' | 'es';
}

export const GiftDedicationModal: React.FC<GiftDedicationModalProps> = ({
  isOpen,
  onClose,
  songTitle,
  senderName,
  recipientName,
  occasion,
  dedicationNote,
  audioUrl,
  lyrics = [],
  style = 'Universal Custom Song',
  songHash,
  initialLanguage = 'en'
}) => {
  const [cardLang, setCardLang] = useState<'en' | 'es'>(initialLanguage);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!isOpen) return null;

  const isEn = cardLang === 'en';

  const defaultSender = senderName || (isEn ? 'A Special Friend' : 'Tu Amigo Especial');
  const defaultRecipient = recipientName || (isEn ? 'For Someone Special' : 'Para Alguien Especial');
  const defaultOccasion = occasion || (isEn ? 'A Personalized Musical Gift' : 'Un Regalo Musical Inolvidable');
  const defaultNote = dedicationNote || (isEn
    ? 'This song was custom crafted especially for you, celebrating your journey, memories, and all the moments we share.'
    : 'Esta canción fue creada exclusivamente para ti, para celebrar tu vida, tus logros y todos los momentos que compartimos.');

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleCopyLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(`${currentUrl}?gift=${encodeURIComponent(songTitle)}&for=${encodeURIComponent(defaultRecipient)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const formattedLyricsText = Array.isArray(lyrics)
    ? lyrics.map((item) => (typeof item === 'string' ? item : item?.text || '')).filter(Boolean).join('\n\n')
    : typeof lyrics === 'string'
    ? lyrics
    : '';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-stone-950 border border-amber-500/70 shadow-2xl shadow-amber-950/80 w-full max-w-2xl rounded-none relative text-amber-50 overflow-hidden my-auto">
        
        {/* Glowing Gold Banner Header */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-500 to-amber-800 p-4 sm:p-5 flex items-center justify-between border-b border-amber-400/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-stone-950/80 border border-amber-300 rounded-full flex items-center justify-center shadow-lg">
              <Gift className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-stone-900 uppercase bg-amber-300/90 px-2 py-0.5">
                {isEn ? 'EXCLUSIVE MUSICAL GIFT' : 'REGALO MUSICAL EXCLUSIVO'}
              </span>
              <h3 className="font-serif font-black text-stone-950 text-lg sm:text-xl uppercase tracking-tight leading-none mt-1">
                {isEn ? 'Personal Dedication Card' : 'Tarjeta de Dedicatoria Personal'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Card Language Selector Switcher */}
            <div className="flex items-center bg-stone-950/80 p-1 border border-amber-300/40 rounded">
              <button
                type="button"
                onClick={() => setCardLang('en')}
                className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                  isEn ? 'bg-amber-400 text-stone-950' : 'text-amber-200 hover:text-white'
                }`}
              >
                🇺🇸 EN
              </button>
              <button
                type="button"
                onClick={() => setCardLang('es')}
                className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                  !isEn ? 'bg-amber-400 text-stone-950' : 'text-amber-200 hover:text-white'
                }`}
              >
                🇲🇽 ES
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 bg-stone-950/60 hover:bg-stone-950 text-amber-200 rounded-full flex items-center justify-center transition-all border border-amber-400/40"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate / Dedication Sleeve Body */}
        <div className="p-5 sm:p-8 space-y-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/30 via-stone-950 to-stone-950">
          
          {/* Main Dedication Header Frame */}
          <div className="border-2 border-dashed border-amber-500/40 p-5 bg-stone-900/80 text-center space-y-3 relative">
            <div className="absolute top-2 left-2 text-amber-500/30"><Sparkles className="w-5 h-5" /></div>
            <div className="absolute bottom-2 right-2 text-amber-500/30"><Heart className="w-5 h-5" /></div>

            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block font-bold">
              ✦ {defaultOccasion} ✦
            </span>

            <h2 className="font-serif font-black text-2xl sm:text-3xl text-amber-200 tracking-tight leading-tight">
              "{songTitle}"
            </h2>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs font-mono">
              <span className="bg-amber-950/80 text-amber-300 px-3 py-1 border border-amber-700/60 font-bold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" /> {isEn ? 'FOR:' : 'PARA:'} <strong className="text-amber-100">{defaultRecipient}</strong>
              </span>
              <span className="bg-stone-800 text-amber-200 px-3 py-1 border border-stone-700 font-bold flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400" /> {isEn ? 'FROM:' : 'DE:'} <strong className="text-amber-100">{defaultSender}</strong>
              </span>
            </div>

            {/* Dedication Message */}
            <div className="p-3 bg-stone-950/70 border border-amber-500/30 text-amber-100/90 text-sm italic font-serif leading-relaxed mt-3">
              "{defaultNote}"
            </div>
          </div>

          {/* Interactive Player Section */}
          {audioUrl ? (
            <div className="bg-gradient-to-r from-stone-900 via-stone-900/90 to-amber-950/40 border border-amber-500/50 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-amber-300">
                <span className="flex items-center gap-1.5 font-bold">
                  <Disc className={`w-4 h-4 text-amber-400 ${isPlaying ? 'animate-spin' : ''}`} />
                  {isEn ? 'Play Special Gift Song' : 'Escuchar Canción Especial'}
                </span>
                <span className="text-[10px] text-stone-400">{style}</span>
              </div>

              <div className="flex items-center gap-4 bg-stone-950/90 p-3 border border-stone-800">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-12 h-12 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-full flex items-center justify-center transition-all shadow-lg shadow-amber-500/30 shrink-0 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-6 h-6 fill-stone-950" /> : <Play className="w-6 h-6 fill-stone-950 ml-0.5" />}
                </button>
                <div className="grow space-y-1">
                  <p className="text-xs font-bold font-serif text-amber-200 truncate">{songTitle}</p>
                  <p className="text-[11px] font-mono text-stone-400">
                    {isEn ? `Custom crafted for ${defaultRecipient}` : `Dedicada exclusivamente para ${defaultRecipient}`}
                  </p>
                </div>
                <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-950/30 border border-amber-800/40 text-amber-300/80 text-xs font-mono text-center">
              🎵 {isEn ? 'Audio track will be ready upon master production completion.' : 'La pista de audio estará disponible inmediatamente al finalizar la producción.'}
            </div>
          )}

          {/* Lyrics Preview Sleeve */}
          {formattedLyricsText && (
            <div className="space-y-2">
              <h4 className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5" /> {isEn ? 'Official Lyrics Dedication Sheet' : 'Letra Oficial de la Dedicatoria'}
              </h4>
              <div className="p-4 bg-stone-900/90 border border-stone-800 text-stone-300 text-xs font-serif leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line custom-scrollbar">
                {formattedLyricsText}
              </div>
            </div>
          )}

          {/* Certificate Footer & Share Actions */}
          <div className="border-t border-stone-800 pt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-[10px] font-mono text-stone-300 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? 'Musical Gift Certificate' : 'Certificado de Regalo Musical'} #{songHash || '2026-GIFT'}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-amber-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-amber-400" />}
                {copied ? (isEn ? 'Link Copied!' : '¡Enlace Copiado!') : (isEn ? 'Share Gift Card' : 'Compartir Regalo')}
              </button>

              {audioUrl && (
                <a
                  href={audioUrl}
                  download={`${songTitle.replace(/\s+/g, '_')}_Dedication.mp3`}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md"
                >
                  <Download className="w-3.5 h-3.5" /> {isEn ? 'Download Audio' : 'Descargar Audio'}
                </a>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
