export type AppLanguage = 'en' | 'es';

export interface Translations {
  // Navigation & Brand
  brandName: string;
  brandTagline: string;
  navStudio: string;
  navInstrumentalLab: string;
  navLibrary: string;
  navAgentsHub: string;
  navDistribution: string;
  navVeoCinema: string;
  navMarketing: string;
  navLicenses: string;
  navModules: string;
  newTrack: string;
  creditsLabel: string;
  commercialTier: string;
  tutorialButton: string;

  // Home / Create Studio
  heroTitle1: string;
  heroHighlight: string;
  heroTitle2: string;
  heroSubtitle: string;
  promptPlaceholder: string;
  protagonistLabel: string;
  protagonistPlaceholder: string;
  storyLabel: string;
  storyPlaceholder: string;
  genreSelectorLabel: string;
  voiceSelectorLabel: string;
  attachMediaLabel: string;
  attachMediaChange: string;
  generateClipButton: string;
  generatingClip: string;
  clipReadyBadge: string;
  takeA: string;
  takeB: string;
  listenClip: string;
  pauseClip: string;
  openInStudio: string;
  openInstrumentalLab: string;
  advancedModeTitle: string;
  advancedModeSubtitle: string;

  // Instrumental Studio Lab
  instrumentalStudioTitle: string;
  instrumentalStudioSubtitle: string;
  stemsMixerTitle: string;
  liveVisualizer: string;
  requintoStem: string;
  tubaStem: string;
  brassStem: string;
  accordionStem: string;
  drumsStem: string;
  sub808Stem: string;
  vocalLeadStem: string;
  soloButton: string;
  muteButton: string;
  volumeLabel: string;
  panLabel: string;
  masterEffectsTitle: string;
  analogTapeWarmth: string;
  roomReverb: string;
  stereoSpread: string;
  brickwallLimiter: string;
  livePalenqueCrowd: string;
  aiArrangerTitle: string;
  aiArrangerPromptPlaceholder: string;
  applyAiArrangement: string;
  exportInstrumentalWav: string;
  exportStemsZip: string;
  exportMidi: string;
  tempoBpmLabel: string;
  timeSignatureLabel: string;
  musicalKeyLabel: string;
  playMaster: string;
  stopMaster: string;
  synthesizingSolo: string;
  requintoSoloGenerated: string;

  // Studio Dashboard
  dawHeader: string;
  copilotProducerTitle: string;
  copilotProducerSubtitle: string;
  lyricsEditorTitle: string;
  stemsTab: string;
  lyricsTab: string;
  orchestraTab: string;
  aiVoiceTab: string;
  exportTrack: string;
  distributeTrack: string;
  createMusicVideo: string;

  // Music Library
  libraryTitle: string;
  librarySubtitle: string;
  searchPlaceholder: string;
  filterAll: string;
  playFullMaster: string;
  editInStudio: string;
  totalTracks: string;
  releaseDate: string;
  feature1Title: string;
  feature1Desc: string;
  feature2Title: string;
  feature2Desc: string;
  feature3Title: string;
  feature3Desc: string;
}

export const translations: Record<AppLanguage, Translations> = {
  en: {
    brandName: 'MELODYCRAFT PRO',
    brandTagline: 'Universal AI Music Studio • Dallas & Miami',
    navStudio: 'Studio DAW',
    navInstrumentalLab: 'Instrumental Lab',
    navLibrary: 'Music Library',
    navAgentsHub: 'Digital Artists',
    navDistribution: 'DDEX Distribution',
    navVeoCinema: 'Cinema 4K',
    navMarketing: 'DSP Strategy',
    navLicenses: 'Commercial License',
    navModules: 'Modules',
    newTrack: '+ Compose Track',
    creditsLabel: 'Masters Left',
    commercialTier: 'Enterprise Commercial',
    tutorialButton: 'Quick Guide',

    heroTitle1: 'Create Universal Hits with',
    heroHighlight: 'Pro AI Music Production',
    heroTitle2: 'in Seconds',
    heroSubtitle: 'Type a story, paste reference visuals, or speak with your AI producer. Generates studio-grade vocal tracks, electronic synthwave, R&B grooves, Latin reggaeton, and acoustic folk or corridos in English and Spanish.',
    promptPlaceholder: 'e.g., A driving 128 BPM synthwave pop anthem about midnight drives through Los Angeles...',
    protagonistLabel: 'Artist / Character / Theme:',
    protagonistPlaceholder: 'e.g., Aria Synth, Marcus Vance, Alfredo Medina...',
    storyLabel: 'Story / Concept / Lyrics Idea:',
    storyPlaceholder: 'Describe the mood, storyline, BPM, instrumentation, and emotional vibe...',
    genreSelectorLabel: 'Musical Style & Genre:',
    voiceSelectorLabel: 'AI Voice Model:',
    attachMediaLabel: 'Attach / Paste Visual Reference (Ctrl+V)',
    attachMediaChange: 'Change Reference Art',
    generateClipButton: 'Synthesize 30s Master Clip (Take A + Take B)',
    generatingClip: 'Synthesizing Studio Audio with AI...',
    clipReadyBadge: '30s Studio Clip Ready',
    takeA: 'Take A (Primary)',
    takeB: 'Take B (Alternative)',
    listenClip: 'Play 30s Clip',
    pauseClip: 'Pause Clip',
    openInStudio: 'Open in Full DAW Studio',
    openInstrumentalLab: 'Open in Instrumental Lab',
    advancedModeTitle: 'Advanced Producer Mode',
    advancedModeSubtitle: 'Fine-tune orchestration, lyrical rhyming structures, and acoustic parameters',

    instrumentalStudioTitle: 'AI Instrumental Studio & Stems Lab',
    instrumentalStudioSubtitle: 'Isolate, arrange, and reshape individual acoustic stems with real-time procedural synthesis and AI arrangement models.',
    stemsMixerTitle: 'Acoustic Stem Mixer & Channel Strips',
    liveVisualizer: 'Live Spectrum Analyser',
    requintoStem: 'Requinto (12-String Docerola Solo & Riffs)',
    tubaStem: 'Tuba Sinaloense / Slap Tololoche Bass',
    brassStem: 'Sinaloa Horns & Charchetas Brass Stabs',
    accordionStem: 'Diatonic Accordion & Bellows',
    drumsStem: 'Tarola Militar & Sinaloense Tambora',
    sub808Stem: 'Urban Street 808 Sub-Bass',
    vocalLeadStem: 'Singing Vocal Lead Formants',
    soloButton: 'SOLO',
    muteButton: 'MUTE',
    volumeLabel: 'Gain',
    panLabel: 'Pan',
    masterEffectsTitle: 'Master Bus Processing & Analog Rack',
    analogTapeWarmth: 'Analog Tape Saturation',
    roomReverb: 'Palenque Concert Hall Reverb',
    stereoSpread: '12-String Stereo Width',
    brickwallLimiter: 'Brickwall True-Peak Limiter',
    livePalenqueCrowd: 'Live Crowd Ovation & Grits',
    aiArrangerTitle: 'AI Instrumental Arranger & Solo Engine',
    aiArrangerPromptPlaceholder: 'e.g., Add a double-tempo requinto solo in F# minor, boost the tuba slap on beat 2 and 3...',
    applyAiArrangement: 'Apply AI Instrumental Transformation',
    exportInstrumentalWav: 'Download Master Instrumental (24-bit WAV)',
    exportStemsZip: 'Export Multitrack Stems (ZIP Package)',
    exportMidi: 'Export MIDI Chord Progression',
    tempoBpmLabel: 'Tempo (BPM)',
    timeSignatureLabel: 'Meter (Time Signature)',
    musicalKeyLabel: 'Harmonic Key',
    playMaster: 'Play Master Instrumental',
    stopMaster: 'Stop Playback',
    synthesizingSolo: 'Generating virtuosic requinto solo runs...',
    requintoSoloGenerated: 'Solo successfully mapped to channel strip and audio buffer!',

    dawHeader: 'Professional Digital Audio Workstation',
    copilotProducerTitle: 'AI Executive Producer Copilot',
    copilotProducerSubtitle: 'Voice, text, and multimodal inspiration for live composition',
    lyricsEditorTitle: 'Lyrical Structure & Rhyme Matrix',
    stemsTab: 'Stems & Mixer',
    lyricsTab: 'Lyrics & Verses',
    orchestraTab: 'Virtual Orchestra',
    aiVoiceTab: 'AI Vocal Model',
    exportTrack: 'Export Master (WAV)',
    distributeTrack: 'Distribute (DDEX/DSP)',
    createMusicVideo: 'Veo 3 Cinema 4K',

    libraryTitle: 'Master Hit Catalog & Vault',
    librarySubtitle: 'Explore pre-produced multi-genre hits, listen to instant 30s clips, and load directly into the DAW.',
    searchPlaceholder: 'Search tracks by artist, style, or musical key...',
    filterAll: 'All Hits',
    playFullMaster: 'Listen Preview',
    editInStudio: 'Open in Studio',
    totalTracks: 'Masters Available',
    releaseDate: 'Released',
    feature1Title: 'Multi-Genre Neural Synthesizers',
    feature1Desc: 'Advanced acoustic and electronic models trained on Pop, Electronic, R&B, Reggaeton, and Regional Mexican master stems.',
    feature2Title: 'Live Stem Isolation & Mixing',
    feature2Desc: 'Separate vocals, requintos, synths, bass, and drums instantly with professional channel strip control and analog master FX.',
    feature3Title: 'Sovereign DDEX Distribution',
    feature3Desc: 'Direct distribution pipeline to Spotify, Apple Music, and Tidal with automated ISRC and UPC metadata generation.'
  },
  es: {
    brandName: 'MELODYCRAFT PRO',
    brandTagline: 'Estudio de Música IA Universal • Dallas y Miami',
    navStudio: 'Estudio DAW',
    navInstrumentalLab: 'Laboratorio Instrumental',
    navLibrary: 'Catálogo de Música',
    navAgentsHub: 'Artistas Digitales',
    navDistribution: 'Distribución DDEX',
    navVeoCinema: 'Cine 4K',
    navMarketing: 'Estrategia DSP',
    navLicenses: 'Licencia Comercial',
    navModules: 'Módulos',
    newTrack: '+ Componer Pista',
    creditsLabel: 'Masters Restantes',
    commercialTier: 'Comercial Enterprise',
    tutorialButton: 'Guía Rápida',

    heroTitle1: 'Crea Éxitos Universales con',
    heroHighlight: 'Producción Musical Pro con IA',
    heroTitle2: 'en Segundos',
    heroSubtitle: 'Escribe una idea, pega imágenes de referencia o habla con tu productor IA. Genera temas de pop, electrónica, R&B, reggaetón y corridos en inglés y español con calidad de estudio.',
    promptPlaceholder: 'Ej: Un himno synthwave bailable a 128 BPM sobre un viaje nocturno por Los Ángeles...',
    protagonistLabel: 'Artista / Personaje / Tema:',
    protagonistPlaceholder: 'Ej: Aria Synth, Marcus Vance, Alfredo Medina...',
    storyLabel: 'Historia / Concepto / Idea de Letra:',
    storyPlaceholder: 'Describe el ambiente, la historia, BPM, instrumentación y vibra emocional...',
    genreSelectorLabel: 'Estilo Musical y Género:',
    voiceSelectorLabel: 'Modelo de Voz IA:',
    attachMediaLabel: 'Adjuntar / Pegar Imagen (Ctrl+V)',
    attachMediaChange: 'Cambiar Arte de Referencia',
    generateClipButton: 'Sintetizar Clip de 30s con IA (Toma A + Toma B)',
    generatingClip: 'Sintetizando Audio de Estudio con IA...',
    clipReadyBadge: 'Clip de 30s de Estudio Listo',
    takeA: 'Toma A (Principal)',
    takeB: 'Toma B (Alternativa)',
    listenClip: 'Escuchar Clip de 30s',
    pauseClip: 'Pausar Clip',
    openInStudio: 'Abrir en Estudio DAW Completo',
    openInstrumentalLab: 'Abrir en Laboratorio Instrumental',
    advancedModeTitle: 'Modo Productor Avanzado',
    advancedModeSubtitle: 'Ajusta orquestación, métricas líricas de rima y parámetros acústicos',

    instrumentalStudioTitle: 'Estudio Instrumental IA & Laboratorio de Stems',
    instrumentalStudioSubtitle: 'Aísla, arregla y transforma stems acústicos individuales con síntesis procedural en tiempo real y modelos de arreglos IA.',
    stemsMixerTitle: 'Mezclador de Stems & Canales Acústicos',
    liveVisualizer: 'Analizador de Espectro en Vivo',
    requintoStem: 'Requinto (Docerola de 12 Cuerdas - Solos y Riffs)',
    tubaStem: 'Tuba Sinaloense / Bajo Tololoche Slap',
    brassStem: 'Metales Sinaloenses & Golpes de Charchetas',
    accordionStem: 'Acordeón Diatónico & Fuelles',
    drumsStem: 'Tarola Militar & Tambora Sinaloense',
    sub808Stem: 'Sub-Bass 808 Callejero Urbano',
    vocalLeadStem: 'Formantes Vocales de Canto Guía',
    soloButton: 'SOLO',
    muteButton: 'MUTE',
    volumeLabel: 'Ganancia',
    panLabel: 'Pan',
    masterEffectsTitle: 'Procesamiento Master & Rack Analógico',
    analogTapeWarmth: 'Saturación de Cinta Analógica',
    roomReverb: 'Reverb Sala de Palenque / Auditorio',
    stereoSpread: 'Amplitud Estéreo de 12 Cuerdas',
    brickwallLimiter: 'Limitador Brickwall True-Peak',
    livePalenqueCrowd: 'Ovaciones y Gritos de Palenque',
    aiArrangerTitle: 'Arreglista Instrumental IA & Motor de Solos',
    aiArrangerPromptPlaceholder: 'Ej: Añade un solo de requinto acelerado en Fa# menor y resalta el slap de tuba...',
    applyAiArrangement: 'Aplicar Transformación Instrumental IA',
    exportInstrumentalWav: 'Descargar Master Instrumental (WAV 24-bit)',
    exportStemsZip: 'Exportar Stems Multitrack (Paquete ZIP)',
    exportMidi: 'Exportar Progresión en MIDI',
    tempoBpmLabel: 'Tempo (BPM)',
    timeSignatureLabel: 'Métrica (Compás)',
    musicalKeyLabel: 'Tonalidad Armónica',
    playMaster: 'Reproducir Instrumental Master',
    stopMaster: 'Detener Reproducción',
    synthesizingSolo: 'Generando solo virtuoso de requinto...',
    requintoSoloGenerated: '¡Solo mapeado exitosamente al canal y buffer de audio!',

    dawHeader: 'Estación de Trabajo de Audio Digital Pro',
    copilotProducerTitle: 'Copiloto Productor Ejecutivo IA',
    copilotProducerSubtitle: 'Inspiración por voz, texto y multimodal para composición en vivo',
    lyricsEditorTitle: 'Estructura Lírica & Matriz de Rimas',
    stemsTab: 'Stems & Mezclador',
    lyricsTab: 'Letras & Estrofas',
    orchestraTab: 'Orquesta Virtual',
    aiVoiceTab: 'Modelo de Voz IA',
    exportTrack: 'Exportar Master (WAV)',
    distributeTrack: 'Distribuir (DDEX/DSP)',
    createMusicVideo: 'Veo 3 Cine 4K',

    libraryTitle: 'Bóveda & Catálogo de Hit Masters',
    librarySubtitle: 'Explora éxitos pre-producidos, escucha clips de 30s y cárgalos directo en el estudio.',
    searchPlaceholder: 'Buscar canciones por artista, estilo o tonalidad...',
    filterAll: 'Todos los Éxitos',
    playFullMaster: 'Escuchar Preview',
    editInStudio: 'Abrir en Estudio',
    totalTracks: 'Masters Disponibles',
    releaseDate: 'Lanzamiento',
    feature1Title: 'Sintetizadores Neuronales Multi-Género',
    feature1Desc: 'Modelos acústicos y electrónicos avanzados entrenados en pop, electrónica, R&B, reggaetón y regional mexicano.',
    feature2Title: 'Aislamiento de Stems & Mezcla en Vivo',
    feature2Desc: 'Separa voces, requintos, sintes, bajos y percusiones al instante con canales profesionales y efectos analógicos.',
    feature3Title: 'Distribución DDEX Soberana',
    feature3Desc: 'Canal de distribución directa a Spotify, Apple Music y Tidal con generación automática de códigos ISRC y UPC.'
  }
};
