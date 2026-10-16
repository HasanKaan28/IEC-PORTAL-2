export type SupportedLocale = "tr" | "en";

const tr = {
  common: {
    appName: "IUS Engineering Club",
    shortName: "IEC",
    portalName: "IEC Üye Portalı",
    tagline: "Saraybosna'da Geleceğin Mühendisliğini İnşa Ediyoruz",
    login: "Giriş Yap",
    register: "Kayıt Ol",
    logout: "Çıkış Yap",
    apply: "Kulübe Başvur",
    portalButton: "Portala Gir",
    searchPlaceholder: "Ara...",
    loading: "Yükleniyor...",
    save: "Kaydet",
    cancel: "İptal",
    status: "Durum",
    viewAll: "Tümünü Gör",
    readMore: "Devamını Oku",
    close: "Kapat",
    skipToContent: "İçeriğe Atla",
    languageSwitcher: "Dil seçici",
  },
  nav: {
    home: "Ana Sayfa",
    projects: "Projelerimiz",
    blog: "Blog & Teknik Yazılar",
    about: "Hakkımızda",
    apply: "Başvuru Yap",
    portal: "Üye Portalı",
    verify: "Sertifika Doğrula",
    openMenu: "Menüyü aç",
    closeMenu: "Menüyü kapat",
    mainNavigation: "Ana menü",
  },
  portalNav: {
    dashboard: "Genel Bakış",
    myTasks: "Görevlerim",
    assignTask: "Görev Ata",
    projects: "Projeler",
    hackathons: "Hackathonlar & Takımlar",
    events: "Etkinlikler",
    myCertificates: "Sertifikalarım",
    messages: "Mesajlaşma",
    notifications: "Bildirimler",
    profile: "Profilim",
    admin: "Yönetim Paneli",
  },
  roles: {
    super_admin: "Süper Yönetici",
    admin: "Yönetici",
    leader: "Kulüp Lideri",
    project_lead: "Proje Lideri",
    task_manager: "Görev Yöneticisi",
    blog_author: "Blog Yazarı",
    member: "Kulüp Üyesi",
  },
  hero: {
    eyebrow: "Uluslararası Saraybosna Üniversitesi · FENS",
    titleStart: "Mühendislik Teorisini",
    titleHighlight: "Kampüs İnovasyonuna",
    titleEnd: "Dönüştürüyoruz.",
    description:
      "Amfilerdeki teorik bilgiyi gerçek donanım prototiplerine, yapay zekâ modellerine ve amiral gemisi öğrenci hackathonlarına taşıyan IUS Mühendislik Topluluğu.",
    primaryCta: "Projelerimizi Keşfet",
    imageAlt: "Hackathon masasında kod ve robot prototipi üzerinde birlikte çalışan öğrenciler",
    imageCaption: "IUS DevHack konsept görseli",
  },
  metrics: {
    label: "Kulüp özeti",
    projects: "Aktif kampüs projesi",
    founders: "Kurucu üye",
    pillars: "Temel çalışma alanı",
    advisor: "Akademik danışman",
  },
  projects: {
    title: "Amiral Gemisi Projelerimiz",
    description:
      "FENS amfilerinden teknoloji ekosistemine uzanan donanım, yapay zekâ ve yazılım inovasyonlarımız.",
    filterLabel: "Projeleri kategoriye göre filtrele",
    categoryAll: "Tüm İnovasyonlar",
    categoryHardware: "Donanım & IoT",
    categorySoftware: "Yazılım & Web",
    categoryHackathon: "Hackathon & Etkinlik",
    categoryAi: "Yapay Zekâ",
    flagship: "Amiral Gemisi",
    viewDetails: "Detayları Gör",
    viewAll: "Tüm Projeleri ve Teknik Mimarileri İncele",
    empty: "Bu kategoride henüz proje yok.",
    problem: "Karşılaşılan Problem & İhtiyaç",
    solution: "Mühendislik Çözümümüz",
    owner: "Proje Sorumlusu",
    budget: "Finansal Mimari",
    difficulty: "Zorluk Derecesi",
    joinProject: "Bu Projede Görev Al",
  },
  about: {
    titleStart: "Mühendisliği Yalnızca Okumuyor,",
    titleHighlight: "Üretiyoruz.",
    paragraph1:
      "IUS Engineering Club (IEC), Uluslararası Saraybosna Üniversitesi Mühendislik ve Doğa Bilimleri Fakültesi (FENS) öğrencileri tarafından, teorik müfredat ile küresel teknoloji endüstrisi arasındaki boşluğu kapatmak amacıyla kuruldu.",
    paragraph2:
      "Kulübümüz, hiyerarşik pasif üyelik yerine Linear tabanlı modern sprintler, açık kaynaklı kod depoları ve üniversite donanım istasyonları ile her üyesine doğrudan üretim sorumluluğu verir.",
    link: "Tüzük, Yönetim Kurulu ve 12 Haftalık Planı İncele",
    pillars: [
      {
        title: "Multidisipliner Mühendislik",
        description:
          "Bilgisayar (CSE), Yazılım (SE), Elektrik-Elektronik (EE) ve Endüstri (IE) disiplinlerini tek ortak donanım-yazılım prototipleme çemberinde buluşturuyoruz.",
      },
      {
        title: "Yazılım & Yapay Zekâ Komitesi",
        description:
          "Modern bulut mimarileri, büyük dil modelleri (LLMs), RAG pipeline'ları ve production-grade full-stack web standartları üzerine haftalık laboratuvarlar düzenliyoruz.",
      },
      {
        title: "Amiral Gemisi Hackathonlar",
        description:
          "Saraybosna genelindeki üniversiteleri IUS çatısı altında buluşturan 24 saatlik kesintisiz DevHack maratonları ve yıllık teknoloji zirveleri organize ediyoruz.",
      },
      {
        title: "Akademik & Endüstriyel Köprü",
        description:
          "Prof. Dr. Leila Miller danışmanlığında, FENS dekanlığı ve Saraybosna teknoloji ekosistemi (Bit Alliance firmaları) ile doğrudan staj ve mentorluk ağı kuruyoruz.",
      },
    ],
  },
  blog: {
    title: "Öğrencilerimizden Teknik Makaleler",
    description:
      "Kulüp projelerimizdeki mühendislik zorlukları, donanım mimarileri ve yapay zekâ deneyleri.",
    viewAll: "Tüm Makaleleri Gör",
    minutesRead: "dk okuma",
    languageNote: "",
    posts: [
      {
        title: "ESP32 ve RFID ile Otonom Güç İstasyonu Mimarisi",
        excerpt:
          "IUS PowerHub projesinde SPI bus yönetimi, MQTT telemetrisi ve öğrenci kartı yetkilendirme katmanını nasıl tasarladık?",
        author: "Hasan Kaan Karabulut",
        role: "Donanım Lideri",
        category: "Gömülü Sistemler",
      },
      {
        title: "Öğrenci Kulübünü Modern Bir Teknoloji Şirketi Gibi Yönetmek",
        excerpt:
          "WhatsApp kaosundan Linear sprintlerine geçiş: Görev atama, pull request takibi ve şeffaf bütçe mimarisi.",
        author: "Mahmut İhsan Avcı",
        role: "Başkan Yardımcısı",
        category: "Mühendislik Kültürü",
      },
      {
        title: "FENS Laboratuvarlarında Yerel LLM ve RAG Kurulum Rehberi",
        excerpt:
          "RTX GPU'lar üzerinde Qwen 2.5 Coder ve Ollama ile kampüs içi gizli veri analiz istasyonu oluşturma adımları.",
        author: "Yazılım & AI Komitesi",
        role: "Araştırma Grubu",
        category: "Yapay Zekâ",
      },
    ],
  },
  joinCta: {
    badge: "2026/2027 güz dönemi kayıtları açık",
    title: "Geleceğin Mühendislik Ekibinde Yerini Al",
    description:
      "İster yazılım, ister gömülü donanım, ister etkinlik organizasyonu olsun; yeteneğine uygun komitede gerçek projelere imza at.",
  },
  footer: {
    description:
      "International University of Sarajevo (IUS) Mühendislik ve Doğa Bilimleri Fakültesi (FENS) bünyesinde faaliyet gösteren resmi öğrenci mühendislik topluluğu.",
    country: "Bosna-Hersek",
    sourceCode: "Sitenin kaynak kodu (GitHub)",
    whatsapp: "WhatsApp topluluğu",
    explore: "Keşfet",
    membership: "Üyelik Başvurusu",
    certification: "Sertifikasyon",
    verifyCertificate: "Sertifika Doğrula",
    faculty: "FENS Fakültesi",
    advisor: "Danışman: Prof. Dr. Leila Miller",
    legal: "Yasal & Gizlilik",
    kvkk: "KVKK Aydınlatma Metni",
    privacy: "Gizlilik Politikası",
    cookies: "Çerez Politikası",
    legalNote: "* Tüm yasal metinler taslak niteliğindedir; hukuki inceleme gerekir.",
    copyright: "© 2026-2027 IUS Engineering Club (IEC). Tüm hakları saklıdır.",
    builtWith: "Next.js 15, Supabase ve Tailwind ile geliştirildi",
  },
  cookieBanner: {
    regionLabel: "Çerez ve Gizlilik Bildirimi",
    title: "Çerez ve Gizlilik Tercihleri",
    desc: "Platform deneyiminizi geliştirmek, oturum güvenliğini sağlamak ve kulüp faaliyetlerini anonim olarak analiz etmek için çerezler kullanıyoruz.",
    necessaryTitle: "Zorunlu Çerezler",
    necessaryDesc: "Oturum, güvenlik ve KVKK onay kaydı için zorunludur.",
    necessaryStatus: "Aktif",
    analyticsTitle: "Analitik Çerezler",
    analyticsDesc: "Ziyaretçi sayıları ve proje popülerliği anonim ölçülür.",
    preferencesTitle: "Tercih Çerezleri",
    preferencesDesc: "Seçilen arayüz dili (TR/EN) ve tema ayarları saklanır.",
    cookiePolicy: "Çerez Politikası",
    readKvkk: "KVKK Aydınlatma Metni",
    managePreferences: "Özelleştir",
    hidePreferences: "Gizle",
    saveSelection: "Seçimi Kaydet",
    rejectOptional: "Yalnızca Zorunlular",
    acceptAll: "Hepsini Kabul Et",
  },
};

export type Dictionary = typeof tr;

const en: Dictionary = {
  common: {
    appName: "IUS Engineering Club",
    shortName: "IEC",
    portalName: "IEC Member Portal",
    tagline: "Engineering the Future at International University of Sarajevo",
    login: "Sign In",
    register: "Sign Up",
    logout: "Log Out",
    apply: "Apply to the Club",
    portalButton: "Enter Portal",
    searchPlaceholder: "Search...",
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    status: "Status",
    viewAll: "View All",
    readMore: "Read More",
    close: "Close",
    skipToContent: "Skip to content",
    languageSwitcher: "Language",
  },
  nav: {
    home: "Home",
    projects: "Our Projects",
    blog: "Blog & Insights",
    about: "About Us",
    apply: "Apply Now",
    portal: "Member Portal",
    verify: "Verify Certificate",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    mainNavigation: "Main navigation",
  },
  portalNav: {
    dashboard: "Dashboard",
    myTasks: "My Tasks",
    assignTask: "Assign Task",
    projects: "Projects",
    hackathons: "Hackathons & Teams",
    events: "Events",
    myCertificates: "My Certificates",
    messages: "Messages",
    notifications: "Notifications",
    profile: "My Profile",
    admin: "Admin Console",
  },
  roles: {
    super_admin: "Super Admin",
    admin: "Admin",
    leader: "Club Leader",
    project_lead: "Project Lead",
    task_manager: "Task Manager",
    blog_author: "Blog Author",
    member: "Club Member",
  },
  hero: {
    eyebrow: "International University of Sarajevo · FENS",
    titleStart: "We Turn Engineering Theory",
    titleHighlight: "Into Campus Innovation.",
    titleEnd: "",
    description:
      "The IUS engineering community taking classroom theory into real hardware prototypes, AI models and flagship student hackathons.",
    primaryCta: "Explore Our Projects",
    imageAlt: "Students working together on code and a robot prototype at a hackathon table",
    imageCaption: "IUS DevHack concept render",
  },
  metrics: {
    label: "Club at a glance",
    projects: "Active campus projects",
    founders: "Founding members",
    pillars: "Core focus areas",
    advisor: "Faculty advisor",
  },
  projects: {
    title: "Our Flagship Projects",
    description:
      "Hardware, AI and software innovation that starts in FENS lecture halls and reaches the tech ecosystem.",
    filterLabel: "Filter projects by category",
    categoryAll: "All Projects",
    categoryHardware: "Hardware & IoT",
    categorySoftware: "Software & Web",
    categoryHackathon: "Hackathons & Events",
    categoryAi: "Artificial Intelligence",
    flagship: "Flagship",
    viewDetails: "View Details",
    viewAll: "See All Projects and Technical Details",
    empty: "No projects in this category yet.",
    problem: "Problem & Need",
    solution: "Our Engineering Solution",
    owner: "Project Lead",
    budget: "Funding",
    difficulty: "Difficulty",
    joinProject: "Join This Project",
  },
  about: {
    titleStart: "We Don't Just Study Engineering.",
    titleHighlight: "We Build It.",
    paragraph1:
      "IUS Engineering Club (IEC) was founded by students of the Faculty of Engineering and Natural Sciences (FENS) at the International University of Sarajevo to close the gap between the academic curriculum and the global technology industry.",
    paragraph2:
      "Instead of passive, hierarchical membership, the club gives every member direct ownership through Linear-based sprints, open-source repositories and university hardware stations.",
    link: "Read the Constitution, Board and 12-Week Plan",
    pillars: [
      {
        title: "Multidisciplinary Engineering",
        description:
          "We bring Computer (CSE), Software (SE), Electrical and Electronics (EE) and Industrial (IE) engineering together in one shared hardware and software prototyping circle.",
      },
      {
        title: "Software & AI Committee",
        description:
          "We run weekly labs on modern cloud architecture, large language models (LLMs), RAG pipelines and production-grade full-stack web standards.",
      },
      {
        title: "Flagship Hackathons",
        description:
          "We organize 24-hour DevHack marathons and an annual technology summit that bring universities across Sarajevo together at IUS.",
      },
      {
        title: "Academic & Industry Bridge",
        description:
          "Advised by Prof. Dr. Leila Miller, we are building an internship and mentoring network with the FENS dean's office and Sarajevo's tech ecosystem (Bit Alliance companies).",
      },
    ],
  },
  blog: {
    title: "Technical Writing From Our Students",
    description: "Engineering challenges, hardware architectures and AI experiments from our club projects.",
    viewAll: "View All Articles",
    minutesRead: "min read",
    languageNote: "Articles are currently published in Turkish.",
    posts: [
      {
        title: "Building an Autonomous Power Station With ESP32 and RFID",
        excerpt:
          "How we designed SPI bus management, MQTT telemetry and the student ID authorization layer for the IUS PowerHub project.",
        author: "Hasan Kaan Karabulut",
        role: "Hardware Lead",
        category: "Embedded Systems",
      },
      {
        title: "Running a Student Club Like a Modern Tech Company",
        excerpt:
          "Moving from WhatsApp chaos to Linear sprints: task assignment, pull request tracking and a transparent budget.",
        author: "Mahmut İhsan Avcı",
        role: "Vice President",
        category: "Engineering Culture",
      },
      {
        title: "Setting Up a Local LLM and RAG Stack in FENS Labs",
        excerpt:
          "Steps for building a private on-campus data analysis station with Qwen 2.5 Coder and Ollama on RTX GPUs.",
        author: "Software & AI Committee",
        role: "Research Group",
        category: "Artificial Intelligence",
      },
    ],
  },
  joinCta: {
    badge: "Fall 2026/2027 applications are open",
    title: "Take Your Place in Tomorrow's Engineering Team",
    description:
      "Software, embedded hardware or event operations: join the committee that fits your skills and put your name on real projects.",
  },
  footer: {
    description:
      "The official student engineering community of the Faculty of Engineering and Natural Sciences (FENS) at the International University of Sarajevo (IUS).",
    country: "Bosnia and Herzegovina",
    sourceCode: "Website source code (GitHub)",
    whatsapp: "WhatsApp community",
    explore: "Explore",
    membership: "Membership Application",
    certification: "Certification",
    verifyCertificate: "Verify Certificate",
    faculty: "FENS Faculty",
    advisor: "Advisor: Prof. Dr. Leila Miller",
    legal: "Legal & Privacy",
    kvkk: "KVKK Privacy Notice",
    privacy: "Privacy Policy",
    cookies: "Cookie Policy",
    legalNote: "* All legal texts are drafts pending legal review and are currently available in Turkish.",
    copyright: "© 2026-2027 IUS Engineering Club (IEC). All rights reserved.",
    builtWith: "Built with Next.js 15, Supabase and Tailwind",
  },
  cookieBanner: {
    regionLabel: "Cookie and privacy notice",
    title: "Cookie & Privacy Preferences",
    desc: "We use cookies to improve your experience, keep sessions secure and measure club activity anonymously.",
    necessaryTitle: "Essential Cookies",
    necessaryDesc: "Required for sessions, security and recording KVKK consent.",
    necessaryStatus: "Always on",
    analyticsTitle: "Analytics Cookies",
    analyticsDesc: "Visitor counts and project popularity are measured anonymously.",
    preferencesTitle: "Preference Cookies",
    preferencesDesc: "Stores your interface language (TR/EN) and theme settings.",
    cookiePolicy: "Cookie Policy",
    readKvkk: "KVKK Privacy Notice",
    managePreferences: "Customize",
    hidePreferences: "Hide",
    saveSelection: "Save Selection",
    rejectOptional: "Essential Only",
    acceptAll: "Accept All",
  },
};

export const translations: Record<SupportedLocale, Dictionary> = { tr, en };

export function getDictionary(locale: SupportedLocale = "tr"): Dictionary {
  return translations[locale] ?? translations.tr;
}
