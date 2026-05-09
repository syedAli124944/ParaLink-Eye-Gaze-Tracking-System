/**
 * Text-to-Speech Service
 * 3-Layer Fallback:
 *   1. Backend gTTS (http://localhost:8000/tts) — best quality
 *   2. Browser SpeechSynthesis — instant, but lacks Urdu/Arabic on most browsers
 *   3. Google Translate TTS — reliable fallback for ALL languages including Urdu & Arabic
 */

const LANGUAGE_CODES = {
  en: 'en-US',
  ur: 'ur-PK',
  ar: 'ar-SA',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
};

// Google Translate TTS uses short language codes
const GTTS_LANG_CODES = {
  en: 'en',
  ur: 'ur',
  ar: 'ar',
  es: 'es',
  fr: 'fr',
  de: 'de',
};

const EMOTION_TRANSLATIONS = {
  'Pain': {
    en: 'I am in pain',
    ur: 'مجھے درد ہے',
    ar: 'أنا في ألم',
    es: 'Tengo dolor',
    fr: 'J\'ai mal',
    de: 'Ich habe Schmerzen',
  },
  'Happy': {
    en: 'I am happy',
    ur: 'میں خوش ہوں',
    ar: 'أنا سعيد',
    es: 'Estoy feliz',
    fr: 'Je suis heureux',
    de: 'Ich bin glücklich',
  },
  'Sad': {
    en: 'I am sad',
    ur: 'میں اداس ہوں',
    ar: 'أنا حزين',
    es: 'Estoy triste',
    fr: 'Je suis triste',
    de: 'Ich bin traurig',
  },
  'Hungry': {
    en: 'I am hungry',
    ur: 'مجھے بھوک لگی ہے',
    ar: 'أنا جائع',
    es: 'Tengo hambre',
    fr: 'J\'ai faim',
    de: 'Ich habe Hunger',
  },
  'Washroom': {
    en: 'I need the washroom',
    ur: 'مجھے واش روم جانا ہے',
    ar: 'أحتاج إلى الحمام',
    es: 'Necesito el baño',
    fr: 'J\'ai besoin des toilettes',
    de: 'Ich brauche die Toilette',
  },
  'Tired': {
    en: 'I am tired',
    ur: 'میں تھکا ہوا ہوں',
    ar: 'أنا متعب',
    es: 'Estoy cansado',
    fr: 'Je suis fatigué',
    de: 'Ich bin müde',
  },
  'Thirsty': {
    en: 'I am thirsty',
    ur: 'مجھے پیاس لگی ہے',
    ar: 'أنا عطشان',
    es: 'Tengo sed',
    fr: 'J\'ai soif',
    de: 'Ich habe Durst',
  },
  'Cold': {
    en: 'I am cold',
    ur: 'مجھے ٹھنڈ لگ رہی ہے',
    ar: 'أنا بارد',
    es: 'Tengo frío',
    fr: 'J\'ai froid',
    de: 'Mir ist kalt',
  },
  'Hot': {
    en: 'I am hot',
    ur: 'مجھے گرمی لگ رہی ہے',
    ar: 'أنا حار',
    es: 'Tengo calor',
    fr: 'J\'ai chaud',
    de: 'Mir ist heiß',
  },
  'Communication': {
    en: 'Communication',
    ur: 'رابطہ',
    ar: 'تواصل',
    es: 'Comunicación',
    fr: 'Communication',
    de: 'Kommunikation',
  },
  'News': {
    en: 'News',
    ur: 'خبریں',
    ar: 'أخبار',
    es: 'Noticias',
    fr: 'Actualités',
    de: 'Nachrichten',
  },
  'Emergency': {
    en: 'Emergency',
    ur: 'ہنگامی',
    ar: 'طوارئ',
    es: 'Emergencia',
    fr: 'Urgence',
    de: 'Notfall',
  },
};

export class TtsService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.currentLanguage = 'en';
    this.isSupported = 'speechSynthesis' in window;
    this.currentAudio = null;
    this.fetchAbortController = null;
    
    if (!this.isSupported) {
      console.warn('TTS Service: Web Speech API not supported in this browser');
    }
  }

  /**
   * Speak text in the current language using 3-layer fallback
   */
  async speak(text, language) {
    if (!text) return;

    // Cancel any ongoing speech and pending network requests
    this.stop();

    if (this.fetchAbortController) {
      this.fetchAbortController.abort();
    }
    this.fetchAbortController = new AbortController();

    const lang = language || this.currentLanguage;
    const translatedText = this.translate(text, lang);
    
    // Layer 1: Try backend gTTS (best quality, works for all languages)
    try {
      const response = await fetch('http://localhost:8000/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: translatedText, language: lang }),
        signal: this.fetchAbortController.signal
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`[TTS] ✅ Backend gTTS success for "${lang}"`);
        
        if (this.fetchAbortController.signal.aborted) return;
        this.stop(); 
        
        this.currentAudio = new Audio(`http://localhost:8000${data.audio_url}`);
        this.currentAudio.play().catch(e => console.warn('Audio play blocked:', e));
        return;
      }
    } catch (e) {
      console.warn('[TTS] Backend offline. Trying browser fallback...', e.message);
    }

    // Layer 2: Try Browser SpeechSynthesis (only if voice exists for this language)
    if (this.isSupported) {
      const hasVoice = this._hasVoiceForLanguage(lang);
      
      if (hasVoice) {
        console.log(`[TTS] ✅ Browser voice found for "${lang}", using SpeechSynthesis`);
        this._speakWithBrowserTTS(translatedText, lang);
        return;
      } else {
        console.warn(`[TTS] ⚠️ No browser voice for "${lang}" — skipping to Google Translate`);
      }
    }

    // Layer 3: Google Translate TTS (reliable for Urdu, Arabic, and all languages)
    console.log(`[TTS] 🌐 Using Google Translate TTS for "${lang}"`);
    this._playGoogleTranslateTTS(translatedText, lang);
  }

  /**
   * Check if the browser has a voice for the given language
   */
  _hasVoiceForLanguage(lang) {
    const voices = this.synth.getVoices();
    const langCode = LANGUAGE_CODES[lang] || 'en-US';
    const langPrefix = langCode.split('-')[0];
    
    return voices.some(v => 
      v.lang === langCode || 
      v.lang.startsWith(langPrefix) || 
      v.lang.startsWith(lang)
    );
  }

  /**
   * Layer 2: Browser SpeechSynthesis
   */
  _speakWithBrowserTTS(text, lang) {
    const speakNow = () => {
      this.synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.lang = LANGUAGE_CODES[lang] || 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      const voices = this.synth.getVoices();
      const langCode = LANGUAGE_CODES[lang] || 'en-US';
      const voice = voices.find(v => v.lang === langCode) ||
                    voices.find(v => v.lang.startsWith(langCode.split('-')[0])) ||
                    voices.find(v => v.lang.startsWith(lang)) ||
                    voices.find(v => v.lang.startsWith('en')) ||
                    voices[0];
      
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onerror = (event) => console.error('TTS Error:', event);
      this.synth.speak(utterance);
    };

    const voices = this.synth.getVoices();
    if (voices.length > 0) {
      speakNow();
    } else {
      this.synth.addEventListener('voiceschanged', speakNow, { once: true });
      setTimeout(speakNow, 500);
    }
  }

  /**
   * Layer 3: Google Translate TTS — works for ALL languages including Urdu & Arabic
   */
  _playGoogleTranslateTTS(text, lang) {
    try {
      const gttsLang = GTTS_LANG_CODES[lang] || 'en';
      const encodedText = encodeURIComponent(text);
      
      // Google Translate TTS URL — reliable and supports Urdu, Arabic, etc.
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${gttsLang}&client=tw-ob&q=${encodedText}`;
      
      this.stop();
      this.currentAudio = new Audio(url);
      this.currentAudio.play().catch(e => {
        console.warn('[TTS] Google Translate TTS failed:', e);
        // Final fallback: try browser TTS anyway (better than silence)
        if (this.isSupported) {
          this._speakWithBrowserTTS(text, 'en');
        }
      });
    } catch (e) {
      console.error('[TTS] All TTS methods failed:', e);
    }
  }

  /** Translate text to target language */
  translate(text, language) {
    if (EMOTION_TRANSLATIONS[text]) {
      return EMOTION_TRANSLATIONS[text][language] || text;
    }
    return text;
  }

  /** Stop current speech */
  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.removeAttribute('src');
      this.currentAudio.load();
      this.currentAudio = null;
    }
    if (this.isSupported && this.synth.speaking) {
      this.synth.cancel();
    }
  }

  /** Set default language */
  setLanguage(language) {
    this.currentLanguage = language;
    console.log(`TTS Service: Language set to ${language}`);
  }

  /** Get current language */
  getLanguage() {
    return this.currentLanguage;
  }

  /** Check if TTS is supported */
  isTtsSupported() {
    return this.isSupported;
  }

  /** Get available languages */
  getAvailableLanguages() {
    return [
      { code: 'en', name: 'English' },
      { code: 'ur', name: 'Urdu' },
      { code: 'ar', name: 'Arabic' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
    ];
  }
}

// Singleton instance
export const ttsService = new TtsService();
