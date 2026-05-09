/**
 * API Service — Centralized Backend Communication
 * ==================================================
 * All frontend-to-backend API calls go through this service.
 * Handles errors gracefully with fallback behavior.
 *
 * Backend URL: http://localhost:8000
 */

const API_BASE_URL = 'http://localhost:8000';

/**
 * Generic fetch wrapper with error handling and logging.
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    console.log(`[API] ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[API] Error ${response.status}: ${errorBody}`);
      throw new Error(`API Error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    console.log(`[API] Response from ${endpoint}:`, data);
    return data;
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      console.warn(`[API] Backend offline — is the server running at ${API_BASE_URL}?`);
    } else {
      console.error(`[API] Request failed:`, error);
    }
    throw error;
  }
}

// ──────────────────────────────────────────────
// API Methods
// ──────────────────────────────────────────────

/**
 * Health check — test if backend is running.
 * GET /health
 */
export async function checkHealth() {
  return apiFetch('/health');
}

/**
 * Main selection API — send user action to backend.
 * POST /select
 *
 * @param {string} type - "communication", "device", or "emergency"
 * @param {string} value - Action ID (e.g. "hungry", "light_on", "nurse")
 * @param {string} language - Language code (e.g. "en", "ur", "ar")
 * @returns {Promise<{message, translated_message, audio_url, device_status, esp32_response, type}>}
 */
export async function sendSelection(type, value, language = 'en') {
  return apiFetch('/select', {
    method: 'POST',
    body: JSON.stringify({ type, value, language }),
  });
}

/**
 * Get smart suggestions based on usage history.
 * GET /suggestions
 */
export async function getSuggestions() {
  return apiFetch('/suggestions');
}

/**
 * Get recent action history.
 * GET /history
 */
export async function getHistory() {
  return apiFetch('/history');
}

/**
 * Get current IoT device states.
 * GET /devices/status
 */
export async function getDeviceStatus() {
  return apiFetch('/devices/status');
}

/**
 * Play audio from a backend-generated URL.
 * Falls back to browser TTS if audio fails.
 *
 * @param {string} audioUrl - Relative URL from backend (e.g. "/audio/file.mp3")
 * @param {string} fallbackText - Text to speak via browser TTS if audio fails
 * @param {string} language - Language code for fallback TTS
 */
export function playBackendAudio(audioUrl, fallbackText, language = 'en') {
  if (!audioUrl) {
    console.warn('[API] No audio URL, using browser TTS fallback');
    _browserTtsFallback(fallbackText, language);
    return;
  }

  const fullUrl = `${API_BASE_URL}${audioUrl}`;
  console.log(`[API] Playing audio: ${fullUrl}`);

  const audio = new Audio(fullUrl);

  audio.onended = () => {
    console.log('[API] Audio playback completed');
  };

  audio.onerror = (e) => {
    console.warn('[API] Audio playback failed, falling back to browser TTS', e);
    _browserTtsFallback(fallbackText, language);
  };

  audio.play().catch((err) => {
    console.warn('[API] Audio play() failed:', err);
    _browserTtsFallback(fallbackText, language);
  });
}

/**
 * Browser-based TTS fallback when backend audio is unavailable.
 */
function _browserTtsFallback(text, language) {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);

  const langMap = { en: 'en-US', ur: 'ur-PK', ar: 'ar-SA', es: 'es-ES', fr: 'fr-FR', de: 'de-DE' };
  utterance.lang = langMap[language] || 'en-US';
  utterance.rate = 0.9;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
}

export { API_BASE_URL };
