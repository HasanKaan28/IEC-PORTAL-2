#!/usr/bin/env python3
"""
IUS Engineering Club — Projects Showcase Data Synchronizer
Fetches live brainstormed project & event ideas from the Google Sheet,
merges them with real club initiatives, assigns AI-generated renders,
and exports bilingual JSON & JS datasets for the Apple-style showcase site.
"""

import sys
import csv
import json
import urllib.request
from pathlib import Path
from datetime import datetime

# Windows console UTF-8 fix
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
PROJECTS_DIR = WORKSPACE_ROOT / "projects"
DATA_DIR = PROJECTS_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

SHEET_ID = "1r9aVO0WNHy4AtvIQu1rExEB9X1of1KBOU5ErUTf0jFw"
CSV_EXPORT_URL = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv"

JSON_OUTPUT = DATA_DIR / "projects.json"
JS_OUTPUT = PROJECTS_DIR / "projects-data.js"

# Curated AI Renders Library
AI_GALLERY = {
    "powerhub": "assets/powerbank_station_hero.jpg",
    "dining": "assets/dining_app_hero.jpg",
    "hackathon": "assets/hackathon_event_hero.jpg",
    "ailab": "assets/ai_lab_hero.jpg",
    "summit": "assets/engineering_summit_hero.jpg"
}

def choose_ai_visual(title, category, description):
    text = f"{title} {category} {description}".lower()
    if any(k in text for k in ["powerbank", "şarj", "istasyon", "nfc", "rfid", "powerhub", "pil", "batarya"]):
        return AI_GALLERY["powerhub"]
    elif any(k in text for k in ["yemek", "yemekhane", "menü", "fiyat", "cafeteria", "dining", "restoran", "öğle yemeği"]):
        return AI_GALLERY["dining"]
    elif any(k in text for k in ["hackathon", "devhack", "yarışma", "maraton", "24 saat"]):
        return AI_GALLERY["hackathon"]
    elif any(k in text for k in ["ai", "yapay zeka", "llm", "prompt", "model", "cursor", "claude", "bootcamp"]):
        return AI_GALLERY["ailab"]
    elif any(k in text for k in ["summit", "zirve", "konferans", "seminer", "keynote", "sponsor", "panel"]):
        return AI_GALLERY["summit"]
    else:
        return AI_GALLERY["ailab"]

# Curated Actual Club Projects (Real Initiatives Only - No Mock Rovers)
FLAGSHIP_PROJECTS = [
    {
        "id": "powerbank-station",
        "sheet_id": 1,
        "is_flagship": True,
        "featured": True,
        "category": {
            "tr": "Donanım & IoT Kampüs İnovasyonu",
            "en": "Hardware & IoT Campus Innovation"
        },
        "badge": {
            "tr": "Öğrenci Projesi",
            "en": "Student Initiative"
        },
        "title": {
            "tr": "IUS PowerHub (Akıllı Powerbank İstasyonu)",
            "en": "IUS PowerHub (Smart Campus Powerbank Station)"
        },
        "tagline": {
            "tr": "Öğrenci kartı (RFID) ile tek dokunuşta taşınabilir kampüs enerjisi.",
            "en": "One-tap portable energy powered by IUS Student RFID IDs."
        },
        "author": "Hasan Kaan Karabulut (Başkan)",
        "ownership": {
            "tr": "Hasan Kaan Karabulut (Proje Lideri & Mimarlık)",
            "en": "Hasan Kaan Karabulut (Lead Architect & PM)"
        },
        "budget": "Tahmini: 400+ KM (Sponsorluk Projeksiyonu)",
        "budget_level": "Sponsorluk Destekli",
        "difficulty": 5,
        "target_audience": {
            "tr": "Tüm IUS Öğrencileri & Personel",
            "en": "All IUS Students & Staff"
        },
        "image": "assets/powerbank_station_hero.jpg",
        "gallery": [
            "assets/powerbank_station_hero.jpg"
        ],
        "problem": {
            "tr": "Kampüs amfilerinde, kütüphanede ve kafeteryada priz yetersizliği nedeniyle öğrencilerin cihaz şarjları ders aralarında tükenmekte, duvar diplerinde priz aranmaktadır.",
            "en": "Shortage of wall outlets across lecture halls, library, and cafeteria leads to depleted student devices during class breaks."
        },
        "solution": {
            "tr": "Öğrenci IUS kimlik kartını RFID okuyucuya okuttuğunda en dolu powerbank yuvasının elektromanyetik kilidi yeşil LED ile açılır. Kullanım süresi dolunca herhangi bir boş yuvaya bırakıldığında pogo-pin raylar üzerinden otomatik hızlı şarj başlar.",
            "en": "Students tap their university RFID card; the slot holding the most charged powerbank unlocks with a luminous green LED ring. Once returned to any dock, magnetic pogo-pin rails initiate smart fast charging automatically."
        },
        "specs": [
            {"label": "Mimari", "value": "ESP32 / Raspberry Pi IoT Gateway"},
            {"label": "Doğrulama", "value": "RC522 / PN532 NFC-RFID Okuyucu"},
            {"label": "Güvenlik", "value": "BMS Batarya Yönetimi & Termal Sensörler"},
            {"label": "Şasi", "value": "FENS Lab 3D Baskı / CNC Metal Gövde"}
        ],
        "links": ["https://porty.tech/"],
        "first_step": {
            "tr": "SCC ve FENS yönetimine resmi teknik şartname sunumu yapılarak ilk prototip parçalarının temini.",
            "en": "Submit formal engineering petition to SCC & FENS deanship to acquire initial prototyping modules."
        }
    },
    {
        "id": "dining-menu-system",
        "sheet_id": 2,
        "is_flagship": True,
        "featured": True,
        "category": {
            "tr": "Web & Mobil Kampüs Yazılımı",
            "en": "Web & Mobile Campus Software"
        },
        "badge": {
            "tr": "Öğrenci Projesi",
            "en": "Student Initiative"
        },
        "title": {
            "tr": "IUS Dining (Yemekhane & Menü Takip Sistemi)",
            "en": "IUS Dining (Cafeteria & Live Menu App)"
        },
        "tagline": {
            "tr": "Günlük sıcak yemekler, fiyat listesi ve kalori takibi tek tıkla cebinizde.",
            "en": "Daily hot meals, live price list, and nutrition info directly on your phone."
        },
        "author": "Mahmut İhsan Avcı (Başkan Yrd. / Operasyon)",
        "ownership": {
            "tr": "Mahmut İhsan Avcı (Proje Lideri & Operasyon)",
            "en": "Mahmut İhsan Avcı (Project Lead & Ops)"
        },
        "budget": "Tahmini: 0 KM (Açık Kaynak / Sıfır Maliyet)",
        "budget_level": "Sıfır Maliyet",
        "difficulty": 2,
        "target_audience": {
            "tr": "Tüm IUS Öğrencileri & Akademisyenler",
            "en": "All IUS Students & Faculty"
        },
        "image": "assets/dining_app_hero.jpg",
        "gallery": [
            "assets/dining_app_hero.jpg"
        ],
        "problem": {
            "tr": "Yemekhanedeki eski fiyat listelerinin yarattığı kafa karışıklığı ve günün menüsünü öğrenmek için her seferinde fiziki olarak yemekhaneye gitme zorunluluğu.",
            "en": "Outdated physical price lists creating confusion and students having to physically walk to the cafeteria just to check the daily menu."
        },
        "solution": {
            "tr": "Yemekhane için geliştirilecek modern, hafif bir web uygulaması. Öğrenciler günün ana yemeklerini, tatlıları, güncel fiyat listesini ve kalori bilgilerini internet üzerinden anlık görebilir.",
            "en": "A modern, lightweight progressive web app for the campus cafeteria. Students can instantly check daily main dishes, desserts, live price boards, and dietary details online."
        },
        "specs": [
            {"label": "Platform", "value": "Mobil Uyumlu Responsive Web / PWA"},
            {"label": "Veri Kaynağı", "value": "Yemekhane Günlük Menü API & CMS"},
            {"label": "Maliyet", "value": "Sıfır Maliyet (Öğrenci Geliştirmesi)"},
            {"label": "Kapsam", "value": "Tüm Kampüs Kafeterya ve Yemekhaneleri"}
        ],
        "links": [],
        "first_step": {
            "tr": "Dekanlık ve Rektörlük ile görüşüp yemekhane mutfak koordinasyonu ve onayının alınması.",
            "en": "Meet with Deanery & Rectorate to coordinate with cafeteria operations for official endorsement."
        }
    },
    {
        "id": "devhack-2027",
        "sheet_id": 3,
        "is_flagship": True,
        "featured": True,
        "category": {
            "tr": "Yazılım Maratonu & Hackathon",
            "en": "Software Marathon & Hackathon"
        },
        "badge": {
            "tr": "Kulüp Amiral Gemisi",
            "en": "Club Flagship"
        },
        "title": {
            "tr": "IUS DevHack 2027",
            "en": "IUS DevHack 2027"
        },
        "tagline": {
            "tr": "24 saat aralıksız kodlama, donanım prototipleme ve sektör jürisi.",
            "en": "24 hours of non-stop coding, hardware prototyping & top tech jury."
        },
        "author": "Software & AI Committee & Yönetim Kurulu",
        "ownership": {
            "tr": "Software & AI Komitesi & Yönetim Kurulu",
            "en": "Software & AI Committee & Executive Board"
        },
        "budget": "Tahmini: Sponsorluk Destekli (Değerlendirmede)",
        "budget_level": "Sponsorluk Destekli",
        "difficulty": 4,
        "target_audience": {
            "tr": "FENS CS/SE/EE Öğrencileri & Saraybosna Yazılımcıları",
            "en": "FENS CS/SE/EE Students & Sarajevo Dev Ecosystem"
        },
        "image": "assets/hackathon_event_hero.jpg",
        "gallery": [
            "assets/hackathon_event_hero.jpg"
        ],
        "problem": {
            "tr": "Öğrencilerin teorik ders projelerinin ötesine geçip gerçek dünya stresinde takım halinde çalışan MVP ürünler ortaya koyabilecekleri rekabetçi bir platform eksikliği.",
            "en": "Lack of high-intensity competitive platforms where students can build real-world MVPs under real-world time pressure."
        },
        "solution": {
            "tr": "FENS laboratuvarlarında 80+ öğrencinin 24 saat boyunca yapay zeka, IoT ve web mimarilerinde yarıştığı, Saraybosna'nın önde gelen teknoloji firmalarının mentorluk ve jüri sağladığı amiral gemisi maraton.",
            "en": "A premier 24-hour hackathon in FENS labs where 80+ students build AI, IoT, and cloud applications with direct mentorship and judging from top tech executives."
        },
        "specs": [
            {"label": "Katılımcı", "value": "80+ Mühendislik Öğrencisi (20 Takım)"},
            {"label": "Süre", "value": "24 Saat Kesintisiz Maraton"},
            {"label": "Ödül", "value": "Staj İmkânları + Donanım/Teknoloji Ödülleri"},
            {"label": "Lokasyon", "value": "IUS FENS Bilgisayar & Donanım Labları"}
        ],
        "links": ["https://github.com/HasanKaan28/ius-engineering-events"],
        "first_step": {
            "tr": "Bit Alliance firmalarıyla sponsorluk paketlerinin ve ödül havuzunun kesinleştirilmesi.",
            "en": "Finalize tech sponsorship packages and prize pool with Bit Alliance partner companies."
        }
    },
    {
        "id": "ai-prompt-labs",
        "sheet_id": 4,
        "is_flagship": True,
        "featured": True,
        "category": {
            "tr": "Yapay Zeka & Akran Eğitimi",
            "en": "Artificial Intelligence & Peer Learning"
        },
        "badge": {
            "tr": "Düzenli Atölye",
            "en": "Regular Workshop"
        },
        "title": {
            "tr": "Hands-On AI & Prompt Engineering Labs",
            "en": "Hands-On AI & Prompt Engineering Labs"
        },
        "tagline": {
            "tr": "Modern LLM mimarileri, Cursor, Claude ve yerel model geliştirme.",
            "en": "Modern LLM workflows, Cursor, Claude, and local open-source models."
        },
        "author": "Software & AI Committee",
        "ownership": {
            "tr": "Software & AI Komite Liderliği",
            "en": "Software & AI Committee Leadership"
        },
        "budget": "Tahmini: Kulüp Faaliyet Ödeneği / Düşük Bütçe",
        "budget_level": "Düşük Bütçe",
        "difficulty": 2,
        "target_audience": {
            "tr": "Tüm Üniversite Bölümleri (Yeni Başlayanlar & İleri Düzey)",
            "en": "All Academic Departments (Beginners to Advanced)"
        },
        "image": "assets/ai_lab_hero.jpg",
        "gallery": [
            "assets/ai_lab_hero.jpg"
        ],
        "problem": {
            "tr": "Yapay zeka araçlarının hızla gelişmesine rağmen öğrencilerin üretim süreçlerinde LLM'leri ve akıllı IDE'leri profesyonel seviyede kullanamaması.",
            "en": "Despite explosive AI breakthroughs, students lack structured hands-on guidance to leverage agentic workflows and LLM coding assistants in daily engineering."
        },
        "solution": {
            "tr": "Her hafta FENS labında interaktif kodlama seansları: Cursor, Claude Code, yerel Ollama modelleri ve RAG mimarileriyle gerçek projeler inşa etme akran eğitimi.",
            "en": "Weekly interactive coding labs: building tangible projects with Cursor, Claude Code, local Ollama models, and RAG architectures through peer-to-peer mentoring."
        },
        "specs": [
            {"label": "Periyot", "value": "Haftalık Düzenli Atölye"},
            {"label": "Format", "value": "Uygulamalı Canlı Kodlama & Atölye"},
            {"label": "Kapasite", "value": "FENS Bilgisayar Laboratuvarı"},
            {"label": "Sertifika", "value": "IEC Doğrulanabilir Dijital Katılım Belgesi"}
        ],
        "links": ["https://hasankaan28.github.io/ius-engineering-events-site/verify/"],
        "first_step": {
            "tr": "1. Hafta 'Agentic Coding & Cursor 101' müfredatının ve lab rezervasyonunun duyurulması.",
            "en": "Announce Week 1 'Agentic Coding & Cursor 101' curriculum and book FENS computer lab."
        }
    },
    {
        "id": "ius-techsummit-2027",
        "sheet_id": 5,
        "is_flagship": True,
        "featured": True,
        "category": {
            "tr": "Yıllık Zirve & Sektör Ağları",
            "en": "Annual Summit & Industry Networking"
        },
        "badge": {
            "tr": "Yıllık Zirve",
            "en": "Annual Summit"
        },
        "title": {
            "tr": "IUS TechSummit 2027",
            "en": "IUS TechSummit 2027"
        },
        "tagline": {
            "tr": "Balkanların ve Avrupa'nın teknoloji liderleri IUS Amfisinde buluşuyor.",
            "en": "Regional & European engineering leaders convene at IUS Main Amphitheater."
        },
        "author": "Yönetim Kurulu & PR Komitesi",
        "ownership": {
            "tr": "Yönetim Kurulu & Muhammed Efe Ural / Bakir Bašić (PR)",
            "en": "Executive Board & PR / Sponsorship Leads"
        },
        "budget": "Tahmini: Şirket Sponsorlukları (Değerlendirmede)",
        "budget_level": "Sponsorluk Destekli",
        "difficulty": 4,
        "target_audience": {
            "tr": "150+ Öğrenci, Akademisyenler ve Şirket Yöneticileri",
            "en": "150+ Students, Academics and Industry Leaders"
        },
        "image": "assets/engineering_summit_hero.jpg",
        "gallery": [
            "assets/engineering_summit_hero.jpg"
        ],
        "problem": {
            "tr": "Mühendislik öğrencilerinin mezuniyet öncesinde sektör yöneticileriyle doğrudan tanışıp staj ve iş imkanlarına erişebileceği prestijli bir kampüs zirvesi bulunmaması.",
            "en": "Engineering students have limited direct exposure to corporate tech directors and hiring managers on campus prior to graduation."
        },
        "solution": {
            "tr": "Büyük amfide tam günlük konferans: ana keynote konuşmaları, sektörel paneller, öğrenci proje demo fuarı ve fuaye alanında staj/iş mülakat stantları.",
            "en": "Full-day auditorium conference featuring keynote talks, industry panels, live student hardware demo tables, and corporate career matchmaking booths."
        },
        "specs": [
            {"label": "Katılım", "value": "150+ Delege & Ziyaretçi"},
            {"label": "Konuşmacılar", "value": "Bit Alliance & Global Tech Şirketleri"},
            {"label": "Sergi", "value": "Öğrenci Kulübü Proje Stantları"},
            {"label": "Kariyer", "value": "Doğrudan Staj ve İş Görüşmeleri"}
        ],
        "links": ["https://hasankaan28.github.io/ius-engineering-events-site/"],
        "first_step": {
            "tr": "Amfi rezervasyonu ve kurumsal ana konuşmacı davet mektuplarının gönderilmesi.",
            "en": "Reserve the main amphitheater and issue formal invitations to keynote industry leaders."
        }
    }
]

def fetch_sheet_rows():
    req = urllib.request.Request(CSV_EXPORT_URL, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            content = resp.read().decode("utf-8", errors="replace")
        reader = csv.reader(content.splitlines())
        rows = list(reader)
        if len(rows) <= 1:
            return []
        data_rows = rows[1:]
        return data_rows
    except Exception as e:
        print(f"[!] Canlı e-tablo çekilirken hata: {e}")
        return []

def sync_projects():
    print("[*] 📡 Yönetim E-Tablosu taranıyor ve gerçek kulüp projeleri derleniyor...")
    sheet_rows = fetch_sheet_rows()
    
    # Start with curated projects
    projects = list(FLAGSHIP_PROJECTS)
    
    print(f"[*] Canlı form yanıt sayısı: {len(sheet_rows)}")
    
    # Process sheet responses
    new_from_sheet = 0
    for idx, r in enumerate(sheet_rows, 1):
        if not r or len(r) < 3 or not r[2].strip():
            continue
            
        timestamp = r[0] if len(r) > 0 else ""
        author = r[1] if len(r) > 1 else "Kulüp Üyesi"
        title = r[2].strip()
        category_raw = r[3] if len(r) > 3 else "Genel Mühendislik"
        problem_solution = r[4] if len(r) > 4 else ""
        description = r[5] if len(r) > 5 else ""
        target_audience = r[6] if len(r) > 6 else "Tüm IUS Öğrencileri"
        budget = r[7] if len(r) > 7 else "Değerlendirme Aşamasında"
        difficulty_str = r[8] if len(r) > 8 else "3"
        ownership = r[9] if len(r) > 9 else author
        first_step = r[10] if len(r) > 10 else ""
        links_raw = r[11] if len(r) > 11 else ""
        
        norm_title = title.lower()
        
        # Check if matched with PowerHub (Hasan Kaan)
        if "powerbank" in norm_title or "powerhub" in norm_title:
            p1 = projects[0]
            p1["sheet_timestamp"] = timestamp
            p1["sheet_raw_author"] = author
            p1["problem"]["tr"] = problem_solution if problem_solution else p1["problem"]["tr"]
            p1["solution"]["tr"] = description if description else p1["solution"]["tr"]
            if budget:
                p1["budget"] = f"Tahmini: {budget}"
            if first_step:
                p1["first_step"]["tr"] = first_step
            if links_raw:
                p1["links"] = [l.strip() for l in links_raw.split() if l.startswith("http")]
            continue

        # Check if matched with Dining / Yemekhane (Mahmut İhsan)
        if "yemek" in norm_title or "yemekhane" in norm_title or "menü" in norm_title or "dining" in norm_title:
            p2 = projects[1]
            p2["sheet_timestamp"] = timestamp
            p2["sheet_raw_author"] = author
            p2["problem"]["tr"] = problem_solution if problem_solution else p2["problem"]["tr"]
            p2["solution"]["tr"] = description if description else p2["solution"]["tr"]
            if budget:
                p2["budget"] = f"Tahmini: {budget}"
            if first_step:
                p2["first_step"]["tr"] = first_step
            if links_raw:
                p2["links"] = [l.strip() for l in links_raw.split() if l.startswith("http")]
            continue

        # Any new project from sheet that isn't PowerHub or Dining:
        try:
            diff_val = int(difficulty_str.split()[0].replace("/5", ""))
        except Exception:
            diff_val = 3

        visual = choose_ai_visual(title, category_raw, f"{problem_solution} {description}")

        project_item = {
            "id": f"sheet-idea-{idx}",
            "sheet_id": idx,
            "is_flagship": False,
            "featured": False,
            "category": {
                "tr": category_raw,
                "en": category_raw
            },
            "badge": {
                "tr": "💡 Yeni Yönetim Önerisi",
                "en": "💡 New Idea"
            },
            "title": {
                "tr": title,
                "en": title
            },
            "tagline": {
                "tr": problem_solution[:120] + "..." if len(problem_solution) > 120 else problem_solution,
                "en": problem_solution[:120] + "..." if len(problem_solution) > 120 else problem_solution
            },
            "author": author,
            "ownership": {
                "tr": ownership,
                "en": ownership
            },
            "budget": f"Tahmini: {budget}",
            "budget_level": "Topluluk Havuzu",
            "difficulty": diff_val,
            "target_audience": {
                "tr": target_audience,
                "en": target_audience
            },
            "image": visual,
            "gallery": [visual],
            "problem": {
                "tr": problem_solution,
                "en": problem_solution
            },
            "solution": {
                "tr": description,
                "en": description
            },
            "specs": [
                {"label": "Öneren", "value": author},
                {"label": "Tarih", "value": timestamp},
                {"label": "Zorluk", "value": f"{diff_val}/5"}
            ],
            "links": [l.strip() for l in links_raw.split() if l.startswith("http")],
            "first_step": {
                "tr": first_step,
                "en": first_step
            }
        }
        projects.append(project_item)
        new_from_sheet += 1

    # Save JSON output
    with open(JSON_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(projects, f, ensure_ascii=False, indent=2)

    # Save JS output
    js_content = f"// IUS Engineering Club - Live Project Showcase Dataset\n// Generated at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\nwindow.IEC_PROJECTS = {json.dumps(projects, ensure_ascii=False, indent=2)};\n"
    with open(JS_OUTPUT, "w", encoding="utf-8") as f:
        f.write(js_content)

    print(f"[✓] Başarıyla {len(projects)} gerçek kulüp projesi derlendi.")
    for p in projects:
        print(f"    - #{p['sheet_id']} {p['title']['tr']} (Bütçe: {p['budget']})")
    print(f"    JSON Dosyası: {JSON_OUTPUT}")
    print(f"    JS Dosyası:   {JS_OUTPUT}")
    return projects

if __name__ == "__main__":
    sync_projects()
