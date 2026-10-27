import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const songs = [
  {
    file: 'public/audio/el_senor_de_dallas.mp3',
    prompt: 'Regional Mexican Corrido Tumbado Bélico in 3/4 time with 12-string requinto guitar riffs, heavy slide trombones, bright charcheta brass stabs, slap tololoche bass, and trap drums with crisp snare rimshots and 808s. Authentic Mexican lead vocals singing with pride about Dallas, Texas.'
  },
  {
    file: 'public/audio/las_doce_cuerdas.mp3',
    prompt: 'Melodic Regional Mexican Corrido Tumbado with intricate dual 12-string acoustic requinto guitar arpeggios, melancholic slides, slap tololoche upright bass, subtle charcheta harmony, and trap hi-hats. Soulful vocal delivery about brotherhood.'
  },
  {
    file: 'public/audio/el_leon_del_norte.mp3',
    prompt: 'Fast 2/4 Regional Mexican Corrido Norteño Bélico with virtuoso diatonic button accordion solos, energetic live acoustic drums (batería norteña) with tarola snare rolls, bajo sexto, and heavy tuba bass. High-energy gritty vocal performance.'
  }
];

async function generateAll() {
  if (!fs.existsSync('public/audio')) {
    fs.mkdirSync('public/audio', { recursive: true });
  }

  for (const song of songs) {
    console.log(`Starting generation for ${song.file}...`);
    try {
      const res = await ai.models.generateContent({
        model: 'lyria-3-clip-preview',
        contents: song.prompt
      });
      const parts = res.candidates?.[0]?.content?.parts || [];
      let saved = false;
      for (const p of parts) {
        if (p.inlineData?.data) {
          fs.writeFileSync(song.file, Buffer.from(p.inlineData.data, 'base64'));
          console.log(`SUCCESS: Wrote ${song.file} (${fs.statSync(song.file).size} bytes)`);
          saved = true;
          break;
        }
      }
      if (!saved) {
        console.warn(`Warning: No audio part found in response for ${song.file}`);
      }
    } catch (err) {
      console.error(`Error generating ${song.file}:`, err.message);
    }
  }
  console.log('All featured songs generation finished.');
}

await generateAll();
