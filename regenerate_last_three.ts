import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// The last three songs from the collection:
// 1. La 686 de Mexicali (Los Juniors de Mexicali style - fast 12-string guitars, fast requintos, drum set with snappy snare, bass, hyper modern)
// 2. El Hombre de la Sierra (Actual heavy Banda Sinaloense with real drum set, marching tambora, snare tarolas, deep roaring sousaphone, heavy energy)
// 3. La Clave del Asfalto (2026 Bélico Tumbado hype anthem with fast 12-string requinto guitar riffs, modern drum set, deep 808/sousaphone bass, hype street flow)

const TARGET_TRACKS = [
  {
    fileName: "la_686_de_mexicali.mp3",
    title: "La 686 de Mexicali",
    prompt: "Ultra-modern 2026 high-speed Mexicali border corrido hit with authentic Spanish singing. Fast 128 BPM, 3/4 vals rhythm, in B minor. Blistering 12-string requinto acoustic guitar solos with double-picking rasgueos, complete modern acoustic drum kit with snappy snare rolls, punchy electric bass guitar, slide trombones, and aggressive modern masculine vocals with high hype and energy. No old trumpets, no vintage sound."
  },
  {
    fileName: "el_hombre_de_la_sierra.mp3",
    title: "El Hombre de la Sierra",
    prompt: "Modern heavy Sinaloan brass band corrido with live acoustic drum set, marching tambora, and Spanish vocals. Fast 130 BPM, 3/4 rhythm in F minor. Deep roaring sousaphone tuba basslines, live tarola snare rimshots, heavy live drums, screaming clarinets, and slide trombones. A commanding masculine Mexican vocalist sings with raw power, pride, and energetic gritos. Massive live festival energy."
  },
  {
    fileName: "pura_doble_p.mp3",
    title: "La Clave del Asfalto",
    prompt: "High-energy 2026 modern corrido tumbado urban street anthem with Spanish singing. Fast 130 BPM, 3/4 rhythm in D minor. Blistering 12-string docerola requinto guitar riffs, modern acoustic drum set with snappy snare cracks and punchy kick drum, heavy punchy bass guitar locked with slide trombones. Charismatic, youthful Mexican male singer delivering fast-paced rhymes with authentic 2026 street swagger, hype flow, and zero vintage cheese."
  }
];

async function regenerateLastThreeTracks() {
  console.log("Regenerating the last three tracks with ultra-modern 2026 guitar, requinto, drums, and banda sound...");
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

regenerateLastThreeTracks();
