#!/usr/bin/env python3
"""
IEC Deep Space Observatory Synchronizer
Fetches live Linear tasks and Google Form members, builds a comprehensive
ecosystem knowledge graph, and synchronizes graphify-out/graph.json and graph.html.
"""

import os
import sys
import json
import csv
import re
import urllib.request
from pathlib import Path
from datetime import datetime

# Fix Windows console UTF-8 output
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(WORKSPACE_ROOT / "scripts"))

from linear_ops import get_issues, graphql
from fetch_google_sheet import fetch_responses, CSV_FILE

GRAPH_DIR = WORKSPACE_ROOT / "graphify-out"
GRAPH_JSON_FILE = GRAPH_DIR / "graph.json"
GRAPH_HTML_FILE = GRAPH_DIR / "graph.html"

# Management Board Static Canonical Metadata
BOARD_MEMBERS = {
    "hasan_kaan": {
        "id": "board_hasan_kaan",
        "name": "Hasan Kaan",
        "role": "👑 Kurucu Ortak & Başkan (Co-Founder & President)",
        "student_id": "250302195",
        "dept": "FENS (1. Sınıf)",
        "email": "contact@ius.edu.ba",
        "duties": "Kulübün kurucu ortağı ve başkanı. Yönetim Kurulu üyeleri ile birlikte kulübün vizyonunu, teknik yapılanmasını, Linear sprintlerini, atölyeleri ve DevHack 2027 maratonunu koordine eder; takım ruhunu ön planda tutar.",
        "tools": ["Linear.app Task Hub", "Antigravity IDE & Python Automation", "WhatsApp Community Hub", "AI/LLM Workshop Stacks", "Tüm Stratejik Kararlar"],
        "collaborates": ["Mahmut İhsan (Kurucu Ortak & Bşk. Yrd.)", "Bekir Enes (Sayman)", "Muhammed Efe Ural (PR & Medya Lideri)", "Komiteler & Takımlar"],
        "isGodNode": True,
        "aliases": ["hasan kaan", "hasankaan", "hasan"]
    },
    "mahmut_ihsan": {
        "id": "board_mahmut_ihsan",
        "name": "Mahmut İhsan Avcı",
        "role": "🚀 Kurucu Ortak & Başkan Yrd. (Co-Founder & Vice President)",
        "student_id": "250302233",
        "dept": "FENS (1. Sınıf)",
        "phone": "[Protected]",
        "email": "contact@ius.edu.ba",
        "duties": "Kulübün kurucu ortağı, başkan yardımcısı ve operasyonel sağ kolu. Üye alımları, topluluk moderasyonu, resmi toplantı kayıtları ve idari/lojistik operasyonların yöneticisi.",
        "tools": ["Google Sheets Live Ingestion", "WhatsApp Community Hub", "Resmi Toplantı Tutanakları", "Üye Kayıt Takibi"],
        "collaborates": ["Hasan Kaan (Başkan)", "Bekir Enes (Sayman)", "Muhammed Efe Ural (PR Lead)", "Kayıtlı Üyeler"],
        "isGodNode": True,
        "aliases": ["mahmut ihsan avcı", "mahmut ihsan", "mahmut.ihsanavcii"]
    },
    "bekir_enes": {
        "id": "board_bekir_enes",
        "name": "Bekir Enes Çokbekler",
        "role": "💰 Sayman & Finans Lideri (Treasurer & Finance Lead)",
        "student_id": "250302229",
        "dept": "FENS (1. Sınıf)",
        "phone": "[Protected]",
        "email": "contact@ius.edu.ba",
        "duties": "Bütçe ve finans lideri. SCC 1.300 KM taslak bütçe ve 3 katmanlı sürdürülebilir finans modelini (Şirket sponsorlukları 800 KM, Üniversite/SCC hibe desteği 300 KM, DevHack cüzi katılım payı 200 KM) yönetir. Saraybosna teknoloji ekosistemi şirketleriyle görüşmeler yürütür. Muhammed Efe Ural ile sponsorluk paketlerini koordine eder.",
        "tools": ["Corporate Sponsorship Package", "1.300 KM 3-Katmanlı Bütçe Tablosu", "Promotion Day Afiş & Roll-up Materyalleri"],
        "collaborates": ["Hasan Kaan (Başkan)", "Mahmut İhsan (Bşk. Yrd.)", "Muhammed Efe Ural (PR & Medya)", "Saraybosna Şirketleri"],
        "isGodNode": True,
        "aliases": ["bekir enes çokbekler", "bekir enes", "46bekir70"]
    },
    "efe_ural": {
        "id": "board_efe_ural",
        "name": "Muhammed Efe Ural",
        "role": "📣 PR & Medya / Sponsorluk Lideri (PR & Media Lead)",
        "student_id": "240302169",
        "dept": "FENS (2. Sınıf)",
        "phone": "[Protected]",
        "email": "contact@ius.edu.ba",
        "duties": "Kulübün ASIL PR ve Medya Lideri. Kulübün açılacak resmi Instagram hesabının tam mülkiyeti, görsel tasarım & afiş hazırlığı (Marshmallow Challenge & etkinlik posterleri), LinkedIn şirket içerikleri, viral reels paylaşımları ve Bekir Enes ile şirket kurumsal sponsorluk ortaklığı.",
        "tools": ["Instagram Resmi Hesabı (Stealth/Lansman)", "Etkinlik Afişi & Grafik Tasarım", "LinkedIn Şirket Sayfası", "Sponsorluk Ortaklıkları"],
        "collaborates": ["Hasan Kaan (Başkan)", "Mahmut İhsan (Bşk. Yrd.)", "Bekir Enes (Sayman)", "Tüm Komiteler"],
        "isGodNode": True,
        "aliases": ["muhammed efe ural", "efe ural", "efe", "uralefe10", "pr lead", "pr", "240302169"]
    }
}

# SECTOR COORDINATES MAP (Clean Spatial Architecture)
SECTOR_POSITIONS = {
    # 👑 CENTER: LEADERSHIP QUAD (SECTOR 02)
    "board_hasan_kaan": {"x": 0, "y": -40},
    "board_mahmut_ihsan": {"x": -220, "y": 40},
    "board_efe_ural": {"x": 220, "y": 40},
    "board_bekir_enes": {"x": 0, "y": 140},
    "platform_linear": {"x": 0, "y": -220},
    "tool_ide": {"x": -260, "y": -220},
    "platform_linkedin": {"x": 260, "y": -220},

    # 🏛️ LEFT FLANK: GOVERNANCE & ACADEMICS
    "advisor": {"x": -740, "y": -200},
    "sks": {"x": -740, "y": 50},

    # 🛠️ LEFT-MID: TECHNICAL COMMITTEES
    "comm_software": {"x": -510, "y": -90},
    "comm_multi": {"x": -510, "y": 100},
    "comm_ops": {"x": -510, "y": 270},
    "comm_social": {"x": -510, "y": 420},
    "project_powerhub": {"x": -740, "y": 180},

    # 📄 BOTTOM SHELF: ŞABLONLAR & RESMİ BELGELER (TEMPLATES ARCHIVE)
    "doc_constitution": {"x": -410, "y": 550},
    "doc_founding": {"x": -140, "y": 570},
    "doc_annual_plan": {"x": 140, "y": 570},
    "doc_budget": {"x": 410, "y": 550},
    "doc_sponsorship": {"x": 680, "y": 520},

    # 👥 RIGHT FLANK: COMMUNITY & DATA INGESTION
    "sheet_responses": {"x": 520, "y": -60},
    "fetch_tool": {"x": 750, "y": -60},
    "comm_whatsapp": {"x": 520, "y": 110},
    "members_cohort": {"x": 750, "y": 110},

    # 🚀 TOP-RIGHT: EVENTS & INDUSTRY ECOSYSTEM
    "event_launch": {"x": 750, "y": -250},
    "event_hackathon": {"x": 980, "y": -290},
    "ext_industry": {"x": 980, "y": -120},
}

def resolve_assignee_id(assignee_name):
    if not assignee_name:
        return "board_hasan_kaan" # default fallback
    name_lower = assignee_name.lower().strip()
    for key, data in BOARD_MEMBERS.items():
        for alias in data["aliases"]:
            if alias in name_lower:
                return data["id"]
    return "board_hasan_kaan"

def build_observatory_graph():
    print("[*] 1/3 Canlı Linear Görevleri Çekiliyor...")
    # Fetch issues with URLs
    issues_query = """
    query {
      issues {
        nodes {
          id
          identifier
          title
          description
          priority
          dueDate
          url
          state { id name }
          assignee { id name email }
        }
      }
    }
    """
    try:
        raw_issues = graphql(issues_query).get("issues", {}).get("nodes", [])
        print(f"    [✓] {len(raw_issues)} Linear görevi başarıyla alındı.")
    except Exception as e:
        print(f"    [!] Linear API geçici zaman aşımı ({e}), önbellekten kurtarılıyor...")
        raw_issues = []
        if GRAPH_JSON_FILE.exists():
            try:
                old_data = json.loads(GRAPH_JSON_FILE.read_text(encoding="utf-8"))
                for n in old_data.get("nodes", []):
                    if n.get("type") == "LinearTask":
                        raw_issues.append({
                            "id": n["id"],
                            "identifier": n.get("task_ident", "IUS-1"),
                            "title": n["label"],
                            "description": n.get("details", ""),
                            "priority": n.get("task_priority", 1),
                            "url": n.get("url", ""),
                            "state": {"name": n.get("task_state", "Todo")},
                            "assignee": {"name": n.get("task_assignee", "Hasan Kaan")}
                        })
            except Exception:
                pass
        print(f"    [✓] {len(raw_issues)} Linear görevi önbellekten yüklendi.")

    print("[*] 2/3 Canlı Google Sheets Yanıtları Çekiliyor...")
    sheet_rows = fetch_responses()
    print(f"    [✓] {len(sheet_rows)} form yanıtı işleniyor.")

    # Filter normal members (non-board) from sheet rows upfront, excluding figureheads
    EXCLUDED_FIGUREHEADS = ["250302201", "260302030", "kaan mete", "bakir basic", "bakir bašić", "kaan mete şenyıldız"]
    normal_member_rows = []
    for r in sheet_rows:
        if len(r) < 5:
            continue
        m_name = r[1].strip()
        m_id = r[4].strip()
        is_board = False
        for b in BOARD_MEMBERS.values():
            if b["student_id"] == m_id or any(al in m_name.lower() for al in b["aliases"]):
                is_board = True
                break
        if is_board:
            continue
        if m_id in EXCLUDED_FIGUREHEADS or any(ex in m_name.lower() for ex in EXCLUDED_FIGUREHEADS):
            continue
        normal_member_rows.append(r)

    nodes = []
    edges = []

    # Helper function to append node with coordinates
    def add_node(node_dict):
        nid = node_dict["id"]
        if nid in SECTOR_POSITIONS:
            node_dict["x"] = SECTOR_POSITIONS[nid]["x"]
            node_dict["y"] = SECTOR_POSITIONS[nid]["y"]
        nodes.append(node_dict)

    # 1. CORE PLATFORM & INFRASTRUCTURE NODES
    add_node({
        "id": "platform_linear",
        "label": "Linear.app Task Hub",
        "cluster": "Infrastructure",
        "isGodNode": True,
        "type": "Software",
        "file": "scripts/linear_manager.py",
        "url": "https://linear.app/ius-engineering-events",
        "details": f"Merkezi görev ve sprint motoru. Antigravity IDE ile çift yönlü GraphQL API senkronizasyonu ({len(raw_issues)} aktif görev kayıtlı)."
    })

    add_node({
        "id": "tool_ide",
        "label": "Antigravity IDE & Automation",
        "cluster": "Infrastructure",
        "isGodNode": False,
        "type": "Engine",
        "file": "scripts/sync_observatory.py",
        "details": "Google DeepMind Antigravity IDE ortamı. Canlı veri çekiciler, Python otomasyonları ve Observatory harita jeneratörü."
    })

    add_node({
        "id": "sheet_responses",
        "label": f"Google Sheets ({len(sheet_rows)} Kayıt / {len(normal_member_rows)} Normal Üye)",
        "cluster": "Data",
        "isGodNode": False,
        "type": "Dataset",
        "file": "data/form_responses.csv",
        "url": "https://docs.google.com/spreadsheets/d/1pLeiQpBNSfDFPGa5IqLbSGoz0Z2Lm3Olu-mq3XZhzbQ/edit?usp=sharing",
        "details": f"Canlı Google Form yanıt tablosu. Mahmut İhsan ve scriptler tarafından izlenir. {len(normal_member_rows)} onaylı aktif üye kayıtlı."
    })

    edges.append({"source": "fetch_tool", "target": "sheet_responses", "relation": "SYNCS_CSV_FROM"})

    # 2. GOVERNANCE & ACADEMIC NODES
    add_node({
        "id": "advisor",
        "label": "Prof. Dr. Leila Miller (Faculty Advisor - Onaylandı)",
        "cluster": "Governance",
        "isGodNode": True,
        "type": "Academic",
        "file": "templates/ACADEMIC_ADVISOR_INVITATION.md",
        "email": "lmiller@ius.edu.ba",
        "details": "FENS Fakültesinden resmi kulüp akademik danışmanı (Full Professor Dr.). Rektörlük, dekanlık ve SCC nezdinde kurumsal akademik güvence sağlar. Form F252 için tek fiziki ıslak imzası alınacaktır (Salı 11:50 Calculus çıkışı, A F2.14). Asistan: Ilma Papić (itarhanis-papic@ius.edu.ba)."
    })

    add_node({
        "id": "sks",
        "label": "IUS Student Affairs (SKS / SCC)",
        "cluster": "Governance",
        "isGodNode": False,
        "type": "University",
        "file": "templates/IUS_SKS_APPLICATION_PETITION.md",
        "details": "Kulüp resmiyetini onaylayan, amfi ve stant izinlerini veren IUS Öğrenci Kulüpleri Komisyonu."
    })

    # 3. COMMITTEES
    add_node({
        "id": "comm_software",
        "label": "Software & AI Committee",
        "cluster": "Committees",
        "isGodNode": True,
        "type": "Committee",
        "file": "organization/ORGANIZATIONAL_STRUCTURE.md",
        "details": "Yapay zeka atölyeleri, Cursor/Copilot pratikleri, modern web mimarisi ve kodlama kampları yürütücüsü."
    })

    add_node({
        "id": "comm_multi",
        "label": "Multidisciplinary Eng Committee",
        "cluster": "Committees",
        "isGodNode": False,
        "type": "Committee",
        "file": "organization/ORGANIZATIONAL_STRUCTURE.md",
        "details": "Bilgisayar, Elektrik-Elektronik, Makine ve Endüstri mühendisliğini donanım/IoT projelerinde birleştirir."
    })

    add_node({
        "id": "comm_ops",
        "label": "Event Ops & Logistics",
        "cluster": "Committees",
        "isGodNode": False,
        "type": "Committee",
        "file": "organization/ROLE_DESCRIPTIONS.md",
        "details": "Amfi rezervasyonları, mikrofon/projeksiyon ses sistemleri, akış kontrolü ve ikram lojistiği."
    })

    add_node({
        "id": "comm_social",
        "label": "PR & Social Media Committee",
        "cluster": "Committees",
        "isGodNode": True,
        "type": "Committee",
        "file": "organization/ROLE_DESCRIPTIONS.md",
        "details": "Lider: Muhammed Efe Ural (PR & Medya Lideri). Kulübün açılacak resmi Instagram hesabı yönetimi, etkinlik afişi ve kreatif tasarımlar (Marshmallow Challenge posteri) ile şirket sponsorluk ilişkileri (Bekir Enes ile ortak koordinasyon)."
    })

    # 4. COMMUNITY
    add_node({
        "id": "comm_whatsapp",
        "label": "WhatsApp Official Community",
        "cluster": "Community",
        "isGodNode": False,
        "type": "Platform",
        "file": "community/WHATSAPP_TELEGRAM_COMMUNITY_GUIDE.md",
        "url": "https://chat.whatsapp.com/LKMpyfm7K5R3F0rXezcXXN",
        "details": "Üye koordinasyonu ve hızlı anlık duyurular için resmi WhatsApp grubu."
    })

    # 5. DOCUMENTS & TEMPLATES (DEDICATED SHELF: RESMİ ŞABLONLAR)
    add_node({
        "id": "doc_constitution",
        "label": "📄 IEC Kulüp Tüzüğü",
        "cluster": "Documents",
        "isGodNode": True,
        "type": "Doc",
        "file": "constitution/CONSTITUTION.md",
        "details": "Resmi kulüp anayasası ve tüzüğü (İngilizce). 9 Bölüm, seçim kuralları ve komite ilkeleri."
    })

    add_node({
        "id": "doc_founding",
        "label": f"📄 SCC Kurucu Üye Listesi ({len(normal_member_rows)}/10)",
        "cluster": "Documents",
        "isGodNode": True,
        "type": "Doc",
        "file": "templates/SCC_FOUNDING_10_MEMBERS.md",
        "details": f"Resmi yönetim kadrosu: 4 Asil Lider (Başkan: Hasan Kaan, Bşk Yrd: Mahmut İhsan, Sayman: Bekir Enes, PR Lead: Muhammed Efe Ural) | {len(normal_member_rows)} Kurucu Normal Üye Kayıtlı (10/10 Kotası Tamamlandı)."
    })

    add_node({
        "id": "doc_annual_plan",
        "label": "📄 SCC Yıllık Faaliyet Planı",
        "cluster": "Documents",
        "isGodNode": False,
        "type": "Doc",
        "file": "templates/SCC_ANNUAL_ACTIVITY_PLAN.md",
        "details": "4 Temel Sütun: Haftalık AI Atölyeleri, Kampüs Konuşmacıları, Online Tech-Talks ve DevHack 2027."
    })

    add_node({
        "id": "doc_budget",
        "label": "📄 SCC Taslak Bütçe (1.300 KM)",
        "cluster": "Documents",
        "isGodNode": False,
        "type": "Doc",
        "file": "templates/SCC_DRAFT_BUDGET.md",
        "details": "3 Katmanlı Güvenli Finans Modeli: Şirket sponsorlukları (800 KM) + Üniversite/SCC faaliyet ödeneği (300 KM) + Güvence amaçlı cüzi katılım payı (200 KM - DevHack için 5 KM)."
    })

    add_node({
        "id": "doc_sponsorship",
        "label": "📄 Kurumsal Sponsorluk Paketi",
        "cluster": "Documents",
        "isGodNode": False,
        "type": "Doc",
        "file": "sponsorship/SPONSORSHIP_PACKAGE.md",
        "details": "Saraybosna yazılım firmalarına sunulan sponsorluk paketi (Platin, Altın, Gümüş, Bronz)."
    })

    add_node({
        "id": "platform_linkedin",
        "label": "LinkedIn Şirket Sayfası (Canlı)",
        "cluster": "PR & Media",
        "isGodNode": True,
        "type": "Platform",
        "url": "https://www.linkedin.com/company/ius-engineering-club",
        "file": "pr_and_branding/LINKEDIN_PAGE_SETUP.md",
        "details": "Resmi kurumsal LinkedIn şirketi. Logo, 1128x191 banner, FENS kampüs konumu (Hrasnička Cesta 15) ve About metni ile canlıda. 6 kişilik yönetim kurulu ve kişisel profil rozetleri bağlı."
    })

    # 6. FLAGSHIP EVENTS & EXTERNAL
    add_node({
        "id": "event_launch",
        "label": "🎪 Kickoff: Marshmallow Challenge",
        "cluster": "Events",
        "isGodNode": True,
        "type": "Milestone",
        "file": "roadmap/MARSHMALLOW_CHALLENGE_KICKOFF.md",
        "details": "İlk büyük tanışma toplantısı! Moderasyon: IEC Yönetim Kurulu & Kurucu Ekip (Kurul Üyeleri ile Birlikte). 20 spagetti, ip, bant ve marshmallow ile 18 dakikalık kule inşa etme turnuvası (Icebreaker, Hızlı Prototipleme & Multidisipliner Mühendislik)."
    })

    add_node({
        "id": "event_hackathon",
        "label": "IUS DevHack 2026/2027 (24h)",
        "cluster": "Events",
        "isGodNode": True,
        "type": "Flagship",
        "file": "roadmap/FLAGSHIP_EVENTS.md",
        "details": "24 saatlik büyük IUS yazılım ve inovasyon maratonu. Nakit ödüller ve şirket mentörleri."
    })

    add_node({
        "id": "ext_industry",
        "label": "Sarajevo Tech Ecosystem",
        "cluster": "External",
        "isGodNode": False,
        "type": "Partner",
        "file": "roadmap/FLAGSHIP_EVENTS.md",
        "details": "Bit Alliance ve Saraybosna yazılım şirketleri (Sponsorluk ve konuşmacı havuzu)."
    })

    # 6.5. CAMPUS PROJECTS (HARDWARE & IOT)
    add_node({
        "id": "project_powerhub",
        "label": "⚡ IUS PowerHub (RFID İstasyonları)",
        "cluster": "Projects",
        "isGodNode": True,
        "type": "HardwareIoT",
        "file": "roadmap/CAMPUS_PROJECTS_PROPOSAL.md",
        "details": "Öğrenci kartı (RFID) ile alınabilen, pogo-pin ile otomatik şarj olan akıllı kampüs powerbank istasyonları. EE/CS/ME ortak donanım & IoT amiral gemisi projesi."
    })

    # 7. MANAGEMENT BOARD NODES
    for member_key, b in BOARD_MEMBERS.items():
        node_id = b["id"]
        add_node({
            "id": node_id,
            "label": f"{b['name']} ({b['role'].split('(')[0].strip()})",
            "cluster": "Leadership",
            "isGodNode": b["isGodNode"],
            "type": "BoardMember",
            "file": "organization/ROLE_DESCRIPTIONS.md",
            "role_title": b["role"],
            "student_id": b.get("student_id", ""),
            "dept": b.get("dept", ""),
            "duties": b["duties"],
            "tools": b["tools"],
            "collaborates": b["collaborates"],
            "details": f"[{b['role']}] {b.get('dept', '')} - No: {b.get('student_id', '')}\nGörevler: {b['duties']}"
        })

    # Board Internal & Core Edges (4 Asil Yönetim Kurulu & Sinerji)
    edges.append({"source": "board_hasan_kaan", "target": "board_mahmut_ihsan", "relation": "KURUCU_ORTAKLAR"})
    edges.append({"source": "board_mahmut_ihsan", "target": "board_hasan_kaan", "relation": "BASKAN_YARDIMCISI"})
    edges.append({"source": "board_bekir_enes", "target": "board_hasan_kaan", "relation": "FINANS_KOORDINASYONU"})
    edges.append({"source": "board_efe_ural", "target": "board_hasan_kaan", "relation": "PR_VE_MEDYA_LIDERI"})
    edges.append({"source": "board_efe_ural", "target": "board_bekir_enes", "relation": "SPONSORLUK_ORTAKLIGI"})
    edges.append({"source": "board_efe_ural", "target": "board_mahmut_ihsan", "relation": "DUYURU_VE_ILETISIM"})
    edges.append({"source": "board_bekir_enes", "target": "board_mahmut_ihsan", "relation": "BUTCE_VE_OPERASYON"})

    edges.append({"source": "board_hasan_kaan", "target": "advisor", "relation": "ACADEMIC_LIAISON"})
    edges.append({"source": "advisor", "target": "board_hasan_kaan", "relation": "MENTORS_PRESIDENT"})
    edges.append({"source": "board_hasan_kaan", "target": "sks", "relation": "OFFICIAL_PRESIDENT_LIAISON"})
    edges.append({"source": "board_hasan_kaan", "target": "doc_constitution", "relation": "LEAD_AUTHOR"})
    edges.append({"source": "board_hasan_kaan", "target": "event_launch", "relation": "LIDERLIK_EDER"})

    edges.append({"source": "board_hasan_kaan", "target": "platform_linear", "relation": "ORCHESTRATES_TASKS"})
    edges.append({"source": "board_hasan_kaan", "target": "tool_ide", "relation": "AUTOMATES_WITH"})
    edges.append({"source": "board_hasan_kaan", "target": "comm_software", "relation": "DIRECTS_COMMITTEE"})
    edges.append({"source": "board_hasan_kaan", "target": "comm_multi", "relation": "DIRECTS_COMMITTEE"})

    edges.append({"source": "board_mahmut_ihsan", "target": "sheet_responses", "relation": "MONITORS_FORM"})
    edges.append({"source": "board_mahmut_ihsan", "target": "comm_whatsapp", "relation": "MODERATES_COMMUNITY"})
    edges.append({"source": "board_mahmut_ihsan", "target": "doc_founding", "relation": "COMPILES_ROSTER"})

    edges.append({"source": "board_bekir_enes", "target": "doc_sponsorship", "relation": "AUTHORS_PACKAGE"})
    edges.append({"source": "board_bekir_enes", "target": "doc_budget", "relation": "MANAGES_1300KM_BUDGET"})
    edges.append({"source": "board_bekir_enes", "target": "ext_industry", "relation": "PITCHES_SPONSORSHIPS"})
    edges.append({"source": "sks", "target": "doc_budget", "relation": "FUNDS_GRANT_SUPPORT"})
    edges.append({"source": "ext_industry", "target": "doc_budget", "relation": "SPONSORS_800KM"})

    edges.append({"source": "board_efe_ural", "target": "platform_linkedin", "relation": "CONTENT_ADMIN"})
    edges.append({"source": "board_efe_ural", "target": "event_launch", "relation": "DESIGNS_POSTER_PROMO"})
    edges.append({"source": "board_efe_ural", "target": "comm_social", "relation": "DIRECTS_COMMITTEE"})
    edges.append({"source": "board_efe_ural", "target": "doc_sponsorship", "relation": "CO_AUTHORS_SPONSORSHIP"})
    edges.append({"source": "board_efe_ural", "target": "ext_industry", "relation": "CORPORATE_MEDIA_REACH"})

    edges.append({"source": "comm_social", "target": "event_launch", "relation": "PROMOTES_KICKOFF"})
    edges.append({"source": "event_launch", "target": "advisor", "relation": "HONOR_JURY"})
    edges.append({"source": "advisor", "target": "sks", "relation": "RESMI_FAKULTE_ONAYI"})
    edges.append({"source": "advisor", "target": "doc_founding", "relation": "TEK_ISLAK_IMZA"})

    # LinkedIn Company & PR Edges
    edges.append({"source": "board_hasan_kaan", "target": "platform_linkedin", "relation": "FOUNDER_AND_SUPER_ADMIN"})
    edges.append({"source": "board_mahmut_ihsan", "target": "platform_linkedin", "relation": "SUPER_ADMIN"})
    edges.append({"source": "platform_linkedin", "target": "ext_industry", "relation": "CORPORATE_BRIDGE"})

    # Committee / Event / External Edges
    edges.append({"source": "comm_software", "target": "event_hackathon", "relation": "LEADS_TECHNICAL"})
    edges.append({"source": "ext_industry", "target": "event_hackathon", "relation": "SPONSORS"})
    edges.append({"source": "doc_founding", "target": "sks", "relation": "SUBMITTED_TO"})
    edges.append({"source": "comm_whatsapp", "target": "sheet_responses", "relation": "FUNNELS_REGISTRATIONS"})

    # IUS PowerHub Edges
    edges.append({"source": "comm_multi", "target": "project_powerhub", "relation": "BUILDS_HARDWARE"})
    edges.append({"source": "comm_software", "target": "project_powerhub", "relation": "DEVELOPS_FIRMWARE"})
    edges.append({"source": "board_hasan_kaan", "target": "project_powerhub", "relation": "PROJECT_LEAD"})

    # 8. LINEAR TASK NODES & EDGES (ACTIVE ONLY - COMPLETED TASKS EXCLUDED FOR CLARITY)
    def get_ident_num(x):
        m = re.search(r'\d+', x.get("identifier", ""))
        return int(m.group()) if m else 999
    
    # Filter out completed or canceled tasks to keep graph clean and readable
    active_issues = [
        iss for iss in raw_issues 
        if iss.get("state", {}).get("name") not in ("Done", "Canceled", "Duplicate")
    ]
    sorted_issues = sorted(active_issues, key=get_ident_num)
    total_tasks = len(sorted_issues)

    CLEAN_TASK_TITLES = {
        "IUS-5": "Danışman: Prof. Dr. Leila Miller (Done)",
        "IUS-6": "SCC Faaliyet Planı & Bütçe",
        "IUS-7": "Yönetim Kurulu Kadrosu (Done)",
        "IUS-8": "10 Üye İmza Operasyonu (8/10)",
        "IUS-9": "Kampüs Standı & Afişler",
        "IUS-10": "AI & Prompt Atölyeleri",
        "IUS-11": "Haftalık Online Tech-Talks",
        "IUS-12": "Kampüs Konuşmacıları",
        "IUS-13": "DevHack 2027 Hackathonu",
        "IUS-14": "TechSummit 2027 Zirvesi",
        "IUS-15": "🎪 Kickoff: Marshmallow Challenge",
        "IUS-16": "🎉 LinkedIn Sayfası (Done)",
        "IUS-17": "🤫 Instagram Lansmanı (Stealth)",
    }

    for idx, issue in enumerate(sorted_issues):
        ident = issue.get("identifier", "")
        title = issue.get("title", "")
        state_name = issue.get("state", {}).get("name", "Backlog")
        assignee_name = issue.get("assignee", {}).get("name", "Unassigned")
        priority_val = issue.get("priority", 0)
        url = issue.get("url", "")
        desc = issue.get("description", "") or ""

        task_node_id = f"linear_task_{ident}"

        # Determine isGodNode for top urgent active tasks
        is_god = state_name in ("In Progress", "Todo") and priority_val in (1, 2)

        # Coordinate calculation along the top horizontal celestial arc
        # Spans from -760 to +760, arched slightly at y: -500 to -550
        if total_tasks > 1:
            task_x = -760 + idx * (1520 / (total_tasks - 1))
            center_norm = abs(idx - (total_tasks - 1) / 2) / ((total_tasks - 1) / 2)
            task_y = -550 + int(center_norm * 45)
        else:
            task_x = 0
            task_y = -520

        # Concise clean title
        task_clean_title = CLEAN_TASK_TITLES.get(ident)
        if not task_clean_title:
            task_clean_title = re.sub(r'^[^\w\s]+', '', title).strip()
            task_clean_title = re.sub(r'\[.*?\]', '', task_clean_title).strip()
            if len(task_clean_title) > 28:
                task_clean_title = task_clean_title[:26] + ".."

        node_label = f"[{ident}] {task_clean_title}"

        nodes.append({
            "id": task_node_id,
            "label": node_label,
            "cluster": "Linear Tasks",
            "isGodNode": is_god,
            "type": "LinearTask",
            "task_ident": ident,
            "task_state": state_name,
            "task_priority": priority_val,
            "task_assignee": assignee_name,
            "url": url,
            "file": "scripts/linear_ops.py",
            "x": int(task_x),
            "y": int(task_y),
            "details": f"[{ident}] {title}\nDurum: {state_name} | Sorumlu: {assignee_name}\nÖncelik: {priority_val}\nURL: {url}\n\nÖzet: {desc[:280]}..."
        })

        # Connect Task -> Linear Platform
        edges.append({
            "source": task_node_id,
            "target": "platform_linear",
            "relation": "TRACKED_IN"
        })

        # Connect Board Assignee -> Task
        board_assignee_id = resolve_assignee_id(assignee_name)
        edges.append({
            "source": board_assignee_id,
            "target": task_node_id,
            "relation": f"LEADS_{state_name.upper().replace(' ', '_')}"
        })

        # Domain Specific Semantic Connections for Known Tasks
        if "5" in ident:
            edges.append({"source": task_node_id, "target": "advisor", "relation": "TARGETS_PROFESSOR"})
            edges.append({"source": task_node_id, "target": "doc_advisor_letter", "relation": "USES_OFFICIAL_LETTER"})
        elif "6" in ident:
            edges.append({"source": task_node_id, "target": "doc_annual_plan", "relation": "DELIVERS_PLAN"})
            edges.append({"source": task_node_id, "target": "doc_budget", "relation": "DELIVERS_BUDGET"})
            edges.append({"source": task_node_id, "target": "sks", "relation": "SUBMITS_TO"})
        elif "7" in ident:
            edges.append({"source": task_node_id, "target": "board_efe_ural", "relation": "CONFIRMS_LEADERSHIP"})
            edges.append({"source": task_node_id, "target": "doc_founding", "relation": "COMPLETES_BOARD"})
        elif "8" in ident:
            edges.append({"source": task_node_id, "target": "sheet_responses", "relation": "INGESTS_RECORDS"})
            edges.append({"source": task_node_id, "target": "doc_founding", "relation": "POPULATES_10_MEMBERS"})
            edges.append({"source": task_node_id, "target": "comm_whatsapp", "relation": "INVITES_CONFIDENTIAL"})
        elif "9" in ident:
            edges.append({"source": task_node_id, "target": "event_launch", "relation": "PREPARES_STAND"})
            edges.append({"source": task_node_id, "target": "board_efe_ural", "relation": "DELEGATES_PROMO"})
        elif "10" in ident:
            edges.append({"source": task_node_id, "target": "comm_software", "relation": "CURATES_CURRICULUM"})
        elif "11" in ident:
            edges.append({"source": task_node_id, "target": "comm_whatsapp", "relation": "ANNOUNCES_ON"})
            edges.append({"source": task_node_id, "target": "comm_software", "relation": "HOSTED_BY"})
        elif "12" in ident:
            edges.append({"source": task_node_id, "target": "ext_industry", "relation": "INVITES_SPEAKERS"})
            edges.append({"source": task_node_id, "target": "event_launch", "relation": "HOSTS_IN_AMPHI"})
        elif "13" in ident:
            edges.append({"source": task_node_id, "target": "event_hackathon", "relation": "PLANS_HACKATHON"})
            edges.append({"source": task_node_id, "target": "doc_sponsorship", "relation": "SEEKS_SPONSORS"})
        elif "14" in ident:
            edges.append({"source": task_node_id, "target": "ext_industry", "relation": "ORGANIZES_SUMMIT"})
            edges.append({"source": task_node_id, "target": "doc_sponsorship", "relation": "CORPORATE_BOOTHS"})
        elif "15" in ident:
            edges.append({"source": task_node_id, "target": "event_launch", "relation": "ORGANIZES_KICKOFF"})
            edges.append({"source": task_node_id, "target": "board_efe_ural", "relation": "POSTER_PROMO_LEAD"})

    # 9. AGGREGATED MEMBER COHORT (Clean & uncluttered overview)
    add_node({
        "id": "members_cohort",
        "label": f"👥 Kayıtlı Üye Topluluğu ({len(normal_member_rows)} Öğrenci)",
        "cluster": "Community",
        "isGodNode": False,
        "type": "CommunityBase",
        "file": "data/form_responses.csv",
        "url": "https://docs.google.com/spreadsheets/d/1pLeiQpBNSfDFPGa5IqLbSGoz0Z2Lm3Olu-mq3XZhzbQ/edit?usp=sharing",
        "details": f"Kulübün kayıtlı üye topluluğu ({len(normal_member_rows)} onaylı başvuru).\nGoogle Form üzerinden kayıt olmuş ve WhatsApp komünitesine dahil edilmiştir.\nTüzük 10 kurucu üye kotası (%100 tamamlandı).\nFENS (CSE, EE, Makine vb.) ve diğer fakültelerden çok disiplinli mühendislik öğrencileri."
    })

    edges.append({"source": "sheet_responses", "target": "members_cohort", "relation": "INGESTS_APPLICATIONS"})
    edges.append({"source": "members_cohort", "target": "comm_whatsapp", "relation": "ACTIVE_MEMBERS"})
    edges.append({"source": "members_cohort", "target": "doc_founding", "relation": "ROSTER_DOCUMENTED"})
    edges.append({"source": "members_cohort", "target": "event_launch", "relation": "ATTENDS_LAUNCH"})

    graph_data = {
        "project": "IUS Engineering Club",
        "generated_at": datetime.now().isoformat(),
        "stats": {
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "linear_tasks": len(active_issues),
            "completed_tasks": len(raw_issues) - len(active_issues),
            "registered_members": len(normal_member_rows),
            "board_members": 4
        },
        "nodes": nodes,
        "edges": edges
    }

    # Save to graph.json
    GRAPH_DIR.mkdir(parents=True, exist_ok=True)
    with open(GRAPH_JSON_FILE, "w", encoding="utf-8") as f:
        json.dump(graph_data, f, ensure_ascii=False, indent=2)
    # Also save to root graph.json for root HTTP server
    with open(WORKSPACE_ROOT / "graph.json", "w", encoding="utf-8") as f:
        json.dump(graph_data, f, ensure_ascii=False, indent=2)
    print(f"[✓] graph.json güncellendi: {GRAPH_JSON_FILE} ({len(nodes)} Düğüm, {len(edges)} Bağlantı)")

    # Inject embedded data into graph.html for offline/file:// support
    if GRAPH_HTML_FILE.exists():
        try:
            with open(GRAPH_HTML_FILE, "r", encoding="utf-8") as f:
                html_content = f.read()
            
            embedded_script = f"<script>window.EMBEDDED_GRAPH_DATA = {json.dumps(graph_data, ensure_ascii=False)};</script>\n"
            
            # Remove old embedded script if exists
            html_content = re.sub(r'<script>window\.EMBEDDED_GRAPH_DATA = .*?;</script>\n?', '', html_content)
            
            # Insert before </head>
            if "</head>" in html_content:
                html_content = html_content.replace("</head>", f"{embedded_script}</head>")
                with open(GRAPH_HTML_FILE, "w", encoding="utf-8") as f:
                    f.write(html_content)
                # Mirror to root index.html and graphify-out/index.html
                with open(WORKSPACE_ROOT / "index.html", "w", encoding="utf-8") as f:
                    f.write(html_content)
                with open(GRAPH_DIR / "index.html", "w", encoding="utf-8") as f:
                    f.write(html_content)
                print(f"[✓] graph.html ve index.html güncellendi (gömülü veri ve aynalar senkronize edildi).")
        except Exception as e:
            print(f"[!] graph.html gömme hatası: {e}")

    if "--push" in sys.argv:
        try:
            import subprocess
            subprocess.run(["git", "add", "index.html", "graph.json", "graphify-out/"], check=False, cwd=str(WORKSPACE_ROOT))
            subprocess.run(["git", "commit", "-m", "chore: sync observatory ecosystem updates"], check=False, cwd=str(WORKSPACE_ROOT))
            push_res = subprocess.run(["git", "push", "origin", "main"], check=False, cwd=str(WORKSPACE_ROOT))
            if push_res.returncode == 0:
                print("[✓] GitHub Pages için güncellemeler başarıyla pushlandı (https://hasankaan28.github.io/ius-engineering-events/).")
            else:
                print("[!] Git push uyarısı.")
        except Exception as e:
            print(f"[!] Git push hatası: {e}")

    return graph_data

if __name__ == "__main__":
    data = build_observatory_graph()
    print("[*] Observatory senkronizasyonu tamamlandı.")

