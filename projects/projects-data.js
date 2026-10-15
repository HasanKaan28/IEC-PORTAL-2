// IUS Engineering Club - Live Project Showcase Dataset
// Bilingual (TR / EN) Full Architecture Dataset
window.IEC_PROJECTS = [
  {
    "id": "powerbank-station",
    "sheet_id": 1,
    "is_flagship": true,
    "featured": true,
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
      "tr": "Hasan Kaan Karabulut (Proje Lideri & Donanım)",
      "en": "Hasan Kaan Karabulut (Project Lead & Hardware)"
    },
    "budget": {
      "tr": "Tahmini 400+ KM (Şirket Sponsorluğu Destekli)",
      "en": "Est. 400+ KM (Corporate Sponsorship Required)"
    },
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
      "tr": "Amfilerde, kütüphanede ve kafeteryada priz yetersizliği sebebiyle öğrencilerin ders aralarında cihazlarının şarjsız kalması ve priz arama karmaşası.",
      "en": "Shortage of accessible wall outlets across lecture halls, the library, and cafeterias leads to depleted student devices and disrupted study sessions."
    },
    "solution": {
      "tr": "Öğrencilerin IUS kartını okutarak otomatik şarj olan powerbank alabileceği, her blokta giriş katına yerleştirilecek 3 adet otonom manyetik şarj istasyonu.",
      "en": "Students tap their university RFID card to instantly release the fullest powerbank from smart magnetic charging docks deployed across campus building lobbies."
    },
    "specs": [
      {
        "label": {
          "tr": "Mimari",
          "en": "Architecture"
        },
        "value": {
          "tr": "ESP32 / Raspberry Pi IoT Gateway",
          "en": "ESP32 / Raspberry Pi IoT Gateway"
        }
      },
      {
        "label": {
          "tr": "Doğrulama",
          "en": "Authentication"
        },
        "value": {
          "tr": "RC522 / PN532 NFC-RFID Okuyucu",
          "en": "RC522 / PN532 NFC-RFID Reader"
        }
      },
      {
        "label": {
          "tr": "Güvenlik",
          "en": "Safety & Sensors"
        },
        "value": {
          "tr": "BMS Batarya Yönetimi & Termal Sensörler",
          "en": "BMS Battery Protection & Thermal Sensors"
        }
      },
      {
        "label": {
          "tr": "Şasi",
          "en": "Chassis & Enclosure"
        },
        "value": {
          "tr": "FENS Lab 3D Baskı / CNC Metal Gövde",
          "en": "FENS Lab 3D Printed / CNC Aluminum Enclosure"
        }
      }
    ],
    "links": [
      "https://porty.tech/"
    ],
    "first_step": {
      "tr": "FENS dekanlığına teknik sunum yapılması ve ilk prototip donanım parçaları için kurumsal sponsorluk görüşmesi.",
      "en": "Present engineering petition to FENS Deanship and open talks with Sarajevo tech sponsors for initial prototyping modules."
    },
    "sheet_timestamp": "13.10.2026 15:34:59",
    "sheet_raw_author": "Hasan Kaan Karabulut(Başkan)"
  },
  {
    "id": "dining-menu-system",
    "sheet_id": 2,
    "is_flagship": true,
    "featured": true,
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
    "budget": {
      "tr": "Sıfır Bütçe (Açık Kaynak & Gönüllü)",
      "en": "Zero Budget (Open-Source & Student Built)"
    },
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
      "tr": "Yemekhanede güncel olmayan fiziki panoların yarattığı karmaşıklık ve menüyü öğrenmek için fiziki olarak yemekhaneye gitme zorunluluğu.",
      "en": "Outdated physical boards creating confusion and students having to physically walk across campus just to check the daily meal offering."
    },
    "solution": {
      "tr": "Günün ana yemeklerini, tatlılarını, anlık fiyatları ve alerjen bilgilerini cep telefonundan gösteren hafif ve modern web/PWA platformu.",
      "en": "Lightweight, responsive progressive web app displaying daily main courses, desserts, live price boards, and dietary details directly on mobile."
    },
    "specs": [
      {
        "label": {
          "tr": "Platform",
          "en": "Platform"
        },
        "value": {
          "tr": "Mobil Uyumlu Responsive Web / PWA",
          "en": "Responsive Mobile Web / PWA"
        }
      },
      {
        "label": {
          "tr": "Veri Kaynağı",
          "en": "Data Source"
        },
        "value": {
          "tr": "Yemekhane Günlük Menü API & CMS",
          "en": "Cafeteria Daily Menu API & Headless CMS"
        }
      },
      {
        "label": {
          "tr": "Geliştirme Maliyeti",
          "en": "Development Cost"
        },
        "value": {
          "tr": "Sıfır Maliyet (Öğrenci Geliştirmesi)",
          "en": "Zero Cost (Student Open-Source Development)"
        }
      },
      {
        "label": {
          "tr": "Kapsam",
          "en": "Scope"
        },
        "value": {
          "tr": "Tüm Kampüs Kafeterya ve Yemekhaneleri",
          "en": "All Campus Dining Halls & Cafes"
        }
      }
    ],
    "links": [],
    "first_step": {
      "tr": "Dekanlık ve yemekhane işletmesi ile görüşülüp günlük menü veri akışının doğrulanması.",
      "en": "Meet with campus administration and dining staff to secure direct menu data feed."
    },
    "sheet_timestamp": "13.10.2026 15:48:12",
    "sheet_raw_author": "Mahmut İhsan Avcı (Başkan Yrd. / Operasyon)"
  },
  {
    "id": "devhack-2027",
    "sheet_id": 3,
    "is_flagship": true,
    "featured": true,
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
    "budget": {
      "tr": "Tahmini 800 KM (Şirket Sponsorlukları Destekli)",
      "en": "Est. 800 KM (Corporate Sponsorship Funded)"
    },
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
      {
        "label": {
          "tr": "Katılımcı",
          "en": "Participants"
        },
        "value": {
          "tr": "80+ Mühendislik Öğrencisi (20 Takım)",
          "en": "80+ Engineering Students (20 Teams)"
        }
      },
      {
        "label": {
          "tr": "Süre",
          "en": "Duration"
        },
        "value": {
          "tr": "24 Saat Kesintisiz Maraton",
          "en": "24 Hours Non-Stop Sprint"
        }
      },
      {
        "label": {
          "tr": "Ödül",
          "en": "Prizes"
        },
        "value": {
          "tr": "Staj İmkânları + Donanım/Teknoloji Ödülleri",
          "en": "Internship Offers + Tech & Hardware Awards"
        }
      },
      {
        "label": {
          "tr": "Lokasyon",
          "en": "Location"
        },
        "value": {
          "tr": "IUS FENS Bilgisayar & Donanım Labları",
          "en": "IUS FENS Computer & Hardware Labs"
        }
      }
    ],
    "links": [
      "https://github.com/HasanKaan28/ius-engineering-events"
    ],
    "first_step": {
      "tr": "Bit Alliance firmalarıyla sponsorluk paketlerinin ve ödül havuzunun kesinleştirilmesi.",
      "en": "Finalize tech sponsorship packages and prize pool with Bit Alliance partner companies."
    }
  },
  {
    "id": "ai-prompt-labs",
    "sheet_id": 4,
    "is_flagship": true,
    "featured": true,
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
    "budget": {
      "tr": "Tahmini 200 KM (Kulüp Faaliyet Ödeneği / Düşük Bütçe)",
      "en": "Est. 200 KM (Club Operational Allowance / Low Budget)"
    },
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
      {
        "label": {
          "tr": "Periyot",
          "en": "Cadence"
        },
        "value": {
          "tr": "Haftalık Düzenli Atölye",
          "en": "Weekly Interactive Sessions"
        }
      },
      {
        "label": {
          "tr": "Format",
          "en": "Format"
        },
        "value": {
          "tr": "Uygulamalı Canlı Kodlama & Atölye",
          "en": "Hands-On Live Coding & Build Labs"
        }
      },
      {
        "label": {
          "tr": "Kapasite",
          "en": "Capacity"
        },
        "value": {
          "tr": "FENS Bilgisayar Laboratuvarı",
          "en": "FENS Computer Laboratory"
        }
      },
      {
        "label": {
          "tr": "Sertifika",
          "en": "Certification"
        },
        "value": {
          "tr": "IEC Doğrulanabilir Dijital Katılım Belgesi",
          "en": "IEC Verifiable Digital Credential"
        }
      }
    ],
    "links": [
      "https://hasankaan28.github.io/ius-engineering-events-site/verify/"
    ],
    "first_step": {
      "tr": "1. Hafta 'Agentic Coding & Cursor 101' müfredatının ve lab rezervasyonunun duyurulması.",
      "en": "Announce Week 1 'Agentic Coding & Cursor 101' curriculum and book FENS computer lab."
    }
  },
  {
    "id": "ius-techsummit-2027",
    "sheet_id": 5,
    "is_flagship": true,
    "featured": true,
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
      "tr": "Yönetim Kurulu & PR / Sponsorluk Ekibi",
      "en": "Executive Board & PR / Sponsorship Team"
    },
    "budget": {
      "tr": "Tahmini 500 KM (Kurumsal Şirket Sponsorlukları Destekli)",
      "en": "Est. 500 KM (Corporate Tech Sponsorships)"
    },
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
      {
        "label": {
          "tr": "Katılım",
          "en": "Attendance"
        },
        "value": {
          "tr": "150+ Delege & Ziyaretçi",
          "en": "150+ Delegates & Campus Visitors"
        }
      },
      {
        "label": {
          "tr": "Konuşmacılar",
          "en": "Speakers"
        },
        "value": {
          "tr": "Bit Alliance & Global Tech Şirketleri",
          "en": "Bit Alliance & Global Tech Executives"
        }
      },
      {
        "label": {
          "tr": "Sergi",
          "en": "Exhibition"
        },
        "value": {
          "tr": "Öğrenci Kulübü Proje Stantları",
          "en": "Student Engineering Hardware Booths"
        }
      },
      {
        "label": {
          "tr": "Kariyer",
          "en": "Career Track"
        },
        "value": {
          "tr": "Doğrudan Staj ve İş Görüşmeleri",
          "en": "Direct On-Site Internship & Job Interviews"
        }
      }
    ],
    "links": [
      "https://hasankaan28.github.io/ius-engineering-events-site/"
    ],
    "first_step": {
      "tr": "Amfi rezervasyonu ve kurumsal ana konuşmacı davet mektuplarının gönderilmesi.",
      "en": "Reserve the main amphitheater and issue formal invitations to keynote industry leaders."
    }
  }
];
