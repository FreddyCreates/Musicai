import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Music, 
  Search, 
  ChevronDown, 
  Plus, 
  Sparkles, 
  Check, 
  Globe, 
  Tag, 
  Layers, 
  X, 
  Sliders, 
  Info,
  Radio
} from 'lucide-react';
import { 
  GenreCategory, 
  CorridoStyle, 
  FeaturedInstrument, 
  ComposerInputs 
} from '../types';
import { 
  GENRE_SEPARATIONS, 
  getGenreSeparationInfo, 
  getGenreCategory 
} from '../utils/genreSeparations';

export interface MusicalStyleOption {
  id: string;
  name: string;
  shortLabel: string;
  category: GenreCategory;
  categoryName: string;
  flagEmoji: string;
  language: 'es' | 'en' | 'bilingual';
  style: CorridoStyle;
  bandInspiration: string;
  instrument: FeaturedInstrument;
  defaultBpm: number;
  timeSignature: string;
  description: string;
  marketingTag: string;
  dspPitchTarget: string;
  targetAudience: string;
  isCustom?: boolean;
}

// Built-in Comprehensive Presets (Mexican Regional, Norteño, Banda, Mariachi, and General English/Global genres)
export const CORE_MUSICAL_STYLES: MusicalStyleOption[] = [
  // 1. Regional Mexicano & Bélico / Tumbados
  {
    id: 'belico-tumbado-2026',
    name: 'Bélico Tumbado 2026 (Tito Double P & Peso Pluma)',
    shortLabel: 'Bélico Tumbado',
    category: 'regional_belico',
    categoryName: 'Regional Mexicano',
    flagEmoji: '🇲🇽',
    language: 'es',
    style: 'Bélico Tumbado 2026',
    bandInspiration: 'Tito Double P & Peso Pluma (Bélico Tumbado 2026, Trombón de Vara y Requintos)',
    instrument: 'Trombón y Charcheta',
    defaultBpm: 130,
    timeSignature: '3/4 (Vals Tumbado)',
    description: 'Trombones de vara cortantes, requintos veloces de 12 cuerdas, batería pesada y adornos de charcheta.',
    marketingTag: 'MARKET: REGIONAL MEXICANO / CORRIDOS TUMBADOS 2026',
    dspPitchTarget: 'Spotify: Corridos 2026, Los Que Mandan • Apple Music: La Brava',
    targetAudience: 'Audiencia masiva joven en México, Texas, California, streaming charts de Corridos Tumbados.'
  },
  {
    id: 'tumbado-melodico',
    name: 'Tumbado Melódico Vanguardia (Junior H & Natanael Cano)',
    shortLabel: 'Tumbado Melódico',
    category: 'regional_belico',
    categoryName: 'Regional Mexicano',
    flagEmoji: '🇲🇽',
    language: 'es',
    style: 'Tumbado Melódico Vanguardia',
    bandInspiration: 'Natanael Cano & Junior H (Tumbado Melódico, Armonías en Menor)',
    instrument: 'Requinto (12 Cuerdas)',
    defaultBpm: 118,
    timeSignature: '3/4 (Vals Melódico)',
    description: 'Requintos melódicos en escala menor, armonías finas de docerola, bajo melancólico y lírica nostálgica.',
    marketingTag: 'MARKET: REGIONAL MEXICANO / TUMBADO SAD & MELÓDICO',
    dspPitchTarget: 'Spotify: Sad Corridos, Tumbado Sentimiento • Apple Music: Corridos Melódicos',
    targetAudience: 'Jóvenes amantes del tumbado introspectivo, melodías de guitarra y letras de desamor o trayectoria.'
  },
  {
    id: 'sierreno-urbano-legado',
    name: 'Sierreño Urbano (Legado 7 & Herencia de Patrones)',
    shortLabel: 'Sierreño Urbano',
    category: 'regional_belico',
    categoryName: 'Regional Mexicano',
    flagEmoji: '🇲🇽',
    language: 'es',
    style: 'Legado 7 & Sierreño Urbano (Requintos 12 Cuerdas y Batería)',
    bandInspiration: 'Legado 7 & Herencia de Patrones (Sierreño Urbano, Requintos Rápidos y Batería)',
    instrument: 'Docerola 12 Cuerdas y Batería Pesada',
    defaultBpm: 126,
    timeSignature: '3/4 (Vals Sierreño)',
    description: 'Docerolas a doble plumilleo rápido, batería acústica con redobles pesados y bajo contundente.',
    marketingTag: 'MARKET: SIERREÑO URBANO / CORRIDOS VERDES & CALLEJEROS',
    dspPitchTarget: 'Spotify: Sierreño Urbano, La Clica • Apple Music: Fuego Sierreño',
    targetAudience: 'Comunidad sierreña urbana de Los Ángeles, Phoenix, Tijuana y Sinaloa.'
  },
  {
    id: 'sierreno-campirano',
    name: 'Sierreño Campirano Moderno (Los Dareyes de la Sierra)',
    shortLabel: 'Sierreño Campirano',
    category: 'regional_belico',
    categoryName: 'Regional Mexicano',
    flagEmoji: '🇲🇽',
    language: 'es',
    style: 'Sierreño Campirano',
    bandInspiration: 'Los Dareyes de la Sierra (Campirano Pesado, Terceras Chillonas y Trombón)',
    instrument: 'Requinto (12 Cuerdas)',
    defaultBpm: 124,
    timeSignature: '3/4 (Vals Campirano)',
    description: 'Docerolas campiranas chillando en terceras, batería acústica, requinto rústico veloz y bajo de cajón.',
    marketingTag: 'MARKET: SIERREÑO CAMPIRANO / RANCHOS & SIERRA',
    dspPitchTarget: 'Spotify: Sierreño de Corazón • Apple Music: Campirano Puro',
    targetAudience: 'Público tradicional de la sierra de Sonora, Sinaloa, Chihuahua y estados ganaderos de EE.UU.'
  },
  {
    id: 'mente-maestra',
    name: 'Grupo Mente Maestra (Bélico Estratégico & Tarolas)',
    shortLabel: 'Bélico Estratégico',
    category: 'regional_belico',
    categoryName: 'Regional Mexicano',
    flagEmoji: '🇲🇽',
    language: 'es',
    style: 'Grupo Mente Maestra (Bélico Estratégico, Requintos Dobles y Tarolas 2026)',
    bandInspiration: 'Grupo Mente Maestra (Bélico Pesado, Requintos Dobles a Doble Púa, Tarolas Secas y Sousafón)',
    instrument: 'Requinto Doble Púa y Tarola Militar Seca',
    defaultBpm: 146,
    timeSignature: '3/4 (Vals Bélico Rápido)',
    description: 'Requintos dobles a doble púa rápida, tarola militar seca y sousafón pesado marcando el paso.',
    marketingTag: 'MARKET: BÉLICO PESADO / ESTRATEGIA & MANDO',
    dspPitchTarget: 'Spotify: Corridos Bélicos 2026 • Apple Music: Fuerza Bélica',
    targetAudience: 'Oyentes de corridos con temática de mando, disciplina táctica y potencia musical.'
  },

  // 2. Norteño Tradicional & Moderno
  {
    id: 'norteno-cadetes-clasico',
    name: 'Norteño Clásico con Acordeón & Bajo Sexto (Los Cadetes / Ramón Ayala)',
    shortLabel: 'Norteño Clásico',
    category: 'norteno',
    categoryName: 'Norteño Tradicional',
    flagEmoji: '🪗',
    language: 'es',
    style: 'Corrido Norteño Clásico',
    bandInspiration: 'Los Cadetes de Linares & Ramón Ayala (Norteño Clásico, Acordeón Diatónico y Bajo Sexto)',
    instrument: 'Acordeón Diatónico',
    defaultBpm: 122,
    timeSignature: '2/4 (Polka Norteña)',
    description: 'Acordeón diatónico tradicional afinado en Sol/Do/Fa, bajo sexto clásico, contrabajo y redoble norteño.',
    marketingTag: 'MARKET: NORTEÑO CLÁSICO / LEYENDAS DEL ACORDEÓN',
    dspPitchTarget: 'Spotify: Norteño Puro • Apple Music: Reyes del Norte',
    targetAudience: 'Público general en Nuevo León, Tamaulipas, Texas y amantes del sonido clásico de cantina.'
  },
  {
    id: 'norteno-moderno-tarolas',
    name: 'Norteño Moderno con Tarolas (Grupo Arriesgado & Panther Bélico)',
    shortLabel: 'Norteño con Tarolas',
    category: 'norteno',
    categoryName: 'Norteño Moderno',
    flagEmoji: '🪗',
    language: 'es',
    style: 'Norteño Moderno con Tarolas',
    bandInspiration: 'Grupo Arriesgado & Panther Bélico (Norteño Moderno con Tarolazos)',
    instrument: 'Batería y Percusiones',
    defaultBpm: 138,
    timeSignature: '2/4 (Polka Brava con Tarolazos)',
    description: 'Acordeón diatónico rápido, tarolazos dobles enérgicos, batería completa y bajo quinto moderno.',
    marketingTag: 'MARKET: NORTEÑO BRAVO / TAROLAZOS & FIESTA',
    dspPitchTarget: 'Spotify: Peda Norteña, La Clica Norteña • Apple Music: Norteño Moderno',
    targetAudience: 'Jóvenes y adultos que disfrutan fiestas norteñas, cabalgatas y eventos de rodeo.'
  },
  {
    id: 'huapango-norteno-sax',
    name: 'Huapango Norteño con Saxofón & Acordeón (Estilo San Luis & Chihuahua)',
    shortLabel: 'Huapango con Sax',
    category: 'norteno',
    categoryName: 'Norteño Sax',
    flagEmoji: '🎷',
    language: 'es',
    style: 'Norteño Moderno con Tarolas',
    bandInspiration: 'La Fiera de Ojinaga & Conjunto Primavera (Norteño con Saxofón y Acordeón)',
    instrument: 'Acordeón Diatónico',
    defaultBpm: 140,
    timeSignature: '6/8 (Zapateado Huapango)',
    description: 'Dueto virtuoso de saxofón alto y acordeón con ritmo de zapateado acelerado de huapango.',
    marketingTag: 'MARKET: NORTEÑO SAX / HUAPANGO ZAPATEADO',
    dspPitchTarget: 'Spotify: Huapangos y Sax, Furia Norteña • Apple Music: Norteño con Sax',
    targetAudience: 'Comunidades de baile zapateado en Chihuahua, Zacatecas, San Luis Potosí, Texas e Illinois.'
  },

  // 3. Banda Sinaloense & Palenque en Vivo
  {
    id: 'banda-sinaloense-brava',
    name: 'Corrido de Banda Sinaloense Brava (Culiacán Tradición)',
    shortLabel: 'Banda Brava',
    category: 'banda',
    categoryName: 'Banda Sinaloense',
    flagEmoji: '🎺',
    language: 'es',
    style: 'Corrido de Banda Sinaloense Brava',
    bandInspiration: 'Banda Sinaloense Brava (Tuba Sinaloense, Tambora, Clarinete y Trombón de Culiacán)',
    instrument: 'Tuba y Tambora Sinaloense',
    defaultBpm: 142,
    timeSignature: '3/4 (Vals Banda Brava)',
    description: 'Tuba sinaloense con chuntata pesada, tambora con platillazos explosivos, clarinetes y trombones bravos.',
    marketingTag: 'MARKET: BANDA SINALOENSE / TRADICIÓN DE CULIACÁN',
    dspPitchTarget: 'Spotify: Pura Banda, Éxitos de Sinaloa • Apple Music: Trombones y Tuba',
    targetAudience: 'Público masivo en Sinaloa, Sonora, Jalisco, ferias ganaderas y bailes masivos en EE.UU.'
  },
  {
    id: 'palenque-live-concierto',
    name: 'En Vivo Desde el Palenque (Banda en Concierto & Gritos del Público)',
    shortLabel: 'Palenque en Vivo',
    category: 'banda',
    categoryName: 'Banda en Vivo',
    flagEmoji: '🎺',
    language: 'es',
    style: 'En Vivo Desde el Palenque: Corrido de Banda en Concierto (Gritos del Público, Metales en Vivo y Tarolazo)',
    bandInspiration: 'En Vivo Desde el Palenque / Concierto en Vivo (Gritos del Público, Trombones Bravos y Tamborazo)',
    instrument: 'Trombones en Vivo, Tarolazos de Concierto y Animación',
    defaultBpm: 144,
    timeSignature: '3/4 (Vals Banda en Concierto)',
    description: 'Ambiente en vivo de palenque, gritos y ovación del público, animación de escenario y tamborazo.',
    marketingTag: 'MARKET: PALENQUE EN VIVO / CONCIERTOS MASIVOS',
    dspPitchTarget: 'Spotify: En Vivo Desde el Redondel • Apple Music: Conciertos Regionales',
    targetAudience: 'Fanáticos de conciertos en vivo, jaripeos y palenques de fiestas de octubre y ferias de México.'
  },
  {
    id: 'gerardo-ortiz-progresivo',
    name: 'Estilo Gerardo Ortiz (Banda Pesada & Corrido Progresivo)',
    shortLabel: 'Banda Progresiva',
    category: 'banda',
    categoryName: 'Banda Pesada',
    flagEmoji: '🎺',
    language: 'es',
    style: 'Estilo Gerardo Ortiz (Banda Pesada & Corrido Progresivo)',
    bandInspiration: 'Gerardo Ortiz (Banda Pesada, Tamborazos Fuertes, Tarolas Bravas y Requinto Picado)',
    instrument: 'Requinto 12 Cuerdas Rápido y Tambora Pesada',
    defaultBpm: 144,
    timeSignature: '3/4 (Vals Corrido Progresivo)',
    description: 'Tambora con platillazos fuertes, redobles continuos de tarola y requintos picados en terceras.',
    marketingTag: 'MARKET: CORRIDO PROGRESIVO / BANDA DE IMPACTO',
    dspPitchTarget: 'Spotify: Corridos Progresivos • Apple Music: Puro Corrido Pesado',
    targetAudience: 'Amantes del corrido estructurado con redobles y cortes orquestales dramáticos.'
  },

  // 4. Mariachi & Ranchera Tradicional
  {
    id: 'mariachi-tradicional-concierto',
    name: 'Mariachi Tradicional de Concierto (Trompetas de Gala, Violines & Vihuela)',
    shortLabel: 'Mariachi de Concierto',
    category: 'mariachi',
    categoryName: 'Mariachi & Ranchera',
    flagEmoji: '🎻',
    language: 'es',
    style: 'Corrido Norteño Clásico',
    bandInspiration: 'Mariachi Vargas de Tecalitlán & Mariachi Gama 1000 (Trompetas de Gala, Violines y Guitarrón)',
    instrument: 'Guitarras Acústicas de Concierto, Bajo Fretless y Percusión Suave',
    defaultBpm: 112,
    timeSignature: '3/4 (Vals Ranchero de Gala)',
    description: 'Trompetas brillantes de charro, sección de violines virtuosos, rasgueos de vihuela y bajeo solemne de guitarrón.',
    marketingTag: 'MARKET: MARIACHI TRADICIONAL & RANCHERA CONCERT',
    dspPitchTarget: 'Spotify: Mariachi 2026, Éxitos de Oro • Apple Music: Puro Mariachi',
    targetAudience: 'Audiencia mundial de música clásica mexicana, serenatas, amantes del traje de charro y fiestas patrias.'
  },
  {
    id: 'ranchera-bravia-cantina',
    name: 'Ranchera Bravía de Cantina (Vicente Fernández / José Alfredo Style)',
    shortLabel: 'Ranchera Bravía',
    category: 'mariachi',
    categoryName: 'Mariachi & Ranchera',
    flagEmoji: '🎻',
    language: 'es',
    style: 'Pop Regional & Balada Acústica (Carín León & Christian Nodal / Guitarras & Sentimiento)',
    bandInspiration: 'Vicente Fernández & José Alfredo Jiménez (Ranchera Clásica con Trompetas y Guitarrón)',
    instrument: 'Guitarra Acústica de Nylon, Bajo Cálido y Percusión Suave',
    defaultBpm: 104,
    timeSignature: '2/4 (Canción Ranchera)',
    description: 'Lírica apasionada de honor y orgullo, trompetas con falsete vocal lírico y guitarrón profundo.',
    marketingTag: 'MARKET: RANCHERA BRAVÍA / CLÁSICOS DE CANTINA',
    dspPitchTarget: 'Spotify: Rancheras del Alma • Apple Music: Clásicos del Mariachi',
    targetAudience: 'Público hispanohablante global amante de las serenatas y la música ranchera de leyenda.'
  },

  // 5. Rap Corrido & Mexican Hip-Hop
  {
    id: 'rap-corrido-mexicano',
    name: 'Rap Corrido Mexicano (Santa Fe Klan & Alemán / Flow Callejero con 808)',
    shortLabel: 'Rap Corrido MX',
    category: 'rap_corrido',
    categoryName: 'Rap Corrido',
    flagEmoji: '🔥',
    language: 'es',
    style: 'Rap Corrido Mexicano (Santa Fe Klan, Alemán & Dan Sanchez / Flow Callejero con 808 y Requintos)',
    bandInspiration: 'Rap Corrido Mexicano (Santa Fe Klan / Alemán / Dan Sanchez / Flow Callejero en Español con 808 y Docerolas)',
    instrument: 'Sub-Bass 808 Callejero, Requinto Docerola y Tarola Hip-Hop',
    defaultBpm: 130,
    timeSignature: '4/4 (Rap Corrido Mexicano)',
    description: 'Versos de rap en español con flow callejero, requintos 12 cuerdas y sub-bass 808 pesado.',
    marketingTag: 'MARKET: MEXICAN HIP-HOP / STREET CORRIDO TRAP',
    dspPitchTarget: 'Spotify: Rap Mexicano, Nación Urbana • Apple Music: Puro Hip-Hop MX',
    targetAudience: 'Juventud urbana, cultura hip-hop en español, barrios de México y EE.UU.'
  },

  // 6. Reggaeton & Latin Urban
  {
    id: 'reggaeton-perreo-2026',
    name: 'Reggaeton Perreo 2026 (Bad Bunny & Feid / Heavy Dembow & Synth Stabs)',
    shortLabel: 'Reggaeton & Dembow',
    category: 'latin_urban',
    categoryName: 'Latin Urban',
    flagEmoji: '🌴',
    language: 'es',
    style: 'Reggaeton Perreo 2026 (Bad Bunny & Feid / Heavy Dembow & Synth Stabs)',
    bandInspiration: 'Bad Bunny, Feid & Tainy (Reggaeton Moderno, Dembow Pesado, Sintetizadores y Flow Urbano)',
    instrument: 'Dembow Kick & Snare Syncopado, 808 Sub y Sintetizadores Urbanos',
    defaultBpm: 96,
    timeSignature: '4/4 (Dembow Riddim 96 BPM)',
    description: 'Dembow rítmico bailable, bajos sub 808 profundos, percusión syncopada y sintetizadores urbanos.',
    marketingTag: 'MARKET: GLOBAL LATIN URBAN / DEMBOW & PERREO',
    dspPitchTarget: 'Spotify: Viva Latino, Mansión Reggaetón • Apple Music: Fuego Latino',
    targetAudience: 'Discotecas, clubes, festivales de música urbana y playlists de streaming global.'
  },
  {
    id: 'trap-latino-pesado',
    name: 'Trap Latino Pesado (Anuel AA & Eladio Carrión / 808s & Flow Oscuro)',
    shortLabel: 'Trap Latino',
    category: 'latin_urban',
    categoryName: 'Latin Urban',
    flagEmoji: '🌴',
    language: 'es',
    style: 'Trap Latino Pesado (Anuel AA & Eladio Carrión / 808s & Flow Oscuro)',
    bandInspiration: 'Anuel AA & Eladio Carrión (Trap Latino Callejero, 808s Deslizantes y Barras de Calle)',
    instrument: '808 Sub Bass Pesado, Hi-Hats Rápidos y Rimshots Secos de Trap',
    defaultBpm: 128,
    timeSignature: '4/4 (Trap Latino Beat)',
    description: 'Atmósfera oscura, bajos 808 deslizantes, redobles rápidos de hi-hat y barras directas de calle.',
    marketingTag: 'MARKET: TRAP LATINO / 808S & FLOW OSCURO',
    dspPitchTarget: 'Spotify: Trap Land, Flow Urbano • Apple Music: Trap Latino Hits',
    targetAudience: 'Amantes del trap latino pesado, barras agresivas y sub-graves de club nocturno.'
  },

  // 7. General English: US Hip-Hop & Hard 808 Trap
  {
    id: 'modern-hard-trap-us',
    name: 'Modern Hard Trap & Rap (Metro Boomin & Drake / Fast Hats & Booming 808s)',
    shortLabel: 'US Hard Trap (English)',
    category: 'us_hiphop',
    categoryName: 'US Hip-Hop / Rap',
    flagEmoji: '🇺🇸',
    language: 'en',
    style: 'Modern Trap & Rap (Metro Boomin / Drake / Hard 808s & Fast Hi-Hats)',
    bandInspiration: 'Modern Trap & Rap (Metro Boomin / Drake / Travis Scott / Heavy 808s & Fast Hi-Hats)',
    instrument: 'Hard-Hitting 808 Bass & Rolling Trap Hi-Hats',
    defaultBpm: 135,
    timeSignature: '4/4 (Modern US Hard Trap)',
    description: 'Booming 808 sub-bass, rapid rolling hi-hats, dark cinematic synths, and aggressive English rap delivery.',
    marketingTag: 'MARKET: US MAINSTREAM RAP / ATLANTA & 808 TRAP',
    dspPitchTarget: 'Spotify: RapCaviar, Most Necessary • Apple Music: The Plug, Hip-Hop Hits',
    targetAudience: 'US and international English rap streamers, trap playlist curators, workout & gaming audiences.'
  },
  {
    id: 'houston-texas-rap',
    name: 'Houston Texas Rap (UGK & Z-Ro / Slow Rolling 808s & Soulful Keys)',
    shortLabel: 'Houston Texas Rap',
    category: 'us_hiphop',
    categoryName: 'US Hip-Hop / Rap',
    flagEmoji: '🇺🇸',
    language: 'en',
    style: 'Houston Texas Rap (UGK & Z-Ro Style / Slow Rolling 808s)',
    bandInspiration: 'Houston Texas Underground Rap (UGK / Bun B / Z-Ro / Trae tha Truth / Scarface Style)',
    instrument: 'Heavy Houston 808s & Soulful Texas Keys',
    defaultBpm: 74,
    timeSignature: '4/4 (Slow Rolling Houston Rap)',
    description: 'Southern street rap, slow rolling heavy 808s, soulful electric piano chords, and gritty street wisdom.',
    marketingTag: 'MARKET: US SOUTHERN RAP / HOUSTON & TEXAS UNDERGROUND',
    dspPitchTarget: 'Spotify: Southern Hip-Hop, Texas Street Rap • Apple Music: Houston Legends',
    targetAudience: 'Southern hip-hop purists, car audio culture, candy-paint slab enthusiasts and Texas rap fans.'
  },
  {
    id: 'dark-street-rap-savage',
    name: 'Hard-Hitting Street Rap (21 Savage & Metro / Dark Cinematic Beats)',
    shortLabel: 'Street Rap (No Pop)',
    category: 'us_hiphop',
    categoryName: 'US Hip-Hop / Rap',
    flagEmoji: '🇺🇸',
    language: 'en',
    style: 'Hard-Hitting Street Rap & Menacing 808 Trap (Metro & 21 Savage / Dark Cinematic Beats / No Pop)',
    bandInspiration: 'Hard-Hitting Street Rap & Dark 808 Trap (Metro Boomin / 21 Savage / Future / No Pop / Gritty Street Flow)',
    instrument: 'Menacing Sliding 808s, Hard Rimshots & Dark Bells',
    defaultBpm: 138,
    timeSignature: '4/4 (Gritty Hard Street Trap)',
    description: 'Dark glockenspiel bells, sliding 808 bass, razor hi-hats and cold, menacing street cadence with zero pop.',
    marketingTag: 'MARKET: HARD STREET TRAP / MENACING 808',
    dspPitchTarget: 'Spotify: Underground Trap, Dark Beats • Apple Music: Hard Rap',
    targetAudience: 'Fans of menacing, uncompromised street rap, gym playlists, and dark urban cinema.'
  },

  // 8. General English: Global Pop & Modern R&B
  {
    id: 'contemporary-pop-rnb',
    name: 'Global Pop & Modern R&B (The Weeknd & SZA Style / Smooth Grooves & 808s)',
    shortLabel: 'Global Pop & R&B',
    category: 'global_pop_rnb',
    categoryName: 'Pop & Modern R&B',
    flagEmoji: '✨',
    language: 'en',
    style: 'Pop Regional & Balada Acústica (Carín León & Christian Nodal / Guitarras & Sentimiento)',
    bandInspiration: 'The Weeknd, SZA & Frank Ocean (Modern R&B, Atmospheric Synth-Pop and Smooth Vocals)',
    instrument: 'Guitarras Acústicas de Concierto, Bajo Fretless y Percusión Suave',
    defaultBpm: 110,
    timeSignature: '4/4 (Modern R&B Groove)',
    description: 'Lush atmospheric Rhodes chords, deep warm sub-bass, crisp pop drums, and catchy melodic toplines.',
    marketingTag: 'MARKET: GLOBAL ENGLISH POP / CONTEMPORARY R&B',
    dspPitchTarget: 'Spotify: Today\'s Top Hits, Are & Be • Apple Music: A-List Pop',
    targetAudience: 'Commercial streaming audiences, pop and contemporary R&B radio listeners worldwide.'
  },

  // 9. General English: Country & Americana
  {
    id: 'country-americana-roots',
    name: 'Modern Country & Americana (Morgan Wallen & Zach Bryan Style / Guitars & Stories)',
    shortLabel: 'Country & Americana',
    category: 'country_americana',
    categoryName: 'Country & Americana',
    flagEmoji: '🤠',
    language: 'en',
    style: 'Sierreño Campirano',
    bandInspiration: 'Morgan Wallen, Luke Combs & Zach Bryan (Modern Country, Southern Rock, Acoustic Guitars & Live Drums)',
    instrument: 'Guitarras Acústicas de Concierto, Bajo Fretless y Percusión Suave',
    defaultBpm: 115,
    timeSignature: '4/4 (Country Driving Beat)',
    description: 'Acoustic guitar strumming, electric telecaster fills, kick and snare heartbeat, and genuine southern storytelling.',
    marketingTag: 'MARKET: US COUNTRY & AMERICANA / NASHVILLE ROOTS',
    dspPitchTarget: 'Spotify: Hot Country, Southern Comfort • Apple Music: Country Roads',
    targetAudience: 'Country music fans, southern lifestyle, outdoor and truck culture across the United States.'
  },

  // 10. General English: Rock & Alternative / Indie
  {
    id: 'rock-alternative-indie',
    name: 'Modern Rock & Indie Alternative (Arctic Monkeys & The Black Keys Style)',
    shortLabel: 'Rock & Alternative',
    category: 'rock_alternative',
    categoryName: 'Rock & Alternative',
    flagEmoji: '🎸',
    language: 'en',
    style: 'Modern Banda/Bélico (Requintos 12 Cuerdas, Metales en Vivo y Tamborazo)',
    bandInspiration: 'Arctic Monkeys, The Black Keys & Foo Fighters (Garage Rock, Overdriven Guitars and Live Drums)',
    instrument: 'Batería y Percusiones',
    defaultBpm: 132,
    timeSignature: '4/4 (Rock Driving Beat)',
    description: 'Overdriven electric guitars, driving punchy live drum kit, gritty bass guitar riffs, and raw vocal delivery.',
    marketingTag: 'MARKET: MODERN ROCK & INDIE ALTERNATIVE / GUITAR DRIVEN',
    dspPitchTarget: 'Spotify: Rock This, New Noise • Apple Music: Alternative Anthems',
    targetAudience: 'Rock and indie music enthusiasts, festival goers, guitarists and alt-rock streaming channels.'
  },

  // 11. General English/Global: Afrobeats & Caribbean
  {
    id: 'afrobeats-caribbean-riddim',
    name: 'Global Afrobeats & Caribbean Riddims (Burna Boy & Wizkid Style)',
    shortLabel: 'Afrobeats & Caribbean',
    category: 'afrobeats_caribbean',
    categoryName: 'Afrobeats & Caribbean',
    flagEmoji: '🌍',
    language: 'en',
    style: 'Reggaeton Perreo 2026 (Bad Bunny & Feid / Heavy Dembow & Synth Stabs)',
    bandInspiration: 'Burna Boy, Wizkid & Rema (Global Afrobeats, Island Shakers and Melodic Vocals)',
    instrument: 'Dembow Kick & Snare Syncopado, 808 Sub y Sintetizadores Urbanos',
    defaultBpm: 104,
    timeSignature: '4/4 (Afrobeats Syncopated Groove)',
    description: 'Syncopated log drums, warm shaker rhythms, island guitar licks, and infectious global dance energy.',
    marketingTag: 'MARKET: GLOBAL AFROBEATS & CARIBBEAN DANCEHALL',
    dspPitchTarget: 'Spotify: African Heat, Dancehall Official • Apple Music: Afrobeats Hits',
    targetAudience: 'Global dance lovers, international Afrobeats clubs and tropical playlist subscribers.'
  },

  // 12. Electro Corrido & EDM Fusion
  {
    id: 'electro-corrido-edm',
    name: 'Electro Corrido Festival (Steve Aoki & Deorro / 128 BPM Synth Drops & Requinto)',
    shortLabel: 'Electro Corrido EDM',
    category: 'electro_fusion',
    categoryName: 'Electro & EDM',
    flagEmoji: '⚡',
    language: 'bilingual',
    style: 'Electro Corrido Festival (Steve Aoki & Deorro / 128 BPM Synth Drops & Requinto)',
    bandInspiration: 'Steve Aoki & Deorro x Regional (Electro Corrido EDM, Drops Electrónicos y Requinto Docerola)',
    instrument: 'Sintetizadores Lead EDM, Kick a 4 Tiempos y Requinto Electroacústico',
    defaultBpm: 128,
    timeSignature: '4/4 (EDM Festival Drop 128 BPM)',
    description: 'Fusión explosiva EDM: bombos a 4 tiempos a 128 BPM, sintetizadores festivaleros y requintos veloces.',
    marketingTag: 'MARKET: FESTIVAL EDM / ELECTRO-LATIN DANCE',
    dspPitchTarget: 'Spotify: Dance Party, Electro Latino • Apple Music: Festival Bangers',
    targetAudience: 'Festivales de música electrónica (EDC, Ultra), DJs de antro, gamers y fans de la fiesta de alta energía.'
  },

  // 13. Pop Regional & Balada Romántica Acústica
  {
    id: 'pop-regional-romantico',
    name: 'Pop Regional & Balada Acústica (Carín León & Christian Nodal / Guitarras & Sentimiento)',
    shortLabel: 'Pop Regional Acústico',
    category: 'acoustic_pop',
    categoryName: 'Pop Regional',
    flagEmoji: '💖',
    language: 'es',
    style: 'Pop Regional & Balada Acústica (Carín León & Christian Nodal / Guitarras & Sentimiento)',
    bandInspiration: 'Carín León & Christian Nodal (Pop Regional, Balada Acústica, Guitarras Finas y Sentimiento)',
    instrument: 'Guitarra Acústica de Nylon, Bajo Cálido y Percusión Suave',
    defaultBpm: 116,
    timeSignature: '3/4 (Vals Romántico Acústico)',
    description: 'Guitarras acústicas cálidas de nylon, arreglos de bajo suaves, lírica sentimental profunda y sentimiento.',
    marketingTag: 'MARKET: LATIN ACOUSTIC POP / ROMANTIC REGIONAL',
    dspPitchTarget: 'Spotify: Amor y Romance, Baladas de Oro • Apple Music: Acústico Latino',
    targetAudience: 'Oyentes de música romántica, serenatas, parejas y amantes de las guitarras acústicas y baladas.'
  }
];

const LOCAL_STORAGE_CUSTOM_STYLES_KEY = 'medina_custom_genre_styles_v2';

interface MusicalStyleDropdownProps {
  valueStyle: CorridoStyle;
  valueBand?: string;
  valueGenreCategory?: GenreCategory;
  valueMusicalTag?: string;
  valueLanguage?: 'es' | 'en' | 'bilingual';
  disabled?: boolean;
  onSelectStyle: (selection: {
    style: CorridoStyle;
    bandInspiration: string;
    instrument: FeaturedInstrument;
    tempoBpm: number;
    genreCategory: GenreCategory;
    musicalGenreTag: string;
    marketingTag: string;
    primaryLanguage: 'es' | 'en' | 'bilingual';
  }) => void;
  onOpenMarketingHub?: () => void;
}

export const MusicalStyleDropdown: React.FC<MusicalStyleDropdownProps> = ({
  valueStyle,
  valueBand,
  valueGenreCategory,
  valueMusicalTag,
  valueLanguage,
  disabled = false,
  onSelectStyle,
  onOpenMarketingHub
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');
  const [selectedLangFilter, setSelectedLangFilter] = useState<'all' | 'es' | 'en' | 'bilingual'>('all');
  const [customStyles, setCustomStyles] = useState<MusicalStyleOption[]>([]);
  
  // Custom Style Creator Modal / Drawer
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomCategory, setNewCustomCategory] = useState<GenreCategory>('regional_belico');
  const [newCustomLang, setNewCustomLang] = useState<'es' | 'en' | 'bilingual'>('es');
  const [newCustomBpm, setNewCustomBpm] = useState(132);
  const [newCustomInspiration, setNewCustomInspiration] = useState('');
  const [newCustomInstrument, setNewCustomInstrument] = useState('');
  const [newCustomDescription, setNewCustomDescription] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load custom styles from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CUSTOM_STYLES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCustomStyles(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not load custom genre styles:', e);
    }
  }, []);

  // Google Search Grounded Trending Smart Presets
  const [trendingSmartStyles, setTrendingSmartStyles] = useState<MusicalStyleOption[]>([]);
  const [isFetchingTrending, setIsFetchingTrending] = useState(false);

  const fetchTrendingFromGoogle = async () => {
    setIsFetchingTrending(true);
    try {
      const res = await fetch(`/api/smart-presets/trending?category=${selectedCategoryTab !== 'all' && selectedCategoryTab !== 'custom' && selectedCategoryTab !== 'trending' ? selectedCategoryTab : 'all'}&lang=${selectedLangFilter !== 'all' ? selectedLangFilter : 'es'}&q=${encodeURIComponent(searchTerm || '')}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.presets)) {
          const mapped: MusicalStyleOption[] = data.presets.map((p: any) => ({
            id: `trending-${p.id}`,
            name: `${p.label} (🔥 Live Trend)`,
            shortLabel: p.label,
            category: p.category || 'regional_belico',
            categoryName: 'Tendencia Google Search',
            flagEmoji: '🔥',
            language: (valueLanguage === 'en' ? 'en' : 'es') as any,
            style: p.style as CorridoStyle,
            bandInspiration: p.bandInspiration,
            instrument: p.instrument as FeaturedInstrument,
            defaultBpm: p.defaultBpm || 130,
            timeSignature: '4/4 / 3/4',
            description: `${p.sublabel} — ${p.trendingReason || 'Trending en streaming y viral charts.'}`,
            marketingTag: `MARKET: TRENDING / ${p.label.toUpperCase()}`,
            dspPitchTarget: 'Spotify & Apple Music Trending Playlists',
            targetAudience: 'Audiencias globales y charts virales en tiempo real.',
            isCustom: true
          }));
          setTrendingSmartStyles(mapped);
          setSelectedCategoryTab('trending');
        }
      }
    } catch (err) {
      console.warn("Failed fetching trending styles inside dropdown:", err);
    } finally {
      setIsFetchingTrending(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  // Combined Styles list (Core presets + User custom styles + Google Grounded Trends)
  const allStyles = useMemo(() => {
    return [...trendingSmartStyles, ...customStyles, ...CORE_MUSICAL_STYLES];
  }, [trendingSmartStyles, customStyles]);

  // Active selected item
  const currentSelectedOption = useMemo(() => {
    if (valueMusicalTag) {
      const foundByTag = allStyles.find(s => s.name === valueMusicalTag || s.shortLabel === valueMusicalTag);
      if (foundByTag) return foundByTag;
    }
    const found = allStyles.find(s => s.style === valueStyle || (valueBand && s.bandInspiration === valueBand));
    return found || CORE_MUSICAL_STYLES[0];
  }, [allStyles, valueStyle, valueBand, valueMusicalTag]);

  // Filtered styles based on category, language, and search
  const filteredStyles = useMemo(() => {
    return allStyles.filter(item => {
      // Category filter
      if (selectedCategoryTab === 'custom') {
        if (!item.isCustom) return false;
      } else if (selectedCategoryTab !== 'all') {
        if (item.category !== selectedCategoryTab) return false;
      }

      // Language filter
      if (selectedLangFilter !== 'all') {
        if (item.language !== selectedLangFilter && item.language !== 'bilingual') return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesShort = item.shortLabel.toLowerCase().includes(q);
        const matchesCat = item.categoryName.toLowerCase().includes(q);
        const matchesInsp = item.bandInspiration.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesMkt = item.marketingTag.toLowerCase().includes(q);
        return matchesName || matchesShort || matchesCat || matchesInsp || matchesDesc || matchesMkt;
      }

      return true;
    });
  }, [allStyles, selectedCategoryTab, selectedLangFilter, searchTerm]);

  // Handle Save New Custom Style
  const handleSaveCustomStyle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomName.trim()) return;

    const categoryInfo = getGenreSeparationInfo(newCustomCategory);
    const customId = `custom-style-${Date.now()}`;
    const newStyleOpt: MusicalStyleOption = {
      id: customId,
      name: `${newCustomName.trim()} (${categoryInfo.shortLabel} Custom)`,
      shortLabel: newCustomName.trim(),
      category: newCustomCategory,
      categoryName: categoryInfo.name,
      flagEmoji: categoryInfo.flagEmoji || '⭐',
      language: newCustomLang,
      style: `${newCustomName.trim()} (Custom Musical Style)` as CorridoStyle,
      bandInspiration: newCustomInspiration.trim() || `${newCustomName.trim()} Custom Master Production`,
      instrument: (newCustomInstrument.trim() || 'Requinto 12 Cuerdas, Metales en Vivo y Percusión') as FeaturedInstrument,
      defaultBpm: newCustomBpm,
      timeSignature: '4/4 / 3/4 Versátil',
      description: newCustomDescription.trim() || `Estilo personalizado en la vertical ${categoryInfo.name}.`,
      marketingTag: `MARKET: CUSTOM / ${newCustomName.trim().toUpperCase()} (${categoryInfo.marketTag})`,
      dspPitchTarget: categoryInfo.dspPitchCategory,
      targetAudience: categoryInfo.targetAudience,
      isCustom: true
    };

    const updated = [newStyleOpt, ...customStyles];
    setCustomStyles(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_CUSTOM_STYLES_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed saving to localStorage:', err);
    }

    // Immediately select the new style
    onSelectStyle({
      style: newStyleOpt.style,
      bandInspiration: newStyleOpt.bandInspiration,
      instrument: newStyleOpt.instrument,
      tempoBpm: newStyleOpt.defaultBpm,
      genreCategory: newStyleOpt.category,
      musicalGenreTag: newStyleOpt.name,
      marketingTag: newStyleOpt.marketingTag,
      primaryLanguage: newStyleOpt.language
    });

    // Reset & Close modal
    setNewCustomName('');
    setNewCustomInspiration('');
    setNewCustomInstrument('');
    setNewCustomDescription('');
    setShowCustomModal(false);
    setIsOpen(false);
  };

  // Quick categories for the filter tabs
  const categoryTabOptions = [
    { id: 'all', label: 'Todos', count: allStyles.length, icon: '🌐' },
    ...(trendingSmartStyles.length > 0 ? [{ id: 'trending', label: '🔥 Tendencias Google', count: trendingSmartStyles.length, icon: '✨' }] : []),
    { id: 'regional_belico', label: 'Regional Mexicano', count: allStyles.filter(s => s.category === 'regional_belico').length, icon: '🇲🇽' },
    { id: 'norteno', label: 'Norteño', count: allStyles.filter(s => s.category === 'norteno').length, icon: '🪗' },
    { id: 'banda', label: 'Banda', count: allStyles.filter(s => s.category === 'banda').length, icon: '🎺' },
    { id: 'mariachi', label: 'Mariachi', count: allStyles.filter(s => s.category === 'mariachi').length, icon: '🎻' },
    { id: 'rap_corrido', label: 'Rap Corrido', count: allStyles.filter(s => s.category === 'rap_corrido').length, icon: '🔥' },
    { id: 'latin_urban', label: 'Reggaeton & Urban', count: allStyles.filter(s => s.category === 'latin_urban').length, icon: '🌴' },
    { id: 'us_hiphop', label: 'US Hip-Hop / 808', count: allStyles.filter(s => s.category === 'us_hiphop').length, icon: '🇺🇸' },
    { id: 'global_pop_rnb', label: 'Pop & R&B', count: allStyles.filter(s => s.category === 'global_pop_rnb').length, icon: '✨' },
    { id: 'country_americana', label: 'Country / Roots', count: allStyles.filter(s => s.category === 'country_americana').length, icon: '🤠' },
    { id: 'rock_alternative', label: 'Rock & Indie', count: allStyles.filter(s => s.category === 'rock_alternative').length, icon: '🎸' },
    { id: 'afrobeats_caribbean', label: 'Afrobeats', count: allStyles.filter(s => s.category === 'afrobeats_caribbean').length, icon: '🌍' },
    { id: 'electro_fusion', label: 'Electro & EDM', count: allStyles.filter(s => s.category === 'electro_fusion').length, icon: '⚡' },
    { id: 'acoustic_pop', label: 'Pop Acústico', count: allStyles.filter(s => s.category === 'acoustic_pop').length, icon: '💖' },
    ...(customStyles.length > 0 ? [{ id: 'custom', label: 'Mis Estilos', count: customStyles.length, icon: '⭐' }] : [])
  ];

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Label and Marketing Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
        <label 
          htmlFor="musical-style-dropdown-trigger" 
          className="text-amber-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
        >
          <Music className="w-3.5 h-3.5 text-amber-400" />
          <span>Estilo Musical & Etiqueta de Marketing</span>
        </label>

        <div className="flex items-center gap-1.5">
          {/* Active Market Vertical Pill */}
          <span className="text-[10px] bg-amber-950/90 border border-amber-700/60 text-amber-300 px-2 py-0.5 font-mono font-bold flex items-center gap-1">
            <span>{currentSelectedOption.flagEmoji}</span>
            <span>{currentSelectedOption.categoryName}</span>
            <span className="text-amber-500 font-normal">({currentSelectedOption.defaultBpm} BPM)</span>
          </span>

          {/* Quick Add Custom Style Button */}
          <button
            type="button"
            onClick={() => setShowCustomModal(true)}
            className="text-[10px] bg-stone-900 hover:bg-stone-800 text-amber-400 border border-amber-600/40 hover:border-amber-500 px-2 py-0.5 font-bold uppercase transition-all flex items-center gap-1 cursor-pointer"
            title="Crear un estilo personalizado expandible con tus propios instrumentos y BPM"
          >
            <Plus className="w-3 h-3 text-amber-400" />
            <span>+ Expandir Lista</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Dropdown Trigger Button */}
      <button
        id="musical-style-dropdown-trigger"
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-stone-950 border ${
          isOpen ? 'border-amber-400 ring-1 ring-amber-500/50' : 'border-stone-700 hover:border-amber-600'
        } text-left px-3 py-2.5 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-inner group`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="text-lg flex-shrink-0">{currentSelectedOption.flagEmoji}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-amber-100 font-bold text-sm truncate">
                {currentSelectedOption.name}
              </span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                currentSelectedOption.language === 'es' 
                  ? 'bg-amber-950 text-amber-300 border border-amber-700/50' 
                  : currentSelectedOption.language === 'en'
                    ? 'bg-blue-950 text-blue-300 border border-blue-700/50'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
              }`}>
                {currentSelectedOption.language === 'es' ? '🇲🇽 Español' : currentSelectedOption.language === 'en' ? '🇺🇸 English' : '🌐 Spanglish'}
              </span>
              {currentSelectedOption.isCustom && (
                <span className="text-[9px] bg-amber-500 text-stone-950 px-1 font-black">
                  PERSONALIZADO
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-400 truncate mt-0.5">
              {currentSelectedOption.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] font-mono font-bold text-amber-400 bg-stone-900 border border-stone-800 px-2 py-0.5 hidden sm:inline-block">
            {currentSelectedOption.defaultBpm} BPM
          </span>
          <ChevronDown className={`w-4 h-4 text-amber-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Selected Style Marketing Separation Preview Box */}
      <div className="mt-1.5 bg-stone-900/60 border border-stone-800 p-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-2 text-stone-300 font-mono">
          <Tag className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span className="text-stone-400 uppercase font-bold">Etiqueta Marketing:</span>
          <span className="text-amber-300 font-semibold">{currentSelectedOption.marketingTag}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-stone-400 text-[10px] hidden md:inline">
            🎯 {currentSelectedOption.dspPitchTarget.split('•')[0]}
          </span>
          {onOpenMarketingHub && (
            <button
              type="button"
              onClick={onOpenMarketingHub}
              className="text-[10px] text-amber-400 hover:text-amber-300 underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Ver Estrategia</span>
            </button>
          )}
        </div>
      </div>

      {/* Expandable Dropdown Menu Drawer */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-stone-950 border border-amber-600/80 shadow-2xl backdrop-blur-md max-h-[460px] flex flex-col animate-in fade-in zoom-in-95 duration-150">
          {/* Search Header & Language Switcher */}
          <div className="p-3 bg-stone-900/95 border-b border-stone-800 space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por género, instrumento, artista (ej. Mariachi, Banda, Metro, Acordeón)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 text-amber-200 text-xs pl-8 pr-3 py-1.5 focus:border-amber-500 focus:outline-none placeholder:text-stone-600"
                  autoFocus
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Google Search Trends Live Button */}
              <button
                type="button"
                onClick={fetchTrendingFromGoogle}
                disabled={isFetchingTrending}
                className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-[10px] font-bold uppercase rounded flex items-center gap-1 cursor-pointer font-mono whitespace-nowrap shadow"
                title="Buscar subgéneros y tendencias de producción en vivo con Google Search"
              >
                {isFetchingTrending ? (
                  <>
                    <span className="w-2.5 h-2.5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                    <span>Buscando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 fill-current" />
                    <span>✨ Google Trends</span>
                  </>
                )}
              </button>

              {/* Language Filters */}
              <div className="flex items-center bg-stone-950 border border-stone-800 p-0.5">
                {(['all', 'es', 'en'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setSelectedLangFilter(lang)}
                    className={`text-[10px] px-2 py-1 font-mono font-bold transition-colors cursor-pointer ${
                      selectedLangFilter === lang
                        ? 'bg-amber-500 text-stone-950'
                        : 'text-stone-400 hover:text-amber-300'
                    }`}
                  >
                    {lang === 'all' ? '🌐 Todos' : lang === 'es' ? '🇲🇽 ES' : '🇺🇸 EN'}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Category Tabs Bar */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              {categoryTabOptions.map((tab) => {
                const isActive = selectedCategoryTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedCategoryTab(tab.id)}
                    className={`whitespace-nowrap px-2.5 py-1 text-[10px] font-mono flex items-center gap-1 border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow'
                        : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-600 hover:text-amber-200'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    <span className={`text-[9px] px-1 rounded ${isActive ? 'bg-amber-700 text-amber-100' : 'bg-stone-900 text-stone-500'}`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Style Options List */}
          <div className="overflow-y-auto p-2 space-y-1.5 flex-1 max-h-[300px] divide-y divide-stone-900">
            {filteredStyles.length === 0 ? (
              <div className="p-8 text-center text-stone-500 text-xs">
                <p>No se encontraron estilos para "{searchTerm}".</p>
                <button
                  type="button"
                  onClick={() => setShowCustomModal(true)}
                  className="mt-3 bg-amber-500 text-stone-950 font-bold px-3 py-1.5 text-xs inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear "{searchTerm}" como estilo personalizado</span>
                </button>
              </div>
            ) : (
              filteredStyles.map((item) => {
                const isSelected = item.id === currentSelectedOption.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectStyle({
                        style: item.style,
                        bandInspiration: item.bandInspiration,
                        instrument: item.instrument,
                        tempoBpm: item.defaultBpm,
                        genreCategory: item.category,
                        musicalGenreTag: item.name,
                        marketingTag: item.marketingTag,
                        primaryLanguage: item.language
                      });
                      setIsOpen(false);
                    }}
                    className={`p-2.5 cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-amber-950/70 border-amber-500 text-amber-100'
                        : 'bg-stone-950/80 border-transparent hover:bg-stone-900 hover:border-stone-700 text-stone-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="text-xl flex-shrink-0 mt-0.5">{item.flagEmoji}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-amber-200">
                              {item.name}
                            </span>
                            <span className="text-[9px] bg-stone-900 text-amber-400 border border-stone-800 px-1 font-mono">
                              {item.categoryName}
                            </span>
                            <span className={`text-[8px] px-1 font-mono font-bold uppercase rounded ${
                              item.language === 'es' 
                                ? 'bg-amber-950 text-amber-300' 
                                : item.language === 'en' 
                                  ? 'bg-blue-950 text-blue-300' 
                                  : 'bg-emerald-950 text-emerald-300'
                            }`}>
                              {item.language === 'es' ? 'ES' : item.language === 'en' ? 'EN' : 'SPNGL'}
                            </span>
                            {item.isCustom && (
                              <span className="text-[8px] bg-amber-500 text-stone-950 px-1 font-bold">
                                CUSTOM
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-400 mt-0.5">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-stone-500 font-mono flex-wrap">
                            <span className="text-amber-500/90 font-bold">🎯 {item.marketingTag.split('/')[1]?.trim() || item.marketingTag}</span>
                            <span>•</span>
                            <span className="text-stone-400">Tempo: {item.defaultBpm} BPM</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isSelected ? (
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-stone-500 bg-stone-900 px-1.5 py-0.5 border border-stone-800">
                            {item.defaultBpm} BPM
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Bar: Add Custom Style Shortcut */}
          <div className="p-2.5 bg-stone-900 border-t border-stone-800 flex items-center justify-between text-xs">
            <span className="text-stone-400 text-[11px]">
              {filteredStyles.length} estilos disponibles • 100% listos para Lyria 3
            </span>
            <button
              type="button"
              onClick={() => {
                setShowCustomModal(true);
                setIsOpen(false);
              }}
              className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-3 py-1 text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3 h-3 text-stone-950" />
              <span>Crear Estilo Personalizado</span>
            </button>
          </div>
        </div>
      )}

      {/* Expand / Add Custom Style Modal Dialog */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-stone-900 border border-amber-600 w-full max-w-lg p-5 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => setShowCustomModal(false)}
              className="absolute right-4 top-4 text-stone-400 hover:text-amber-400 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-800">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="text-amber-400 text-sm font-black uppercase tracking-wider">
                  Expandir Lista de Estilos Musicales
                </h3>
                <p className="text-[11px] text-stone-400">
                  Agrega un nuevo género o subgénero musical para etiquetarlo y organizarlo para marketing.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveCustomStyle} className="space-y-3.5">
              <div>
                <label className="block text-amber-300 text-xs font-bold uppercase mb-1">
                  Nombre del Estilo o Subgénero *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Afro-Corrido 2026, Latin Drill, Lo-Fi Corrido, Tejano Pop..."
                  value={newCustomName}
                  onChange={(e) => setNewCustomName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 text-amber-200 text-xs px-3 py-2 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-amber-300 text-xs font-bold uppercase mb-1">
                    Vertical de Mercado / Categoría
                  </label>
                  <select
                    value={newCustomCategory}
                    onChange={(e) => setNewCustomCategory(e.target.value as GenreCategory)}
                    className="w-full bg-stone-950 border border-stone-700 text-amber-200 text-xs px-2.5 py-2 focus:border-amber-500 focus:outline-none cursor-pointer"
                  >
                    {GENRE_SEPARATIONS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.flagEmoji} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-amber-300 text-xs font-bold uppercase mb-1">
                    Idioma Principal
                  </label>
                  <select
                    value={newCustomLang}
                    onChange={(e) => setNewCustomLang(e.target.value as any)}
                    className="w-full bg-stone-950 border border-stone-700 text-amber-200 text-xs px-2.5 py-2 focus:border-amber-500 focus:outline-none cursor-pointer"
                  >
                    <option value="es">🇲🇽 Español</option>
                    <option value="en">🇺🇸 English</option>
                    <option value="bilingual">🌐 Bilingual / Spanglish</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-amber-300 text-xs font-bold uppercase mb-1">
                    Tempo Sugerido (BPM): {newCustomBpm} BPM
                  </label>
                  <input
                    type="range"
                    min={70}
                    max={165}
                    value={newCustomBpm}
                    onChange={(e) => setNewCustomBpm(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-amber-300 text-xs font-bold uppercase mb-1">
                    Inspiración de Artistas
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Fuerza Regida x Metro Boomin..."
                    value={newCustomInspiration}
                    onChange={(e) => setNewCustomInspiration(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 text-amber-200 text-xs px-2.5 py-1.5 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-amber-300 text-xs font-bold uppercase mb-1">
                  Instrumentación Clave
                </label>
                <input
                  type="text"
                  placeholder="ej. Docerolas 12 cuerdas, 808 glides y saxofón..."
                  value={newCustomInstrument}
                  onChange={(e) => setNewCustomInstrument(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 text-amber-200 text-xs px-3 py-1.5 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-amber-300 text-xs font-bold uppercase mb-1">
                  Descripción Corta & Estrategia de Marketing
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe la vibra musical y el mercado meta..."
                  value={newCustomDescription}
                  onChange={(e) => setNewCustomDescription(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 text-amber-200 text-xs p-2 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold uppercase cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black uppercase flex items-center gap-1 cursor-pointer shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Guardar y Aplicar Estilo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
