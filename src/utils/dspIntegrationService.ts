/**
 * DSPIntegrationService (Client Interface)
 * Interfaces with the server-side DSP endpoints to authenticate, look up ISRC records,
 * and trigger automated release submissions to Spotify, Apple Music, and Tidal.
 */

import { StandardizedReleaseMetadata } from './distributionEngine';

export interface DSPSubmissionResult {
  dsp: 'spotify' | 'apple_music' | 'tidal';
  success: boolean;
  status: 'submitted' | 'processing' | 'approved' | 'live' | 'qc_failed';
  batchId: string;
  trackingUrl?: string;
  deliveryTimestamp: string;
  expectedLiveDate: string;
  details: {
    isrc: string;
    upc: string;
    audioFormatAccepted: string;
    artworkDimensionsAccepted: string;
    metadataValidated: boolean;
    directStoreUri?: string;
    notes?: string[];
  };
}

export interface ISRCLookupResult {
  isrc: string;
  foundInDSP: {
    spotify?: {
      found: boolean;
      trackId?: string;
      trackName?: string;
      artists?: string[];
      previewUrl?: string;
      popularity?: number;
      externalUrl?: string;
    };
    appleMusic?: {
      found: boolean;
      songId?: string;
      name?: string;
      artistName?: string;
      albumName?: string;
      url?: string;
    };
    tidal?: {
      found: boolean;
      trackId?: string;
      title?: string;
      artistName?: string;
      audioQuality?: 'LOSSLESS' | 'HI_RES' | 'HIGH';
      url?: string;
    };
  };
}

export interface EditorialPitchPackage {
  dsp: 'spotify' | 'apple_music' | 'tidal';
  releaseId: string;
  songTitle: string;
  artistName: string;
  isrc: string;
  genre: string;
  subgenres: string[];
  moods: string[];
  featuredInstruments: string[];
  lyricTheme: string;
  targetPlaylists: string[];
  editorialStory: string;
  marketingPlan: string;
  socialMediaReachEstimate: number;
  pitchSubmissionStatus: 'ready' | 'submitted';
}

export class DSPIntegrationService {
  /**
   * Authenticate with a DSP service (Spotify, Apple Music, Tidal)
   */
  public static async authenticate(
    dsp: 'spotify' | 'apple_music' | 'tidal',
    credentials?: { clientId?: string; clientSecret?: string; teamId?: string; keyId?: string; privateKey?: string }
  ): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const res = await fetch('/api/distribution/dsp/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dsp, credentials })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Look up track status across Spotify, Apple Music, and Tidal by ISRC
   */
  public static async lookupByISRC(isrc: string): Promise<ISRCLookupResult | null> {
    try {
      const res = await fetch('/api/distribution/dsp/lookup-isrc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isrc })
      });
      const data = await res.json();
      return data.success && data.result ? data.result : null;
    } catch {
      return null;
    }
  }

  /**
   * Submit an individual release to Spotify, Apple Music, or Tidal
   */
  public static async submitTrackToDSP(
    dsp: 'spotify' | 'apple_music' | 'tidal',
    release: Partial<StandardizedReleaseMetadata>
  ): Promise<DSPSubmissionResult | null> {
    try {
      const res = await fetch('/api/distribution/dsp/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dsp, release })
      });
      const data = await res.json();
      return data.success && data.result ? data.result : null;
    } catch {
      return null;
    }
  }

  /**
   * Submit a release in parallel to all major DSPs
   */
  public static async submitReleaseToAllDSPs(
    release: Partial<StandardizedReleaseMetadata>,
    targetDsps: string[] = ['spotify', 'apple_music', 'tidal']
  ): Promise<{ success: boolean; results: DSPSubmissionResult[]; overallBatchId?: string; error?: string }> {
    try {
      const res = await fetch('/api/distribution/dsp/submit-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ release, targetDsps })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, results: [], error: e.message };
    }
  }

  /**
   * Generate an editorial playlist pitch package for Spotify for Artists & Apple Music
   */
  public static async generateEditorialPitch(
    release: Partial<StandardizedReleaseMetadata>,
    pitchDetails?: { instruments?: string[]; moods?: string[]; story?: string; marketingPlan?: string }
  ): Promise<EditorialPitchPackage | null> {
    try {
      const res = await fetch('/api/distribution/dsp/pitch-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ release, pitchDetails })
      });
      const data = await res.json();
      return data.success && data.pitch ? data.pitch : null;
    } catch {
      return null;
    }
  }
}
