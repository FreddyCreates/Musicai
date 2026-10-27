import { CorridoData } from '../types';

export interface FeaturedSongItem extends CorridoData {
  id: string;
  artistTag: string;
  badge: string;
  playsCount: string;
  year: string;
  genreKey: 'pop' | 'electronic' | 'hip_hop' | 'rnb' | 'rock' | 'latin_urban' | 'banda' | 'norteno' | 'tumbado' | 'country';
}

export const FEATURED_CORRIDOS: FeaturedSongItem[] = [
  {
    id: 'codigo-214-midnight-hustle',
    title: 'Código 214: Midnight Hustle (Official Music Video)',
    storySummary: 'High-octane 90 BPM West Coast & Texas street rap anthem produced through our studio with thunderous 808 sub-bass, crispy boom-bap snares, rapid hi-hat rolls, and sharp bilingual bars celebrating ambition, loyalty, and rising from the pavement to sovereign ownership.',
    style: 'Street Rap & Hard 808 Trap (Official Veo 3.1 4K Video)' as any,
    musicalKey: 'Dm',
    tempo: '90 BPM',
    timeSignature: '4/4 (Boom-Bap & 808 Trap)',
    artistTag: 'D-Town King x Malik • Dallas 214',
    badge: '🎬 Official 4K Music Video (Google Veo 3.1 Fast)',
    playsCount: '18.7M streams • 2.4M video views',
    year: '2026',
    genreKey: 'hip_hop',
    primaryLanguage: 'bilingual',
    genreCategory: 'us_hiphop',
    coverPrompt: 'Cinematic hip-hop street rap artist in Dallas Texas under neon city lights at midnight, black luxury sports car, ARRI Alexa cinematic lighting, sharp 4K master',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=85',
    audioUrl: '/audio/codigo_214_rap_master.mp3',
    proAudioUrl: '/audio/codigo_214_rap_master.mp3',
    clipAudioUrl: '/audio/codigo_214_rap_master.mp3',
    hasMusicVideo: true,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-car-driving-through-a-city-at-night-42838-large.mp4',
    videoPosterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=85',
    videoModel: 'veo-3.1-fast-generate-preview',
    videoAspectRatio: '16:9',
    videoResolution: '4K UHD (Mastered H.264)',
    videoDirectorPrompt: 'Cinematic 4K street rap music video filmed on ARRI Alexa 65 with 35mm Master Anamorphic lenses. Midnight in Dallas Texas, sleek custom muscle car rolling through neon reflections, charismatic rap artist spitting bars in front of illuminated skyline, atmospheric smoke, volumetric rim lighting, crisp 24fps motion blur.',
    lyrics: [
      {
        type: 'verso',
        text: 'Yeah... 214 on the map, straight out the concrete.\nStarted with a pocket full of dreams in the midnight rain,\nturned every ounce of pressure into gasoline and gain.\nMidnight on the highway, neon reflections on the hood,\ncame from the bottom now we eating like we should.\nSin mirar pa’ atrás, la mirada en el horizonte,\nel peso de la corona se siente en cada monte.\nLoyalty over royalty, that’s the code we live by,\nlook into my eyes you see the fire never dies.'
      },
      {
        type: 'coro',
        text: 'This is that midnight hustle, hear that heavy 808 boom!\nFrom the pavement to the penthouse, we taking over the room!\nCódigo dos-catorce, nadie nos va a parar,\nsubiendo de nivel, nacidos para ganar!\nYeah, we ride till the morning light,\nsovereign empire, shining through the night!'
      },
      {
        type: 'verso',
        text: 'Custom wheels spinning slow, bass vibrating the street,\nevery single bar precision engineered to the beat.\nNo handouts, no shortcuts, we earned every dime,\npusimos la disciplina y conquistamos el tiempo.\nCamera rolling in 4K, Alexa captures the heat,\nreal ones in my corner, never admitting defeat.\nSpitting truth on the mic, from Dallas out to the world,\nwatch the sovereign legacy officially unfold.'
      },
      {
        type: 'outro',
        text: '214 sovereign empire.\nVeo 3.1 cinema motion.\nReal rap, real hunger.\nWe out.'
      }
    ]
  },
  {
    id: 'pura-doble-p-belico',
    title: 'Pura Doble P (El Bélico Tumbado)',
    storySummary: 'Un corrido tumbado bélico de alto impacto con requintos picados de 12 cuerdas, tololoche chicoteado, charchetas enérgicas y líricas de lealtad, éxito acelerado y respeto en las plazas principales.',
    style: 'Corrido Tumbado (Estilo Peso Pluma & Natanael Cano)' as any,
    musicalKey: 'F#m',
    tempo: '138 BPM',
    timeSignature: '3/4 (Vals Bélico Tumbado)',
    artistTag: 'Valentin de Culiacán • Clica Tumbada',
    badge: '🔥 Top Bélico Tumbado Hit 2026',
    playsCount: '14.2M reproducciones',
    year: '2026',
    genreKey: 'tumbado',
    primaryLanguage: 'es',
    genreCategory: 'regional_belico',
    coverPrompt: 'Regional Mexican artist in Culiacan with custom 12-string guitar, luxury truck, dark cinematic lighting, 4K album art',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=85',
    audioUrl: '/audio/pura_doble_p.mp3',
    proAudioUrl: '/audio/pura_doble_p.mp3',
    clipAudioUrl: '/audio/pura_doble_p.mp3',
    hasMusicVideo: true,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-car-driving-through-a-city-at-night-42838-large.mp4',
    lyrics: [
      {
        type: 'verso',
        text: 'Pura Doble P suena en la camioneta,\nrequintos picados marcando la meta.\nDe Culiacán salimos pa’ todo el mapa,\nla lealtad firme, nada se nos escapa.\nCon la frente en alto y la clica bien bien puesta,\naquí no hay descanso, la vida es una fiesta.'
      },
      {
        type: 'coro',
        text: '¡Pura Doble P y los requintos al millón!\nEl tololoche retumba con fuerza en el corazón.\nSubiendo de rango con firmeza y honor,\nel trabajo duro siempre trae el mejor sabor.\n¡Puro pa’ delante y con la clica arriba!'
      },
      {
        type: 'verso',
        text: 'Traigo los muchachos firmes en la línea,\nnegocios cerrados con mente fina.\nLas 12 cuerdas suenan con gran estilo,\nmientras la vida avanzamos sobre el hilo.\nUn saludo pa’ los que siempre creyeron,\ny pa’ los que dudaban, ya vieron lo que hicieron.'
      },
      {
        type: 'outro',
        text: 'Pura Doble P.\nEstudio máster.\nCero imitaciones.'
      }
    ]
  },
  {
    id: 'clave-667-humaya',
    title: 'Clave 667: El de Humaya',
    storySummary: 'Sierreño urbano de alta velocidad con requintos limpios de 12 cuerdas, bajo tololoche profundo y una narrativa de temple, palabra de honor y código de la capital sinaloense.',
    style: 'Sierreño Urbano (Requintos & Tololoche)' as any,
    musicalKey: 'Am',
    tempo: '144 BPM',
    timeSignature: '3/4 (Sierreño Bélico)',
    artistTag: 'El Gavilán x Los de la Clave • Culiacán / Humaya',
    badge: '🪗 Sierreño Urbano Master',
    playsCount: '9.8M reproducciones',
    year: '2026',
    genreKey: 'tumbado',
    primaryLanguage: 'es',
    genreCategory: 'regional_belico',
    coverPrompt: 'Sierreño urbano band performing with 12-string guitars in Sinaloa at sunset, atmospheric cinematic lighting, 4K quality',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=85',
    audioUrl: '/audio/clave_667_humaya.mp3',
    proAudioUrl: '/audio/clave_667_humaya.mp3',
    clipAudioUrl: '/audio/clave_667_humaya.mp3',
    lyrics: [
      {
        type: 'verso',
        text: 'Clave 667 marcando el territorio,\nlas guitarras suenan listas en el escritorio.\nDesde Culiacán con el pulso bien frío,\ncruzando fronteras sin ningún desvío.\nEl de Humaya sigue firme al volante,\ncon la vista puesta siempre pa’ adelante.'
      },
      {
        type: 'coro',
        text: '¡Suena el requinto con fuerza y poder!\nEl tololoche marca el ritmo que hay que seguir.\nRespeto ganado con actos y valor,\nen el 667 mandamos con honor.'
      },
      {
        type: 'verso',
        text: 'Carros arreglados, convoy en la noche,\ncódigo de honor que no admite reproche.\nPalabra de hombre que pesa más que el oro,\nla familia y la lealtad son mi tesoro.'
      },
      {
        type: 'outro',
        text: 'Clave 667.\nPuro sierreño de peso.'
      }
    ]
  },
  {
    id: 'el-gallo-negro-dallas',
    title: 'El Gallo Negro (El Señor de Dallas)',
    storySummary: 'Alfredo Medina llegó muy joven desde México a Estados Unidos. Casi tocó el millón, cayó fuerte, y hoy con más experiencia y temple de acero, es uno de los más pesados en Dallas, Texas, dominando las rutas de Oklahoma y Kansas. Full band con tambora pesada, redobles de tarola, requinto de 12 cuerdas picado y tuba sinaloense en doble golpe. ¡Cero romanticismos, puro corrido bravo y acelerado!',
    style: 'Estilo Gerardo Ortiz (Banda Pesada & Corrido Progresivo)' as any,
    musicalKey: 'Em',
    tempo: '142 BPM',
    timeSignature: '3/4 (Vals Bélico Pesado)',
    artistTag: 'El Gallo Negro • Alfredo Medina (Dallas / Oklahoma / Kansas)',
    badge: '👑 Regional Mexican Masterpiece',
    playsCount: '16.5M reproducciones',
    year: '2026',
    genreKey: 'banda',
    primaryLanguage: 'es',
    genreCategory: 'banda',
    coverPrompt: 'A proud Mexican regional artist nicknamed El Gallo Negro standing against a modern Dallas Texas skyline at dusk with custom 12-string guitar, dark moody cinematic lighting, ultra-realistic sierreño urbano aesthetics',
    imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1000&q=85',
    audioUrl: '/audio/el_senor_de_dallas.mp3',
    proAudioUrl: '/audio/el_senor_de_dallas.mp3',
    clipAudioUrl: '/audio/el_senor_de_dallas.mp3',
    hasMusicVideo: true,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dust-storm-over-a-desert-highway-42861-large.mp4',
    lyrics: [
      {
        type: 'verso',
        text: 'Llegué de tierras mexicanas muy chavalo,\nsin más riqueza que el valor y con recelo.\nCruzando el río con la fe puesta en la frente,\nbuscando el norte para salir adelante.\nToqué las puertas del triunfo y rozé el millón,\npero la vida a veces te da una lección.'
      },
      {
        type: 'coro',
        text: '¡Y puro Dallas, Texas, pa’ delante!\nCon Oklahoma y Kansas firmes al instante.\nEl Gallo Negro ya volvió a rugir,\ncon la experiencia nadie me va a vencer ni a hundir.\nMe levanté más fuerte con temple de acero,\nel verdadero dueño de mi propio sendero.'
      },
      {
        type: 'verso',
        text: 'La tuba suena recio por la Interestatal,\nel convoy negro patrullando el capital.\nLa lealtad no se compra en ningún mercado,\nlos que estuvieron en las malas están a mi lado.\nAlfredo Medina sigue con la guardia arriba,\npuro trabajo firme que la suerte activa.'
      },
      {
        type: 'outro',
        text: 'El Gallo Negro.\nEl Señor de Dallas.\nPuro Medina Tech.'
      }
    ]
  },
  {
    id: 'el-diamante-de-baja',
    title: 'El Diamante de Baja',
    storySummary: 'Corrido firme de la península de Baja California, con acordeón norteño, tuba pesada y letras de visión, temple y alianzas de respeto de Tijuana a Mexicali.',
    style: 'Corrido Norteño de Poder (Acordeón & Tuba Pesada)' as any,
    musicalKey: 'Gm',
    tempo: '146 BPM',
    timeSignature: '2/4 (Polka Norteña Rápida)',
    artistTag: 'Grupo Mente Maestra • Tijuana / Mexicali / Baja',
    badge: '💎 Corrido de Poder Norteño',
    playsCount: '11.3M reproducciones',
    year: '2026',
    genreKey: 'norteno',
    primaryLanguage: 'es',
    genreCategory: 'norteno',
    coverPrompt: 'Luxury armored truck driving along the Baja California coastal highway at sunset, high contrast cinematic photo',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=85',
    audioUrl: '/audio/el_diamante_de_baja.mp3',
    proAudioUrl: '/audio/el_diamante_de_baja.mp3',
    clipAudioUrl: '/audio/el_diamante_de_baja.mp3',
    hasMusicVideo: true,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-crowd-at-a-concert-with-stage-lights-42994-large.mp4',
    lyrics: [
      {
        type: 'verso',
        text: 'El Diamante de Baja brillando en la frontera,\ndesde Tijuana hasta Mexicali la ruta es entera.\nCon acordeón veloz marcando el compás,\nun hombre de visión que no da un paso atrás.\nEstrategia y cabeza para coordinar,\nlos barcos y la carga se ven pasar.'
      },
      {
        type: 'coro',
        text: '¡Suena la tuba con fuerza en Baja California!\nLa palabra empeñada se respeta sin discordia.\nEl Diamante pulido en el calor del desierto,\nel éxito se gana con el ojo siempre abierto.'
      },
      {
        type: 'verso',
        text: 'Amigos verdaderos contados con los dedos,\nsobran los valientes, se acabaron los miedos.\nUn brindis por las metas que faltan por conquistar,\nel Diamante de Baja no se deja apagar.'
      },
      {
        type: 'outro',
        text: 'Grupo Mente Maestra.\nBaja California firme.'
      }
    ]
  },
  {
    id: 'las-doce-cuerdas-guanajuato',
    title: 'Las Doce Cuerdas: Estilo Guanajuato',
    storySummary: 'Demostración magistral de la guitarra de 12 cuerdas (docerola) con arreglos campiranos, requinteos tradicionales y el sentimiento auténtico del bajío mexicano.',
    style: 'Docerola Tradicional & Campirano' as any,
    musicalKey: 'G',
    tempo: '128 BPM',
    timeSignature: '3/4 (Vals Campirano)',
    artistTag: 'Los Hermanos de la Sierra • Guanajuato / El Bajío',
    badge: '🎸 Docerola & Campirano Master',
    playsCount: '7.4M reproducciones',
    year: '2026',
    genreKey: 'country',
    primaryLanguage: 'es',
    genreCategory: 'country_americana',
    coverPrompt: '12-string guitar docerola resting on a wooden hacienda porch in Guanajuato Mexico, warm golden hour sunlight',
    imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1000&q=85',
    audioUrl: '/audio/las_doce_cuerdas.mp3',
    proAudioUrl: '/audio/las_doce_cuerdas.mp3',
    clipAudioUrl: '/audio/las_doce_cuerdas.mp3',
    lyrics: [
      {
        type: 'verso',
        text: 'Las doce cuerdas suenan con amor y pasión,\ndesde Guanajuato directo al corazón.\nUn requinto campirano que alegra la reunión,\ncantando los versos de nuestra tradición.\nEl Bajío querido donde nací y crecí,\ncon la guitarra en mano hasta el fin seré feliz.'
      },
      {
        type: 'coro',
        text: '¡Vibren las doce cuerdas con toda el alma!\nEn los momentos duros traen paz y calma.\nEl sonar de las maderas de mi linda guitarra,\nque acompaña las noches de fiesta y algarra.'
      },
      {
        type: 'verso',
        text: 'Cuerdas metálicas que brillan al sol,\nuna canción sincera llena de candor.\nDe Guanajuato al mundo llevando el sabor,\nauténtico campirano, nuestro máximo honor.'
      },
      {
        type: 'outro',
        text: 'Las Doce Cuerdas.\nEstilo Guanajuato.'
      }
    ]
  }
];
