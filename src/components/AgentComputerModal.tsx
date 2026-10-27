import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Terminal, 
  Cpu, 
  HardDrive, 
  Brain, 
  User, 
  Sparkles, 
  Save, 
  Send, 
  FileText, 
  Play, 
  RefreshCw, 
  Music, 
  MapPin, 
  Shield, 
  Zap, 
  Flame, 
  MessageSquare, 
  Code, 
  Sliders, 
  Award,
  Check,
  Copy,
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';
import { DigitalArtistAgent, AgentVaultMemory, AgentMemoryChatMessage, AgentTerminalLog, ComposerInputs } from '../types';
import { updateAgentVault, addAgentChatMessage, addAgentTerminalLog } from '../utils/agentStorage';

interface AgentComputerModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: DigitalArtistAgent;
  onUpdateAgent: (updated: DigitalArtistAgent) => void;
  onInjectSongToComposer?: (inputs: Partial<ComposerInputs>) => void;
}

type TabType = 'vault' | 'terminal' | 'chat' | 'dna';
type VaultFileKey = 'brain' | 'user' | 'lifestyle' | 'type' | 'music';

const VAULT_FILE_INFO: Record<VaultFileKey, { label: string; fileName: string; icon: any; color: string; desc: string }> = {
  brain: {
    label: 'Brain (Cerebro)',
    fileName: 'BRAIN.md',
    icon: Brain,
    color: 'text-purple-400 border-purple-800/60 bg-purple-950/20',
    desc: 'Núcleo cognitivo, directiva principal, código de honor, lealtad y toma de decisiones.'
  },
  user: {
    label: 'User (Productor)',
    fileName: 'USER.md',
    icon: User,
    color: 'text-blue-400 border-blue-800/60 bg-blue-950/20',
    desc: 'Relación con el productor, acuerdos de estudio, memoria de sesiones y nivel de confianza.'
  },
  lifestyle: {
    label: 'Lifestyle (Estilo de Vida)',
    fileName: 'LIFESTYLE.md',
    icon: Flame,
    color: 'text-amber-400 border-amber-800/60 bg-amber-950/20',
    desc: 'Territorio, historia, vehículos, moda, joyas, rutina diaria y códigos de calle.'
  },
  type: {
    label: 'Type (Arquetipo & Jerga)',
    fileName: 'TYPE.md',
    icon: Sliders,
    color: 'text-emerald-400 border-emerald-800/60 bg-emerald-950/20',
    desc: 'Diccionario de modismos regionales, cadencia vocal, actitud al micrófono y frases insignia.'
  },
  music: {
    label: 'Music (ADN Musical)',
    fileName: 'MUSIC.md',
    icon: Music,
    color: 'text-rose-400 border-rose-800/60 bg-rose-950/20',
    desc: 'Afinaciones de requinto, metales en vivo, tempo preferido (BPM), tarolas y motivos líricos.'
  }
};

export function AgentComputerModal({
  isOpen,
  onClose,
  agent,
  onUpdateAgent,
  onInjectSongToComposer
}: AgentComputerModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('vault');
  const [selectedFile, setSelectedFile] = useState<VaultFileKey>('brain');
  
  // Vault Editor State
  const [editedContent, setEditedContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);
  const [copied, setCopied] = useState(false);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);
  const [messages, setMessages] = useState<AgentMemoryChatMessage[]>(agent.chatHistory || []);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Terminal State
  const [terminalCommand, setTerminalCommand] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    `[AGENT OS v2.6 - SYSTEM BOOT READY]`,
    `Agent ID: ${agent.id} | Identity: ${agent.name} ("${agent.alias || 'Sovereign'}")`,
    `Memory Vault: 5/5 markdown cores loaded (BRAIN, USER, LIFESTYLE, TYPE, MUSIC).`,
    `Type "help" for a list of autonomous agent commands.`
  ]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Sync content when selected file or agent changes
  useEffect(() => {
    if (!agent) return;
    const content = getFileContent(selectedFile);
    setEditedContent(content);
  }, [selectedFile, agent]);

  // Sync messages
  useEffect(() => {
    if (agent?.chatHistory) {
      setMessages(agent.chatHistory);
    }
  }, [agent]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory, activeTab]);

  if (!isOpen || !agent) return null;

  function getFileContent(key: VaultFileKey): string {
    const vault = agent.vault || ({} as AgentVaultMemory);
    switch (key) {
      case 'brain':
        return vault.brainMd || '';
      case 'user':
        return vault.userMd || '';
      case 'lifestyle':
        return vault.lifestyleMd || '';
      case 'type':
        return vault.typeMd || '';
      case 'music':
        return vault.musicMd || '';
      default:
        return '';
    }
  }

  const handleSaveVaultFile = () => {
    setIsSaving(true);
    const keyToProp: Record<VaultFileKey, keyof AgentVaultMemory> = {
      brain: 'brainMd',
      user: 'userMd',
      lifestyle: 'lifestyleMd',
      type: 'typeMd',
      music: 'musicMd'
    };

    const prop = keyToProp[selectedFile];
    const updatedAgent = updateAgentVault(agent.id, {
      [prop]: editedContent
    });

    if (updatedAgent) {
      onUpdateAgent(updatedAgent);
      addAgentTerminalLog(agent.id, {
        level: 'memory',
        message: `Vault updated: ${VAULT_FILE_INFO[selectedFile].fileName} saved to permanent disk.`
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
    setIsSaving(false);
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(editedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickInjectMemory = (textToAppend: string) => {
    const updated = editedContent + `\n\n- ${textToAppend} (Registrado: ${new Date().toLocaleDateString()})`;
    setEditedContent(updated);
  };

  // Send in-character chat message to the digital artist
  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatSending) return;

    const userText = chatInput.trim();
    setChatInput('');

    const userMessage: AgentMemoryChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: userText
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    addAgentChatMessage(agent.id, userMessage);
    setIsChatSending(true);

    try {
      const res = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent,
          message: userText,
          chatHistory: newMessages.slice(-6)
        })
      });

      const data = await res.json();
      if (data.success && data.replyText) {
        const agentMessage: AgentMemoryChatMessage = {
          id: `msg-${Date.now()}-agent`,
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: data.replyText,
          memorySourceRef: data.memorySourceRef || ['BRAIN.md'],
          suggestedSongIdea: data.suggestedSongIdea
        };

        setMessages((prev) => [...prev, agentMessage]);
        addAgentChatMessage(agent.id, agentMessage);
        addAgentTerminalLog(agent.id, {
          level: 'brain',
          message: `In-character reasoning response executed. Memory ref: ${(data.memorySourceRef || []).join(', ')}`
        });
      }
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: AgentMemoryChatMessage = {
        id: `msg-${Date.now()}-agent`,
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `¡Fierro, compa! Aquí ando al tiro con la docerola lista en el estudio. ¿Nos aventamos un corrido bélico con todo el power?`,
        memorySourceRef: ['BRAIN.md']
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      addAgentChatMessage(agent.id, fallbackMsg);
    } finally {
      setIsChatSending(false);
    }
  };

  // Autonomous song generation by the agent using their memory files
  const handleGenerateAutonomousIdea = async () => {
    setIsGeneratingIdea(true);
    addAgentTerminalLog(agent.id, {
      level: 'music',
      message: `Running autonomous song composition matrix across 5 vault files...`
    });

    try {
      const res = await fetch('/api/agents/compose-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent })
      });

      const data = await res.json();
      if (data.success && data.proposal) {
        const p = data.proposal;
        const songMessage: AgentMemoryChatMessage = {
          id: `msg-${Date.now()}-idea`,
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `¡Compa! Acabo de armar esta rola basada en mi memoria y vivencias:\n\n🔥 **"${p.title}"**\n📖 *${p.story}*\n\n🎸 **Arreglo**: ${p.instrument} (${p.tempoBpm} BPM)\n💡 **Origen**: ${p.whyFromMemory}`,
          memorySourceRef: ['BRAIN.md', 'LIFESTYLE.md', 'MUSIC.md'],
          suggestedSongIdea: {
            title: p.title,
            story: p.story,
            style: (p.style as any) || agent.genre,
            instrument: (p.instrument as any) || 'Requinto 12 Cuerdas, Metales en Vivo y Tambora'
          }
        };

        setMessages((prev) => [...prev, songMessage]);
        addAgentChatMessage(agent.id, songMessage);
        setActiveTab('chat');
      }
    } catch (err) {
      console.error('Idea generation error:', err);
    } finally {
      setIsGeneratingIdea(false);
    }
  };

  // Handle Terminal CLI commands
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalCommand.trim()) return;

    const cmd = terminalCommand.trim().toLowerCase();
    const rawCmd = terminalCommand.trim();
    setTerminalCommand('');

    const newLogs = [...terminalHistory, `$ ${rawCmd}`];

    if (cmd === 'help') {
      newLogs.push(
        `AVAILABLE AGENT OS COMMANDS:`,
        `  status          - Print live cognitive state, vault size, and BPM`,
        `  ls / vault      - List all 5 markdown files in the agent's memory`,
        `  cat <file>      - Read a specific file (e.g. cat brain.md, cat music.md)`,
        `  think / idea    - Trigger autonomous song composition from memory`,
        `  bpm <number>    - Adjust active live tempo (e.g. bpm 144)`,
        `  clear           - Clear terminal screen`,
        `  whoami          - Display sovereign artist identity & label`
      );
    } else if (cmd === 'status') {
      newLogs.push(
        `[AGENT STATUS REPORT]`,
        `  Name: ${agent.name} (${agent.alias || 'N/A'})`,
        `  Archetype: ${agent.archetype}`,
        `  Genre: ${agent.genre}`,
        `  Location: ${agent.location}`,
        `  Vault Files: 5/5 healthy | Total Size: ${agent.stats?.vaultSizeKb || 48} KB`,
        `  Live Tempo: ${agent.stats?.activeBpm || 144} BPM`,
        `  Cognitive Sync: 100% ONLINE`
      );
    } else if (cmd === 'ls' || cmd === 'vault') {
      newLogs.push(
        `VAULT DIRECTORY: /agents/${agent.id}/memory/`,
        `  -rwxr--r--  BRAIN.md      (Cognitive Core & Rules)`,
        `  -rwxr--r--  USER.md       (Producer Relationship)`,
        `  -rwxr--r--  LIFESTYLE.md  (Turf, Vehicles & Wardrobe)`,
        `  -rwxr--r--  TYPE.md       (Slang Dictionary & Cadence)`,
        `  -rwxr--r--  MUSIC.md      (Requinto DNA & Instrument Specs)`
      );
    } else if (cmd.startsWith('cat ')) {
      const target = cmd.replace('cat ', '').trim().toLowerCase();
      if (target.includes('brain')) {
        newLogs.push(`--- BRAIN.md ---\n${agent.vault?.brainMd?.slice(0, 300)}...`);
      } else if (target.includes('user')) {
        newLogs.push(`--- USER.md ---\n${agent.vault?.userMd?.slice(0, 300)}...`);
      } else if (target.includes('life')) {
        newLogs.push(`--- LIFESTYLE.md ---\n${agent.vault?.lifestyleMd?.slice(0, 300)}...`);
      } else if (target.includes('type')) {
        newLogs.push(`--- TYPE.md ---\n${agent.vault?.typeMd?.slice(0, 300)}...`);
      } else if (target.includes('music')) {
        newLogs.push(`--- MUSIC.md ---\n${agent.vault?.musicMd?.slice(0, 300)}...`);
      } else {
        newLogs.push(`File not found. Try: cat brain.md, cat user.md, cat music.md`);
      }
    } else if (cmd === 'think' || cmd === 'idea' || cmd === 'compose') {
      newLogs.push(`[Cognitive Dispatch] Triggering autonomous composition... check 'Diálogo con Artista' tab!`);
      handleGenerateAutonomousIdea();
    } else if (cmd.startsWith('bpm ')) {
      const num = parseInt(cmd.replace('bpm ', '').trim(), 10);
      if (!isNaN(num) && num >= 100 && num <= 170) {
        agent.stats.activeBpm = num;
        newLogs.push(`Active live tempo calibrated to: ${num} BPM.`);
      } else {
        newLogs.push(`Invalid BPM. Provide a number between 100 and 170.`);
      }
    } else if (cmd === 'clear') {
      setTerminalHistory([`[AGENT OS Terminal Cleared] Type "help" for commands.`]);
      return;
    } else if (cmd === 'whoami') {
      newLogs.push(`${agent.name} • ${agent.alias || ''} | Sello: ${agent.recordLabel} | Dallas & Culiacán`);
    } else {
      newLogs.push(`Command not recognized: "${rawCmd}". Type "help" for available commands.`);
    }

    setTerminalHistory(newLogs);
  };

  const handleTakeIdeaToStudio = (idea: NonNullable<AgentMemoryChatMessage['suggestedSongIdea']>) => {
    if (onInjectSongToComposer) {
      onInjectSongToComposer({
        name: agent.name,
        partner: agent.alias ? `${agent.alias} & La Empresa` : 'La Plebada de Medina Tech',
        story: idea.story,
        style: idea.style,
        instrument: idea.instrument,
        tempoBpm: agent.stats?.activeBpm || 144
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-stone-950 border-2 border-amber-500/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Top OS Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border-b border-amber-900/40 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600/30 to-amber-950 border border-amber-500/60 flex items-center justify-center text-2xl shadow-inner shrink-0">
              {agent.avatar || '🤠'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-amber-200 text-lg uppercase tracking-wide">
                  {agent.name}
                </span>
                {agent.alias && (
                  <span className="text-xs bg-amber-950/80 border border-amber-700/50 text-amber-300 font-mono px-2 py-0.5 rounded">
                    "{agent.alias}"
                  </span>
                )}
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded-full uppercase font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Bóveda Soberana Activa
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-stone-400 mt-0.5">
                <span className="flex items-center gap-1 text-amber-400/90 font-mono">
                  <MapPin className="w-3 h-3" /> {agent.location}
                </span>
                <span>•</span>
                <span className="text-stone-300 font-medium">{agent.archetype}</span>
                <span>•</span>
                <span className="text-stone-500 font-mono">{agent.recordLabel}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateAutonomousIdea}
              disabled={isGeneratingIdea}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-serif font-black text-xs uppercase tracking-wider rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-transform active:scale-95"
              title="Pedirle al agente que formule una nueva propuesta musical desde su memoria"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingIdea ? 'animate-spin' : ''}`} />
              <span>{isGeneratingIdea ? 'Pensando Canción...' : '⚡ Componer desde Memoria'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-900 rounded-lg transition-colors cursor-pointer"
              title="Cerrar Computadora del Artista"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-stone-900/80 border-b border-stone-800 px-4 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('vault')}
              className={`px-4 py-3 text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'vault'
                  ? 'border-amber-500 text-amber-300 bg-stone-950/60'
                  : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-950/30'
              }`}
            >
              <Database className="w-4 h-4 text-amber-500" />
              <span>🗄️ Bóveda de Memoria (5 Archivos .MD)</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-3 text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'chat'
                  ? 'border-amber-500 text-amber-300 bg-stone-950/60'
                  : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-950/30'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span>💬 Diálogo con Artista en Estudio</span>
              {messages.length > 0 && (
                <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] px-1.5 py-0.2 rounded-full">
                  {messages.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-4 py-3 text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'terminal'
                  ? 'border-amber-500 text-amber-300 bg-stone-950/60'
                  : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-950/30'
              }`}
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>💻 Computadora & Terminal OS</span>
            </button>

            <button
              onClick={() => setActiveTab('dna')}
              className={`px-4 py-3 text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'dna'
                  ? 'border-amber-500 text-amber-300 bg-stone-950/60'
                  : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-950/30'
              }`}
            >
              <Music className="w-4 h-4 text-rose-400" />
              <span>🎵 ADN Musical & Afinaciones</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-[11px] font-mono text-stone-400">
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-amber-400" /> Core: 100%
            </span>
            <span className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" /> Bóveda: {agent.stats?.vaultSizeKb || 48} KB
            </span>
            <span className="bg-amber-950 px-2 py-0.5 border border-amber-800 text-amber-300 rounded">
              {agent.stats?.activeBpm || 144} BPM
            </span>
          </div>
        </div>

        {/* Tab 1: VAULT MEMORY CENTER (5 MARKDOWN FILES) */}
        {activeTab === 'vault' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[500px]">
            
            {/* Sidebar File List */}
            <div className="w-full md:w-72 bg-stone-950 border-r border-stone-800 p-3 space-y-2 overflow-y-auto">
              <div className="text-[11px] font-mono uppercase text-stone-500 font-bold px-2 mb-2 flex items-center justify-between">
                <span>Archivos de Memoria</span>
                <span>5 / 5 MD</span>
              </div>

              {(Object.keys(VAULT_FILE_INFO) as VaultFileKey[]).map((key) => {
                const info = VAULT_FILE_INFO[key];
                const IconComponent = info.icon;
                const isSelected = selectedFile === key;

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedFile(key)}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500'
                        : 'bg-stone-900/60 border-stone-800 hover:border-stone-700 hover:bg-stone-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-stone-400'}`} />
                        <span className="font-mono text-xs font-black text-stone-200">
                          {info.fileName}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-stone-500">.md</span>
                    </div>
                    <p className="text-[11px] text-stone-400 leading-tight">
                      {info.label}
                    </p>
                  </button>
                );
              })}

              <div className="pt-4 border-t border-stone-800">
                <span className="text-[11px] font-mono text-amber-500 font-bold block mb-2 px-1">
                  ⚡ Inyección Rápida de Memoria:
                </span>
                <div className="space-y-1.5">
                  <button
                    onClick={() => handleQuickInjectMemory('Acuerdo de producción: 100% derechos para el productor')}
                    className="w-full text-left p-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded text-[10px] text-stone-300 font-mono transition-colors cursor-pointer"
                  >
                    + Registrar acuerdo de regalías
                  </button>
                  <button
                    onClick={() => handleQuickInjectMemory('Afinación favorita: Re Menor a 144 BPM con metales en vivo')}
                    className="w-full text-left p-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded text-[10px] text-stone-300 font-mono transition-colors cursor-pointer"
                  >
                    + Inyectar afinación preferida
                  </button>
                  <button
                    onClick={() => handleQuickInjectMemory('Nueva frase insignia: "Con la mente fría y el pulso firme"')}
                    className="w-full text-left p-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded text-[10px] text-stone-300 font-mono transition-colors cursor-pointer"
                  >
                    + Agregar frase insignia
                  </button>
                </div>
              </div>
            </div>

            {/* Main File Editor Canvas */}
            <div className="flex-1 flex flex-col bg-stone-900/40 overflow-hidden">
              <div className="p-3 bg-stone-950/80 border-b border-stone-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span className="font-mono font-bold text-xs text-amber-200">
                    /vault/{VAULT_FILE_INFO[selectedFile].fileName}
                  </span>
                  <span className="text-xs text-stone-400 font-serif italic hidden sm:inline">
                    — {VAULT_FILE_INFO[selectedFile].desc}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyContent}
                    className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs rounded font-mono flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>

                  <button
                    onClick={handleSaveVaultFile}
                    disabled={isSaving}
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-serif font-black text-xs uppercase tracking-wider rounded flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50 transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Guardando...' : saveSuccess ? '¡Guardado!' : 'Guardar en Bóveda'}</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto">
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full h-full min-h-[400px] bg-stone-950 border border-stone-800 text-amber-100 font-mono text-xs leading-relaxed p-4 rounded-xl focus:outline-none focus:border-amber-500 resize-none shadow-inner selection:bg-amber-800"
                  placeholder="Escribe el contenido Markdown de este archivo de memoria..."
                  spellCheck={false}
                />
              </div>

              <div className="px-4 py-2 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-[11px] font-mono text-stone-500">
                <span>Caracteres: {editedContent.length} • Formato: Markdown UTF-8</span>
                <span className="text-amber-500/80">Memoria viva e inmutable del Agente Digital</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: IN-CHARACTER CHAT WITH DIGITAL ARTIST */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden min-h-[500px]">
            <div className="p-3 bg-amber-950/30 border-b border-amber-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span className="font-serif font-bold text-xs text-amber-200 uppercase tracking-wide">
                  Diálogo Directo en el Estudio con {agent.name}
                </span>
              </div>
              <span className="text-[11px] font-mono text-stone-400">
                Responde en personaje usando sus 5 archivos de memoria
              </span>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-stone-950">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-stone-500 max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-full bg-amber-950/40 border border-amber-800/40 mx-auto flex items-center justify-center text-3xl mb-3">
                    {agent.avatar || '🤠'}
                  </div>
                  <h4 className="font-serif font-bold text-amber-300 text-sm uppercase mb-1">
                    Comienza a platicar con {agent.name}
                  </h4>
                  <p className="text-xs text-stone-400 mb-4">
                    Pregúntale sobre sus canciones, anécdotas, sugerencias para arreglos de requinto o pídele una idea nueva de corrido.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      '¿Qué rola traes en mente para hoy?',
                      '¿Qué afinación le metemos a la docerola?',
                      'Cuéntame de tu historia en Culiacán',
                      'Armemos un corrido a 144 BPM'
                    ].map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setChatInput(prompt);
                        }}
                        className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 rounded-full text-xs font-mono transition-colors cursor-pointer"
                      >
                        "{prompt}"
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] text-stone-500">
                        {msg.sender === 'user' ? 'Tú (Productor)' : agent.name}
                      </span>
                      <span className="text-[10px] text-stone-600 font-mono">{msg.timestamp}</span>
                      {msg.memorySourceRef && msg.memorySourceRef.length > 0 && (
                        <div className="flex items-center gap-1">
                          {msg.memorySourceRef.map((ref, idx) => (
                            <span key={idx} className="bg-amber-950 text-amber-400 border border-amber-800/60 text-[9px] font-mono px-1.5 py-0.2 rounded">
                              📖 {ref}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl max-w-xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-amber-600 text-stone-950 font-medium rounded-tr-none'
                          : 'bg-stone-900 border border-stone-800 text-stone-200 rounded-tl-none whitespace-pre-wrap'
                      }`}
                    >
                      {msg.text}

                      {/* Attached Song Idea Card */}
                      {msg.suggestedSongIdea && (
                        <div className="mt-3 p-3 bg-stone-950 border border-amber-500/50 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-serif font-black text-amber-300 text-xs uppercase flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              Idea Propuesta: "{msg.suggestedSongIdea.title}"
                            </span>
                            <span className="text-[10px] font-mono bg-amber-950 px-2 py-0.5 text-amber-400 border border-amber-800 rounded">
                              {agent.stats?.activeBpm || 144} BPM
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-400 italic">
                            {msg.suggestedSongIdea.story}
                          </p>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] font-mono text-stone-400">
                              {msg.suggestedSongIdea.instrument}
                            </span>
                            <button
                              onClick={() => handleTakeIdeaToStudio(msg.suggestedSongIdea!)}
                              className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-serif font-black text-[11px] uppercase tracking-wider rounded flex items-center gap-1 shadow cursor-pointer transition-transform active:scale-95"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Llevar al Estudio</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendChat} className="p-3 bg-stone-950 border-t border-stone-800 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Escríbele a ${agent.name} (ej. "¿Qué verso le ponemos al coro?")`}
                className="flex-1 bg-stone-900 border border-stone-800 focus:border-amber-500 text-stone-100 text-xs px-4 py-2.5 rounded-xl focus:outline-none font-mono"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isChatSending}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-stone-950 font-serif font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isChatSending ? 'Pensando...' : 'Enviar'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: AGENT COMPUTER TERMINAL OS */}
        {activeTab === 'terminal' && (
          <div className="flex-1 flex flex-col bg-black overflow-hidden font-mono min-h-[500px]">
            <div className="p-3 bg-stone-950 border-b border-stone-800 flex items-center justify-between text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-emerald-300">
                  agent_os@medina-tech:~/{agent.id}$
                </span>
              </div>
              <span className="text-[11px] text-stone-500">
                Comandos: status, ls, cat brain.md, think, bpm 144, clear, help
              </span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-1.5 text-xs text-emerald-400/90 font-mono">
              {terminalHistory.map((line, idx) => (
                <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                  {line.startsWith('$') ? (
                    <span className="text-amber-300 font-bold">{line}</span>
                  ) : line.startsWith('[') ? (
                    <span className="text-cyan-400">{line}</span>
                  ) : (
                    line
                  )}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>

            <form onSubmit={handleTerminalSubmit} className="p-3 bg-stone-950 border-t border-stone-800 flex items-center gap-2">
              <span className="text-emerald-400 text-xs font-bold">$</span>
              <input
                type="text"
                value={terminalCommand}
                onChange={(e) => setTerminalCommand(e.target.value)}
                placeholder="Escribe un comando (ej: help, status, cat brain.md, think)..."
                className="flex-1 bg-transparent text-emerald-300 text-xs focus:outline-none font-mono"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 text-xs rounded font-mono cursor-pointer"
              >
                Ejecutar
              </button>
            </form>
          </div>
        )}

        {/* Tab 4: MUSICAL DNA & GEAR */}
        {activeTab === 'dna' && (
          <div className="flex-1 p-6 overflow-y-auto bg-stone-950 space-y-6 min-h-[500px]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-stone-900/60 border border-amber-900/40 rounded-xl space-y-2">
                <span className="text-[11px] font-mono text-amber-500 uppercase font-bold flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5" /> Estilo de Corrido
                </span>
                <p className="font-serif font-black text-amber-200 text-base">
                  {agent.genre}
                </p>
                <p className="text-xs text-stone-400">
                  Subgénero: {agent.subgenre || 'Corrido Bélico Progresivo'}
                </p>
              </div>

              <div className="p-4 bg-stone-900/60 border border-amber-900/40 rounded-xl space-y-2">
                <span className="text-[11px] font-mono text-amber-500 uppercase font-bold flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" /> Tempo Activo de Concierto
                </span>
                <p className="font-serif font-black text-amber-200 text-base">
                  {agent.stats?.activeBpm || 144} BPM
                </p>
                <p className="text-xs text-stone-400">
                  Rango óptimo: 138 – 152 BPM (Banda en Vivo y Requintos)
                </p>
              </div>

              <div className="p-4 bg-stone-900/60 border border-amber-900/40 rounded-xl space-y-2">
                <span className="text-[11px] font-mono text-amber-500 uppercase font-bold flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> Sello & Catálogo
                </span>
                <p className="font-serif font-black text-amber-200 text-base">
                  {agent.stats?.songsCreated || 14} Canciones
                </p>
                <p className="text-xs text-stone-400">
                  {agent.recordLabel}
                </p>
              </div>
            </div>

            {/* Quick Preview of MUSIC.md */}
            <div className="p-5 bg-stone-900/40 border border-stone-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-amber-300 uppercase tracking-wide flex items-center gap-2">
                  <FileText className="w-4 h-4 text-rose-400" />
                  Archivo MUSIC.md (Extracto del ADN Instrumental)
                </span>
                <button
                  onClick={() => {
                    setSelectedFile('music');
                    setActiveTab('vault');
                  }}
                  className="text-xs text-amber-400 hover:underline font-mono flex items-center gap-1 cursor-pointer"
                >
                  <span>Editar en Bóveda</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <pre className="p-4 bg-stone-950 border border-stone-800 rounded-lg text-xs font-mono text-amber-100/90 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {agent.vault?.musicMd || 'Sin especificaciones musicales.'}
              </pre>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
