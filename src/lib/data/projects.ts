export interface ProjectItem {
  id: string;
  slug: string;
  isFlagship: boolean;
  isFeatured: boolean;
  category: {
    tr: string;
    en: string;
  };
  badge: {
    tr: string;
    en: string;
  };
  title: {
    tr: string;
    en: string;
  };
  tagline: {
    tr: string;
    en: string;
  };
  author: string;
  ownership: {
    tr: string;
    en: string;
  };
  budget: {
    tr: string;
    en: string;
  };
  difficulty: number;
  image: string;
  problem: {
    tr: string;
    en: string;
  };
  solution: {
    tr: string;
    en: string;
  };
  specs: Array<{
    label: { tr: string; en: string };
    value: { tr: string; en: string };
  }>;
  accentColor: string;
}

export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: "powerbank-station",
    slug: "powerbank-station",
    isFlagship: true,
    isFeatured: true,
    category: {
      tr: "Donanım & IoT Kampüs İnovasyonu",
      en: "Hardware & IoT Campus Innovation",
    },
    badge: {
      tr: "Öğrenci Projesi",
      en: "Student Initiative",
    },
    title: {
      tr: "IUS PowerHub (Akıllı Powerbank İstasyonu)",
      en: "IUS PowerHub (Smart Campus Powerbank Station)",
    },
    tagline: {
      tr: "Öğrenci kartı (RFID) ile tek dokunuşta taşınabilir kampüs enerjisi.",
      en: "One-tap portable energy powered by IUS Student RFID IDs.",
    },
    author: "Hasan Kaan Karabulut (Başkan)",
    ownership: {
      tr: "Hasan Kaan Karabulut (Proje Lideri & Donanım)",
      en: "Hasan Kaan Karabulut (Project Lead & Hardware)",
    },
    budget: {
      tr: "Tahmini 400+ KM (Şirket Sponsorluğu Destekli)",
      en: "Est. 400+ KM (Corporate Sponsorship Required)",
    },
    difficulty: 5,
    image: "/assets/projects/powerbank_station_hero.jpg",
    problem: {
      tr: "Amfilerde, kütüphanede ve kafeteryada priz yetersizliği sebebiyle öğrencilerin ders aralarında cihazlarının şarjsız kalması ve priz arama karmaşası.",
      en: "Shortage of accessible wall outlets across lecture halls, the library, and cafeterias leads to depleted student devices and disrupted study sessions.",
    },
    solution: {
      tr: "Öğrencilerin IUS kartını okutarak otomatik şarj olan powerbank alabileceği, her blokta giriş katına yerleştirilecek 3 adet otonom manyetik şarj istasyonu.",
      en: "Students tap their university RFID card to instantly release the fullest powerbank from smart magnetic charging docks deployed across campus building lobbies.",
    },
    specs: [
      {
        label: { tr: "Mimari", en: "Architecture" },
        value: { tr: "ESP32 / Raspberry Pi IoT Gateway", en: "ESP32 / Raspberry Pi IoT Gateway" },
      },
      {
        label: { tr: "Protokol", en: "Protocol" },
        value: { tr: "MQTT & WebSocket Telemetry", en: "MQTT & WebSocket Telemetry" },
      },
      {
        label: { tr: "Kart Okuyucu", en: "RFID Module" },
        value: { tr: "MFRC522 13.56MHz SPI", en: "MFRC522 13.56MHz SPI" },
      },
    ],
    accentColor: "#06b6d4",
  },
  {
    id: "dining-menu-system",
    slug: "dining-menu-system",
    isFlagship: false,
    isFeatured: true,
    category: {
      tr: "Yazılım & Kampüs Servisi",
      en: "Software & Campus Service",
    },
    badge: {
      tr: "Açık Kaynak",
      en: "Open Source",
    },
    title: {
      tr: "IUS Dining App (Yemekhane Menü & Geri Bildirim)",
      en: "IUS Dining App (Cafeteria Menu & Feedback Hub)",
    },
    tagline: {
      tr: "Günlük yemekhane menüsü, kalori takibi ve anlık öğrenci geri bildirim platformu.",
      en: "Daily cafeteria menu, nutrition tracking, and real-time student dining satisfaction ratings.",
    },
    author: "Mahmut İhsan Avcı (Başkan Yrd.)",
    ownership: {
      tr: "Mahmut İhsan Avcı & Yazılım Komitesi",
      en: "Mahmut İhsan Avcı & Software Committee",
    },
    budget: {
      tr: "0 KM (Kulüp Açık Kaynak Geliştirmesi)",
      en: "0 KM (In-house Open Source)",
    },
    difficulty: 2,
    image: "/assets/projects/dining_app_hero.jpg",
    problem: {
      tr: "Yemekhane menüsünün öğrencilere düzenli ulaşmaması, yemek kalitesi hakkında anlık geri bildirim mekanizmasının eksikliği.",
      en: "Students frequently lack clear visibility into daily cafeteria lunch items and have no direct channel to submit meal feedback.",
    },
    solution: {
      tr: "Web ve mobil uyumlu PWA uygulaması ile haftalık menü gösterimi, alerjen filtreleme ve yemekhane yönetimine anonim puanlama kanalı.",
      en: "A lightweight responsive PWA showing weekly menus, nutritional values, and verified student rating dashboards.",
    },
    specs: [
      {
        label: { tr: "Teknoloji Yığını", en: "Stack" },
        value: { tr: "Next.js + Supabase + Tailwind CSS", en: "Next.js + Supabase + Tailwind CSS" },
      },
      {
        label: { tr: "Dağıtım", en: "Distribution" },
        value: { tr: "Progressive Web App (PWA)", en: "Progressive Web App (PWA)" },
      },
    ],
    accentColor: "#10b981",
  },
  {
    id: "devhack-2027",
    slug: "devhack-2027",
    isFlagship: true,
    isFeatured: true,
    category: {
      tr: "Amiral Gemisi Hackathon",
      en: "Flagship Hackathon",
    },
    badge: {
      tr: "24 Saatlik Maraton",
      en: "24-Hour Marathon",
    },
    title: {
      tr: "DevHack 2027 (IUS 24 Saatlik Mühendislik Hackathonu)",
      en: "DevHack 2027 (IUS 24-Hour Engineering Hackathon)",
    },
    tagline: {
      tr: "Saraybosna genelinde üniversite öğrencilerini buluşturan 24 saatlik kodlama maratonu.",
      en: "Sarajevo-wide 24-hour sprint uniting computer science, electrical, and mechanical students.",
    },
    author: "Yönetim Kurulu Ortak Girişimi",
    ownership: {
      tr: "Etkinlik & Operasyon Komitesi",
      en: "Operations & Events Committee",
    },
    budget: {
      tr: "700 KM (Tier 1 Şirket Sponsorlukları Destekli)",
      en: "700 KM (Tier 1 Corporate Sponsorship Supported)",
    },
    difficulty: 4,
    image: "/assets/projects/hackathon_event_hero.jpg",
    problem: {
      tr: "Mühendislik öğrencilerinin teorik dersler haricinde endüstri standardı gerçek sorunlara multidisipliner takımlarla çözüm üretme pratiğinin az olması.",
      en: "Engineering students need intense collaborative opportunities to transform theoretical classroom knowledge into production prototypes.",
    },
    solution: {
      tr: "FENS laboratuvarlarında gerçekleşecek, mentorluk seansları, sponsor jüri üyeleri ve canlı sunumlarla desteklenen 24 saatlik hackathon.",
      en: "An intensive on-campus weekend hackathon featuring industry mentors, corporate problem statements, and real-time project judging.",
    },
    specs: [
      {
        label: { tr: "Format", en: "Format" },
        value: { tr: "24 Saat Kesintisiz Maraton", en: "24-Hour Non-stop Sprint" },
      },
      {
        label: { tr: "Kapasite", en: "Capacity" },
        value: { tr: "60 Katılımcı (15 Takım)", en: "60 Participants (15 Teams)" },
      },
    ],
    accentColor: "#f59e0b",
  },
  {
    id: "ai-prompt-labs",
    slug: "ai-prompt-labs",
    isFlagship: false,
    isFeatured: true,
    category: {
      tr: "Yapay Zekâ & Makine Öğrenimi",
      en: "Artificial Intelligence & ML",
    },
    badge: {
      tr: "Haftalık Atölye",
      en: "Weekly Workshop",
    },
    title: {
      tr: "AI Prompt & Evaluation Labs (Uygulamalı LLM İstasyonu)",
      en: "AI Prompt & Evaluation Labs (Hands-on LLM Lab)",
    },
    tagline: {
      tr: "Modern büyük dil modelleri ve yerel AI ajanları ile uygulamalı haftalık atölye dizisi.",
      en: "Weekly hands-on laboratory sessions exploring LLM orchestration, evaluation pipelines, and local AI agent tooling.",
    },
    author: "Yazılım & AI Komitesi",
    ownership: {
      tr: "Yazılım Komitesi & AI Çalışma Grubu",
      en: "Software & AI Committee",
    },
    budget: {
      tr: "100 KM (Materyal & Sunucu Giderleri)",
      en: "100 KM (Compute & Material Grants)",
    },
    difficulty: 3,
    image: "/assets/projects/ai_lab_hero.jpg",
    problem: {
      tr: "Yapay zekâ araçlarının öğrenciler tarafından yalnızca yüzeysel kullanılması; prompt mühendisliği ve LLM mimarisinin derinlemesine bilinmemesi.",
      en: "Students often use generative AI superficially without understanding orchestration, token dynamics, or local deployment pipelines.",
    },
    solution: {
      tr: "Haftalık kodlama laboratuvarları: RAG mimarileri, Ollama ile yerel model optimizasyonu ve üretim ortamı AI pipeline geliştirme.",
      en: "Weekly hands-on coding labs covering retrieval augmented generation (RAG), local model deployment, and production agent frameworks.",
    },
    specs: [
      {
        label: { tr: "Altyapı", en: "Infrastructure" },
        value: { tr: "PyTorch / Ollama / Next.js", en: "PyTorch / Ollama / Next.js" },
      },
      {
        label: { tr: "Format", en: "Frequency" },
        value: { tr: "Haftalık 2 Saatlik Laboratuvar", en: "Weekly 2-Hour Practical Lab" },
      },
    ],
    accentColor: "#8b5cf6",
  },
  {
    id: "ius-techsummit-2027",
    slug: "ius-techsummit-2027",
    isFlagship: true,
    isFeatured: true,
    category: {
      tr: "Konferans & Kariyer Zirvesi",
      en: "Conference & Career Summit",
    },
    badge: {
      tr: "Yıllık Zirve",
      en: "Annual Summit",
    },
    title: {
      tr: "IUS Engineering Summit 2027 (Kariyer & Teknoloji Zirvesi)",
      en: "IUS Engineering Summit 2027 (Career & Tech Summit)",
    },
    tagline: {
      tr: "Saraybosna teknoloji ekosistemi ve uluslararası mühendislik liderlerini IUS kampüsünde buluşturan zirve.",
      en: "Flagship annual conference bringing tech leaders and Bosnian engineering innovators to the IUS Amphitheater.",
    },
    author: "PR & Dış İlişkiler",
    ownership: {
      tr: "PR & Sponsorluk Masası (Muhammed Efe Ural)",
      en: "PR & Sponsorship Desk",
    },
    budget: {
      tr: "500 KM (Şirket Stant & Sponsorluk Geliri)",
      en: "500 KM (Corporate Booths & Sponsorships)",
    },
    difficulty: 4,
    image: "/assets/projects/engineering_summit_hero.jpg",
    problem: {
      tr: "Öğrencilerin Saraybosna ve bölgesel IT/Mühendislik firmalarıyla doğrudan staj ve kariyer iletişimi kurabilme fırsatlarının sınırlı olması.",
      en: "Engineering students face networking friction connecting with top software, automotive, and automation employers in Bosnia.",
    },
    solution: {
      tr: "IUS Büyük Amfide düzenlenecek panel oturumları, şirket fuar stantları, CV inceleme masaları ve teknik keynote sunumları.",
      en: "A high-profile annual summit hosted in the main amphitheater featuring corporate booths, technical keynotes, and speed interviewing.",
    },
    specs: [
      {
        label: { tr: "Lokasyon", en: "Location" },
        value: { tr: "IUS Büyük Amfi & B-Blok Fuaye", en: "IUS Main Amphitheater & Foyer" },
      },
      {
        label: { tr: "Hedef Kitle", en: "Audience" },
        value: { tr: "250+ Mühendislik Öğrencisi", en: "250+ Engineering Students" },
      },
    ],
    accentColor: "#ec4899",
  },
];
