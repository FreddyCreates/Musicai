import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Terminal, 
  Brain, 
  Cpu, 
  HardDrive, 
  Check, 
  Sparkles, 
  MapPin, 
  Music, 
  Trash2, 
  Play, 
  ChevronRight,
  ShieldCheck,
  Award,
  Radio,
  Sliders,
  Disc,
  Mic,
  Volume2,
  TrendingUp,
  Headphones
} from 'lucide-react';
import { DigitalArtistAgent, ComposerInputs } from '../types';
import { 
  getStoredAgents, 
  saveOrUpdateAgent, 
  deleteStoredAgent, 
  getActiveAgentId, 
  setActiveAgentId 
} from '../utils/agentStorage';
import { AgentComputerModal } from './AgentComputerModal';
import { CreateAgentModal } from './CreateAgentModal';

interface DigitalArtistsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAgentForStudio?: (agent: DigitalArtistAgent) => void;
  onInjectSongToComposer?: (inputs: Partial<ComposerInputs>) => void;
}

export function DigitalArtistsHubModal({
  isOpen,
  onClose,
  onSelectAgentForStudio,
  onInjectSongToComposer
}: DigitalArtistsHubModalProps) {
  const [agents, setAgents] = useState<DigitalArtistAgent[]>(getStoredAgents);
  const [activeAgentId, setActiveId] = useState<string>(getActiveAgentId);
  const [selectedAgentForComputer, setSelectedAgentForComputer] = useState<DigitalArtistAgent | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'corridos' | 'rappers' | 'country_rock' | 'banda_mariachi' | 'latin_urban'>('all');
  const [inspectedAgent, setInspectedAgent] = useState<DigitalArtistAgent | null>(null);

  if (!isOpen) return null;

  const filteredAgents = agents.filter(agent => {
    if (selectedFilter === 'all') return true;
    const g = (agent.genre + ' ' + agent.archetype + ' ' + agent.name + ' ' + (agent.subgenre || '')).toLowerCase();
    
    if (selectedFilter === 'corridos') {
      return (g.includes('corrido') || g.includes('bélico') || g.includes('belico') || g.includes('tumbado') || g.includes('sierreño')) && !g.includes('rap corrido');
    }
    if (selectedFilter === 'rappers') {
      return g.includes('rap') || g.includes('trap') || g.includes('drill') || g.includes('hip hop') || g.includes('houston');
    }
    if (selectedFilter === 'country_rock') {
      return g.includes('country') || g.includes('rock') || g.includes('americana') || g.includes('folk') || g.includes('alternative') || g.includes('pines');
    }
    if (selectedFilter === 'banda_mariachi') {
      return g.includes('banda') || g.includes('mariachi') || g.includes('ranchera') || g.includes('norteño') || g.includes('palenque') || g.includes('tambora');
    }
    if (selectedFilter === 'latin_urban') {
      return g.includes('reggaeton') || g.includes('dembow') || g.includes('urban') || g.includes('perreo') || g.includes('latin');
    }
    return true;
  });

  const handleActivateAgent = (agent: DigitalArtistAgent) => {
    setActiveId(agent.id);
    setActiveAgentId(agent.id);
    if (onSelectAgentForStudio) {
      onSelectAgentForStudio(agent);
    }
  };

  const handleSaveNewAgent = (newAgent: DigitalArtistAgent) => {
    const updatedList = saveOrUpdateAgent(newAgent);
    setAgents(updatedList);
    handleActivateAgent(newAgent);
  };

  const handleUpdateAgent = (updated: DigitalArtistAgent) => {
    const updatedList = saveOrUpdateAgent(updated);
    setAgents(updatedList);
    setSelectedAgentForComputer(updated);
  };

  const handleDeleteAgent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Deseas eliminar este artista digital y su bóveda de memoria?')) {
      const updated = deleteStoredAgent(id);
      setAgents(updated);
      setActiveId(getActiveAgentId());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-stone-950 border-2 border-amber-500 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Studio Console Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border-b border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/30 via-amber-900/40 to-stone-950 border border-amber-500/80 flex items-center justify-center text-2xl shadow-xl shadow-amber-950/50">
              🎙️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-amber-100 text-lg sm:text-xl uppercase tracking-wide">
                  Medina Tech Executive Artist Roster & Studio Hub
                </span>
                <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[10px] font-mono font-bold uppercase rounded">
                  PRO STUDIO 2026
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-400 font-mono mt-0.5">
                Multi-Platinum AI Artists, Complete Sovereign Memory Vaults & Live Studio Booth Routing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-serif font-black text-xs uppercase tracking-wider rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nuevo Artista Digital</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-100 bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer border border-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Live Status Bar */}
        <div className="bg-stone-900/80 border-b border-stone-800 px-6 py-2.5 flex flex-wrap items-center justify-between text-xs text-stone-300 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Disc className="w-3.5 h-3.5 animate-spin" />
              Signed Artists: {agents.length}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Cpu className="w-3.5 h-3.5" />
              Active DAW Session: {agents.find(a => a.id === activeAgentId)?.name || 'Default Lead'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-purple-400 hidden sm:flex">
              <HardDrive className="w-3.5 h-3.5" />
              Autonomous Vaults: BRAIN, USER, LIFESTYLE, TYPE, MUSIC
            </span>
          </div>
          <span className="text-[11px] text-amber-400/80 font-bold">
            ⚡ Studio Preamps: Neve 1073 / SSL 4000 G+ Active
          </span>
        </div>

        {/* Category Filters */}
        <div className="px-6 py-2.5 bg-stone-950 border-b border-stone-800 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            🔥 All Signed Artists ({agents.length})
          </button>
          <button
            onClick={() => setSelectedFilter('corridos')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedFilter === 'corridos'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            🤠 Corridos Bélicos & Tumbados
          </button>
          <button
            onClick={() => setSelectedFilter('rappers')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedFilter === 'rappers'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            🎤 Houston Rap & Hard Trap
          </button>
          <button
            onClick={() => setSelectedFilter('country_rock')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedFilter === 'country_rock'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            🎸 Country & Modern Rock
          </button>
          <button
            onClick={() => setSelectedFilter('banda_mariachi')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedFilter === 'banda_mariachi'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            🎺 Banda & Mariachi de Gala
          </button>
          <button
            onClick={() => setSelectedFilter('latin_urban')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedFilter === 'latin_urban'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            🌴 Latin Urban & Dembow
          </button>
        </div>

        {/* Artists Grid List */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4 bg-stone-950">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredAgents.map((agent) => {
              const isActive = activeAgentId === agent.id;

              return (
                <div
                  key={agent.id}
                  className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                    isActive
                      ? 'bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border-amber-500 shadow-2xl ring-2 ring-amber-500/70'
                      : 'bg-stone-900/60 border-stone-800/90 hover:border-amber-700/50 hover:bg-stone-900/90'
                  }`}
                >
                  {/* Top Header info */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 border border-amber-600/60 flex items-center justify-center text-3xl shadow-xl shrink-0 relative">
                          {agent.avatar || '🤠'}
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-stone-950 flex items-center justify-center" title="Live in Studio">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          </span>
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-serif font-black text-amber-100 text-lg uppercase tracking-tight">
                              {agent.name}
                            </span>
                            {agent.alias && (
                              <span className="text-[10px] bg-amber-950/90 text-amber-300 font-mono px-2 py-0.5 border border-amber-700/60 rounded font-bold">
                                "{agent.alias}"
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-amber-400 font-serif font-bold tracking-wide block mt-0.5">
                            {agent.archetype}
                          </span>
                          <span className="text-[11px] text-stone-400 font-mono block">
                            📍 {agent.location} • 🏢 {agent.recordLabel}
                          </span>
                        </div>
                      </div>

                      {/* Studio Status Pill */}
                      {isActive ? (
                        <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-500/80 rounded-full text-[10px] font-mono font-black uppercase flex items-center gap-1.5 shadow-lg shadow-emerald-950/80">
                          <Check className="w-3 h-3 text-emerald-400" /> ON AIR DAW
                        </span>
                      ) : (
                        <button
                          onClick={() => handleActivateAgent(agent)}
                          className="px-3 py-1.5 bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-amber-300 text-xs font-serif font-bold uppercase rounded-lg cursor-pointer transition-all border border-stone-700 active:scale-95"
                        >
                          Cargar en DAW
                        </button>
                      )}
                    </div>

                    {/* RIAA Certifications & Monthly Listeners */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 my-3 p-2.5 bg-stone-950/80 border border-stone-800/80 rounded-xl text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-stone-500 block">Streaming</span>
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-emerald-400" /> {agent.monthlyListeners || '12.4M'} / mo
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 block">Tempo & Key</span>
                        <span className="text-amber-300 font-bold">
                          ⚡ {agent.stats?.activeBpm || 132} BPM
                        </span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-stone-500 block">RIAA Badges</span>
                        <span className="text-amber-200 font-bold truncate block">
                          {agent.riaaCertifications?.[0]?.award ? `${agent.riaaCertifications[0].award} 💿` : '3x Platinum 💿'}
                        </span>
                      </div>
                    </div>

                    {/* Studio Gear & Mic Chain */}
                    {agent.studioGear && (
                      <div className="p-2.5 bg-stone-950 border border-stone-800/60 rounded-xl text-[11px] font-mono text-stone-400 mb-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-stone-300 font-bold">
                          <Mic className="w-3 h-3 text-amber-400" />
                          <span className="truncate">{agent.studioGear.mic || 'Telefunken U47 -> Neve 1073'}</span>
                        </div>
                        {agent.signatureQuotes?.[0] && (
                          <p className="text-[10px] italic text-stone-400 truncate">
                            "{agent.signatureQuotes[0]}"
                          </p>
                        )}
                      </div>
                    )}

                    {/* Autonomous Vault Status */}
                    <div className="p-2 bg-stone-900/60 border border-stone-800/60 rounded-lg flex flex-wrap items-center justify-between gap-1 text-[10px] font-mono text-stone-400">
                      <div className="flex items-center gap-1.5">
                        <span className="text-purple-400 font-bold">BRAIN.md</span>
                        <span>•</span>
                        <span className="text-blue-400 font-bold">USER.md</span>
                        <span>•</span>
                        <span className="text-amber-400 font-bold">LIFESTYLE.md</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-bold">TYPE.md</span>
                        <span>•</span>
                        <span className="text-rose-400 font-bold">MUSIC.md</span>
                      </div>
                      <span className="text-emerald-400 font-bold">{agent.stats?.vaultSizeKb || 55} KB Vault</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3.5 mt-3 border-t border-stone-800 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedAgentForComputer(agent)}
                      className="px-3.5 py-2 bg-gradient-to-r from-amber-600 via-amber-700 to-stone-900 hover:from-amber-500 hover:to-stone-800 text-amber-100 border border-amber-500/70 font-serif font-black text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
                    >
                      <Terminal className="w-3.5 h-3.5 text-amber-300" />
                      <span>💻 Computadora & Memoria</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          handleActivateAgent(agent);
                          if (onInjectSongToComposer) {
                            onInjectSongToComposer({
                              style: agent.genre,
                              instrument: agent.studioGear?.instruments?.[0] as any || 'Docerola 12 Cuerdas y Tarolas'
                            });
                          }
                        }}
                        className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-serif font-bold uppercase rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Usar DNA</span>
                      </button>

                      {agents.length > 1 && (
                        <button
                          onClick={(e) => handleDeleteAgent(agent.id, e)}
                          className="p-2 text-stone-500 hover:text-rose-400 hover:bg-stone-900 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-900/40"
                          title="Eliminar artista"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Studio Console Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Medina Tech Records & Sovereign AI Artist Agency • Dallas / Nashville / Culiacán</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-serif font-black text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow"
          >
            Cerrar Bóveda
          </button>
        </div>

      </div>

      {/* Child Modal: Agent Computer / Terminal / Vault */}
      {selectedAgentForComputer && (
        <AgentComputerModal
          isOpen={!!selectedAgentForComputer}
          onClose={() => setSelectedAgentForComputer(null)}
          agent={selectedAgentForComputer}
          onUpdateAgent={handleUpdateAgent}
          onInjectSongToComposer={(inputs) => {
            if (onInjectSongToComposer) {
              onInjectSongToComposer(inputs);
            }
            setSelectedAgentForComputer(null);
            onClose();
          }}
        />
      )}

      {/* Child Modal: Create New Agent */}
      <CreateAgentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSaveAgent={handleSaveNewAgent}
      />
    </div>
  );
}
