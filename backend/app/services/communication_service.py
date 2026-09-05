"""
AROHAN Multilingual Communication Service & WhatsApp Integration Architecture.

Supports official disaster relief communication workflows across the 8 NER states:
- Multi-language templates (Assamese, Mizo, Khasi, Meitei, Bodo, Bengali, English)
- Verified emergency messages (Route Change, Disruption, Flood, Summary, Confirmation)
- Privacy-preserving masked dispatch
- WhatsApp Business Cloud API payload generation & simulation tracking
- Bi-directional driver feedback loop
"""

from datetime import datetime
from typing import Optional, Dict, Any, List

SUPPORTED_LANGUAGES = [
    {"code": "as", "name": "Assamese", "native": "অসমীয়া", "status": "VERIFIED", "region": "Assam / Brahmaputra Valley"},
    {"code": "mizo", "name": "Mizo", "native": "Mizo ṭawng", "status": "VERIFIED", "region": "Mizoram"},
    {"code": "kha", "name": "Khasi", "native": "Ka Ktien Khasi", "status": "VERIFIED", "region": "Meghalaya (Khasi Hills)"},
    {"code": "mni", "name": "Meitei", "native": "মৈতৈলোন্ / Manipuri", "status": "VERIFIED", "region": "Manipur"},
    {"code": "brx", "name": "Bodo", "native": "बड़ो", "status": "VERIFIED", "region": "Bodoland (Assam)"},
    {"code": "bn", "name": "Bengali", "native": "বাংলা", "status": "VERIFIED", "region": "Barak Valley / Tripura"},
    {"code": "en", "name": "English", "native": "English", "status": "VERIFIED", "region": "National / NER Common"},
    {"code": "garo", "name": "Garo", "native": "A·chik", "status": "PENDING_VERIFICATION", "region": "Meghalaya (Garo Hills)"},
    {"code": "nag", "name": "Nagamese", "native": "Nagamese Creole", "status": "PENDING_VERIFICATION", "region": "Nagaland"},
]

VERIFIED_TEMPLATES: Dict[str, Dict[str, str]] = {
    "ROUTE_CHANGE": {
        "en": (
            "⚠️ *AROHAN EMERGENCY RELIEF DISPATCH*\n"
            "Assigned Movement: *{movement_code}*\n\n"
            "Your route has been changed due to *{reason}*.\n"
            "• Primary Corridor: {old_route}\n"
            "• New Assigned Safe Route: *{new_route}*\n"
            "• Relief Destination: {destination}\n"
            "• Updated ETA: {eta}\n\n"
            "Please follow the updated route immediately.\n"
            "Navigation: {tracking_url}\n"
            "Authority: NER Disaster Management Authority"
        ),
        "as": (
            "⚠️ *আৰোহণ জৰুৰী সাহায্য নিৰ্দেশ*\n"
            "নিযুক্ত বাহন: *{movement_code}*\n\n"
            "*{reason}* ৰ বাবে আপোনাৰ পথ তাৎক্ষণিকভাৱে সলনি কৰা হৈছে।\n"
            "• পূৰ্বৰ পথ: {old_route}\n"
            "• নতুন নিৰ্ধাৰিত সুৰক্ষিত পথ: *{new_route}*\n"
            "• সাহায্য গন্তব্যস্থান: {destination}\n"
            "• আনুমানিক সময় (ETA): {eta}\n\n"
            "অনুগ্ৰহ কৰি পলম নকৰি নতুন সুৰক্ষিত পথ অনুসৰণ কৰক।\n"
            "ট্ৰেকিং: {tracking_url}\n"
            "কৰ্তৃপক্ষ: উত্তৰ-পূব দুৰ্যোগ ব্যৱস্থাপনা কোষ"
        ),
        "mizo": (
            "⚠️ *AROHAN CHHIATRUP TANPUI HRIATTIRNA*\n"
            "Phurh Hming: *{movement_code}*\n\n"
            "*{reason}* avangin i kalna kawng thlak nghal a ni.\n"
            "• Kawng hlui: {old_route}\n"
            "• Kawng thar him zawk: *{new_route}*\n"
            "• Thlenna tur relief hub: {destination}\n"
            "• Thlen hun thar (ETA): {eta}\n\n"
            "Khawngaihin kawng thar him zawk hi zawh nghal rawh le.\n"
            "Navigation: {tracking_url}\n"
            "Thuneitu: NER Disaster Management Authority"
        ),
        "kha": (
            "⚠️ *AROHAN JINGPYNTHIKNA KYRNGIEH*\n"
            "Movement Code: *{movement_code}*\n\n"
            "La pynkylla ia ka lynti namar *{reason}*.\n"
            "• Ka lynti barim: {old_route}\n"
            "• Ka lynti bathymmai ba shngain: *{new_route}*\n"
            "• Ka jaka leit relief: {destination}\n"
            "• Por ba thikna (ETA): {eta}\n\n"
            "Sngewbha bud ia kane ka lynti ba shngain ba la pynbeit thymmai.\n"
            "Tracking: {tracking_url}\n"
            "Authority: NER Disaster Response Unit"
        ),
        "mni": (
            "⚠️ *অৰোহান ইমর্জেন্সী রিলীফ পাউজেল*\n"
            "খন্দোক্লবা লম্বী কোদ: *{movement_code}*\n\n"
            "*{reason}* গী মরমদা অদোমগী চৎফম লম্বী অসি অহোংবা লাক্লে।\n"
            "• অহানবা লম্বী: {old_route}\n"
            "• অনৌবা সেফ ওইবা লম্বী: *{new_route}*\n"
            "• য়ৌফম মফম: {destination}\n"
            "• মতম (ETA): {eta}\n\n"
            "চানবীদুনা খুদক্তা অনৌবা সেফ ওইবা লম্বী অসিদা চৎপীয়ু।\n"
            "ট্রেকিং: {tracking_url}"
        ),
        "brx": (
            "⚠️ *AROHAN खौरां*\n"
            "थान्दै: *{movement_code}*\n\n"
            "*{reason}* नि थाखाय नोंथांनि लामाया सोलायबाय।\n"
            "• गोजाम लामा: {old_route}\n"
            "• गोदान रैखाथिगोनां लामा: *{new_route}*\n"
            "• थांनांगौ जायगा: {destination}\n"
            "• सम (ETA): {eta}\n\n"
            "अननानै गोदान रैखाथिगोनां लामाजों थां।\n"
            "Navigation: {tracking_url}"
        ),
        "bn": (
            "⚠️ *আরোহণ জরুরী ত্রাণ বার্তা*\n"
            "বরাদ্দকৃত কনভয়: *{movement_code}*\n\n"
            "*{reason}* এর কারণে আপনার রুট পরিবর্তন করা হয়েছে।\n"
            "• পূর্ববর্তী রুট: {old_route}\n"
            "• নতুন নির্ধারিত নিরাপদ রুট: *{new_route}*\n"
            "• ত্রাণ গন্তব্য: {destination}\n"
            "• আনুমানিক সময় (ETA): {eta}\n\n"
            "অনুগ্রহ করে অবিলম্বে নতুন নিরাপদ রুট অনুসরণ করুন।\n"
            "ট্র্যাকিং: {tracking_url}"
        ),
    },

    "ROAD_DISRUPTION": {
        "en": (
            "⚠️ *AROHAN ROAD ACCESS ADVISORY*\n"
            "Movement: *{movement_code}*\n\n"
            "Road access severely disrupted on corridor *{corridor}* due to *{reason}*.\n"
            "Please divert immediately to alternate corridor: *{new_route}*.\n"
            "Do not attempt passage through closed sections."
        ),
        "as": (
            "⚠️ *আৰোহণ পথ বিঘ্ন সতৰ্কবাৰ্তা*\n"
            "বাহন: *{movement_code}*\n\n"
            "*{corridor}* পথত *{reason}* ৰ বাবে যাতায়ত বিপজ্জনকভাৱে ব্যাহত হৈছে।\n"
            "অনুগ্ৰহ কৰি বিকল্প পথ *{new_route}* লৈ অগ্ৰসৰ হওক।"
        ),
        "mizo": (
            "⚠️ *AROHAN KAWNG CHHIA HRIATTIRNA*\n"
            "Movement: *{movement_code}*\n\n"
            "*{corridor}* ah kawng a chhia. Kawng dang *{new_route}* zawh rawh."
        ),
        "kha": (
            "⚠️ *AROHAN KA JINGMAHAM LYNTI*\n"
            "Movement: *{movement_code}*\n\n"
            "Ka lynti *{corridor}* ka la sahkut. Sngewbha pyndonkam da ka lynti: *{new_route}*."
        ),
        "mni": (
            "⚠️ *অৰোহান লম্বী অপনবা পাউজেল*\n"
            "*{corridor}* লম্বীদা অপনবা থোক্লে। চানবীদুনা অতোপ্পা লম্বী *{new_route}* দা চৎলু।"
        ),
        "brx": (
            "⚠️ *AROHAN लामा जाहाथाय खौरां*\n"
            "*{corridor}* लामायाव खहा जादों। गोदान लामा *{new_route}* जों थां।"
        ),
        "bn": (
            "⚠️ *আরোহণ সড়ক সতর্কতা*\n"
            "*{corridor}* করিডোরে চলাচল ব্যাহত হয়েছে। অনুগ্রহ করে বিকল্প রুট *{new_route}* ব্যবহার করুন।"
        ),
    },

    "FLOOD_ALERT": {
        "en": (
            "🌊 *AROHAN FLOOD SURGE WARNING*\n"
            "Flash flood runoff approaching transit corridor *{corridor}*.\n"
            "Roadway submerged at culvert crossings. Alternate elevated bypass: *{new_route}*.\n"
            "Contact SDRF logistics control if trapped."
        ),
        "as": (
            "🌊 *আৰোহণ বানপানী সতৰ্কবাৰ্তা*\n"
            "*{corridor}* অঞ্চলত বানপানীৰ স্তৰ বৃদ্ধি পাইছে। বিকল্প উচ্চ পথ *{new_route}* ব্যৱহাৰ কৰক।"
        ),
        "mizo": (
            "🌊 *AROHAN TUI LIAN HRIATTIRNA*\n"
            "*{corridor}* tui lian a hlauhawm. Kawng sang zawk *{new_route}* zawh rawh."
        ),
        "kha": (
            "🌊 *AROHAN KA JINGSHLEH UM*\n"
            "Ka um ka la kiew ha *{corridor}*. Pyndonkam da ka lynti kyntiew *{new_route}*."
        ),
        "mni": (
            "🌊 *অৰোহান ঈশিং ইচাও পাউজেল*\n"
            "*{corridor}* দা ঈশিং ইচাওনা লম্বী পুম্নমক চূপ্লে। অনৌবা লম্বী *{new_route}* দা চৎপীয়ু।"
        ),
        "brx": (
            "🌊 *AROHAN दैबाना खौरां*\n"
            "*{corridor}* याव दै बाना जादों। गोजौ लामा *{new_route}* जों थां।"
        ),
        "bn": (
            "🌊 *আরোহণ বন্যা সতর্কতা*\n"
            "*{corridor}* করিডোরে আকস্মিক বন্যা দেখা দিয়েছে। অনুগ্রহ করে পাহাড়ি রুট *{new_route}* ব্যবহার করুন।"
        ),
    },

    "MOVEMENT_SUMMARY": {
        "en": (
            "📋 *AROHAN DISASTER RELIEF DISPATCH*\n"
            "Movement ID: *{movement_code}*\n"
            "• Cargo: {resource}\n"
            "• Origin: {origin}\n"
            "• Destination: {destination}\n"
            "• Safe Assigned Corridor: {route}\n"
            "• Expected ETA: {eta}\n"
            "• Assigned Driver: {driver_name}\n"
            "Status: EN ROUTE (GPS Monitored)"
        ),
        "as": (
            "📋 *আৰোহণ সাহায্য প্ৰেৰণ তালিকা*\n"
            "বাহন কোদ: *{movement_code}*\n"
            "• সাহায্য সামগ্ৰী: {resource}\n"
            "• উৎস: {origin}\n"
            "• গন্তব্য: {destination}\n"
            "• নিৰ্ধাৰিত পথ: {route}\n"
            "• আনুমানিক সময়: {eta}\n"
            "• চালক: {driver_name}"
        ),
        "mizo": (
            "📋 *AROHAN KAL CHHUAH SUMMARY*\n"
            "Movement: *{movement_code}*\n"
            "• Thil phurh: {resource}\n"
            "• Chhuahna: {origin}\n"
            "• Thlenna: {destination}\n"
            "• Kawng: {route}\n"
            "• ETA: {eta} | Driver: {driver_name}"
        ),
        "kha": (
            "📋 *AROHAN JINGTHOH CONVOY*\n"
            "Code: *{movement_code}*\n"
            "• Jingkit: {resource}\n"
            "• Nangne: {origin}\n"
            "• Sha: {destination}\n"
            "• Lynti: {route}\n"
            "• ETA: {eta} | Driver: {driver_name}"
        ),
        "mni": (
            "📋 *অৰোহান রিলীফ সামারি*\n"
            "কোদ: *{movement_code}*\n"
            "• পোৎলম: {resource}\n"
            "• হৌফম: {origin}\n"
            "• য়ৌফম: {destination}\n"
            "• লম্বী: {route}\n"
            "• ETA: {eta} | দ্রাইভর: {driver_name}"
        ),
        "brx": (
            "📋 *AROHAN खौरां बिलाइ*\n"
            "कौड: *{movement_code}*\n"
            "• मुवा: {resource}\n"
            "• जायागा: {origin} -> {destination}\n"
            "• लामा: {route}\n"
            "• ETA: {eta} | सालाइग्रा: {driver_name}"
        ),
        "bn": (
            "📋 *আরোহণ কনভয় প্রেরণ বিবরণী*\n"
            "কোড: *{movement_code}*\n"
            "• ত্রাণ সামগ্রী: {resource}\n"
            "• উৎস: {origin} -> গন্তব্য: {destination}\n"
            "• রুট: {route}\n"
            "• ETA: {eta} | চালক: {driver_name}"
        ),
    },

    "DELIVERY_CONFIRMATION": {
        "en": (
            "✅ *AROHAN RELIEF DELIVERY CONFIRMED*\n"
            "Movement: *{movement_code}*\n"
            "Essential relief supplies ({resource}) successfully delivered to {destination}.\n"
            "Receipt acknowledged by district store manager.\n"
            "Thank you for completing this mission safely."
        ),
        "as": (
            "✅ *আৰোহণ সাহায্য যোগান নিশ্চিতকৰণ*\n"
            "বাহন: *{movement_code}*\n"
            "সাহায্য সামগ্ৰী ({resource}) সফলতাৰে {destination} ত যোগান ধৰা হৈছে। ধন্যবাদ।"
        ),
        "mizo": (
            "✅ *AROHAN THLEN FEL CONFIRMATION*\n"
            "Movement: *{movement_code}*\n"
            "{destination} ah chhiatrup tanpuina ({resource}) a thleng fel ta. Ka lawm e."
        ),
        "kha": (
            "✅ *AROHAN JINGPYNTHIKNA JINGPOH*\n"
            "Movement: *{movement_code}*\n"
            "Ki mar kyrshan ({resource}) ki la poi suk ha {destination}. Khublei shibun."
        ),
        "mni": (
            "✅ *অৰোহান রিলীফ য়ৌরে নিশ্চিতকরণ*\n"
            "*{movement_code}* গী রিলীফ পোৎলম ({resource}) {destination} দা মপুংফানা য়ৌরে। থাগৎচরি।"
        ),
        "brx": (
            "✅ *AROHAN मुवा मोनहैबाय*\n"
            "*{movement_code}* नि मुवाया ({resource}) {destination} याव मोजांयै मोनहैबाय। साबायखर।"
        ),
        "bn": (
            "✅ *আরোহণ ত্রাণ প্রাপ্তি নিশ্চিতকরণ*\n"
            "কনভয় *{movement_code}* এর ত্রাণ সামগ্রী ({resource}) সফলভাবে {destination} এ পৌঁছেছে। ধন্যবাদ।"
        ),
    },
}

def get_supported_languages() -> List[Dict[str, str]]:
    return SUPPORTED_LANGUAGES

def mask_phone_number(phone: str) -> str:
    """Masks phone number for driver privacy according to government standards."""
    clean = "".join([c for c in phone if c.isdigit() or c == "+"])
    if len(clean) >= 10:
        return clean[:3] + " " + clean[3:5] + "*** ***" + clean[-3:]
    return "+91 98*** ***10"

def render_localized_message(message_type: str, language: str, context: Dict[str, Any]) -> Dict[str, Any]:
    """
    Renders verified localized template message.
    Falls back to English if language translations are pending.
    """
    templates = VERIFIED_TEMPLATES.get(message_type, VERIFIED_TEMPLATES["ROUTE_CHANGE"])
    target_lang = language.lower().strip()
    
    fallback_used = False
    if target_lang not in templates:
        target_lang = "en"
        fallback_used = True

    raw_template = templates[target_lang]
    
    # Safe substitution
    defaults = {
        "movement_code": "REL-001",
        "reason": "Landslide hazard on primary corridor",
        "old_route": "NH-6 via Umiam Escarpment",
        "new_route": "Route B (Sonapur Ridge Highland Corridor)",
        "destination": "Shillong Core Relief Hub",
        "corridor": "NH-6 Jorabat-Umiam km 42-54",
        "resource": "Emergency Medical Supplies",
        "origin": "Guwahati Buffer Depot",
        "eta": "4h 15m",
        "driver_name": "Rahul Kumar",
        "tracking_url": "https://arohan.gov.in/driver",
    }
    
    merged_context = {**defaults, **context}
    rendered_body = raw_template.format(**merged_context)

    lang_info = next((l for l in SUPPORTED_LANGUAGES if l["code"] == target_lang), {"name": "English", "native": "English"})

    return {
        "message_type": message_type,
        "language_code": target_lang,
        "language_name": lang_info["name"],
        "language_native": lang_info["native"],
        "rendered_body": rendered_body,
        "fallback_used": fallback_used,
        "verification_status": "VERIFIED" if not fallback_used else "FALLBACK_ENGLISH",
    }

def generate_whatsapp_payload(
    recipient_phone: str,
    rendered_text: str,
    movement_code: str,
    action_button_url: str = "https://arohan.gov.in/driver"
) -> Dict[str, Any]:
    """
    Generates an official WhatsApp Business Cloud API compliant interactive message payload.
    Compatible with Meta Graph API v20.0 WhatsApp Cloud endpoint.
    """
    return {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": recipient_phone,
        "type": "interactive",
        "interactive": {
            "type": "button",
            "header": {
                "type": "text",
                "text": f"AROHAN RELIEF DISPATCH — {movement_code}"
            },
            "body": {
                "text": rendered_text
            },
            "footer": {
                "text": "Govt of India • Dept of Space / NESAC • SIH26002"
            },
            "action": {
                "buttons": [
                    {
                        "type": "reply",
                        "reply": {
                            "id": f"ack_{movement_code}",
                            "title": "Acknowledge Route"
                        }
                    },
                    {
                        "type": "reply",
                        "reply": {
                            "id": f"report_{movement_code}",
                            "title": "Report Road Block"
                        }
                    }
                ]
            }
        }
    }
