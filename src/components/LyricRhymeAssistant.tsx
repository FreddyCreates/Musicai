import React, { useState, useEffect } from 'react';
import { Sparkles, Copy, Check, X, RefreshCw, Music, BookOpen, Volume2, ArrowRight, CornerDownLeft, Feather, Mic, Flame, Shield, Zap, Layers, Globe } from 'lucide-react';
import { RhymeSuggestionResponse, RhymeWordItem, MultisyllabicRhymeItem, RapperPersona, RapperPersonaId } from '../types';

export const RAPPER_PERSONAS: RapperPersona[] = [
  {
    id: 'houston_og',
    name: 'Houston Street OG',
    tagline: '713 Southside / UGK & Z-Ro Vibe',
    icon: '👑',
    cadenceDescription: 'Slow, heavy, laid-back cadence with punchy end-rhymes and deep Texas slang',
    rhymeFocus: '3-Syllable multi-rhymes & southern hustle metaphors',
    sampleArtistRef: 'UGK / Z-Ro / Trae tha Truth',
    color: 'amber'
  },
  {
    id: 'dark_trap',
    name: 'Dark Trap & 808s',
    tagline: 'Metro Boomin / 21 Savage / Future',
    icon: '⚡',
    cadenceDescription: 'Cinematic, menacing, cold monotone flow over booming 808 slides',
    rhymeFocus: 'Syllabic stacks on the 4th beat & street reality punchlines',
    sampleArtistRef: '21 Savage / Metro / Future',
    color: 'red'
  },
  {
    id: 'rap_corrido',
    name: 'Rap Corrido Callejero',
    tagline: 'Santa Fe Klan / Alemán Flow',
    icon: '🔥',
    cadenceDescription: 'Rimas crudas del barrio con acordeón y compás urbano mexicano',
    rhymeFocus: 'Rimas consonantes de calle, lealtad y superación',
    sampleArtistRef: 'Santa Fe Klan / Alemán / Millonario',
    color: 'emerald'
  },
  {
    id: 'belico_tumbado',
    name: 'Bélico Tumbado',
    tagline: 'Peso Pluma / Tito Double P / Natanael Cano',
    icon: '⚔️',
    cadenceDescription: 'Flow bélico acelerado con requinto tumbado y metales de banda',
    rhymeFocus: 'Octosílabos en rima asonante con claves y corridos de guerra',
    sampleArtistRef: 'Peso Pluma / Tito Double P / Luis R Conriquez',
    color: 'amber'
  },
  {
    id: 'latin_trap',
    name: 'Latin Trap & Drill',
    tagline: 'Eladio Carrión / Anuel AA / Myke Towers',
    icon: '💎',
    cadenceDescription: 'Flow técnico bilingüe, barras complejas y rimas multis con swag',
    rhymeFocus: '4-Syllable internal multirhymes & Spanglish punchlines',
    sampleArtistRef: 'Eladio Carrión / Anuel AA / Myke Towers',
    color: 'purple'
  },
  {
    id: 'lyricist_flow',
    name: 'Technical Multi Lyricist',
    tagline: 'Eminem / Big Pun / Joyner Lucas',
    icon: '🎯',
    cadenceDescription: 'High-density multisyllabic rhyme schemes, internal chaining, and breath control',
    rhymeFocus: 'Quad and quintuple syllable stacking & rhyme bending',
    sampleArtistRef: 'Big Pun / Eminem / Big L',
    color: 'blue'
  },
  {
    id: 'melodic_sierreno',
    name: 'Melodic Sierreño & Sad Corrido',
    tagline: 'Junior H / Eslabón Armado / Gabito',
    icon: '🎸',
    cadenceDescription: 'Voz nostálgica y melódica sobre guitarras de 12 cuerdas y tololoche',
    rhymeFocus: 'Rimas sentimentales de desamor, superación y memoria',
    sampleArtistRef: 'Junior H / Eslabón Armado',
    color: 'rose'
  },
  {
    id: 'west_coast',
    name: 'West Coast Bounce',
    tagline: 'Snoop / YG / DJ Quik G-Funk',
    icon: '🌴',
    cadenceDescription: 'Smooth sliding bounce with syncopated pocket delivery and gangsta funk',
    rhymeFocus: 'Bouncing couplets and smooth rolling multi-rhymes',
    sampleArtistRef: 'Snoop Dogg / YG / Ice Cube',
    color: 'cyan'
  }
];

interface LyricRhymeAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  targetWord: string;
  selectedLine?: string;
  songTitle?: string;
  style?: string;
  storySummary?: string;
  initialLanguage?: 'en' | 'es' | 'spanglish';
  initialPersona?: RapperPersonaId;
  onSelectRhyme: (wordOrPhrase: string) => void;
  onInsertLine?: (completedLine: string) => void;
}

export const LyricRhymeAssistant: React.FC<LyricRhymeAssistantProps> = ({
  isOpen,
  onClose,
  targetWord: initialTargetWord,
  selectedLine = '',
  songTitle = 'Song Master',
  style = 'Rap / Corrido',
  storySummary = '',
  initialLanguage = 'es',
  initialPersona = 'houston_og',
  onSelectRhyme,
  onInsertLine,
}) => {
  const [currentWord, setCurrentWord] = useState(initialTargetWord);
  const [customInput, setCustomInput] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<RapperPersonaId>(initialPersona);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'es' | 'spanglish'>(initialLanguage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rhymeData, setRhymeData] = useState<RhymeSuggestionResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'multisyllabic' | 'consonant' | 'assonant' | 'internal' | 'punchlines'>('multisyllabic');
  const [copiedWord, setCopiedWord] = useState<string | null>(null);

  // Sync with prop when opened or changed
  useEffect(() => {
    if (initialTargetWord) {
      setCurrentWord(initialTargetWord);
      setCustomInput(initialTargetWord);
      fetchRhymes(initialTargetWord, selectedLine, selectedPersona, selectedLanguage);
    }
  }, [initialTargetWord, isOpen]);

  const fetchRhymes = async (
    wordToQuery: string,
    lineContext: string,
    personaId: RapperPersonaId = selectedPersona,
    lang: 'en' | 'es' | 'spanglish' = selectedLanguage
  ) => {
    const cleanWord = wordToQuery.replace(/[.,;:!?¡¿"'\-–—()]/g, '').trim();
    if (!cleanWord) return;

    setIsLoading(true);
    setError(null);

    const activePersonaObj = RAPPER_PERSONAS.find(p => p.id === personaId);

    try {
      const response = await fetch('/api/suggest-rhymes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: cleanWord,
          line: lineContext,
          songTitle,
          style,
          storySummary,
          rapperPersona: activePersonaObj ? `${activePersonaObj.name} (${activePersonaObj.tagline})` : 'Houston Street OG',
          primaryLanguage: lang,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error del servidor (${response.status})`);
      }

      const data: RhymeSuggestionResponse = await response.json();
      setRhymeData(data);
    } catch (err: any) {
      console.error('Error fetching rhymes:', err);
      setError('No se pudieron cargar las rimas. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchCustomWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      setCurrentWord(customInput.trim());
      fetchRhymes(customInput.trim(), selectedLine, selectedPersona, selectedLanguage);
    }
  };

  const handlePersonaChange = (newPersona: RapperPersonaId) => {
    setSelectedPersona(newPersona);
    // Auto adapt language if persona strongly implies one
    let newLang = selectedLanguage;
    if (newPersona === 'houston_og' || newPersona === 'dark_trap' || newPersona === 'lyricist_flow' || newPersona === 'west_coast') {
      if (selectedLanguage === 'es') newLang = 'en';
    } else if (newPersona === 'belico_tumbado' || newPersona === 'melodic_sierreno' || newPersona === 'rap_corrido') {
      if (selectedLanguage === 'en') newLang = 'es';
    }
    setSelectedLanguage(newLang);
    fetchRhymes(currentWord || customInput, selectedLine, newPersona, newLang);
  };

  const handleLanguageChange = (newLang: 'en' | 'es' | 'spanglish') => {
    setSelectedLanguage(newLang);
    fetchRhymes(currentWord || customInput, selectedLine, selectedPersona, newLang);
  };

  const handleCopyWord = (word: string) => {
    navigator.clipboard.writeText(word);
    setCopiedWord(word);
    setTimeout(() => setCopiedWord(null), 2000);
  };

  if (!isOpen) return null;

  const totalMultis = rhymeData?.multisyllabic?.length || 0;
  const totalConsonants = rhymeData?.consonant?.length || 0;
  const totalAssonants = rhymeData?.assonant?.length || 0;
  const totalInternals = rhymeData?.internalRhymes?.length || 0;
  const totalPunchlines = (rhymeData?.punchlineBars?.length || 0) + (rhymeData?.popularPhrases?.length || 0);

  const activePersonaConfig = RAPPER_PERSONAS.find(p => p.id === selectedPersona) || RAPPER_PERSONAS[0];

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6">
      <div
        id="ai-rhyme-finder-modal"
        className="w-full max-w-4xl bg-stone-900 border-2 border-amber-500/70 shadow-2xl rounded-none text-stone-100 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="bg-stone-950 px-5 py-4 border-b border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-black text-amber-300 text-base md:text-lg uppercase tracking-wider">
                  AI Rhyme Finder & Multi-Syllabic Flow
                </h3>
                <span className="text-[10px] px-2 py-0.5 bg-amber-500 text-stone-950 font-black uppercase tracking-wider">
                  GEMINI 3.8
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Multi-syllable rhyme stacks, internal cadences & punchline bars tailored to your persona
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-amber-400 hover:bg-stone-800 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persona Selector & Language Controls */}
        <div className="bg-stone-950/90 p-4 border-b border-stone-800 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Persona Quick Selector */}
            <div className="flex-1 min-w-[280px]">
              <label className="block text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5" /> Rapper & Artist Persona Style:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {RAPPER_PERSONAS.map((p) => {
                  const isSelected = selectedPersona === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handlePersonaChange(p.id)}
                      className={`p-2 text-left border transition-all text-xs cursor-pointer ${
                        isSelected
                          ? 'bg-amber-950/70 border-amber-500 text-amber-200 shadow-md ring-1 ring-amber-500'
                          : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        <span>{p.icon}</span>
                        <span className="truncate">{p.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Language Switcher */}
            <div className="shrink-0">
              <label className="block text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Primary Language:
              </label>
              <div className="inline-flex bg-stone-900 border border-stone-800 p-0.5">
                {[
                  { id: 'en', label: 'English' },
                  { id: 'es', label: 'Español' },
                  { id: 'spanglish', label: 'Spanglish' },
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => handleLanguageChange(l.id as any)}
                    className={`px-3 py-1.5 text-xs font-bold uppercase transition-all cursor-pointer ${
                      selectedLanguage === l.id
                        ? 'bg-amber-600 text-stone-950 font-black shadow'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Persona Banner */}
          <div className="bg-amber-950/30 border border-amber-900/40 p-2.5 flex items-center justify-between text-xs text-stone-300">
            <div className="flex items-center gap-2">
              <span className="text-base">{activePersonaConfig.icon}</span>
              <div>
                <span className="font-bold text-amber-300">{activePersonaConfig.name}:</span>{' '}
                <span className="text-stone-300">{activePersonaConfig.cadenceDescription}</span>
              </div>
            </div>
            <span className="hidden md:inline text-[10px] px-2 py-0.5 bg-stone-900 text-amber-400 font-mono border border-stone-800">
              Ref: {activePersonaConfig.sampleArtistRef}
            </span>
          </div>

          {/* Reference Line & Search Bar */}
          {selectedLine && (
            <div className="text-xs text-stone-300 bg-stone-900/90 border border-amber-900/30 p-2.5 rounded-none flex items-start gap-2">
              <Feather className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 block mb-0.5">
                  Línea de Referencia Actual:
                </span>
                <span className="italic font-serif text-amber-100 text-sm">
                  "{selectedLine}"
                </span>
              </div>
            </div>
          )}

          {/* Search/Change Target Word */}
          <form onSubmit={handleSearchCustomWord} className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="rhyme-search-input"
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Escribe o cambia la palabra/frase objetivo para rimar..."
                className="w-full bg-stone-950 border border-stone-700 focus:border-amber-500 px-3 py-2 text-sm text-amber-200 placeholder-stone-500 outline-none font-serif"
              />
              {currentWord && (
                <span className="absolute right-3 top-2.5 text-[11px] font-mono text-amber-500/80">
                  Rimar con: <strong>"{currentWord}"</strong>
                </span>
              )}
            </div>
            <button
              id="btn-search-rhyme"
              type="submit"
              disabled={isLoading || !customInput.trim()}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-serif font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shrink-0 shadow-md"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{isLoading ? 'Calculando...' : 'Buscar Rimas'}</span>
            </button>
          </form>

          {rhymeData?.rhymeTypeDescription && (
            <p className="text-[11px] text-amber-400/90 italic flex items-center gap-1.5">
              <span>🎯</span> {rhymeData.rhymeTypeDescription}
            </p>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-800 bg-stone-950 px-4 overflow-x-auto custom-scrollbar">
          <button
            id="tab-multisyllabic-rhymes"
            onClick={() => setActiveTab('multisyllabic')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 cursor-pointer transition-colors shrink-0 ${
              activeTab === 'multisyllabic'
                ? 'border-amber-500 text-amber-400 bg-stone-900 font-black'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            Multi-Silábicas ({totalMultis})
          </button>

          <button
            id="tab-consonant-rhymes"
            onClick={() => setActiveTab('consonant')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 cursor-pointer transition-colors shrink-0 ${
              activeTab === 'consonant'
                ? 'border-amber-500 text-amber-400 bg-stone-900 font-black'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Rimas Consonantes ({totalConsonants})
          </button>

          <button
            id="tab-assonant-rhymes"
            onClick={() => setActiveTab('assonant')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 cursor-pointer transition-colors shrink-0 ${
              activeTab === 'assonant'
                ? 'border-amber-500 text-amber-400 bg-stone-900 font-black'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Asonantes / Slant ({totalAssonants})
          </button>

          <button
            id="tab-internal-rhymes"
            onClick={() => setActiveTab('internal')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 cursor-pointer transition-colors shrink-0 ${
              activeTab === 'internal'
                ? 'border-amber-500 text-amber-400 bg-stone-900 font-black'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Rimas Internas ({totalInternals})
          </button>

          <button
            id="tab-punchlines-rhymes"
            onClick={() => setActiveTab('punchlines')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 cursor-pointer transition-colors shrink-0 ${
              activeTab === 'punchlines'
                ? 'border-amber-500 text-amber-400 bg-stone-900 font-black'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Barras y Remates ({totalPunchlines})
          </button>
        </div>

        {/* Modal Body with Suggestions */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 max-h-[50vh] custom-scrollbar bg-stone-900">
          {isLoading && (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
              <p className="font-serif text-base text-amber-200 font-bold">
                Modelando Rimas Multi-Silábicas y Flow con Gemini 3.8 Flash...
              </p>
              <p className="text-xs text-stone-400 max-w-md mx-auto">
                Adaptando métrica fonética, cadencia de {activePersonaConfig.name} y esquema de rima para "{currentWord}"
              </p>
            </div>
          )}

          {error && !isLoading && (
            <div className="p-4 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-none flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => fetchRhymes(currentWord, selectedLine, selectedPersona, selectedLanguage)}
                className="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-stone-100 uppercase font-bold text-[10px]"
              >
                Reintentar
              </button>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {/* TAB 1: MULTI-SYLLABIC RHYMES */}
              {activeTab === 'multisyllabic' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-stone-400 bg-stone-950/60 p-2.5 border border-stone-800">
                    <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                      <Sparkles className="w-3.5 h-3.5" /> Multi-Syllabic Stacks (2, 3 y 4 Sílabas Consecutivas):
                    </span>
                    <span className="text-stone-400">Haz clic en "Insertar Frase" o "Insertar Barra"</span>
                  </div>

                  {rhymeData?.multisyllabic && rhymeData.multisyllabic.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {rhymeData.multisyllabic.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-stone-950/90 border border-stone-800 hover:border-amber-500 p-4 flex flex-col justify-between group transition-all shadow-lg"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-serif font-black text-amber-300 text-lg tracking-wide">
                                "{item.phrase}"
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] px-2 py-0.5 bg-amber-950 border border-amber-800 text-amber-400 font-mono font-bold">
                                  {item.syllables} Sílabas
                                </span>
                              </div>
                            </div>

                            {item.rhymeScheme && (
                              <p className="text-[11px] text-stone-400 mb-1 font-mono">
                                📐 Esquema: <span className="text-amber-200 font-bold">{item.rhymeScheme}</span>
                              </p>
                            )}

                            {item.meterFit && (
                              <p className="text-[11px] text-stone-400 mb-2 font-mono">
                                ⏱️ Cadencia: <span className="text-emerald-400">{item.meterFit}</span>
                              </p>
                            )}

                            {item.sampleBar && (
                              <div className="mt-2 bg-stone-900 p-2.5 border-l-2 border-amber-500 text-xs">
                                <span className="text-[9px] uppercase font-bold text-amber-500 block mb-0.5">
                                  Barra de Ejemplo ({activePersonaConfig.name}):
                                </span>
                                <p className="font-serif italic text-stone-200">
                                  "{item.sampleBar}"
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-4 pt-2.5 border-t border-stone-800">
                            <button
                              onClick={() => {
                                onSelectRhyme(item.phrase);
                                onClose();
                              }}
                              className="flex-1 py-1.5 px-2 bg-amber-600/30 hover:bg-amber-600 hover:text-stone-950 text-amber-300 border border-amber-600/50 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            >
                              <CornerDownLeft className="w-3.5 h-3.5" />
                              Insertar Frase
                            </button>

                            {onInsertLine && item.sampleBar && (
                              <button
                                onClick={() => {
                                  onInsertLine(item.sampleBar);
                                  onClose();
                                }}
                                className="py-1.5 px-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold uppercase flex items-center gap-1 cursor-pointer transition-colors"
                                title="Insertar barra completa"
                              >
                                Barra Completa
                              </button>
                            )}

                            <button
                              onClick={() => handleCopyWord(item.phrase)}
                              className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                              title="Copiar frase"
                            >
                              {copiedWord === item.phrase ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-stone-950/50 border border-stone-800 p-6">
                      <p className="text-xs text-stone-400">
                        Buscando rimas multi-silábicas para "{currentWord}"...
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CONSONANT RHYMES */}
              {activeTab === 'consonant' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                    <span>Coincidencia fonética exacta (vocales y consonantes):</span>
                    <span className="text-amber-500">Haz clic para insertar o copiar</span>
                  </div>

                  {rhymeData?.consonant && rhymeData.consonant.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {rhymeData.consonant.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-stone-950/80 border border-stone-800 hover:border-amber-600/70 p-3 flex flex-col justify-between group transition-all"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-serif font-black text-amber-200 text-base tracking-wide capitalize">
                                {item.word}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 bg-stone-900 border border-stone-700 text-stone-400 font-mono">
                                {item.syllables} {item.syllables === 1 ? 'sílaba' : 'sílabas'}
                              </span>
                            </div>
                            {item.meaning && (
                              <p className="text-xs text-stone-400 mb-1.5">{item.meaning}</p>
                            )}
                            {item.samplePhrase && (
                              <p className="text-xs text-amber-400/80 italic font-serif bg-stone-900/60 p-1.5 border-l-2 border-amber-600">
                                "{item.samplePhrase}"
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-stone-800/80">
                            <button
                              onClick={() => {
                                onSelectRhyme(item.word);
                                onClose();
                              }}
                              className="flex-1 py-1 px-2 bg-amber-600/20 hover:bg-amber-600 hover:text-stone-950 text-amber-400 border border-amber-700/50 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            >
                              <CornerDownLeft className="w-3 h-3" />
                              Insertar
                            </button>
                            <button
                              onClick={() => handleCopyWord(item.word)}
                              className="py-1 px-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-bold uppercase flex items-center gap-1 cursor-pointer transition-colors"
                              title="Copiar palabra"
                            >
                              {copiedWord === item.word ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              {copiedWord === item.word ? 'Listo' : 'Copiar'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-stone-500 text-center py-6">
                      No se encontraron rimas consonantes para "{currentWord}".
                    </p>
                  )}
                </div>
              )}

              {/* TAB 3: ASSONANT RHYMES */}
              {activeTab === 'assonant' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                    <span>Coincidencia de vocales (ritmo auténtico de corrido y rap latino):</span>
                    <span className="text-amber-500">Haz clic para insertar o copiar</span>
                  </div>

                  {rhymeData?.assonant && rhymeData.assonant.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {rhymeData.assonant.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-stone-950/80 border border-stone-800 hover:border-amber-600/70 p-3 flex flex-col justify-between group transition-all"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-serif font-black text-amber-200 text-base tracking-wide capitalize">
                                {item.word}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 bg-stone-900 border border-stone-700 text-stone-400 font-mono">
                                {item.syllables} {item.syllables === 1 ? 'sílaba' : 'sílabas'}
                              </span>
                            </div>
                            {item.meaning && (
                              <p className="text-xs text-stone-400 mb-1.5">{item.meaning}</p>
                            )}
                            {item.samplePhrase && (
                              <p className="text-xs text-amber-400/80 italic font-serif bg-stone-900/60 p-1.5 border-l-2 border-amber-600">
                                "{item.samplePhrase}"
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-stone-800/80">
                            <button
                              onClick={() => {
                                onSelectRhyme(item.word);
                                onClose();
                              }}
                              className="flex-1 py-1 px-2 bg-amber-600/20 hover:bg-amber-600 hover:text-stone-950 text-amber-400 border border-amber-700/50 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            >
                              <CornerDownLeft className="w-3 h-3" />
                              Insertar
                            </button>
                            <button
                              onClick={() => handleCopyWord(item.word)}
                              className="py-1 px-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-bold uppercase flex items-center gap-1 cursor-pointer transition-colors"
                              title="Copiar palabra"
                            >
                              {copiedWord === item.word ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              {copiedWord === item.word ? 'Listo' : 'Copiar'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-stone-500 text-center py-6">
                      No se encontraron rimas asonantes para "{currentWord}".
                    </p>
                  )}
                </div>
              )}

              {/* TAB 4: INTERNAL RHYMES */}
              {activeTab === 'internal' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                    <span>Rimas Internas (Palabra en medio del compás rimando con el remate):</span>
                  </div>

                  {rhymeData?.internalRhymes && rhymeData.internalRhymes.length > 0 ? (
                    <div className="space-y-3">
                      {rhymeData.internalRhymes.map((ir, idx) => (
                        <div key={idx} className="bg-stone-950 border border-stone-800 p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-mono text-xs">
                              <span className="text-amber-400 font-bold">Interna: "{ir.internalWord}"</span>
                              <span className="text-stone-500">➔</span>
                              <span className="text-emerald-400 font-bold">Terminal: "{ir.terminalWord}"</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 bg-stone-900 border border-stone-700 text-amber-300 font-mono">
                              Cadencia Rápida
                            </span>
                          </div>

                          <div className="bg-stone-900 p-3 border-l-2 border-emerald-500">
                            <p className="font-serif text-sm text-stone-200 italic">
                              "{ir.barExample}"
                            </p>
                          </div>

                          <p className="text-[11px] text-stone-400 italic">
                            💡 Tip de flow: {ir.cadenceTip}
                          </p>

                          <div className="flex justify-end gap-2 pt-2 border-t border-stone-800/80">
                            {onInsertLine && (
                              <button
                                onClick={() => {
                                  onInsertLine(ir.barExample);
                                  onClose();
                                }}
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold uppercase flex items-center gap-1 cursor-pointer"
                              >
                                <CornerDownLeft className="w-3.5 h-3.5" />
                                Insertar Barra
                              </button>
                            )}
                            <button
                              onClick={() => handleCopyWord(ir.barExample)}
                              className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" /> Copiar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-stone-500 text-center py-6">
                      No hay rimas internas registradas para esta búsqueda.
                    </p>
                  )}
                </div>
              )}

              {/* TAB 5: PUNCHLINES & BARS */}
              {activeTab === 'punchlines' && (
                <div className="space-y-4">
                  {/* Punchline Bars */}
                  {rhymeData?.punchlineBars && rhymeData.punchlineBars.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-serif font-black text-xs text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5" /> Punchline Bars (Setup & Remate):
                      </h4>
                      {rhymeData.punchlineBars.map((pb, idx) => (
                        <div key={idx} className="bg-stone-950 border border-amber-900/40 p-4 space-y-2.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono text-stone-400">Combo #{idx + 1}</span>
                            <span className="text-[10px] px-2 py-0.5 bg-amber-950 text-amber-400 font-mono font-bold">
                              {pb.cadenceType || 'Drop Pesado'}
                            </span>
                          </div>

                          <div className="space-y-1 text-sm font-serif">
                            <p className="text-stone-400 text-xs">1. Setup: "{pb.setupLine}"</p>
                            <p className="text-amber-200 font-bold text-sm bg-stone-900 p-2 border-l-2 border-amber-500">
                              2. Punchline: "{pb.punchline}"
                            </p>
                          </div>

                          <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
                            {onInsertLine && (
                              <button
                                onClick={() => {
                                  onInsertLine(`${pb.setupLine}\n${pb.punchline}`);
                                  onClose();
                                }}
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"
                              >
                                <CornerDownLeft className="w-3.5 h-3.5" />
                                Insertar Ambas Líneas
                              </button>
                            )}
                            <button
                              onClick={() => handleCopyWord(`${pb.setupLine}\n${pb.punchline}`)}
                              className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" /> Copiar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Ready-made Couplets */}
                  {rhymeData?.popularPhrases && rhymeData.popularPhrases.length > 0 && (
                    <div className="space-y-2.5 pt-3 border-t border-stone-800">
                      <h4 className="font-serif font-black text-xs text-stone-400 uppercase tracking-wider">
                        Versos de Cierre & Remates de Estrofa:
                      </h4>
                      {rhymeData.popularPhrases.map((phrase, idx) => (
                        <div
                          key={idx}
                          className="bg-stone-950 border border-stone-800 hover:border-amber-600 p-3 flex items-center justify-between gap-3 group transition-colors"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="text-amber-500 font-mono text-xs font-bold mt-0.5">
                              #{idx + 1}
                            </span>
                            <p className="font-serif text-sm font-bold text-amber-100 leading-relaxed">
                              "{phrase}"
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {onInsertLine && (
                              <button
                                onClick={() => {
                                  onInsertLine(phrase);
                                  onClose();
                                }}
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"
                              >
                                <CornerDownLeft className="w-3.5 h-3.5" />
                                Insertar
                              </button>
                            )}
                            <button
                              onClick={() => handleCopyWord(phrase)}
                              className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                              title="Copiar verso"
                            >
                              {copiedWord === phrase ? (
                                <Check className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-950 px-6 py-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>AI Rhyme Finder activo • Persona: <strong className="text-amber-300">{activePersonaConfig.name}</strong> • Idioma: <strong className="text-amber-300">{selectedLanguage.toUpperCase()}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold uppercase cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

