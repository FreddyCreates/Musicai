import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Brain, 
  User, 
  Flame, 
  Sliders, 
  Music, 
  MapPin, 
  Check, 
  ChevronRight, 
  Save, 
  Plus,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { DigitalArtistAgent, AgentVaultMemory, CorridoStyle } from '../types';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAgent: (newAgent: DigitalArtistAgent) => void;
}

const AVATAR_OPTIONS = ['🦅', '⚡', '🤠', '♟️', '🦁', '👑', '🔥', '💎', '🐺', '🎯', '🐎', '⚔️'];

const ARCHETYPE_SUGGESTIONS = [
  'Estratega Bélico & Líder Militar',
  'Joven Millonario Tumbado Urbano',
  'Leyenda Campirana y Poeta del Honor',
  'Mente Maestra Táctica & Estratega',
  'Trovador Bohemio de la Sierra',
  'Vanguardia Bélica Tech 2026'
];

const GENRE_OPTIONS: CorridoStyle[] = [
  'Modern Banda/Bélico (Requintos 12 Cuerdas, Metales en Vivo y Tamborazo)',
  'Grupo Mente Maestra (Bélico Estratégico, Requintos Dobles y Tarolas 2026)',
  'Estilo Gerardo Ortiz (Banda Pesada & Corrido Progresivo)',
  'Bélico Tumbado 2026',
  'Corrido Bélico Tech 2026',
  'Sierreño Campirano',
  'Legado 7 & Sierreño Urbano (Requintos 12 Cuerdas y Batería)',
  'Corrido de Banda Sinaloense Brava',
  'Baja Cali Fronterizo (Docerolas y Metales en Vivo)',
  'Houston Texas Rap (UGK & Z-Ro Style / Slow Rolling 808s)'
];

export function CreateAgentModal({ isOpen, onClose, onSaveAgent }: CreateAgentModalProps) {
  const [step, setStep] = useState<'profile' | 'vault_preview'>('profile');
  
  // Profile Fields
  const [name, setName] = useState('');
  const [alias, setAlias] = useState('');
  const [archetype, setArchetype] = useState(ARCHETYPE_SUGGESTIONS[0]);
  const [genre, setGenre] = useState<CorridoStyle>(GENRE_OPTIONS[0]);
  const [location, setLocation] = useState('Culiacán, Sinaloa & Dallas, TX');
  const [avatar, setAvatar] = useState('🦅');
  const [recordLabel, setRecordLabel] = useState('Medina Tech Records');
  const [backstory, setBackstory] = useState('');
  const [inspirations, setInspirations] = useState('');

  // Generated Vault State
  const [isGeneratingVault, setIsGeneratingVault] = useState(false);
  const [generatedVault, setGeneratedVault] = useState<AgentVaultMemory | null>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<'brain' | 'user' | 'lifestyle' | 'type' | 'music'>('brain');

  if (!isOpen) return null;

  const handleGenerateVaultWithAI = async () => {
    if (!name.trim()) return;

    setIsGeneratingVault(true);
    try {
      const res = await fetch('/api/agents/generate-vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          alias: alias.trim(),
          archetype,
          genre,
          location,
          backstory,
          inspirations
        })
      });

      const data = await res.json();
      if (data.success && data.vault) {
        setGeneratedVault(data.vault);
        setStep('vault_preview');
      }
    } catch (err) {
      console.error('Vault generation error:', err);
    } finally {
      setIsGeneratingVault(false);
    }
  };

  const handleCreateAgentFinal = () => {
    if (!name.trim()) return;

    const vault: AgentVaultMemory = generatedVault || {
      brainMd: `# BRAIN.md — Núcleo Cognitivo de ${name}\n\n- Arquetipo: ${archetype}\n- Código: Lealtad absoluta y pasión por el corrido.`,
      userMd: `# USER.md — Vínculo con el Productor\n\n- Productor: Medina Tech Studios\n- Confianza: 100%`,
      lifestyleMd: `# LIFESTYLE.md — Estilo de Vida\n\n- Base: ${location}\n- Historia: ${backstory || 'Nacido con talento para componer historias reales.'}`,
      typeMd: `# TYPE.md — Arquetipo de Voz\n\n- Expresiones: "¡Fierro!", "¡Puro pa delante!"`,
      musicMd: `# MUSIC.md — ADN Musical\n\n- Estilo: ${genre}\n- Tempo: 144 BPM`
    };

    const id = `agent_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${Math.random().toString(36).substring(2, 6)}`;

    const newAgent: DigitalArtistAgent = {
      id,
      name: name.trim(),
      alias: alias.trim() || undefined,
      archetype,
      avatar,
      genre,
      recordLabel,
      location,
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0],
      lastActive: 'Recién creado',
      stats: {
        songsCreated: 0,
        memoryEntries: 50,
        vaultSizeKb: 45,
        activeBpm: 144
      },
      vault,
      terminalLogs: [
        {
          id: `log-init-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          level: 'success',
          message: `Sovereign Digital Artist "${name}" initialized with 5-file Memory Vault.`
        }
      ]
    };

    onSaveAgent(newAgent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-stone-950 border-2 border-amber-500 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border-b border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-500/60 flex items-center justify-center text-xl">
              {avatar}
            </div>
            <div>
              <span className="font-serif font-black text-amber-200 text-base uppercase tracking-wide flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                Crear Nuevo Artista Digital Soberano
              </span>
              <p className="text-[11px] text-stone-400 font-mono">
                Asigna su propia computadora, identidad y bóveda de memoria de 5 archivos .MD
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="bg-stone-900/60 border-b border-stone-800 px-6 py-2.5 flex items-center gap-4 text-xs font-mono">
          <button
            onClick={() => setStep('profile')}
            className={`flex items-center gap-1.5 cursor-pointer ${
              step === 'profile' ? 'text-amber-400 font-bold' : 'text-stone-500'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-stone-800 border border-current flex items-center justify-center text-[10px]">
              1
            </span>
            <span>Identidad & Estilo</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
          <button
            onClick={() => generatedVault && setStep('vault_preview')}
            disabled={!generatedVault}
            className={`flex items-center gap-1.5 ${
              step === 'vault_preview' ? 'text-amber-400 font-bold' : 'text-stone-500'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-stone-800 border border-current flex items-center justify-center text-[10px]">
              2
            </span>
            <span>Bóveda de Memoria (5 Archivos .MD)</span>
          </button>
        </div>

        {/* Step 1: Profile & Identity */}
        {step === 'profile' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-stone-950">
            {/* Avatar Selector */}
            <div>
              <label className="block font-mono text-xs text-amber-400 uppercase font-bold mb-2">
                Elige el Emblema / Avatar del Artista:
              </label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={`w-11 h-11 text-2xl rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      avatar === emoji
                        ? 'bg-amber-950 border-amber-500 ring-2 ring-amber-500 scale-105'
                        : 'bg-stone-900 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Name & Alias */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-serif text-xs text-amber-200 uppercase font-bold mb-1.5">
                  Nombre del Artista Digital *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ej. El Comanche de la Sierra, Tito Diamante"
                  className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500 text-stone-100 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-serif text-xs text-amber-200 uppercase font-bold mb-1.5">
                  Apodo o Clave (Opcional)
                </label>
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="ej. El 90 de Culiacán, El Rey del Tumbado"
                  className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500 text-stone-100 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Archetype & Genre */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-serif text-xs text-amber-200 uppercase font-bold mb-1.5">
                  Arquetipo de Personalidad
                </label>
                <select
                  value={archetype}
                  onChange={(e) => setArchetype(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500 text-stone-200 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none font-mono cursor-pointer"
                >
                  {ARCHETYPE_SUGGESTIONS.map((arch) => (
                    <option key={arch} value={arch}>{arch}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-serif text-xs text-amber-200 uppercase font-bold mb-1.5">
                  Estilo de Corrido Predeterminado
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value as CorridoStyle)}
                  className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500 text-stone-200 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none font-mono cursor-pointer"
                >
                  {GENRE_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location & Sello */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-serif text-xs text-amber-200 uppercase font-bold mb-1.5">
                  Territorio / Base
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="ej. Culiacán, Sinaloa / Dallas, Texas"
                  className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500 text-stone-100 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-serif text-xs text-amber-200 uppercase font-bold mb-1.5">
                  Sello Discográfico
                </label>
                <input
                  type="text"
                  value={recordLabel}
                  onChange={(e) => setRecordLabel(e.target.value)}
                  placeholder="ej. Medina Tech Records"
                  className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500 text-stone-100 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Backstory */}
            <div>
              <label className="block font-serif text-xs text-amber-200 uppercase font-bold mb-1.5">
                Historia, Origen y Código de Honor (Para el archivo BRAIN.md y LIFESTYLE.md)
              </label>
              <textarea
                value={backstory}
                onChange={(e) => setBackstory(e.target.value)}
                placeholder="Describe brevemente su historia de vida, sus lealtades, sus gustos, sus armas o coches favoritos para que la IA arme su memoria completa..."
                rows={3}
                className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500 text-stone-100 text-xs p-3 rounded-lg focus:outline-none font-mono leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* Step 2: Vault Memory Preview (5 Files) */}
        {step === 'vault_preview' && generatedVault && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-stone-950">
            {/* File Switcher */}
            <div className="w-full md:w-64 bg-stone-900/60 border-r border-stone-800 p-3 space-y-1.5 overflow-y-auto">
              {[
                { key: 'brain', label: 'BRAIN.md', icon: Brain, desc: 'Núcleo Cognitivo' },
                { key: 'user', label: 'USER.md', icon: User, desc: 'Relación Productor' },
                { key: 'lifestyle', label: 'LIFESTYLE.md', icon: Flame, desc: 'Estilo de Vida' },
                { key: 'type', label: 'TYPE.md', icon: Sliders, desc: 'Jerga y Modismos' },
                { key: 'music', label: 'MUSIC.md', icon: Music, desc: 'ADN Musical' }
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActivePreviewTab(item.key as any)}
                  className={`w-full p-2.5 rounded-lg text-left text-xs font-mono transition-colors cursor-pointer flex items-center justify-between ${
                    activePreviewTab === item.key
                      ? 'bg-amber-950 border border-amber-500 text-amber-300 font-bold'
                      : 'bg-stone-950 border border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="w-4 h-4 text-amber-400" />
                    <span>{item.label}</span>
                  </div>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              ))}
            </div>

            {/* Markdown Preview */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-300">
                  Vista Previa y Edición: {activePreviewTab.toUpperCase()}.md
                </span>
                <span className="text-[11px] font-mono text-stone-400">
                  Puedes ajustar el texto antes de guardar
                </span>
              </div>
              <textarea
                value={
                  activePreviewTab === 'brain' ? generatedVault.brainMd :
                  activePreviewTab === 'user' ? generatedVault.userMd :
                  activePreviewTab === 'lifestyle' ? generatedVault.lifestyleMd :
                  activePreviewTab === 'type' ? generatedVault.typeMd :
                  generatedVault.musicMd
                }
                onChange={(e) => {
                  const val = e.target.value;
                  setGeneratedVault((prev) => {
                    if (!prev) return null;
                    return {
                      ...prev,
                      [activePreviewTab === 'brain' ? 'brainMd' :
                       activePreviewTab === 'user' ? 'userMd' :
                       activePreviewTab === 'lifestyle' ? 'lifestyleMd' :
                       activePreviewTab === 'type' ? 'typeMd' : 'musicMd']: val
                    };
                  });
                }}
                className="w-full h-[380px] bg-stone-950 border border-stone-800 rounded-xl p-3.5 text-xs font-mono text-amber-100/90 leading-relaxed focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-400 text-xs font-serif font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2">
            {step === 'profile' ? (
              <button
                type="button"
                onClick={handleGenerateVaultWithAI}
                disabled={!name.trim() || isGeneratingVault}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-stone-950 font-serif font-black text-xs uppercase tracking-wider rounded-lg shadow-lg flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <Sparkles className={`w-4 h-4 ${isGeneratingVault ? 'animate-spin' : ''}`} />
                <span>{isGeneratingVault ? 'Forjando Bóveda con IA...' : '✨ Generar Bóveda de Memoria (5 Archivos .MD)'}</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setStep('profile')}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-mono rounded-lg cursor-pointer"
                >
                  ← Volver a Perfil
                </button>
                <button
                  type="button"
                  onClick={handleCreateAgentFinal}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-stone-950 font-serif font-black text-xs uppercase tracking-wider rounded-lg shadow-lg flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar y Activar Artista Digital</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
