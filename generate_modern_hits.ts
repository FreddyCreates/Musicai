import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const TARGET_TRACKS = [
  {
    fileName: "el_senor_de_dallas.mp3",
    title: "El Ingeniero de Dallas",
    prompt: "Modern 2026 regional mexican corrido tumbado urban hit with authentic Spanish vocals. Tempo 128 BPM, 3/4 time signature, key of A minor. Heavy brass slide trombones, syncopated charchetas, aggressive 12-string requinto docerolas picking fast rhythmic lines, driving trap-influenced bassline and crisp snappy tarola snare percussion. A confident male singer delivers fast rhythmic Spanish verses about technology, AI drones, and perseverance."
  },
  {
    fileName: "las_doce_cuerdas.mp3",
    title: "Las Doce Cuerdas (Pacto de Hermanos)",
    prompt: "Modern melodic corrido tumbado about brotherhood and loyalty with Spanish vocals, tempo 118 BPM, 3/4 time signature, key of G major. Beautiful emotional 12-string requinto melodies, deep electric bass and sousaphone, snappy snare rimshots. A passionate Mexican male vocalist sings heartfelt poetic Spanish lyrics celebrating lifelong friendship and family bonds."
  },
  {
    fileName: "pura_doble_p.mp3",
    title: "La Clave del Asfalto",
    prompt: "High-energy 2026 modern corrido tumbado urban street anthem with Spanish singing. Fast 130 BPM, 3/4 tempo in key of D minor. Powerful brass slide trombones, razor-sharp 12-string docerola chords, deep acoustic bass, and snappy drum percussion. Charismatic Mexican male singer delivering catchy, fast-paced rhymes with authentic street swagger and energy."
  }
];

async function generateNewHits() {
  console.log("Generating modern 2026 Corrido hit tracks with Lyria 3...");
  for (const track of TARGET_TRACKS) {
    console.log(`Generating track for ${track.title}...`);
    try {
      const res = await ai.models.generateContent({
        model: "lyria-3-clip-preview",
        contents: track.prompt,
        config: {
          responseModalities: ["AUDIO"] as any,
        }
      });
      const part = res.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.data);
      if (part?.inlineData?.data) {
        const buffer = Buffer.from(part.inlineData.data, "base64");
        const pubPath = path.join(process.cwd(), "public/audio", track.fileName);
        const distPath = path.join(process.cwd(), "dist/audio", track.fileName);
        fs.writeFileSync(pubPath, buffer);
        if (fs.existsSync(path.dirname(distPath))) {
          fs.writeFileSync(distPath, buffer);
        }
        console.log(`✅ SUCCESS: ${track.title} written (${buffer.length} bytes -> ${pubPath})`);
      } else {
        console.warn(`! No inline data for ${track.title}`);
      }
    } catch (e: any) {
      console.error(`Error generating ${track.title}:`, e.message);
    }
    await new Promise(r => setTimeout(r, 1200));
  }
}

generateNewHits();
