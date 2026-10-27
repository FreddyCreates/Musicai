/**
 * Safe API response parser to prevent "Unexpected token '<', '<!doctype' is not valid JSON" errors
 */

export async function safeParseJson<T = any>(response: Response, fallbackValue?: T): Promise<T> {
  try {
    const text = await response.text();
    if (!text || !text.trim()) {
      if (fallbackValue !== undefined) return fallbackValue;
      return {} as T;
    }

    const trimmed = text.trim();
    if (trimmed.startsWith('<') || trimmed.toLowerCase().startsWith('<!doctype')) {
      console.warn(`[safeParseJson] Received HTML response instead of JSON from ${response.url || 'endpoint'} (Status: ${response.status})`);
      if (fallbackValue !== undefined) {
        return fallbackValue;
      }
      throw new Error(`El servidor respondió con código ${response.status}. Intenta de nuevo.`);
    }

    return JSON.parse(trimmed) as T;
  } catch (err: any) {
    if (fallbackValue !== undefined) {
      return fallbackValue;
    }
    throw new Error(err.message || 'Error al procesar la respuesta del servidor');
  }
}

export async function safeFetchJson<T = any>(url: string, options?: RequestInit, fallbackValue?: T): Promise<{ ok: boolean; status: number; data: T }> {
  try {
    const res = await fetch(url, options);
    const data = await safeParseJson<T>(res, fallbackValue);
    return {
      ok: res.ok,
      status: res.status,
      data
    };
  } catch (err: any) {
    console.warn(`[safeFetchJson] Failed request to ${url}:`, err);
    return {
      ok: false,
      status: 500,
      data: (fallbackValue !== undefined ? fallbackValue : { error: err.message }) as T
    };
  }
}
