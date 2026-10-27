/**
 * Master Genre Preset Registry & Stylistic Specification Engine
 * 
 * Comprehensive, production-grade music taxonomy and preset registry covering:
 * 1. Regional Mexican (Corridos Bélicos, Tumbados, Norteño, Banda, Sierreño, Mariachi, Rap Corrido, Electro Corrido)
 * 2. American Hip-Hop & Trap (Houston Texas Rap, Hard Trap, Street Rap, Drill)
 * 3. American Country & Americana (Nashville Country, Bluegrass, Heartland Folk)
 * 4. Rock & Alternative (Modern Rock, Punk, Heavy Metal, Indie Rock)
 * 5. Global Pop & Contemporary R&B (Synthpop, Melodic Pop, Urban Soul)
 * 6. Latin Urban & Reggaeton (Dembow, Club Urbano, Latin Trap)
 * 7. Afrobeats & Caribbean (Island Fusion, Dancehall, West African Grooves)
 * 8. Electronic & EDM (House, Festival Drops, Synthwave)
 * 9. Acoustic, Jazz & Blues (Soulful Blues, Classic Jazz, Orchestral Scores)
 */

export interface GenrePreset {
  id: string;
  category: string;
  displayName: string;
  defaultLanguage: 'es' | 'en' | 'spanglish';
  tempoRange: { min: number; max: number; defaultBpm: number };
  timeSignature: string;
  meterType: '3/4' | '2/4' | '4/4' | '6/8';
  beatsPerMeasure: number;
  matchPatterns: RegExp[];
  recommendedInstrumentation: string;
  stylisticMarkers: string[];
  safeStyleDescriptor: (tempoBpm: number) => string;
  lyricGuidance: {
    rhymeScheme: string;
    meter: string;
    stropheCount: number;
    linesPerStrophe: number;
    vocalAdlibs: string[];
    structure: string;
  };
}

export class GenrePresetRegistry {
  private static readonly PRESETS: GenrePreset[] = [
    // 1. CORRIDO BÉLICO & TUMBADO (Regional Mexican Standard)
    {
      id: 'regional_belico',
      category: 'Regional Mexican',
      displayName: 'Corrido Bélico & Tumbado',
      defaultLanguage: 'es',
      tempoRange: { min: 115, max: 155, defaultBpm: 138 },
      timeSignature: '3/4 (Vals Zapateado Bélico)',
      meterType: '3/4',
      beatsPerMeasure: 3,
      matchPatterns: [
        /\b(bélic|belic|corrido|tumbad|pesad|firme|mente maestra|doble p|peso pluma|fuerza regida|conriquez|pariente|clica|docerola|requinto)\b/i
      ],
      recommendedInstrumentation: 'Dual 12-string docerola acoustic guitars with fast double-picking in thirds, live slide trombones and charchetas, marching concert tambora with explosive platillazos, snappy military tarola snare, and roaring brass sousaphone tuba',
      stylisticMarkers: [
        '12_string_docerola_requintos_in_thirds',
        'live_brass_slide_trombones_and_charchetas',
        'marching_tambora_kick_with_platillazo',
        'snappy_military_tarola_snare_cracks',
        'deep_sousaphone_tuba_basslines',
        '3_4_vals_zapateado_rhythm'
      ],
      safeStyleDescriptor: (bpm) => `Modern 2026 high-energy corrido bélico in 3/4 vals meter at ${bpm} BPM with blistering 12-string docerola requinto guitar leads, sharp brass section hits with slide trombones, live-concert percussion style drum patterns with marching tambora and military tarolas, and roaring sousaphone tuba`,
      lyricGuidance: {
        rhymeScheme: 'ABCB Consonante / AABB Pareado',
        meter: 'Octosílabo Estricto (8 sílabas métricas por verso)',
        stropheCount: 6,
        linesPerStrophe: 4,
        vocalAdlibs: ['(¡Fierro!)', '(¡Puro corrido bélico, viejo!)', '(¡Y que truene la banda!)', '(¡Arremánguele compadre!)'],
        structure: '6 Estrofas: Verso 1 (Intro & Origen), Verso 2 (Lealtad & Trayectoria), Coro (Lema & Poder), Verso 3 (Clímax & Temple), Coro, Outro (Firma)'
      }
    },

    // 2. NORTEÑO TRADICIONAL & MODERNO
    {
      id: 'norteno',
      category: 'Regional Mexican',
      displayName: 'Norteño Tradicional & Moderno',
      defaultLanguage: 'es',
      tempoRange: { min: 115, max: 145, defaultBpm: 130 },
      timeSignature: '2/4 (Polka Norteña)',
      meterType: '2/4',
      beatsPerMeasure: 2,
      matchPatterns: [
        /\b(norteñ|norteno|acorde[oó]n|bajo sexto|bajo quinto|polka|arriesgado|marca registrada|tigres del norte|tucanes)\b/i
      ],
      recommendedInstrumentation: 'Virtuoso diatonic button accordion, steel-string acoustic bajo sexto and bajo quinto, live touring acoustic drum kit with snappy tarola rolls, and punchy electric bass or wooden tololoche',
      stylisticMarkers: [
        'virtuoso_diatonic_button_accordion_solos',
        'acoustic_bajo_sexto_and_bajo_quinto_strumming',
        'driving_2_4_polka_drum_kit_with_tarolas',
        'punchy_electric_bass_or_wooden_tololoche'
      ],
      safeStyleDescriptor: (bpm) => `Authentic Norteño powerhouse arrangement in driving 2/4 polka meter at ${bpm} BPM with virtuoso diatonic button accordion solos, crisp acoustic bajo sexto/quinto strumming, live touring drum kit with snappy tarola rolls, and punchy electric bass`,
      lyricGuidance: {
        rhymeScheme: 'ABCB Consonante',
        meter: 'Octosílabo Norteño (8 sílabas métricas)',
        stropheCount: 6,
        linesPerStrophe: 4,
        vocalAdlibs: ['(¡Échale compa!)', '(¡Y que suene ese acordeón!)', '(¡Puro norteño fino!)'],
        structure: '6 Estrofas: Verso 1, Verso 2, Coro, Verso 3, Coro, Outro'
      }
    },

    // 3. BANDA SINALOENSE BRAVA
    {
      id: 'banda',
      category: 'Regional Mexican',
      displayName: 'Banda Sinaloense Brava',
      defaultLanguage: 'es',
      tempoRange: { min: 120, max: 155, defaultBpm: 144 },
      timeSignature: '3/4 (Vals Banda Sinaloense)',
      meterType: '3/4',
      beatsPerMeasure: 3,
      matchPatterns: [
        /\b(banda|sinaloense|tambora|tamborazo|clarinete|banda ms|el recodo|arrolladora|adictiva|trombones)\b/i
      ],
      recommendedInstrumentation: 'Full 16-piece Sinaloense brass band: marching concert tambora with explosive platillazos, deep sousaphone tuba, screaming clarinets in harmony, sharp slide trombones, and bright trumpet fanfares',
      stylisticMarkers: [
        '16_piece_sinaloan_brass_band_orchestration',
        'marching_concert_tambora_with_explosive_platillazos',
        'screaming_harmonized_clarinets',
        'sharp_slide_trombones_and_trumpets',
        'deep_roaring_sousaphone_tuba'
      ],
      safeStyleDescriptor: (bpm) => `Heavy authentic Sinaloan brass band (Banda Sinaloense Brava) in fast 3/4 meter at ${bpm} BPM with marching concert tambora, explosive brass cymbal crashes (platillazos), screaming clarinets, sharp slide trombones, bright trumpets, and deep roaring sousaphone tuba`,
      lyricGuidance: {
        rhymeScheme: 'ABCB Consonante / AABB Pareado',
        meter: 'Octosílabo / Decasílabo Banda',
        stropheCount: 6,
        linesPerStrophe: 4,
        vocalAdlibs: ['(¡Que retumbe la tambora!)', '(¡Arriba Mazatlán y Culiacán!)', '(¡Que truene la banda en vivo!)'],
        structure: '6 Estrofas: Verso 1, Verso 2, Coro, Verso 3, Coro, Outro'
      }
    },

    // 4. SIERREÑO & CAMPIRANO ACÚSTICO
    {
      id: 'sierreno',
      category: 'Regional Mexican',
      displayName: 'Sierreño & Campirano Acústico',
      defaultLanguage: 'es',
      tempoRange: { min: 105, max: 135, defaultBpm: 120 },
      timeSignature: '3/4 (Vals Sierreño Campirano)',
      meterType: '3/4',
      beatsPerMeasure: 3,
      matchPatterns: [
        /\b(sierr|campirano|eslab[oó]n|dareyes|cuerdas|requinto ac[uú]stico|tololoche)\b/i
      ],
      recommendedInstrumentation: 'Dual 12-string steel docerola guitars with rapid melodic adornos, double-picked sliding scales in thirds, deep wooden tololoche bass, and live acoustic drum kit with crisp snare rimshots',
      stylisticMarkers: [
        'dual_12_string_steel_docerolas_with_sliding_scales',
        'deep_acoustic_wooden_tololoche_bass',
        'live_acoustic_drum_kit_with_snare_rimshots',
        'two_part_masculine_vocal_harmonies'
      ],
      safeStyleDescriptor: (bpm) => `Authentic rustic Sierreño Campirano corrido in 3/4 vals meter at ${bpm} BPM with fast 12-string docerola requinto guitar leads, deep wooden tololoche or electric bass, live acoustic drums, and tight two-part masculine harmonies`,
      lyricGuidance: {
        rhymeScheme: 'ABCB Consonante',
        meter: 'Octosílabo Campirano',
        stropheCount: 6,
        linesPerStrophe: 4,
        vocalAdlibs: ['(¡Puro sierreño campirano!)', '(¡Desde la sierra, viejo!)', '(¡Así suena la docerola!)'],
        structure: '6 Estrofas: Verso 1, Verso 2, Coro, Verso 3, Coro, Outro'
      }
    },

    // 5. MARIACHI & RANCHERA CLÁSICA
    {
      id: 'mariachi',
      category: 'Regional Mexican',
      displayName: 'Mariachi de Gala & Ranchera',
      defaultLanguage: 'es',
      tempoRange: { min: 90, max: 140, defaultBpm: 118 },
      timeSignature: '3/4 (Vals Ranchero de Gala)',
      meterType: '3/4',
      beatsPerMeasure: 3,
      matchPatterns: [
        /\b(mariachi|ranchera|ranchero|charro|vicente|vihuela|guitarr[oó]n|jalisco)\b/i
      ],
      recommendedInstrumentation: 'Full gala Mariachi ensemble: lush harmonized violin sections in thirds, dual bright classical trumpet fanfares, rhythmic vihuela and classical guitar strumming, and deep resonant guitarrón acoustic bass',
      stylisticMarkers: [
        'harmonized_violin_sections_in_thirds',
        'dual_bright_mariachi_trumpet_calls',
        'rhythmic_vihuela_and_classical_guitar_chops',
        'deep_resonant_guitarrón_acoustic_bass'
      ],
      safeStyleDescriptor: (bpm) => `Authentic traditional Mexican Mariachi de Gala and Ranchera in 3/4 vals ranchero meter at ${bpm} BPM with lush harmonized violin sections in thirds, bright classical trumpet calls, acoustic rhythm vihuela, classical guitar, and booming deep guitarrón acoustic bass`,
      lyricGuidance: {
        rhymeScheme: 'ABBA / ABCB Romance Poético',
        meter: 'Endecasílabo / Octosílabo Elegante',
        stropheCount: 6,
        linesPerStrophe: 4,
        vocalAdlibs: ['(¡Ajúa!)', '(¡Viva mi tierra!)', '(¡Con el corazón en la mano!)'],
        structure: '6 Estrofas: Verso 1, Verso 2, Coro, Verso 3, Coro, Outro'
      }
    },

    // 6. RAP CORRIDO MEXICANO
    {
      id: 'rap_corrido',
      category: 'Regional Mexican',
      displayName: 'Rap Corrido Mexicano',
      defaultLanguage: 'es',
      tempoRange: { min: 115, max: 145, defaultBpm: 128 },
      timeSignature: '4/4 (Hip-Hop Rap Corrido)',
      meterType: '4/4',
      beatsPerMeasure: 4,
      matchPatterns: [
        /\b(rap corrido|corrido rap|santa fe|alem[aá]n|dan sanchez|tornillo|dharius|flow callejero|trap corrido)\b/i
      ],
      recommendedInstrumentation: 'Deep booming 808 sub-bass, rapid 16th-note trap hi-hats, hard acoustic rimshots, fast syncopated street rap flow, and blistering 12-string docerola requinto guitar riffs',
      stylisticMarkers: [
        'booming_808_sub_bass_with_heavy_kick',
        'rapid_16th_note_trap_hi_hats_and_rimshots',
        '12_string_docerola_requinto_guitar_riffs',
        'fast_multisyllabic_spanish_rap_cadence'
      ],
      safeStyleDescriptor: (bpm) => `Modern Mexican Rap Corrido street fusion in 4/4 meter at ${bpm} BPM with deep booming 808 sub-bass, rapid 16th-note trap hi-hats, hard acoustic rimshots, fast syncopated street rap flow, and blistering 12-string docerola requinto riffs`,
      lyricGuidance: {
        rhymeScheme: 'Multisilábico Doble & Rima Interna',
        meter: '12-16 Sílabas / 16-bar flow',
        stropheCount: 6,
        linesPerStrophe: 4,
        vocalAdlibs: ['(¡Firme!)', '(¡Desde el barrio!)', '(¡Puro rap corrido!)', '(¡No cap!)'],
        structure: '6 Estrofas: Verso 1 [16 barras], Verso 2 [16 barras], Coro Antémico [8 barras], Verso 3, Coro, Outro'
      }
    },

    // 7. ELECTRO CORRIDO & EDM FUSION
    {
      id: 'electro_corrido',
      category: 'Regional Mexican',
      displayName: 'Electro Corrido & EDM Fusion',
      defaultLanguage: 'es',
      tempoRange: { min: 124, max: 134, defaultBpm: 128 },
      timeSignature: '4/4 (EDM Festival Four-on-the-Floor)',
      meterType: '4/4',
      beatsPerMeasure: 4,
      matchPatterns: [
        /\b(electro corrido|edm corrido|electronic corrido|festival corrido)\b/i
      ],
      recommendedInstrumentation: 'Driving electronic 4-on-the-floor kick, offbeat open hi-hats, massive supersaw festival synthesizer leads, sidechained sub-bass, and rapid 12-string acoustic requinto guitar leads',
      stylisticMarkers: [
        'four_on_the_floor_electronic_kick_drops',
        'massive_supersaw_synth_chords',
        'sidechained_pumping_sub_bass',
        'blistering_live_12_string_requinto_riffs'
      ],
      safeStyleDescriptor: (bpm) => `High-octane Electro Corrido EDM festival anthem in 4/4 meter at ${bpm} BPM with heavy 4-on-the-floor kick drops, energetic supersaw synthesizer festival leads, sidechained bass, and blistering live 12-string docerola requinto riffs`,
      lyricGuidance: {
        rhymeScheme: 'AABB / ABCB',
        meter: 'Octosílabo Electrónico',
        stropheCount: 6,
        linesPerStrophe: 4,
        vocalAdlibs: ['(¡Que explote el festival!)', '(¡Súbele a los bajos!)', '(¡Vámonos recio!)'],
        structure: '6 Estrofas: Intro, Verso 1, Coro Drop, Verso 2, Coro Drop, Outro'
      }
    },

    // 8. AMERICAN COUNTRY & AMERICANA
    {
      id: 'country',
      category: 'Country & Americana',
      displayName: 'American Country & Americana',
      defaultLanguage: 'en',
      tempoRange: { min: 78, max: 130, defaultBpm: 108 },
      timeSignature: '4/4 (American Country Ballad)',
      meterType: '4/4',
      beatsPerMeasure: 4,
      matchPatterns: [
        /\b(country|americana|bluegrass|nashville|wallen|zach bryan|luke combs|whispering pines|banjo|pedal steel|honky|dreadnought|fiddle)\b/i
      ],
      recommendedInstrumentation: 'Nashville studio ensemble: acoustic dreadnought guitar strumming, weeping pedal steel guitar fills, melodic 5-string banjo rolls, acoustic fiddle/violin fills, solid warm bass guitar, and driving acoustic country drum kit with crisp brushed snare',
      stylisticMarkers: [
        'acoustic_dreadnought_guitar_strumming',
        'weeping_pedal_steel_guitar_slides',
        'melodic_5_string_banjo_rolls',
        'acoustic_fiddle_counter_melodies',
        'driving_country_drum_kit_with_brushed_snare'
      ],
      safeStyleDescriptor: (bpm) => `Authentic Nashville Modern Country & Americana anthem in 4/4 meter at ${bpm} BPM with rich acoustic dreadnought guitar strumming, weeping pedal steel guitar fills, rhythmic 5-string banjo rolls, solid warm bass, and driving acoustic drums with brushed snare`,
      lyricGuidance: {
        rhymeScheme: 'AABB / ABCB Multi-Syllabic Heartland Rhyme',
        meter: 'Stress-Timed English Meter (8-10 beats per line)',
        stropheCount: 6,
        linesPerStrophe: 4,
        vocalAdlibs: ['(Yeah!)', '(Holding it down!)', '(All the way through!)', '(Sing it out!)'],
        structure: '6 Strophes: Verse 1 (Heartland Story), Verse 2 (The Trail), Chorus (Anthemic Hook), Verse 3 (The Legacy), Chorus, Outro (Acoustic Fadeout)'
      }
    },

    // 9. HOUSTON TEXAS SOUTHERN RAP
    {
      id: 'houston_rap',
      category: 'American Hip-Hop & Trap',
      displayName: 'Houston Southern Texas Rap',
      defaultLanguage: 'en',
      tempoRange: { min: 66, max: 86, defaultBpm: 74 },
      timeSignature: '4/4 (Slow-Rolling Houston Slab Beat)',
      meterType: '4/4',
      beatsPerMeasure: 4,
      matchPatterns: [
        /\b(houston|ugk|z-ro|zro|bun b|trae|screw|slab|scarface|dirty south|713|281|fifth ward|southside)\b/i
      ],
      recommendedInstrumentation: 'Southern Texas rap production: deep rolling tuned 808 sub-bass, soulful vintage Fender Rhodes electric piano chords, warm analog synthesizer pads, tight analog kick drum, and crisp dry snare on beats 2 and 4',
      stylisticMarkers: [
        'slow_rolling_808_sub_bass',
        'soulful_vintage_fender_rhodes_chords',
        'analog_kick_and_crisp_dry_snare_on_2_and_4',
        'gritty_southern_storytelling_flow'
      ],
      safeStyleDescriptor: (bpm) => `Authentic Houston Texas underground street rap track in slow rolling 4/4 meter at ${bpm} BPM with heavy thumping 808 sub-bass, soulful electric Rhodes keys, punchy analog drums, and gritty storytelling English rap delivery`,
      lyricGuidance: {
        rhymeScheme: 'Multisyllabic Internal Rhyme & Couplets',
        meter: '12-16 Syllables per bar',
        stropheCount: 6,
        linesPerStrophe: 4,
        vocalAdlibs: ['(Hold up!)', '(Yeah, 713 on lock!)', '(Straight out the South!)', '(Day ones only!)'],
        structure: '6 Strophes: Verse 1, Verse 2, Chorus, Verse 3, Chorus, Outro'
      }
    },

    // 10. AMERICAN HARD TRAP & STREET RAP
    {
      id: 'trap',
      category: 'American Hip-Hop & Trap',
      displayName: 'Hard Trap & Modern Street Rap',
      defaultLanguage: 'en',
      tempoRange: { min: 125, max: 155, defaultBpm: 138 },
      timeSignature: '4/4 (Modern 808 Trap)',
      meterType: '4/4',
      beatsPerMeasure: 4,
      matchPatterns: [
        /\b(trap|metro boomin|metro|21 savage|future|drake|travis scott|drill|us_hiphop|hard rap|street rap|808 bass)\b/i
      ],
      recommendedInstrumentation: 'Cutting-edge 2026 American trap production: heavy tuned 808 sub-bass with low-end saturation and pitch slides, lightning-fast 32nd/64th rolling fine hi-hats with pitch modulations, punchy modern snare claps, crisp crash cymbals, dark ominous synth brass, and atmospheric bell plucks',
      stylisticMarkers: [
        'heavy_tuned_808_sub_bass_with_pitch_slides',
        'rapid_32nd_and_64th_rolling_fine_hi_hats',
        'punchy_modern_snare_claps_and_rimshots',
        'dark_ominous_synth_brass_and_bell_plucks'
      ],
      safeStyleDescriptor: (bpm) => `Ultra-modern 2026 American hard trap anthem in 4/4 meter at ${bpm} BPM with booming distorted 808 sub-bass, rapid rolling fine hi-hats, pitch-bent trap hat rolls, snappy rimshot snares, dark atmospheric synthesizer stabs, and fast confident modern English rap flow`,
      lyricGuidance: {
        rhymeScheme: 'Fast Triplet Rolls & Multi-Syllabic Endings',
        meter: '14-18 Syllables per bar',
        stropheCount: 6,
        linesPerStrophe: 4,
        vocalAdlibs: ['(Yeah!)', '(Straight up!)', '(No cap!)', '(All gas!)'],
        structure: '6 Strophes: Verse 1, Verse 2, Hook, Verse 3, Hook, Outro'
      }
    },

    // 11. MODERN ROCK & ALTERNATIVE
    {
      id: 'rock',
      category: 'Rock & Alternative',
      displayName: 'Modern Rock & Alternative',
      defaultLanguage: 'en',
      tempoRange: { min: 112, max: 160, defaultBpm: 132 },
      timeSignature: '4/4 (Driving Rock)',
      meterType: '4/4',
      beatsPerMeasure: 4,
      matchPatterns: [
        /\b(rock|alternative|indie rock|punk|metal|grunge|heavy metal|rock_alternative|garage rock)\b/i
      ],
      recommendedInstrumentation: 'Full rock band line-up: dual electric rhythm and lead guitars with tube overdrive and melodic solo fills, energetic heavy rock acoustic drum kit with dynamic cymbal crashes, and driving electric bass guitar',
      stylisticMarkers: [
        'dual_overdriven_electric_rhythm_and_lead_guitars',
        'heavy_rock_acoustic_drum_kit_with_crash_cymbals',
        'driving_8th_note_electric_bass_guitar',
        'raw_energetic_chest_resonance_vocals'
      ],
      safeStyleDescriptor: (bpm) => `High-octane Modern Rock & Alternative track in 4/4 meter at ${bpm} BPM with crunchy overdriven electric guitar riffs, punchy acoustic drum kit with heavy crash cymbals, driving bass guitar, and powerful raw rock vocals`,
      lyricGuidance: {
        rhymeScheme: 'AABB / ABAB Power Rhyme',
        meter: 'Driving 4/4 Metric Pulse',
        stropheCount: 6,
        linesPerStrophe: 4,
        vocalAdlibs: ['(Come on!)', '(Yeah!)', '(Let it burn!)', '(All the way!)'],
        structure: '6 Strophes: Verse 1, Verse 2, Chorus, Verse 3, Chorus, Outro Guitar Solo'
      }
    },

    // 12. GLOBAL RADIO POP & CONTEMPORARY R&B
    {
      id: 'pop_rnb',
      category: 'Global Pop & R&B',
      displayName: 'Global Radio Pop & R&B',
      defaultLanguage: 'en',
      tempoRange: { min: 90, max: 128, defaultBpm: 110 },
      timeSignature: '4/4 (Polished Pop Groove)',
      meterType: '4/4',
      beatsPerMeasure: 4,
      matchPatterns: [
        /\b(contemporary r&b|the weeknd|sza|brunomars|synthpop|global_pop_rnb|r&b|rnb|pop radio|soul pop)\b/i
      ],
      recommendedInstrumentation: 'Top-chart pop and R&B studio production: crisp acoustic-electronic hybrid drum kit with punchy kick and snap-claps, deep warm analog synth bass, lush Rhodes electric piano chords, atmospheric synth arpeggios, and silky vocal harmonies',
      stylisticMarkers: [
        'punchy_hybrid_drum_kit_with_finger_snaps_and_claps',
        'warm_analog_synth_bassline',
        'lush_fender_rhodes_and_synth_pads',
        'silky_layered_vocal_harmonies'
      ],
      safeStyleDescriptor: (bpm) => `Polished 2026 Global Radio Pop and Contemporary R&B track in 4/4 meter at ${bpm} BPM with punchy modern drums, warm analog synth bassline, lush keyboard chords, bright vocal harmonies, and an irresistible melodious chorus hook in English`,
      lyricGuidance: {
        rhymeScheme: 'AABB / ABAB Melodic Rhymes',
        meter: 'Polished Pop Melodic Phrasing',
        stropheCount: 6,
        linesPerStrophe: 4,
        vocalAdlibs: ['(Ooh yeah)', '(Baby listen)', '(Right now)'],
        structure: '6 Strophes: Verse 1, Pre-Chorus, Chorus Hook, Verse 2, Chorus Hook, Outro'
      }
    },

    // 13. LATIN URBAN & REGGAETON
    {
      id: 'latin_urban',
      category: 'Latin Urban',
      displayName: 'Latin Urban & Reggaeton',
      defaultLanguage: 'es',
      tempoRange: { min: 88, max: 104, defaultBpm: 96 },
      timeSignature: '4/4 (Syncopated Dembow 3:2)',
      meterType: '4/4',
      beatsPerMeasure: 4,
      matchPatterns: [
        /\b(reggaeton|dembow|perreo|latin urban|trap latino|bad bunny|eladio|myke towers)\b/i
      ],
      recommendedInstrumentation: 'Premium Latin Urban club production: punchy kick and crisp snare playing the signature syncopated Dembow rhythm, deep tuned 808 bass, bright plucks, and lush modern synthesizer pads',
      stylisticMarkers: [
        'syncopated_dembow_3_2_drum_groove',
        'deep_tuned_808_sub_bass',
        'minor_key_atmospheric_synth_plucks',
        'punchy_snare_and_clap_layers'
      ],
      safeStyleDescriptor: (bpm) => `High-energy modern 2026 Latin Urban Reggaeton anthem in 4/4 meter at ${bpm} BPM with hard-hitting authentic Dembow 3:2 syncopated drum groove, booming 808 sub-bass, atmospheric synth chords, and infectious rhythmic vocal delivery`,
      lyricGuidance: {
        rhymeScheme: 'AABB / ABCB Rítmico',
        meter: 'Cadencia Urbana Bailable',
        stropheCount: 6,
        linesPerStrophe: 4,
        vocalAdlibs: ['(¡Díselo!)', '(¡Súbelo!)', '(Sauce puro!)', '(No cap!)'],
        structure: '6 Estrofas: Intro, Verso 1, Coro, Verso 2, Coro, Outro'
      }
    },

    // 14. AFROBEATS & CARIBBEAN FUSION
    {
      id: 'afrobeats',
      category: 'Afrobeats & Caribbean',
      displayName: 'Afrobeats & Caribbean Fusion',
      defaultLanguage: 'en',
      tempoRange: { min: 96, max: 116, defaultBpm: 104 },
      timeSignature: '4/4 (Syncopated Afro Groove)',
      meterType: '4/4',
      beatsPerMeasure: 4,
      matchPatterns: [
        /\b(afro|afrobeats|caribbean|burna|dancehall|amapiano|island fusion)\b/i
      ],
      recommendedInstrumentation: 'Afrobeats and island production: syncopated percussive afro groove with shakers, log drums, congas, warm log drum sub-bass, bright kalimba/marimba plucks, subtle island brass stabs, and smooth rhythmic vocal melodies',
      stylisticMarkers: [
        'syncopated_west_african_log_drum_groove',
        'percussive_shakers_and_conga_hits',
        'warm_rolling_log_drum_sub_bass',
        'bright_kalimba_and_marimba_melodies'
      ],
      safeStyleDescriptor: (bpm) => `Vibrant modern 2026 Afrobeats and Caribbean fusion track in 4/4 meter at ${bpm} BPM with syncopated West African log drum grooves, uplifting marimba/kalimba melodies, warm rolling bass, and infectious melodic vocal delivery`,
      lyricGuidance: {
        rhymeScheme: 'AABB / ABCB Syncopated',
        meter: 'Syncopated Island Flow',
        stropheCount: 6,
        linesPerStrophe: 4,
        vocalAdlibs: ['(Yeah-yeah)', '(Vibes on vibes)', '(Take it slow)'],
        structure: '6 Strophes: Verse 1, Verse 2, Chorus, Verse 3, Chorus, Outro'
      }
    },

    // 15. ELECTRONIC DANCE MUSIC (EDM & HOUSE)
    {
      id: 'edm',
      category: 'Electronic & EDM',
      displayName: 'Electronic Dance Music & House',
      defaultLanguage: 'en',
      tempoRange: { min: 124, max: 134, defaultBpm: 128 },
      timeSignature: '4/4 (Four-on-the-Floor Club)',
      meterType: '4/4',
      beatsPerMeasure: 4,
      matchPatterns: [
        /\b(edm|electro|house|techno|synthwave|electronic|club dance)\b/i
      ],
      recommendedInstrumentation: 'Driving electronic four-on-the-floor kick drum, open hi-hats on offbeats, energetic supersaw festival synth chords, sidechained pumping sub-bass, and euphoric melodic leads',
      stylisticMarkers: [
        'four_on_the_floor_punchy_electronic_kick',
        'offbeat_open_hi_hat_groove',
        'massive_supersaw_synth_drop_chords',
        'sidechained_pumping_sub_bass'
      ],
      safeStyleDescriptor: (bpm) => `High-energy 2026 Electronic Dance Music & House anthem in 4/4 meter at ${bpm} BPM with driving 4-on-the-floor kick drops, euphoric supersaw synthesizer leads, and sidechained pumping bass`,
      lyricGuidance: {
        rhymeScheme: 'AABB Anthemic Couplets',
        meter: 'Club Vocal Phrasing',
        stropheCount: 6,
        linesPerStrophe: 4,
        vocalAdlibs: ['(Drop the beat!)', '(Here we go!)', '(Feel the sound!)'],
        structure: '6 Strophes: Build-Up, Drop 1, Verse, Build-Up 2, Drop 2, Outro'
      }
    }
  ];

  /**
   * Retrieves all available presets
   */
  public static getAllPresets(): GenrePreset[] {
    return this.PRESETS;
  }

  /**
   * Finds a genre preset by its exact ID
   */
  public static getPresetById(id: string): GenrePreset | undefined {
    return this.PRESETS.find(p => p.id === id);
  }

  /**
   * Resolves the exact genre preset from user inputs (style, genreCategory, title, tags, prompt)
   */
  public static resolvePreset(params: {
    style?: string;
    genreCategory?: string;
    musicalGenreTag?: string;
    bandInspiration?: string;
    title?: string;
    prompt?: string;
    primaryLanguage?: string;
  }): { preset: GenrePreset; matchedBy: string } {
    const rawStyle = `${params.style || ''} ${params.genreCategory || ''} ${params.musicalGenreTag || ''} ${params.bandInspiration || ''} ${params.title || ''}`.toLowerCase().trim();

    // 1. First test explicit Regional Mexican genres to ensure corridos never get converted to other styles
    const regionalMexicanKeywords = ['corrido', 'bélico', 'belico', 'tumbado', 'norteño', 'norteno', 'banda', 'sierreño', 'sierreno', 'mariachi', 'ranchera', 'zapateado', 'docerola', 'requinto', 'tambora', 'acordeón', 'acordeon', 'bajo sexto'];
    const isExplicitRegionalMexican = regionalMexicanKeywords.some(kw => rawStyle.includes(kw));

    if (isExplicitRegionalMexican) {
      if (rawStyle.includes('mariachi') || rawStyle.includes('ranchera') || rawStyle.includes('charro')) {
        return { preset: this.getPresetById('mariachi')!, matchedBy: 'explicit_mariachi_pattern' };
      }
      if (rawStyle.includes('norteño') || rawStyle.includes('norteno') || rawStyle.includes('acordeón') || rawStyle.includes('acordeon') || rawStyle.includes('bajo sexto')) {
        return { preset: this.getPresetById('norteno')!, matchedBy: 'explicit_norteno_pattern' };
      }
      if (rawStyle.includes('banda') || rawStyle.includes('tambora') || rawStyle.includes('clarinete')) {
        return { preset: this.getPresetById('banda')!, matchedBy: 'explicit_banda_pattern' };
      }
      if (rawStyle.includes('sierr') || rawStyle.includes('campirano')) {
        return { preset: this.getPresetById('sierreno')!, matchedBy: 'explicit_sierreno_pattern' };
      }
      if (rawStyle.includes('rap corrido') || rawStyle.includes('corrido rap') || rawStyle.includes('santa fe')) {
        return { preset: this.getPresetById('rap_corrido')!, matchedBy: 'explicit_rap_corrido_pattern' };
      }
      if (rawStyle.includes('electro corrido')) {
        return { preset: this.getPresetById('electro_corrido')!, matchedBy: 'explicit_electro_corrido_pattern' };
      }
      return { preset: this.getPresetById('regional_belico')!, matchedBy: 'explicit_corrido_belico_standard' };
    }

    // 2. Test other specific genre match patterns in strict priority order
    for (const preset of this.PRESETS) {
      for (const pattern of preset.matchPatterns) {
        if (pattern.test(rawStyle)) {
          return { preset, matchedBy: `pattern_${preset.id}` };
        }
      }
    }

    // 3. Fallback: Default to Regional Mexican Corrido Bélico
    return {
      preset: this.getPresetById('regional_belico')!,
      matchedBy: 'default_regional_belico_preset'
    };
  }

  /**
   * Validates an audio response payload against the expected preset characteristics
   */
  public static validateAudioResponse(params: {
    audioUrl: string;
    actualDurationSec: number;
    expectedDurationSec: number;
    resolvedPreset: GenrePreset;
    tempoBpm: number;
    lyricsCount?: number;
  }): {
    isValid: boolean;
    durationCompliance: boolean;
    stylisticIntegrityPassed: boolean;
    validationSummary: {
      matchedPresetId: string;
      displayName: string;
      category: string;
      expectedDurationSec: number;
      actualDurationSec: number;
      tempoBpm: number;
      timeSignature: string;
      certifiedStylisticMarkers: string[];
      lyricsCount: number;
    };
  } {
    const durationCompliance = params.actualDurationSec >= Math.floor(params.expectedDurationSec * 0.85);
    const stylisticIntegrityPassed = params.resolvedPreset.stylisticMarkers.length > 0;
    const isValid = Boolean(params.audioUrl && params.audioUrl.length > 0 && durationCompliance && stylisticIntegrityPassed);

    return {
      isValid,
      durationCompliance,
      stylisticIntegrityPassed,
      validationSummary: {
        matchedPresetId: params.resolvedPreset.id,
        displayName: params.resolvedPreset.displayName,
        category: params.resolvedPreset.category,
        expectedDurationSec: params.expectedDurationSec,
        actualDurationSec: params.actualDurationSec,
        tempoBpm: params.tempoBpm,
        timeSignature: params.resolvedPreset.timeSignature,
        certifiedStylisticMarkers: params.resolvedPreset.stylisticMarkers,
        lyricsCount: params.lyricsCount || 0
      }
    };
  }
}
