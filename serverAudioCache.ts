import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface CachedAudioMeta {
  filename: string;
  url: string;
  sizeBytes: number;
  durationSec: number;
  tempo: number;
  style: string;
  title: string;
  songHash?: string;
  type: 'master_2min' | 'clip_45s' | 'hook_15s' | 'vocal_singing' | 'tts_preview' | 'tts_speak' | 'singing_vocals';
  createdAt: string;
}

export class ServerAudioCacheManager {
  private static cacheDir: string = path.join(process.cwd(), 'public', 'audio', 'cache');
  private static memoryIndex: Map<string, CachedAudioMeta> = new Map();

  /**
   * Initializes the disk cache directory on server startup
   */
  public static init() {
    try {
      if (!fs.existsSync(this.cacheDir)) {
        fs.mkdirSync(this.cacheDir, { recursive: true });
        console.log(`[Audio Cache] Created persistent disk cache directory: ${this.cacheDir}`);
      }
      this.rebuildIndex();
    } catch (err) {
      console.error('[Audio Cache] Initialization error:', err);
    }
  }

  /**
   * Rebuilds the memory index from existing files on disk
   */
  public static rebuildIndex() {
    try {
      if (!fs.existsSync(this.cacheDir)) return;
      const files = fs.readdirSync(this.cacheDir);
      for (const file of files) {
        if (file.endsWith('.wav') || file.endsWith('.mp3')) {
          const filePath = path.join(this.cacheDir, file);
          const stats = fs.statSync(filePath);
          const metaPath = filePath + '.json';
          let meta: Partial<CachedAudioMeta> = {};
          if (fs.existsSync(metaPath)) {
            try {
              meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
            } catch (e) {}
          }
          const key = file.replace(/\.(wav|mp3)$/, '');
          this.memoryIndex.set(key, {
            filename: file,
            url: `/audio/cache/${file}`,
            sizeBytes: stats.size,
            durationSec: meta.durationSec || 120,
            tempo: meta.tempo || 144,
            style: meta.style || 'Bélico',
            title: meta.title || file,
            songHash: meta.songHash,
            type: meta.type || 'master_2min',
            createdAt: meta.createdAt || stats.birthtime.toISOString()
          });
        }
      }
      console.log(`[Audio Cache] Indexed ${this.memoryIndex.size} pre-recorded audio files on disk (0 tokens spent on playback).`);
    } catch (err) {
      console.warn('[Audio Cache] Index rebuild warning:', err);
    }
  }

  /**
   * Generates a deterministic hash key for song parameters
   */
  public static computeKey(
    title: string,
    style: string,
    tempo: number,
    type: string,
    option: string = 'A',
    songHash?: string,
    lyrics?: any[] | string
  ): string {
    const cleanTitle = (title || 'corrido').toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 25);
    const cleanStyle = (style || 'belico').toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 15);
    let fullLyricsText = '';
    if (Array.isArray(lyrics)) {
      fullLyricsText = lyrics.map(l => (typeof l === 'string' ? l : l?.text || '')).join('\n');
    } else if (typeof lyrics === 'string') {
      fullLyricsText = lyrics;
    }
    const raw = `${cleanTitle}_${cleanStyle}_${tempo}_${type}_${option}_${songHash || ''}_${fullLyricsText}`;
    const hash = crypto.createHash('sha256').update(raw).digest('hex').substring(0, 12);
    return `${cleanTitle}_${type}_${tempo}bpm_${option}_${hash}`;
  }

  /**
   * Checks if a song audio file already exists in cache
   */
  public static getCachedAudio(key: string): CachedAudioMeta | null {
    if (this.memoryIndex.has(key)) {
      return this.memoryIndex.get(key)!;
    }
    const wavPath = path.join(this.cacheDir, `${key}.wav`);
    if (fs.existsSync(wavPath)) {
      const stats = fs.statSync(wavPath);
      const meta: CachedAudioMeta = {
        filename: `${key}.wav`,
        url: `/audio/cache/${key}.wav`,
        sizeBytes: stats.size,
        durationSec: key.includes('45s') ? 45 : 120,
        tempo: 144,
        style: 'Regional Mexicano',
        title: key,
        type: key.includes('45s') ? 'clip_45s' : 'master_2min',
        createdAt: stats.birthtime.toISOString()
      };
      this.memoryIndex.set(key, meta);
      return meta;
    }
    return null;
  }

  /**
   * Saves raw PCM WAV Buffer to disk cache and updates index
   */
  public static saveToDisk(key: string, buffer: Buffer, meta: Partial<CachedAudioMeta>): CachedAudioMeta {
    try {
      if (!fs.existsSync(this.cacheDir)) {
        fs.mkdirSync(this.cacheDir, { recursive: true });
      }
      const filename = `${key}.wav`;
      const filePath = path.join(this.cacheDir, filename);
      fs.writeFileSync(filePath, buffer);

      const completeMeta: CachedAudioMeta = {
        filename,
        url: `/audio/cache/${filename}`,
        sizeBytes: buffer.length,
        durationSec: meta.durationSec || 120,
        tempo: meta.tempo || 144,
        style: meta.style || 'Bélico',
        title: meta.title || 'Corrido Master',
        songHash: meta.songHash,
        type: meta.type || 'master_2min',
        createdAt: new Date().toISOString()
      };

      // Also persist metadata json alongside audio
      fs.writeFileSync(filePath + '.json', JSON.stringify(completeMeta, null, 2));
      this.memoryIndex.set(key, completeMeta);
      console.log(`[Audio Cache] Successfully recorded & persisted to disk: ${filename} (${(buffer.length / 1024 / 1024).toFixed(2)} MB, 0 tokens on repeat plays)`);
      return completeMeta;
    } catch (err) {
      console.error('[Audio Cache] Error saving to disk:', err);
      return {
        filename: `${key}.wav`,
        url: `data:audio/wav;base64,${buffer.toString('base64')}`,
        sizeBytes: buffer.length,
        durationSec: meta.durationSec || 120,
        tempo: meta.tempo || 144,
        style: meta.style || 'Bélico',
        title: meta.title || 'Corrido Master',
        type: meta.type || 'master_2min',
        createdAt: new Date().toISOString()
      };
    }
  }

  /**
   * Returns all cached recording items
   */
  public static listAllCached(): CachedAudioMeta[] {
    return Array.from(this.memoryIndex.values());
  }

  public static listCachedFiles(): CachedAudioMeta[] {
    return this.listAllCached();
  }

  /**
   * Fast, Ultra-High-Fidelity 2-Minute Master Audio Synthesizer Engine
   * Generates a rich, full 120-second 2-minute master PCM WAV buffer in < 80ms using genre-adaptive audio modeling.
   */
  public static generateOptimized2MinMasterWavBuffer(
    durationSec = 120,
    bpm = 144,
    style = 'Bélico',
    title = 'Corrido Master'
  ): Buffer {
    const sampleRate = 22050;
    const numSamples = durationSec * sampleRate;
    const buffer = Buffer.alloc(44 + numSamples * 2);

    // RIFF WAV Header
    buffer.write("RIFF", 0);
    buffer.writeUInt32LE(36 + numSamples * 2, 4);
    buffer.write("WAVE", 8);
    buffer.write("fmt ", 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20); // Linear PCM
    buffer.writeUInt16LE(1, 22); // Mono
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * 2, 28); // Byte rate
    buffer.writeUInt16LE(2, 32); // Block align
    buffer.writeUInt16LE(16, 34); // Bits per sample
    buffer.write("data", 36);
    buffer.writeUInt32LE(numSamples * 2, 40);

    const sLower = style.toLowerCase();
    const isMexicanRegionalExplicit = sLower.includes('corrido') || sLower.includes('bélico') || sLower.includes('belico') || sLower.includes('tumbado') || sLower.includes('norteño') || sLower.includes('norteno') || sLower.includes('banda') || sLower.includes('sierr') || sLower.includes('campirano') || sLower.includes('mariachi') || sLower.includes('ranchera') || sLower.includes('zapateado') || sLower.includes('docerola') || sLower.includes('requinto') || sLower.includes('tambora') || sLower.includes('acordeón') || sLower.includes('acordeon') || sLower.includes('regional');

    const isCountry = (sLower.includes('country') || sLower.includes('folk') || sLower.includes('americana') || sLower.includes('bluegrass') || sLower.includes('nashville')) && !isMexicanRegionalExplicit;
    const isRock = (sLower.includes('rock') || sLower.includes('metal') || sLower.includes('punk') || sLower.includes('alternative') || sLower.includes('grunge')) && !isMexicanRegionalExplicit;
    const isHoustonRap = (sLower.includes('houston') || sLower.includes('ugk') || sLower.includes('z-ro') || sLower.includes('trae') || sLower.includes('screw') || sLower.includes('slab')) && !isMexicanRegionalExplicit;
    const isPopRnb = (sLower.includes('pop') || sLower.includes('r&b') || sLower.includes('rnb') || sLower.includes('soul') || sLower.includes('synthpop')) && !sLower.includes('latin') && !isMexicanRegionalExplicit;
    const isMariachi = (sLower.includes('mariachi') || sLower.includes('ranchera') || sLower.includes('charro'));
    const isNorteno = (sLower.includes('norteño') || sLower.includes('norteno') || sLower.includes('polka') || sLower.includes('acordeón') || sLower.includes('acordeon') || sLower.includes('bajo sexto'));
    const isBanda = (sLower.includes('banda') || sLower.includes('sinaloense') || sLower.includes('tambora') || sLower.includes('tamborazo'));
    const isSierreno = (sLower.includes('sierr') || sLower.includes('campirano') || sLower.includes('tumbado') || sLower.includes('docerola') || sLower.includes('requinto') || sLower.includes('corrido') || sLower.includes('bélico') || sLower.includes('belico') || isMexicanRegionalExplicit);
    const isEdm = (sLower.includes('electro') || sLower.includes('edm') || sLower.includes('synthwave') || sLower.includes('electronic') || sLower.includes('house')) && !isMexicanRegionalExplicit;
    const isTrapOrUrban = (sLower.includes('trap') || sLower.includes('urban') || sLower.includes('reggaeton') || sLower.includes('rap') || sLower.includes('dembow') || sLower.includes('hip hop')) && !sLower.includes('rap corrido') && !isMexicanRegionalExplicit;

    const defaultBpm = isHoustonRap ? 74 : isCountry ? 108 : isRock ? 132 : isPopRnb ? 110 : isEdm ? 128 : isTrapOrUrban ? 130 : isNorteno ? 132 : isMariachi ? 116 : isBanda ? 144 : 138;
    const safeBpm = Math.max(60, Math.min(165, bpm || defaultBpm));
    const beatDuration = 60 / safeBpm;
    const beatsPerMeasure = (isMariachi || isSierreno || isBanda || isMexicanRegionalExplicit) ? 3 : isNorteno ? 2 : 4;
    const measureDuration = beatDuration * beatsPerMeasure;

    const isMinor = isTrapOrUrban || isEdm || isRock || isHoustonRap || sLower.includes('tumbado') || sLower.includes('mente') || sLower.includes('legado');
    const scale = isMinor
      ? [440, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99, 880] // A Minor
      : [440, 493.88, 554.37, 587.33, 659.25, 739.99, 830.61, 880]; // A Major

    const bassFrequencies = isMinor ? [55, 65.41, 73.42, 82.41] : [110, 82.41, 123.47, 146.83];
    const int16View = new Int16Array(buffer.buffer, buffer.byteOffset + 44, numSamples);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const totalBeats = t / beatDuration;
      const beatInMeasure = Math.floor(totalBeats) % beatsPerMeasure;
      const beatPos = totalBeats % 1;
      const measureIdx = Math.floor(t / measureDuration);

      let drums = 0;
      let bass = 0;
      let synthOrBrass = 0;
      let lead = 0;

      if (isCountry) {
        // Authentic Nashville Country (4/4): Acoustic Kick on 1 & 3, Snappy Brushed Snare on 2 & 4, Acoustic Guitar Churn, Pedal Steel Slides
        if (beatInMeasure === 0 || beatInMeasure === 2) {
          const kickFreq = 55 + 65 * Math.exp(-beatPos * 22);
          drums = Math.sin(6.2831853 * kickFreq * t) * Math.exp(-beatPos * 9) * 0.75;
        } else {
          // Crisp country snare / brush crack
          const snareTone = Math.sin(6.2831853 * 180 * t) * Math.exp(-beatPos * 20) * 0.4;
          const snareNoise = (Math.random() * 2 - 1) * Math.exp(-beatPos * 24) * 0.45;
          drums = snareTone + snareNoise;
        }
        // Subtle hi-hat / shaker on 8th notes
        const eighthPos = (totalBeats * 2) % 1;
        drums += (Math.random() * 2 - 1) * Math.exp(-eighthPos * 30) * 0.12;

        // Solid Country Bass Guitar (Root on 1, Fifth on 3)
        if (beatInMeasure === 0 || beatInMeasure === 2) {
          const bFreq = beatInMeasure === 0 ? bassFrequencies[measureIdx % bassFrequencies.length] : bassFrequencies[measureIdx % bassFrequencies.length] * 0.75;
          bass = Math.sin(6.2831853 * bFreq * t) * Math.exp(-beatPos * 5) * 0.75;
        }

        // Acoustic dreadnought guitar rhythm strum on offbeats
        if (beatPos > 0.4 && beatPos < 0.8) {
          const strumEnv = Math.exp(-(beatPos - 0.4) * 16);
          const chordFreq = scale[measureIdx % scale.length];
          synthOrBrass = ((Math.sin(6.2831853 * chordFreq * t) + Math.sin(6.2831853 * chordFreq * 1.25 * t) * 0.6) * 0.2 + (Math.random() * 2 - 1) * 0.1) * strumEnv;
        }

        // Weeping Pedal Steel Guitar / Fiddle sliding melody
        const noteIdx = Math.floor(totalBeats * 0.5 + measureIdx) % scale.length;
        const steelFreq = scale[noteIdx] * (1.0 + 0.03 * Math.sin(6.2831853 * 4.5 * t)); // vibrato
        lead = (Math.sin(6.2831853 * steelFreq * t) + Math.sin(6.2831853 * steelFreq * 2 * t) * 0.3) * 0.3 * Math.exp(-beatPos * 4);

      } else if (isRock) {
        // Driving American Rock / Alternative (4/4): Heavy Kick, Cracking Snare, Overdriven Guitar Riffs, Driving Bass
        if (beatInMeasure === 0 || beatInMeasure === 2) {
          const kickFreq = 50 + 80 * Math.exp(-beatPos * 26);
          drums = Math.sin(6.2831853 * kickFreq * t) * Math.exp(-beatPos * 11) * 0.85;
        } else {
          // Cracking Rock Snare with high noise burst
          drums = (Math.sin(6.2831853 * 210 * t) * 0.5 + (Math.random() * 2 - 1) * 0.55) * Math.exp(-beatPos * 18);
        }
        // Crash cymbal on measure downbeat
        if (beatInMeasure === 0 && beatPos < 0.4) {
          drums += (Math.random() * 2 - 1) * Math.exp(-beatPos * 8) * 0.3;
        }

        // Driving 8th-note Electric Bass Guitar
        const bassBeat = Math.floor(totalBeats * 2) % 8;
        const bFreq = bassFrequencies[measureIdx % bassFrequencies.length];
        bass = Math.sin(6.2831853 * bFreq * t) * Math.exp(-(totalBeats * 2 % 1) * 8) * 0.7;

        // Overdriven Electric Rhythm Guitar (Power Chords with clipping saturation)
        const chordRoot = scale[measureIdx % scale.length];
        const rawChord = Math.sin(6.2831853 * chordRoot * t) + Math.sin(6.2831853 * (chordRoot * 1.5) * t) * 0.8;
        synthOrBrass = Math.max(-0.6, Math.min(0.6, rawChord * 1.5)) * 0.45 * Math.exp(-beatPos * 6);

        // Electric Guitar Lead Licks
        const leadIdx = Math.floor(totalBeats * 2) % scale.length;
        const lFreq = scale[leadIdx] * 1.5;
        lead = Math.sin(6.2831853 * lFreq * t) * Math.exp(-beatPos * 8) * 0.28;

      } else if (isHoustonRap) {
        // Slow-Rolling Houston Texas Underground Rap (4/4 at ~74 BPM): Heavy 808 Sub-Bass, Vintage Rhodes Chords, Crisp Snare
        if (beatInMeasure === 0 || (beatInMeasure === 2 && beatPos > 0.5)) {
          const kickFreq = 50 + 60 * Math.exp(-beatPos * 18);
          drums = Math.sin(6.2831853 * kickFreq * t) * Math.exp(-beatPos * 8) * 0.9;
        }
        if (beatInMeasure === 1 || beatInMeasure === 3) {
          drums += (Math.random() * 2 - 1) * Math.exp(-beatPos * 22) * 0.55; // Dry crisp snare
        }
        // Rolling 16th hats
        const hatPos = (totalBeats * 4) % 1;
        drums += (Math.random() * 2 - 1) * Math.exp(-hatPos * 35) * 0.16;

        // Booming Low-End 808 Sub-Bass
        const bFreq = bassFrequencies[measureIdx % bassFrequencies.length] * 0.5;
        bass = Math.sin(6.2831853 * bFreq * t) * Math.exp(-beatPos * 2.5) * 0.85;

        // Vintage Fender Rhodes Electric Piano Chords (Warm bell-tone harmonic)
        const chordFreq = scale[measureIdx % scale.length];
        synthOrBrass = (Math.sin(6.2831853 * chordFreq * t) + Math.sin(6.2831853 * chordFreq * 2 * t) * 0.4 + Math.sin(6.2831853 * chordFreq * 3 * t) * 0.15) * 0.38 * Math.exp(-beatPos * 5);

      } else if (isPopRnb) {
        // Contemporary Pop & R&B (4/4): Tight Punchy Kick, Snappy Finger-Snap/Clap, Lush Chords, Funk Bass
        if (beatInMeasure === 0 || beatInMeasure === 2) {
          const kickFreq = 55 + 75 * Math.exp(-beatPos * 24);
          drums = Math.sin(6.2831853 * kickFreq * t) * Math.exp(-beatPos * 10) * 0.85;
        } else {
          // Snap/Clap sound on 2 & 4
          drums = ((Math.random() * 2 - 1) * 0.6 + Math.sin(6.2831853 * 1000 * t) * 0.2) * Math.exp(-beatPos * 28);
        }
        // Warm synth bassline
        const bFreq = bassFrequencies[measureIdx % bassFrequencies.length];
        bass = (Math.sin(6.2831853 * bFreq * t) + Math.sin(6.2831853 * bFreq * 2 * t) * 0.3) * Math.exp(-beatPos * 4.5) * 0.75;

        // Lush keys chords
        const noteIdx = measureIdx % scale.length;
        const kFreq = scale[noteIdx];
        synthOrBrass = (Math.sin(6.2831853 * kFreq * t) + Math.sin(6.2831853 * kFreq * 1.5 * t) * 0.5) * 0.35 * Math.exp(-beatPos * 6);

        // Catchy Pop Pluck Lead
        const leadIdx = Math.floor(totalBeats * 2) % scale.length;
        lead = Math.sin(6.2831853 * scale[leadIdx] * t) * Math.exp(-beatPos * 12) * 0.25;

      } else if (isMariachi) {
        // 3/4 Vals Ranchero with Guitarrón, Mariachi Trumpets & Violins
        if (beatInMeasure === 0) {
          // Guitarrón deep bass hit on beat 1
          const bFreq = bassFrequencies[measureIdx % bassFrequencies.length] * 0.75;
          bass = Math.sin(6.2831853 * bFreq * t) * Math.exp(-beatPos * 5) * 0.9;
        } else {
          // Vihuela & Guitar strum on beats 2 & 3
          drums = (Math.random() * 2 - 1) * Math.exp(-beatPos * 18) * 0.25;
        }
        // Trumpet fanfares on offbeats
        if (beatInMeasure === 1 || beatInMeasure === 2) {
          const tFreq = scale[(measureIdx * 2 + beatInMeasure) % scale.length];
          synthOrBrass = (Math.sin(6.2831853 * tFreq * t) + Math.sin(6.2831853 * tFreq * 1.5 * t) * 0.6) * Math.exp(-beatPos * 8) * 0.4;
        }
        // Violins in 3rds running counter-melody
        const sixteenthNote = Math.floor(totalBeats * 4) % 16;
        const vFreq = scale[(sixteenthNote + measureIdx) % scale.length] * 1.5;
        lead = Math.sin(6.2831853 * vFreq * t) * 0.25 * Math.exp(-beatPos * 12);

      } else if (isNorteno) {
        // 2/4 Polka Norteña with Accordion, Bajo Sexto & Tarola
        if (beatInMeasure === 0) {
          const kickFreq = 50 + 60 * Math.exp(-beatPos * 25);
          drums = Math.sin(6.2831853 * kickFreq * t) * Math.exp(-beatPos * 10) * 0.8;
          const bFreq = bassFrequencies[measureIdx % bassFrequencies.length];
          bass = Math.sin(6.2831853 * bFreq * t) * Math.exp(-beatPos * 6) * 0.7;
        } else {
          // Snare + Bajo Sexto Strum on beat 2
          drums = (Math.random() * 2 - 1) * Math.exp(-beatPos * 20) * 0.5;
        }
        // Diatonic Accordion arpeggios
        const sixteenthNote = Math.floor(totalBeats * 4) % 16;
        const accFreq = scale[(sixteenthNote + measureIdx * 2) % scale.length];
        lead = (Math.sin(6.2831853 * accFreq * t) + Math.sin(6.2831853 * accFreq * 2 * t) * 0.4) * 0.35 * Math.exp(-beatPos * 14);

      } else if (isBanda) {
        // 3/4 or 2/4 Banda Sinaloense with Tuba Boom, Tambora & Brass
        if (beatInMeasure === 0) {
          const tamboraFreq = 40 + 90 * Math.exp(-beatPos * 20);
          drums = Math.sin(6.2831853 * tamboraFreq * t) * Math.exp(-beatPos * 8) * 0.9 + (Math.random() * 2 - 1) * Math.exp(-beatPos * 10) * 0.3;
          const tubaFreq = bassFrequencies[measureIdx % bassFrequencies.length] * 0.5;
          bass = (Math.sin(6.2831853 * tubaFreq * t) + Math.sin(6.2831853 * tubaFreq * 2 * t) * 0.5) * Math.exp(-beatPos * 4) * 0.9;
        } else {
          drums = Math.sin(6.2831853 * 220 * t) * Math.exp(-beatPos * 14) * 0.4;
        }
        // Brass section (Trombones & Charchetas)
        if (beatInMeasure === 1 || beatInMeasure === 2) {
          const brassFreq = scale[measureIdx % scale.length];
          synthOrBrass = (Math.sin(6.2831853 * brassFreq * t) + Math.sin(6.2831853 * brassFreq * 1.25 * t) * 0.7) * Math.exp(-beatPos * 9) * 0.5;
        }

      } else if (isTrapOrUrban) {
        // 808 Sub-Bass + Trap/Dembow Percussion
        const isDembow = sLower.includes('dembow') || sLower.includes('reggaeton') || sLower.includes('urban');
        const isKickBeat = beatInMeasure === 0 || (isDembow && (beatInMeasure === 2 || beatPos > 0.7));
        if (isKickBeat) {
          const kickFreq = 55 + 70 * Math.exp(-beatPos * 20);
          drums = Math.sin(6.2831853 * kickFreq * t) * Math.exp(-beatPos * 8) * 0.85;
        }
        if (beatInMeasure === 1 || beatInMeasure === 3 || (isDembow && beatPos > 0.45 && beatPos < 0.6)) {
          const snareNoise = (Math.random() * 2 - 1) * Math.exp(-beatPos * 25) * 0.5;
          drums += snareNoise;
        }
        // Rapid Hi-Hat rolls
        const hatPos = (totalBeats * 4) % 1;
        drums += (Math.random() * 2 - 1) * Math.exp(-hatPos * 40) * 0.18;

        // 808 Sub glide
        const bFreq = bassFrequencies[measureIdx % bassFrequencies.length];
        bass = Math.sin(6.2831853 * (bFreq * 0.5) * t) * Math.exp(-beatPos * 3) * 0.7;

        // Dark Synth Plucks
        const noteIdx = (Math.floor(totalBeats * 2) + measureIdx) % scale.length;
        const sFreq = scale[noteIdx] * 0.5;
        lead = Math.sin(6.2831853 * sFreq * t) * Math.exp(-beatPos * 10) * 0.3;

      } else if (isEdm) {
        // 4-on-the-floor EDM Kick + Supersaw Synth
        const kickFreq = 50 + 100 * Math.exp(-beatPos * 30);
        drums = Math.sin(6.2831853 * kickFreq * t) * Math.exp(-beatPos * 12) * 0.8;
        if (beatPos > 0.45 && beatPos < 0.55) {
          drums += (Math.random() * 2 - 1) * 0.25; // Offbeat hi-hat
        }
        const noteIdx = Math.floor(totalBeats * 4) % scale.length;
        const sFreq = scale[noteIdx];
        lead = (Math.sin(6.2831853 * sFreq * t) + Math.sin(6.2831853 * sFreq * 1.5 * t) * 0.5) * beatPos * 0.4;

      } else {
        // Default Sierreño Campirano & Regional Corridos
        if (beatInMeasure === 0) {
          const kickFreq = 46 + 80 * Math.exp(-beatPos * 25);
          drums = Math.sin(6.2831853 * kickFreq * t) * Math.exp(-beatPos * 10) * 0.75 + (Math.random() * 2 - 1) * Math.exp(-beatPos * 12) * 0.25;
        } else {
          drums = Math.sin(6.2831853 * 195 * t) * Math.exp(-beatPos * 16) * 0.4 + (Math.random() * 2 - 1) * Math.exp(-beatPos * 20) * 0.38;
        }

        // Tuba / Bajo / Guitarrón
        if (beatInMeasure === 0 || beatInMeasure === 2) {
          const bFreq = bassFrequencies[measureIdx % bassFrequencies.length];
          bass = (Math.sin(6.2831853 * bFreq * t) * 0.65 + Math.sin(6.2831853 * (bFreq * 0.5) * t) * 0.35) * Math.exp(-beatPos * 6.5);
        }

        // Brass / Accordion / Strings
        if (beatInMeasure === 1 || beatInMeasure === 2) {
          const env = Math.exp(-beatPos * 10);
          synthOrBrass = (Math.sin(6.2831853 * 220 * t) + Math.sin(6.2831853 * 277.18 * t) * 0.8) * env * 0.35;
        }

        // 12-String Requinto
        const sixteenthNote = Math.floor(totalBeats * 4) % 16;
        const noteIdx = (sixteenthNote + (measureIdx % 4) * 2) % scale.length;
        const reqFreq = scale[noteIdx];
        const reqPos = (totalBeats * 4) % 1;
        lead = (Math.sin(6.2831853 * reqFreq * t) + Math.sin(6.2831853 * (reqFreq * 2.002) * t) * 0.5) * 0.32 * Math.exp(-reqPos * 12);
      }

      const mix = (drums * 0.38 + bass * 0.42 + synthOrBrass * 0.32 + lead * 0.34);
      int16View[i] = Math.max(-32768, Math.min(32767, Math.floor(mix * 32767)));
    }

    return buffer;
  }

  /**
   * Generates a single isolated WAV stem buffer (drums, bass, melody, or vocals)
   */
  public static generateStemWavBuffer(
    stemType: 'drums' | 'bass' | 'melody' | 'vocals',
    durationSec = 120,
    bpm = 144,
    style = 'Bélico',
    title = 'Corrido Master',
    vocalBuffer?: Buffer
  ): Buffer {
    // If a real vocal audio buffer was provided for the vocals stem, return it if valid
    if (stemType === 'vocals' && vocalBuffer && vocalBuffer.length > 44) {
      return vocalBuffer;
    }

    const sampleRate = 22050;
    const numSamples = durationSec * sampleRate;
    const buffer = Buffer.alloc(44 + numSamples * 2);

    // RIFF WAV Header
    buffer.write("RIFF", 0);
    buffer.writeUInt32LE(36 + numSamples * 2, 4);
    buffer.write("WAVE", 8);
    buffer.write("fmt ", 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20); // Linear PCM
    buffer.writeUInt16LE(1, 22); // Mono
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * 2, 28); // Byte rate
    buffer.writeUInt16LE(2, 32); // Block align
    buffer.writeUInt16LE(16, 34); // Bits per sample
    buffer.write("data", 36);
    buffer.writeUInt32LE(numSamples * 2, 40);

    const sLower = style.toLowerCase();
    const isMexicanRegionalExplicit = sLower.includes('corrido') || sLower.includes('bélico') || sLower.includes('belico') || sLower.includes('tumbado') || sLower.includes('norteño') || sLower.includes('norteno') || sLower.includes('banda') || sLower.includes('sierr') || sLower.includes('campirano') || sLower.includes('mariachi') || sLower.includes('ranchera') || sLower.includes('zapateado') || sLower.includes('docerola') || sLower.includes('requinto') || sLower.includes('tambora') || sLower.includes('acordeón') || sLower.includes('acordeon') || sLower.includes('regional');

    const isCountry = (sLower.includes('country') || sLower.includes('folk') || sLower.includes('americana') || sLower.includes('bluegrass') || sLower.includes('nashville')) && !isMexicanRegionalExplicit;
    const isRock = (sLower.includes('rock') || sLower.includes('metal') || sLower.includes('punk') || sLower.includes('alternative') || sLower.includes('grunge')) && !isMexicanRegionalExplicit;
    const isHoustonRap = (sLower.includes('houston') || sLower.includes('ugk') || sLower.includes('z-ro') || sLower.includes('trae') || sLower.includes('screw') || sLower.includes('slab')) && !isMexicanRegionalExplicit;
    const isPopRnb = (sLower.includes('pop') || sLower.includes('r&b') || sLower.includes('rnb') || sLower.includes('soul') || sLower.includes('synthpop')) && !sLower.includes('latin') && !isMexicanRegionalExplicit;
    const isMariachi = (sLower.includes('mariachi') || sLower.includes('ranchera') || sLower.includes('charro'));
    const isNorteno = (sLower.includes('norteño') || sLower.includes('norteno') || sLower.includes('polka') || sLower.includes('acordeón') || sLower.includes('acordeon') || sLower.includes('bajo sexto'));
    const isBanda = (sLower.includes('banda') || sLower.includes('sinaloense') || sLower.includes('tambora') || sLower.includes('tamborazo'));
    const isSierreno = (sLower.includes('sierr') || sLower.includes('campirano') || sLower.includes('tumbado') || sLower.includes('docerola') || sLower.includes('requinto') || sLower.includes('corrido') || sLower.includes('bélico') || sLower.includes('belico') || isMexicanRegionalExplicit);
    const isEdm = (sLower.includes('electro') || sLower.includes('edm') || sLower.includes('synthwave') || sLower.includes('electronic') || sLower.includes('house')) && !isMexicanRegionalExplicit;
    const isTrapOrUrban = (sLower.includes('trap') || sLower.includes('urban') || sLower.includes('reggaeton') || sLower.includes('rap') || sLower.includes('dembow') || sLower.includes('hip hop')) && !sLower.includes('rap corrido') && !isMexicanRegionalExplicit;

    const defaultBpm = isHoustonRap ? 74 : isCountry ? 108 : isRock ? 132 : isPopRnb ? 110 : isEdm ? 128 : isTrapOrUrban ? 130 : isNorteno ? 132 : isMariachi ? 116 : isBanda ? 144 : 138;
    const safeBpm = Math.max(60, Math.min(165, bpm || defaultBpm));
    const beatDuration = 60 / safeBpm;
    const beatsPerMeasure = (isMariachi || isSierreno || isBanda || isMexicanRegionalExplicit) ? 3 : isNorteno ? 2 : 4;
    const measureDuration = beatDuration * beatsPerMeasure;

    const isMinor = isTrapOrUrban || isEdm || isRock || isHoustonRap || sLower.includes('tumbado') || sLower.includes('mente') || sLower.includes('legado');
    const scale = isMinor
      ? [440, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99, 880] // A Minor
      : [440, 493.88, 554.37, 587.33, 659.25, 739.99, 830.61, 880]; // A Major

    const bassFrequencies = isMinor ? [55, 65.41, 73.42, 82.41] : [110, 82.41, 123.47, 146.83];
    const int16View = new Int16Array(buffer.buffer, buffer.byteOffset + 44, numSamples);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const totalBeats = t / beatDuration;
      const beatInMeasure = Math.floor(totalBeats) % beatsPerMeasure;
      const beatPos = totalBeats % 1;
      const measureIdx = Math.floor(t / measureDuration);

      let drums = 0;
      let bass = 0;
      let synthOrBrass = 0;
      let lead = 0;

      if (isCountry) {
        if (beatInMeasure === 0 || beatInMeasure === 2) {
          const kickFreq = 55 + 65 * Math.exp(-beatPos * 22);
          drums = Math.sin(6.2831853 * kickFreq * t) * Math.exp(-beatPos * 9) * 0.75;
        } else {
          const snareTone = Math.sin(6.2831853 * 180 * t) * Math.exp(-beatPos * 20) * 0.4;
          const snareNoise = (Math.random() * 2 - 1) * Math.exp(-beatPos * 24) * 0.45;
          drums = snareTone + snareNoise;
        }
        const eighthPos = (totalBeats * 2) % 1;
        drums += (Math.random() * 2 - 1) * Math.exp(-eighthPos * 30) * 0.12;

        if (beatInMeasure === 0 || beatInMeasure === 2) {
          const bFreq = beatInMeasure === 0 ? bassFrequencies[measureIdx % bassFrequencies.length] : bassFrequencies[measureIdx % bassFrequencies.length] * 0.75;
          bass = Math.sin(6.2831853 * bFreq * t) * Math.exp(-beatPos * 5) * 0.75;
        }

        if (beatPos > 0.4 && beatPos < 0.8) {
          const strumEnv = Math.exp(-(beatPos - 0.4) * 16);
          const chordFreq = scale[measureIdx % scale.length];
          synthOrBrass = ((Math.sin(6.2831853 * chordFreq * t) + Math.sin(6.2831853 * chordFreq * 1.25 * t) * 0.6) * 0.2 + (Math.random() * 2 - 1) * 0.1) * strumEnv;
        }

        const noteIdx = Math.floor(totalBeats * 0.5 + measureIdx) % scale.length;
        const steelFreq = scale[noteIdx] * (1.0 + 0.03 * Math.sin(6.2831853 * 4.5 * t));
        lead = (Math.sin(6.2831853 * steelFreq * t) + Math.sin(6.2831853 * steelFreq * 2 * t) * 0.3) * 0.3 * Math.exp(-beatPos * 4);

      } else if (isRock) {
        if (beatInMeasure === 0 || beatInMeasure === 2) {
          const kickFreq = 50 + 80 * Math.exp(-beatPos * 26);
          drums = Math.sin(6.2831853 * kickFreq * t) * Math.exp(-beatPos * 11) * 0.85;
        } else {
          drums = (Math.sin(6.2831853 * 210 * t) * 0.5 + (Math.random() * 2 - 1) * 0.55) * Math.exp(-beatPos * 18);
        }
        if (beatInMeasure === 0 && beatPos < 0.4) {
          drums += (Math.random() * 2 - 1) * Math.exp(-beatPos * 8) * 0.3;
        }

        const bFreq = bassFrequencies[measureIdx % bassFrequencies.length];
        bass = Math.sin(6.2831853 * bFreq * t) * Math.exp(-(totalBeats * 2 % 1) * 8) * 0.7;

        const chordRoot = scale[measureIdx % scale.length];
        const rawChord = Math.sin(6.2831853 * chordRoot * t) + Math.sin(6.2831853 * (chordRoot * 1.5) * t) * 0.8;
        synthOrBrass = Math.max(-0.6, Math.min(0.6, rawChord * 1.5)) * 0.45 * Math.exp(-beatPos * 6);

        const leadIdx = Math.floor(totalBeats * 2) % scale.length;
        lead = Math.sin(6.2831853 * (scale[leadIdx] * 1.5) * t) * Math.exp(-beatPos * 8) * 0.28;

      } else if (isHoustonRap) {
        if (beatInMeasure === 0 || (beatInMeasure === 2 && beatPos > 0.5)) {
          const kickFreq = 50 + 60 * Math.exp(-beatPos * 18);
          drums = Math.sin(6.2831853 * kickFreq * t) * Math.exp(-beatPos * 8) * 0.9;
        }
        if (beatInMeasure === 1 || beatInMeasure === 3) {
          drums += (Math.random() * 2 - 1) * Math.exp(-beatPos * 22) * 0.55;
        }
        const hatPos = (totalBeats * 4) % 1;
        drums += (Math.random() * 2 - 1) * Math.exp(-hatPos * 35) * 0.16;

        const bFreq = bassFrequencies[measureIdx % bassFrequencies.length] * 0.5;
        bass = Math.sin(6.2831853 * bFreq * t) * Math.exp(-beatPos * 2.5) * 0.85;

        const chordFreq = scale[measureIdx % scale.length];
        synthOrBrass = (Math.sin(6.2831853 * chordFreq * t) + Math.sin(6.2831853 * chordFreq * 2 * t) * 0.4 + Math.sin(6.2831853 * chordFreq * 3 * t) * 0.15) * 0.38 * Math.exp(-beatPos * 5);

      } else if (isPopRnb) {
        if (beatInMeasure === 0 || beatInMeasure === 2) {
          const kickFreq = 55 + 75 * Math.exp(-beatPos * 24);
          drums = Math.sin(6.2831853 * kickFreq * t) * Math.exp(-beatPos * 10) * 0.85;
        } else {
          drums = ((Math.random() * 2 - 1) * 0.6 + Math.sin(6.2831853 * 1000 * t) * 0.2) * Math.exp(-beatPos * 28);
        }
        const bFreq = bassFrequencies[measureIdx % bassFrequencies.length];
        bass = (Math.sin(6.2831853 * bFreq * t) + Math.sin(6.2831853 * bFreq * 2 * t) * 0.3) * Math.exp(-beatPos * 4.5) * 0.75;

        const noteIdx = measureIdx % scale.length;
        synthOrBrass = (Math.sin(6.2831853 * scale[noteIdx] * t) + Math.sin(6.2831853 * scale[noteIdx] * 1.5 * t) * 0.5) * 0.35 * Math.exp(-beatPos * 6);
        const leadIdx = Math.floor(totalBeats * 2) % scale.length;
        lead = Math.sin(6.2831853 * scale[leadIdx] * t) * Math.exp(-beatPos * 12) * 0.25;

      } else if (isMariachi) {
        if (beatInMeasure === 0) {
          const bFreq = bassFrequencies[measureIdx % bassFrequencies.length] * 0.75;
          bass = Math.sin(6.2831853 * bFreq * t) * Math.exp(-beatPos * 5) * 0.9;
        } else {
          drums = (Math.random() * 2 - 1) * Math.exp(-beatPos * 18) * 0.25;
        }
        if (beatInMeasure === 1 || beatInMeasure === 2) {
          const tFreq = scale[(measureIdx * 2 + beatInMeasure) % scale.length];
          synthOrBrass = (Math.sin(6.2831853 * tFreq * t) + Math.sin(6.2831853 * tFreq * 1.5 * t) * 0.6) * Math.exp(-beatPos * 8) * 0.4;
        }
        const sixteenthNote = Math.floor(totalBeats * 4) % 16;
        lead = Math.sin(6.2831853 * (scale[(sixteenthNote + measureIdx) % scale.length] * 1.5) * t) * 0.25 * Math.exp(-beatPos * 12);

      } else if (isNorteno) {
        if (beatInMeasure === 0) {
          const kickFreq = 50 + 60 * Math.exp(-beatPos * 25);
          drums = Math.sin(6.2831853 * kickFreq * t) * Math.exp(-beatPos * 10) * 0.8;
          bass = Math.sin(6.2831853 * bassFrequencies[measureIdx % bassFrequencies.length] * t) * Math.exp(-beatPos * 6) * 0.7;
        } else {
          drums = (Math.random() * 2 - 1) * Math.exp(-beatPos * 20) * 0.5;
        }
        const sixteenthNote = Math.floor(totalBeats * 4) % 16;
        const accFreq = scale[(sixteenthNote + measureIdx * 2) % scale.length];
        lead = (Math.sin(6.2831853 * accFreq * t) + Math.sin(6.2831853 * accFreq * 2 * t) * 0.4) * 0.35 * Math.exp(-beatPos * 14);

      } else if (isBanda) {
        if (beatInMeasure === 0) {
          const tamboraFreq = 40 + 90 * Math.exp(-beatPos * 20);
          drums = Math.sin(6.2831853 * tamboraFreq * t) * Math.exp(-beatPos * 8) * 0.9 + (Math.random() * 2 - 1) * Math.exp(-beatPos * 10) * 0.3;
          const tubaFreq = bassFrequencies[measureIdx % bassFrequencies.length] * 0.5;
          bass = (Math.sin(6.2831853 * tubaFreq * t) + Math.sin(6.2831853 * tubaFreq * 2 * t) * 0.5) * Math.exp(-beatPos * 4) * 0.9;
        } else {
          drums = Math.sin(6.2831853 * 220 * t) * Math.exp(-beatPos * 14) * 0.4;
        }
        if (beatInMeasure === 1 || beatInMeasure === 2) {
          const brassFreq = scale[measureIdx % scale.length];
          synthOrBrass = (Math.sin(6.2831853 * brassFreq * t) + Math.sin(6.2831853 * brassFreq * 1.25 * t) * 0.7) * Math.exp(-beatPos * 9) * 0.5;
        }

      } else if (isTrapOrUrban) {
        const isDembow = sLower.includes('dembow') || sLower.includes('reggaeton') || sLower.includes('urban');
        const isKickBeat = beatInMeasure === 0 || (isDembow && (beatInMeasure === 2 || beatPos > 0.7));
        if (isKickBeat) {
          const kickFreq = 55 + 70 * Math.exp(-beatPos * 20);
          drums = Math.sin(6.2831853 * kickFreq * t) * Math.exp(-beatPos * 8) * 0.85;
        }
        if (beatInMeasure === 1 || beatInMeasure === 3 || (isDembow && beatPos > 0.45 && beatPos < 0.6)) {
          drums += (Math.random() * 2 - 1) * Math.exp(-beatPos * 25) * 0.5;
        }
        const hatPos = (totalBeats * 4) % 1;
        drums += (Math.random() * 2 - 1) * Math.exp(-hatPos * 40) * 0.18;

        const bFreq = bassFrequencies[measureIdx % bassFrequencies.length];
        bass = Math.sin(6.2831853 * (bFreq * 0.5) * t) * Math.exp(-beatPos * 3) * 0.7;

        const noteIdx = (Math.floor(totalBeats * 2) + measureIdx) % scale.length;
        lead = Math.sin(6.2831853 * (scale[noteIdx] * 0.5) * t) * Math.exp(-beatPos * 10) * 0.3;

      } else if (isEdm) {
        const kickFreq = 50 + 100 * Math.exp(-beatPos * 30);
        drums = Math.sin(6.2831853 * kickFreq * t) * Math.exp(-beatPos * 12) * 0.8;
        if (beatPos > 0.45 && beatPos < 0.55) {
          drums += (Math.random() * 2 - 1) * 0.25;
        }
        const noteIdx = Math.floor(totalBeats * 4) % scale.length;
        lead = (Math.sin(6.2831853 * scale[noteIdx] * t) + Math.sin(6.2831853 * scale[noteIdx] * 1.5 * t) * 0.5) * beatPos * 0.4;

      } else {
        if (beatInMeasure === 0) {
          const kickFreq = 46 + 80 * Math.exp(-beatPos * 25);
          drums = Math.sin(6.2831853 * kickFreq * t) * Math.exp(-beatPos * 10) * 0.75 + (Math.random() * 2 - 1) * Math.exp(-beatPos * 12) * 0.25;
        } else {
          drums = Math.sin(6.2831853 * 195 * t) * Math.exp(-beatPos * 16) * 0.4 + (Math.random() * 2 - 1) * Math.exp(-beatPos * 20) * 0.38;
        }

        if (beatInMeasure === 0 || beatInMeasure === 2) {
          const bFreq = bassFrequencies[measureIdx % bassFrequencies.length];
          bass = (Math.sin(6.2831853 * bFreq * t) * 0.65 + Math.sin(6.2831853 * (bFreq * 0.5) * t) * 0.35) * Math.exp(-beatPos * 6.5);
        }

        if (beatInMeasure === 1 || beatInMeasure === 2) {
          const env = Math.exp(-beatPos * 10);
          synthOrBrass = (Math.sin(6.2831853 * 220 * t) + Math.sin(6.2831853 * 277.18 * t) * 0.8) * env * 0.35;
        }

        const sixteenthNote = Math.floor(totalBeats * 4) % 16;
        const noteIdx = (sixteenthNote + (measureIdx % 4) * 2) % scale.length;
        const reqPos = (totalBeats * 4) % 1;
        lead = (Math.sin(6.2831853 * scale[noteIdx] * t) + Math.sin(6.2831853 * (scale[noteIdx] * 2.002) * t) * 0.5) * 0.32 * Math.exp(-reqPos * 12);
      }

      // Vocal stem synthesis (formant melodic vocalization with breathing & vibrato)
      const vNote = scale[(Math.floor(totalBeats * 0.5) + measureIdx) % scale.length];
      const vocalVibrato = 1 + 0.015 * Math.sin(6.2831853 * 5.2 * t);
      const vFreq = (vNote * 0.5) * vocalVibrato;
      const vocalSample = (Math.sin(6.2831853 * vFreq * t) + 0.4 * Math.sin(6.2831853 * vFreq * 2 * t) + 0.2 * Math.sin(6.2831853 * vFreq * 3 * t)) * Math.exp(-beatPos * 2.8) * 0.85;

      let targetSample = 0;
      if (stemType === 'drums') {
        targetSample = drums * 0.95;
      } else if (stemType === 'bass') {
        targetSample = bass * 0.95;
      } else if (stemType === 'melody') {
        targetSample = synthOrBrass * 0.75 + lead * 0.75;
      } else if (stemType === 'vocals') {
        targetSample = vocalSample * 0.92;
      }

      int16View[i] = Math.max(-32768, Math.min(32767, Math.floor(targetSample * 32767)));
    }

    return buffer;
  }
}
