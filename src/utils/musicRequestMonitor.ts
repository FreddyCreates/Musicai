/**
 * Music Generation Monitoring & Request Parameter Tracker Helper Module
 * 
 * Tracks, validates, and logs complete JSON payloads for music generation,
 * lyric composition, and audio rendering API requests to ensure accurate
 * mapping of user-selected genres (e.g. Corrido, Bélico, Norteño, Banda, Rap, Country)
 * to their respective model presets without falling back to incorrect genres.
 */

export interface MusicRequestLogPayload {
  endpoint: string;
  songTitle?: string;
  userSelectedGenre?: string;
  genreCategory?: string;
  musicalGenreTag?: string;
  bandInspiration?: string;
  primaryLanguage?: string;
  tempoBpm?: number | string;
  instrumentation?: string;
  lyricsCount?: number;
  model?: string;
  fullBody: Record<string, any>;
  timestamp: string;
}

export class MusicRequestMonitor {
  private static logs: MusicRequestLogPayload[] = [];

  /**
   * Tracks and formats music generation API parameters
   */
  public static logRequest(endpoint: string, body: Record<string, any>): MusicRequestLogPayload {
    const logEntry: MusicRequestLogPayload = {
      endpoint,
      songTitle: body.title || body.name || body.cleanTitle || 'Untitled Track',
      userSelectedGenre: body.style || body.genre || body.userSelectedGenre || 'Unspecified (Defaulting to Corrido Bélico)',
      genreCategory: body.genreCategory,
      musicalGenreTag: body.musicalGenreTag,
      bandInspiration: body.bandInspiration,
      primaryLanguage: body.primaryLanguage || 'es',
      tempoBpm: body.tempoBpm || body.tempo || 144,
      instrumentation: body.instrumentation || body.instrument,
      lyricsCount: Array.isArray(body.lyrics) ? body.lyrics.length : (body.lyrics ? 1 : 0),
      model: body.model || 'lyria-3-pro-preview',
      fullBody: body,
      timestamp: new Date().toISOString()
    };

    this.logs.push(logEntry);
    if (this.logs.length > 50) this.logs.shift();

    // Professional console grouping and trace
    console.group(`[MusicRequestMonitor] 🎵 MUSIC GENERATION API REQUEST: ${endpoint}`);
    console.log(`%cSong / Protagonist:`, `color: #f59e0b; font-weight: bold;`, logEntry.songTitle);
    console.log(`%cSelected Genre / Style:`, `color: #10b981; font-weight: bold;`, logEntry.userSelectedGenre);
    console.log(`%cGenre Mapping Target:`, `color: #38bdf8; font-weight: bold;`, {
      category: logEntry.genreCategory || 'Regional Mexican',
      tag: logEntry.musicalGenreTag || 'Corrido Bélico',
      inspiration: logEntry.bandInspiration || 'Modern Banda / 12-String Requinto',
      language: logEntry.primaryLanguage
    });
    console.log(`%cTempo / Instrumentation:`, `color: #a855f7; font-weight: bold;`, `${logEntry.tempoBpm} BPM | ${logEntry.instrumentation || 'Full Band'}`);
    console.log(`%cComplete Request Body:`, `color: #fbbf24; font-weight: bold;`, JSON.stringify(body, null, 2));
    console.groupEnd();

    return logEntry;
  }

  /**
   * Dispatches monitored fetch request with validation tracing
   */
  public static async dispatchMonitoredMusicRequest(endpoint: string, body: Record<string, any>): Promise<any> {
    this.logRequest(endpoint, body);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Music-Monitor': 'MusicRequestMonitor-v2.0'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[MusicRequestMonitor] ❌ Music generation request failed (${response.status}):`, errText);
      throw new Error(`Music endpoint failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    console.log(`[MusicRequestMonitor] 📥 Received Successful Music Response:`, {
      audioUrl: data.audioUrl ? (data.audioUrl.slice(0, 50) + '...') : 'N/A',
      duration: data.duration,
      tempo: data.tempo,
      model: data.model
    });
    return data;
  }

  /**
   * Retrieves recent request history
   */
  public static getHistory(): MusicRequestLogPayload[] {
    return [...this.logs];
  }
}
