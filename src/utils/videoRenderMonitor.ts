/**
 * Video Render Monitoring & High-Fidelity Request Builder Helper Module
 * Tracks, validates, and logs complete JSON bodies for Veo video rendering API requests,
 * ensuring style tokens, camera motion parameters, and lyric-sync data are explicitly sent.
 */

export interface VideoRenderPayload {
  prompt: string;
  lyrics: Array<{ type: string; text: string }>;
  styleTokens: {
    genre: string;
    aesthetic: string;
    mood: string;
    cameraMotion: string;
    lightingStyle: string;
  };
  audioReferences: {
    audioUrl?: string;
    songHash?: string;
    tempo?: string | number;
    musicalKey?: string;
  };
  imageBase64?: string | null;
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p' | '4k';
  model: string;
  songTitle: string;
  artistName: string;
  timestamp: string;
}

export class VideoRenderMonitor {
  /**
   * Builds the comprehensive high-fidelity video rendering payload.
   */
  static buildPayload(params: {
    prompt: string;
    lyrics: Array<{ type: string; text: string }>;
    genre: string;
    cameraMotion: string;
    lightingStyle: string;
    audioUrl?: string;
    songHash?: string;
    tempo?: string | number;
    musicalKey?: string;
    imageBase64?: string | null;
    aspectRatio: '16:9' | '9:16';
    resolution: '720p' | '1080p' | '4k';
    model: string;
    songTitle: string;
    artistName?: string;
  }): VideoRenderPayload {
    const payload: VideoRenderPayload = {
      prompt: params.prompt,
      lyrics: params.lyrics,
      styleTokens: {
        genre: params.genre || 'Cinematic Music Video',
        aesthetic: 'ARRI Alexa 65 • 35mm Master Anamorphic • 4K UHD Master',
        mood: 'High-Energy Cinematic / Immersive',
        cameraMotion: params.cameraMotion || 'cinematic_drone',
        lightingStyle: params.lightingStyle || 'Golden Hour / Volumetric Rim Lighting'
      },
      audioReferences: {
        audioUrl: params.audioUrl,
        songHash: params.songHash,
        tempo: params.tempo || '128 BPM',
        musicalKey: params.musicalKey || 'D Minor'
      },
      imageBase64: params.imageBase64 || null,
      aspectRatio: params.aspectRatio,
      resolution: params.resolution,
      model: params.model,
      songTitle: params.songTitle,
      artistName: params.artistName || 'Corrido AI Sovereign Artist',
      timestamp: new Date().toISOString()
    };

    return payload;
  }

  /**
   * Logs the complete JSON body to the console with professional formatting and tracing metadata.
   */
  static logTrace(payload: VideoRenderPayload): void {
    console.group(`[VideoRenderMonitor] 🎬 PRODUCTION VIDEO RENDER REQUEST TRACE`);
    console.log(`%cSong Title:`, `color: #f59e0b; font-weight: bold;`, payload.songTitle);
    console.log(`%cModel:`, `color: #38bdf8; font-weight: bold;`, payload.model);
    console.log(`%cResolution / Aspect:`, `color: #10b981; font-weight: bold;`, `${payload.resolution} (${payload.aspectRatio})`);
    console.log(`%cStyle Tokens:`, `color: #a855f7; font-weight: bold;`, payload.styleTokens);
    console.log(`%cCamera Motion:`, `color: #ec4899; font-weight: bold;`, payload.styleTokens.cameraMotion);
    console.log(`%cLilyc-Sync Count:`, `color: #6366f1; font-weight: bold;`, `${payload.lyrics.length} stanzas loaded`);
    console.log(`%cComplete JSON Payload Body:`, `color: #fbbf24; font-weight: bold;`, JSON.stringify(payload, null, 2));
    console.groupEnd();
  }

  /**
   * Dispatches the monitored render request to the production backend endpoint.
   */
  static async dispatchRender(endpoint: string, payload: VideoRenderPayload): Promise<any> {
    this.logTrace(payload);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Monitor': 'VideoRenderMonitor-v1.5'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Video rendering endpoint failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    console.log(`[VideoRenderMonitor] 📥 Server Render Response Received:`, data);
    return data;
  }
}
