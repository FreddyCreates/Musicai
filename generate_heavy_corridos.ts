import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const TARGET_TRACKS = [
  {
    fileName: "el_hombre_de_la_sierra.mp3",
    title: "El Hombre de la Sierra (Corrido de Banda Sinaloense Brava)",
    prompt: "Authentic fast heavy Sinaloan brass band corrido with Spanish vocals. Fast tempo 130 BPM, 3/4 time signature in key of F minor. Roaring deep sousaphone tuba playing heavy chuntata basslines, driving snare tarola and acoustic tambora marching percussion, screaming bright clarinets, and powerful brass slide trombones. A deep, masculine, commanding Mexican male vocalist belts out traditional corrido lyrics with raw manly grit, gritos, and pride."
  },
  {
    fileName: "la_686_de_mexicali.mp3",
    title: "La 686 de Mexicali (Los Juniors de Mexicali Style)",
    prompt: "Fast high-energy 2026 Mexicali border corrido with Spanish singing. Fast 128 BPM, 3/4 time signature in key of B minor. Double-picking 12-string requinto docerolas picking blistering melodic scales, sharp syncopated alto horn charchetas, heavy slide trombones, deep acoustic bass, and crisp live tarola rimshots. An aggressive, masculine Mexican tenor sings rhythmic Spanish rhymes with border swagger and high energy."
  },
  {
    fileName: "el_senor_de_dallas.mp3",
    title: "El Ingeniero de Dallas (Corrido Bélico Tech 2026)",
    prompt: "Modern 2026 regional mexican corrido tumbado urban anthem with authentic Spanish singing. Fast tempo 128 BPM, 3/4 time signature, key of A minor. Cutting brass slide trombones, syncopated charchetas, fast aggressive 12-string docerolas, deep punchy electric bass and acoustic sousaphone, and snappy tarola snare percussion. A confident, masculine Mexican male singer delivers rhythmic Spanish verses about AI drones, Dallas tech leadership, and Mexican heritage."
  }
];

async function generateHeavyCorridos() {
  console.log("Generating fast, manly Corrido de Banda and Los Juniors de Mexicali tracks with Lyria 3...");
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

generateHeavyCorridos();
