import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Audio configuration for the songs needing direct pure studio generation
const SONGS_CONFIG = [
  {
    id: "el_senor_de_dallas",
    fileName: "el_senor_de_dallas.mp3",
    title: "El Ingeniero de Dallas",
    style: "Bélico Tumbado 2026",
    lyriaPrompt: "Complete master studio recording of regional mexican corrido tumbado bélico, 3/4 vals beat, 128 BPM, key of A minor. Featuring live Mexican brass slide trombones, 12-string requinto docerolas, syncopated charchetas, slap acoustic tololoche bass, and an authentic Mexican corrido singer singing with passion, vocal grit and regional Mexican accent about drones with artificial intelligence, engineering in Dallas Texas, and Mexican heritage.",
  },
  {
    id: "las_doce_cuerdas",
    fileName: "las_doce_cuerdas.mp3",
    title: "Las Doce Cuerdas",
    style: "Corrido Tumbado Melódico",
    lyriaPrompt: "Complete master studio recording of an acoustic sierreño corrido tumbado, 3/4 time signature, 115 BPM, key of G major. Intricate 12-string docerola requinto guitar fingerpicking in tight thirds, warm acoustic tololoche upright bass, with an authentic Mexican regional male singer singing smooth melodic vocals perfectly harmonized with the guitar chords.",
  },
  {
    id: "el_leon_del_norte",
    fileName: "el_leon_del_norte.mp3",
    title: "El León del Norte",
    style: "Norteño Bélico con Tarolas",
    lyriaPrompt: "Complete master studio recording of a fast northern Mexican corrido bravo, 2/4 polka beat, 130 BPM, key of D minor. Blistering diatonic button accordion solos, heavy live tarola snare drum rolls, bajo sexto rhythm, punchy sousaphone tuba, and an authentic Mexican norteño singer delivering fast, punchy, rhythmic verses locked tightly to the polka beat.",
  },
  {
    id: "el_hombre_de_la_sierra",
    fileName: "el_hombre_de_la_sierra.mp3",
    title: "El Hombre de la Sierra",
    style: "Campirano Pesado Sierreño",
    lyriaPrompt: "Complete master studio recording of a rustic Mexican campirano sierreño corrido, 3/4 vals time signature, 118 BPM, key of F# minor. Dual 12-string docerolas playing high-pitched piercing thirds, deep wooden tololoche bass, accompanied by an authentic Mexican rustic sierra singer singing heartfelt verses of mountain honor and pride.",
  },
  {
    id: "pura_doble_p",
    fileName: "pura_doble_p.mp3",
    title: "Pura Doble P",
    style: "Bélico 2026",
    lyriaPrompt: "Complete master studio recording of a modern 2026 corrido tumbado bélico in the style of Peso Pluma and Tito Double P, 3/4 time signature, 128 BPM, key of E minor. Driving brass slide trombones, sharp 12-string requinto docerola rhythms, heavy tololoche slap bass, and a charismatic Mexican vocalist singing tight, rhythmic rhymes on beat.",
  }
];

async function generateSingleMasterTrack(song: typeof SONGS_CONFIG[0]) {
  console.log(`\n======================================================`);
  console.log(`[MASTER AUDIO GENERATION] Song: "${song.title}" (${song.fileName})`);
  console.log(`Style: ${song.style}`);
  console.log(`======================================================`);

  const publicOutPath = path.join(process.cwd(), "public/audio", song.fileName);
  const distOutPath = path.join(process.cwd(), "dist/audio", song.fileName);

  try {
    console.log(`Calling Lyria-3 engine for full sung master recording...`);
    const res = await ai.models.generateContent({
      model: "lyria-3-clip-preview",
      contents: song.lyriaPrompt,
      config: {
        responseModalities: ["AUDIO"] as any,
      },
    });

    const audioPart = res.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.data);
    if (audioPart?.inlineData?.data) {
      const buffer = Buffer.from(audioPart.inlineData.data, "base64");
      fs.writeFileSync(publicOutPath, buffer);
      if (fs.existsSync(path.dirname(distOutPath))) {
        fs.writeFileSync(distOutPath, buffer);
      }
      console.log(`✅ SUCCESS: Master track generated for "${song.title}" (${buffer.length} bytes -> ${publicOutPath})`);
    } else {
      console.warn(`! No inline audio data in Lyria response for ${song.title}`);
    }
  } catch (err: any) {
    console.error(`❌ Error generating ${song.title}:`, err.message);
  }
}

async function main() {
  console.log("Generating pure unified master tracks with Lyria 3 (Vocal + Music unified into one performance)...");
  for (const song of SONGS_CONFIG) {
    await generateSingleMasterTrack(song);
    // Pause 1 second between requests
    await new Promise(r => setTimeout(r, 1200));
  }
  console.log("\n=======================================================");
  console.log("All requested master tracks have been completely refreshed!");
  console.log("=======================================================");
}

main().catch(console.error);
