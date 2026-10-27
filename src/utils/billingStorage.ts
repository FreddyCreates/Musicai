import { BillingPlan, BillingPlanId, UserLicenseState } from '../types';

export const PRICING_PLANS: BillingPlan[] = [
  {
    id: 'single_master',
    name: 'Master Oficial HD (Single)',
    tagline: 'Desbloquea 1 Corrido Master con Calidad de Estudio',
    priceUsd: 9.99,
    period: 'one-time',
    credits: 1,
    badge: 'Más Accesible',
    features: [
      'Descarga Master Oficial WAV (Calidad de Estudio 160 BPM)',
      'Audio Completo sin límites de duración',
      'Pistas de Voz Masculina HD Verbatim',
      'Portada Artística Oficial 4K (Sin marcas de agua)',
      'Certificado de Licencia Comercial de por vida'
    ]
  },
  {
    id: 'producer_pack',
    name: 'Pack Productor Bélico',
    tagline: 'Para artistas, compositores independientes y creadores',
    priceUsd: 24.99,
    period: 'one-time',
    credits: 5,
    popular: true,
    badge: '🔥 Más Popular',
    features: [
      '5 Créditos de Master Oficial WAV Full',
      'Generación y Descarga Prioritaria en Alta Fidelidad',
      'Exportación de Stems / Pistas Separadas (Voz + Requinto + Banda)',
      'Portadas 4K Ultra Personalizadas con Logo',
      'Soporte para Distribución en Spotify / Apple Music / YouTube'
    ]
  },
  {
    id: 'label_unlimited',
    name: 'Sello Discográfico VIP',
    tagline: 'Acceso mensual para sellos y creadores de contenido',
    priceUsd: 69.99,
    period: 'month',
    credits: 999,
    badge: 'VIP Sello',
    features: [
      'Corridos Ilimitados cada mes en Calidad Master',
      'Generación Instantánea con IA y Prioridad Máxima',
      'Derechos de Distribución y Monetización 100% tuyos',
      'Exportación Multitrack WAV + Letras Sincronizadas',
      'Asistente IA "El Caporal" exclusivo 24/7'
    ]
  }
];

const STORAGE_KEY = 'rey_corrido_user_license_v1';

export function getOrCreateAppUserId(): string {
  try {
    const existing = localStorage.getItem('revenuecat_app_user_id');
    if (existing) return existing;
    const newId = `rc_user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('revenuecat_app_user_id', newId);
    return newId;
  } catch (err) {
    return `rc_user_${Date.now()}`;
  }
}

export function getInitialLicenseState(): UserLicenseState {
  const appUserId = getOrCreateAppUserId();
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        appUserId: parsed.appUserId || appUserId
      };
    }
  } catch (err) {
    console.warn('Could not read user license state from localStorage', err);
  }

  // Default free preview state with 2 complimentary trial credits to try full master generation
  return {
    appUserId,
    credits: 2,
    unlockedSongHashes: [],
    currentTier: 'free_preview',
    commercialRights: false,
    totalSpentUsd: 0,
    lastPaymentDate: undefined,
    activeEntitlements: []
  };
}

export function saveLicenseState(state: UserLicenseState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Could not save user license state to localStorage', err);
  }
}

export function addCreditsAndUnlock(
  planId: BillingPlanId,
  creditsToAdd: number,
  priceUsd: number,
  songHashToUnlock?: string
): UserLicenseState {
  const current = getInitialLicenseState();
  const unlocked = new Set(Array.isArray(current.unlockedSongHashes) ? current.unlockedSongHashes : []);
  if (songHashToUnlock) {
    unlocked.add(songHashToUnlock);
  }

  const newState: UserLicenseState = {
    ...current,
    credits: (current.credits || 0) + creditsToAdd,
    unlockedSongHashes: Array.from(unlocked),
    currentTier: planId,
    commercialRights: true,
    totalSpentUsd: (current.totalSpentUsd || 0) + priceUsd,
    lastPaymentDate: new Date().toISOString()
  };

  saveLicenseState(newState);
  return newState;
}

export function useCreditForSong(songHash: string): { success: boolean; state: UserLicenseState } {
  const current = getInitialLicenseState();
  const unlocked = Array.isArray(current.unlockedSongHashes) ? current.unlockedSongHashes : [];
  if (unlocked.includes(songHash)) {
    return { success: true, state: current };
  }

  if (current.credits > 0 || current.currentTier === 'label_unlimited') {
    const newCredits = current.currentTier === 'label_unlimited' ? current.credits : current.credits - 1;
    const newState: UserLicenseState = {
      ...current,
      credits: Math.max(0, newCredits),
      unlockedSongHashes: [...unlocked, songHash]
    };
    saveLicenseState(newState);
    return { success: true, state: newState };
  }

  return { success: false, state: current };
}

export function isSongUnlocked(
  arg1?: string | UserLicenseState,
  arg2?: UserLicenseState | string
): boolean {
  let songHash: string | undefined;
  let state: UserLicenseState | undefined;

  if (typeof arg1 === 'string') {
    songHash = arg1;
    if (typeof arg2 === 'object' && arg2 !== null) {
      state = arg2 as UserLicenseState;
    }
  } else if (typeof arg1 === 'object' && arg1 !== null) {
    state = arg1 as UserLicenseState;
    if (typeof arg2 === 'string') {
      songHash = arg2;
    }
  }

  if (!songHash) return false;
  const current = state || getInitialLicenseState();
  if (current?.currentTier === 'label_unlimited') return true;
  if (!Array.isArray(current?.unlockedSongHashes)) return false;
  return current.unlockedSongHashes.includes(songHash);
}
