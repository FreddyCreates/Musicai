import React, { useState, useRef, useEffect } from 'react';
import { ComposerInputs, CorridoStyle, FeaturedInstrument, DigitalArtistAgent, GenreCategory } from '../types';
import { GENRE_SEPARATIONS, getGenreCategory, getGenreSeparationInfo } from '../utils/genreSeparations';
import { MusicalStyleDropdown } from './MusicalStyleDropdown';
import { AppLanguage } from '../utils/i18n';
import { Music, HelpCircle, User, Sparkles, BookOpen, Compass, Play, Pause, MapPin, Tag, Dices, Volume2, Check, Mic, Terminal, Guitar, Flame, Megaphone, Layers, Filter, Languages, Globe, ShieldCheck, Video, Clapperboard } from 'lucide-react';

interface CreationFormProps {
  language?: AppLanguage;
  onSubmit: (inputs: ComposerInputs) => void;
  isLoading: boolean;
  activeAgent?: DigitalArtistAgent;
  onOpenAgentsHub?: () => void;
  onOpenAgentComputer?: (agent: DigitalArtistAgent) => void;
  onOpenMarketingHub?: () => void;
}

export const MUSICAL_STYLE_OPTIONS: { value: CorridoStyle; label: string; desc: string }[] = [
  { value: 'Rap Corrido Mexicano (Santa Fe Klan, Alemán & Dan Sanchez / Flow Callejero con 808 y Requintos)', label: 'Rap Corrido Mexicano (Santa Fe Klan & Alemán / Flow Callejero)', desc: 'Fusión moderna: versos de rap en español con flow callejero, requintos de 12 cuerdas afilados, sub-bass 808 retumbante y tarolas hip-hop con hi-hats (130 BPM)' },
  { value: 'Modern Banda/Bélico (Requintos 12 Cuerdas, Metales en Vivo y Tamborazo)', label: 'Modern Banda / Bélico en Vivo (Metales, Requinto y Tamborazo)', desc: 'Concierto en vivo de alta energía: requintos de 12 cuerdas a doble púa en terceras, metales de concierto (trombones y charchetas), tamborazo con platillazos y tarolas militares (144 BPM)' },
  { value: 'Grupo Mente Maestra (Bélico Estratégico, Requintos Dobles y Tarolas 2026)', label: 'Grupo Mente Maestra (Bélico Estratégico / Requintos Dobles & Tarolas)', desc: 'Requintos en 12 cuerdas a doble púa supersónica, tarolas militares secas, sousafón rugiendo y lírica de ajedrez y estrategia fría (146 BPM)' },
  { value: 'Estilo Gerardo Ortiz (Banda Pesada & Corrido Progresivo)', label: 'Estilo Gerardo Ortiz (Banda Pesada / Tamborazo & Requinto)', desc: 'Tambora con platillazos explosivos, tarolas militares, requinto de 12 cuerdas picado en terceras y tuba en doble golpe (144 BPM)' },
  { value: 'Legado 7 & Sierreño Urbano (Requintos 12 Cuerdas y Batería)', label: 'Legado 7 (Sierreño Urbano / Requintos y Batería)', desc: 'Requintos 12 cuerdas a doble plumilleo rápido, batería acústica pesada, tarolas y bajo' },
  { value: 'Baja Cali Fronterizo (Docerolas y Metales en Vivo)', label: 'Baja Cali Fronterizo (Docerolas y Metales en Vivo)', desc: 'Docerolas a doble plumilleo veloz, charchetas, batería con tarolazos y metales fronterizos' },
  { value: 'Bélico Tumbado 2026', label: 'Bélico Tumbado 2026 (Tito Double P / Peso Pluma)', desc: 'Trombones de vara cortantes, requintos veloces de 12 cuerdas y batería moderna en vivo' },
  { value: 'Corrido Bélico Tech 2026', label: 'Corrido Bélico Tech 2026', desc: 'Trombón de vara cortado, requinto 12 cuerdas, batería punchy y lírica de superación' },
  { value: 'Corrido Urbano Callejero', label: 'Corrido Urbano Callejero (Fuerza Regida)', desc: 'Flow callejero, sousafón pesado, bajo eléctrico, batería con tarola y requintos' },
  { value: 'Norteño Moderno con Tarolas', label: 'Norteño Moderno con Tarolas (Panther Bélico)', desc: 'Acordeón diatónico rápido, tarolazos enérgicos, batería completa y bajo sexto' },
  { value: 'Corrido de Banda Sinaloense Brava', label: 'Corrido de Banda Sinaloense Brava', desc: 'Tuba con chuntata pesada, tambora, tarolas, batería, trombones y clarinete bravío' },
  { value: 'Tumbado Melódico Vanguardia', label: 'Tumbado Melódico Vanguardia (Junior H / Xavi)', desc: 'Requintos melódicos menores, armonías finas de docerola, batería acústica y bajo' },
  { value: 'Sierreño Campirano', label: 'Sierreño Campirano Moderno', desc: 'Docerolas campiranas en terceras, batería acústica y requinto rústico veloz' },
  { value: 'Houston Texas Rap (UGK & Z-Ro Style / Slow Rolling 808s)', label: 'Houston Texas Rap (UGK / Z-Ro / Slow 808s)', desc: 'Gritty Southern street rap, slow rolling heavy 808s, soulful keys, pure rap flow (not upbeat)' },
  { value: 'Modern Trap & Rap (Metro Boomin / Drake / Hard 808s & Fast Hi-Hats)', label: 'Modern Hard Trap (Drake / Metro Boomin / Fast Hats)', desc: 'Ultra-modern 2026 trap with booming 808 sub bass, rapid fine rolling hi-hats, pitch bends, and sharp rap cadence' }
];

export const FEATURED_INSTRUMENTS: { value: FeaturedInstrument; label: string }[] = [
  { value: 'Sub-Bass 808 Callejero, Requinto Docerola y Tarola Hip-Hop', label: 'Sub-Bass 808 Callejero, Requinto Docerola y Tarola Hip-Hop (Rap Corrido)' },
  { value: 'Requinto 12 Cuerdas, Metales en Vivo y Tambora', label: 'Requintos 12 Cuerdas, Metales en Vivo y Tambora' },
  { value: 'Trombones en Vivo, Tarolazos de Concierto y Animación', label: 'Trombones en Vivo, Tarolazos de Concierto y Animación' },
  { value: 'Requinto Doble Púa y Tarola Militar Seca', label: 'Requinto Doble Púa y Tarola Militar Seca (Mente Maestra)' },
  { value: 'Requinto 12 Cuerdas Rápido y Tambora Pesada', label: 'Requinto 12 Cuerdas Rápido y Tambora Pesada (Gerardo Ortiz)' },
  { value: 'Docerola 12 Cuerdas y Batería Pesada', label: 'Docerola 12 Cuerdas y Batería Pesada (Legado 7)' },
  { value: 'Trombón y Charcheta', label: 'Trombón y Charcheta (Bélico Tumbado 2026)' },
  { value: 'Requinto (12 Cuerdas)', label: 'Requinto (12 Cuerdas / Campirano & Urbano)' },
  { value: 'Tuba y Tambora Sinaloense', label: 'Tuba y Tambora Sinaloense (Banda Brava)' },
  { value: 'Batería y Percusiones', label: 'Batería Completa y Percusiones (Norteño Moderno)' },
  { value: 'Acordeón Diatónico', label: 'Acordeón Diatónico Norteño' },
  { value: 'Bajo Eléctrico y Sousafón', label: 'Bajo Eléctrico y Sousafón (Tuba de Pecho)' },
  { value: 'Heavy Houston 808s & Soulful Texas Keys', label: 'Heavy Houston 808s & Soulful Texas Keys' },
  { value: 'Menacing Sliding 808s, Hard Rimshots & Dark Bells', label: 'Sliding 808s, Hard Rimshots & Dark Bells' },
  { value: 'Hard-Hitting 808 Bass & Rolling Trap Hi-Hats', label: 'Hard-Hitting 808 Bass & Rolling Trap Hi-Hats' },
];

export const QUICK_STORY_PROMPTS = [
  { label: '🌾 De la Sierra a la Cima', text: 'Empezó desde abajo trabajando la tierra con el sol en la espalda. Con puro trabajo duro y disciplina fue levantando su propio camino hasta ganarse el respeto de todos.' },
  { label: '🤝 Palabra y Lealtad a la Clica', text: 'Hombre de una sola pieza, leal con los que estuvieron desde que no había nada. Cuida a su gente, no presume de más y su palabra vale más que cualquier papel firmado.' },
  { label: '⚡ Superando la Envidia con Honor', text: 'Muchos le apostaron en contra y quisieron verlo caer, pero con mente fría, astucia y temple de acero convirtió los tropiezos en victorias que hoy se cantan con orgullo.' },
  { label: '🤠 Tradición, Caballos y Fiesta Brava', text: 'Criado entre el polvo del rancho, caballos finos y el sonido de la banda en vivo. Cuando celebra con sus amigos, retumba la tambora y se brinda por los que ya no están.' }
];

export const QUICK_STORY_PROMPTS_EN = [
  { label: '🌲 Timber Trails to the Top', text: 'Raised in the deep woods on honest hard work. Built his reputation with discipline, sweat, and integrity, standing strong through every storm.' },
  { label: '🤝 Day-One Circle & Loyalty', text: 'Stands firm on his word, holding down the ones who were there before the glory. Keeps his circle tight, never backs down, and his handshake is his bond.' },
  { label: '⚡ Beating the Odds with Honor', text: 'They doubted his path, but through razor-sharp strategy and ice-cold composure, he turned every setback into an empire.' },
  { label: '🎸 Overdriven Grit & Raw Truth', text: 'Fueled by three chords and the gospel truth. Ripping roaring amps, heavy acoustic drums, and authentic heartland stories that echo across the nation.' }
];

export const MALE_VOICE_OPTIONS = [
  { id: 'Fenrir', name: 'El Comandante (Voz Brava)', desc: 'Voz masculina rasposa y varonil (Corrido Bélico / Banda Brava)' },
  { id: 'Charon', name: 'Don Vicente (Barítono)', desc: 'Barítono profundo y solemne (Respeto, Honor y Poder)' },
  { id: 'Puck', name: 'El Gavilán (Tenor Norteño)', desc: 'Tenor enérgico con flow acelerado (Tarolazos y Requintos)' },
  { id: 'Zephyr', name: 'El Centauro (Campirano)', desc: 'Canto melódico firme (Trovador de Sierra y Rancho)' },
] as const;

interface PreviewSong {
  id: string;
  title: string;
  bandStyle: string;
  category: 'modern' | 'classic';
  audioUrl: string;
  duration: string;
  desc: string;
  tags: string[];
  templateData: Partial<ComposerInputs>;
}

const PREVIEW_SONGS: PreviewSong[] = [
  {
    id: 'rap-corrido-santa-fe',
    title: 'Del Barrio a la Cima (Rap Corrido Mexicano)',
    bandStyle: 'Santa Fe Klan & Alemán Style',
    category: 'modern',
    audioUrl: '/audio/las_doce_cuerdas.mp3',
    duration: '45s',
    desc: 'Fusión de rap mexicano con corridos: flow callejero en español con rimas multisilábicas, requintos de 12 cuerdas docerola, 808 sub-bass retumbando y tarolas hip-hop con hi-hats a 130 BPM.',
    tags: ['Rap Corrido', 'Santa Fe Klan', 'Alemán', '808 Sub-Bass', 'Docerolas', '130 BPM'],
    templateData: {
      name: 'El Compa Ángel del Barrio',
      partner: 'La clica del callejón',
      story: 'Creció entre el asfalto del barrio, buscando el progreso con la libreta llena de rimas y la docerola al hombro. Con puro talento, lealtad a los suyos y temple de acero, convirtió la lucha callejera en un himno de orgullo mexicano.',
      style: 'Rap Corrido Mexicano (Santa Fe Klan, Alemán & Dan Sanchez / Flow Callejero con 808 y Requintos)' as CorridoStyle,
      instrument: 'Sub-Bass 808 Callejero, Requinto Docerola y Tarola Hip-Hop' as FeaturedInstrument,
      bandInspiration: 'Rap Corrido Mexicano (Santa Fe Klan / Alemán / Dan Sanchez / Flow Callejero en Español con 808 y Docerolas)',
      storyTheme: 'Superación Personal y Salir de Abajo',
      locationSetting: 'Guanajuato / Monterrey / Guadalajara',
      slangHook: '¡Puro rap corrido mexicano, la calle nunca olvida!',
      tempoBpm: 130
    }
  },
  {
    id: 'palenque-live-banda',
    title: 'En Vivo Desde el Palenque (Banda en Concierto)',
    bandStyle: 'En Vivo Desde el Palenque / Concierto',
    category: 'modern',
    audioUrl: '/audio/pura_doble_p.mp3',
    duration: '45s',
    desc: 'Atmósfera real de palenque en vivo con gritos del público ("¡Échele compa!", "¡Y que truene la banda!"), animación sobre el escenario, trombones bravos en vivo, tarolazos dobles y tamborazo a 144 BPM.',
    tags: ['En Vivo', 'Palenque', 'Gritos del Público', 'Metales Bravos', '144 BPM'],
    templateData: {
      name: 'El Compa Pancho del Palenque',
      partner: 'Toda la clica en las primeras filas',
      story: 'Ambiente de fiesta brava y palenque abarrotado. Entre el humo, el brindis de botellas y los gritos de la gente, la banda sinaloense ruge en vivo con trombones desafiantes, tamborazo pesado y requintos ardiendo.',
      style: 'En Vivo Desde el Palenque: Corrido de Banda en Concierto (Gritos del Público, Metales en Vivo y Tarolazo)' as CorridoStyle,
      instrument: 'Trombones en Vivo, Tarolazos de Concierto y Animación' as FeaturedInstrument,
      bandInspiration: 'En Vivo Desde el Palenque / Concierto en Vivo (Gritos del Público, Trombones Bravos y Tamborazo)',
      storyTheme: 'Fiesta Brava y Concierto en Vivo con Banda',
      locationSetting: 'Culiacán (Clave 667 / Tres Ríos / El Humaya)',
      slangHook: '¡Y que retumbe la banda en vivo desde el palenque, compa!',
      tempoBpm: 144
    }
  },
  {
    id: 'street-rap-metro-21',
    title: 'Street Legacy (Metro & 21 Savage / Dark Trap / No Pop)',
    bandStyle: 'Hard Street Rap & Menacing 808 Trap',
    category: 'modern',
    audioUrl: '/audio/la_664_de_tijuana.mp3',
    duration: '45s',
    desc: 'Menacing dark piano stabs, sliding 808 sub-bass, razor-sharp triplet hi-hats, hard acoustic rimshots, zero pop fluff, and raw authentic street rap delivery at 138 BPM.',
    tags: ['Street Rap', 'Sliding 808s', 'Metro & 21 Savage', 'No Pop', '138 BPM'],
    templateData: {
      name: 'The Don / Street Boss',
      partner: 'The inner circle and shooters',
      story: 'No pop hooks, no commercial watered-down beats. Just raw hard-hitting street grit, dark sliding 808s, ruthless loyalty, and ice-cold ambition rising straight out of the concrete to claim the top spot.',
      style: 'Hard-Hitting Street Rap & Menacing 808 Trap (Metro & 21 Savage / Dark Cinematic Beats / No Pop)' as CorridoStyle,
      instrument: 'Menacing Sliding 808s, Hard Rimshots & Dark Bells' as FeaturedInstrument,
      bandInspiration: 'Hard-Hitting Street Rap & Dark 808 Trap (Metro Boomin / 21 Savage / Future / No Pop / Gritty Street Flow)',
      storyTheme: 'Superación Personal y Salir de Abajo',
      locationSetting: 'Houston y Sur de Texas (H-Town / 713)',
      slangHook: 'Straight facts, zero cap, we run these streets!',
      tempoBpm: 138
    }
  },
  {
    id: 'modern-banda-belico',
    title: 'Furia Bélica en Vivo (Modern Banda)',
    bandStyle: 'Modern Banda / Bélico en Vivo',
    category: 'modern',
    audioUrl: '/audio/pura_doble_p.mp3',
    duration: '45s',
    desc: 'Metales de concierto en vivo rugiendo con trombones y charchetas, requintos de 12 cuerdas en terceras con plumilleo veloz y tamborazo con platillazos a 144 BPM. Alta energía de fiesta brava.',
    tags: ['Modern Banda', 'Metales en Vivo', 'Requintos 12 Cuerdas', '144 BPM'],
    templateData: {
      name: 'El Centinela',
      partner: 'La clica brava y leal',
      story: 'Hombre bragado que se forjó en el trabajo pesado. Cero baladas o canciones lentas: pura fiesta de alta energía con requintos de doce cuerdas sonando en vivo, trombones de vara rugiendo y tamborazo con platillazos.',
      style: 'Modern Banda/Bélico (Requintos 12 Cuerdas, Metales en Vivo y Tamborazo)' as CorridoStyle,
      instrument: 'Requinto 12 Cuerdas, Metales en Vivo y Tambora' as FeaturedInstrument,
      bandInspiration: 'Modern Banda / Bélico en Vivo (Requintos 12 Cuerdas, Metales de Concierto y Tamborazos)',
      storyTheme: 'Superación Personal y Salir de Abajo',
      locationSetting: 'Culiacán / Mazatlán / Guadalajara',
      slangHook: '¡Que truene la banda en vivo y retumbe el requinto, viejo!',
      tempoBpm: 144
    }
  },
  {
    id: 'grupo-mente-maestra',
    title: 'El Jaque Mate (Estilo Grupo Mente Maestra)',
    bandStyle: 'Bélico Estratégico & Tarolas Militares',
    category: 'modern',
    audioUrl: '/audio/clave_667_humaya.mp3',
    duration: '45s',
    desc: 'Requintos dobles en 12 cuerdas a doble púa supersónica, tarolas secas militares y sousafón pesado a 146 BPM. Cero canciones románticas ni lentas.',
    tags: ['Grupo Mente Maestra', 'Bélico Estratégico', 'Tarolas Secas', '146 BPM'],
    templateData: {
      name: 'El Estratega',
      partner: 'La clica de confianza y mando',
      story: 'Hombre sereno y calculador que mueve las piezas del tablero con precisión milimétrica. Cero romances o lentitudes: puro avance firme, requintos dobles zumbando a doble púa y tarolazos secos con sousafón.',
      style: 'Grupo Mente Maestra (Bélico Estratégico, Requintos Dobles y Tarolas 2026)' as CorridoStyle,
      instrument: 'Requinto Doble Púa y Tarola Militar Seca' as FeaturedInstrument,
      bandInspiration: 'Grupo Mente Maestra (Bélico Pesado, Requintos Dobles a Doble Púa, Tarolas Secas y Sousafón)',
      storyTheme: 'Superación Personal y Salir de Abajo',
      locationSetting: 'Culiacán (Clave 667 / Tres Ríos / El Humaya)',
      slangHook: '¡Pura Mente Maestra y jaque mate al cuadro, viejo!',
      tempoBpm: 146
    }
  },
  {
    id: 'gerardo-ortiz-damaso',
    title: 'Dámaso / El Mini Lic (Estilo Gerardo Ortiz)',
    bandStyle: 'Banda Pesada & Corrido Progresivo',
    category: 'modern',
    audioUrl: '/audio/el_hombre_de_la_sierra.mp3',
    duration: '45s',
    desc: 'Tamborazo pesado con platillazos explosivos, redobles rápidos de tarola, requinto de 12 cuerdas picado en terceras y tuba en doble golpe (144 BPM). Cero canciones lentas o románticas.',
    tags: ['Gerardo Ortiz', 'Banda Pesada', 'Tambora Brava', '144 BPM'],
    templateData: {
      name: 'El Mini Lic / Comandante',
      partner: 'La clica sinaloense de respaldo',
      story: 'Hombre bragado de Culiacán, criado entre la tambora y el respeto. Porte elegante, palabra firme, con la banda sinaloense tronando en vivo a ritmo acelerado y requintos veloces.',
      style: 'Estilo Gerardo Ortiz (Banda Pesada & Corrido Progresivo)' as CorridoStyle,
      instrument: 'Requinto 12 Cuerdas Rápido y Tambora Pesada' as FeaturedInstrument,
      bandInspiration: 'Gerardo Ortiz (Banda Pesada, Tamborazos Fuertes, Tarolas Bravas y Requinto Picado)',
      storyTheme: 'Respeto, Poder y Palabra de Hombre',
      locationSetting: 'Culiacán / El Dorado, Sinaloa',
      slangHook: '¡Que truene la tambora y retumbe la banda, pariente!',
      tempoBpm: 144
    }
  },
  {
    id: 'legado-sierreno',
    title: 'El Humo Verde (Estilo Legado 7)',
    bandStyle: 'Legado 7 & Sierreño Urbano',
    category: 'modern',
    audioUrl: '/audio/las_doce_cuerdas.mp3',
    duration: '45s',
    desc: 'Requintos veloces de 12 cuerdas a doble plumilleo, batería moderna pesada con tarolazos y bajo contundente.',
    tags: ['Legado 7', 'Docerola 12 Cuerdas', 'Batería Pesada', 'Sierreño Urbano'],
    templateData: {
      name: 'El Compa Chuy',
      partner: 'La clica de confianza',
      story: 'Pionero del movimiento sierreño urbano moderno. Con la docerola de doce cuerdas afinada y una batería contundente, navega las calles con respeto, lealtad y estilo fino.',
      style: 'Legado 7 & Sierreño Urbano (Requintos 12 Cuerdas y Batería)' as CorridoStyle,
      instrument: 'Docerola 12 Cuerdas y Batería Pesada' as FeaturedInstrument,
      bandInspiration: 'Legado 7 & Herencia de Patrones (Sierreño Urbano, Requintos Rápidos y Batería)',
      storyTheme: 'Superación Personal y Salir de Abajo',
      locationSetting: 'Los Ángeles / San Bernardino, CA',
      slangHook: '¡Puro sierreño urbano y humo verde, pariente!',
      tempoBpm: 126
    }
  },
  {
    id: 'dallas-peso-pluma',
    title: 'El Ingeniero de Dallas (2026)',
    bandStyle: 'Corrido Bélico Tech 2026',
    category: 'modern',
    audioUrl: '/audio/el_senor_de_dallas.mp3',
    duration: '45s',
    desc: 'Trombón de vara cortante, requinto de 12 cuerdas, batería acústica con tarolas y lírica de drones e inteligencia artificial.',
    tags: ['Bélico Tech', 'IA Drones', 'Dallas Texas', 'Medina Tech'],
    templateData: {
      name: 'Alfredo Medina "El Ingeniero"',
      partner: 'Medina Tech y su equipo de desarrollo',
      story: 'Con raíces mexicanas y temple de acero, Alfredo Medina conquistó los cielos de Texas. Pionero de la inteligencia artificial y drones autónomos en Dallas, levantó su empresa Medina Tech con respeto, disciplina y orgullo.',
      style: 'Corrido Bélico Tech 2026' as CorridoStyle,
      instrument: 'Requinto (12 Cuerdas)' as FeaturedInstrument,
      bandInspiration: 'Tito Double P & Peso Pluma (Bélico Tumbado 2026, Trombón de Vara y Requintos)',
      storyTheme: 'Superación Personal y Salir de Abajo',
      locationSetting: 'Dallas y Norte de Texas',
      slangHook: '¡Puro Dallas y arriba México, pariente!',
      tempoBpm: 128
    }
  },
  {
    id: 'modern-trap-drake',
    title: 'No Cap (Metro & Drake Style)',
    bandStyle: 'Modern Hard Trap 2026',
    category: 'modern',
    audioUrl: '/audio/la_664_de_tijuana.mp3',
    duration: '45s',
    desc: 'Booming 808 sub bass, rapid fine rolling pitch-bent hi-hats, punchy rimshot snares, and hard rap flow.',
    tags: ['Hard Trap', 'Fast Hi-Hats', '808 Sub Bass', 'Metro / Drake'],
    templateData: {
      name: 'The Lone Star Phenom',
      partner: 'The Inner Circle',
      story: 'An ultra-modern hard trap anthem about grinding from the bottom, building a high-tech empire, shutting down all the doubt, and celebrating success with booming 808s and rapid spin hi-hats.',
      style: 'Modern Trap & Rap (Metro Boomin / Drake / Hard 808s & Fast Hi-Hats)' as CorridoStyle,
      instrument: 'Hard-Hitting 808 Bass & Rolling Trap Hi-Hats' as FeaturedInstrument,
      bandInspiration: 'Modern Trap & Rap (Metro Boomin / Drake / Travis Scott / Heavy 808s & Fast Hi-Hats)',
      storyTheme: 'Superación Personal y Salir de Abajo',
      locationSetting: 'Dallas y Norte de Texas',
      slangHook: 'Yeah, all gas no brakes, we run the game!',
      tempoBpm: 135
    }
  },
  {
    id: 'juniors-mexicali',
    title: 'La 686 de Mexicali',
    bandStyle: 'Estilo Los Juniors de Mexicali',
    category: 'modern',
    audioUrl: '/audio/la_686_de_mexicali.mp3',
    duration: '45s',
    desc: 'Docerolas a doble plumilleo rápido, metales, batería con tarolazos y charchetas sincopadas al estilo 686.',
    tags: ['Docerola', 'Mexicali 686', 'Baja Cali', 'Bélico'],
    templateData: {
      name: 'El Compa Iván del 686',
      partner: 'Su gente leal de la frontera',
      story: 'Creció en el calor del desierto de Mexicali superando todas las adversidades con visión y lealtad. Forjó su camino sin deberle nada a nadie, siempre con la docerola sonando fuerte y los amigos firmes.',
      style: 'Baja Cali Fronterizo (Estilo Los Juniors de Mexicali 686)' as CorridoStyle,
      instrument: 'Trombón y Charcheta' as FeaturedInstrument,
      bandInspiration: 'Los Juniors de Mexicali (Docerola Rápida, Charchetas y Metales 686)',
      storyTheme: 'Historias de la Frontera (Tijuana 664 / Mexicali 686)',
      locationSetting: 'Mexicali (El 686 / Valle de Mexicali)',
      slangHook: '¡Puro Mexicali, compa!',
      tempoBpm: 124
    }
  },
  {
    id: 'la-664-tijuana',
    title: 'La 664 de Tijuana (2026)',
    bandStyle: 'Estilo Fuerza Regida & Calle 664',
    category: 'modern',
    audioUrl: '/audio/la_664_de_tijuana.mp3',
    duration: '45s',
    desc: 'Baja Cali 664 con requintos supersónicos, trombones cortados y bajo pesado en la frontera.',
    tags: ['Baja Cali', 'Tijuana 664', 'Fuerza Regida', 'Bélico 2026'],
    templateData: {
      name: 'El Compa Mike de la 664',
      partner: 'Su gente firme de Playas a Otay',
      story: 'Creció en el asfalto de Tijuana y con temple de acero cruzó todos los obstáculos. Hoy maneja la empresa con lealtad y respeto, celebrando con la docerola al hombro y los compas de siempre.',
      style: 'Corrido Urbano Callejero' as CorridoStyle,
      instrument: 'Trombón y Charcheta' as FeaturedInstrument,
      bandInspiration: 'Fuerza Regida & Calle 664 (Baja Cali Urbano, Sousafón y Flow Callejero)',
      storyTheme: 'Historias de la Frontera (Tijuana 664 / Mexicali 686)',
      locationSetting: 'Tijuana y Baja California',
      slangHook: '¡Arriba la 664 de Tijuana, pariente!',
      tempoBpm: 128
    }
  },
  {
    id: 'leon-del-norte',
    title: 'El León del Norte',
    bandStyle: 'Norteño Moderno con Tarolas',
    category: 'classic',
    audioUrl: '/audio/el_leon_del_norte.mp3',
    duration: '45s',
    desc: 'Norteño bravo con tarolazos, acordeón veloz y bajo sexto.',
    tags: ['Tarolas', 'Acordeón', 'Norteño'],
    templateData: {
      name: 'Capitán Héctor Valenzuela',
      partner: 'Su fiel conjunto norteño',
      story: 'Forjado en el trabajo duro desde muy joven, defendió el nombre de su familia y su tierra con valentía y elegancia. Un corrido norteño bélico bravo con acordeón veloz, tarolas y tuba.',
      style: 'Norteño Moderno con Tarolas' as CorridoStyle,
      instrument: 'Batería y Percusiones' as FeaturedInstrument,
      bandInspiration: 'Grupo Arriesgado & Panther Bélico (Norteño Moderno con Tarolazos)',
      storyTheme: 'Honor, Lealtad y Código de Amigos',
      locationSetting: 'Tijuana y Baja California',
      slangHook: '¡Firme con la lealtad compa!',
      tempoBpm: 130
    }
  }
];

export interface UnifiedCorridoStyle {
  id: string;
  label: string;
  sublabel: string;
  style: CorridoStyle;
  bandInspiration: string;
  instrument: FeaturedInstrument;
  defaultBpm: number;
  category: GenreCategory;
}

export const UNIFIED_CORRIDO_STYLES: UnifiedCorridoStyle[] = [
  {
    id: 'rap-corrido-mexicano',
    label: 'Rap Corrido Mexicano (Santa Fe Klan & Alemán / Flow Callejero con 808)',
    sublabel: 'Versos de rap en español con flow callejero, requintos 12 cuerdas y sub-bass 808 pesado • 130 BPM',
    style: 'Rap Corrido Mexicano (Santa Fe Klan, Alemán & Dan Sanchez / Flow Callejero con 808 y Requintos)',
    bandInspiration: 'Rap Corrido Mexicano (Santa Fe Klan / Alemán / Dan Sanchez / Flow Callejero en Español con 808 y Docerolas)',
    instrument: 'Sub-Bass 808 Callejero, Requinto Docerola y Tarola Hip-Hop',
    defaultBpm: 130,
    category: 'rap_corrido'
  },
  {
    id: 'reggaeton-perreo-2026',
    label: 'Reggaeton Perreo 2026 (Bad Bunny & Feid / Heavy Dembow & Synth Stabs)',
    sublabel: 'Dembow rítmico bailable, bajos sub 808 profundos, percusión syncopada y sintetizadores urbanos • 96 BPM',
    style: 'Reggaeton Perreo 2026 (Bad Bunny & Feid / Heavy Dembow & Synth Stabs)',
    bandInspiration: 'Bad Bunny, Feid & Tainy (Reggaeton Moderno, Dembow Pesado, Sintetizadores y Flow Urbano)',
    instrument: 'Dembow Kick & Snare Syncopado, 808 Sub y Sintetizadores Urbanos',
    defaultBpm: 96,
    category: 'latin_urban'
  },
  {
    id: 'trap-latino-pesado',
    label: 'Trap Latino Pesado (Anuel AA & Eladio Carrión / 808s & Flow Oscuro)',
    sublabel: 'Atmósfera oscura, bajos 808 deslizantes, redobles rápidos de hi-hat y barras directas de calle • 128 BPM',
    style: 'Trap Latino Pesado (Anuel AA & Eladio Carrión / 808s & Flow Oscuro)',
    bandInspiration: 'Anuel AA & Eladio Carrión (Trap Latino Callejero, 808s Deslizantes y Barras de Calle)',
    instrument: '808 Sub Bass Pesado, Hi-Hats Rápidos y Rimshots Secos de Trap',
    defaultBpm: 128,
    category: 'latin_urban'
  },
  {
    id: 'electro-corrido-edm',
    label: 'Electro Corrido Festival (Steve Aoki & Deorro / 128 BPM Synth Drops & Requinto)',
    sublabel: 'Fusión explosiva EDM: bombos a 4 tiempos a 128 BPM, sintetizadores festivaleros y requintos veloces de 12 cuerdas',
    style: 'Electro Corrido Festival (Steve Aoki & Deorro / 128 BPM Synth Drops & Requinto)',
    bandInspiration: 'Steve Aoki & Deorro x Regional (Electro Corrido EDM, Drops Electrónicos y Requinto Docerola)',
    instrument: 'Sintetizadores Lead EDM, Kick a 4 Tiempos y Requinto Electroacústico',
    defaultBpm: 128,
    category: 'electro_fusion'
  },
  {
    id: 'pop-regional-romantico',
    label: 'Pop Regional & Balada Acústica (Carín León & Christian Nodal / Guitarras & Sentimiento)',
    sublabel: 'Guitarras acústicas cálidas, arreglos de bajo suaves, lírica sentimental profunda y melodías acústicas • 116 BPM',
    style: 'Pop Regional & Balada Acústica (Carín León & Christian Nodal / Guitarras & Sentimiento)',
    bandInspiration: 'Carín León & Christian Nodal (Pop Regional, Balada Acústica, Guitarras Finas y Sentimiento)',
    instrument: 'Guitarra Acústica de Nylon, Bajo Cálido y Percusión Suave',
    defaultBpm: 116,
    category: 'acoustic_pop'
  },
  {
    id: 'modern-banda-belico',
    label: 'Modern Banda / Bélico en Vivo (Metales, Requinto y Tamborazo)',
    sublabel: 'Metales de concierto en vivo, requinto 12 cuerdas y tamborazo con platillazos • 144 BPM',
    style: 'Modern Banda/Bélico (Requintos 12 Cuerdas, Metales en Vivo y Tamborazo)',
    bandInspiration: 'Modern Banda / Bélico en Vivo (Requintos 12 Cuerdas, Metales de Concierto y Tamborazos)',
    instrument: 'Requinto 12 Cuerdas, Metales en Vivo y Tambora',
    defaultBpm: 144,
    category: 'regional_belico'
  },
  {
    id: 'mente-maestra',
    label: 'Grupo Mente Maestra (Bélico Estratégico & Tarolas Militares)',
    sublabel: 'Requintos dobles a doble púa, tarola militar seca y sousafón pesado • 146 BPM',
    style: 'Grupo Mente Maestra (Bélico Estratégico, Requintos Dobles y Tarolas 2026)',
    bandInspiration: 'Grupo Mente Maestra (Bélico Pesado, Requintos Dobles a Doble Púa, Tarolas Secas y Sousafón)',
    instrument: 'Requinto Doble Púa y Tarola Militar Seca',
    defaultBpm: 146,
    category: 'regional_belico'
  },
  {
    id: 'gerardo-ortiz',
    label: 'Estilo Gerardo Ortiz (Banda Pesada & Corrido Progresivo)',
    sublabel: 'Tambora con platillazos explosivos, redobles de tarola y requinto picado en terceras • 144 BPM',
    style: 'Estilo Gerardo Ortiz (Banda Pesada & Corrido Progresivo)',
    bandInspiration: 'Gerardo Ortiz (Banda Pesada, Tamborazos Fuertes, Tarolas Bravas y Requinto Picado)',
    instrument: 'Requinto 12 Cuerdas Rápido y Tambora Pesada',
    defaultBpm: 144,
    category: 'regional_belico'
  },
  {
    id: 'legado-7',
    label: 'Legado 7 & Herencia de Patrones (Sierreño Urbano & Batería)',
    sublabel: 'Docerolas a doble plumilleo rápido, batería acústica pesada y bajo contundente • 126 BPM',
    style: 'Legado 7 & Sierreño Urbano (Requintos 12 Cuerdas y Batería)',
    bandInspiration: 'Legado 7 & Herencia de Patrones (Sierreño Urbano, Requintos Rápidos y Batería)',
    instrument: 'Docerola 12 Cuerdas y Batería Pesada',
    defaultBpm: 126,
    category: 'regional_belico'
  },
  {
    id: 'palenque-live',
    label: 'En Vivo Desde el Palenque (Banda en Concierto & Gritos del Público)',
    sublabel: 'Gritos del público, animación en escenario, metales en vivo y tamborazos • 144 BPM',
    style: 'En Vivo Desde el Palenque: Corrido de Banda en Concierto (Gritos del Público, Metales en Vivo y Tarolazo)',
    bandInspiration: 'En Vivo Desde el Palenque / Concierto en Vivo (Gritos del Público, Trombones Bravos y Tamborazo)',
    instrument: 'Trombones en Vivo, Tarolazos de Concierto y Animación',
    defaultBpm: 144,
    category: 'regional_belico'
  },
  {
    id: 'baja-cali-juniors',
    label: 'Baja Cali Fronterizo (Los Juniors de Mexicali 686)',
    sublabel: 'Docerolas a doble plumilleo veloz, charchetas y metales fronterizos • 135 BPM',
    style: 'Baja Cali Fronterizo (Docerolas y Metales en Vivo)',
    bandInspiration: 'Baja Cali Fronterizo (Estilo Los Juniors de Mexicali 686)',
    instrument: 'Requinto (12 Cuerdas)',
    defaultBpm: 135,
    category: 'regional_belico'
  },
  {
    id: 'belico-tumbado-2026',
    label: 'Bélico Tumbado 2026 (Tito Double P & Peso Pluma)',
    sublabel: 'Trombones de vara cortantes, requintos veloces de 12 cuerdas y batería moderna • 130 BPM',
    style: 'Bélico Tumbado 2026',
    bandInspiration: 'Tito Double P & Peso Pluma (Bélico Tumbado 2026, Trombón de Vara y Requintos)',
    instrument: 'Trombón y Charcheta',
    defaultBpm: 130,
    category: 'regional_belico'
  },
  {
    id: 'corrido-urbano-fuerza',
    label: 'Corrido Urbano Callejero (Fuerza Regida & Calle 664)',
    sublabel: 'Sousafón rugiendo en vivo, bajo eléctrico, tarola seca y requintos callejeros • 128 BPM',
    style: 'Corrido Urbano Callejero',
    bandInspiration: 'Fuerza Regida & Calle 664 (Baja Cali Urbano, Sousafón y Flow Callejero)',
    instrument: 'Bajo Eléctrico y Sousafón',
    defaultBpm: 128,
    category: 'regional_belico'
  },
  {
    id: 'norteno-tarolas',
    label: 'Norteño Moderno con Tarolas (Grupo Arriesgado & Panther Bélico)',
    sublabel: 'Acordeón diatónico rápido, tarolazos enérgicos, batería completa y bajo sexto • 138 BPM',
    style: 'Norteño Moderno con Tarolas',
    bandInspiration: 'Grupo Arriesgado & Panther Bélico (Norteño Moderno con Tarolazos)',
    instrument: 'Batería y Percusiones',
    defaultBpm: 138,
    category: 'regional_belico'
  },
  {
    id: 'banda-sinaloense-brava',
    label: 'Corrido de Banda Sinaloense Brava (Culiacán Tradición)',
    sublabel: 'Tuba con chuntata pesada, tambora, tarolas, batería y trombones bravos • 142 BPM',
    style: 'Corrido de Banda Sinaloense Brava',
    bandInspiration: 'Banda Sinaloense Brava (Tuba Sinaloense, Tambora, Clarinete y Trombón de Culiacán)',
    instrument: 'Tuba y Tambora Sinaloense',
    defaultBpm: 142,
    category: 'regional_belico'
  },
  {
    id: 'tumbado-melodico',
    label: 'Tumbado Melódico Vanguardia (Junior H & Natanael Cano)',
    sublabel: 'Requintos melódicos menores, armonías finas de docerola y bajo melancólico • 118 BPM',
    style: 'Tumbado Melódico Vanguardia',
    bandInspiration: 'Natanael Cano & Junior H (Tumbado Melódico, Armonías en Menor)',
    instrument: 'Requinto (12 Cuerdas)',
    defaultBpm: 118,
    category: 'regional_belico'
  },
  {
    id: 'sierreno-campirano',
    label: 'Sierreño Campirano Moderno (Los Dareyes de la Sierra)',
    sublabel: 'Docerolas campiranas en terceras, batería acústica y requinto rústico veloz • 124 BPM',
    style: 'Sierreño Campirano',
    bandInspiration: 'Los Dareyes de la Sierra (Campirano Pesado, Terceras Chillonas y Trombón)',
    instrument: 'Requinto (12 Cuerdas)',
    defaultBpm: 124,
    category: 'regional_belico'
  },
  {
    id: 'houston-texas-rap',
    label: 'Houston Texas Rap (UGK & Z-Ro / Slow Rolling 808s)',
    sublabel: 'Southern street rap, slow rolling heavy 808s, soulful keys, and raw cadence • 74 BPM',
    style: 'Houston Texas Rap (UGK & Z-Ro Style / Slow Rolling 808s)',
    bandInspiration: 'Houston Texas Underground Rap (UGK / Bun B / Z-Ro / Trae tha Truth / Scarface Style)',
    instrument: 'Heavy Houston 808s & Soulful Texas Keys',
    defaultBpm: 74,
    category: 'us_hiphop'
  },
  {
    id: 'country-americana-roots',
    label: 'Modern Country & Americana (Morgan Wallen & Zach Bryan / Acoustic Guitars & Stories)',
    sublabel: 'Acoustic guitar strumming, telecaster fills, kick-snare heartbeat & genuine storytelling • 115 BPM',
    style: 'American Country & Americana (Nashville / Heartland Folk / Whispering Pines)' as CorridoStyle,
    bandInspiration: 'Morgan Wallen, Luke Combs & Zach Bryan (Modern Country, Southern Rock, Acoustic Guitars & Live Drums)',
    instrument: 'Heavy Houston 808s & Soulful Texas Keys' as FeaturedInstrument,
    defaultBpm: 115,
    category: 'country_americana'
  },
  {
    id: 'contemporary-pop-rnb',
    label: 'Global Commercial Pop & R&B (The Weeknd, Taylor Swift & SZA / Smooth Grooves)',
    sublabel: 'Lush atmospheric chords, warm sub-bass, crisp pop drums & catchy topline melodies • 110 BPM',
    style: 'Pop Regional & Balada Acústica (Carín León & Christian Nodal / Guitarras & Sentimiento)' as CorridoStyle,
    bandInspiration: 'The Weeknd, Taylor Swift & SZA (Global Commercial Pop, R&B & Catchy Toplines)',
    instrument: 'Heavy Houston 808s & Soulful Texas Keys' as FeaturedInstrument,
    defaultBpm: 110,
    category: 'global_pop_rnb'
  },
  {
    id: 'modern-rock-indie',
    label: 'Modern Rock & Alternative (Foo Fighters & The Killers / Stadium Power Chords)',
    sublabel: 'Overdriven electric guitar riffs, heavy acoustic drums & visceral chest vocal delivery • 132 BPM',
    style: 'Modern Rock & Alternative (Overdriven Riffs, Heavy Crash Drums & Driving Bass)' as CorridoStyle,
    bandInspiration: 'Foo Fighters, The Killers & Arctic Monkeys (Modern Rock & Stadium Alternative)',
    instrument: 'Menacing Sliding 808s, Hard Rimshots & Dark Bells' as FeaturedInstrument,
    defaultBpm: 132,
    category: 'rock_alternative'
  },
  {
    id: 'afrobeats-tropical-pop',
    label: 'Afrobeats & Tropical Fusion (Burna Boy & Wizkid / Afro-Perception & Hooks)',
    sublabel: 'Syncopated afro percussion, warm basslines, infectious rhythmic bounce & bright hooks • 105 BPM',
    style: 'Reggaeton Perreo 2026 (Bad Bunny & Feid / Heavy Dembow & Synth Stabs)' as CorridoStyle,
    bandInspiration: 'Burna Boy, Wizkid & Tems (Afrobeats, Tropical Fusion & Afro-Percussion)',
    instrument: 'Dembow Kick & Snare Syncopado, 808 Sub y Sintetizadores Urbanos' as FeaturedInstrument,
    defaultBpm: 105,
    category: 'latin_urban'
  },
  {
    id: 'modern-hard-trap',
    label: 'Modern Hard Trap & Rap (Metro Boomin & Drake / Fast Hats)',
    sublabel: 'Booming 808 sub-bass, rapid rolling hi-hats, and razor-sharp rap delivery • 135 BPM',
    style: 'Modern Trap & Rap (Metro Boomin / Drake / Hard 808s & Fast Hi-Hats)',
    bandInspiration: 'Modern Trap & Rap (Metro Boomin / Drake / Travis Scott / Heavy 808s & Fast Hi-Hats)',
    instrument: 'Hard-Hitting 808 Bass & Rolling Trap Hi-Hats',
    defaultBpm: 135,
    category: 'us_hiphop'
  }
];

const BAND_OPTIONS = UNIFIED_CORRIDO_STYLES.map(s => s.bandInspiration);

const THEME_OPTIONS = [
  'Superación Personal y Salir de Abajo',
  'Honor, Lealtad y Código de Amigos',
  'Fiesta Brava y Concierto en Vivo con Banda',
  'Culiacán y la Clave 667 (El Humaya y Tres Ríos)',
  'La Sierra Brava, los Ranchos y Tradiciones',
  'Rutas 4x4, Vida Nocturna y Fiestas Privadas',
  'El Camino del Éxito y Respeto Familiar'
];

const LOCATION_OPTIONS = [
  'Culiacán (Clave 667 / Tres Ríos / El Humaya)',
  'Mazatlán y Costa Sinaloense',
  'Guadalajara / Zapopan, Jalisco',
  'Tijuana (La 664 / Playas / Zona Río / Otay)',
  'Houston y Sur de Texas (H-Town / 713)',
  'Dallas y Norte de Texas (DFW / 214)',
  'La Sierra Madre (Sonora / Sinaloa)',
  'Los Ángeles / San Bernardino, CA'
];

const SLANG_SUGGESTIONS = [
  '¡Que truene la banda en vivo y retumbe el requinto, viejo!',
  '¡Puro pa delante viejo, que truene la tambora!',
  '¡Puro Culiacán y la 667, viejo!',
  '¡Arriba la banda y la clica firme!',
  '¡Bélico y elegante, puro pa delante!',
  '¡De la sierra pa\' la cima!',
  '¡Y así suena la 12 cuerdas!',
  '¡Firme con la lealtad compa!'
];

export interface CompositionStylePreset {
  id: string;
  name: string;
  badge: string;
  meter: string;
  syllables: string;
  rhymeScheme: string;
  structure: string;
  description: string;
}

export const COMPOSITION_STYLE_PRESETS: CompositionStylePreset[] = [
  {
    id: 'octosyllabic_corrido',
    name: 'Corrido Octosílabo Clásico',
    badge: 'Métrica 8 Sílabas',
    meter: '3/4 Vals Zapateado / 2/4 Polka Corrido',
    syllables: '8 Sílabas por Verso (Octosílabo Estricto)',
    rhymeScheme: 'Consonante ABCB / AABB Pareado',
    structure: '6 Estrofas (Intro, Desarrollo, Coro Doble, Clímax, Remate)',
    description: 'Regla clásica del corrido tradicional y bélico: versos octosílabos (8 sílabas exactas) con rima consonante limpia en el 2º y 4º verso.'
  },
  {
    id: 'multisyllabic_rap',
    name: 'Multisilábico Rap & Trap Callejero',
    badge: 'Flow 16-Bars 808',
    meter: '4/4 Street Beat & 808 Trap (130-140 BPM)',
    syllables: '12-16 Sílabas por Compás (Cadencia Acelerada)',
    rhymeScheme: 'Rima Interna Doble & Multisílabas',
    structure: '16-Bar Verso 1 • 8-Bar Coro • 16-Bar Verso 2 • Outro Snare',
    description: 'Cadencia rap/trap de alta densidad con rimas multisilábicas internas, metáforas urbanas y remate en el golpe seco de tarola.'
  },
  {
    id: 'sierreno_tumbado',
    name: 'Tumbado & Sierreño Moderno',
    badge: 'Docerola 8-10 Sílabas',
    meter: '2/4 Tumbado & 6/8 Requinto (115-130 BPM)',
    syllables: '8-10 Sílabas (Métrica Tumbada Fluida)',
    rhymeScheme: 'AABB Pareados y Rima Asonante Regional',
    structure: 'Paseo Docerola • Verso 1 • Verso 2 • Coro Melódico • Remate',
    description: 'Fraseo contemporáneo con versos de 8 a 10 sílabas para acompañar arreglos menores de docerola y sousafón.'
  },
  {
    id: 'sinaloense_banda',
    name: 'Banda Brava Sinaloense',
    badge: 'Tamborazo & Metales',
    meter: '2/4 Banda Tamborazo (140-150 BPM)',
    syllables: 'Octosílabo / Decasílabo (8-10 Sílabas con Corte)',
    rhymeScheme: 'ABCB / ABAB Consonante Explosivo',
    structure: 'Grito de Guerra • Verso Tuba • Coro Tambora • Remate',
    description: 'Métrica enérgica diseñada para encajar con los cortes de trombón, charcheta y los golpes potentes de la tambora sinaloense.'
  },
  {
    id: 'ranchera_romance',
    name: 'Ranchera & Romance Elegante',
    badge: 'Endecasílabo Mariachi',
    meter: '3/4 Vals Ranchero / Canción (110-120 BPM)',
    syllables: '9-11 Sílabas (Endecasílabo Poético)',
    rhymeScheme: 'ABBA / ABCB Consonante Elegante',
    structure: 'Intro Guitarrón • Verso Sentimental • Coro Apasionado • Outro',
    description: 'Métrica poética tradicional de romance mexicano con versos de 9 a 11 sílabas y lenguaje de respeto, caballerosidad y sentimiento.'
  },
  {
    id: 'border_spanglish',
    name: 'Border Spanglish Flow',
    badge: 'Bilingual Code-Switch',
    meter: '4/4 & 2/4 Fronterizo',
    syllables: '8-10 Beats Bilingües (Cross-Language)',
    rhymeScheme: 'Cross-Language Slant & Perfect Rhymes',
    structure: 'Intro Spanglish • Verse 1 (ES/EN) • Bilingual Hook • Verse 2',
    description: 'Fusión bilingüe que alterna naturalmente entre octosílabos en español y cadencias de rap en inglés con jerga fronteriza.'
  }
];

export const CreationForm: React.FC<CreationFormProps> = ({ 
  language = 'es',
  onSubmit, 
  isLoading,
  activeAgent,
  onOpenAgentsHub,
  onOpenAgentComputer,
  onOpenMarketingHub
}) => {
  const isEn = language === 'en';
  const [inputs, setInputs] = useState<ComposerInputs>({
    name: '',
    story: '',
    partner: '',
    style: 'Modern Banda/Bélico (Requintos 12 Cuerdas, Metales en Vivo y Tamborazo)',
    instrument: 'Requinto 12 Cuerdas, Metales en Vivo y Tambora',
    selectedVoice: 'Fenrir',
    tempoBpm: 144,
    bandInspiration: 'Modern Banda / Bélico en Vivo (Requintos 12 Cuerdas, Metales de Concierto y Tamborazos)',
    storyTheme: 'Superación Personal y Salir de Abajo',
    locationSetting: 'Culiacán (Clave 667 / Tres Ríos / El Humaya)',
    slangHook: '¡Que truene la banda en vivo y retumbe el requinto, viejo!',
    genreCategory: 'regional_belico',
    musicalGenreTag: 'Modern Banda / Bélico en Vivo (Requintos 12 Cuerdas, Metales en Vivo y Tamborazo)',
    marketingTag: 'MARKET: REGIONAL MEXICANO / CORRIDOS TUMBADOS & BÉLICO',
    primaryLanguage: 'es'
  });

  const [genreFilter, setGenreFilter] = useState<GenreCategory | 'all'>('all');
  const [activePresetId, setActivePresetId] = useState<string>('octosyllabic_corrido');

  // Sync active composition style preset when style or primary language changes
  useEffect(() => {
    const raw = (inputs.style || '').toLowerCase();
    const lang = inputs.primaryLanguage || 'es';

    let matchedId = 'octosyllabic_corrido';
    if (lang === 'spanglish') {
      matchedId = 'border_spanglish';
    } else if (raw.includes('rap') || raw.includes('trap') || raw.includes('hip hop') || raw.includes('houston')) {
      matchedId = 'multisyllabic_rap';
    } else if (raw.includes('mariachi') || raw.includes('ranchera')) {
      matchedId = 'ranchera_romance';
    } else if (raw.includes('sierr') || raw.includes('tumbado')) {
      matchedId = 'sierreno_tumbado';
    } else if (raw.includes('banda') || raw.includes('tambora')) {
      matchedId = 'sinaloense_banda';
    }

    setActivePresetId(matchedId);
    const preset = COMPOSITION_STYLE_PRESETS.find(p => p.id === matchedId) || COMPOSITION_STYLE_PRESETS[0];

    setInputs(prev => ({
      ...prev,
      harnessName: prev.harnessName || preset.name,
      harnessMeter: prev.harnessMeter || preset.meter,
      harnessRhymeScheme: prev.harnessRhymeScheme || preset.rhymeScheme,
      harnessSyllables: prev.harnessSyllables || preset.syllables,
      harnessStructure: prev.harnessStructure || preset.structure
    }));
  }, [inputs.style, inputs.primaryLanguage]);

  const handleSelectPreset = (preset: CompositionStylePreset) => {
    setActivePresetId(preset.id);
    setInputs(prev => ({
      ...prev,
      harnessName: preset.name,
      harnessMeter: preset.meter,
      harnessRhymeScheme: preset.rhymeScheme,
      harnessSyllables: preset.syllables,
      harnessStructure: preset.structure
    }));
  };

  // User-Information-Driven AI Idea Generator State
  const [ideaLanguage, setIdeaLanguage] = useState<'es' | 'en'>(inputs.primaryLanguage === 'en' ? 'en' : 'es');
  const [ideaSubject, setIdeaSubject] = useState('');
  const [ideaBackground, setIdeaBackground] = useState('');
  const [ideaCoreValue, setIdeaCoreValue] = useState('Superación Personal y Salir de Abajo');
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);
  const [ideaMessage, setIdeaMessage] = useState<string | null>(null);

  // Smart Preset Google Search Grounding State
  const [smartPresets, setSmartPresets] = useState<any[]>([]);
  const [isLoadingSmartPresets, setIsLoadingSmartPresets] = useState(false);
  const [smartPresetSearchQuery, setSmartPresetSearchQuery] = useState('');
  const [showSmartPresets, setShowSmartPresets] = useState(false);
  const [smartPresetSources, setSmartPresetSources] = useState<{ title: string; uri: string }[]>([]);
  const [selectedSmartPresetId, setSelectedSmartPresetId] = useState<string | null>(null);

  const fetchTrendingSmartPresets = async (customQuery?: string) => {
    setIsLoadingSmartPresets(true);
    setShowSmartPresets(true);
    try {
      const q = customQuery !== undefined ? customQuery : smartPresetSearchQuery;
      const res = await fetch(`/api/smart-presets/trending?category=${inputs.genreCategory || 'all'}&lang=${inputs.primaryLanguage || 'es'}&q=${encodeURIComponent(q || '')}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.presets)) {
          setSmartPresets(data.presets);
          if (Array.isArray(data.groundingWebSources)) {
            setSmartPresetSources(data.groundingWebSources);
          }
        }
      }
    } catch (err) {
      console.warn("Failed to fetch trending smart presets:", err);
    } finally {
      setIsLoadingSmartPresets(false);
    }
  };

  const applySmartPreset = (preset: any) => {
    setSelectedSmartPresetId(preset.id);
    setInputs(prev => ({
      ...prev,
      style: preset.style as CorridoStyle,
      bandInspiration: preset.bandInspiration,
      instrument: preset.instrument as FeaturedInstrument,
      tempoBpm: preset.defaultBpm || prev.tempoBpm || 130,
      genreCategory: preset.category || prev.genreCategory,
      musicalGenreTag: preset.label,
      marketingTag: `MARKET: ${preset.label.toUpperCase()}`
    }));
  };

  // Active audio player state
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingAudition, setIsPlayingAudition] = useState(false);
  const [isLoadingAudition, setIsLoadingAudition] = useState(false);
  const auditionAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (auditionAudioRef.current) {
        auditionAudioRef.current.pause();
        auditionAudioRef.current = null;
      }
    };
  }, []);

  const handleAuditionVoice = async (voiceId?: string) => {
    const targetVoice = voiceId || inputs.selectedVoice || 'Fenrir';
    if (isPlayingAudition) {
      if (auditionAudioRef.current) {
        auditionAudioRef.current.pause();
      }
      setIsPlayingAudition(false);
      return;
    }

    setIsLoadingAudition(true);
    try {
      const res = await fetch('/api/tts/preview-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voice: targetVoice })
      });

      if (res.ok) {
        const data = await res.json();
        const urlToPlay = data.audioUrl || data.dataUrl;
        if (urlToPlay) {
          if (auditionAudioRef.current) {
            auditionAudioRef.current.pause();
          }
          const audio = new Audio(urlToPlay);
          auditionAudioRef.current = audio;
          audio.onended = () => setIsPlayingAudition(false);
          await audio.play();
          setIsPlayingAudition(true);
        }
      }
    } catch (err) {
      console.warn("Audition preview error:", err);
    } finally {
      setIsLoadingAudition(false);
    }
  };

  const handleTogglePlaySong = (song: PreviewSong) => {
    if (playingSongId === song.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingSongId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(song.audioUrl);
      audioRef.current = audio;
      audio.play().catch(err => console.warn('Audio playback error:', err));
      setPlayingSongId(song.id);
      audio.onended = () => setPlayingSongId(null);
    }
  };

  const handleApplySongTemplate = (song: PreviewSong) => {
    setInputs(prev => ({
      ...prev,
      ...song.templateData,
      tempoBpm: song.templateData.tempoBpm || prev.tempoBpm || 120
    }));
  };

  // User-Information-Driven AI Idea Generator (supports English & Spanish)
  const handleGenerateUserIdea = async () => {
    setIsGeneratingIdea(true);
    setIdeaMessage(null);

    const isEnglishIdea = ideaLanguage === 'en';
    const defaultSub = isEnglishIdea ? 'Colt "Outlaw"' : 'El Compa';
    const defaultBg = isEnglishIdea ? 'Working the timber trails and building a name with honest labor' : 'Luchador incansable que empezó desde abajo y construyó su propio respeto';
    const subjectToUse = ideaSubject.trim() || inputs.name.trim() || defaultSub;
    const bgToUse = ideaBackground.trim() || defaultBg;

    try {
      const res = await fetch('/api/generate-user-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName: subjectToUse,
          background: bgToUse,
          coreValue: ideaCoreValue,
          stylePreference: inputs.style,
          primaryLanguage: ideaLanguage
        })
      });

      if (res.ok) {
        const data = await res.json();
        setInputs(prev => ({
          ...prev,
          name: data.name || prev.name,
          partner: data.partner || prev.partner,
          story: data.story || prev.story,
          slangHook: data.slangHook || prev.slangHook,
          style: data.style || prev.style,
          bandInspiration: data.bandInspiration || prev.bandInspiration,
          storyTheme: data.storyTheme || prev.storyTheme,
          locationSetting: data.locationSetting || prev.locationSetting,
          tempoBpm: data.tempoBpm || prev.tempoBpm || (isEnglishIdea ? 108 : 144),
          primaryLanguage: isEnglishIdea ? 'en' : prev.primaryLanguage
        }));
        setIdeaMessage(isEnglishIdea ? `✓ English song concept crafted for ${data.name || subjectToUse}!` : `✓ ¡Corrido personalizado creado para ${data.name || subjectToUse}!`);
      } else {
        throw new Error('Server returned non-ok status');
      }
    } catch (err) {
      console.warn("Using intelligent fallback for idea generation:", err);
      if (isEnglishIdea) {
        setInputs(prev => ({
          ...prev,
          name: ideaSubject.trim() ? `${ideaSubject.trim()} "Outlaw"` : 'Colt "The Troubadour" Hardin',
          partner: '1954 Martin D-28 acoustic & 1978 Highboy truck',
          story: `${subjectToUse}: Born and raised on honest labor beneath the whispering pines. Kept his word, worked through every hard season, and built a legacy with three chords and the gospel truth.`,
          slangHook: 'Out in the whispering pines, we stand our ground!',
          style: 'American Country & Americana (Nashville / Heartland Folk / Whispering Pines)',
          bandInspiration: 'American Country & Americana (Nashville / Heartland Folk / Whispering Pines)',
          storyTheme: 'Heartland Storytelling & Pine Timber Trails',
          locationSetting: 'Nashville, TN / Austin, TX / Dallas',
          tempoBpm: 108,
          primaryLanguage: 'en'
        }));
        setIdeaMessage(`✓ English country song idea created for ${subjectToUse}!`);
      } else {
        setInputs(prev => ({
          ...prev,
          name: ideaSubject.trim() ? `${ideaSubject.trim()} "El Firme"` : 'Carlos "El Comanche" Valenzuela',
          partner: 'Su clica leal y su gente de confianza',
          story: `${subjectToUse}: hombre de temple forjado en ${bgToUse}. Se abrió paso con esfuerzo y principios firmes, ganándose el respeto sin pedirle nada a nadie.`,
          slangHook: '¡Que retumbe la banda en vivo y puro pa delante, viejo!',
          primaryLanguage: 'es'
        }));
        setIdeaMessage(`✓ ¡Idea en español generada para ${subjectToUse}!`);
      }
    } finally {
      setIsGeneratingIdea(false);
    }
  };

  // Quick Random Idea Generator (Supports English and Spanish)
  const handleGenerateRandomIdea = () => {
    if (ideaLanguage === 'en') {
      const englishPresets = [
        {
          name: 'Colt "Outlaw" Hardin',
          partner: '1954 Martin D-28 and 1978 Highboy 4x4',
          story: 'Raised between the dense pine forests of East Texas and Music Row in Nashville. Built on honest grit, three chords, and the truth, standing tall through every storm without asking for a handout.',
          slangHook: 'Out in the whispering pines, we hold our ground!',
          style: 'American Country & Americana (Nashville / Heartland Folk / Whispering Pines)' as CorridoStyle,
          tempoBpm: 108
        },
        {
          name: 'Marcus "Ace" Davis',
          partner: 'The day-one crew & customized black slab Cadillac',
          story: 'Came up out of the Houston 713 trenches with pure lyrical discipline. Slow rolling heavy 808s, street philosophy, and staying true to the soil through late night highway grinding.',
          slangHook: 'Straight facts, zero cap, we run these streets!',
          style: 'Houston Texas Rap (UGK & Z-Ro Style / Slow Rolling 808s)' as CorridoStyle,
          tempoBpm: 74
        },
        {
          name: 'Damon "Voltage" Cross',
          partner: '1959 Gibson Les Paul Custom and Marshall tube stack',
          story: 'Turning tube amplifiers up to 11 and letting raw chest vocals shake the arena foundation. Built on overdriven power chords, heavy acoustic drum grooves, and visceral rock energy.',
          slangHook: 'Turn it up and let the fire burn!',
          style: 'Modern Rock & Alternative (Overdriven Riffs, Heavy Crash Drums & Driving Bass)' as CorridoStyle,
          tempoBpm: 132
        },
        {
          name: 'Vortex 2026',
          partner: 'The production lab and sliding 808 subwoofers',
          story: 'No filler bars, no pop gimmicks. Menacing sliding 808 bass, razor-sharp triplet hi-hats, and ruthless ambition taking over the entire 2026 music industry.',
          slangHook: '2026 we take over the whole game!',
          style: 'Hard-Hitting Street Rap & Menacing 808 Trap (Metro & 21 Savage / Dark Cinematic Beats / No Pop)' as CorridoStyle,
          tempoBpm: 138
        }
      ];
      const pick = englishPresets[Math.floor(Math.random() * englishPresets.length)];
      setInputs(prev => ({
        ...prev,
        name: pick.name,
        partner: pick.partner,
        story: pick.story,
        slangHook: pick.slangHook,
        style: pick.style,
        tempoBpm: pick.tempoBpm,
        primaryLanguage: 'en'
      }));
      setIdeaMessage(`✓ Loaded English preset: ${pick.name}`);
    } else {
      const spanishPresets = [
        {
          name: 'Carlos "El Comanche" Valenzuela',
          partner: 'Su compadre de mil batallas y su clica leal',
          story: 'Salió desde abajo en las calles de la frontera sin pedirle nada a nadie. Con inteligencia, respeto y palabra de rey levantó su patrimonio y hoy cuida de los suyos con orgullo.',
          slangHook: '¡Que retumbe la banda en vivo y puro pa delante, viejo!',
          style: 'Modern Banda/Bélico (Requintos 12 Cuerdas, Metales en Vivo y Tamborazo)' as CorridoStyle,
          tempoBpm: 144
        },
        {
          name: 'Arturo "El 686" Mendoza',
          partner: 'Su fiel docerola Takamine y su gente de Mexicali',
          story: 'Creció bajo el sol inclemente de Mexicali trabajando desde morro. Con temple de acero convirtió los tropiezos en victorias que hoy se cantan con requintos veloces de 12 cuerdas.',
          slangHook: '¡Arriba el 686 y la clica firme!',
          style: 'Bélico Tumbado 2026' as CorridoStyle,
          tempoBpm: 128
        },
        {
          name: 'Don Fernando Cárdenas',
          partner: 'Su caballo frisón y su conjunto sierreño',
          story: 'Hombre bragado de palabra y honor. Más de 30 años defendiendo el nombre de la familia con trabajo honesto, lealtad y coplas poéticas que hacen vibrar el rancho.',
          slangHook: '¡No vengo a ver si puedo sino porque puedo vengo!',
          style: 'Sierreño Campirano' as CorridoStyle,
          tempoBpm: 118
        }
      ];
      const pick = spanishPresets[Math.floor(Math.random() * spanishPresets.length)];
      setInputs(prev => ({
        ...prev,
        name: pick.name,
        partner: pick.partner,
        story: pick.story,
        slangHook: pick.slangHook,
        style: pick.style,
        tempoBpm: pick.tempoBpm,
        primaryLanguage: 'es'
      }));
      setIdeaMessage(`✓ Cargado preset: ${pick.name}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputs.name.trim() || !inputs.story.trim()) return;

    const activePreset = COMPOSITION_STYLE_PRESETS.find(p => p.id === activePresetId || p.name === inputs.harnessName) || COMPOSITION_STYLE_PRESETS[0];

    const validatedInputs: ComposerInputs = {
      ...inputs,
      harnessName: inputs.harnessName || activePreset.name,
      harnessMeter: inputs.harnessMeter || activePreset.meter,
      harnessRhymeScheme: inputs.harnessRhymeScheme || activePreset.rhymeScheme,
      harnessSyllables: inputs.harnessSyllables || activePreset.syllables,
      harnessStructure: inputs.harnessStructure || activePreset.structure
    };

    onSubmit(validatedInputs);
  };

  const handleSubmitWithVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputs.name.trim() || !inputs.story.trim()) return;

    const activePreset = COMPOSITION_STYLE_PRESETS.find(p => p.id === activePresetId || p.name === inputs.harnessName) || COMPOSITION_STYLE_PRESETS[0];

    const validatedInputs: ComposerInputs = {
      ...inputs,
      autoLaunchVideo: true,
      harnessName: inputs.harnessName || activePreset.name,
      harnessMeter: inputs.harnessMeter || activePreset.meter,
      harnessRhymeScheme: inputs.harnessRhymeScheme || activePreset.rhymeScheme,
      harnessSyllables: inputs.harnessSyllables || activePreset.syllables,
      harnessStructure: inputs.harnessStructure || activePreset.structure
    };

    onSubmit(validatedInputs);
  };

  const isEnIdea = ideaLanguage === 'en';

  return (
    <div className="w-full max-w-4xl mx-auto bg-stone-900 border border-amber-800/40 p-5 md:p-7 rounded-xl shadow-2xl relative">
      <div className="relative z-10 space-y-6">
        {/* Active Digital Artist Co-Pilot Banner */}
        {activeAgent && (
          <div className="p-4 bg-gradient-to-r from-stone-950 via-amber-950/40 to-stone-950 border border-amber-500/70 rounded-xl shadow-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-stone-900 border border-amber-500/70 flex items-center justify-center text-2xl shadow-inner shrink-0">
                {activeAgent.avatar || '🤠'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-black text-amber-200 text-base uppercase tracking-wide">
                    {activeAgent.name}
                  </span>
                  {activeAgent.alias && (
                    <span className="text-[10px] bg-amber-950 text-amber-300 font-mono px-2 py-0.5 border border-amber-800 rounded">
                      "{activeAgent.alias}"
                    </span>
                  )}
                  <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded-full uppercase font-bold">
                    Co-Compositor Activo
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-400 font-mono mt-0.5">
                  <span className="text-stone-300">{activeAgent.archetype}</span>
                  <span>•</span>
                  <span className="text-amber-400">Bóveda: 5/5 .MD</span>
                  <span>•</span>
                  <span className="text-stone-500">{activeAgent.stats?.activeBpm || 144} BPM</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenAgentComputer && (
                <button
                  type="button"
                  onClick={() => onOpenAgentComputer(activeAgent)}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-serif font-black text-xs uppercase tracking-wider rounded-lg shadow flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
                  title="Abrir la computadora, terminal y archivos Markdown del artista"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>💻 Computadora & Bóveda</span>
                </button>
              )}

              {onOpenAgentsHub && (
                <button
                  type="button"
                  onClick={onOpenAgentsHub}
                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700 font-mono text-xs rounded-lg cursor-pointer transition-colors"
                >
                  👥 Cambiar Artista
                </button>
              )}
            </div>
          </div>
        )}

        {/* Clean Studio Production Header & AI Idea Generator */}
        <div className="rounded-xl overflow-hidden border border-amber-900/40 bg-stone-950 shadow-xl">
          {/* Header Banner */}
          <div className="p-5 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border-b border-amber-900/30 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold uppercase rounded">
                  Lyria 3 Pro Studio
                </span>
                <span className="text-[10px] text-stone-400 font-mono">
                  Master Composition & Arrangement
                </span>
              </div>
              <h2 className="font-serif text-2xl font-black text-amber-100 uppercase tracking-tight">
                {isEn ? 'Composition Studio Console' : 'Estudio de Composición'}
              </h2>
            </div>

            {/* Language Switcher for Idea Generator */}
            <div className="flex items-center gap-1.5 bg-stone-900 p-1 rounded-lg border border-stone-800">
              <span className="text-[10px] text-stone-400 font-mono px-1.5">Idea Language:</span>
              <button
                type="button"
                onClick={() => setIdeaLanguage('es')}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded transition-all cursor-pointer ${
                  ideaLanguage === 'es'
                    ? 'bg-amber-500 text-stone-950 shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                🇲🇽 Español
              </button>
              <button
                type="button"
                onClick={() => setIdeaLanguage('en')}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded transition-all cursor-pointer ${
                  ideaLanguage === 'en'
                    ? 'bg-indigo-500 text-white shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                🇺🇸 English
              </button>
            </div>
          </div>

          {/* Personalized AI Idea Assistant Box */}
          <div className="p-4 sm:p-5 bg-stone-950 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-serif text-xs font-black text-amber-300 uppercase tracking-wider">
                  {isEnIdea ? 'AI Song Concept & Character Generator (English)' : 'Generador de Ideas Personalizadas con IA (Español)'}
                </h3>
              </div>
              <span className="text-[10px] text-stone-400 font-mono">
                {isEnIdea ? 'Tailored in English' : 'Personalizado en Español'}
              </span>
            </div>

            <p className="text-xs text-stone-300">
              {isEnIdea
                ? 'Enter protagonist name and their trade, hometown, or life struggle. The AI will craft the name, backstory, crew, and signature hook in English:'
                : 'Ingresa a quién dedicas la canción y su oficio, ciudad o logro. La IA redactará el nombre, historia, clica y grito de guerra a tu medida:'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-amber-400/90 uppercase tracking-wider mb-1">
                  {isEnIdea ? 'Who is the song for? (Name / Nickname)' : '¿Para quién es el corrido? (Nombre o Apodo)'}
                </label>
                <input
                  type="text"
                  disabled={isGeneratingIdea || isLoading}
                  value={ideaSubject}
                  onChange={(e) => setIdeaSubject(e.target.value)}
                  placeholder={isEnIdea ? 'e.g. Colt Hardin, Marcus "Ace" Davis, My brother John...' : 'Ej. Para mí / Alfredo, Mi compa Chuy, Don Ramón...'}
                  className="w-full bg-stone-900 border border-stone-700 focus:border-amber-500 text-stone-100 text-xs px-3 py-2 rounded-lg focus:outline-none placeholder:text-stone-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-400/90 uppercase tracking-wider mb-1">
                  {isEnIdea ? 'Hometown, Trade & Background' : '¿De dónde es y qué ha logrado o a qué se dedica?'}
                </label>
                <input
                  type="text"
                  disabled={isGeneratingIdea || isLoading}
                  value={ideaBackground}
                  onChange={(e) => setIdeaBackground(e.target.value)}
                  placeholder={isEnIdea ? 'e.g. Born in East Texas pine trails, mechanic in Dallas, self-made trucker...' : 'Ej. Vive en Dallas, mecánico con su taller; o trailero en Michoacán...'}
                  className="w-full bg-stone-900 border border-stone-700 focus:border-amber-500 text-stone-100 text-xs px-3 py-2 rounded-lg focus:outline-none placeholder:text-stone-600"
                />
              </div>
            </div>

            {/* Quick Gift & Dedication Occasion Shortcuts */}
            <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-lg space-y-1.5">
              <label className="block text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <span>🎁 Regalo o Dedicatoria Especial (1-Clic para Familia / Amigos):</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '🎂 Cumpleaños Especial', bg: 'Para mi amigo o familiar en su cumpleaños, con fiesta, alegría y bendiciones.', val: 'Cumpleaños y Celebración' },
                  { label: '❤️ Amor & Aniversario', bg: 'Carta cantada para mi pareja, celebrando nuestro amor y momentos inolvidables.', val: 'Amor Eterno y Aniversario' },
                  { label: '👨‍👩‍👧 Homenaje a Mamá o Papá', bg: 'Agradecimiento profundo por sus enseñanzas, sacrificio y amor incondicional.', val: 'Amor de Familia y Gratitud' },
                  { label: '🤝 Amigo Fiel & Lealtad', bg: 'Para mi compadre o mejor amigo por estar siempre en las buenas y en las malas.', val: 'Lealtad y Hermandad' },
                  { label: '🏆 Logro & Triunfo', bg: 'Celebrando el esfuerzo y éxito de alcanzar una gran meta.', val: 'Superación Personal' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isGeneratingIdea || isLoading}
                    onClick={() => {
                      setIdeaBackground(item.bg);
                      setIdeaCoreValue(item.val);
                    }}
                    className="text-[10px] bg-stone-900 hover:bg-stone-800 border border-amber-600/40 text-amber-200 px-2.5 py-1 rounded transition-all cursor-pointer font-bold flex items-center gap-1"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Vibe / Value Picker */}
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                {isEnIdea ? 'Core Vibe & Story Theme:' : 'Tono o Valor Principal a Destacar:'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(isEnIdea ? [
                  'Self-Made Hustle & Rising From the Bottom',
                  'Brotherhood & Loyalty to the Circle',
                  'Heartland Storytelling & Pine Timber Trails',
                  'High-Energy Rock Drive & Unstoppable Grit'
                ] : [
                  'Superación Personal y Salir de Abajo',
                  'Lealtad a la Familia y Clica Fiel',
                  'Tradición, Caballos y Vida de Rancho',
                  'Estrategia Fría, Respeto y Mente Maestra'
                ]).map((val) => (
                  <button
                    key={val}
                    type="button"
                    disabled={isGeneratingIdea || isLoading}
                    onClick={() => setIdeaCoreValue(val)}
                    className={`text-[10px] px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                      ideaCoreValue === val
                        ? (isEnIdea ? 'bg-indigo-600 text-white border-indigo-400 font-bold shadow' : 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow')
                        : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-amber-700'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isGeneratingIdea || isLoading}
                  onClick={handleGenerateUserIdea}
                  className={`py-2 px-4 text-xs font-serif font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95 ${
                    isEnIdea
                      ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950'
                  }`}
                >
                  {isGeneratingIdea ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>{isEnIdea ? 'Composing English Concept...' : 'Componiendo Historia con IA...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                      <span>{isEnIdea ? '✨ Generate English Song Idea with AI' : '✨ Generar Mi Historia y Personaje con IA'}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleGenerateRandomIdea}
                  disabled={isGeneratingIdea || isLoading}
                  className="text-[11px] text-stone-400 hover:text-amber-300 px-2 py-1 transition-colors cursor-pointer flex items-center gap-1 underline font-mono"
                  title={isEnIdea ? "Load instant random English preset" : "Generar idea aleatoria rápida"}
                >
                  <Dices className="w-3 h-3" /> {isEnIdea ? 'Random English Idea' : 'Idea aleatoria'}
                </button>
              </div>

              {ideaMessage && (
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> {ideaMessage}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SONGWRITING ASSISTANCE FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Panel 1: Protagonist, Companion & Hook */}
          <div className="p-5 bg-stone-950 border border-stone-800 rounded-xl space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-800">
              <User className="w-4 h-4 text-amber-500" />
              <span className="font-serif text-xs font-black uppercase tracking-wider text-amber-200">
                1. Protagonista, Compañero y Gancho
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-amber-400/90 text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-500" /> {isEn ? 'Protagonist / Hero Name' : '¿Quién es el Héroe o Protagonista? (Nombre)'}
                </label>
                <input
                  type="text"
                  required
                  disabled={isLoading}
                  value={inputs.name}
                  onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
                  placeholder={isEn ? "e.g. Colt Hardin, Marcus Davis, Don Alejandro..." : "Ej. El Compa Gerardo, Don Alejandro, Valentín..."}
                  className="w-full bg-stone-900 border border-stone-700 focus:border-amber-500 text-stone-100 px-3.5 py-2.5 text-sm rounded-lg focus:outline-none transition-colors placeholder:text-stone-600"
                />
              </div>

              <div>
                <label className="block text-amber-400/90 text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-500" /> {isEn ? 'Companion, Crew or Trusted Instrument' : 'Acompañante, Clica o Amigo Fiel (Opcional)'}
                </label>
                <input
                  type="text"
                  disabled={isLoading}
                  value={inputs.partner}
                  onChange={(e) => setInputs({ ...inputs, partner: e.target.value })}
                  placeholder={isEn ? "e.g. The day-one crew, 1954 Martin acoustic..." : "Ej. Su gente leal, Su compadre Juan, Su docerola consentida..."}
                  className="w-full bg-stone-900 border border-stone-700 focus:border-amber-500 text-stone-100 px-3.5 py-2.5 text-sm rounded-lg focus:outline-none transition-colors placeholder:text-stone-600"
                />
              </div>
            </div>

            {/* Narrative Story / Lyrics Theme */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <label className="block text-amber-400/90 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-500" /> {isEn ? 'Story Narrative / Lyrics Context' : 'Historia o Anécdota Principal'}
                </label>
                <span className="text-[10px] text-stone-400 font-mono">{isEn ? '1-Click quick story' : 'Ideas rápidas con 1 clic'}</span>
              </div>

              {/* 1-Click Quick Story Fillers */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(isEnIdea || inputs.primaryLanguage === 'en' || isEn ? QUICK_STORY_PROMPTS_EN : QUICK_STORY_PROMPTS).map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isLoading}
                    onClick={() => setInputs({ ...inputs, story: p.text })}
                    className="text-[11px] bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-amber-300 px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>

              <textarea
                required
                rows={3}
                disabled={isLoading}
                value={inputs.story}
                onChange={(e) => setInputs({ ...inputs, story: e.target.value })}
                placeholder={isEn ? "Briefly summarize the protagonist's journey, triumphs, loyalty, or obstacles overcome..." : "Escribe brevemente la historia del protagonista: cómo empezó, qué obstáculo superó, su lealtad con su gente o sus logros..."}
                className="w-full bg-stone-900 border border-stone-700 focus:border-amber-500 text-stone-100 p-3 text-sm rounded-lg focus:outline-none transition-colors placeholder:text-stone-600 resize-none leading-relaxed"
              />
            </div>

            {/* Signature Slang Hook */}
            <div>
              <label className="block text-amber-400/90 text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-500" /> {isEn ? 'Signature Hook / Hype Phrase' : 'Frase Gancho / Grito de Guerra (Para el Coro o Intro)'}
              </label>
              <input
                type="text"
                disabled={isLoading}
                value={inputs.slangHook || ''}
                onChange={(e) => setInputs({ ...inputs, slangHook: e.target.value })}
                placeholder={isEn ? "e.g. Out in the whispering pines, we stand our ground!..." : "Ej. ¡Que truene la banda en vivo y retumbe el requinto, viejo!..."}
                className="w-full bg-stone-900 border border-stone-700 focus:border-amber-500 text-stone-100 px-3.5 py-2.5 text-sm rounded-lg focus:outline-none transition-colors placeholder:text-stone-600"
              />
            </div>
          </div>

          {/* Panel 2: Sonic Architecture, Language & Male Vocalist */}
          <div className="p-5 bg-stone-950 border border-stone-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-amber-500" />
                <span className="font-serif text-xs font-black uppercase tracking-wider text-amber-200">
                  2. Arquitectura Sonora, Idioma y Vocalista
                </span>
              </div>
              <span className="text-[10px] text-amber-400 font-mono font-bold">Lyria 3 Pro</span>
            </div>

            {/* Primary Language Toggle Bar */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setInputs(prev => ({ ...prev, primaryLanguage: 'es' }))}
                className={`py-2 px-3 text-xs font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                  (inputs.primaryLanguage === 'es' || !inputs.primaryLanguage)
                    ? 'bg-amber-500 text-stone-950 border-amber-400 shadow font-black'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>🇲🇽 Español</span>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => setInputs(prev => ({ ...prev, primaryLanguage: 'en' }))}
                className={`py-2 px-3 text-xs font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                  inputs.primaryLanguage === 'en'
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow font-black'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>🇺🇸 English</span>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => setInputs(prev => ({ ...prev, primaryLanguage: 'spanglish' }))}
                className={`py-2 px-3 text-xs font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                  inputs.primaryLanguage === 'spanglish'
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow font-black'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>🌐 Spanglish</span>
              </button>
            </div>

            {/* Smart Preset Selector (Google Search Grounding) */}
            <div className="bg-stone-900/90 border border-amber-500/40 rounded-xl p-4 space-y-3 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300 text-xs">
                    ✨
                  </div>
                  <div>
                    <h4 className="font-serif text-xs font-black uppercase tracking-wider text-amber-200 flex items-center gap-1.5">
                      <span>Smart Preset Selector</span>
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-mono font-bold">
                        Google Search Live
                      </span>
                    </h4>
                    <p className="text-[11px] text-stone-400">
                      {isEn 
                        ? 'Fetch real-time trending sub-genres & production metadata via Google Search to auto-populate style parameters'
                        : 'Busca subgéneros virales y metadata de producción en tiempo real con Google Search para cargar presets inteligentes'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fetchTrendingSmartPresets()}
                    disabled={isLoadingSmartPresets || isLoading}
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-bold font-serif uppercase tracking-wider rounded-lg flex items-center gap-1.5 shadow transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoadingSmartPresets ? (
                      <>
                        <span className="w-3 h-3 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                        <span>Buscando en Google...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 fill-current" />
                        <span>🔥 Buscar Tendencias 2026</span>
                      </>
                    )}
                  </button>

                  {smartPresets.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowSmartPresets(!showSmartPresets)}
                      className="px-2.5 py-1.5 bg-stone-950 border border-stone-700 text-stone-300 text-xs rounded-lg hover:border-amber-500 cursor-pointer font-mono"
                    >
                      {showSmartPresets ? 'Ocultar' : `Ver (${smartPresets.length})`}
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Search Tag Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-stone-400 font-mono">Buscar por tendencia:</span>
                {[
                  'Bélico Tumbado 2026',
                  'Rap Corrido 808',
                  'Electro Corrido EDM',
                  'Sad Sierreño Melódico',
                  'Dembow Perreo 2026',
                  'Menacing Street Trap'
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    disabled={isLoadingSmartPresets || isLoading}
                    onClick={() => {
                      setSmartPresetSearchQuery(tag);
                      fetchTrendingSmartPresets(tag);
                    }}
                    className="text-[10px] bg-stone-950 hover:bg-amber-950/60 text-stone-300 hover:text-amber-200 border border-stone-800 hover:border-amber-600/60 px-2 py-0.5 rounded transition-colors cursor-pointer font-mono"
                  >
                    #{tag}
                  </button>
                ))}
              </div>

              {/* Dynamic Search Results Grid */}
              {showSmartPresets && smartPresets.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-stone-800">
                  <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono">
                    <span>Resultados de Google Search ({smartPresets.length} subgéneros encontrados):</span>
                    {smartPresetSources.length > 0 && (
                      <span className="text-amber-400 text-[10px]">
                        🌐 Grounded en {smartPresetSources.length} fuentes web
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[280px] overflow-y-auto pr-1">
                    {smartPresets.map((preset) => {
                      const isSelected = selectedSmartPresetId === preset.id || inputs.style === preset.style;
                      return (
                        <div
                          key={preset.id}
                          onClick={() => applySmartPreset(preset)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-amber-950/80 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                              : 'bg-stone-950/90 border-stone-800 hover:border-amber-500/60 hover:bg-stone-900'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1.5 mb-1">
                              <span className="font-serif font-black text-xs text-amber-200">
                                {preset.label}
                              </span>
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded">
                                {preset.defaultBpm} BPM
                              </span>
                            </div>

                            <p className="text-[11px] text-stone-300 leading-snug mb-1.5">
                              {preset.sublabel}
                            </p>

                            {preset.trendingReason && (
                              <div className="text-[10px] text-amber-400/90 font-mono bg-amber-950/40 border border-amber-800/40 px-2 py-1 rounded mb-1.5">
                                📈 <span className="font-semibold">{preset.trendingReason}</span>
                              </div>
                            )}

                            <div className="text-[10px] text-stone-400 font-mono flex flex-wrap items-center gap-1.5">
                              <span className="text-stone-300 font-bold">🎸 {preset.instrument}</span>
                              <span>•</span>
                              <span className="text-stone-400">Inspo: {preset.bandInspiration}</span>
                            </div>
                          </div>

                          <div className="mt-2 pt-2 border-t border-stone-800/60 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {(preset.trendingKeywords || []).slice(0, 3).map((kw: string) => (
                                <span key={kw} className="text-[9px] bg-stone-900 text-stone-400 px-1 py-0.2 rounded border border-stone-800 font-mono">
                                  {kw}
                                </span>
                              ))}
                            </div>
                            <span className={`text-[10px] font-bold font-serif uppercase tracking-wider px-2 py-0.5 rounded ${
                              isSelected
                                ? 'bg-amber-500 text-stone-950 font-black'
                                : 'bg-stone-800 text-stone-300'
                            }`}>
                              {isSelected ? '✓ Aplicado' : 'Cargar Preset'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Musical Style Dropdown + Male Singer Voice */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-stone-900/90 border border-stone-800 p-3.5 rounded-lg">
                <MusicalStyleDropdown
                  valueStyle={inputs.style}
                  valueBand={inputs.bandInspiration}
                  valueGenreCategory={inputs.genreCategory}
                  valueMusicalTag={inputs.musicalGenreTag}
                  valueLanguage={inputs.primaryLanguage}
                  disabled={isLoading}
                  onSelectStyle={(selection) => {
                    setInputs(prev => ({
                      ...prev,
                      style: selection.style,
                      bandInspiration: selection.bandInspiration,
                      instrument: selection.instrument,
                      tempoBpm: selection.tempoBpm,
                      genreCategory: selection.genreCategory,
                      musicalGenreTag: selection.musicalGenreTag,
                      marketingTag: selection.marketingTag,
                      primaryLanguage: selection.primaryLanguage
                    }));
                  }}
                  onOpenMarketingHub={onOpenMarketingHub}
                />
              </div>

              {/* Male Singer Voice Dropdown */}
              <div className="bg-stone-900/90 border border-stone-800 p-3.5 rounded-lg">
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="male-voice-select" className="block text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-amber-400" /> Vocalista Masculino
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAuditionVoice()}
                    disabled={isLoading || isLoadingAudition}
                    className="text-[10px] bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 px-2 py-0.5 font-bold uppercase rounded transition-colors cursor-pointer"
                  >
                    {isLoadingAudition ? 'Cargando...' : isPlayingAudition ? 'Detener' : '🔊 Audicionar Voz'}
                  </button>
                </div>
                <select
                  id="male-voice-select"
                  disabled={isLoading}
                  value={inputs.selectedVoice || 'Fenrir'}
                  onChange={(e) => {
                    const newV = e.target.value as any;
                    setInputs({ ...inputs, selectedVoice: newV });
                    if (isPlayingAudition) {
                      handleAuditionVoice(newV);
                    }
                  }}
                  className="w-full bg-stone-950 border border-stone-700 focus:border-amber-500 text-amber-200 text-sm px-3 py-2 rounded-lg focus:outline-none cursor-pointer font-bold"
                >
                  {MALE_VOICE_OPTIONS.map((vc) => (
                    <option key={vc.id} value={vc.id}>
                      {vc.name} — {vc.desc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tempo Slider (110 - 160 BPM) */}
            <div className="bg-stone-900/90 border border-stone-800 p-3.5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-serif">
                  Tempo Musical ({inputs.tempoBpm || 128} BPM)
                </span>
                <span className="text-[10px] text-stone-400 font-mono">Dynamic Range: 110-160 BPM</span>
              </div>
              <input
                type="range"
                min={110}
                max={160}
                step={1}
                disabled={isLoading}
                value={inputs.tempoBpm || 128}
                onChange={(e) => setInputs({ ...inputs, tempoBpm: parseInt(e.target.value, 10) })}
                className="w-full accent-amber-500 bg-stone-950 h-2 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Panel 3: Metric Presets & Master Submission */}
          <div className="p-5 bg-stone-950 border border-stone-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-serif text-xs font-black uppercase tracking-wider text-amber-200">
                  3. Métrica & Envío a Masterización
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                Métrica: {inputs.harnessName || 'Octosílabo Clásico'}
              </span>
            </div>

            {/* Metric Preset Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
              {COMPOSITION_STYLE_PRESETS.map((preset) => {
                const isActive = (inputs.harnessName === preset.name) || (activePresetId === preset.id);
                return (
                  <button
                    key={preset.id}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2 text-left rounded-lg border transition-all cursor-pointer flex flex-col justify-between min-h-[58px] ${
                      isActive
                        ? 'bg-amber-500/20 border-amber-400 text-amber-100 shadow font-bold'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span className="text-[9px] font-mono font-bold text-amber-400 uppercase truncate">
                      {preset.badge}
                    </span>
                    <span className="text-[10px] font-serif font-bold leading-tight line-clamp-2 mt-0.5">
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Submit Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading || !inputs.name.trim() || !inputs.story.trim()}
                className="w-full bg-stone-900 hover:bg-stone-800 border border-amber-500/60 active:scale-[0.99] disabled:bg-stone-800 disabled:text-stone-600 text-amber-300 font-serif font-black text-sm py-4 rounded-xl transition-all tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-xl"
              >
                <Music className="w-5 h-5 text-amber-400" />
                {isLoading ? (isEn ? 'Composing Lyrics & Master Audio...' : 'Componiendo Letras y Master...') : (isEn ? '✨ COMPOSE SONG MASTER' : '¡COMPONER SOLO CANCIÓN!')}
              </button>

              <button
                type="button"
                onClick={handleSubmitWithVideo}
                disabled={isLoading || !inputs.name.trim() || !inputs.story.trim()}
                className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-300 active:scale-[0.99] disabled:bg-stone-800 disabled:text-stone-600 text-stone-950 font-serif font-black text-sm py-4 rounded-xl transition-all tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-xl border border-amber-200"
              >
                <Clapperboard className="w-5 h-5 fill-current text-stone-950" />
                {isLoading ? (isEn ? 'Composing Song & Video...' : 'Componiendo Canción y Video...') : (isEn ? '🎬 MAKE SONG & MUSIC VIDEO' : '🎬 COMPONER CANCIÓN Y VIDEO')}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
