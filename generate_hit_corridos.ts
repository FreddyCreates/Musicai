import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const HIT_TRACKS = [
  {
    fileName: "pura_doble_p.mp3",
    title: "Furia Bélica en Vivo (Modern Banda)",
    prompt: `[Genre: Regional Mexican, Modern Corrido Bélico, Banda Pesada en Vivo 2026]
[Tempo: 144 BPM, 3/4 Time Signature, Fast Northern Mexican Zapateado Waltz]
[Instrumentation: Blistering 12-string Docerola Requinto Guitar Leads picking lightning-fast chromatic runs in 3rds, Screaming Live Brass Slide Trombones and Alto Horn Charchetas, Heavy Concert Marching Tambora with explosive Brass Cymbal Crashes, Snappy Military Tarola Snare Rimshots, Roaring Sousaphone Tuba Bassline]
[Vocals: Confident Aggressive Male Regional Mexican Singer with raw grit, Fast Mexican Spanish Cadence, Live Concert Ad-libs ("¡Puro pa' delante!", "¡Arriba la banda!")]
[Production: High-Energy Live Concert Arena Audio, Punchy Bass, Crisp 12-String Requinto Attack, Heavy Tambora Impacts]
[Negative: salsa, cumbia, bachata, romantic ballad, slow acoustic, female vocals, soft piano]`
  },
  {
    fileName: "clave_667_humaya.mp3",
    title: "El Jaque Mate (Estilo Grupo Mente Maestra)",
    prompt: `[Genre: Regional Mexican, Corrido Bélico Estratégico, Sierreño Urbano Pesado 2026]
[Tempo: 146 BPM, 3/4 Time Signature, Fast Northern Tempo]
[Instrumentation: Blistering Dual 12-String Requinto Guitars picking double-speed chromatic scales, Dry Snapping Military Tarola Snares with fast rolls, Roaring Deep Sousaphone Tuba Bass, Syncopated Charchetas]
[Vocals: Intense Razor-Sharp Mexican Male Corrido Singer, High-Speed Rhythmic Delivery, Strategic Street Bravado]
[Production: Crisp Studio Mix, Super-Fast 12-String Double-Picking, Deep Bass Impact]
[Negative: salsa, bachata, cumbia, slow ballad, soft acoustic, female vocals, romantic]`
  },
  {
    fileName: "el_hombre_de_la_sierra.mp3",
    title: "Dámaso / El Mini Lic (Estilo Gerardo Ortiz)",
    prompt: `[Genre: Regional Mexican, Banda Pesada Sinaloense, Corrido Progresivo 2026]
[Tempo: 144 BPM, 3/4 Time Signature, Heavy Banda Zapateado]
[Instrumentation: Heavy Marching Tambora with explosive Brass Cymbal Crashes on downbeats, Snappy Military Tarolazos with fast rolls, Screaming Slide Trombones, Fast 12-String Requinto Leads, Deep Sousaphone Tuba in double-strike]
[Vocals: Deep Commanding Masculine Mexican Corrido Singer, Bravado, Traditional Gritos]
[Production: High-Energy Live Palenque Sound, Explosive Cymbal Hits, Heavy Tuba]
[Negative: salsa, bachata, cumbia, slow pop, romantic ballad, soft piano]`
  },
  {
    fileName: "las_doce_cuerdas.mp3",
    title: "El Humo Verde (Estilo Legado 7)",
    prompt: `[Genre: Regional Mexican, Sierreño Urbano, Corridos Verdes 2026]
[Tempo: 128 BPM, 3/4 Time Signature, Sierreño Groove]
[Instrumentation: High-Speed 12-String Docerola Guitar Solo with chromatic adornos, Punchy Acoustic Drum Kit with snapping snare rimshots, Heavy Punchy Electric Bassline, Crisp Rhythm Guitar]
[Vocals: Smooth Aggressive Male Regional Singer with urban swagger, Mexican Spanish Street Flow]
[Production: Modern Heavy Acoustic Drum Kit, Crystal-Clear 12-String Steel Strings, Deep Bass]
[Negative: salsa, cumbia, romantic pop ballad, soft jazz, female vocal]`
  },
  {
    fileName: "el_senor_de_dallas.mp3",
    title: "El Ingeniero de Dallas (Bélico Tech 2026)",
    prompt: `[Genre: Regional Mexican, Corrido Bélico Moderno 2026, Sierreño Tumbado]
[Tempo: 138 BPM, 3/4 Time Signature, Driving Northern Beat]
[Instrumentation: Piercing Slide Trombones, Blazing 12-String Requinto Guitar Leads, Deep Tololoche and Sousaphone Bass, Snappy Military Tarolas]
[Vocals: Energetic Mexican Male Singer, Confident Storytelling Flow about Dallas tech and ambition, Passionate Delivery]
[Production: Dynamic High-Fidelity Studio Master, Bright 12-String Attack, Punchy Low-End]
[Negative: salsa, cumbia, slow pop ballad, romantic song, soft acoustic]`
  },
  {
    fileName: "la_686_de_mexicali.mp3",
    title: "La 686 de Mexicali (Los Juniors de Mexicali)",
    prompt: `[Genre: Regional Mexican, Corrido Fronterizo 686, Baja Cali Sierreño 2026]
[Tempo: 130 BPM, 3/4 Time Signature, Fast Northern Border Rhythm]
[Instrumentation: Blistering 12-String Docerola Guitars picking fast melodies, Syncopated Alto Horn Charchetas, Deep Acoustic Bass and Sousaphone, Snappy Drum Kit]
[Vocals: Raspy Aggressive Mexican Male Tenor, Fast Syncopated Delivery, Border Pride Ad-libs ("¡Puro Mexicali!")]
[Production: Sharp Requinto Leads, Tight Brass Accents, Crisp Snare Hits]
[Negative: salsa, cumbia, slow romantic ballad, smooth jazz]`
  },
  {
    fileName: "la_664_de_tijuana.mp3",
    title: "La 664 de Tijuana (Fuerza Regida Style)",
    prompt: `[Genre: Regional Mexican, Corrido Urbano Callejero, Street Sierreño 2026]
[Tempo: 132 BPM, 3/4 Time Signature, Heavy Street Groove]
[Instrumentation: Fast 12-String Requinto Leads, Roaring Slide Trombones, Snappy Tarola Rimshots, Punchy Sousaphone Tuba]
[Vocals: Gritty Male Mexican Street Vocalist, Fast Hype Delivery, Tijuana Border Swagger]
[Production: Heavy Bass, Crisp Guitars, Punchy Drums]
[Negative: salsa, cumbia, romantic ballad, slow pop, soft acoustic]`
  }
];

async function generateAllHits() {
  console.log("=== Generating Authentic Master Audio for all Hit Corridos with Lyria 3 ===");
  for (const track of HIT_TRACKS) {
    console.log(`\n-> Generating: ${track.title} (${track.fileName})...`);
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
        console.log(`✅ SUCCESS: ${track.title} -> ${pubPath} (${buffer.length} bytes)`);
      } else {
        console.warn(`⚠️ No audio data returned for ${track.title}`);
      }
    } catch (err: any) {
      console.error(`❌ Error generating ${track.title}:`, err.message);
    }
    // Delay between calls to prevent rate limiting
    await new Promise(r => setTimeout(r, 1500));
  }
  console.log("\n=== Finished Audio Generation Pipeline ===");
}

generateAllHits();
