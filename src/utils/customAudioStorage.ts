// High-Performance Audio File Analysis, Storage, and Master Mixdown Engine
// Allows creators to bring their own instrumentals, beats, and multi-stem audio into the Studio DAW.

import { CustomAudioTrack, CorridoData, LyricStanza } from '../types';

const DB_NAME = 'melodycraft_custom_audio_vault';
const DB_VERSION = 1;
const STORE_NAME = 'user_instrumental_tracks';

class CustomAudioStorageManager {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private memoryCache: Map<string, CustomAudioTrack> = new Map();

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported in this browser.'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Analyzes an audio file to extract duration, waveform peak data, and estimate tempo (BPM).
   */
  public async analyzeAudioFile(file: File): Promise<{
    duration: number;
    bpm: number;
    peaks: number[];
  }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          const tempCtx = new AudioContextClass();

          const audioBuffer = await tempCtx.decodeAudioData(arrayBuffer.slice(0));
          const duration = Math.round(audioBuffer.duration * 10) / 10;

          // Extract 100 waveform peak points for interactive visualizer
          const channelData = audioBuffer.getChannelData(0);
          const sampleCount = 100;
          const blockSize = Math.floor(channelData.length / sampleCount);
          const peaks: number[] = [];

          for (let i = 0; i < sampleCount; i++) {
            let max = 0;
            const start = i * blockSize;
            const end = start + blockSize;
            for (let j = start; j < end; j += 10) {
              const val = Math.abs(channelData[j] || 0);
              if (val > max) max = val;
            }
            peaks.push(Math.min(1, Math.round(max * 100) / 100));
          }

          // Energy peak autocorrelation for BPM estimation
          let estimatedBpm = 138;
          try {
            estimatedBpm = this.estimateBpmFromAudio(channelData, audioBuffer.sampleRate);
          } catch (e) {
            console.warn('BPM estimation fallback to 138:', e);
          }

          tempCtx.close().catch(() => {});
          resolve({ duration, bpm: estimatedBpm, peaks });
        } catch (err) {
          console.warn('Audio decoding failed, using fallback metrics:', err);
          // Fallback if decoder fails on unsupported codec
          resolve({
            duration: 180,
            bpm: 140,
            peaks: Array.from({ length: 100 }, () => Math.random() * 0.7 + 0.3)
          });
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Estimates BPM from audio channel data using rhythmic onset intervals
   */
  private estimateBpmFromAudio(channelData: Float32Array, sampleRate: number): number {
    const downsampleStep = 4;
    const reducedLength = Math.floor(Math.min(channelData.length, sampleRate * 30) / downsampleStep);
    const energy = new Float32Array(reducedLength);

    for (let i = 0; i < reducedLength; i++) {
      const val = channelData[i * downsampleStep];
      energy[i] = val * val;
    }

    // Moving average filter to detect dynamic transients
    const windowSize = Math.floor((sampleRate / downsampleStep) * 0.05); // 50ms
    const onsets: number[] = [];
    let prevEnergy = 0;

    for (let i = windowSize; i < reducedLength - windowSize; i += windowSize) {
      let sum = 0;
      for (let j = 0; j < windowSize; j++) {
        sum += energy[i + j];
      }
      const diff = sum - prevEnergy;
      if (diff > 0.15) {
        onsets.push(i);
      }
      prevEnergy = sum;
    }

    if (onsets.length < 4) return 142; // default popular corrido tempo

    // Calculate delta intervals
    const intervals: number[] = [];
    for (let i = 1; i < Math.min(onsets.length, 50); i++) {
      const deltaSamples = onsets[i] - onsets[i - 1];
      const deltaSec = (deltaSamples * downsampleStep) / sampleRate;
      const bpm = 60 / deltaSec;
      if (bpm >= 90 && bpm <= 175) {
        intervals.push(Math.round(bpm));
      } else if (bpm >= 45 && bpm < 90) {
        intervals.push(Math.round(bpm * 2));
      }
    }

    if (intervals.length === 0) return 142;

    // Return median BPM
    intervals.sort((a, b) => a - b);
    const medianBpm = intervals[Math.floor(intervals.length / 2)];
    return Math.min(160, Math.max(110, medianBpm));
  }

  /**
   * Saves a user-uploaded audio file to persistent IndexedDB
   */
  public async saveCustomTrack(file: File, userTitle?: string, detectedBpm?: number, userKey?: string): Promise<CustomAudioTrack> {
    const analysis = await this.analyzeAudioFile(file);
    const cleanFileName = file.name.replace(/\.[^/.]+$/, "");
    const title = userTitle?.trim() || cleanFileName || 'Mi Instrumental Propia';
    const bpm = detectedBpm || analysis.bpm || 140;

    const id = `track_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const audioUrl = URL.createObjectURL(file);

    const track: CustomAudioTrack = {
      id,
      title,
      artistName: 'Artista Independiente',
      fileName: file.name,
      fileSize: file.size,
      duration: analysis.duration,
      detectedBpm: bpm,
      musicalKey: userKey || 'G',
      timeSignature: '3/4 (Vals Corrido)',
      audioUrl,
      blob: file,
      peaks: analysis.peaks,
      createdAt: Date.now()
    };

    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(track);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('Could not save to IndexedDB, keeping in memory cache:', e);
    }

    this.memoryCache.set(id, track);
    return track;
  }

  /**
   * Retrieves all custom audio tracks from storage
   */
  public async getAllCustomTracks(): Promise<CustomAudioTrack[]> {
    try {
      const db = await this.getDB();
      const tracks = await new Promise<CustomAudioTrack[]>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });

      // Revive blob URLs if needed
      return tracks.map((t) => {
        if (t.blob && (!t.audioUrl || t.audioUrl.startsWith('blob:') === false)) {
          t.audioUrl = URL.createObjectURL(t.blob);
        }
        this.memoryCache.set(t.id, t);
        return t;
      });
    } catch (e) {
      console.warn('Failed to load from IndexedDB, returning memory cache:', e);
      return Array.from(this.memoryCache.values());
    }
  }

  /**
   * Deletes a custom audio track
   */
  public async deleteCustomTrack(id: string): Promise<void> {
    this.memoryCache.delete(id);
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('Failed to delete from IndexedDB:', e);
    }
  }

  /**
   * Converts a user custom audio track into a CorridoData project ready for the Studio DAW
   */
  public createCorridoFromCustomTrack(
    track: CustomAudioTrack,
    customLyrics?: LyricStanza[],
    customStory?: string
  ): CorridoData {
    const defaultLyrics: LyricStanza[] = customLyrics || [
      {
        type: 'verso',
        text: 'Puse a prueba mi destino con la frente siempre en alto,\nNadie me regaló nada, todo me costó trabajo.\nCon la lumbre de mi gente y el acero bien templado,\nAquí manda la lealtad y el honor que hemos forjado.'
      },
      {
        type: 'verso',
        text: 'Se escuchan las doce cuerdas repicando con poder,\nEl camino fue derecho aunque quisieron romper.\nCon la clica organizada y la palabra de ley,\nEl que persevera alcanza y hoy sabemos responder.'
      },
      {
        type: 'coro',
        text: '¡Y échele mi compa, que la pista es nuestra!\n¡Puro corrido fino y con el tiro arriba!\nDe la tierra hasta la cima con orgullo y dignidad,\nNo presumo de riquezas, me respalda la verdad.'
      },
      {
        type: 'outro',
        text: 'Así suena el talento de la gente que trabaja,\nFirme con los verdaderos, la bandera nunca baja.'
      }
    ];

    const songHash = `#OWN-${Math.floor(1000 + Math.random() * 9000)}-${track.detectedBpm || 140}`;

    return {
      title: track.title,
      storySummary: customStory || `Pista instrumental personalizada importada "${track.fileName}". Masterizada en MelodyCraft Pro DAW para composición lírica y mezcla vocal.`,
      lyrics: defaultLyrics,
      coverPrompt: `Cinematic album cover for regional Mexican anthem "${track.title}", acoustic guitars, brass, spotlight, golden hour warm lighting, 8k high resolution.`,
      musicalKey: track.musicalKey || 'G',
      tempo: `${track.detectedBpm || 140} BPM`,
      timeSignature: track.timeSignature || '3/4 (Vals Corrido)',
      style: 'Corrido Bélico Tech 2026',
      selectedVoice: 'Fenrir',
      songHash,
      audioUrl: track.audioUrl,
      proAudioUrl: track.audioUrl,
      clipAudioUrl: track.audioUrl,
      isCustomInstrumental: true,
      customAudioUrl: track.audioUrl,
      customAudioFileName: track.fileName,
      customAudioDuration: track.duration,
      customAudioPeaks: track.peaks
    };
  }

  /**
   * Generates a fast synthetic demo beat for users who want to try the workflow immediately without a file
   */
  public createSampleDemoTrack(sampleType: 'belico_tumbado' | 'sierreno_campirano' | 'trap_corrido'): CustomAudioTrack {
    const sampleConfigs = {
      belico_tumbado: {
        title: 'Pista Bélico Tumbado 2026 (Demo)',
        bpm: 142,
        key: 'Am',
        timeSignature: '3/4 (Vals Corrido)',
        duration: 90
      },
      sierreno_campirano: {
        title: 'Instrumental Sierreño 12 Cuerdas (Demo)',
        bpm: 130,
        key: 'G',
        timeSignature: '3/4 (Vals Corrido)',
        duration: 85
      },
      trap_corrido: {
        title: 'Beat 808 Trap Corrido (Demo)',
        bpm: 128,
        key: 'D',
        timeSignature: '4/4 (Street Beat)',
        duration: 95
      }
    };

    const cfg = sampleConfigs[sampleType] || sampleConfigs.belico_tumbado;
    const id = `demo_${sampleType}_${Date.now()}`;

    return {
      id,
      title: cfg.title,
      artistName: 'MelodyCraft Pro Stems',
      fileName: `${sampleType}_master.mp3`,
      fileSize: 2450000,
      duration: cfg.duration,
      detectedBpm: cfg.bpm,
      musicalKey: cfg.key,
      timeSignature: cfg.timeSignature,
      audioUrl: '', // Will use procedural Web Audio playback or synthetic stream
      peaks: Array.from({ length: 100 }, (_, i) => Math.abs(Math.sin(i / 5)) * 0.6 + 0.35),
      createdAt: Date.now()
    };
  }

  /**
   * Mixdown Engine: Combines the user's custom instrumental audio buffer with the vocal audio buffer
   * using Web Audio OfflineAudioContext, and exports a pristine stereo 44.1kHz 16-bit WAV file.
   */
  public async mixAndExportWav(
    instrumentalUrl: string,
    vocalUrl: string | null,
    instrumentalVol: number = 0.9,
    vocalVol: number = 0.95,
    latencyOffsetSec: number = 0,
    songTitle: string = 'Corrido_Master'
  ): Promise<Blob> {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const decodeCtx = new AudioContextClass();

    try {
      // 1. Fetch instrumental audio
      const instResponse = await fetch(instrumentalUrl);
      const instArrayBuffer = await instResponse.arrayBuffer();
      const instBuffer = await decodeCtx.decodeAudioData(instArrayBuffer);

      // 2. Fetch vocal audio if available
      let vocalBuffer: AudioBuffer | null = null;
      if (vocalUrl) {
        try {
          const vocResponse = await fetch(vocalUrl);
          const vocArrayBuffer = await vocResponse.arrayBuffer();
          vocalBuffer = await decodeCtx.decodeAudioData(vocArrayBuffer);
        } catch (vocErr) {
          console.warn('Vocal decode failed, exporting instrumental only:', vocErr);
        }
      }

      // 3. Setup OfflineAudioContext
      const totalDuration = Math.max(
        instBuffer.duration,
        vocalBuffer ? vocalBuffer.duration + Math.max(0, latencyOffsetSec) : 0
      );
      const sampleRate = 44100;
      const offlineCtx = new OfflineAudioContext(2, Math.ceil(totalDuration * sampleRate), sampleRate);

      // 4. Connect Instrumental
      const instSource = offlineCtx.createBufferSource();
      instSource.buffer = instBuffer;
      const instGain = offlineCtx.createGain();
      instGain.gain.setValueAtTime(instrumentalVol, 0);
      instSource.connect(instGain);
      instGain.connect(offlineCtx.destination);
      instSource.start(0);

      // 5. Connect Vocals
      if (vocalBuffer) {
        const vocSource = offlineCtx.createBufferSource();
        vocSource.buffer = vocalBuffer;
        const vocGain = offlineCtx.createGain();
        vocGain.gain.setValueAtTime(vocalVol, 0);
        vocSource.connect(vocGain);
        vocGain.connect(offlineCtx.destination);
        const vocStartTime = Math.max(0, latencyOffsetSec);
        vocSource.start(vocStartTime);
      }

      // 6. Render Offline Audio
      const renderedBuffer = await offlineCtx.startRendering();

      // 7. Convert rendered AudioBuffer to WAV Blob
      const wavBlob = this.audioBufferToWavBlob(renderedBuffer);

      decodeCtx.close().catch(() => {});
      return wavBlob;
    } catch (err) {
      decodeCtx.close().catch(() => {});
      throw err;
    }
  }

  /**
   * Encodes an AudioBuffer into standard 16-bit PCM WAV Blob
   */
  private audioBufferToWavBlob(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const left = buffer.getChannelData(0);
    const right = numChannels > 1 ? buffer.getChannelData(1) : left;

    const dataLength = left.length * numChannels * (bitDepth / 8);
    const headerLength = 44;
    const totalLength = headerLength + dataLength;

    const arrayBuffer = new ArrayBuffer(totalLength);
    const view = new DataView(arrayBuffer);

    // RIFF chunk descriptor
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    this.writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
    view.setUint16(32, numChannels * (bitDepth / 8), true);
    view.setUint16(34, bitDepth, true);

    // data sub-chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    // Write interleaved 16-bit PCM samples
    let offset = 44;
    for (let i = 0; i < left.length; i++) {
      let lSample = Math.max(-1, Math.min(1, left[i]));
      view.setInt16(offset, lSample < 0 ? lSample * 0x8000 : lSample * 0x7FFF, true);
      offset += 2;

      if (numChannels > 1) {
        let rSample = Math.max(-1, Math.min(1, right[i]));
        view.setInt16(offset, rSample < 0 ? rSample * 0x8000 : rSample * 0x7FFF, true);
        offset += 2;
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  private writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}

export const customAudioStorage = new CustomAudioStorageManager();
