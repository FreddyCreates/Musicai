import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is missing!");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

const remaining = [
  {
    fileName: 'el_senor_de_dallas.mp3',
    title: 'El Señor de Dallas',
    prompt: 'Regional Mexican acoustic instrumental music in 3/4 time with 12-string requinto guitar arpeggios, brass tenor trombones, charcheta horn syncopation, and acoustic contrabass slap in 126 BPM.'
  },
  {
    fileName: 'las_doce_cuerdas.mp3',
    title: 'Las Doce Cuerdas',
    prompt: 'Regional Mexican acoustic instrumental ballad with dual 12-string rosewood requinto acoustic guitar picking, acoustic bass chords, and brass swells in 115 BPM 3/4 vals tempo.'
  },
  {
    fileName: 'el_leon_del_norte.mp3',
    title: 'El León del Norte',
    prompt: 'Traditional Regional Mexican northern acoustic music with fast diatonic button accordion solos, snare rolls, bajo sexto chords, and brass tuba in fast 2/4 polka rhythm 130 BPM.'
  },
  {
    fileName: 'el_hombre_de_la_sierra.mp3',
    title: 'El Hombre de la Sierra',
    prompt: 'Traditional Regional Mexican acoustic mountain instrumental with dual 12-string steel requintos picking in tight thirds, acoustic wooden slap contrabass, and brass counter-melodies in 118 BPM 3/4 time.'
  },
  {
    fileName: 'pura_doble_p.mp3',
    title: 'Pura Doble P',
    prompt: 'Energetic modern Regional Mexican acoustic instrumental with brass tenor trombones, double-picked steel 12-string guitar riffs, charcheta horn chops, and acoustic slap bass in 128 BPM.'
  }
];

const outDir = path.resolve('public/audio');

async function run() {
  for (const song of remaining) {
    const targetFile = path.join(outDir, song.fileName);
    console.log(`Generating Lyria music for ${song.title}...`);
    try {
      const response = await ai.models.generateContent({
        model: 'lyria-3-clip-preview',
        contents: song.prompt,
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          const buffer = Buffer.from(part.inlineData.data, 'base64');
          fs.writeFileSync(targetFile, buffer);
          console.log(`[SUCCESS] Saved Lyria track "${song.title}" (${buffer.length} bytes)`);
          break;
        }
      }
    } catch (err) {
      console.error(`Error for ${song.title}:`, err.message);
    }
  }
  console.log('All remaining Lyria tracks completed!');
}

run();
