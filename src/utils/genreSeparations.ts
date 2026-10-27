import { GenreCategory, GenreSeparationInfo, CorridoData } from '../types';

export const GENRE_SEPARATIONS: GenreSeparationInfo[] = [
  {
    id: 'regional_belico',
    name: 'Regional Mexicano & Bélico (Tumbados & Sierreño)',
    shortLabel: 'Regional Mexicano',
    flagEmoji: '🇲🇽',
    colorTheme: 'from-amber-600 to-red-700',
    marketTag: 'MARKET: REGIONAL MEXICANO / CORRIDOS TUMBADOS & BÉLICO',
    dspPitchCategory: 'Spotify: Corridos 2026, Éxitos Regionales • Apple Music: La Brava',
    targetAudience: 'Audiencia masiva en México, Suroeste de EE.UU. (Texas, California, Arizona) y amantes de los requintos de 12 cuerdas, sousafón y docerolas.',
    recommendedCampaign: 'Videos estilo palenque o jaripeo con tomas en directo, clips de requinto en primer plano y audios para trends en botas y camionetas.',
    trendingHashtags: ['#CorridosBelicos', '#RegionalMexicano', '#MusicaMexicana', '#CorridosTumbados', '#PuroBelico'],
    keyBpmRange: '128 - 148 BPM',
    languageDefault: 'es'
  },
  {
    id: 'norteno',
    name: 'Norteño Tradicional & Moderno (Acordeón & Tarolas)',
    shortLabel: 'Norteño',
    flagEmoji: '🪗',
    colorTheme: 'from-amber-700 to-yellow-600',
    marketTag: 'MARKET: NORTEÑO CLÁSICO & MODERNO / ACORDEÓN & BAJO SEXTO',
    dspPitchCategory: 'Spotify: Norteño Puro, La Clica Norteña • Apple Music: Reyes del Norte',
    targetAudience: 'Amantes del acordeón diatónico rápido, bajo sexto, bajo quinto, huapangos con saxofón y redobles de tarola en Monterrey, Texas y norte de México.',
    recommendedCampaign: 'Clips de digitación rápida de acordeón, zapateados en pistas de baile, reuniones vaqueras y letras de picardía y respeto.',
    trendingHashtags: ['#NortenoPuro', '#AcordeonDiatonico', '#BajoSexto', '#Huapangos', '#MusicaNortena'],
    keyBpmRange: '120 - 144 BPM',
    languageDefault: 'es'
  },
  {
    id: 'banda',
    name: 'Banda Sinaloense & Tamborazo en Vivo',
    shortLabel: 'Banda Sinaloense',
    flagEmoji: '🎺',
    colorTheme: 'from-red-600 to-orange-600',
    marketTag: 'MARKET: BANDA SINALOENSE / PALENQUE & CONCIERTO EN VIVO',
    dspPitchCategory: 'Spotify: Pura Banda, Concierto en Vivo • Apple Music: Trombones y Tuba',
    targetAudience: 'Aficionados a las grandes agrupaciones sinaloenses de 16 elementos, tambora con platillazos, clarinetes, armonías de charcheta y trombones de vara.',
    recommendedCampaign: 'Videos de escenario con luces de concierto, metales en primer plano, ambiente festivo masivo y gritos de animación.',
    trendingHashtags: ['#BandaSinaloense', '#PuroTamborazo', '#TrombonesBravos', '#PalenqueEnVivo', '#SinaloaMusic'],
    keyBpmRange: '135 - 150 BPM',
    languageDefault: 'es'
  },
  {
    id: 'mariachi',
    name: 'Mariachi & Ranchera Tradicional / Concierto',
    shortLabel: 'Mariachi & Ranchera',
    flagEmoji: '🎻',
    colorTheme: 'from-yellow-700 to-amber-800',
    marketTag: 'MARKET: MARIACHI TRADICIONAL & RANCHERA CONCERT',
    dspPitchCategory: 'Spotify: Mariachi 2026, Éxitos de Oro • Apple Music: Puro Mariachi',
    targetAudience: 'Audiencia de música tradicional mexicana, serenatas, amantes del traje de charro, trompetas brillantes, violines virtuosos, vihuela y guitarrón.',
    recommendedCampaign: 'Tomas con trajes de charro de gala, haciendas mexicanas, serenatas al atardecer y ejecuciones de falsete lírico.',
    trendingHashtags: ['#MariachiTradicional', '#Rancheras', '#Guitarrón', '#TrompetasDeGala', '#OrgulloMexicano'],
    keyBpmRange: '100 - 130 BPM',
    languageDefault: 'es'
  },
  {
    id: 'rap_corrido',
    name: 'Rap Corrido & Flow Callejero (Mexican Hip-Hop)',
    shortLabel: 'Rap Corrido',
    flagEmoji: '🔥',
    colorTheme: 'from-orange-600 to-amber-500',
    marketTag: 'MARKET: MEXICAN HIP-HOP / STREET CORRIDO TRAP',
    dspPitchCategory: 'Spotify: Rap Mexicano, Nación Urbana • Apple Music: Puro Hip-Hop MX',
    targetAudience: 'Juventud urbana, comunidad hip-hop hispana, amantes del rap de calle (Santa Fe Klan, Alemán, Gera MX) y docerolas pesadas.',
    recommendedCampaign: 'Estilo callejero con tomas nocturnas en barrios, graffitis, lowriders y versos rápidos acapella para TikTok & Instagram Reels.',
    trendingHashtags: ['#RapCorrido', '#SantaFeKlanStyle', '#FlowCallejero', '#RapMexicano', '#HipHopEnEspanol'],
    keyBpmRange: '125 - 135 BPM',
    languageDefault: 'es'
  },
  {
    id: 'latin_urban',
    name: 'Reggaeton & Latin Urban / Trap Latino',
    shortLabel: 'Reggaeton & Urban',
    flagEmoji: '🌴',
    colorTheme: 'from-fuchsia-600 to-pink-500',
    marketTag: 'MARKET: GLOBAL LATIN URBAN / DEMBOW & PERREO',
    dspPitchCategory: 'Spotify: Viva Latino, Mansión Reggaetón • Apple Music: Fuego Latino',
    targetAudience: 'Audiencia global de música urbana, discotecas, festivales de reggaetón y listas de éxitos de streaming en Latinoamérica, España y EE.UU.',
    recommendedCampaign: 'Trends de baile en TikTok, contenido estético para Instagram Stories, discotecas y visuales con paletas neón y tomas cinemáticas.',
    trendingHashtags: ['#Reggaeton2026', '#LatinUrban', '#PerreoPuro', '#TrapLatino', '#VivaLatino'],
    keyBpmRange: '90 - 105 BPM',
    languageDefault: 'es'
  },
  {
    id: 'us_hiphop',
    name: 'US Hip-Hop & Hard 808 Trap (English Rap)',
    shortLabel: 'US Hip-Hop (English)',
    flagEmoji: '🇺🇸',
    colorTheme: 'from-purple-600 to-indigo-700',
    marketTag: 'MARKET: US MAINSTREAM RAP / ATLANTA & HOUSTON 808',
    dspPitchCategory: 'Spotify: RapCaviar, Most Necessary • Apple Music: The Plug, Hip-Hop Hits',
    targetAudience: 'English-speaking hip-hop fans, US trap streamers (Atlanta, Houston, Chicago, NYC), fans of Metro Boomin, 21 Savage, Drake, Future, and UGK.',
    recommendedCampaign: 'Dark cinematic 1080p visualizers, VHS/Cyberpunk aesthetic clips, beat-drop snippets for YouTube Shorts, and viral TikTok rap hooks.',
    trendingHashtags: ['#StreetTrap', '#Hard808', '#RapCaviar', '#MetroBoominVibes', '#USUndergroundRap'],
    keyBpmRange: '74 - 140 BPM',
    languageDefault: 'en'
  },
  {
    id: 'global_pop_rnb',
    name: 'Global Pop & Modern R&B (English / Contemporary)',
    shortLabel: 'Pop & R&B (English)',
    flagEmoji: '✨',
    colorTheme: 'from-violet-600 to-pink-600',
    marketTag: 'MARKET: GLOBAL ENGLISH POP / CONTEMPORARY R&B',
    dspPitchCategory: 'Spotify: Today\'s Top Hits, Are & Be • Apple Music: A-List Pop',
    targetAudience: 'Mainstream international pop and modern R&B listeners, radio playlist curators, smooth vocal enthusiasts, and commercial streaming audiences.',
    recommendedCampaign: 'Aesthetic lyric music videos, relatable relationship audio clips on TikTok, polished choreography snippets, and Spotify playlist pitching.',
    trendingHashtags: ['#ModernRnB', '#TopHits2026', '#PopMusic', '#VocalHarmony', '#SmoothGrooves'],
    keyBpmRange: '95 - 120 BPM',
    languageDefault: 'en'
  },
  {
    id: 'country_americana',
    name: 'Country & Americana (English / Southern Roots)',
    shortLabel: 'Country & Americana',
    flagEmoji: '🤠',
    colorTheme: 'from-amber-700 to-orange-800',
    marketTag: 'MARKET: US COUNTRY & AMERICANA / NASHVILLE ROOTS',
    dspPitchCategory: 'Spotify: Hot Country, Southern Comfort • Apple Music: Country Roads',
    targetAudience: 'Modern country fans, southern rock lovers, truck & outdoor lifestyle enthusiasts, and storytelling acoustic music listeners across the USA.',
    recommendedCampaign: 'Backroad outdoor footage, acoustic guitar porch sessions, truck lifestyle reels, and heartfelt storytelling clips.',
    trendingHashtags: ['#CountryMusic', '#Americana', '#NashvilleSound', '#SouthernRock', '#CountryLife'],
    keyBpmRange: '100 - 130 BPM',
    languageDefault: 'en'
  },
  {
    id: 'rock_alternative',
    name: 'Rock & Alternative / Indie (Electric Guitars & Drums)',
    shortLabel: 'Rock & Alternative',
    flagEmoji: '🎸',
    colorTheme: 'from-zinc-700 to-red-800',
    marketTag: 'MARKET: MODERN ROCK & INDIE ALTERNATIVE / GUITAR DRIVEN',
    dspPitchCategory: 'Spotify: Rock This, New Noise • Apple Music: Alternative Anthems',
    targetAudience: 'Rock and alternative indie listeners, fans of punchy live drums, overdriven electric guitars, garage rock anthems, and festival energy.',
    recommendedCampaign: 'Live garage jam sessions, gritty black & white performance clips, energetic head-banging shorts, and guitar riff breakdowns.',
    trendingHashtags: ['#ModernRock', '#IndieAlternative', '#GuitarRiff', '#LiveDrums', '#RockAnthem'],
    keyBpmRange: '120 - 150 BPM',
    languageDefault: 'en'
  },
  {
    id: 'afrobeats_caribbean',
    name: 'Afrobeats & Caribbean / Reggae Riddims',
    shortLabel: 'Afrobeats & Caribbean',
    flagEmoji: '🌍',
    colorTheme: 'from-emerald-600 to-yellow-600',
    marketTag: 'MARKET: GLOBAL AFROBEATS & CARIBBEAN DANCEHALL',
    dspPitchCategory: 'Spotify: African Heat, Dancehall Official • Apple Music: Afrobeats Hits',
    targetAudience: 'Global dance lovers, Afrobeats listeners (Burna Boy, Wizkid, Tems, Rema), island reggae and tropical dancehall streaming audiences worldwide.',
    recommendedCampaign: 'Viral dance challenges, sunny outdoor festival aesthetics, island lifestyle visuals, and rhythmic percussion showcase reels.',
    trendingHashtags: ['#Afrobeats2026', '#GlobalGroove', '#DancehallRiddim', '#AfricanHeat', '#IslandVibes'],
    keyBpmRange: '98 - 118 BPM',
    languageDefault: 'en'
  },
  {
    id: 'electro_fusion',
    name: 'Electro Corrido & EDM Club Fusion',
    shortLabel: 'Electro & EDM',
    flagEmoji: '⚡',
    colorTheme: 'from-cyan-500 to-blue-600',
    marketTag: 'MARKET: FESTIVAL EDM / ELECTRO-LATIN DANCE',
    dspPitchCategory: 'Spotify: Dance Party, Electro Latino • Apple Music: Festival Bangers',
    targetAudience: 'Asistentes a festivales (EDC, Tomorrowland), DJs de club nocturno, gamers y fans de la fusión electrónica con requintos mexicanos.',
    recommendedCampaign: 'Clips del drop electrónico sincronizado con luces estroboscópicas, videos de festival con pirotecnia y remixes para DJs de antros.',
    trendingHashtags: ['#ElectroCorrido', '#EDMLatino', '#FestivalBanger', '#ClubRemix', '#ElectronicCorrido'],
    keyBpmRange: '126 - 132 BPM',
    languageDefault: 'bilingual'
  },
  {
    id: 'acoustic_pop',
    name: 'Pop Regional & Balada Romántica Acústica',
    shortLabel: 'Pop Regional Acústico',
    flagEmoji: '💖',
    colorTheme: 'from-rose-600 to-amber-600',
    marketTag: 'MARKET: LATIN ACOUSTIC POP / ROMANTIC REGIONAL',
    dspPitchCategory: 'Spotify: Amor y Romance, Baladas de Oro • Apple Music: Acústico Latino',
    targetAudience: 'Oyentes de música romántica, serenatas, baladas acústicas con guitarras de nylon, radio generalista y fans de Carín León y Christian Nodal.',
    recommendedCampaign: 'Sesiones acústicas en vivo íntimas con guitarra y velas, letras emocionales para dedicatorias en parejas y videos líricos.',
    trendingHashtags: ['#PopRegional', '#BaladaRomantica', '#AcusticoLatino', '#CarinLeonStyle', '#MusicaParaElCorazon'],
    keyBpmRange: '110 - 125 BPM',
    languageDefault: 'es'
  }
];

export function getGenreCategory(styleOrInspiration?: string): GenreCategory {
  const str = (styleOrInspiration || '').toLowerCase();
  
  // Specific Mexican Regional subgenres
  if (str.includes('mariachi') || str.includes('ranchera') || str.includes('vihuela') || str.includes('guitarrón') || str.includes('guitarron') || str.includes('charro')) {
    return 'mariachi';
  }

  if (str.includes('norteño') || str.includes('norteno') || str.includes('acordeón') || str.includes('acordeon') || str.includes('bajo sexto') || str.includes('huapango') || str.includes('arriesgado') || str.includes('panther')) {
    return 'norteno';
  }

  if (str.includes('banda') || str.includes('palenque') || str.includes('tambora') || str.includes('tamborazo') || str.includes('sinaloense') || str.includes('gerardo ortiz')) {
    return 'banda';
  }

  // English & Global genres
  if (str.includes('country') || str.includes('americana') || str.includes('nashville') || str.includes('southern rock') || str.includes('bluegrass')) {
    return 'country_americana';
  }

  if (str.includes('rock') || str.includes('indie') || str.includes('alternative') || str.includes('garage rock') || str.includes('electric guitar')) {
    return 'rock_alternative';
  }

  if (str.includes('afro') || str.includes('afrobeats') || str.includes('caribbean') || str.includes('dancehall') || str.includes('reggae') || str.includes('burna') || str.includes('wizkid')) {
    return 'afrobeats_caribbean';
  }

  if (str.includes('r&b') || str.includes('rnb') || str.includes('pop & r&b') || str.includes('smooth vocal') || str.includes('synth-pop') || (str.includes('pop') && str.includes('english'))) {
    return 'global_pop_rnb';
  }

  // Urban & electronic
  if (str.includes('reggaeton') || str.includes('perreo') || str.includes('dembow') || str.includes('trap latino') || str.includes('bad bunny') || str.includes('feid') || str.includes('anuel') || str.includes('eladio')) {
    return 'latin_urban';
  }
  
  if (str.includes('electro corrido') || str.includes('steve aoki') || str.includes('deorro') || str.includes('edm') || str.includes('festival') || str.includes('synth drop')) {
    return 'electro_fusion';
  }

  if (str.includes('pop regional') || str.includes('balada') || str.includes('romántica') || str.includes('romantica') || str.includes('carín león') || str.includes('carin leon') || str.includes('christian nodal') || str.includes('sentimiento')) {
    return 'acoustic_pop';
  }

  if (str.includes('rap corrido') || str.includes('corrido rap') || str.includes('santa fe') || str.includes('aleman') || str.includes('alemán') || str.includes('dan sanchez') || str.includes('flow callejero') || str.includes('fuerza regida') || str.includes('calle 664') || str.includes('legado 7')) {
    return 'rap_corrido';
  }

  if (str.includes('houston') || str.includes('metro') || str.includes('21 savage') || str.includes('hard-hitting') || str.includes('ugk') || str.includes('z-ro') || str.includes('drake') || str.includes('street rap') || str.includes('drill') || str.includes('hip hop') || str.includes('trap')) {
    return 'us_hiphop';
  }

  // Default regional bélico
  return 'regional_belico';
}

export function getGenreSeparationInfo(category: GenreCategory): GenreSeparationInfo {
  return GENRE_SEPARATIONS.find(s => s.id === category) || GENRE_SEPARATIONS[0];
}

export interface MarketingCampaignKit {
  category: GenreSeparationInfo;
  releaseTitle: string;
  artistBrand: string;
  tagline: string;
  pitchNote: string;
  targetDemographic: string;
  playlistPitchCategories: string[];
  socialMediaHooks: {
    tiktok: string;
    instagramReels: string;
    youtubeShorts: string;
  };
  hashtags: string;
  isrcPlaceholder: string;
  upcPlaceholder: string;
}

export function generateMarketingKit(song: CorridoData, customArtistName?: string): MarketingCampaignKit {
  const categoryId = song.genreCategory || getGenreCategory(song.style || song.musicalGenreTag || '');
  const categoryInfo = getGenreSeparationInfo(categoryId);
  const artist = customArtistName || 'Medina Tech Records Master Artist';
  const cleanTitle = song.title.split(' - ')[0] || song.title;

  return {
    category: categoryInfo,
    releaseTitle: cleanTitle,
    artistBrand: artist,
    tagline: `Nuevo lanzamiento oficial en la vertical ${categoryInfo.name} (${song.marketingTag || categoryInfo.marketTag})`,
    pitchNote: `Presentamos "${cleanTitle}" por ${artist}. Una producción de vanguardia masterizada en ${song.tempo || 'tempo óptimo'} y tonalidad ${song.musicalKey || 'menor'}. Dirigida estratégicamente para las listas oficiales ${categoryInfo.dspPitchCategory}. Cuenta con una base sólida para campañas de video corto y sincronización en plataformas digitales.`,
    targetDemographic: categoryInfo.targetAudience,
    playlistPitchCategories: [
      categoryInfo.dspPitchCategory.split('•')[0]?.trim() || 'Novedades de la Semana',
      categoryInfo.dspPitchCategory.split('•')[1]?.trim() || 'Tendencias Globales'
    ],
    socialMediaHooks: {
      tiktok: `🔥 ¿Ya escucharon el nuevo sonido de ${cleanTitle}? El beat y las líricas están rompiendo en ${categoryInfo.shortLabel}! Usa este audio para tu próximo video.`,
      instagramReels: `✨ De estreno exclusivo: "${cleanTitle}". Suban el volumen a los 808s y sientan el poder de ${artist}. #NewMusic`,
      youtubeShorts: `🎬 Premiere oficial: Disfruta del clip cinemático de "${cleanTitle}" en 1080p master quality.`
    },
    hashtags: categoryInfo.trendingHashtags.join(' ') + ` #${cleanTitle.replace(/\s+/g, '')} #MedinaTechMusic #SunoQuality #Hit2026`,
    isrcPlaceholder: `MX-A68-26-${Math.floor(10000 + Math.random() * 90000)}`,
    upcPlaceholder: `750998${Math.floor(1000000 + Math.random() * 9000000)}`
  };
}
