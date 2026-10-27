import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function genPuraDobleP() {
  const prompt = "Studio master recording of regional mexican acoustic corrido with driving rhythm, 128 BPM, key of E minor, brass slide trombones, 12 string requinto guitar, and an energetic Mexican male singer singing melodic rhythmic verses.";
  try {
    const res = await ai.models.generateContent({
      model: "lyria-3-clip-preview",
      contents: prompt,
      config: {
        responseModalities: ["AUDIO"] as any,
      }
    });
    const part = res.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.data);
    if (part?.inlineData?.data) {
      const buffer = Buffer.from(part.inlineData.data, "base64");
      const pubPath = path.join(process.cwd(), "public/audio/pura_doble_p.mp3");
      const distPath = path.join(process.cwd(), "dist/audio/pura_doble_p.mp3");
      fs.writeFileSync(pubPath, buffer);
      if (fs.existsSync(path.dirname(distPath))) {
        fs.writeFileSync(distPath, buffer);
      }
      console.log(`✅ SUCCESS: pura_doble_p.mp3 written (${buffer.length} bytes)`);
    } else {
      console.warn("! No data returned for Pura Doble P");
    }
  } catch (e: any) {
    console.error("Error generating Pura Doble P:", e.message);
  }
}

genPuraDobleP();
