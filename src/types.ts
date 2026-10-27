export interface LyricStanza {
  type: 'verso' | 'coro' | 'outro';
  text: string;
}

export type VoiceModelId = 'Fenrir' | 'Charon' | 'Puck' | 'Zephyr' | 'Aoede' | 'Kore';

export interface CustomStemTrack {
  id: string;
  name: string;
  audioUrl: string;
  type: 'instrumental' | 'beat' | 'lead' | 'bass' | 'vocal' | 'custom';
  volume: number; // 0 to 1
  pan?: number;
  isMuted?: boolean;
  isSolo?: boolean;
}

export interface CustomAudioTrack {
  id: string;
  title: string;
  artistName?: string;
  fileName: string;
  fileSize: number;
  duration: number; // in seconds
  detectedBpm?: number;
  musicalKey?: string;
  timeSignature?: string;
  audioUrl: string;
  blob?: Blob;
  peaks?: number[];
  createdAt: number;
  notes?: string;
}

export interface CorridoData {
  title: string;
  storySummary: string;
  lyrics: LyricStanza[];
  coverPrompt: string;
  musicalKey: string;
  tempo: string; // e.g., "115 BPM"
  timeSignature: string; // e.g., "3/4 (Vals Corrido)" or "2/4 (Polka Corrido)"
  style?: CorridoStyle;
  selectedVoice?: VoiceModelId | string;
  imageUrl?: string; // Base64 image URL or fallback
  vocalAudioUrl?: string; // Base64 TTS audio URL
  audioUrl?: string;
  proAudioUrl?: string;
  clipAudioUrl?: string;
  take2AudioUrl?: string;
  songHash?: string; // Unique Account / Song Hash e.g. #CORR-74E9
  chosenOption?: 'A' | 'B';
  marketingTag?: string;
  genreCategory?: GenreCategory;
  musicalGenreTag?: string;
  primaryLanguage?: 'es' | 'en' | 'spanglish' | 'bilingual';
  // User Custom Instrumental Track Integration
  isCustomInstrumental?: boolean;
  customAudioUrl?: string;
  customAudioFileName?: string;
  customAudioDuration?: number;
  customAudioPeaks?: number[];
  customStems?: CustomStemTrack[];
  recordedVocalUrl?: string;
  validation_hash?: string;
  // Veo Music Video Integration
  hasMusicVideo?: boolean;
  videoUrl?: string;
  videoPosterUrl?: string;
  videoModel?: string;
  videoAspectRatio?: '16:9' | '9:16';
  videoResolution?: string;
  videoDirectorPrompt?: string;
}

export type GenreCategory = 
  | 'regional_belico' 
  | 'norteno'
  | 'banda'
  | 'mariachi'
  | 'rap_corrido' 
  | 'latin_urban' 
  | 'us_hiphop' 
  | 'global_pop_rnb'
  | 'country_americana'
  | 'rock_alternative'
  | 'afrobeats_caribbean'
  | 'electro_fusion' 
  | 'acoustic_pop'
  | 'custom_tag';

export interface GenreSeparationInfo {
  id: GenreCategory;
  name: string;
  shortLabel: string;
  flagEmoji: string;
  colorTheme: string;
  marketTag: string;
  dspPitchCategory: string;
  targetAudience: string;
  recommendedCampaign: string;
  trendingHashtags: string[];
  keyBpmRange: string;
  languageDefault?: 'es' | 'en' | 'spanglish' | 'bilingual';
}

export type CorridoStyle =
  | 'Rap Corrido Mexicano (Santa Fe Klan, Alemán & Dan Sanchez / Flow Callejero con 808 y Requintos)'
  | 'Modern Banda/Bélico (Requintos 12 Cuerdas, Metales en Vivo y Tamborazo)'
  | 'En Vivo Desde el Palenque: Corrido de Banda en Concierto (Gritos del Público, Metales en Vivo y Tarolazo)'
  | 'Hard-Hitting Street Rap & Menacing 808 Trap (Metro & 21 Savage / Dark Cinematic Beats / No Pop)'
  | 'Reggaeton Perreo 2026 (Bad Bunny & Feid / Heavy Dembow & Synth Stabs)'
  | 'Trap Latino Pesado (Anuel AA & Eladio Carrión / 808s & Flow Oscuro)'
  | 'Electro Corrido Festival (Steve Aoki & Deorro / 128 BPM Synth Drops & Requinto)'
  | 'Pop Regional & Balada Acústica (Carín León & Christian Nodal / Guitarras & Sentimiento)'
  | 'Grupo Mente Maestra (Bélico Estratégico, Requintos Dobles y Tarolas 2026)'
  | 'Estilo Gerardo Ortiz (Banda Pesada & Corrido Progresivo)'
  | 'Corrido Bélico Tech 2026'
  | 'Bélico Tumbado 2026'
  | 'Legado 7 & Sierreño Urbano (Requintos 12 Cuerdas y Batería)'
  | 'Corrido de Banda Sinaloense Brava'
  | 'Baja Cali Fronterizo (Docerolas y Metales en Vivo)'
  | 'Corrido Urbano Callejero'
  | 'Tumbado Melódico Vanguardia'
  | 'Norteño Moderno con Tarolas'
  | 'Sierreño Campirano'
  | 'Corrido Norteño Clásico'
  | 'Houston Texas Rap (UGK & Z-Ro Style / Slow Rolling 808s)'
  | 'Modern Trap & Rap (Metro Boomin / Drake / Hard 808s & Fast Hi-Hats)'
  | 'Rap / Trap (English Hip Hop Instrumental)'
  | (string & {});

export type FeaturedInstrument =
  | 'Sub-Bass 808 Callejero, Requinto Docerola y Tarola Hip-Hop'
  | 'Heavy Dembow Riddim, 808 Sub-Bass & Modern Lead Synths'
  | 'Dark 808 Bass, Glockenspiel Stabs & Spanish Trap Percussion'
  | '128 BPM Club Kick, EDM Drop Synths & 12-String Requinto Stabs'
  | 'Guitarras Acústicas de Concierto, Bajo Fretless y Percusión Suave'
  | 'Dembow Kick & Snare Syncopado, 808 Sub y Sintetizadores Urbanos'
  | '808 Sub Bass Pesado, Hi-Hats Rápidos y Rimshots Secos de Trap'
  | 'Sintetizadores Lead EDM, Kick a 4 Tiempos y Requinto Electroacústico'
  | 'Guitarra Acústica de Nylon, Bajo Cálido y Percusión Suave'
  | 'Requinto 12 Cuerdas, Metales en Vivo y Tambora'
  | 'Trombones en Vivo, Tarolazos de Concierto y Animación'
  | 'Menacing Sliding 808s, Hard Rimshots & Dark Bells'
  | 'Requinto Doble Púa y Tarola Militar Seca'
  | 'Requinto 12 Cuerdas Rápido y Tambora Pesada'
  | 'Docerola 12 Cuerdas y Batería Pesada'
  | 'Requinto (12 Cuerdas)'
  | 'Trombón y Charcheta'
  | 'Tuba y Tambora Sinaloense'
  | 'Batería y Percusiones'
  | 'Acordeón Diatónico'
  | 'Bajo Eléctrico y Sousafón'
  | 'Hard-Hitting 808 Bass & Rolling Trap Hi-Hats'
  | 'Heavy Houston 808s & Soulful Texas Keys'
  | '808 Sub-Bass & Synth Beats'
  | 'Requinto'
  | 'Acordeón'
  | 'Metales'
  | (string & {});

export type BandInspiration =
  | 'Rap Corrido Mexicano (Santa Fe Klan / Alemán / Dan Sanchez / Flow Callejero en Español con 808 y Docerolas)'
  | 'Reggaeton Perreo 2026 (Bad Bunny / Feid / Ryan Castro / Dembow Pesado)'
  | 'Trap Latino Pesado (Anuel AA / Eladio Carrión / Myke Towers / 808s & Calle)'
  | 'Electro Corrido Festival (Steve Aoki / Deorro / Fuerza Regida EDM Remixes)'
  | 'Pop Regional & Balada Romántica (Carín León / Christian Nodal / Intocable Melódico)'
  | 'En Vivo Desde el Palenque / Concierto en Vivo (Gritos del Público, Trombones Bravos y Tamborazo)'
  | 'Hard-Hitting Street Rap & Dark 808 Trap (Metro Boomin / 21 Savage / Future / No Pop / Gritty Street Flow)'
  | 'Modern Banda / Bélico en Vivo (Requintos 12 Cuerdas, Metales de Concierto y Tamborazos)'
  | 'Grupo Mente Maestra (Bélico Pesado, Requintos Dobles a Doble Púa, Tarolas Secas y Sousafón)'
  | 'Gerardo Ortiz (Banda Pesada, Tamborazos Fuertes, Tarolas Bravas y Requinto Picado)'
  | 'Banda Sinaloense Brava (Tuba Sinaloense, Tambora, Clarinete y Trombón de Culiacán)'
  | 'Legado 7 & Herencia de Patrones (Sierreño Urbano, Requintos Rápidos y Batería)'
  | 'Tito Double P & Peso Pluma (Bélico Tumbado 2026, Trombón de Vara y Requintos)'
  | 'Fuerza Regida & Calle 664 (Baja Cali Urbano, Sousafón y Flow Callejero)'
  | 'Natanael Cano & Junior H (Tumbado Melódico, Armonías en Menor)'
  | 'Oscar Maydon & Gabito Ballesteros (Tumbado Moderno, Charchetas y Metales)'
  | 'Grupo Arriesgado & Panther Bélico (Norteño Moderno con Tarolazos)'
  | 'Los Dareyes de la Sierra (Campirano Pesado, Terceras Chillonas y Trombón)'
  | 'Modern Trap & Rap (Metro Boomin / Drake / Travis Scott / Heavy 808s & Fast Hi-Hats)'
  | 'Houston Texas Underground Rap (UGK / Bun B / Z-Ro / Trae tha Truth / Scarface Style)'
  | 'Estilo Libre Personalizado';

export interface CompositionHarness {
  id: string;
  name: string;
  badge: string;
  description: string;
  icon?: string;
  style: CorridoStyle;
  instrument: FeaturedInstrument;
  bandInspiration: string;
  tempoBpm: number;
  meter: string; // e.g. "3/4 Vals Zapateado", "2/4 Polka Corrido", "6/8 Corrido Alterado", "4/4 Street Beat"
  rhymeScheme: string; // e.g. "ABCB Consonante", "AABB Pareados", "ABBA Cruzada"
  syllableTarget: string; // e.g. "8 Sílabas (Octosílabo Estricto)", "8-10 Sílabas (Tumbado Fluido)"
  narrativeStructure: string; // e.g. "6 Estrofas (Intro, Desarrollo, Coro Doble, Remate)"
  leadVoice: 'Fenrir' | 'Charon' | 'Puck' | 'Zephyr';
  suggestedTheme: string;
  defaultHook: string;
  isCustom?: boolean;
  author?: string;
  createdAt?: string;
}

export interface ComposerInputs {
  name: string;
  story: string;
  partner: string;
  style: CorridoStyle;
  instrument: FeaturedInstrument;
  tempoBpm?: number; // Dynamic tempo: 125 - 155 BPM, default 142 (Modern fast corridos)
  bandInspiration?: string;
  storyTheme?: string;
  locationSetting?: string;
  slangHook?: string;
  selectedVoice?: VoiceModelId | string;
  harnessId?: string;
  harnessName?: string;
  harnessMeter?: string;
  harnessRhymeScheme?: string;
  harnessSyllables?: string;
  harnessStructure?: string;
  originStory?: string;
  conflictFeat?: string;
  loyaltyCrew?: string;
  closingRemate?: string;
  storyMode?: 'structured' | 'freeform';
  musicalGenreTag?: string;
  genreCategory?: GenreCategory;
  marketingTag?: string;
  primaryLanguage?: 'es' | 'en' | 'spanglish' | 'bilingual';
  autoLaunchVideo?: boolean;
}

export type BillingPlanId = 'single_master' | 'producer_pack' | 'label_unlimited' | 'custom_tip';

export interface BillingPlan {
  id: BillingPlanId;
  name: string;
  tagline: string;
  priceUsd: number;
  period?: 'one-time' | 'month';
  credits: number;
  popular?: boolean;
  badge?: string;
  features: string[];
}

export interface UserLicenseState {
  appUserId?: string;
  credits: number;
  unlockedSongHashes: string[];
  currentTier: BillingPlanId | 'free_preview';
  commercialRights: boolean;
  totalSpentUsd: number;
  lastPaymentDate?: string;
  activeEntitlements?: string[];
  revenueCatCustomerInfo?: any;
}

export interface RevenueCatConfigResponse {
  configured: boolean;
  publicKey: string;
  currency: string;
  plans: BillingPlan[];
  appUserId: string;
}

export type ChannelType = 'spotify' | 'youtube' | 'tiktok' | 'apple_music' | 'soundcloud' | 'distrokid';

export interface ChannelConnection {
  id: ChannelType;
  name: string;
  subtitle: string;
  icon: string;
  connected: boolean;
  accountName?: string;
  channelId?: string;
  avatarUrl?: string;
  lastSynced?: string;
  features: string[];
  authType: 'oauth' | 'api_key' | 'partner_ingest';
  oauthEndpoint?: string;
}

export interface DeploymentChannelResult {
  channel: ChannelType;
  name: string;
  status: 'pending' | 'processing' | 'live' | 'failed';
  liveUrl?: string;
  externalId?: string;
  message?: string;
  stats?: {
    views?: number;
    streams?: number;
    saves?: number;
    shares?: number;
  };
}

export interface SongDeployment {
  id: string;
  songTitle: string;
  songHash: string;
  artistName: string;
  genre: string;
  isrc: string;
  upc: string;
  label: string;
  releaseDate: string;
  deployedAt: string;
  explicit: boolean;
  channels: DeploymentChannelResult[];
  audioSource: 'full_master' | 'preview_clip';
  audioUrl?: string;
  coverUrl?: string;
  lyricsSnippet?: string;
}

// ==========================================
// AUTONOMOUS DIGITAL ARTIST AGENTS & VAULT
// ==========================================

export type VaultFileType = 'brain' | 'user' | 'lifestyle' | 'type' | 'music' | string;

export interface AgentVaultMemory {
  brainMd: string;     // BRAIN.md - Core cognitive engine, behavioral rules, worldview, philosophy, loyalty code
  userMd: string;      // USER.md - Producer relationship, shared history, trust level, collaborative memories
  lifestyleMd: string; // LIFESTYLE.md - Backstory, turf/origin, wardrobe, jewelry, rides, daily routine, codes
  typeMd: string;      // TYPE.md - Persona archetype, slang dictionary, cadence, vocal attitude, delivery
  musicMd: string;     // MUSIC.md - Musical DNA, requinto/brass tuning, BPM specs, lyrical motifs, discography
  customFiles?: Record<string, string>; // Extra markdown files (e.g. CREW.md, DISCOGRAPHY.md)
}

export interface AgentTerminalLog {
  id: string;
  timestamp: string;
  level: 'info' | 'brain' | 'memory' | 'music' | 'warn' | 'success';
  message: string;
}

export interface AgentMemoryChatMessage {
  id: string;
  sender: 'user' | 'agent';
  timestamp: string;
  text: string;
  memorySourceRef?: string[]; // e.g. ["BRAIN.md", "LIFESTYLE.md"]
  suggestedSongIdea?: {
    title: string;
    story: string;
    style: CorridoStyle;
    instrument: FeaturedInstrument;
  };
}

export interface DigitalArtistAgent {
  id: string;
  name: string; // e.g. "El Gavilán Bélico"
  alias?: string; // e.g. "El 70 de Culiacán"
  archetype: string; // e.g. "Estratega Bélico & Líder Militar"
  avatar: string; // Emoji or image URL
  genre: CorridoStyle;
  subgenre?: string;
  recordLabel: string; // e.g. "Medina Tech Records / Bélico Records"
  location: string; // e.g. "Culiacán, Sinaloa / Dallas, TX"
  status: 'active' | 'recording' | 'writing' | 'touring' | 'idle';
  createdDate: string;
  lastActive: string;
  monthlyListeners?: string; // e.g. "18.4M"
  riaaCertifications?: Array<{ award: 'Platinum' | 'Multi-Platinum' | 'Diamond' | 'Gold'; title: string; count?: number }>;
  chartHighlights?: string[];
  studioGear?: {
    mic?: string;
    instruments?: string[];
    monitors?: string;
    preamp?: string;
    analogConsole?: string;
  };
  discography?: Array<{
    title: string;
    year: string;
    streams: string;
    bpm?: number;
    key?: string;
    certification?: string;
  }>;
  vocalChain?: string;
  signatureQuotes?: string[];
  vault: AgentVaultMemory;
  stats: {
    songsCreated: number;
    memoryEntries: number;
    vaultSizeKb: number;
    activeBpm: number;
  };
  terminalLogs?: AgentTerminalLog[];
  chatHistory?: AgentMemoryChatMessage[];
}

// ==========================================
// VEO 3.1 & VEO 2 AI MUSIC VIDEO STUDIO TYPES
// ==========================================

export type VeoModelType = 'veo-3.1-fast-generate-preview' | 'veo-3.1-generate-preview' | 'veo-3.1-lite-generate-preview';
export type VideoAspectRatio = '16:9' | '9:16';
export type VideoResolution = '720p' | '1080p' | '4k';

export interface VeoDirectorPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  promptTemplate: string;
  suggestedCamera: string;
  lightingStyle: string;
  icon: string;
}

export interface VeoVideoScene {
  id: string;
  title: string;
  prompt: string;
  imageUrl?: string;
  cameraMovement: 'cinematic_drone' | 'slow_pan' | 'dynamic_zoom' | 'stage_orbit' | 'fpv_rush' | 'static_portrait';
  timeStartSec: number;
  durationSec: number;
  associatedLyric?: string;
}

export interface VeoMusicVideoProject {
  id: string;
  title: string;
  artistName: string;
  style: string;
  audioUrl: string;
  coverImageUrl?: string;
  aspectRatio: VideoAspectRatio;
  resolution: VideoResolution;
  model: VeoModelType;
  scenes: VeoVideoScene[];
  operationName?: string;
  videoUrl?: string;
  status: 'idle' | 'generating_veo' | 'polling' | 'syncing_audio' | 'ready' | 'error';
  progressPercent: number;
  progressMessage: string;
  tokensSpent: number;
  createdAt: string;
}

// ==========================================
// DISTROKID & DDEX GLOBAL DISTRIBUTION ENGINE
// ==========================================

export type DistroKidReleaseType = 'single' | 'ep' | 'album';
export type DistroKidExplicitStatus = 'clean' | 'explicit' | 'radio_edit';

export interface DistroKidSongwriterCredit {
  name: string;
  role: 'composer' | 'lyricist' | 'producer' | 'arranger';
  proAffiliation?: 'BMI' | 'ASCAP' | 'SESAC' | 'SACM' | 'None';
  ipiNumber?: string;
}

export interface DistroKidSplitItem {
  id: string;
  recipientName: string;
  recipientEmail: string;
  role: string;
  percentage: number;
  isPaid: boolean;
}

export interface DistroKidAddons {
  hyperFollow: boolean;
  youtubeContentId: boolean;
  leaveLegacy: boolean;
  shazamSiri: boolean;
  storeMaximizer: boolean;
  tidalMasterHiRes: boolean;
  dolbyAtmosSpatial: boolean;
}

export interface DistroKidReleasePackage {
  id: string;
  releaseType: DistroKidReleaseType;
  songTitle: string;
  versionInfo?: string;
  artistName: string;
  featuredArtists?: string[];
  primaryGenre: string;
  secondaryGenre?: string;
  primaryLanguage: string;
  label: string;
  copyrightYear: number;
  phonogramCopyright: string;
  isrc: string;
  upc: string;
  explicitStatus: DistroKidExplicitStatus;
  releaseDate: string;
  releaseTime?: string;
  preSaveEnabled: boolean;
  songwriters: DistroKidSongwriterCredit[];
  producers: string[];
  splits: DistroKidSplitItem[];
  addons: DistroKidAddons;
  selectedDSPs: string[];
  audioSource: 'full_master' | 'preview_clip';
  audioUrl?: string;
  coverUrl?: string;
  status: 'draft' | 'validated' | 'processing_ddex' | 'sent_to_stores' | 'live';
  ddexXml?: string;
  hyperFollowUrl?: string;
  createdAt: string;
}

export interface DistroKidDSPInfo {
  id: string;
  name: string;
  category: 'streaming' | 'social_sync' | 'regional' | 'hi_res';
  icon: string;
  logoColor: string;
  storesCovered: number;
  description: string;
  estimatedDeliveryHours: number;
  supportsDolbyAtmos?: boolean;
  supportsLyrics?: boolean;
}

export interface DistroKidEarningsData {
  totalEarnedUsd: number;
  pendingPayoutUsd: number;
  withdrawnUsd: number;
  totalStreams: number;
  streamBreakdown: Array<{
    dsp: string;
    dspName: string;
    icon: string;
    streams: number;
    revenueUsd: number;
    percentage: number;
  }>;
  payoutHistory: Array<{
    id: string;
    date: string;
    amountUsd: number;
    method: string;
    status: 'completed' | 'processing';
  }>;
}

// ==========================================
// GEMINI RHYME SUGGESTER & RAPPER PERSONA TYPES
// ==========================================

export type RapperPersonaId = 
  | 'houston_og' 
  | 'dark_trap' 
  | 'rap_corrido' 
  | 'belico_tumbado' 
  | 'latin_trap' 
  | 'lyricist_flow' 
  | 'melodic_sierreno' 
  | 'west_coast';

export interface RapperPersona {
  id: RapperPersonaId;
  name: string;
  tagline: string;
  icon: string;
  cadenceDescription: string;
  rhymeFocus: string;
  sampleArtistRef: string;
  color: string;
}

export interface RhymeWordItem {
  word: string;
  syllables: number;
  meaning?: string;
  samplePhrase: string;
}

export interface MultisyllabicRhymeItem {
  phrase: string;
  syllables: number;
  rhymeScheme: string; // e.g. "AABB Multi (3-Syllable Stack)"
  meterFit: string; // e.g. "Triplet Flow / 4-Bar Terminal"
  sampleBar: string; // Complete lyrical bar incorporating the multisyllabic rhyme
  personaVibe?: string; // Vibe explanation matching the persona
}

export interface InternalRhymeItem {
  internalWord: string;
  terminalWord: string;
  barExample: string;
  cadenceTip: string;
}

export interface PunchlineBarItem {
  setupLine: string;
  punchline: string;
  syllableCount: number;
  cadenceType: string;
}

export interface RhymeSuggestionResponse {
  targetWord: string;
  rapperPersona?: string;
  primaryLanguage?: 'en' | 'es' | 'spanglish';
  rhymeTypeDescription?: string;
  multisyllabic?: MultisyllabicRhymeItem[];
  consonant: RhymeWordItem[];
  assonant: RhymeWordItem[];
  internalRhymes?: InternalRhymeItem[];
  popularPhrases?: string[];
  punchlineBars?: PunchlineBarItem[];
}




