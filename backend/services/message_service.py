"""
Message Service — Rule-Based AI Message Conversion
=====================================================
Converts simple input values (e.g. "hungry", "light_on") into
natural sentences in 6 languages. No external API needed.

Covers:
  - 9 communication emotions (from CommunicationModal)
  - 6 appliance device actions (from HomeAppliancesModal)
  - 6 emergency types (from EmergencyModal)
"""

from utils.logger import get_logger

logger = get_logger(__name__)

# ──────────────────────────────────────────────────────────────
# COMMUNICATION MESSAGES — Matches CommunicationModal.jsx exactly
# ──────────────────────────────────────────────────────────────
COMMUNICATION_MESSAGES = {
    "pain": {
        "en": "I am in pain",
        "ur": "مجھے درد ہے",
        "ar": "أنا في ألم",
        "es": "Tengo dolor",
        "fr": "J'ai mal",
        "de": "Ich habe Schmerzen",
    },
    "happy": {
        "en": "I am happy",
        "ur": "میں خوش ہوں",
        "ar": "أنا سعيد",
        "es": "Estoy feliz",
        "fr": "Je suis heureux",
        "de": "Ich bin glücklich",
    },
    "sad": {
        "en": "I am sad",
        "ur": "میں اداس ہوں",
        "ar": "أنا حزين",
        "es": "Estoy triste",
        "fr": "Je suis triste",
        "de": "Ich bin traurig",
    },
    "hungry": {
        "en": "I am hungry",
        "ur": "مجھے بھوک لگی ہے",
        "ar": "أنا جائع",
        "es": "Tengo hambre",
        "fr": "J'ai faim",
        "de": "Ich habe Hunger",
    },
    "washroom": {
        "en": "I need the washroom",
        "ur": "مجھے واش روم جانا ہے",
        "ar": "أحتاج إلى الحمام",
        "es": "Necesito el baño",
        "fr": "J'ai besoin des toilettes",
        "de": "Ich brauche die Toilette",
    },
    "tired": {
        "en": "I am tired",
        "ur": "میں تھکا ہوا ہوں",
        "ar": "أنا متعب",
        "es": "Estoy cansado",
        "fr": "Je suis fatigué",
        "de": "Ich bin müde",
    },
    "thirsty": {
        "en": "I am thirsty",
        "ur": "مجھے پیاس لگی ہے",
        "ar": "أنا عطشان",
        "es": "Tengo sed",
        "fr": "J'ai soif",
        "de": "Ich habe Durst",
    },
    "cold": {
        "en": "I am cold",
        "ur": "مجھے ٹھنڈ لگ رہی ہے",
        "ar": "أنا بارد",
        "es": "Tengo frío",
        "fr": "J'ai froid",
        "de": "Mir ist kalt",
    },
    "hot": {
        "en": "I am hot",
        "ur": "مجھے گرمی لگ رہی ہے",
        "ar": "أنا حار",
        "es": "Tengo calor",
        "fr": "J'ai chaud",
        "de": "Mir ist heiß",
    },
}

# ──────────────────────────────────────────────────────────────
# DEVICE MESSAGES — Matches HomeAppliancesModal.jsx appliances
# Format: "{device}_{action}" e.g. "light_on", "fan_off"
# ──────────────────────────────────────────────────────────────
DEVICE_MESSAGES = {
    # Lights
    "light_on": {
        "en": "Turning on the light",
        "ur": "لائٹ آن کر رہا ہوں",
        "ar": "تشغيل الضوء",
        "es": "Encendiendo la luz",
        "fr": "Allumer la lumière",
        "de": "Licht einschalten",
    },
    "light_off": {
        "en": "Turning off the light",
        "ur": "لائٹ بند کر رہا ہوں",
        "ar": "إطفاء الضوء",
        "es": "Apagando la luz",
        "fr": "Éteindre la lumière",
        "de": "Licht ausschalten",
    },
    "light_dim": {
        "en": "Dimming the light",
        "ur": "لائٹ دھیمی کر رہا ہوں",
        "ar": "تخفيف الضوء",
        "es": "Atenuando la luz",
        "fr": "Tamiser la lumière",
        "de": "Licht dimmen",
    },
    "light_brighten": {
        "en": "Brightening the light",
        "ur": "لائٹ تیز کر رہا ہوں",
        "ar": "زيادة سطوع الضوء",
        "es": "Aumentando la luz",
        "fr": "Augmenter la lumière",
        "de": "Licht heller machen",
    },
    # Fan
    "fan_on": {
        "en": "Turning on the fan",
        "ur": "پنکھا آن کر رہا ہوں",
        "ar": "تشغيل المروحة",
        "es": "Encendiendo el ventilador",
        "fr": "Allumer le ventilateur",
        "de": "Ventilator einschalten",
    },
    "fan_off": {
        "en": "Turning off the fan",
        "ur": "پنکھا بند کر رہا ہوں",
        "ar": "إطفاء المروحة",
        "es": "Apagando el ventilador",
        "fr": "Éteindre le ventilateur",
        "de": "Ventilator ausschalten",
    },
    "fan_speed_up": {
        "en": "Increasing fan speed",
        "ur": "پنکھے کی رفتار بڑھا رہا ہوں",
        "ar": "زيادة سرعة المروحة",
        "es": "Aumentando velocidad del ventilador",
        "fr": "Augmenter la vitesse du ventilateur",
        "de": "Ventilator schneller",
    },
    "fan_speed_down": {
        "en": "Decreasing fan speed",
        "ur": "پنکھے کی رفتار کم کر رہا ہوں",
        "ar": "تقليل سرعة المروحة",
        "es": "Reduciendo velocidad del ventilador",
        "fr": "Réduire la vitesse du ventilateur",
        "de": "Ventilator langsamer",
    },
    # Air Conditioner
    "ac_on": {
        "en": "Turning on the air conditioner",
        "ur": "اے سی آن کر رہا ہوں",
        "ar": "تشغيل المكيف",
        "es": "Encendiendo el aire acondicionado",
        "fr": "Allumer la climatisation",
        "de": "Klimaanlage einschalten",
    },
    "ac_off": {
        "en": "Turning off the air conditioner",
        "ur": "اے سی بند کر رہا ہوں",
        "ar": "إطفاء المكيف",
        "es": "Apagando el aire acondicionado",
        "fr": "Éteindre la climatisation",
        "de": "Klimaanlage ausschalten",
    },
    "ac_temp_up": {
        "en": "Increasing temperature",
        "ur": "درجہ حرارت بڑھا رہا ہوں",
        "ar": "رفع درجة الحرارة",
        "es": "Aumentando temperatura",
        "fr": "Augmenter la température",
        "de": "Temperatur erhöhen",
    },
    "ac_temp_down": {
        "en": "Decreasing temperature",
        "ur": "درجہ حرارت کم کر رہا ہوں",
        "ar": "خفض درجة الحرارة",
        "es": "Reduciendo temperatura",
        "fr": "Réduire la température",
        "de": "Temperatur senken",
    },
    # Television
    "tv_on": {
        "en": "Turning on the television",
        "ur": "ٹی وی آن کر رہا ہوں",
        "ar": "تشغيل التلفاز",
        "es": "Encendiendo la televisión",
        "fr": "Allumer la télévision",
        "de": "Fernseher einschalten",
    },
    "tv_off": {
        "en": "Turning off the television",
        "ur": "ٹی وی بند کر رہا ہوں",
        "ar": "إطفاء التلفاز",
        "es": "Apagando la televisión",
        "fr": "Éteindre la télévision",
        "de": "Fernseher ausschalten",
    },
    "tv_volume_up": {
        "en": "Increasing volume",
        "ur": "آواز بڑھا رہا ہوں",
        "ar": "رفع مستوى الصوت",
        "es": "Subiendo volumen",
        "fr": "Augmenter le volume",
        "de": "Lautstärke erhöhen",
    },
    "tv_volume_down": {
        "en": "Decreasing volume",
        "ur": "آواز کم کر رہا ہوں",
        "ar": "خفض مستوى الصوت",
        "es": "Bajando volumen",
        "fr": "Réduire le volume",
        "de": "Lautstärke senken",
    },
    # WiFi Router
    "router_on": {
        "en": "Turning on the WiFi router",
        "ur": "وائی فائی راؤٹر آن کر رہا ہوں",
        "ar": "تشغيل الراوتر",
        "es": "Encendiendo el router WiFi",
        "fr": "Allumer le routeur WiFi",
        "de": "WLAN-Router einschalten",
    },
    "router_off": {
        "en": "Turning off the WiFi router",
        "ur": "وائی فائی راؤٹر بند کر رہا ہوں",
        "ar": "إطفاء الراوتر",
        "es": "Apagando el router WiFi",
        "fr": "Éteindre le routeur WiFi",
        "de": "WLAN-Router ausschalten",
    },
    "router_restart": {
        "en": "Restarting the WiFi router",
        "ur": "وائی فائی راؤٹر ری سٹارٹ کر رہا ہوں",
        "ar": "إعادة تشغيل الراوتر",
        "es": "Reiniciando el router WiFi",
        "fr": "Redémarrer le routeur WiFi",
        "de": "WLAN-Router neustarten",
    },
    # All Devices
    "all_on": {
        "en": "Turning on all devices",
        "ur": "تمام آلات آن کر رہا ہوں",
        "ar": "تشغيل جميع الأجهزة",
        "es": "Encendiendo todos los dispositivos",
        "fr": "Allumer tous les appareils",
        "de": "Alle Geräte einschalten",
    },
    "all_off": {
        "en": "Turning off all devices",
        "ur": "تمام آلات بند کر رہا ہوں",
        "ar": "إطفاء جميع الأجهزة",
        "es": "Apagando todos los dispositivos",
        "fr": "Éteindre tous les appareils",
        "de": "Alle Geräte ausschalten",
    },
}

# ──────────────────────────────────────────────────────────────
# EMERGENCY MESSAGES — Matches EmergencyModal.jsx options
# ──────────────────────────────────────────────────────────────
EMERGENCY_MESSAGES = {
    "call-15": {
        "en": "Emergency! Calling emergency services immediately!",
        "ur": "ایمرجنسی! فوری طور پر ایمرجنسی سروسز کو کال کر رہا ہوں!",
        "ar": "طوارئ! الاتصال بخدمات الطوارئ فوراً!",
        "es": "¡Emergencia! ¡Llamando a servicios de emergencia!",
        "fr": "Urgence! Appel des services d'urgence immédiatement!",
        "de": "Notfall! Sofortiger Notruf!",
    },
    "nurse": {
        "en": "I need a nurse immediately",
        "ur": "مجھے فوری طور پر نرس چاہیے",
        "ar": "أحتاج ممرضة فوراً",
        "es": "Necesito una enfermera inmediatamente",
        "fr": "J'ai besoin d'une infirmière immédiatement",
        "de": "Ich brauche sofort eine Krankenschwester",
    },
    "medical-alert": {
        "en": "Medical alert! I have a health concern",
        "ur": "طبی الرٹ! مجھے صحت کا مسئلہ ہے",
        "ar": "تنبيه طبي! لدي مشكلة صحية",
        "es": "¡Alerta médica! Tengo una preocupación de salud",
        "fr": "Alerte médicale! J'ai un problème de santé",
        "de": "Medizinischer Alarm! Ich habe ein Gesundheitsproblem",
    },
    "medication": {
        "en": "I need my medication",
        "ur": "مجھے اپنی دوائی چاہیے",
        "ar": "أحتاج دوائي",
        "es": "Necesito mi medicación",
        "fr": "J'ai besoin de mes médicaments",
        "de": "Ich brauche meine Medikamente",
    },
    "discomfort": {
        "en": "I am in severe discomfort",
        "ur": "مجھے شدید تکلیف ہو رہی ہے",
        "ar": "أعاني من انزعاج شديد",
        "es": "Estoy en severa incomodidad",
        "fr": "Je suis en grande détresse",
        "de": "Ich habe starke Beschwerden",
    },
    "security": {
        "en": "Security alert! I feel unsafe",
        "ur": "سیکیورٹی الرٹ! مجھے غیر محفوظ محسوس ہو رہا ہے",
        "ar": "تنبيه أمني! أشعر بعدم الأمان",
        "es": "¡Alerta de seguridad! Me siento inseguro",
        "fr": "Alerte sécurité! Je ne me sens pas en sécurité",
        "de": "Sicherheitsalarm! Ich fühle mich unsicher",
    },
}

# ──────────────────────────────────────────────────────────────
# gTTS language code mapping
# ──────────────────────────────────────────────────────────────
GTTS_LANGUAGE_CODES = {
    "en": "en",
    "ur": "ur",
    "ar": "ar",
    "es": "es",
    "fr": "fr",
    "de": "de",
}


def get_message(msg_type: str, value: str, language: str = "en") -> dict:
    """
    Convert a simple input into a natural language message.

    Args:
        msg_type: "communication", "device", or "emergency"
        value: The specific action/emotion ID (e.g. "hungry", "light_on", "nurse")
        language: Language code ("en", "ur", "ar", "es", "fr", "de")

    Returns:
        dict with "message" (English) and "translated_message" (target language)
    """
    value_lower = value.lower().strip()
    lang = language.lower().strip() if language else "en"

    # Select the right message dictionary based on type
    if msg_type == "communication":
        messages = COMMUNICATION_MESSAGES
    elif msg_type == "device":
        messages = DEVICE_MESSAGES
    elif msg_type == "emergency":
        messages = EMERGENCY_MESSAGES
    else:
        logger.warning(f"Unknown message type: {msg_type}")
        return {
            "message": f"Unknown action: {value}",
            "translated_message": f"Unknown action: {value}",
        }

    # Look up the message
    if value_lower in messages:
        entry = messages[value_lower]
        english_msg = entry.get("en", value)
        translated_msg = entry.get(lang, english_msg)

        logger.info(f"Message converted: type={msg_type}, value={value}, lang={lang} → {ascii(translated_msg)}")

        return {
            "message": english_msg,
            "translated_message": translated_msg,
        }
    else:
        logger.warning(f"No message found for: type={msg_type}, value={value_lower}")
        return {
            "message": f"Action: {value}",
            "translated_message": f"Action: {value}",
        }


def get_gtts_lang_code(language: str) -> str:
    """Get the gTTS-compatible language code."""
    return GTTS_LANGUAGE_CODES.get(language, "en")
