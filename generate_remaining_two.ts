import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const REMAINING_SONGS = [
  {
    fileName: "el_hombre_de_la_sierra.mp3",
    title: "El Hombre de la Sierra",
    prompt: "Regional mexican campirano sierreño corrido with authentic vocals, 3/4 vals beat, 118 BPM, key of F# minor. Dual 12-string requinto guitars playing high thirds, rustic acoustic tololoche upright bass, and an authentic Mexican singer singing traditional sierra lyrics with rustic regional flavor."
  },
  {
    fileName: "pura_doble_p.mp3",
    title: "Pura Doble P",
    prompt: "Modern regional mexican corrido tumbado bélico with vocals in the style of Tito Double P and Peso Pluma, 3/4 time signature, 128 BPM, key of E minor. Slide trombones, 12-string docerolas, tololoche slap bass, tight percussion, with a Mexican singer delivering fast rhyming vocal lines locked tightly to the beat."
  }
];

async function generateMissing() {
  for (const item of REMAINING_SONGS) {
    console.log(`Generating master for ${item.title}...`);
    try {
      const res = await ai.models.generateContent({
        model: "lyria-3-clip-preview",
        contents: item.prompt,
        config: {
          responseModalities: ["AUDIO"] as any,
        }
      });
      const part = res.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.data);
      if (part?.inlineData?.data) {
        const buffer = Buffer.from(part.inlineData.data, "base64");
        const pubPath = path.join(process.cwd(), "public/audio", item.fileName);
        const distPath = path.join(process.cwd(), "dist/audio", item.fileName);
        fs.writeFileSync(pubPath, buffer);
        if (fs.existsSync(path.dirname(distPath))) {
          fs.writeFileSync(distPath, buffer);
        }
        console.log(`✅ SUCCESS: ${item.title} written (${buffer.length} bytes)`);
      } else {
        console.warn(`! Empty for ${item.title}`);
      }
    } catch (e: any) {
      console.error(`Error for ${item.title}:`, e.message);
    }
    await new Promise(r => setTimeout(r, 1500));
  }
}

generateMissing();
