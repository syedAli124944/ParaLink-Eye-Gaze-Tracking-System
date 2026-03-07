/**
 * Text-to-Speech Service
 * Uses Web Speech API for multilingual voice output
 */

const LANGUAGE_CODES = {
  en: 'en-US',
  ur: 'ur-PK',
  ar: 'ar-SA',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
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
    
    if (!this.isSupported) {
      console.warn('TTS Service: Web Speech API not supported in this browser');
    }
  }

  /**
   * Speak text in the current language
   */
  speak(text, language) {
    if (!this.isSupported) {
      console.warn('TTS Service: Cannot speak - API not supported');
      return;
    }

    // Cancel any ongoing speech
    this.stop();

    const lang = language || this.currentLanguage;
    const translatedText = this.translate(text, lang);
    
    // Wait for voices to load
    const speakNow = () => {
      const utterance = new SpeechSynthesisUtterance(translatedText);
      
      utterance.lang = LANGUAGE_CODES[lang] || 'en-US';
      utterance.rate = 0.9; // Slightly slower for clarity, i an also make it faster 
      utterance.pitch = 1;
      utterance.volume = 1;

      // Try to find a voice for the language
      const voices = this.synth.getVoices();
      const voice = voices.find(v => v.lang.startsWith(lang)) || 
                    voices.find(v => v.lang.startsWith('en')) ||
                    voices[0];
      
      if (voice) {
        utterance.voice = voice;
      }

      console.log(`TTS Service: Speaking "${translatedText}" in ${lang} with voice:`, voice?.name || 'default');
      
      utterance.onerror = (event) => {
        console.error('TTS Error:', event);
      };
      
      utterance.onend = () => {
        console.log('TTS: Speech completed');
      };

      this.synth.speak(utterance);
    };

    // Check if voices are loaded
    const voices = this.synth.getVoices();
    if (voices.length > 0) {
      speakNow();
    } else {
      // Wait for voices to load (mainly for Chrome)
      this.synth.addEventListener('voiceschanged', speakNow, { once: true });
      // Fallback timeout
      setTimeout(speakNow, 500);
    }
  }

  /* Translate text to target language*/
  translate(text, language) {
    // Check if we have a translation for this text
    if (EMOTION_TRANSLATIONS[text]) {
      return EMOTION_TRANSLATIONS[text][language];
    }
    
    // Return original text if no translation found
    return text;
  }

  /*Stop current speech*/
  stop() {
    if (this.isSupported && this.synth.speaking) {
      this.synth.cancel();
    }
  }

  /* Set default language*/
  setLanguage(language) {
    this.currentLanguage = language;
    console.log(`TTS Service: Language set to ${language}`);
  }

  /*Get current language*/
  getLanguage() {
    return this.currentLanguage;
  }

  /*Check if TTS is supported*/
  isTtsSupported() {
    return this.isSupported;
  }

  /**
   * Get available languages
   */
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
