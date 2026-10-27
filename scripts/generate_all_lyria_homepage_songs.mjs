import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is missing!");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

const songsToGenerate = [
  {
    fileName: 'el_senor_de_dallas.mp3',
    title: 'El Señor de Dallas',
    prompt: 'Authentic 2026 Regional Mexican corrido tumbado bélico in the style of Peso Pluma and Fuerza Regida. Tempo 126 BPM in 3/4 vals rhythm. Virtuoso 12-string requinto docerola lead picking, syncopated charcheta alto horn stabs, sliding brass tenor trombones, and heavy wooden slap tololoche bass. Energetic, high-production live acoustic brass corrido.'
  },
  {
    fileName: 'las_doce_cuerdas.mp3',
    title: 'Las Doce Cuerdas',
    prompt: 'Melodic Regional Mexican corrido tumbado sierreño in the style of Natanael Cano and Junior H. Tempo 115 BPM in 3/4 vals meter. Intricate acoustic 12-string rosewood requinto picking with delicate slides and third harmonies, deep resonant tololoche upright slap contrabass, warm acoustic guitar backing, and melancholic brass swells.'
  },
  {
    fileName: 'el_leon_del_norte.mp3',
    title: 'El León del Norte',
    prompt: 'Fast and fiery 2/4 Regional Mexican corrido norteño bélico in the style of Grupo Arriesgado and Panther Bélico. Fast tempo 130 BPM polka rhythm with virtuoso diatonic button accordion adornos and fast bellows shakes, sharp tarola snare rolls, punchy sousaphone tuba bass, and energetic live regional Mexican rhythm.'
  },
  {
    fileName: 'la_686_de_mexicali.mp3',
    title: 'La 686 de Mexicali',
    prompt: 'Authentic Northern Mexican regional corrido tumbado in the style of Los Juniors de Mexicali from Baja California. Fast tempo 126 BPM in 3/4 vals meter. Featuring virtuoso double-picked 12-string electro-acoustic docerola guitar, energetic Eb charcheta horn stabs, deep punchy tololoche slap contrabass, and aggressive slide trombones.'
  },
  {
    fileName: 'el_hombre_de_la_sierra.mp3',
    title: 'El Hombre de la Sierra',
    prompt: 'Authentic Regional Mexican campirano sierreño corrido in the style of Los Dareyes de la Sierra. Tempo 118 BPM in 3/4 vals rhythm. Dual 12-string acoustic requintos harmonized in tight thirds and sixths, rich resonant wooden tololoche slap bass, rustic trombone counter-melodies, and acoustic backing.'
  },
  {
    fileName: 'pura_doble_p.mp3',
    title: 'Pura Doble P',
    prompt: 'High-energy 2026 Mexican corrido tumbado bélico in the style of Tito Double P and Peso Pluma. Tempo 128 BPM in 3/4 vals meter. Aggressive slide trombone lead riffs, double-picked steel docerola runs, punchy syncopated charchetas, and heavy slap tololoche bass with live acoustic percussion.'
  },
  {
    fileName: 'la_664_de_tijuana.mp3',
    title: 'La 664 de Tijuana',
    prompt: 'Modern 2026 Tijuana Baja California corrido tumbado bélico. Tempo 128 BPM in 3/4 vals meter. Fast double-picked docerola requinto intro, sliding brass trombones, rhythmic Eb charcheta chops, and punchy wooden tololoche contrabass with crisp live percussion.'
  },
  {
    fileName: 'el_trono_de_culiacan.mp3',
    title: 'El Trono de Culiacán',
    prompt: 'Heavy Culiacán Sinaloa corrido bélico in 3/4 time. Fast 130 BPM tempo with roaring slide tenor trombones, syncopated alto horn charchetas, aggressive 12-string docerola acoustic guitar picking, and thunderous sousaphone tuba bass.'
  },
  {
    fileName: 'clave_667_humaya.mp3',
    title: 'La Clave del Humaya',
    prompt: 'Fast 2/4 Regional Mexican corrido norteño with fast diatonic button accordion, crisp snappy tarola snare drum rolls, bajo sexto chords, and energetic tuba basslines in authentic Sinaloense polka tempo.'
  },
  {
    fileName: 'el_diamante_de_baja.mp3',
    title: 'El Diamante de Baja',
    prompt: 'Melodic Sierreño Vanguardia corrido in 3/4 vals meter. Tempo 116 BPM with warm 12-string requinto guitar arpeggios, melodic third harmonies, deep resonant tololoche acoustic contrabass, and atmospheric acoustic guitars.'
  }
];

const outDir = path.resolve('public/audio');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log(`Starting real Lyria music generation for ${songsToGenerate.length} homepage songs...`);

  for (const song of songsToGenerate) {
    const targetFile = path.join(outDir, song.fileName);
    console.log(`\n--------------------------------------------`);
    console.log(`[Lyria AI] Generating REAL music for: "${song.title}" -> ${song.fileName}`);
    console.log(`Prompt: ${song.prompt}`);

    try {
      const response = await ai.models.generateContent({
        model: 'lyria-3-clip-preview',
        contents: song.prompt,
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      let saved = false;

      for (const part of parts) {
        if (part.inlineData?.data) {
          const buffer = Buffer.from(part.inlineData.data, 'base64');
          fs.writeFileSync(targetFile, buffer);
          console.log(`[SUCCESS] Saved REAL Lyria track "${song.title}" to ${song.fileName} (${buffer.length} bytes, ${(buffer.length / 1024).toFixed(1)} KB)`);
          saved = true;
          break;
        }
      }

      if (!saved) {
        console.warn(`[Warning] No inlineData audio found in response for ${song.fileName}`);
      }
    } catch (err) {
      console.error(`[Error] Failed to generate "${song.title}":`, err.message || err);
    }
  }

  console.log(`\nCompleted real Lyria AI music generation for homepage songs!`);
}

run();
