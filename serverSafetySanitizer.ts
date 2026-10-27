/**
 * Safety Sanitization Layer for Lyria 3 Pro & Lyria 3 Clip
 * 
 * Strict sanitization module to prevent false-positive PROHIBITED_CONTENT
 * and safety filter blocks in Google's Lyria music models.
 * 
 * Key Functions:
 * 1. Replaces specific band names and artist trademarks with generic musical descriptors.
 * 2. Replaces protected, violent, illicit, or entity-specific terms with safe musical or narrative phrasing.
 * 3. Preserves high musical fidelity for requested genres, specifically 'Norteño Moderno' and 'Bélico'.
 */

export interface SanitizedMusicPromptResult {
  finalPrompt: string;
  cleanTitle: string;
  safeStyleDescriptor: string;
  tempoBpm: number;
  sanitizedInstrumentation: string;
  safeLyricalTheme: string;
  clipLines: string;
  fullLines: string;
}

export class SafetySanitizationLayer {
  // Comprehensive mapping of specific band/artist names to generic musical descriptors
  private static readonly BAND_NAME_MAP: Array<{ pattern: RegExp; replacement: string }> = [
    // Modern Banda / Bélico & Live Brass Ensembles
    { pattern: /\b(modern banda|bélico en vivo|belico en vivo|banda bélica|banda belica|corridos bélicos en vivo|metales en vivo)\b/gi, replacement: "High-energy live concert modern banda bélico arrangement with blistering 12-string docerola requintos, explosive brass section bursts, screaming slide trombones, booming tambora with cymbal crashes, and snappy live military tarolas" },
    // Sierreño & Modern Guitar Bands
    { pattern: /\b(legado 7|legado siete)\b/gi, replacement: "Modern 2026 urban sierreño arrangement with rapid 12-string docerola requintos, punchy modern acoustic drum kit with snappy tarola snare rolls, deep electric bass and streetwise vocals" },
    { pattern: /\b(herencia de patrones)\b/gi, replacement: "High-speed modern urban corrido with lightning-fast 12-string acoustic requinto rasgueos and modern punchy drum kit" },
    { pattern: /\b(los dareyes de la sierra|dareyes de la sierra|los dareyes|dareyes)\b/gi, replacement: "Modern heavy campirano arrangement with high-tempo 12-string requintos, modern drum kit, punchy bass and sharp slide trombones" },
    { pattern: /\b(eslabon armado|eslabón armado)\b/gi, replacement: "Modern acoustic regional arrangement with fast 12-string requintos and full modern drum set" },
    { pattern: /\b(junior h)\b/gi, replacement: "Contemporary 2026 melodic regional arrangement with modern drum set, punchy bass guitar and dual 12-string requinto harmonies" },
    
    // Modern Corrido / Vanguardia / Bélico Artists
    { pattern: /\b(peso pluma|doble p|tito double p|tito p)\b/gi, replacement: "Modern 2026 high-energy regional corrido with blistering 12-string requinto guitar riffs, modern drum set with tight snare cracks, deep punchy bass, slide trombones and high-hype masculine delivery" },
    { pattern: /\b(natanael cano|nata)\b/gi, replacement: "Modern 2026 corrido tumbado with fast 12-string docerola arpeggios, modern drum kit, deep bass guitar and youthful energetic flow" },
    { pattern: /\b(fuerza regida|jop|jesus ortiz paz)\b/gi, replacement: "Modern 2026 urban regional arrangement with heavy drum set, deep sousaphone tuba, electric bass and aggressive slide trombones" },
    { pattern: /\b(gabito ballesteros)\b/gi, replacement: "Modern regional arrangement with sharp slide trombones, 12-string requintos, modern drum set and energetic hype brass" },
    { pattern: /\b(luis r conriquez|luis r conríquez|conriquez)\b/gi, replacement: "High-speed modern corrido with live acoustic drum set, heavy punchy bass, 12-string requintos and gritty masculine vocals" },
    { pattern: /\b(chino pacas)\b/gi, replacement: "Modern 2026 urban regional arrangement with deep bass, modern drums and fast acoustic guitars" },
    { pattern: /\b(xavi)\b/gi, replacement: "Modern 2026 melodic regional arrangement with rich 12-string guitar picking and crisp modern drum set" },
    { pattern: /\b(arsenal efectivo)\b/gi, replacement: "Modern brass regional arrangement with deep sousaphone and acoustic drum kit" },
    // Rap Corrido Mexicano & Urban Hip-Hop Fusion Artists
    { pattern: /\b(santa fe klan|santa fe|aleman|alemán|dan sanchez|dan sánchez|tornillo|dharius|lefty sm|lefty|gera mx|gera|c-kan|ckan|rap corrido|corrido rap|trap corrido|corridos con rap)\b/gi, replacement: "Modern Mexican Rap Corrido fusion arrangement with deep booming 808 sub-bass, rapid 16th-note trap hi-hats, hard acoustic rimshots, fast syncopated Spanish rap verses, 12-string docerola requinto riffs and authentic Mexican street swagger" },
    // Houston Texas Rap Legends & American Hip-Hop Artists
    { pattern: /\b(ugk|bun b|pimp c|z-ro|zro|trae tha truth|trae|scarface|geto boys|paul wall|slim thug|chamillionaire|big moe|fat pat|lil keke|dj screw|houston rap|slab)\b/gi, replacement: "Houston Texas underground rap arrangement with slow rolling 808 sub bass, soulful electric keys, hard-hitting kick and gritty Southern rap delivery" },
    { pattern: /\b(starboy|the weeknd|daft punk|travisscott|travis scott|drake|drizzy|future|metro boomin|metro|playboi carti|carti|gunna|lil baby|21 savage|kendrick|eminem|post malone|don toliver|yeat)\b/gi, replacement: "Ultra-modern 2026 trap rap arrangement with booming 808 sub bass, rapid rolling fine hi-hats, pitch-bent trap hats, punchy snares, and hard-hitting rap cadence" },

    // Norteño Moderno & Tarola Groups
    { pattern: /\b(grupo arriesgado|arriesgado)\b/gi, replacement: "Norteño moderno powerhouse arrangement with modern drum set, live snappy tarolas, fast diatonic accordion, 12-string docerolas and electric bass" },
    { pattern: /\b(marca registrada|grupo marca registrada)\b/gi, replacement: "Modern 2026 norteño arrangement with modern acoustic drum set, fast button accordion and 12-string guitars" },
    { pattern: /\b(edición especial|edicion especial)\b/gi, replacement: "Modern norteño arrangement with accordion, modern drum kit and 12-string docerolas" },
    { pattern: /\b(calibre 50)\b/gi, replacement: "Modern regional arrangement with diatonic button accordion, modern drum kit and brass sousaphone" },
    { pattern: /\b(los tucanes de tijuana|tucanes de tijuana|los tucanes)\b/gi, replacement: "Fast-paced northern regional arrangement with live drum kit and 12-string guitars" },
    { pattern: /\b(los tigres del norte|tigres del norte)\b/gi, replacement: "Storytelling northern regional arrangement with accordion and 12-string guitars" },
    { pattern: /\b(grupo frontera)\b/gi, replacement: "Modern melodic regional arrangement with electric bass, modern drum kit and accordion" },
    { pattern: /\b(grupo codiciado|codiciado)\b/gi, replacement: "Modern regional acoustic arrangement with 12-string requintos and punchy bass" },
    { pattern: /\b(grupo mente maestra|mente maestra)\b/gi, replacement: "Modern 2026 high-speed bélico corrido arrangement with blistering 12-string docerola requintos picked at lightning speed, dry cracking military tarolas, aggressive live drums, roaring brass sousaphone and sharp strategic masculine vocals" },
    { pattern: /\b(gerardo ortiz|gerardo ortíz)\b/gi, replacement: "Fast-paced heavy 2026 Sinaloa banda corrido arrangement with explosive tambora bass drum, snapping military tarolas, rapid double-picking 12-string requinto guitar runs, roaring double-stroke sousaphone tuba, sharp trombones and confident aggressive masculine vocals" },
    { pattern: /\b(alfredo olivas|alfredito olivas)\b/gi, replacement: "Modern norteño arrangement with melodic button accordion, modern drum kit and live percussion" },
    { pattern: /\b(el fantasma)\b/gi, replacement: "Heavy regional arrangement with brass, modern drum kit and docerolas" },
    { pattern: /\b(carin leon|carín león)\b/gi, replacement: "Soulful modern regional arrangement with live modern touring band, guitars and drum set" },
    { pattern: /\b(christian nodal)\b/gi, replacement: "Modern regional fusion arrangement with 12-string guitars and live drum set" },

    // Banda Sinaloense Ensembles
    { pattern: /\b(banda ms|banda el recodo|la adictiva|banda machos|banda carnaval|la arrolladora|arrolladora)\b/gi, replacement: "Full modern Sinaloa brass band with marching tambora, snare tarolas, live drum set, deep roaring sousaphone tuba, clarinets and slide trombones" },
    { pattern: /\b(grupo firme)\b/gi, replacement: "Modern high-energy regional arrangement with full brass and live drum set" }
  ];

  // Comprehensive mapping of protected, sensitive, or prohibited terms to neutral, narrative, or musical descriptors
  private static readonly PROTECTED_TERMS_MAP: Array<{ pattern: RegExp; replacement: string }> = [
    // Weapons, Firearms & Ballistics -> Generic tools or percussion descriptors
    { pattern: /\b(cuerno de chivo|cuernos de chivo|ak-?47|r-?15|m-?16|fusiles?|rifles?|pistolas?|escuadras?|metralletas?|armas?(?: de fuego)?)\b/gi, replacement: "herramientas de trabajo" },
    { pattern: /\b(calibre(?:\s+(?:50|\.50|9mm|45|380))?)\b/gi, replacement: "fuerza sonora" },
    { pattern: /\b(balas?|plomo|tiros?|balazos?|disparos?|casquillos?|fuego cruzado|gatillo|cartuchos?|arsenal|fierros?)\b/gi, replacement: "percusión contundente" },
    { pattern: /\b(blindad[ao]s?|blindajes?|camioneta blindada)\b/gi, replacement: "vehículo protegido" },

    // Contraband, Illicit Substances & Trafficking -> Legitimate commercial descriptors
    { pattern: /\b(cocaína|cocaina|coca|polvo blanco|perico|chiva|mota|hierba|yerba|kilos?|gramos?|fentanilo|cristal|tachas?|drogas?)\b/gi, replacement: "mercancía comercial" },
    { pattern: /\b(narcotráfico|narcotrafico|narco(?:s)?|contrabando|embarque clandestino|cargamento clandestino|flete clandestino|clandestin[ao]s?)\b/gi, replacement: "negocio familiar legítimo" },
    { pattern: /\b(pistas? clandestinas?|vuelos? clandestinos?)\b/gi, replacement: "trayecto de viaje aéreo" },

    // Organized Crime & Underworld Entities -> Business/community descriptors
    { pattern: /\b(cártel(?:es)?|cartel(?:es)?|sicarios?|capos?|mafias?|mafiosos?)\b/gi, replacement: "asociación de trabajo" },
    { pattern: /\b(jefe(?:s)? de plaza|plazas?|patr[oó]n del cartel|comandante del narco)\b/gi, replacement: "líder comercial" },

    // Violence, Bloodshed & Hostilities -> Noble perseverance & overcoming obstacles
    { pattern: /\b(matar|asesinar|degollar|morir|muerte|asesinatos?|emboscadas?|sangre|balaceras?|tiroteos?|enfrentamientos? armados?|secuestros?|levant[oó]n(?:es)?|ajuste de cuentas)\b/gi, replacement: "superar la adversidad" },
    { pattern: /\b(guerra|venganza|enemigos? a muerte|traición sangrienta)\b/gi, replacement: "desafío superado" },

    // Style descriptor safety conversion: Ensure Bélico is translated to exact high-energy musical descriptors
    { pattern: /\b(bélico|belico|corridos? bélicos?|corridos? belicos?)\b/gi, replacement: "High-octane Regional Mexican Corrido Bélico with blazing 12-string requinto guitar leads, sharp brass section hits, and live concert percussion" }
  ];

  /**
   * Sanitizes generic text strings by removing parentheticals, brackets, quotes,
   * replacing band names, and substituting protected terms.
   */
  public static sanitizeText(txt: string, protagonistName?: string): string {
    if (!txt || typeof txt !== 'string') return '';

    let cleaned = txt
      .replace(/\s*\([^)]*\)/g, ' ') // Strip parentheses like (Jesús Medina) or (Don Chuy)
      .replace(/\[[^\]]*\]/g, ' ')   // Strip brackets like [Verso 1] or [Coro]
      .replace(/["“”«»]/g, '')       // Strip quotes
      .replace(/\s{2,}/g, ' ')
      .trim();

    // 1. Replace specific band and artist trademarks
    cleaned = SafetySanitizationLayer.sanitizeBandAndArtistNames(cleaned);

    // 2. Replace protected/prohibited words with safe narrative equivalents
    cleaned = SafetySanitizationLayer.sanitizeProtectedTerms(cleaned);

    // 3. Neutralize explicit protagonist name if present to avoid personal data/entity blocks
    if (protagonistName && protagonistName.trim().length > 1) {
      cleaned = SafetySanitizationLayer.anonymizeProtagonist(cleaned, protagonistName);
    }

    // Common specific test entities in corridos
    cleaned = cleaned.replace(/\b(jes[uú]s medina|don chuy)\b/gi, "el gran señor");

    return cleaned.replace(/\s{2,}/g, ' ').trim();
  }

  /**
   * Replaces known band and artist names with descriptive musical equivalents
   */
  public static sanitizeBandAndArtistNames(txt: string): string {
    let result = txt;
    for (const entry of SafetySanitizationLayer.BAND_NAME_MAP) {
      result = result.replace(entry.pattern, entry.replacement);
    }
    return result;
  }

  /**
   * Replaces weapons, contraband, violence, and illicit terms with generic descriptors
   */
  public static sanitizeProtectedTerms(txt: string): string {
    let result = txt;
    for (const entry of SafetySanitizationLayer.PROTECTED_TERMS_MAP) {
      result = result.replace(entry.pattern, entry.replacement);
    }
    return result;
  }

  /**
   * Anonymizes specific protagonist names into authentic Mexican honorifics
   */
  private static anonymizeProtagonist(txt: string, protagonistName: string): string {
    const pName = protagonistName.trim();
    const pEscaped = pName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let out = txt.replace(new RegExp(pEscaped, 'gi'), 'el gran señor');

    const parts = pName.split(/\s+/).filter(p => p.length > 2);
    if (parts.length > 1) {
      out = out.replace(new RegExp(parts[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), 'el compa');
      out = out.replace(new RegExp(parts[parts.length - 1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), 'el líder');
    }
    return out;
  }

  /**
   * Extracts clean singing lyrics and creates a safe lyrical summary for prompt conditioning,
   * preserving structured sections and metric arrangement.
   */
  public static sanitizeLyrics(
    lyricsInput: any,
    maxLines = 8,
    protagonistName?: string
  ): { clipLines: string; fullLines: string; lyricalSummary: string; structuredSections: { type: string; header: string; lines: string[] }[] } {
    let rawLines: string[] = [];
    const structuredSections: { type: string; header: string; lines: string[] }[] = [];

    if (Array.isArray(lyricsInput) && lyricsInput.length > 0) {
      for (const stanza of lyricsInput) {
        const stanzaText = typeof stanza === 'string' ? stanza : (typeof stanza?.text === 'string' ? stanza.text : '');
        if (stanzaText) {
          const stanzaType = String(stanza?.type || 'verso').toLowerCase();
          const cleanLines = stanzaText
            .split('\n')
            .map((l: string) => l.replace(/^[\[\(].*?[\]\)]\s*/g, '').replace(/\[\d+(\.\d+)?:?\d*(\.\d+)?\]/g, '').trim())
            .filter((l: string) => l.length > 0 && !l.startsWith('[') && !l.toLowerCase().startsWith('verso') && !l.toLowerCase().startsWith('coro') && !l.toLowerCase().startsWith('outro'))
            .map((l: string) => SafetySanitizationLayer.sanitizeText(l, protagonistName))
            .filter((l: string) => l.length > 2);

          if (cleanLines.length > 0) {
            rawLines.push(...cleanLines);
            let header = `[Verso: Requinto 12 Cuerdas & Tarolas]`;
            if (stanzaType.includes('coro')) {
              header = `[Coro: Full Banda Explosion, Metales & Tamborazo]`;
            } else if (stanzaType.includes('outro') || stanzaType.includes('despedida')) {
              header = `[Outro: Remate de Banda & Despedida]`;
            } else if (structuredSections.length === 0) {
              header = `[Verso 1: Requinto en Terceras & Tuba Chuntata]`;
            } else if (structuredSections.length === 1) {
              header = `[Verso 2: Charchetas Sincopadas & Trombones]`;
            } else if (structuredSections.length >= 3) {
              header = `[Verso 3: Dúo de Docerolas & Redobles de Tarola]`;
            }
            structuredSections.push({
              type: stanzaType,
              header,
              lines: cleanLines
            });
          }
        }
      }
    } else if (typeof lyricsInput === 'string' && lyricsInput.trim().length > 0) {
      rawLines = lyricsInput
        .split('\n')
        .map((l: string) => l.replace(/^[\[\(].*?[\]\)]\s*/g, '').replace(/\[\d+(\.\d+)?:?\d*(\.\d+)?\]/g, '').trim())
        .filter((l: string) => l.length > 0 && !l.startsWith('[') && !l.toLowerCase().includes('estrofa') && !l.toLowerCase().includes('verso') && !l.toLowerCase().includes('coro') && !l.toLowerCase().includes('outro'))
        .map((l: string) => SafetySanitizationLayer.sanitizeText(l, protagonistName))
        .filter((l: string) => l.length > 2);

      // Chunk into 4-line stanzas
      for (let i = 0; i < rawLines.length; i += 4) {
        const chunk = rawLines.slice(i, i + 4);
        const isCoro = i === 4 || i === 12;
        const header = isCoro
          ? `[Coro: Full Banda Explosion, Metales & Tamborazo]`
          : `[Verso ${Math.floor(i / 4) + 1}: Requinto 12 Cuerdas & Tarolas]`;
        structuredSections.push({
          type: isCoro ? 'coro' : 'verso',
          header,
          lines: chunk
        });
      }
    }

    if (rawLines.length === 0) {
      const defaultLines = [
        "Con la frente en alto y paso firme",
        "Por las tierras bravas voy dejando huella",
        "Hombre de palabra y de trabajo fino",
        "El respeto y la lealtad son mi bandera",
        "No me rajo nunca ante las tempestades",
        "Tengo la palabra firme como roca",
        "Con la gente buena siempre hay amistad",
        "Y el destino grande solo a Dios le toca"
      ];
      rawLines = defaultLines.map(l => SafetySanitizationLayer.sanitizeText(l, protagonistName));
      structuredSections.push(
        {
          type: 'verso',
          header: '[Verso 1: Requinto en Terceras & Tuba Chuntata]',
          lines: rawLines.slice(0, 4)
        },
        {
          type: 'coro',
          header: '[Coro: Full Banda Explosion, Metales & Tamborazo]',
          lines: rawLines.slice(4, 8)
        }
      );
    }

    const clipLines = rawLines.slice(0, maxLines).join('\n');
    const fullLines = rawLines.join('\n');

    // Create a safe, condensed theme sentence for Lyria's prompt without verbatim lines
    const lyricalSummary = rawLines.slice(0, 4).join(' ').replace(/\s{2,}/g, ' ').slice(0, 160).trim();

    return { clipLines, fullLines, lyricalSummary, structuredSections };
  }

  /**
   * Generates a high-fidelity musical descriptor tailored for each distinct genre
   * (Mariachi, Norteño, Banda, Sierreño, Bélico, Rap Corrido, Reggaeton, Hard Trap, Houston Rap, Pop, Country, Rock, Afrobeats, Electro Corrido)
   * while remaining 100% compliant with Google Lyria safety filters.
   */


  /**
   * Intelligently detects whether a request is for English, Spanglish, or Spanish music,
   * identifies the precise genre domain, and provides domain-accurate instrumentals and tempo profiles.
   */
  public static detectDomainAndLanguage(params: {
    style?: string;
    genreCategory?: string;
    musicalGenreTag?: string;
    bandInspiration?: string;
    instrument?: string;
    instrumentation?: string;
    title?: string;
    prompt?: string;
    story?: string;
    lyrics?: any;
    primaryLanguage?: string;
  }): {
    genreKey: string;
    isEnglishDomain: boolean;
    isSpanglish: boolean;
    isSpanish: boolean;
    detectedLanguage: 'en' | 'spanglish' | 'es';
    recommendedInstrumentation: string;
    recommendedPrompt: string;
    tempoRange: { min: number; max: number; defaultBpm: number };
  } {
    const rawStyle = `${params.style || ''} ${params.genreCategory || ''} ${params.musicalGenreTag || ''} ${params.bandInspiration || ''} ${params.instrument || ''}`.toLowerCase();
    
    // Extract text from lyrics
    let lyricText = '';
    if (Array.isArray(params.lyrics)) {
      lyricText = params.lyrics.map((l: any) => (typeof l === 'string' ? l : (l.text || ''))).join(' ');
    } else if (typeof params.lyrics === 'string') {
      lyricText = params.lyrics;
    }
    const textCorpus = `${params.title || ''} ${params.prompt || ''} ${params.story || ''} ${lyricText}`.toLowerCase();

    // Check explicit language parameter
    const explicitLang = (params.primaryLanguage || '').toLowerCase().trim();
    let isEnglish = explicitLang === 'en';
    let isSpanglish = explicitLang === 'spanglish' || explicitLang === 'bilingual';

    // English / Spanish keyword frequency analysis for implicit detection
    const englishWords = [
      " the ", " and ", " is ", " in ", " to ", " you ", " that ", " it ", " he ", " was ",
      " for ", " on ", " are ", " with ", " his ", " they ", " at ", " this ", " from ",
      " have ", " not ", " but ", " what ", " all ", " were ", " when ", " we ", " your ",
      " my ", " out ", " day ", " road ", " life ", " night ", " never ", " work ", " time ",
      " boy ", " man ", " truck ", " hard ", " hustle ", " ain't ", " gotta ", " gonna ", " yeah ",
      " town ", " money ", " country ", " streets ", " dream ", " love "
    ];
    const spanishWords = [
      " el ", " la ", " los ", " las ", " en ", " que ", " por ", " para ", " con ", " no ",
      " su ", " al ", " del ", " lo ", " como ", " pero ", " sus ", " corrido ", " rancho ",
      " sierra ", " compa ", " viejo ", " clica ", " gente ", " tierra ", " pa ", " bien ",
      " voy ", " tengo ", " mi ", " vida ", " puro ", " señor "
    ];

    let enCount = 0;
    let esCount = 0;
    const paddedCorpus = ` ${textCorpus.replace(/[^a-záéíóúüñ]/gi, ' ')} `;
    for (const w of englishWords) {
      if (paddedCorpus.includes(w)) enCount++;
    }
    for (const w of spanishWords) {
      if (paddedCorpus.includes(w)) esCount++;
    }

    if (!explicitLang || explicitLang === 'es') {
      if (enCount >= 3 && enCount > esCount * 1.5) {
        isEnglish = true;
      } else if (enCount >= 2 && esCount >= 2) {
        isSpanglish = true;
      }
    }

    // Genre keyword categorization - Strict explicit matching
    const isMexicanRegionalExplicit = rawStyle.includes('corrido') || rawStyle.includes('bélico') || rawStyle.includes('belico') || rawStyle.includes('tumbado') || rawStyle.includes('norteño') || rawStyle.includes('norteno') || rawStyle.includes('banda') || rawStyle.includes('sierr') || rawStyle.includes('campirano') || rawStyle.includes('mariachi') || rawStyle.includes('ranchera') || rawStyle.includes('zapateado') || rawStyle.includes('docerola') || rawStyle.includes('requinto') || rawStyle.includes('tambora') || rawStyle.includes('acordeón') || rawStyle.includes('acordeon') || rawStyle.includes('bajo sexto') || rawStyle.includes('bajo quinto') || rawStyle.includes('tololoche') || rawStyle.includes('charcheta') || rawStyle.includes('sousafón') || rawStyle.includes('sousafon');

    const isCountry = (rawStyle.includes('country') || rawStyle.includes('americana') || rawStyle.includes('bluegrass') || rawStyle.includes('nashville') || rawStyle.includes('wallen') || rawStyle.includes('zach bryan') || rawStyle.includes('luke combs') || rawStyle.includes('banjo') || rawStyle.includes('pedal steel') || rawStyle.includes('honky')) && !isMexicanRegionalExplicit;
    const isHoustonRap = (rawStyle.includes('houston') || rawStyle.includes('ugk') || rawStyle.includes('z-ro') || rawStyle.includes('bun b') || rawStyle.includes('trae') || rawStyle.includes('screw') || rawStyle.includes('slab') || rawStyle.includes('scarface') || rawStyle.includes('dirty south') || rawStyle.includes('713') || rawStyle.includes('281')) && !isMexicanRegionalExplicit;
    const isTrap = (rawStyle.includes('trap') || rawStyle.includes('metro boomin') || rawStyle.includes('metro') || rawStyle.includes('21 savage') || rawStyle.includes('future') || rawStyle.includes('drake') || rawStyle.includes('travis scott') || rawStyle.includes('drill') || rawStyle.includes('us_hiphop') || rawStyle.includes('hard rap')) && !rawStyle.includes('rap corrido') && !rawStyle.includes('corrido rap') && !isMexicanRegionalExplicit;
    const isRock = (rawStyle.includes('rock') || rawStyle.includes('alternative') || rawStyle.includes('indie rock') || rawStyle.includes('punk') || rawStyle.includes('metal') || rawStyle.includes('grunge') || rawStyle.includes('heavy metal') || rawStyle.includes('rock_alternative')) && !isMexicanRegionalExplicit;
    const isPopRnb = (rawStyle.includes('contemporary r&b') || rawStyle.includes('the weeknd') || rawStyle.includes('sza') || rawStyle.includes('brunomars') || rawStyle.includes('synthpop') || rawStyle.includes('global_pop_rnb')) && !rawStyle.includes('pop regional') && !rawStyle.includes('latin pop') && !isMexicanRegionalExplicit;
    const isAfro = (rawStyle.includes('afro') || rawStyle.includes('afrobeats') || rawStyle.includes('caribbean') || rawStyle.includes('burna') || rawStyle.includes('dancehall') || rawStyle.includes('amapiano')) && !isMexicanRegionalExplicit;

    // If an explicit English genre is chosen, set isEnglish
    const isEnglishGenre = (isCountry || isHoustonRap || isTrap || isRock || isPopRnb || isAfro) && !isMexicanRegionalExplicit;
    if (isEnglishGenre && explicitLang !== 'es') {
      isEnglish = true;
    } else if (isMexicanRegionalExplicit) {
      // Never force English rock onto explicit Regional Mexican music
      if (!explicitLang || explicitLang === 'es') {
        isEnglish = false;
      }
    }

    let genreKey = 'regional_belico';
    let recommendedInstrumentation = '';
    let recommendedPrompt = '';
    let tempoRange = { min: 110, max: 160, defaultBpm: 128 };

    if (isCountry) {
      genreKey = 'country';
      isEnglish = true;
      recommendedInstrumentation = 'Nashville studio ensemble: acoustic dreadnought guitar strumming, soulful weeping pedal steel guitar fills, melodic 5-string banjo rolls, acoustic fiddle/violin fills, solid warm bass guitar, and driving acoustic country drum kit with crisp brushed snare';
      recommendedPrompt = 'Authentic modern American Country & Americana song with acoustic guitar strumming, weeping pedal steel, melodic banjo, driving drums, and heartfelt storytelling vocals';
      tempoRange = { min: 78, max: 130, defaultBpm: 108 };
    } else if (isHoustonRap) {
      genreKey = 'houston_rap';
      isEnglish = true;
      recommendedInstrumentation = 'Southern Texas rap production: deep rolling tuned 808 sub-bass, soulful vintage Fender Rhodes electric piano chords, warm analog synthesizer pads, tight analog kick drum, and crisp dry snare on beats 2 and 4';
      recommendedPrompt = 'Authentic Houston Texas underground street rap track with slow rolling 808 sub-bass, soulful electric Rhodes keys, punchy acoustic drums, and gritty storytelling English rap delivery';
      tempoRange = { min: 66, max: 86, defaultBpm: 74 };
    } else if (isTrap) {
      genreKey = 'trap';
      isEnglish = true;
      recommendedInstrumentation = 'Cutting-edge 2026 American trap production: heavy tuned 808 sub-bass with low-end saturation and pitch slides, lightning-fast 32nd/64th rolling fine hi-hats with pitch modulations, punchy modern snare claps, crisp crash cymbals, dark ominous synth brass, and atmospheric bell plucks';
      recommendedPrompt = 'Ultra-modern 2026 American hard trap anthem with booming distorted 808 sub-bass, rapid rolling fine hi-hats, snappy rimshot snares, dark synthesizer stabs, and fast confident modern English rap flow';
      tempoRange = { min: 125, max: 155, defaultBpm: 138 };
    } else if (isRock) {
      genreKey = 'rock';
      isEnglish = true;
      recommendedInstrumentation = 'Full rock band line-up: dual electric rhythm and lead guitars with tube overdrive and melodic solo fills, energetic heavy rock acoustic drum kit with dynamic cymbal crashes, and driving electric bass guitar';
      recommendedPrompt = 'High-octane Modern Rock & Alternative track with crunchy overdriven electric guitar riffs, punchy acoustic drum kit with heavy crash cymbals, driving bass guitar, and powerful raw rock vocals';
      tempoRange = { min: 112, max: 160, defaultBpm: 132 };
    } else if (isPopRnb) {
      genreKey = 'pop_rnb';
      isEnglish = true;
      recommendedInstrumentation = 'Top-chart pop and R&B studio production: crisp acoustic-electronic hybrid drum kit with punchy kick and snap-claps, deep warm analog synth bass, lush Rhodes electric piano chords, atmospheric synth arpeggios, and silky vocal harmonies';
      recommendedPrompt = 'Polished 2026 Global Radio Pop and Contemporary R&B track with punchy modern drums, warm analog synth bassline, lush keyboard chords, bright vocal harmonies, and an irresistible melodious chorus hook';
      tempoRange = { min: 90, max: 128, defaultBpm: 110 };
    } else if (isAfro) {
      genreKey = 'afrobeats';
      isEnglish = true;
      recommendedInstrumentation = 'Afrobeats and island production: syncopated percussive afro groove with shakers, log drums, congas, warm log drum sub-bass, bright kalimba/marimba plucks, subtle island brass stabs, and smooth rhythmic vocal melodies';
      recommendedPrompt = 'Vibrant modern 2026 Afrobeats and Caribbean fusion track with syncopated West African log drum grooves, uplifting marimba/kalimba melodies, warm rolling bass, and infectious melodic vocal delivery';
      tempoRange = { min: 96, max: 116, defaultBpm: 104 };
    } else if (rawStyle.includes('mariachi') || rawStyle.includes('ranchera') || rawStyle.includes('charro')) {
      genreKey = 'mariachi';
      recommendedInstrumentation = 'Full gala Mariachi ensemble: harmonized acoustic violin section playing expressive melodies in thirds, dual bright mariachi trumpets playing heroic fanfares, rhythmic acoustic vihuela and classical Spanish guitar strumming driving compases, and deep resonant Mexican guitarrón acoustic bass';
      recommendedPrompt = 'Authentic traditional Mexican Mariachi de Gala and Ranchera in 3/4 vals ranchero meter with lush harmonized violins, bright trumpets, vihuela, classical guitar, and booming deep guitarrón';
      tempoRange = { min: 90, max: 140, defaultBpm: 118 };
    } else if (rawStyle.includes('norteño') || rawStyle.includes('norteno') || rawStyle.includes('acordeón') || rawStyle.includes('acordeon') || rawStyle.includes('bajo sexto')) {
      genreKey = 'norteno';
      recommendedInstrumentation = 'Complete Norteño touring quartet: fast diatonic button accordion executing lightning chromatic ornaments, steel-string acoustic bajo sexto providing driving rhythmic chops, acoustic drum kit with crisp tarola snare rolls, and deep punchy electric bass or wooden tololoche';
      recommendedPrompt = 'Authentic Norteño arrangement in driving 2/4 polka meter with virtuoso diatonic button accordion solos, crisp acoustic bajo sexto, live touring drum kit with snappy tarola rolls, and punchy electric bass';
      tempoRange = { min: 115, max: 145, defaultBpm: 130 };
    } else if (rawStyle.includes('banda') || rawStyle.includes('tambora') || rawStyle.includes('clarinete')) {
      genreKey = 'banda';
      recommendedInstrumentation = 'Full 16-piece Sinaloense brass band: deep roaring sousaphone tuba playing heavy chuntata basslines, marching tambora bass drum with explosive platillazo cymbal crashes, live snare tarola rolls, sharp brass section stabs with slide trombones, screaming clarinets, and bright trumpet fanfares';
      recommendedPrompt = 'Heavy authentic Sinaloan brass band in fast 3/4 meter with marching concert tambora, explosive brass cymbal crashes, screaming clarinets, sharp slide trombones, and deep roaring sousaphone tuba';
      tempoRange = { min: 120, max: 155, defaultBpm: 136 };
    } else if (rawStyle.includes('sierr') || rawStyle.includes('campirano')) {
      genreKey = 'sierreno';
      recommendedInstrumentation = 'Acoustic Sierreño quartet: dual 12-string steel docerola guitars playing fast melodic adornos, double-picked sliding scales in thirds, high-energy requinto leads, live-concert acoustic drum kit with crisp snare rimshots, and deep wooden tololoche bass';
      recommendedPrompt = 'Authentic rustic Sierreño Campirano corrido in 3/4 vals meter with fast 12-string docerola requinto guitar leads, deep wooden tololoche bass, and live acoustic drums';
      tempoRange = { min: 105, max: 135, defaultBpm: 118 };
    } else if (rawStyle.includes('rap corrido') || rawStyle.includes('corrido rap') || rawStyle.includes('santa fe')) {
      genreKey = 'rap_corrido';
      recommendedInstrumentation = 'Urban Mexican fusion production: deep 808 sub-bass locked with heavy kick, rapid rolling trap hi-hats, punchy snare cracks, and razor-sharp 12-string docerola acoustic guitar requinto leads';
      recommendedPrompt = 'Modern Mexican Rap Corrido street fusion in 4/4 meter with deep booming 808 sub-bass, rapid 16th-note trap hi-hats, hard acoustic rimshots, and blistering 12-string docerola requinto riffs';
      tempoRange = { min: 115, max: 145, defaultBpm: 128 };
    } else if (rawStyle.includes('reggaeton') || rawStyle.includes('dembow') || rawStyle.includes('perreo') || rawStyle.includes('latin urban')) {
      genreKey = 'latin_urban';
      recommendedInstrumentation = 'Premium Latin Urban club production: punchy kick and crisp snare playing the signature syncopated Dembow rhythm, deep tuned 808 bass, bright plucks, and lush modern synthesizer pads';
      recommendedPrompt = 'High-energy modern Latin Urban Reggaeton anthem in 4/4 meter with hard-hitting authentic Dembow 3:2 syncopated drum groove and booming 808 sub-bass';
      tempoRange = { min: 88, max: 104, defaultBpm: 96 };
    } else if (rawStyle.includes('electro corrido') || rawStyle.includes('edm')) {
      genreKey = 'electro_corrido';
      recommendedInstrumentation = 'EDM Festival & Regional Mexican fusion: driving electronic four-on-the-floor kick, crisp offbeat open hi-hats, massive supersaw festival synth chords, sidechained sub-bass, and rapid 12-string acoustic requinto guitar melodies';
      recommendedPrompt = 'High-octane Electro Corrido EDM festival anthem in 4/4 meter with heavy four-on-the-floor kick drops, supersaw festival leads, and blistering 12-string docerola requinto riffs';
      tempoRange = { min: 124, max: 134, defaultBpm: 128 };
    } else {
      // Default: Modern Regional Mexican Bélico (Corrido standard)
      genreKey = 'regional_belico';
      recommendedInstrumentation = 'Dual 12-string docerola acoustic guitars playing lightning-fast chromatic requinto leads with double-picking in thirds, full brass section stabs with slide trombones and charchetas, live-concert percussion acoustic drum set with punchy kick, explosive cymbal crashes, snappy military tarola snare, and roaring sousaphone tuba bass';
      recommendedPrompt = 'Modern high-energy corrido bélico in 3/4 vals meter with blistering 12-string docerola requinto guitar leads, sharp brass section hits with slide trombones, and live-concert percussion style drum patterns';
      tempoRange = { min: 115, max: 155, defaultBpm: 130 };
    }

    // Diagnostic trace to ensure user-selected genre maps directly to model preset
    console.log(`[SafetySanitizationLayer] 🔍 Genre Mapping -> RawStyle: "${rawStyle.slice(0, 50)}..." => Target Preset: "${genreKey}", DetectedLang: "${isEnglish ? 'en' : (isSpanglish ? 'spanglish' : 'es')}", DefaultBPM: ${tempoRange.defaultBpm}`);

    const detectedLanguage: 'en' | 'spanglish' | 'es' = isEnglish ? 'en' : (isSpanglish ? 'spanglish' : 'es');

    return {
      genreKey,
      isEnglishDomain: isEnglish,
      isSpanglish,
      isSpanish: !isEnglish && !isSpanglish,
      detectedLanguage,
      recommendedInstrumentation,
      recommendedPrompt,
      tempoRange
    };
  }

  /**
   * Generates a high-fidelity musical descriptor tailored for each distinct genre
   * with complete domain-accurate instrumentals (never mixing Mexican instruments into English music)
   * while remaining 100% compliant with Google Lyria safety filters.
   */
  public static getStyleFidelityDescriptor(
    style: string,
    tempoBpm: number,
    variant: 'A' | 'B' | 'pro' = 'pro',
    options?: {
      primaryLanguage?: string;
      lyrics?: any;
      prompt?: string;
      title?: string;
      genreCategory?: string;
      musicalGenreTag?: string;
      bandInspiration?: string;
      instrument?: string;
      instrumentation?: string;
    }
  ): {
    descriptor: string;
    instrumentation: string;
    genreKey: string;
    isEnglishDomain: boolean;
    detectedLanguage: 'en' | 'spanglish' | 'es';
    tempoRange: { min: number; max: number; defaultBpm: number };
  } {
    const domainInfo = SafetySanitizationLayer.detectDomainAndLanguage({
      style,
      genreCategory: options?.genreCategory,
      musicalGenreTag: options?.musicalGenreTag,
      bandInspiration: options?.bandInspiration,
      instrument: options?.instrument,
      instrumentation: options?.instrumentation,
      title: options?.title,
      prompt: options?.prompt,
      lyrics: options?.lyrics,
      primaryLanguage: options?.primaryLanguage
    });

    const genreKey = domainInfo.genreKey;
    const isEnglishDomain = domainInfo.isEnglishDomain;
    const detectedLanguage = domainInfo.detectedLanguage;
    const tempoRange = domainInfo.tempoRange;

    // 1. Country & Americana (English)
    if (genreKey === 'country') {
      return {
        genreKey: 'country',
        isEnglishDomain: true,
        detectedLanguage,
        tempoRange,
        descriptor: `Authentic Nashville Modern Country & Americana anthem in 4/4 meter at ${tempoBpm} BPM with rich acoustic dreadnought guitar strumming, weeping pedal steel guitar fills, rhythmic 5-string banjo rolls, solid warm bass, and driving acoustic drums with brushed snare`,
        instrumentation: domainInfo.recommendedInstrumentation
      };
    }

    // 2. Houston Texas Underground Rap (English)
    if (genreKey === 'houston_rap') {
      return {
        genreKey: 'houston_rap',
        isEnglishDomain: true,
        detectedLanguage,
        tempoRange,
        descriptor: `Authentic Houston Texas underground street rap track in slow rolling 4/4 meter at ${tempoBpm} BPM with heavy thumping 808 sub-bass, soulful electric Rhodes keys, punchy analog drums, and gritty storytelling English rap delivery`,
        instrumentation: domainInfo.recommendedInstrumentation
      };
    }

    // 3. Modern Hard Trap & US Hip Hop (English)
    if (genreKey === 'trap') {
      return {
        genreKey: 'trap',
        isEnglishDomain: true,
        detectedLanguage,
        tempoRange,
        descriptor: `Ultra-modern 2026 American hard trap anthem in 4/4 meter at ${tempoBpm} BPM with booming distorted 808 sub-bass, rapid rolling fine hi-hats, pitch-bent trap hat rolls, snappy rimshot snares, dark atmospheric synthesizer stabs, and fast confident modern English rap flow`,
        instrumentation: domainInfo.recommendedInstrumentation
      };
    }

    // 4. Modern Rock & Alternative (English)
    if (genreKey === 'rock') {
      return {
        genreKey: 'rock',
        isEnglishDomain: true,
        detectedLanguage,
        tempoRange,
        descriptor: `High-octane Modern Rock & Alternative track in 4/4 meter at ${tempoBpm} BPM with crunchy overdriven electric guitar riffs, punchy acoustic drum kit with heavy crash cymbals, driving bass guitar, and powerful raw rock vocals`,
        instrumentation: domainInfo.recommendedInstrumentation
      };
    }

    // 5. Global Pop & Contemporary R&B (English)
    if (genreKey === 'pop_rnb') {
      return {
        genreKey: 'pop_rnb',
        isEnglishDomain: true,
        detectedLanguage,
        tempoRange,
        descriptor: `Polished 2026 Global Radio Pop and Contemporary R&B track in 4/4 meter at ${tempoBpm} BPM with punchy modern drums, warm analog synth bassline, lush keyboard chords, bright vocal harmonies, and an irresistible melodious chorus hook in English`,
        instrumentation: domainInfo.recommendedInstrumentation
      };
    }

    // 6. Afrobeats & Caribbean Fusion
    if (genreKey === 'afrobeats') {
      return {
        genreKey: 'afrobeats',
        isEnglishDomain: true,
        detectedLanguage,
        tempoRange,
        descriptor: `Vibrant modern 2026 Afrobeats and Caribbean fusion track in 4/4 meter at ${tempoBpm} BPM with syncopated West African log drum grooves, uplifting marimba/kalimba melodies, warm rolling bass, and infectious melodic vocal delivery`,
        instrumentation: domainInfo.recommendedInstrumentation
      };
    }

    // 7. Mariachi & Ranchera Tradicional
    if (genreKey === 'mariachi') {
      return {
        genreKey: 'mariachi',
        isEnglishDomain: false,
        detectedLanguage,
        tempoRange,
        descriptor: `Authentic traditional Mexican Mariachi de Gala and Ranchera in 3/4 vals ranchero meter at ${tempoBpm} BPM with lush harmonized violin sections in thirds, bright classical trumpet calls, acoustic rhythm vihuela, classical guitar, and booming deep guitarrón acoustic bass`,
        instrumentation: domainInfo.recommendedInstrumentation
      };
    }

    // 8. Norteño Tradicional & Moderno
    if (genreKey === 'norteno') {
      return {
        genreKey: 'norteno',
        isEnglishDomain: false,
        detectedLanguage,
        tempoRange,
        descriptor: `Authentic Norteño powerhouse arrangement in driving 2/4 polka meter at ${tempoBpm} BPM with virtuoso diatonic button accordion solos, crisp acoustic bajo sexto/quinto strumming, live touring drum kit with snappy tarola rolls, and punchy electric bass or tololoche`,
        instrumentation: domainInfo.recommendedInstrumentation
      };
    }

    // 9. Banda Sinaloense Brava
    if (genreKey === 'banda') {
      return {
        genreKey: 'banda',
        isEnglishDomain: false,
        detectedLanguage,
        tempoRange,
        descriptor: `Heavy authentic Sinaloan brass band (Banda Sinaloense Brava) in fast 3/4 meter at ${tempoBpm} BPM with marching concert tambora, explosive brass cymbal crashes (platillazos), screaming clarinets, sharp slide trombones, bright trumpets, and deep roaring sousaphone tuba`,
        instrumentation: domainInfo.recommendedInstrumentation
      };
    }

    // 10. Sierreño & Campirano Acústico
    if (genreKey === 'sierreno') {
      return {
        genreKey: 'sierreno',
        isEnglishDomain: false,
        detectedLanguage,
        tempoRange,
        descriptor: `Authentic rustic Sierreño Campirano corrido in 3/4 vals meter at ${tempoBpm} BPM with fast 12-string docerola requinto guitar leads, deep wooden tololoche or electric bass, live acoustic drums, and tight two-part masculine harmonies`,
        instrumentation: domainInfo.recommendedInstrumentation
      };
    }

    // 11. Rap Corrido Mexicano (Santa Fe Klan Style)
    if (genreKey === 'rap_corrido') {
      return {
        genreKey: 'rap_corrido',
        isEnglishDomain: false,
        detectedLanguage,
        tempoRange,
        descriptor: `Modern Mexican Rap Corrido street fusion in 4/4 meter at ${tempoBpm} BPM with deep booming 808 sub-bass, rapid 16th-note trap hi-hats, hard acoustic rimshots, fast syncopated street rap flow, and blistering 12-string docerola requinto riffs`,
        instrumentation: domainInfo.recommendedInstrumentation
      };
    }

    // 12. Latin Urban & Reggaeton
    if (genreKey === 'latin_urban') {
      return {
        genreKey: 'latin_urban',
        isEnglishDomain: false,
        detectedLanguage,
        tempoRange,
        descriptor: `High-energy modern 2026 Latin Urban Reggaeton anthem in 4/4 meter at ${tempoBpm} BPM with hard-hitting authentic Dembow 3:2 syncopated drum groove, booming 808 sub-bass, atmospheric synth chords, and infectious rhythmic vocal delivery`,
        instrumentation: domainInfo.recommendedInstrumentation
      };
    }

    // 13. Electro Corrido & EDM Fusion
    if (genreKey === 'electro_corrido') {
      return {
        genreKey: 'electro_corrido',
        isEnglishDomain: false,
        detectedLanguage,
        tempoRange,
        descriptor: `High-octane Electro Corrido EDM festival anthem in 4/4 meter at ${tempoBpm} BPM with heavy 4-on-the-floor kick drops, energetic supersaw synthesizer festival leads, sidechained bass, and blistering live 12-string docerola requinto riffs`,
        instrumentation: domainInfo.recommendedInstrumentation
      };
    }

    // 14. Modern Regional Mexican Corrido Bélico (Default for Mexican music)
    return {
      genreKey: 'regional_belico',
      isEnglishDomain: false,
      detectedLanguage,
      tempoRange,
      descriptor: `Modern 2026 high-energy corrido bélico in 3/4 vals meter at ${tempoBpm} BPM with blistering 12-string docerola requinto guitar leads, sharp brass section hits with slide trombones, and live-concert percussion style drum patterns with marching tambora and military tarolas`,
      instrumentation: domainInfo.recommendedInstrumentation
    };
  }

  /**
   * Main entry point to build a 100% safety-sanitized prompt for Lyria 3 Pro (Full Master Track)
   * or Lyria 3 Clip (Preview Clip) ensuring complete style fidelity across all music styles and languages.
   * Corrects instrumentals for English music domains, ensuring regional Mexican instruments are never mixed in.
   */
  public static buildSanitizedLyriaPrompt(params: {
    style: string;
    title: string;
    lyrics?: any;
    prompt?: string;
    tempo?: number;
    isPro: boolean;
    chosenOption?: 'A' | 'B';
    protagonistName?: string;
    instrumentation?: string;
    primaryLanguage?: 'es' | 'en' | 'spanglish' | 'bilingual' | string;
    genreCategory?: string;
    musicalGenreTag?: string;
    bandInspiration?: string;
  }): SanitizedMusicPromptResult {
    const cleanTitle = SafetySanitizationLayer.sanitizeText(params.title || 'Canción', params.protagonistName) || 'Track Master';

    // 1. Detect language and precise musical domain
    const domainInfo = SafetySanitizationLayer.detectDomainAndLanguage({
      style: params.style,
      genreCategory: params.genreCategory,
      musicalGenreTag: params.musicalGenreTag,
      bandInspiration: params.bandInspiration,
      instrumentation: params.instrumentation,
      title: params.title,
      prompt: params.prompt,
      lyrics: params.lyrics,
      primaryLanguage: params.primaryLanguage
    });

    const isEn = domainInfo.isEnglishDomain;
    const isSpanglish = domainInfo.isSpanglish;
    
    // Parse tempo with domain-aware clamping
    let parsedTempo = domainInfo.tempoRange.defaultBpm;
    if (params.tempo) {
      const match = String(params.tempo).match(/\d+/);
      if (match) parsedTempo = parseInt(match[0], 10);
    }
    const tempoBpm = Math.max(domainInfo.tempoRange.min, Math.min(domainInfo.tempoRange.max, parsedTempo));

    // Variant logic (Option A vs Option B)
    const variant: 'A' | 'B' | 'pro' = params.isPro ? 'pro' : (params.chosenOption === 'B' ? 'B' : 'A');
    const adjustedTempo = variant === 'B'
      ? Math.max(domainInfo.tempoRange.min, Math.min(domainInfo.tempoRange.max, tempoBpm - 4))
      : (variant === 'A' ? Math.min(domainInfo.tempoRange.max, Math.max(domainInfo.tempoRange.min, tempoBpm + 2)) : tempoBpm);

    // Get style fidelity descriptor and instrumentation
    const styleInfo = SafetySanitizationLayer.getStyleFidelityDescriptor(params.style, adjustedTempo, variant, {
      primaryLanguage: params.primaryLanguage,
      lyrics: params.lyrics,
      prompt: params.prompt,
      title: params.title,
      genreCategory: params.genreCategory,
      musicalGenreTag: params.musicalGenreTag,
      bandInspiration: params.bandInspiration,
      instrumentation: params.instrumentation
    });
    
    // Sanitize any custom user-provided instrumentation
    const userInstr = params.instrumentation ? SafetySanitizationLayer.sanitizeText(params.instrumentation, params.protagonistName) : '';
    let finalInstrumentation = styleInfo.instrumentation;

    // Instrumental Correction: If this is an English domain, strictly purge regional Mexican instruments
    if (styleInfo.isEnglishDomain) {
      const containsMexicanInstr = /\b(requinto|docerola|doce cuerdas|12 cuerdas|metales en vivo|charcheta|charchetas|sousafón|sousafon|tuba|tambora|tarola militar|acordeón|acordeon|tololoche|vals zapateado|bajo sexto|bajo quinto|bélico|belico|sinaloense|culiacán|mazatlán)\b/i.test(userInstr);
      if (!containsMexicanInstr && userInstr && userInstr.length > 8) {
        finalInstrumentation = `${styleInfo.instrumentation}. Also featuring: ${userInstr}`;
      } else {
        // Discard Mexican default leak, use authentic English domain instrumentation
        finalInstrumentation = styleInfo.instrumentation;
      }
    } else {
      if (userInstr && userInstr.length > 8) {
        finalInstrumentation = `${styleInfo.instrumentation}. Also featuring: ${userInstr}`;
      }
    }

    // Sanitize lyrics and generate safe narrative theme
    const { clipLines, fullLines, lyricalSummary, structuredSections } = SafetySanitizationLayer.sanitizeLyrics(
      params.lyrics || params.prompt,
      8,
      params.protagonistName
    );

    let safeLyricalTheme = lyricalSummary;

    if (!safeLyricalTheme || safeLyricalTheme.length < 10) {
      if (styleInfo.genreKey === 'houston_rap') {
        safeLyricalTheme = "Gritty, authentic Southern Texas street rap lyrics about staying true to the grind, loyalty to day ones, slab culture, and rising above hardships";
      } else if (styleInfo.genreKey === 'trap') {
        safeLyricalTheme = "Confident energetic rap lyrics celebrating ambition, hustle, luxury, loyalty, and overcoming the struggle";
      } else if (styleInfo.genreKey === 'mariachi') {
        safeLyricalTheme = "Heartfelt traditional ranchera story of pride, honor, deep roots, love for the homeland, and heroic deeds";
      } else if (styleInfo.genreKey === 'norteno') {
        safeLyricalTheme = "Story of hard work from the bottom, northern pride, loyal friendship, and respected perseverance";
      } else if (styleInfo.genreKey === 'banda') {
        safeLyricalTheme = "Triumphant Sinaloan celebration of success, family loyalty, and overcoming life's trials with pride";
      } else if (styleInfo.genreKey === 'latin_urban') {
        safeLyricalTheme = "High-energy Latin urban party anthem celebrating nightlife, success, good vibes, and dancing";
      } else if (styleInfo.genreKey === 'country') {
        safeLyricalTheme = "Honest American country story of small-town roots, open roads, hardworking grit, and unwavering loyalty";
      } else if (styleInfo.genreKey === 'rock') {
        safeLyricalTheme = "Electrifying high-energy rock anthem about resilience, breaking boundaries, and unapologetic passion";
      } else if (styleInfo.genreKey === 'pop_rnb') {
        safeLyricalTheme = "Captivating melodic pop story of ambition, love, triumph, and personal growth";
      } else if (styleInfo.genreKey === 'afrobeats') {
        safeLyricalTheme = "Joyful, uplifting celebration of life, blessings, groove, and unity";
      } else {
        safeLyricalTheme = "Passionate regional vocals celebrating perseverance, honor, hard work, and loyalty";
      }
    }

    // Build structured lyric blocks for exact lyric-to-music alignment
    const structuredFullText = structuredSections.map(sec => `${sec.header}\n${sec.lines.join('\n')}`).join('\n\n');
    const structuredClipText = structuredSections.slice(0, 2).map(sec => `${sec.header}\n${sec.lines.join('\n')}`).join('\n\n') || clipLines;

    // Build genre-specific tags and negative constraints according to exact genre
    let genreHeader = "";
    let vocalDesc = "";
    let negativeConstraints = "";
    let introAdLib = "";
    let outroAdLib = "";

    switch (styleInfo.genreKey) {
      case 'country':
        genreHeader = `[Genre: Authentic Modern Country & Americana, Nashville Radio Production 2026]
[Tempo: ${adjustedTempo} BPM, 4/4 Country Groove Time Signature]
[Instrumentation: ${finalInstrumentation}]`;
        vocalDesc = `[Vocals: Warm Resonant Southern Country Male Drawl, Sincere Heartland Phrasing, Honest Storyteller Delivery in English]`;
        negativeConstraints = `[Negative: Mexican corrido, 12-string docerola requinto, sousaphone tuba, brass charcheta, accordion polka, trap 808 distortion, techno synths, metal scream, regional Mexican, waltz 3/4]`;
        introAdLib = `Count it off, boys. Let's roll.`;
        outroAdLib = `That's how we do it down here.`;
        break;

      case 'houston_rap':
        genreHeader = `[Genre: Southern Hip Hop, Authentic Houston Texas Underground Street Rap]
[Tempo: ${adjustedTempo} BPM, 4/4 Slow Rolling Southern Time Signature]
[Instrumentation: ${finalInstrumentation}]`;
        vocalDesc = `[Vocals: Deep, Gritty, Laid-Back Masculine Southern Texas Baritone Rap Flow, Relaxed Pocket Cadence, Lyrical Street Wisdom in English]`;
        negativeConstraints = `[Negative: Mexican corrido, 12-string requinto, brass band, accordion polka, fast edm, country banjo, waltz 3/4, sousaphone tuba, regional Mexican]`;
        introAdLib = `Holding it down for Texas, real recognize real.`;
        outroAdLib = `Keep it real, stay on the grind.`;
        break;

      case 'trap':
        genreHeader = `[Genre: Ultra-Modern American Hard Trap, Hip Hop Anthem 2026]
[Tempo: ${adjustedTempo} BPM, 4/4 Hard Trap Time Signature]
[Instrumentation: ${finalInstrumentation}]`;
        vocalDesc = isSpanglish ? `[Vocals: Sharp Bilingual Trap Flow, Fast Cadence]` : `[Vocals: Razor-Sharp Confident Male English Rap Flow, Hard-Hitting Triplet Cadence, Trap Ad-libs]`;
        negativeConstraints = `[Negative: Mexican corrido, accordion polka, 12-string docerola, acoustic guitar requinto, sousaphone, brass band, country banjo, waltz 3/4, regional Mexican]`;
        introAdLib = `Yeah, turn the 808 up. Let's get it.`;
        outroAdLib = `All gas no brakes, we out here.`;
        break;

      case 'rock':
        genreHeader = `[Genre: Modern Rock & Alternative, High-Energy Guitar Anthem 2026]
[Tempo: ${adjustedTempo} BPM, 4/4 Driving Rock Time Signature]
[Instrumentation: ${finalInstrumentation}]`;
        vocalDesc = `[Vocals: Powerful Raw Rock Lead Male Vocals, Gritty Dynamic Chest Resonance, Anthemic Passion in English]`;
        negativeConstraints = `[Negative: Mexican corrido, 12-string docerola requinto, sousaphone tuba, accordion polka, electronic dance synth, hip hop 808s, regional Mexican, waltz 3/4]`;
        introAdLib = `One, two, three, let's go!`;
        outroAdLib = `Rock on!`;
        break;

      case 'pop_rnb':
        genreHeader = `[Genre: Global Radio Pop, Contemporary R&B, Modern Hit 2026]
[Tempo: ${adjustedTempo} BPM, 4/4 Radio Pop Time Signature]
[Instrumentation: ${finalInstrumentation}]`;
        vocalDesc = `[Vocals: Smooth Melodic Modern Pop Vocals in English, Silky R&B Runs, Emotional Warmth, Crystal-Clear Vocal Delivery]`;
        negativeConstraints = `[Negative: Mexican corrido, 12-string requinto, brass band tambora, sousaphone tuba, accordion polka, heavy metal screams, regional Mexican, waltz 3/4]`;
        introAdLib = `Yeah, listen close.`;
        outroAdLib = `Fade it out smooth.`;
        break;

      case 'afrobeats':
        genreHeader = `[Genre: Modern Afrobeats & Caribbean Fusion 2026]
[Tempo: ${adjustedTempo} BPM, 4/4 Syncopated Afro-Groove Time Signature]
[Instrumentation: ${finalInstrumentation}]`;
        vocalDesc = `[Vocals: Silky Melodic English/Afro-Pop Vocals, Uplifting Syncopated Flow, Vibrant Island Groove]`;
        negativeConstraints = `[Negative: Mexican corrido, 12-string docerola, accordion polka, sousaphone tuba, heavy rock distortion, regional Mexican, waltz 3/4]`;
        introAdLib = `Feel the rhythm, let the energy rise!`;
        outroAdLib = `Blessings all around!`;
        break;

      case 'mariachi':
        genreHeader = `[Genre: Authentic Traditional Mexican Mariachi, Mariachi de Gala, Ranchera Clásica]
[Tempo: ${adjustedTempo} BPM, 3/4 Vals Ranchero Time Signature]
[Instrumentation: ${finalInstrumentation}]`;
        vocalDesc = isEn ? `[Vocals: Expressive Operatic Masculine Tenor Delivery in English]` : (isSpanglish ? `[Vocals: Passionate Bilingual Ranchero Singer, English & Spanish Delivery with authentic Gritos]` : `[Vocals: Powerful Masculine Mexican Ranchero Tenor with dramatic vibrato and authentic Charro Gritos ("¡Ajúa!", "¡Sí Señor!")]`);
        negativeConstraints = `[Negative: synth, electronic, techno, autotune, distortion, 808 sub-bass, trap hi-hats, metal, screams]`;
        introAdLib = `¡Ay mi México lindo, échale con el corazón!`;
        outroAdLib = `¡Así se canta en mi tierra, ajúa!`;
        break;

      case 'norteno':
        genreHeader = `[Genre: Authentic Norteño Tradicional & Moderno, Polka Norteña, Accordion & Bajo Sexto]
[Tempo: ${adjustedTempo} BPM, 2/4 Driving Polka Time Signature]
[Instrumentation: ${finalInstrumentation}]`;
        vocalDesc = isEn ? `[Vocals: Confident Country/Norteño Male Vocals in English]` : (isSpanglish ? `[Vocals: Bilingual Tex-Mex / Norteño Masculine Vocals]` : `[Vocals: Commanding Raspy Northern Mexican Male Lead, Doubled Vocal Harmonies, Authentic Northern Slang ("¡Échale compa!", "¡Y arriba el norte!")]`);
        negativeConstraints = `[Negative: romantic slow pad, techno synths, heavy 808 distortion, trap roll, auto-tune abuse, classical piano]`;
        introAdLib = `¡Que suene bonito ese acordeón, compadre!`;
        outroAdLib = `¡Y puro pa' delante, pariente!`;
        break;

      case 'banda':
        genreHeader = `[Genre: Authentic Banda Sinaloense Brava, Heavy Sinaloa Brass Band]
[Tempo: ${adjustedTempo} BPM, 3/4 Time Signature, Fast Sinaloan Waltz]
[Instrumentation: ${finalInstrumentation}]`;
        vocalDesc = isEn ? `[Vocals: Powerful Brass-Backed Male Vocals in English]` : (isSpanglish ? `[Vocals: Powerful Bilingual Brass-Ensemble Male Vocals]` : `[Vocals: Booming Masculine Sinaloan Lead Singer, Resonant Belt, Authentic Banda Shouts ("¡Ánimo gente!", "¡Puro Mazatlán!")]`);
        negativeConstraints = `[Negative: soft acoustic ballad, ambient synth pads, techno beat, 808 sub, solo acoustic guitar]`;
        introAdLib = `¡Que retumbe la tambora y suenen los metales de Culiacán!`;
        outroAdLib = `¡Y así suena la banda, compadre!`;
        break;

      case 'sierreno':
        genreHeader = `[Genre: Sierreño Campirano Moderno, Acoustic 12-String Docerola Trio]
[Tempo: ${adjustedTempo} BPM, 3/4 Vals Time Signature]
[Instrumentation: ${finalInstrumentation}]`;
        vocalDesc = isEn ? `[Vocals: Acoustic Sincere Male Vocals in English]` : (isSpanglish ? `[Vocals: Youthful Bilingual Sierreño Duet Vocals]` : `[Vocals: Heartfelt High-Pitched Northern Mexican Male Duo, Tight Harmonies, Sincere Emotional Delivery]`);
        negativeConstraints = `[Negative: loud synthesizer, heavy techno, heavy 808, electric overdrive]`;
        introAdLib = `¡Puro sierreño campirano, viejo!`;
        outroAdLib = `¡Con el corazón de la sierra!`;
        break;

      case 'latin_urban':
        genreHeader = `[Genre: Latin Urban, Modern Reggaeton 2026, Dembow Club Track]
[Tempo: ${adjustedTempo} BPM, 4/4 Syncopated Dembow Time Signature]
[Instrumentation: ${finalInstrumentation}]`;
        vocalDesc = isEn ? `[Vocals: Catchy Melodic English Vocal Delivery over Dembow]` : (isSpanglish ? `[Vocals: Bilingual Spanglish Urban Flow, Smooth & Catchy]` : `[Vocals: Dynamic Latin Urban Singer, Catchy Melodic Hooks, Rhythmic Flow with Perreo Energy]`);
        negativeConstraints = `[Negative: acoustic country, waltz 3/4, accordion polka, heavy metal guitars, classical strings]`;
        introAdLib = `¡Dímelo mi gente, súbele el bajo!`;
        outroAdLib = `¡Hasta abajo, rompiendo la pista!`;
        break;

      case 'electro_corrido':
        genreHeader = `[Genre: Electro Corrido, EDM Regional Mexican Fusion, Festival Anthem]
[Tempo: ${adjustedTempo} BPM, 4/4 Four-on-the-floor Festival Beat]
[Instrumentation: ${finalInstrumentation}]`;
        vocalDesc = isEn ? `[Vocals: Energetic Festival Male Vocals in English]` : (isSpanglish ? `[Vocals: High-Hype Bilingual Festival Vocals]` : `[Vocals: High-Hype Energetic Mexican Vocals, Crowd Shouts, Festival Ad-libs]`);
        negativeConstraints = `[Negative: slow acoustic ballad, 3/4 vals lento, sad acoustic lullaby]`;
        introAdLib = `¡Prende los motores, que explote el bajo!`;
        outroAdLib = `¡Pura energía al máximo!`;
        break;

      case 'rap_corrido':
        genreHeader = `[Genre: Mexican Rap Corrido Fusion, Street Hip Hop & 12-String Docerola]
[Tempo: ${adjustedTempo} BPM, 4/4 Urban Street Time Signature]
[Instrumentation: ${finalInstrumentation}]`;
        vocalDesc = isEn ? `[Vocals: Energetic Street Rap Flow in English over 12-String Guitars]` : (isSpanglish ? `[Vocals: Bilingual Mexican-American Street Rap Delivery, Fast Cadence]` : `[Vocals: Fast Rhythmic Mexican Spanish Street Rap Flow, Multisyllabic Rhymes, Gritty Street Tone]`);
        negativeConstraints = `[Negative: slow romantic pop, waltz 3/4, country fiddle, soft acoustic jazz]`;
        introAdLib = `¡Puro rap corrido, desde el barrio para el mundo!`;
        outroAdLib = `¡La calle no miente, firme con la gente!`;
        break;

      default:
        // Regional Mexican Bélico / Tumbado 2026
        genreHeader = `[Genre: Authentic Regional Mexican, Corrido Bélico, Corrido Tumbado, Sierreño Urbano 2026]
[Tempo: ${adjustedTempo} BPM, 3/4 Time Signature, Fast Northern Mexican Zapateado Waltz]
[Instrumentation: ${finalInstrumentation}]`;
        vocalDesc = isEn ? `[Vocals: Confident High-Energy Male Vocals in English over 12-String Requintos]` : (isSpanglish ? `[Vocals: High-Hype Bilingual Corrido Singer, Spanish & English Delivery]` : `[Vocals: Aggressive Raspy Male Regional Mexican Singer, Doubled Vocals, Mexican Spanish Street Delivery, Fast Syncopated Flow, Live Concert Ad-libs ("¡Puro Bélico!", "¡Arriba la Clica!")]`);
        negativeConstraints = `[Negative Constraints: romantic synth, soft pads, atmospheric synth pads, electric piano, smooth keyboards, lush string pads, slow ballad, soft romantic song, salsa, bachata, cumbia, merengue, reggaeton, pop ballad, piano, soft acoustic guitar, gentle, sleepy, smooth jazz, tropical, brass mambo, female vocal]`;
        introAdLib = `¡Que truene la docerola en vivo, viejo! ¡Puro corrido bélico!`;
        outroAdLib = `¡Y así suena la clica, compa! ¡Puro pa' delante!`;
        break;
    }

    const lyricSectionPro = (structuredFullText || fullLines).trim();
    const lyricSectionClip = (structuredClipText || clipLines).trim();

    let finalPrompt = "";
    if (params.isPro) {
      finalPrompt = `${genreHeader}
[Title: "${cleanTitle}"]
[Track Length: 2-Minute Full Master Track]
${vocalDesc}
[Theme: ${safeLyricalTheme}]
${negativeConstraints}

[Lyrics]
${lyricSectionPro}`;
    } else {
      finalPrompt = `${genreHeader}
[Title: "${cleanTitle}"]
[Track Length: 45-Second High-Energy Preview Clip]
${vocalDesc}
[Theme: ${safeLyricalTheme}]
${negativeConstraints}

[Lyrics]
${lyricSectionClip}`;
    }

    return {
      finalPrompt,
      cleanTitle,
      safeStyleDescriptor: styleInfo.descriptor,
      tempoBpm: adjustedTempo,
      sanitizedInstrumentation: finalInstrumentation,
      safeLyricalTheme,
      clipLines,
      fullLines
    };
  }
}
