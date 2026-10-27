import { useState, useCallback, useRef } from 'react';
import { safeParseJson } from '../utils/apiHelper';

export interface LyriaProgress {
  bytesReceived: number;
  formattedSize: string;
  status: string;
}

export interface LyriaTrackParams {
  title: string;
  lyrics: any[];
  style: string;
  tempo?: number | string;
  prompt?: string;
  songHash?: string;
  chosenOption?: 'A' | 'B';
  instrumentation?: string;
  protagonistName?: string;
}

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Hook 1: Dedicated Lyria 3 Pro Track (2-3 min Master)
 * Completely isolated state, HTTP chunk stream reader, and buffer.
 */
export interface UseLyriaProTrackResult {
  isGeneratingPro: boolean;
  proProgress: LyriaProgress | null;
  proAudioUrl: string | null;
  proError: string | null;
  generateProTrack: (params: LyriaTrackParams) => Promise<string | null>;
  setProAudioUrl: (url: string | null) => void;
  clearProError: () => void;
  abortProStream: () => void;
}

export const useLyriaProTrack = (initialProUrl?: string | null): UseLyriaProTrackResult => {
  const [isGeneratingPro, setIsGeneratingPro] = useState(false);
  const [proProgress, setProProgress] = useState<LyriaProgress | null>(null);
  const [proAudioUrl, setProAudioUrl] = useState<string | null>(initialProUrl || null);
  const [proError, setProError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const abortProStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGeneratingPro(false);
    setProProgress(null);
  }, []);

  const clearProError = useCallback(() => {
    setProError(null);
  }, []);

  const generateProTrack = useCallback(async (params: LyriaTrackParams): Promise<string | null> => {
    setIsGeneratingPro(true);
    setProError(null);
    setProProgress({ bytesReceived: 0, formattedSize: '0 KB', status: 'Conectando con Lyria 3 Pro Master...' });

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/generate-music/pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          title: params.title,
          lyrics: params.lyrics,
          style: params.style,
          tempo: params.tempo || 120,
          songHash: params.songHash,
          instrumentation: params.instrumentation,
          protagonistName: params.protagonistName,
          chosenOption: params.chosenOption || 'A',
          prompt: params.prompt || `Canción de Corrido Master: ${params.title}`
        })
      });

      if (!response.ok) {
        const errJson = await safeParseJson(response, { error: 'Error en la conexión con Lyria 3 Pro' });
        throw new Error(errJson?.error || `Error ${response.status} de Lyria 3 Pro`);
      }

      const data = await safeParseJson<any>(response, {});
      if (!data || !data.audioUrl) {
        throw new Error('No se recibió la pista de audio para la canción completa de 2 minutos.');
      }

      setProAudioUrl(data.audioUrl);
      const bytes = data.sizeBytes || 0;
      setProProgress({
        bytesReceived: bytes,
        formattedSize: formatBytes(bytes),
        status: `¡Master completo generado con éxito! (${formatBytes(bytes)} - ~${Math.round((data.duration || 120) / 60)} min)`
      });

      return data.audioUrl;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        console.log('[Lyria Pro] Stream aborted by user.');
        return null;
      }
      console.error('[useLyriaProTrack] Pro generation error:', err);
      const msg = err?.message || 'Error al conectar directamente con Lyria 3 Pro.';
      setProError(msg);
      return null;
    } finally {
      setIsGeneratingPro(false);
      abortControllerRef.current = null;
    }
  }, []);

  return {
    isGeneratingPro,
    proProgress,
    proAudioUrl,
    proError,
    generateProTrack,
    setProAudioUrl,
    clearProError,
    abortProStream
  };
};

/**
 * Hook 2: Dedicated Lyria 3 Clip Track (45s Preview Clip)
 * Completely isolated state, HTTP chunk stream reader, and buffer.
 */
export interface UseLyriaClipTrackResult {
  isGeneratingClip: boolean;
  isGeneratingTake2: boolean;
  clipProgress: LyriaProgress | null;
  clipAudioUrl: string | null;
  take2AudioUrl: string | null;
  take1Flavor: string;
  take2Flavor: string;
  songHash: string | null;
  chosenOption: 'A' | 'B';
  activeTake: 1 | 2;
  clipError: string | null;
  generateClipTrack: (params: LyriaTrackParams) => Promise<string | null>;
  generateTake2Track: (params: LyriaTrackParams) => Promise<string | null>;
  generateDualClips: (params: LyriaTrackParams) => Promise<{ take1: string | null; take2: string | null; songHash?: string }>;
  setActiveTake: (take: 1 | 2) => void;
  setChosenOption: (opt: 'A' | 'B') => void;
  setClipAudioUrl: (url: string | null) => void;
  setTake2AudioUrl: (url: string | null) => void;
  setSongHash: (hash: string | null) => void;
  clearClipError: () => void;
  abortClipStream: () => void;
}

export const useLyriaClipTrack = (initialClipUrl?: string | null): UseLyriaClipTrackResult => {
  const [isGeneratingClip, setIsGeneratingClip] = useState(false);
  const [isGeneratingTake2, setIsGeneratingTake2] = useState(false);
  const [clipProgress, setClipProgress] = useState<LyriaProgress | null>(null);
  const [clipAudioUrl, setClipAudioUrl] = useState<string | null>(initialClipUrl || null);
  const [take2AudioUrl, setTake2AudioUrl] = useState<string | null>(null);
  const [take1Flavor, setTake1Flavor] = useState<string>('Opción A: Arreglo Enérgico Moderno (~126 BPM)');
  const [take2Flavor, setTake2Flavor] = useState<string>('Opción B: Arreglo Campirano Acústico (~114 BPM)');
  const [songHash, setSongHash] = useState<string | null>(null);
  const [chosenOption, setChosenOption] = useState<'A' | 'B'>('A');
  const [activeTake, setActiveTake] = useState<1 | 2>(1);
  const [clipError, setClipError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const abortClipStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGeneratingClip(false);
    setIsGeneratingTake2(false);
    setClipProgress(null);
  }, []);

  const clearClipError = useCallback(() => {
    setClipError(null);
  }, []);

  // Generate Take 1: Flavor A (Bélico Rápido - 126 BPM, with Vocals and Song Lyrics)
  const generateClipTrack = useCallback(async (params: LyriaTrackParams): Promise<string | null> => {
    setIsGeneratingClip(true);
    setClipError(null);
    setClipProgress({ bytesReceived: 0, formattedSize: '0 KB', status: 'Creando Opción A (Arreglo Enérgico Moderno - 45s)...' });

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/generate-music/clip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          title: params.title,
          lyrics: params.lyrics,
          style: params.style,
          tempo: params.tempo || 120,
          take: 1,
          songHash: params.songHash,
          instrumentation: params.instrumentation,
          protagonistName: params.protagonistName,
          prompt: params.prompt || `Muestra 45s Opción A con voz: ${params.title}`
        })
      });

      if (!response.ok) {
        const errJson = await safeParseJson(response, { error: 'Error en la conexión con Lyria 3 Clip' });
        throw new Error(errJson?.error || `Error ${response.status} de Lyria 3 Clip`);
      }

      const data = await safeParseJson<any>(response, {});
      if (data && data.audioUrl) {
        setClipAudioUrl(data.audioUrl);
        if (data.flavor) setTake1Flavor(data.flavor);
        if (data.songHash) setSongHash(data.songHash);
        setClipProgress({
          bytesReceived: data.sizeBytes || 0,
          formattedSize: formatBytes(data.sizeBytes || 0),
          status: '¡Opción A (Arreglo Enérgico Moderno) lista!'
        });
        return data.audioUrl;
      }
      throw new Error('No se recibió la URL de audio para la Opción A.');
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        console.log('[Lyria Clip] Opción A cancelada.');
        return null;
      }
      console.error('[useLyriaClipTrack] Opción A error:', err);
      const msg = err?.message || 'Error al generar Opción A con Lyria 3 Clip.';
      setClipError(msg);
      return null;
    } finally {
      setIsGeneratingClip(false);
    }
  }, []);

  // Generate Take 2: Flavor B (Campirano Lento - 114 BPM, with Vocals and the same Song Lyrics)
  const generateTake2Track = useCallback(async (params: LyriaTrackParams): Promise<string | null> => {
    setIsGeneratingTake2(true);
    setClipError(null);
    setClipProgress({ bytesReceived: 0, formattedSize: '0 KB', status: 'Creando Opción B (Arreglo Campirano Acústico - 45s)...' });

    const controller = new AbortController();

    try {
      const response = await fetch('/api/generate-music/clip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          title: params.title,
          lyrics: params.lyrics,
          style: params.style,
          tempo: params.tempo || 120,
          take: 2,
          songHash: params.songHash,
          instrumentation: params.instrumentation,
          protagonistName: params.protagonistName,
          prompt: params.prompt || `Muestra 45s Opción B con voz: ${params.title}`
        })
      });

      if (!response.ok) {
        const errJson = await safeParseJson(response, { error: 'Error en la conexión con Lyria 3 Clip' });
        throw new Error(errJson?.error || `Error ${response.status} de Lyria 3 Clip`);
      }

      const data = await safeParseJson<any>(response, {});
      if (data && data.audioUrl) {
        setTake2AudioUrl(data.audioUrl);
        if (data.flavor) setTake2Flavor(data.flavor);
        if (data.songHash) setSongHash(data.songHash);
        return data.audioUrl;
      }
      return null;
    } catch (err: any) {
      console.error('[useLyriaClipTrack] Opción B generation error:', err);
      return null;
    } finally {
      setIsGeneratingTake2(false);
    }
  }, []);

  // Unified Single-Click Generator: Generates both Option A and Option B simultaneously
  const generateDualClips = useCallback(async (params: LyriaTrackParams) => {
    setIsGeneratingClip(true);
    setIsGeneratingTake2(true);
    setClipError(null);
    setClipProgress({ bytesReceived: 0, formattedSize: '0 KB', status: 'Generando simultáneamente ambas opciones (Enérgica y Campirana)...' });

    try {
      const response = await fetch('/api/generate-music/dual-clips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: params.title,
          lyrics: params.lyrics,
          style: params.style,
          tempo: params.tempo || 120,
          instrumentation: params.instrumentation,
          protagonistName: params.protagonistName,
          prompt: params.prompt,
          songHash: params.songHash
        })
      });

      if (!response.ok) {
        // Fallback to parallel single calls
        console.warn('Dual-clips route error, falling back to parallel generation...');
        const [take1, take2] = await Promise.all([
          generateClipTrack(params),
          generateTake2Track(params)
        ]);
        return { take1, take2 };
      }

      const data = await safeParseJson<any>(response, {});
      let take1Url: string | null = null;
      let take2Url: string | null = null;

      if (data && data.optionA?.audioUrl) {
        take1Url = data.optionA.audioUrl;
        setClipAudioUrl(take1Url);
        if (data.optionA.flavor) setTake1Flavor(data.optionA.flavor);
      }
      if (data && data.optionB?.audioUrl) {
        take2Url = data.optionB.audioUrl;
        setTake2AudioUrl(take2Url);
        if (data.optionB.flavor) setTake2Flavor(data.optionB.flavor);
      }

      // If one option was missing in the dual response, generate it individually to guarantee both are available
      if (!take1Url) {
        console.warn("[generateDualClips] Opción A missing from dual response, generating individually...");
        take1Url = await generateClipTrack(params);
      }
      if (!take2Url) {
        console.warn("[generateDualClips] Opción B missing from dual response, generating individually...");
        take2Url = await generateTake2Track(params);
      }

      if (data.songHash) {
        setSongHash(data.songHash);
      }

      setClipProgress({
        bytesReceived: (data.optionA?.sizeBytes || 0) + (data.optionB?.sizeBytes || 0),
        formattedSize: formatBytes((data.optionA?.sizeBytes || 0) + (data.optionB?.sizeBytes || 0)),
        status: '¡Ambas opciones musicales generadas con éxito!'
      });

      return { take1: take1Url, take2: take2Url, songHash: data.songHash };
    } catch (err: any) {
      console.error('generateDualClips error:', err);
      // Fallback
      const [take1, take2] = await Promise.all([
        generateClipTrack(params),
        generateTake2Track(params)
      ]);
      return { take1, take2 };
    } finally {
      setIsGeneratingClip(false);
      setIsGeneratingTake2(false);
    }
  }, [generateClipTrack, generateTake2Track]);

  return {
    isGeneratingClip,
    isGeneratingTake2,
    clipProgress,
    clipAudioUrl,
    take2AudioUrl,
    take1Flavor,
    take2Flavor,
    songHash,
    chosenOption,
    activeTake,
    clipError,
    generateClipTrack,
    generateTake2Track,
    generateDualClips,
    setActiveTake,
    setChosenOption,
    setClipAudioUrl,
    setTake2AudioUrl,
    setSongHash,
    clearClipError,
    abortClipStream
  };
};

/**
 * Combined helper hook for backwards compatibility or single-surface coordination.
 */
export interface UseLyriaMusicResult extends UseLyriaProTrackResult, UseLyriaClipTrackResult {
  extendClipToProTrack: (params: LyriaTrackParams) => Promise<string | null>;
}

export const useLyriaMusic = (initialProUrl?: string | null, initialClipUrl?: string | null): UseLyriaMusicResult => {
  const pro = useLyriaProTrack(initialProUrl);
  const clip = useLyriaClipTrack(initialClipUrl);

  const extendClipToProTrack = useCallback(async (params: LyriaTrackParams): Promise<string | null> => {
    return pro.generateProTrack(params);
  }, [pro]);

  return {
    ...pro,
    ...clip,
    extendClipToProTrack
  };
};
