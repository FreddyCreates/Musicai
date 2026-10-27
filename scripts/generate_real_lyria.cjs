const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const songsToGenerate = [
  {
    fileName: 'la_686_de_mexicali.mp3',
    title: 'La 686 de Mexicali',
    prompt: 'Authentic Northern Mexican regional corrido tumbado in the style of Los Juniors de Mexicali from Baja California. Fast tempo 124 BPM in 3/4 vals meter. Featuring virtuoso double-picked 12-string electro-acoustic docerola guitar intro and melodic adornos, energetic Eb charcheta alto horn syncopated stabs, deep punchy wooden tololoche slap contrabass, and roaring slide tenor trombones playing aggressive counterpoint riffs. Energetic, swaggering border corrido bélico live acoustic and brass ensemble.'
  },
  {
    fileName: 'el_hombre_de_la_sierra.mp3',
    title: 'El Hombre de la Sierra',
    prompt: 'Authentic Regional Mexican campirano pesado corrido in the style of Los Dareyes de la Sierra. Tempo 118 BPM in 3/4 vals meter. Featuring dual 12-string steel requintos playing fast harmonized runs in thirds and sixths, deep resonant acoustic wooden tololoche slap bass, rustic slide trombones, and syncopated brass horn chops. Raw, passionate Northern Mexico mountain ranchero sound.'
  },
  {
    fileName: 'pura_doble_p.mp3',
    title: 'Pura Doble P',
    prompt: 'Modern 2026 Mexican corrido tumbado bélico in the style of Tito Double P. Tempo 128 BPM in 3/4 meter. Featuring sharp cutting slide trombone leads, piercing 12-string steel requinto picking, rhythmic charcheta horn syncopations, heavy wooden tololoche slap bass, and driving urban regional rhythm. Aggressive, modern, high-energy live brass and acoustic guitar ensemble.'
  }
];

async function generateAll() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set in environment!');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });
  const outDir = path.join(__dirname, '..', 'public', 'audio');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  for (const song of songsToGenerate) {
    console.log(`\n========================================`);
    console.log(`[Lyria] Generating REAL music for: "${song.title}" (${song.fileName})...`);
    console.log(`Prompt: ${song.prompt}`);
    
    try {
      const stream = await ai.models.generateContentStream({
        model: 'lyria-3-clip-preview',
        contents: song.prompt,
      });

      const audioBuffers = [];
      let detectedMime = 'audio/mp3';

      for await (const chunk of stream) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (parts) {
          for (const part of parts) {
            if (part.inlineData?.data) {
              const buf = Buffer.from(part.inlineData.data, 'base64');
              audioBuffers.push(buf);
              if (part.inlineData.mimeType) {
                detectedMime = part.inlineData.mimeType;
              }
              process.stdout.write(`+`);
            }
            if (part.text) {
              console.log(`\n[Lyria Lyrics/Meta]: ${part.text.substring(0, 80)}...`);
            }
          }
        }
      }

      if (audioBuffers.length === 0) {
        console.error(`\n[Error] No audio data returned by Lyria for "${song.title}"`);
        continue;
      }

      const totalBuffer = Buffer.concat(audioBuffers);
      const targetPath = path.join(outDir, song.fileName);
      fs.writeFileSync(targetPath, totalBuffer);
      console.log(`\n[Success] Generated ${song.fileName}: ${totalBuffer.length} bytes (${(totalBuffer.length / 1024).toFixed(1)} KB), Mime: ${detectedMime}`);
    } catch (err) {
      console.error(`\n[Failed] Could not generate "${song.title}":`, err.message || err);
    }
  }

  console.log('\nAll 3 real Lyria music files generated successfully in public/audio!');
}

generateAll();
