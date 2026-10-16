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

// Category filters on the site match the Turkish category labels ("Donanım", "Yazılım",
// "Hackathon"/"Zirve", "Zekâ"), so keep those words when editing categories.
export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: "powerbank-station",
    slug: "powerbank-station",
    isFlagship: true,
    isFeatured: true,
    category: {
      tr: "Donanım & IoT",
      en: "Hardware & IoT",
    },
    badge: {
      tr: "Öğrenci Projesi",
      en: "Student Project",
    },
    title: {
      tr: "IUS PowerHub (Akıllı Powerbank İstasyonu)",
      en: "IUS PowerHub (Smart Powerbank Station)",
    },
    tagline: {
      tr: "Öğrenci kartını okutunca şarjlı powerbank veren istasyon.",
      en: "A station that hands out a charged powerbank when you tap your student card.",
    },
    author: "Hasan Kaan Karabulut (Başkan)",
    ownership: {
      tr: "Hasan Kaan Karabulut (Proje Lideri & Donanım)",
      en: "Hasan Kaan Karabulut (Project Lead & Hardware)",
    },
    difficulty: 5,
    image: "/assets/projects/powerbank_station_hero.jpg",
    problem: {
      tr: "Amfilerde, kütüphanede ve kafeteryada priz az olduğu için öğrencilerin cihazları ders aralarında şarjsız kalıyor.",
      en: "Lecture halls, the library and the cafeteria have few outlets, so student devices run out of charge between classes.",
    },
    solution: {
      tr: "Binaların giriş katlarına 3 şarj istasyonu yerleştirilecek. Öğrenci IUS kartını okutunca istasyon şarjlı bir powerbank verir.",
      en: "Three charging stations will go on the ground floors of campus buildings. A student taps their IUS card and the station releases a charged powerbank.",
    },
    specs: [
      {
        label: { tr: "Mimari", en: "Architecture" },
        value: { tr: "ESP32 / Raspberry Pi IoT Gateway", en: "ESP32 / Raspberry Pi IoT Gateway" },
      },
      {
        label: { tr: "Protokol", en: "Protocol" },
        value: { tr: "MQTT & WebSocket", en: "MQTT & WebSocket" },
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
      en: "IUS Dining App (Cafeteria Menu & Feedback)",
    },
    tagline: {
      tr: "Günlük yemekhane menüsü, kalori bilgisi ve öğrenci geri bildirimi tek uygulamada.",
      en: "The daily cafeteria menu, calorie information and student feedback in one app.",
    },
    author: "Mahmut İhsan Avcı (Başkan Yrd.)",
    ownership: {
      tr: "Mahmut İhsan Avcı & Yazılım Komitesi",
      en: "Mahmut İhsan Avcı & Software Committee",
    },
    difficulty: 2,
    image: "/assets/projects/dining_app_hero.jpg",
    problem: {
      tr: "Yemekhane menüsü öğrencilere düzenli ulaşmıyor ve yemekler hakkında geri bildirim verecek bir kanal yok.",
      en: "Students rarely see the cafeteria menu in advance and have no way to give feedback on the meals.",
    },
    solution: {
      tr: "Haftalık menüyü gösteren, alerjen filtresi olan ve yemekhane yönetimine anonim puan gönderen bir web uygulaması (PWA).",
      en: "A web app (PWA) that shows the weekly menu, filters allergens and sends anonymous ratings to the cafeteria management.",
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
      tr: "Hackathon",
      en: "Hackathon",
    },
    badge: {
      tr: "24 Saatlik Hackathon",
      en: "24-Hour Hackathon",
    },
    title: {
      tr: "DevHack 2027 (IUS 24 Saatlik Mühendislik Hackathonu)",
      en: "DevHack 2027 (IUS 24-Hour Engineering Hackathon)",
    },
    tagline: {
      tr: "Saraybosna'daki üniversite öğrencilerini bir araya getirecek 24 saatlik hackathon.",
      en: "A 24-hour hackathon for university students from across Sarajevo.",
    },
    author: "Yönetim Kurulu",
    ownership: {
      tr: "Etkinlik & Operasyon Komitesi",
      en: "Events & Operations Committee",
    },
    difficulty: 4,
    image: "/assets/projects/hackathon_event_hero.jpg",
    problem: {
      tr: "Mühendislik öğrencileri ders dışında, farklı bölümlerden kişilerle gerçek problemler üzerinde çalışma fırsatını az buluyor.",
      en: "Outside class, engineering students rarely get to work on real problems with people from other departments.",
    },
    solution: {
      tr: "FENS laboratuvarlarında mentorların, sponsor jürisinin ve canlı sunumların olacağı 24 saatlik bir hackathon.",
      en: "A 24-hour hackathon in the FENS labs with mentors, a sponsor jury and live demos.",
    },
    specs: [
      {
        label: { tr: "Format", en: "Format" },
        value: { tr: "24 saat", en: "24 hours" },
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
      en: "AI & Machine Learning",
    },
    badge: {
      tr: "Haftalık Atölye",
      en: "Weekly Workshop",
    },
    title: {
      tr: "AI Prompt & Evaluation Labs (Uygulamalı LLM Atölyesi)",
      en: "AI Prompt & Evaluation Labs (Hands-on LLM Workshop)",
    },
    tagline: {
      tr: "Büyük dil modelleri ve yapay zekâ ajanları üzerine haftalık uygulamalı atölye.",
      en: "A weekly hands-on workshop on large language models and AI agents.",
    },
    author: "Yazılım & AI Komitesi",
    ownership: {
      tr: "Yazılım & AI Komitesi",
      en: "Software & AI Committee",
    },
    difficulty: 3,
    image: "/assets/projects/ai_lab_hero.jpg",
    problem: {
      tr: "Öğrencilerin çoğu yapay zekâ araçlarını kullanıyor ama dil modellerinin nasıl çalıştığını ve nasıl değerlendirileceğini bilmiyor.",
      en: "Most students use AI tools without knowing how language models work or how to evaluate them.",
    },
    solution: {
      tr: "RAG, yerel modelleri çalıştırma ve yapay zekâ uygulamalarını yayına alma üzerine haftalık kodlama atölyeleri.",
      en: "Weekly coding workshops on RAG, running local models and deploying AI applications.",
    },
    specs: [
      {
        label: { tr: "Altyapı", en: "Infrastructure" },
        value: { tr: "PyTorch / Ollama / Next.js", en: "PyTorch / Ollama / Next.js" },
      },
      {
        label: { tr: "Sıklık", en: "Frequency" },
        value: { tr: "Haftada 2 saat", en: "2 hours per week" },
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
      tr: "Saraybosna'daki teknoloji şirketlerini ve mühendisleri IUS öğrencileriyle buluşturacak yıllık zirve.",
      en: "An annual summit where Sarajevo tech companies and engineers meet IUS students.",
    },
    author: "PR & Dış İlişkiler",
    ownership: {
      tr: "PR & Sponsorluk (Muhammed Efe Ural)",
      en: "PR & Sponsorship (Muhammed Efe Ural)",
    },
    difficulty: 4,
    image: "/assets/projects/engineering_summit_hero.jpg",
    problem: {
      tr: "Öğrencilerin Saraybosna'daki yazılım ve mühendislik şirketleriyle staj ve iş için doğrudan tanışma fırsatı az.",
      en: "Students have few direct ways to meet Sarajevo software and engineering companies about internships and jobs.",
    },
    solution: {
      tr: "IUS Büyük Amfi'de paneller, şirket stantları, CV inceleme masaları ve teknik konuşmalar.",
      en: "Panels, company booths, CV review desks and technical talks in the IUS main amphitheater.",
    },
    specs: [
      {
        label: { tr: "Yer", en: "Location" },
        value: { tr: "IUS Büyük Amfi & B-Blok Fuaye", en: "IUS Main Amphitheater & B-Block Foyer" },
      },
      {
        label: { tr: "Hedef Kitle", en: "Audience" },
        value: { tr: "250+ Mühendislik Öğrencisi", en: "250+ Engineering Students" },
      },
    ],
    accentColor: "#ec4899",
  },
];
