/**
 * KVKK notice, privacy policy and cookie policy, per language. The English text is a faithful
 * translation of the Turkish one: same obligations, same facts, same contact details.
 */

/** One run of text inside a paragraph: plain, bold, or inline code. */
export type LegalInline = string | { strong: string } | { code: string };
export type LegalRichText = LegalInline[];

export type LegalIcon = "scale" | "database" | "check" | "lock" | "eye" | "file" | "cookie";

export interface LegalTable {
  caption: string;
  columns: [string, string, string, string];
  rows: [string, string, string, string][];
}

export interface LegalSection {
  id: string;
  icon?: LegalIcon;
  heading: string;
  paragraphs?: LegalRichText[];
  /** Bullet list; a leading `{ strong }` run reads as the item's label. */
  items?: LegalRichText[];
  table?: LegalTable;
}

export interface LegalDocument {
  metaTitle: string;
  metaDescription: string;
  noticeTitle: string;
  notice: LegalRichText;
  title: string;
  versionLine: string;
  sections: LegalSection[];
}

export interface LegalDictionary {
  kvkk: LegalDocument;
  privacy: LegalDocument;
  cookies: LegalDocument;
}

const CONTACT_EMAIL = "iusengclub@gmail.com";

const tr: LegalDictionary = {
  kvkk: {
    metaTitle: "KVKK Aydınlatma Metni",
    metaDescription:
      "IUS Engineering Club faaliyetleri kapsamında işlenen kişisel veriler, hukuki sebepler ve ilgili kişi hakları hakkında aydınlatma metni.",
    noticeTitle: "Hukuki İnceleme Gereklidir (Taslak Aydınlatma Metni)",
    notice: [
      "İşbu KVKK Aydınlatma Metni taslaktır. Kullanıcıların açık rıza ve onay kayıtları veritabanımızdaki ",
      { code: "consent_logs" },
      " tablosunda zaman damgası ve sürüm bilgisiyle saklanmaktadır. Resmi yürürlük öncesinde hukuk birimi onayı alınmalıdır.",
    ],
    title: "KVKK & GDPR Aydınlatma Metni",
    versionLine: "Belge Sürümü: v1.0 • Son Revizyon: Ekim 2026",
    sections: [
      {
        id: "purpose",
        icon: "scale",
        heading: "1. Aydınlatma Metninin Amacı",
        paragraphs: [
          [
            "6698 sayılı Kişisel Verilerin Korunması Kanunu (\"KVKK\") ve Bosna-Hersek Veri Koruma mevzuatı uyarınca, IUS Engineering Club tarafından yürütülen faaliyetler kapsamında elde edilen kişisel verilerinizin işlenme şartları işbu metinle bilgilerinize sunulmaktadır.",
          ],
        ],
      },
      {
        id: "data",
        icon: "database",
        heading: "2. İşlenen Kişisel Veriler ve Hukuki Sebepler",
        paragraphs: [
          [
            "Platforma kayıt esnasında sağlanan kimlik, iletişim, öğrenci numarası ve akademik bölüm bilgileri; kulüp üyeliğinin tesisi, etkinlik organizasyonu ve üniversite mevzuatına uyum amacıyla KVKK m. 5/2-c ve m. 5/2-f bentleri uyarınca işlenmektedir.",
          ],
        ],
      },
      {
        id: "consent",
        icon: "check",
        heading: "3. Onay Kaydı ve Dijital İspat (Consent Logs)",
        paragraphs: [
          [
            "Üyelik veya başvuru formunda işaretlenen KVKK onay kutusu, kullanıcının kullanıcı kimliği (user_id), onaylanan belge sürümü (document_version: \"v1.0\"), IP adresi ve zaman damgası (consented_at) ile birlikte sistem kayıtlarına (",
            { code: "consent_logs" },
            ") kriptografik olarak kaydedilir.",
          ],
        ],
      },
      {
        id: "rights",
        heading: "4. İlgili Kişinin Hakları",
        paragraphs: [
          [
            "Her üye ve ziyaretçi, dilediği zaman kulüp yönetimine başvurarak kişisel verilerinin silinmesini, güncellenmesini veya işlenme durumunu sorgulama hakkına sahiptir. Başvurular doğrudan ",
            { strong: CONTACT_EMAIL },
            " adresine iletilebilir.",
          ],
        ],
      },
    ],
  },
  privacy: {
    metaTitle: "Gizlilik Politikası",
    metaDescription:
      "IUS Engineering Club web sitesi ve üye portalında kişisel verilerin nasıl toplandığı, işlendiği ve korunduğu.",
    noticeTitle: "Hukuki İnceleme Gereklidir (Taslak Belge)",
    notice: [
      "Bu Gizlilik Politikası metni, IUS Engineering Club (IEC) platformunun teknik altyapısını açıklamak üzere hazırlanmış taslak bir yer tutucudur. Resmi yürürlüğe girmeden önce üniversite hukuk danışmanlığı incelemesi gerekmektedir.",
    ],
    title: "Gizlilik Politikası",
    versionLine: "Son Güncelleme: 15 Ekim 2026 • Sürüm: v1.0-draft",
    sections: [
      {
        id: "controller",
        icon: "lock",
        heading: "1. Veri Sorumlusu ve Kapsam",
        paragraphs: [
          [
            "International University of Sarajevo (IUS) bünyesinde faaliyet gösteren IUS Engineering Club (\"IEC\" veya \"Kulüp\"), web sitesi ve üye portalı kullanıcılarının gizliliğine saygı duyar. Bu metin, platformumuzu ziyaret eden veya üye olan öğrencilerin kişisel verilerinin nasıl toplandığını, işlendiğini ve korunduğunu açıklar.",
          ],
        ],
      },
      {
        id: "collected",
        icon: "eye",
        heading: "2. Toplanan Kişisel Veriler",
        items: [
          [{ strong: "Kimlik ve İletişim:" }, " Ad, soyad, öğrenci e-postası (@student.ius.edu.ba), telefon numarası."],
          [{ strong: "Akademik Bilgiler:" }, " Fakülte, bölüm, sınıf seviyesi ve teknik ilgi alanları."],
          [{ strong: "Etkinlik ve Katılım:" }, " QR kod ile alınan yoklama kayıtları, düzenlenen katılım sertifikaları."],
          [{ strong: "Teknik Veriler:" }, " IP adresi, tarayıcı türü, çerez tercihleri ve platform içi denetim (audit) ve güvenlik kayıtları."],
        ],
      },
      {
        id: "purposes",
        icon: "file",
        heading: "3. Verilerin İşlenme Amaçları ve Paylaşım",
        paragraphs: [
          [
            "Toplanan veriler yalnızca kulüp içi faaliyetlerin yürütülmesi, proje takımlarının oluşturulması, hackathon başvurularının değerlendirilmesi ve sertifika doğrulaması amacıyla işlenir. Kişisel verileriniz hiçbir üçüncü taraf reklam veya pazarlama şirketine satılmaz veya devredilmez.",
          ],
        ],
      },
      {
        id: "security",
        heading: "4. Veri Güvenliği ve RLS Koruması",
        paragraphs: [
          [
            "Tüm veriler, PostgreSQL Row Level Security (RLS) politikaları ile veritabanı seviyesinde korunmakta olup, üye ve yönetim rolleri katı bir RBAC (Rol Tabanlı Erişim Kontrolü) modeliyle sınırlandırılmıştır.",
          ],
        ],
      },
    ],
  },
  cookies: {
    metaTitle: "Çerez Politikası",
    metaDescription:
      "IUS Engineering Club web platformunda kullanılan çerezler, kullanım amaçları, süreleri ve tercihlerinizi nasıl değiştirebileceğiniz.",
    noticeTitle: "Hukuki İnceleme Gereklidir (Taslak Çerez Politikası)",
    notice: [
      "Platformumuzda kullanılan çerezler şeffaf olarak aşağıda sınıflandırılmıştır. Kullanıcılarımız istedikleri an çerez banner'ı üzerinden analitik çerezleri devre dışı bırakabilirler.",
    ],
    title: "Çerez Politikası",
    versionLine: "Sürüm: v1.0 • IUS Engineering Club Web Platformu",
    sections: [
      {
        id: "what",
        icon: "cookie",
        heading: "1. Çerez (Cookie) Nedir?",
        paragraphs: [
          [
            "Çerezler, bir web sitesini ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza kaydedilen küçük metin dosyalarıdır. Platformumuzda çerezler, oturum sürekliliğini sağlamak, güvenlik açıklarını engellemek ve kullanıcı tercihlerini hatırlamak için kullanılmaktadır.",
          ],
        ],
      },
      {
        id: "list",
        heading: "2. Platformumuzda Kullanılan Çerezler",
        table: {
          caption: "Platformumuzda kullanılan çerezler",
          columns: ["Çerez Adı", "Kategori", "Süre", "Kullanım Amacı"],
          rows: [
            [
              "sb-auth-token",
              "Zorunlu",
              "Oturum / 7 Gün",
              "Kullanıcı güvenli oturum açma durumunu ve Supabase yetki jetonunu saklar.",
            ],
            [
              "iec_cookie_consent",
              "Zorunlu",
              "1 Yıl",
              "Kullanıcının çerez tercih ve onay seçimlerini localStorage üzerinde tutar.",
            ],
            [
              "NEXT_LOCALE",
              "Tercih",
              "1 Yıl",
              "Kullanıcının seçtiği arayüz dilini (TR, EN veya BS) hatırlar.",
            ],
            [
              "_iec_analytics",
              "Analitik (İsteğe Bağlı)",
              "30 Gün",
              "Proje sayfalarının ve blog yazılarının anonim görüntülenme oranlarını ölçer.",
            ],
          ],
        },
      },
      {
        id: "manage",
        heading: "3. Çerez Tercihlerini Değiştirme",
        paragraphs: [
          [
            "Platformun alt kısmında yer alan çerez banner'ı üzerinden veya tarayıcı ayarlarınızdan (Chrome, Firefox, Safari vb.) çerezleri dilediğiniz zaman silebilir veya isteğe bağlı analitik çerezleri engelleyebilirsiniz.",
          ],
        ],
      },
    ],
  },
};

const en: LegalDictionary = {
  kvkk: {
    metaTitle: "KVKK Privacy Notice",
    metaDescription:
      "Privacy notice on the personal data processed in the course of IUS Engineering Club's activities, the legal grounds and the rights of data subjects.",
    noticeTitle: "Legal Review Required (Draft Privacy Notice)",
    notice: [
      "This KVKK privacy notice is a draft. Users' explicit consent and approval records are stored in the ",
      { code: "consent_logs" },
      " table of our database together with a timestamp and version information. Approval from the legal department must be obtained before it officially takes effect.",
    ],
    title: "KVKK & GDPR Privacy Notice",
    versionLine: "Document version: v1.0 • Last revised: October 2026",
    sections: [
      {
        id: "purpose",
        icon: "scale",
        heading: "1. Purpose of This Notice",
        paragraphs: [
          [
            "In accordance with Law No. 6698 on the Protection of Personal Data (\"KVKK\") and the data protection legislation of Bosnia and Herzegovina, this notice informs you of the conditions under which your personal data, obtained in the course of the activities carried out by IUS Engineering Club, is processed.",
          ],
        ],
      },
      {
        id: "data",
        icon: "database",
        heading: "2. Personal Data Processed and Legal Grounds",
        paragraphs: [
          [
            "The identity, contact, student number and academic department information provided when registering on the platform is processed for the purposes of establishing club membership, organising events and complying with university regulations, under Article 5(2)(c) and Article 5(2)(f) of the KVKK.",
          ],
        ],
      },
      {
        id: "consent",
        icon: "check",
        heading: "3. Consent Record and Digital Proof (Consent Logs)",
        paragraphs: [
          [
            "When the KVKK consent box on the membership or application form is ticked, it is cryptographically recorded in the system records (",
            { code: "consent_logs" },
            ") together with the user's user ID (user_id), the approved document version (document_version: \"v1.0\"), the IP address and a timestamp (consented_at).",
          ],
        ],
      },
      {
        id: "rights",
        heading: "4. Rights of the Data Subject",
        paragraphs: [
          [
            "Every member and visitor has the right, at any time, to apply to the club management to request that their personal data be deleted or updated, or to ask about the status of its processing. Requests can be sent directly to ",
            { strong: CONTACT_EMAIL },
            ".",
          ],
        ],
      },
    ],
  },
  privacy: {
    metaTitle: "Privacy Policy",
    metaDescription:
      "How personal data is collected, processed and protected on the IUS Engineering Club website and member portal.",
    noticeTitle: "Legal Review Required (Draft Document)",
    notice: [
      "This Privacy Policy is a draft placeholder prepared to describe the technical infrastructure of the IUS Engineering Club (IEC) platform. It must be reviewed by the university's legal counsel before it officially takes effect.",
    ],
    title: "Privacy Policy",
    versionLine: "Last updated: 15 October 2026 • Version: v1.0-draft",
    sections: [
      {
        id: "controller",
        icon: "lock",
        heading: "1. Data Controller and Scope",
        paragraphs: [
          [
            "IUS Engineering Club (\"IEC\" or the \"Club\"), which operates within the International University of Sarajevo (IUS), respects the privacy of the users of its website and member portal. This policy explains how the personal data of students who visit our platform or become members is collected, processed and protected.",
          ],
        ],
      },
      {
        id: "collected",
        icon: "eye",
        heading: "2. Personal Data We Collect",
        items: [
          [{ strong: "Identity and contact:" }, " First name, last name, student email address (@student.ius.edu.ba), phone number."],
          [{ strong: "Academic information:" }, " Faculty, department, year of study and technical interests."],
          [{ strong: "Events and attendance:" }, " Attendance records taken by QR code and the participation certificates issued."],
          [{ strong: "Technical data:" }, " IP address, browser type, cookie preferences and the platform's internal audit and security logs."],
        ],
      },
      {
        id: "purposes",
        icon: "file",
        heading: "3. Purposes of Processing and Sharing",
        paragraphs: [
          [
            "The data collected is processed solely to run the club's internal activities, form project teams, evaluate hackathon applications and verify certificates. Your personal data is never sold or transferred to any third-party advertising or marketing company.",
          ],
        ],
      },
      {
        id: "security",
        heading: "4. Data Security and RLS Protection",
        paragraphs: [
          [
            "All data is protected at the database level by PostgreSQL Row Level Security (RLS) policies, and member and management roles are restricted under a strict RBAC (role-based access control) model.",
          ],
        ],
      },
    ],
  },
  cookies: {
    metaTitle: "Cookie Policy",
    metaDescription:
      "The cookies used on the IUS Engineering Club web platform, what they are for, how long they last and how to change your preferences.",
    noticeTitle: "Legal Review Required (Draft Cookie Policy)",
    notice: [
      "The cookies used on our platform are listed transparently by category below. Users can disable analytics cookies at any time through the cookie banner.",
    ],
    title: "Cookie Policy",
    versionLine: "Version: v1.0 • IUS Engineering Club Web Platform",
    sections: [
      {
        id: "what",
        icon: "cookie",
        heading: "1. What Is a Cookie?",
        paragraphs: [
          [
            "Cookies are small text files saved to your device through your browser when you visit a website. On our platform, cookies are used to keep your session going, to guard against security vulnerabilities and to remember user preferences.",
          ],
        ],
      },
      {
        id: "list",
        heading: "2. Cookies Used on Our Platform",
        table: {
          caption: "Cookies used on our platform",
          columns: ["Cookie name", "Category", "Duration", "Purpose"],
          rows: [
            [
              "sb-auth-token",
              "Essential",
              "Session / 7 days",
              "Stores the user's secure sign-in state and the Supabase authorisation token.",
            ],
            [
              "iec_cookie_consent",
              "Essential",
              "1 year",
              "Keeps the user's cookie preferences and consent choices in localStorage.",
            ],
            [
              "NEXT_LOCALE",
              "Preference",
              "1 year",
              "Remembers the interface language the user selected (TR, EN or BS).",
            ],
            [
              "_iec_analytics",
              "Analytics (optional)",
              "30 days",
              "Measures anonymous view rates of project pages and blog posts.",
            ],
          ],
        },
      },
      {
        id: "manage",
        heading: "3. Changing Your Cookie Preferences",
        paragraphs: [
          [
            "You can delete cookies or block optional analytics cookies at any time through the cookie banner at the bottom of the platform or in your browser settings (Chrome, Firefox, Safari, etc.).",
          ],
        ],
      },
    ],
  },
};

const bs: LegalDictionary = {
  kvkk: {
    metaTitle: "KVKK obavještenje o zaštiti ličnih podataka",
    metaDescription:
      "Obavještenje o ličnim podacima koji se obrađuju u okviru aktivnosti IUS Engineering Cluba, pravnim osnovama i pravima lica na koja se podaci odnose.",
    noticeTitle: "Potrebna je pravna provjera (nacrt obavještenja)",
    notice: [
      "Ovo KVKK obavještenje o zaštiti ličnih podataka je nacrt. Zapisi o izričitoj saglasnosti i odobrenju korisnika čuvaju se u tabeli ",
      { code: "consent_logs" },
      " naše baze podataka, zajedno s vremenskom oznakom i podatkom o verziji. Prije službenog stupanja na snagu potrebno je pribaviti odobrenje pravne službe.",
    ],
    title: "KVKK i GDPR obavještenje o zaštiti ličnih podataka",
    versionLine: "Verzija dokumenta: v1.0 • Posljednja izmjena: oktobar 2026.",
    sections: [
      {
        id: "purpose",
        icon: "scale",
        heading: "1. Svrha ovog obavještenja",
        paragraphs: [
          [
            "U skladu sa Zakonom br. 6698 o zaštiti ličnih podataka (\"KVKK\") i propisima Bosne i Hercegovine o zaštiti podataka, ovim obavještenjem informišemo vas o uslovima pod kojima se obrađuju vaši lični podaci prikupljeni u okviru aktivnosti koje provodi IUS Engineering Club.",
          ],
        ],
      },
      {
        id: "data",
        icon: "database",
        heading: "2. Lični podaci koji se obrađuju i pravni osnovi",
        paragraphs: [
          [
            "Podaci o identitetu, kontakt podaci, broj indeksa i podaci o akademskom odsjeku, dostavljeni prilikom registracije na platformi, obrađuju se radi uspostavljanja članstva u klubu, organizacije događaja i usklađenosti s propisima univerziteta, na osnovu člana 5. stav 2. tačke c) i f) KVKK-a.",
          ],
        ],
      },
      {
        id: "consent",
        icon: "check",
        heading: "3. Evidencija saglasnosti i digitalni dokaz (Consent Logs)",
        paragraphs: [
          [
            "Kada se na formularu za članstvo ili prijavu označi polje za KVKK saglasnost, to se kriptografski bilježi u sistemskim zapisima (",
            { code: "consent_logs" },
            ") zajedno s korisničkim identifikatorom (user_id), odobrenom verzijom dokumenta (document_version: \"v1.0\"), IP adresom i vremenskom oznakom (consented_at).",
          ],
        ],
      },
      {
        id: "rights",
        heading: "4. Prava lica na koje se podaci odnose",
        paragraphs: [
          [
            "Svaki član i posjetilac ima pravo da se u bilo kojem trenutku obrati upravi kluba sa zahtjevom za brisanje ili ažuriranje svojih ličnih podataka, ili za informaciju o statusu njihove obrade. Zahtjevi se mogu poslati direktno na adresu ",
            { strong: CONTACT_EMAIL },
            ".",
          ],
        ],
      },
    ],
  },
  privacy: {
    metaTitle: "Politika privatnosti",
    metaDescription:
      "Kako se lični podaci prikupljaju, obrađuju i štite na web stranici i portalu za članove IUS Engineering Cluba.",
    noticeTitle: "Potrebna je pravna provjera (nacrt dokumenta)",
    notice: [
      "Ova Politika privatnosti je privremeni nacrt pripremljen da opiše tehničku infrastrukturu platforme IUS Engineering Cluba (IEC). Prije službenog stupanja na snagu mora je pregledati pravna služba univerziteta.",
    ],
    title: "Politika privatnosti",
    versionLine: "Posljednje ažuriranje: 15. oktobar 2026. • Verzija: v1.0-draft",
    sections: [
      {
        id: "controller",
        icon: "lock",
        heading: "1. Kontrolor podataka i obim",
        paragraphs: [
          [
            "IUS Engineering Club (\"IEC\" ili \"Klub\"), koji djeluje u okviru Internacionalnog univerziteta u Sarajevu (IUS), poštuje privatnost korisnika svoje web stranice i portala za članove. Ova politika objašnjava kako se prikupljaju, obrađuju i štite lični podaci studenata koji posjećuju našu platformu ili postanu članovi.",
          ],
        ],
      },
      {
        id: "collected",
        icon: "eye",
        heading: "2. Lični podaci koje prikupljamo",
        items: [
          [{ strong: "Identitet i kontakt:" }, " Ime, prezime, studentska e-mail adresa (@student.ius.edu.ba), broj telefona."],
          [{ strong: "Akademski podaci:" }, " Fakultet, odsjek, godina studija i tehnička interesovanja."],
          [{ strong: "Događaji i prisustvo:" }, " Evidencija prisustva putem QR koda i izdati certifikati o učešću."],
          [{ strong: "Tehnički podaci:" }, " IP adresa, vrsta preglednika, postavke kolačića te interni zapisi platforme o reviziji (audit) i sigurnosti."],
        ],
      },
      {
        id: "purposes",
        icon: "file",
        heading: "3. Svrhe obrade i dijeljenje podataka",
        paragraphs: [
          [
            "Prikupljeni podaci obrađuju se isključivo radi provođenja internih aktivnosti kluba, formiranja projektnih timova, ocjenjivanja prijava za hackathone i provjere certifikata. Vaši lični podaci nikada se ne prodaju niti prenose bilo kojoj trećoj strani koja se bavi oglašavanjem ili marketingom.",
          ],
        ],
      },
      {
        id: "security",
        heading: "4. Sigurnost podataka i RLS zaštita",
        paragraphs: [
          [
            "Svi podaci zaštićeni su na nivou baze podataka pravilima PostgreSQL Row Level Security (RLS), a uloge članova i uprave ograničene su strogim RBAC modelom (kontrola pristupa zasnovana na ulogama).",
          ],
        ],
      },
    ],
  },
  cookies: {
    metaTitle: "Politika kolačića",
    metaDescription:
      "Kolačići koji se koriste na web platformi IUS Engineering Cluba, njihova svrha, trajanje i način na koji možete promijeniti svoje postavke.",
    noticeTitle: "Potrebna je pravna provjera (nacrt politike kolačića)",
    notice: [
      "Kolačići koji se koriste na našoj platformi transparentno su razvrstani po kategorijama u nastavku. Korisnici u bilo kojem trenutku mogu isključiti analitičke kolačiće putem banera za kolačiće.",
    ],
    title: "Politika kolačića",
    versionLine: "Verzija: v1.0 • Web platforma IUS Engineering Cluba",
    sections: [
      {
        id: "what",
        icon: "cookie",
        heading: "1. Šta je kolačić (cookie)?",
        paragraphs: [
          [
            "Kolačići su male tekstualne datoteke koje se putem vašeg preglednika pohranjuju na vaš uređaj kada posjetite web stranicu. Na našoj platformi kolačići se koriste za održavanje sesije, zaštitu od sigurnosnih propusta i pamćenje korisničkih postavki.",
          ],
        ],
      },
      {
        id: "list",
        heading: "2. Kolačići koji se koriste na našoj platformi",
        table: {
          caption: "Kolačići koji se koriste na našoj platformi",
          columns: ["Naziv kolačića", "Kategorija", "Trajanje", "Svrha"],
          rows: [
            [
              "sb-auth-token",
              "Neophodan",
              "Sesija / 7 dana",
              "Čuva stanje sigurne prijave korisnika i Supabase token za autorizaciju.",
            ],
            [
              "iec_cookie_consent",
              "Neophodan",
              "1 godina",
              "Čuva korisnikove postavke kolačića i izbore saglasnosti u localStorage.",
            ],
            [
              "NEXT_LOCALE",
              "Postavke",
              "1 godina",
              "Pamti jezik interfejsa koji je korisnik odabrao (TR, EN ili BS).",
            ],
            [
              "_iec_analytics",
              "Analitički (neobavezan)",
              "30 dana",
              "Anonimno mjeri broj pregleda stranica projekata i blog objava.",
            ],
          ],
        },
      },
      {
        id: "manage",
        heading: "3. Promjena postavki kolačića",
        paragraphs: [
          [
            "Kolačiće možete u bilo kojem trenutku izbrisati ili blokirati neobavezne analitičke kolačiće putem banera za kolačiće na dnu platforme ili u postavkama svog preglednika (Chrome, Firefox, Safari itd.).",
          ],
        ],
      },
    ],
  },
};

export const legalText = { tr, en, bs };
