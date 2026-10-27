import { DigitalArtistAgent, AgentVaultMemory, AgentMemoryChatMessage, AgentTerminalLog } from '../types';
import { DEFAULT_DIGITAL_AGENTS } from '../data/defaultAgents';

const AGENTS_STORAGE_KEY = 'corrido_ai_digital_artist_agents_v1';
const ACTIVE_AGENT_ID_KEY = 'corrido_ai_active_agent_id_v1';

export function getStoredAgents(): DigitalArtistAgent[] {
  try {
    const raw = localStorage.getItem(AGENTS_STORAGE_KEY);
    if (!raw) {
      saveStoredAgents(DEFAULT_DIGITAL_AGENTS);
      return DEFAULT_DIGITAL_AGENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Auto-merge any newly added default agents (e.g. rapper artists) if missing by id
      const existingIds = new Set(parsed.map((a: any) => a.id));
      const missingDefaults = DEFAULT_DIGITAL_AGENTS.filter(d => !existingIds.has(d.id));
      if (missingDefaults.length > 0) {
        const merged = [...parsed, ...missingDefaults];
        saveStoredAgents(merged);
        return merged;
      }
      return parsed;
    }
    saveStoredAgents(DEFAULT_DIGITAL_AGENTS);
    return DEFAULT_DIGITAL_AGENTS;
  } catch (e) {
    console.warn('[AgentStorage] Error reading stored agents, fallback to defaults', e);
    return DEFAULT_DIGITAL_AGENTS;
  }
}

export function saveStoredAgents(agents: DigitalArtistAgent[]): void {
  try {
    localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(agents));
  } catch (e) {
    console.error('[AgentStorage] Failed to persist agents to localStorage', e);
  }
}

export function getActiveAgentId(): string {
  try {
    const active = localStorage.getItem(ACTIVE_AGENT_ID_KEY);
    if (active) return active;
    const agents = getStoredAgents();
    const defaultId = agents[0]?.id || DEFAULT_DIGITAL_AGENTS[0].id;
    setActiveAgentId(defaultId);
    return defaultId;
  } catch {
    return DEFAULT_DIGITAL_AGENTS[0].id;
  }
}

export function setActiveAgentId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_AGENT_ID_KEY, id);
  } catch (e) {
    console.error('[AgentStorage] Failed to set active agent ID', e);
  }
}

export function getActiveAgent(): DigitalArtistAgent {
  const agents = getStoredAgents();
  const activeId = getActiveAgentId();
  const found = agents.find((a) => a.id === activeId);
  return found || agents[0] || DEFAULT_DIGITAL_AGENTS[0];
}

export function updateAgentVault(agentId: string, vaultUpdate: Partial<AgentVaultMemory>): DigitalArtistAgent | null {
  const agents = getStoredAgents();
  const index = agents.findIndex((a) => a.id === agentId);
  if (index === -1) return null;

  const currentAgent = agents[index];
  const updatedVault: AgentVaultMemory = {
    ...currentAgent.vault,
    ...vaultUpdate
  };

  // Calculate approximate vault size
  const totalLength = 
    (updatedVault.brainMd?.length || 0) +
    (updatedVault.userMd?.length || 0) +
    (updatedVault.lifestyleMd?.length || 0) +
    (updatedVault.typeMd?.length || 0) +
    (updatedVault.musicMd?.length || 0);

  const updatedAgent: DigitalArtistAgent = {
    ...currentAgent,
    vault: updatedVault,
    lastActive: 'Justo ahora',
    stats: {
      ...currentAgent.stats,
      vaultSizeKb: Math.max(1, Math.round(totalLength / 1024)),
      memoryEntries: (currentAgent.stats.memoryEntries || 50) + 1
    }
  };

  agents[index] = updatedAgent;
  saveStoredAgents(agents);
  return updatedAgent;
}

export function saveOrUpdateAgent(agent: DigitalArtistAgent): DigitalArtistAgent[] {
  const agents = getStoredAgents();
  const existingIdx = agents.findIndex((a) => a.id === agent.id);

  if (existingIdx >= 0) {
    agents[existingIdx] = {
      ...agent,
      lastActive: 'Justo ahora'
    };
  } else {
    agents.unshift({
      ...agent,
      createdDate: agent.createdDate || new Date().toISOString().split('T')[0],
      lastActive: 'Recién creado'
    });
  }

  saveStoredAgents(agents);
  return agents;
}

export function deleteStoredAgent(agentId: string): DigitalArtistAgent[] {
  const agents = getStoredAgents();
  const filtered = agents.filter((a) => a.id !== agentId);
  const result = filtered.length > 0 ? filtered : DEFAULT_DIGITAL_AGENTS;
  saveStoredAgents(result);
  
  if (getActiveAgentId() === agentId) {
    setActiveAgentId(result[0].id);
  }
  return result;
}

export function addAgentChatMessage(agentId: string, message: AgentMemoryChatMessage): void {
  const agents = getStoredAgents();
  const index = agents.findIndex((a) => a.id === agentId);
  if (index === -1) return;

  const currentHistory = agents[index].chatHistory || [];
  agents[index].chatHistory = [...currentHistory, message];
  agents[index].lastActive = 'Conversando en el Estudio';
  saveStoredAgents(agents);
}

export function addAgentTerminalLog(agentId: string, log: Omit<AgentTerminalLog, 'id' | 'timestamp'>): void {
  const agents = getStoredAgents();
  const index = agents.findIndex((a) => a.id === agentId);
  if (index === -1) return;

  const newLog: AgentTerminalLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toLocaleTimeString(),
    ...log
  };

  const logs = agents[index].terminalLogs || [];
  agents[index].terminalLogs = [...logs.slice(-49), newLog];
  saveStoredAgents(agents);
}
