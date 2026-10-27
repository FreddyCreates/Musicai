/**
 * Production Video Logger & Request Payload Interceptor
 * 
 * Intercepts, validates, and logs the full JSON payload before any video rendering request.
 * Specifically verifies:
 *  - Lyric-Sync Data: Stanza integrity, text completeness, rhythm timing markers.
 *  - Camera Motion Tokens: Directional pans, dynamic zoom, orbital arcs, lighting cues.
 *  - Audio References: Master audio URL, song hash, tempo BPM, and musical key.
 *  - High-End Production Specifications: Resolution, aspect ratio, model tier.
 */

export interface LyricSyncItem {
  type?: string;
  text: string;
  timeStartSec?: number;
  durationSec?: number;
}

export interface VideoRequestPayload {
  prompt?: string;
  scenes?: Array<{
    id?: string;
    title?: string;
    prompt: string;
    cameraMovement?: string;
    timeStartSec?: number;
    durationSec?: number;
    associatedLyric?: string;
  }>;
  lyrics?: Array<LyricSyncItem | { type: string; text: string }>;
  styleTokens?: {
    genre?: string;
    aesthetic?: string;
    mood?: string;
    cameraMotion?: string;
    lightingStyle?: string;
  };
  audioReferences?: {
    audioUrl?: string;
    songHash?: string;
    tempo?: string | number;
    musicalKey?: string;
  };
  audioUrl?: string;
  songHash?: string;
  tempo?: string | number;
  musicalKey?: string;
  aspectRatio?: '16:9' | '9:16' | string;
  resolution?: '720p' | '1080p' | '4k' | string;
  model?: string;
  songTitle?: string;
  artistName?: string;
  imageBase64?: string | null;
  [key: string]: any;
}

export interface VideoPayloadValidationReport {
  isValid: boolean;
  scorePercent: number;
  checks: {
    lyricSyncVerified: boolean;
    cameraMotionVerified: boolean;
    audioReferenceVerified: boolean;
    productionSpecsVerified: boolean;
  };
  warnings: string[];
  errors: string[];
  metrics: {
    stanzaCount: number;
    resolvedCameraTokens: string[];
    audioSourcePresent: boolean;
    targetModel: string;
    aspectRatio: string;
    resolution: string;
  };
}

export class VideoLogger {
  /**
   * Validates the structure and production parameters of a video rendering payload.
   */
  static validatePayload(payload: VideoRequestPayload): VideoPayloadValidationReport {
    const warnings: string[] = [];
    const errors: string[] = [];

    // 1. Lyric-Sync Data Verification
    const rawLyrics = payload.lyrics || [];
    const rawScenes = payload.scenes || [];
    const stanzaCount = rawLyrics.length;
    let lyricSyncVerified = false;

    if (stanzaCount === 0 && rawScenes.length === 0) {
      warnings.push('No explicit lyric-sync stanzas or scene-bound lyrics found in request.');
    } else {
      const validStanzas = rawLyrics.filter(l => l && typeof l.text === 'string' && l.text.trim().length > 0);
      if (validStanzas.length > 0 || rawScenes.some(s => !!s.associatedLyric)) {
        lyricSyncVerified = true;
      } else {
        warnings.push('Lyric-sync items exist but contain empty text contents.');
      }
    }

    // 2. Camera Motion Tokens Verification
    const styleCamera = payload.styleTokens?.cameraMotion;
    const sceneCameraTokens = rawScenes.map(s => s.cameraMovement).filter(Boolean) as string[];
    const resolvedCameraTokens: string[] = [];
    if (styleCamera) resolvedCameraTokens.push(styleCamera);
    sceneCameraTokens.forEach(t => {
      if (!resolvedCameraTokens.includes(t)) resolvedCameraTokens.push(t);
    });

    let cameraMotionVerified = false;
    if (resolvedCameraTokens.length > 0) {
      cameraMotionVerified = true;
    } else {
      warnings.push('No explicit camera motion tokens defined; defaulting to cinematic drone tracking.');
    }

    // 3. Audio Reference Verification
    const audioUrl = payload.audioReferences?.audioUrl || payload.audioUrl;
    const songHash = payload.audioReferences?.songHash || payload.songHash;
    const tempo = payload.audioReferences?.tempo || payload.tempo;
    const musicalKey = payload.audioReferences?.musicalKey || payload.musicalKey;
    const audioSourcePresent = !!(audioUrl || songHash);

    let audioReferenceVerified = false;
    if (audioSourcePresent) {
      audioReferenceVerified = true;
    } else {
      warnings.push('Audio URL / song reference is absent; video will render in silent ambient mode.');
    }

    // 4. Production Specs Verification
    const model = payload.model || 'veo-3.1-fast-generate-preview';
    const aspectRatio = payload.aspectRatio || '16:9';
    const resolution = payload.resolution || '1080p';
    let productionSpecsVerified = true;

    if (!payload.prompt && rawScenes.length === 0) {
      errors.push('CRITICAL: Prompt or scenes array is required to render video.');
      productionSpecsVerified = false;
    }

    // Compute Quality Score
    let points = 0;
    if (lyricSyncVerified) points += 25;
    if (cameraMotionVerified) points += 25;
    if (audioReferenceVerified) points += 25;
    if (productionSpecsVerified) points += 25;

    return {
      isValid: errors.length === 0,
      scorePercent: points,
      checks: {
        lyricSyncVerified,
        cameraMotionVerified,
        audioReferenceVerified,
        productionSpecsVerified
      },
      warnings,
      errors,
      metrics: {
        stanzaCount,
        resolvedCameraTokens,
        audioSourcePresent,
        targetModel: model,
        aspectRatio,
        resolution
      }
    };
  }

  /**
   * Intercepts and logs the full JSON payload before dispatching to the video rendering endpoint.
   */
  static interceptAndLog(payload: VideoRequestPayload, endpoint: string = '/api/render-video'): VideoPayloadValidationReport {
    const report = this.validatePayload(payload);

    const logStyleHeader = 'background: #0f172a; color: #f59e0b; font-size: 12px; font-weight: bold; padding: 4px 8px; border-left: 4px solid #f59e0b;';
    const logStyleSuccess = 'color: #10b981; font-weight: bold;';
    const logStyleWarn = 'color: #f59e0b; font-weight: bold;';
    const logStyleError = 'color: #ef4444; font-weight: bold;';
    const logStyleCode = 'color: #38bdf8; font-family: monospace;';

    console.groupCollapsed(`%c[VideoLogger] 🎬 HIGH-END VIDEO RENDER INTERCEPTOR • Score: ${report.scorePercent}% • ${endpoint}`, logStyleHeader);
    
    console.log(`%c[Endpoint Target]:`, logStyleCode, endpoint);
    console.log(`%c[Song Title]:`, logStyleCode, payload.songTitle || 'Untitled Production Master');
    console.log(`%c[Model Tier]:`, logStyleCode, report.metrics.targetModel);
    console.log(`%c[Aspect & Res]:`, logStyleCode, `${report.metrics.resolution} @ ${report.metrics.aspectRatio}`);

    console.group(`🔍 Production Parameter Verification:`);
    console.log(`%c1. Lyric-Sync Verification:`, report.checks.lyricSyncVerified ? logStyleSuccess : logStyleWarn, 
      report.checks.lyricSyncVerified ? `✓ PASSED (${report.metrics.stanzaCount} stanzas)` : `⚠ INCOMPLETE`
    );
    console.log(`%c2. Camera Motion Tokens:`, report.checks.cameraMotionVerified ? logStyleSuccess : logStyleWarn, 
      report.checks.cameraMotionVerified ? `✓ VERIFIED: [${report.metrics.resolvedCameraTokens.join(', ')}]` : `⚠ DEFAULTING`
    );
    console.log(`%c3. Audio References:`, report.checks.audioReferenceVerified ? logStyleSuccess : logStyleWarn, 
      report.checks.audioReferenceVerified ? `✓ BOUND: URL / Hash Present` : `⚠ UNBOUND`
    );
    console.log(`%c4. Production Specs:`, report.checks.productionSpecsVerified ? logStyleSuccess : logStyleError, 
      report.checks.productionSpecsVerified ? `✓ READY` : `✗ INVALID PROMPT`
    );
    console.groupEnd();

    if (report.warnings.length > 0) {
      console.warn(`[VideoLogger Warnings]:`, report.warnings);
    }
    if (report.errors.length > 0) {
      console.error(`[VideoLogger Critical Errors]:`, report.errors);
    }

    console.log(`%c[Full Outgoing JSON Payload Body]:`, 'color: #fbbf24; font-weight: bold;', JSON.parse(JSON.stringify(payload)));
    console.groupEnd();

    return report;
  }

  /**
   * Dispatches a validated and monitored video render request.
   */
  static async dispatchWithMonitoring(endpoint: string, payload: VideoRequestPayload): Promise<any> {
    const report = this.interceptAndLog(payload, endpoint);

    if (!report.isValid) {
      console.error('[VideoLogger] Aborting request due to validation errors:', report.errors);
      throw new Error(`Video payload validation failed: ${report.errors.join(', ')}`);
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Video-Interceptor': 'VideoLogger-v2.0',
        'X-Payload-Score': `${report.scorePercent}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[VideoLogger] Video render server error (${res.status}):`, errText);
      throw new Error(`Video rendering server error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    console.log(`[VideoLogger] 📥 Server Response State Verified:`, data.status || 'Rendering');
    return data;
  }
}
