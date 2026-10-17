export interface ProjectItem {
  id: string;
  slug: string;
  isFlagship: boolean;
  isFeatured: boolean;
  category: {
    tr: string;
    en: string;
    bs: string;
  };
  badge: {
    tr: string;
    en: string;
    bs: string;
  };
  title: {
    tr: string;
    en: string;
    bs: string;
  };
  tagline: {
    tr: string;
    en: string;
    bs: string;
  };
  author: string;
  ownership: {
    tr: string;
    en: string;
    bs: string;
  };
  difficulty: number;
  image: string;
  /** Photos shown in the gallery, first one is the cover. */
  gallery: string[];
  problem: {
    tr: string;
    en: string;
    bs: string;
  };
  solution: {
    tr: string;
    en: string;
    bs: string;
  };
  specs: Array<{
    label: { tr: string; en: string; bs: string };
    value: { tr: string; en: string; bs: string };
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
      bs: "Hardver & IoT",
    },
    badge: {
      tr: "Öğrenci Projesi",
      en: "Student Project",
      bs: "Studentski projekat",
    },
    title: {
      tr: "IUS PowerHub (Akıllı Powerbank İstasyonu)",
      en: "IUS PowerHub (Smart Powerbank Station)",
      bs: "IUS PowerHub (Pametna stanica za powerbankove)",
    },
    tagline: {
      tr: "Öğrenci kartını okutunca şarjlı powerbank veren istasyon.",
      en: "A station that hands out a charged powerbank when you tap your student card.",
      bs: "Stanica koja ti izda napunjen powerbank kad prisloniš studentsku karticu.",
    },
    author: "Hasan Kaan Karabulut (Başkan Yrd.)",
    ownership: {
      tr: "Hasan Kaan Karabulut (Proje Lideri & Donanım)",
      en: "Hasan Kaan Karabulut (Project Lead & Hardware)",
      bs: "Hasan Kaan Karabulut (Voditelj projekta & hardver)",
    },
    difficulty: 5,
    image: "/assets/projects/powerbank-station/1.jpg",
    gallery: [
      "/assets/projects/powerbank-station/1.jpg",
      "/assets/projects/powerbank-station/2.jpg",
      "/assets/projects/powerbank-station/3.jpg",
    ],
    problem: {
      tr: "Amfilerde, kütüphanede ve kafeteryada priz az olduğu için öğrencilerin cihazları ders aralarında şarjsız kalıyor.",
      en: "Lecture halls, the library and the cafeteria have few outlets, so student devices run out of charge between classes.",
      bs: "U amfiteatrima, biblioteci i kafeteriji ima malo utičnica, pa se studentima uređaji isprazne između predavanja.",
    },
    solution: {
      tr: "Binaların giriş katlarına 3 şarj istasyonu yerleştirilecek. Öğrenci IUS kartını okutunca istasyon şarjlı bir powerbank verir.",
      en: "Three charging stations will go on the ground floors of campus buildings. A student taps their IUS card and the station releases a charged powerbank.",
      bs: "Tri stanice za punjenje bit će postavljene u prizemljima zgrada kampusa. Student prisloni svoju IUS karticu i stanica izda napunjen powerbank.",
    },
    specs: [
      {
        label: { tr: "Mimari", en: "Architecture", bs: "Arhitektura" },
        value: {
          tr: "ESP32 / Raspberry Pi IoT Gateway",
          en: "ESP32 / Raspberry Pi IoT Gateway",
          bs: "ESP32 / Raspberry Pi IoT Gateway",
        },
      },
      {
        label: { tr: "Protokol", en: "Protocol", bs: "Protokol" },
        value: { tr: "MQTT & WebSocket", en: "MQTT & WebSocket", bs: "MQTT & WebSocket" },
      },
      {
        label: { tr: "Kart Okuyucu", en: "RFID Module", bs: "Čitač kartica" },
        value: { tr: "MFRC522 13.56MHz SPI", en: "MFRC522 13.56MHz SPI", bs: "MFRC522 13.56MHz SPI" },
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
      bs: "Softver & usluga za kampus",
    },
    badge: {
      tr: "Açık Kaynak",
      en: "Open Source",
      bs: "Otvoreni kod",
    },
    title: {
      tr: "IUS Dining App (Yemekhane Menü & Geri Bildirim)",
      en: "IUS Dining App (Cafeteria Menu & Feedback)",
      bs: "IUS Dining App (Jelovnik menze & povratne informacije)",
    },
    tagline: {
      tr: "Günlük yemekhane menüsü, kalori bilgisi ve öğrenci geri bildirimi tek uygulamada.",
      en: "The daily cafeteria menu, calorie information and student feedback in one app.",
      bs: "Dnevni jelovnik menze, kalorijske vrijednosti i povratne informacije studenata u jednoj aplikaciji.",
    },
    author: "Mahmut İhsan Avcı (Asistan)",
    ownership: {
      tr: "Mahmut İhsan Avcı & Yazılım Komitesi",
      en: "Mahmut İhsan Avcı & Software Committee",
      bs: "Mahmut İhsan Avcı & Softverski odbor",
    },
    difficulty: 2,
    image: "/assets/projects/dining-menu-system/1.jpg",
    gallery: [
      "/assets/projects/dining-menu-system/1.jpg",
      "/assets/projects/dining-menu-system/2.jpg",
      "/assets/projects/dining-menu-system/3.jpg",
    ],
    problem: {
      tr: "Yemekhane menüsü öğrencilere düzenli ulaşmıyor ve yemekler hakkında geri bildirim verecek bir kanal yok.",
      en: "Students rarely see the cafeteria menu in advance and have no way to give feedback on the meals.",
      bs: "Studenti rijetko unaprijed vide jelovnik menze i nemaju kako dati povratnu informaciju o obrocima.",
    },
    solution: {
      tr: "Haftalık menüyü gösteren, alerjen filtresi olan ve yemekhane yönetimine anonim puan gönderen bir web uygulaması (PWA).",
      en: "A web app (PWA) that shows the weekly menu, filters allergens and sends anonymous ratings to the cafeteria management.",
      bs: "Web aplikacija (PWA) koja prikazuje sedmični jelovnik, filtrira alergene i šalje anonimne ocjene upravi menze.",
    },
    specs: [
      {
        label: { tr: "Teknoloji Yığını", en: "Stack", bs: "Tehnologije" },
        value: {
          tr: "Next.js + Supabase + Tailwind CSS",
          en: "Next.js + Supabase + Tailwind CSS",
          bs: "Next.js + Supabase + Tailwind CSS",
        },
      },
      {
        label: { tr: "Dağıtım", en: "Distribution", bs: "Distribucija" },
        value: {
          tr: "Progressive Web App (PWA)",
          en: "Progressive Web App (PWA)",
          bs: "Progressive Web App (PWA)",
        },
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
      bs: "Hackathon",
    },
    badge: {
      tr: "24 Saatlik Hackathon",
      en: "24-Hour Hackathon",
      bs: "24-satni hackathon",
    },
    title: {
      tr: "DevHack 2027 (IUS 24 Saatlik Mühendislik Hackathonu)",
      en: "DevHack 2027 (IUS 24-Hour Engineering Hackathon)",
      bs: "DevHack 2027 (IUS 24-satni inženjerski hackathon)",
    },
    tagline: {
      tr: "Saraybosna'daki üniversite öğrencilerini bir araya getirecek 24 saatlik hackathon.",
      en: "A 24-hour hackathon for university students from across Sarajevo.",
      bs: "24-satni hackathon koji će okupiti studente univerziteta iz cijelog Sarajeva.",
    },
    author: "Yönetim Kurulu",
    ownership: {
      tr: "Etkinlik & Operasyon Komitesi",
      en: "Events & Operations Committee",
      bs: "Odbor za događaje & operativu",
    },
    difficulty: 4,
    image: "/assets/projects/devhack-2027/1.jpg",
    gallery: [
      "/assets/projects/devhack-2027/1.jpg",
      "/assets/projects/devhack-2027/2.jpg",
      "/assets/projects/devhack-2027/3.jpg",
    ],
    problem: {
      tr: "Mühendislik öğrencileri ders dışında, farklı bölümlerden kişilerle gerçek problemler üzerinde çalışma fırsatını az buluyor.",
      en: "Outside class, engineering students rarely get to work on real problems with people from other departments.",
      bs: "Izvan nastave studenti inženjerstva rijetko imaju priliku raditi na stvarnim problemima s ljudima s drugih odsjeka.",
    },
    solution: {
      tr: "FENS laboratuvarlarında mentorların, sponsor jürisinin ve canlı sunumların olacağı 24 saatlik bir hackathon.",
      en: "A 24-hour hackathon in the FENS labs with mentors, a sponsor jury and live demos.",
      bs: "24-satni hackathon u FENS laboratorijama, s mentorima, žirijem sponzora i prezentacijama uživo.",
    },
    specs: [
      {
        label: { tr: "Format", en: "Format", bs: "Format" },
        value: { tr: "24 saat", en: "24 hours", bs: "24 sata" },
      },
      {
        label: { tr: "Kapasite", en: "Capacity", bs: "Kapacitet" },
        value: {
          tr: "60 Katılımcı (15 Takım)",
          en: "60 Participants (15 Teams)",
          bs: "60 učesnika (15 timova)",
        },
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
      bs: "Vještačka inteligencija & mašinsko učenje",
    },
    badge: {
      tr: "Haftalık Atölye",
      en: "Weekly Workshop",
      bs: "Sedmična radionica",
    },
    title: {
      tr: "AI Prompt & Evaluation Labs (Uygulamalı LLM Atölyesi)",
      en: "AI Prompt & Evaluation Labs (Hands-on LLM Workshop)",
      bs: "AI Prompt & Evaluation Labs (Praktična radionica o LLM-ovima)",
    },
    tagline: {
      tr: "Büyük dil modelleri ve yapay zekâ ajanları üzerine haftalık uygulamalı atölye.",
      en: "A weekly hands-on workshop on large language models and AI agents.",
      bs: "Sedmična praktična radionica o velikim jezičkim modelima i AI agentima.",
    },
    author: "Yazılım & AI Komitesi",
    ownership: {
      tr: "Yazılım & AI Komitesi",
      en: "Software & AI Committee",
      bs: "Odbor za softver & AI",
    },
    difficulty: 3,
    image: "/assets/projects/ai-prompt-labs/1.jpg",
    gallery: [
      "/assets/projects/ai-prompt-labs/1.jpg",
      "/assets/projects/ai-prompt-labs/2.jpg",
      "/assets/projects/ai-prompt-labs/3.jpg",
    ],
    problem: {
      tr: "Öğrencilerin çoğu yapay zekâ araçlarını kullanıyor ama dil modellerinin nasıl çalıştığını ve nasıl değerlendirileceğini bilmiyor.",
      en: "Most students use AI tools without knowing how language models work or how to evaluate them.",
      bs: "Većina studenata koristi AI alate, a ne zna kako jezički modeli rade niti kako ih ocijeniti.",
    },
    solution: {
      tr: "RAG, yerel modelleri çalıştırma ve yapay zekâ uygulamalarını yayına alma üzerine haftalık kodlama atölyeleri.",
      en: "Weekly coding workshops on RAG, running local models and deploying AI applications.",
      bs: "Sedmične radionice programiranja o RAG-u, pokretanju lokalnih modela i puštanju AI aplikacija u rad.",
    },
    specs: [
      {
        label: { tr: "Altyapı", en: "Infrastructure", bs: "Infrastruktura" },
        value: {
          tr: "PyTorch / Ollama / Next.js",
          en: "PyTorch / Ollama / Next.js",
          bs: "PyTorch / Ollama / Next.js",
        },
      },
      {
        label: { tr: "Sıklık", en: "Frequency", bs: "Učestalost" },
        value: { tr: "Haftada 2 saat", en: "2 hours per week", bs: "2 sata sedmično" },
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
      bs: "Konferencija & samit karijera",
    },
    badge: {
      tr: "Yıllık Zirve",
      en: "Annual Summit",
      bs: "Godišnji samit",
    },
    title: {
      tr: "IUS Engineering Summit 2027 (Kariyer & Teknoloji Zirvesi)",
      en: "IUS Engineering Summit 2027 (Career & Tech Summit)",
      bs: "IUS Engineering Summit 2027 (Samit karijere & tehnologije)",
    },
    tagline: {
      tr: "Saraybosna'daki teknoloji şirketlerini ve mühendisleri IUS öğrencileriyle buluşturacak yıllık zirve.",
      en: "An annual summit where Sarajevo tech companies and engineers meet IUS students.",
      bs: "Godišnji samit na kojem se tehnološke kompanije i inženjeri iz Sarajeva susreću sa studentima IUS-a.",
    },
    author: "PR & Dış İlişkiler",
    ownership: {
      tr: "PR & Sponsorluk (Muhammed Efe Ural)",
      en: "PR & Sponsorship (Muhammed Efe Ural)",
      bs: "PR & sponzorstva (Muhammed Efe Ural)",
    },
    difficulty: 4,
    image: "/assets/projects/ius-techsummit-2027/1.jpg",
    gallery: [
      "/assets/projects/ius-techsummit-2027/1.jpg",
      "/assets/projects/ius-techsummit-2027/2.jpg",
      "/assets/projects/ius-techsummit-2027/3.jpg",
    ],
    problem: {
      tr: "Öğrencilerin Saraybosna'daki yazılım ve mühendislik şirketleriyle staj ve iş için doğrudan tanışma fırsatı az.",
      en: "Students have few direct ways to meet Sarajevo software and engineering companies about internships and jobs.",
      bs: "Studenti imaju malo prilika da se direktno upoznaju sa softverskim i inženjerskim kompanijama u Sarajevu radi prakse i posla.",
    },
    solution: {
      tr: "IUS Büyük Amfi'de paneller, şirket stantları, CV inceleme masaları ve teknik konuşmalar.",
      en: "Panels, company booths, CV review desks and technical talks in the IUS main amphitheater.",
      bs: "Paneli, štandovi kompanija, stolovi za pregled CV-ja i tehnička predavanja u velikom amfiteatru IUS-a.",
    },
    specs: [
      {
        label: { tr: "Yer", en: "Location", bs: "Lokacija" },
        value: {
          tr: "IUS Büyük Amfi & B-Blok Fuaye",
          en: "IUS Main Amphitheater & B-Block Foyer",
          bs: "Veliki amfiteatar IUS-a & foaje B-bloka",
        },
      },
      {
        label: { tr: "Hedef Kitle", en: "Audience", bs: "Ciljna publika" },
        value: {
          tr: "250+ Mühendislik Öğrencisi",
          en: "250+ Engineering Students",
          bs: "250+ studenata inženjerstva",
        },
      },
    ],
    accentColor: "#ec4899",
  },
];
