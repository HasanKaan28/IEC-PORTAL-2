import type { Permission } from "./permissions";

type Bilingual = { tr: string; en: string; bs: string };

export interface PermissionInfo {
  label: Bilingual;
  /** What the permission lets a member do, in one sentence. */
  description: Bilingual;
  /** The portal page this permission opens or adds controls to. */
  page: Bilingual;
}

export interface PermissionGroup {
  key: string;
  label: Bilingual;
  permissions: Permission[];
}

/** Human-readable catalogue of every permission, shown in the role builder. */
export const PERMISSION_INFO: Record<Permission, PermissionInfo> = {
  "pages.tasks": {
    label: { tr: "Görevler sayfası", en: "Tasks page", bs: "Stranica zadataka" },
    description: {
      tr: "Görev panosunu görür, kendi görevlerini açar ve günceller.",
      en: "Sees the task board, creates and updates their own tasks.",
      bs: "Vidi tablu zadataka, kreira i ažurira svoje zadatke.",
    },
    page: { tr: "Görevlerim", en: "My tasks", bs: "Moji zadaci" },
  },
  "pages.projects": {
    label: { tr: "Projeler sayfası", en: "Projects page", bs: "Stranica projekata" },
    description: {
      tr: "Kulüp projelerini görür ve projelere katılım isteği gönderir.",
      en: "Sees club projects and sends join requests.",
      bs: "Vidi projekte kluba i šalje zahtjeve za pridruživanje.",
    },
    page: { tr: "Projeler", en: "Projects", bs: "Projekti" },
  },
  "pages.hackathons": {
    label: { tr: "Hackathonlar sayfası", en: "Hackathons page", bs: "Stranica hackathona" },
    description: {
      tr: "Hackathon ilanlarını görür, takım kurar ve takımlara katılır.",
      en: "Sees hackathon listings, builds and joins teams.",
      bs: "Vidi oglase za hackathone, pravi timove i pridružuje se timovima.",
    },
    page: { tr: "Hackathonlar", en: "Hackathons", bs: "Hackathoni" },
  },
  "pages.events": {
    label: { tr: "Etkinlikler sayfası", en: "Events page", bs: "Stranica događaja" },
    description: {
      tr: "Etkinlik takvimini görür ve QR kodla yoklama verir.",
      en: "Sees the events calendar and checks in with the QR code.",
      bs: "Vidi kalendar događaja i prijavljuje prisustvo QR kodom.",
    },
    page: { tr: "Etkinlikler", en: "Events", bs: "Događaji" },
  },
  "pages.certificates": {
    label: { tr: "Sertifikalar sayfası", en: "Certificates page", bs: "Stranica certifikata" },
    description: {
      tr: "Kendi sertifikalarını görür ve indirir.",
      en: "Sees and downloads their own certificates.",
      bs: "Vidi i preuzima svoje certifikate.",
    },
    page: { tr: "Sertifikalarım", en: "My certificates", bs: "Moji certifikati" },
  },
  "pages.messages": {
    label: { tr: "Mesajlar sayfası", en: "Messages page", bs: "Stranica poruka" },
    description: {
      tr: "Diğer üyelerle birebir mesajlaşır.",
      en: "Messages other members one to one.",
      bs: "Dopisuje se s drugim članovima jedan na jedan.",
    },
    page: { tr: "Mesajlar", en: "Messages", bs: "Poruke" },
  },
  "roles.manage": {
    label: { tr: "Rolleri yönet", en: "Manage roles", bs: "Upravljanje ulogama" },
    description: {
      tr: "Üyelere kendinden alt rolleri ve izin verilen özel rolleri atar.",
      en: "Assigns lower built-in roles and permitted custom roles to members.",
      bs: "Dodjeljuje članovima niže ugrađene uloge i dozvoljene prilagođene uloge.",
    },
    page: { tr: "Yönetici Konsolu: Roller", en: "Admin console: Roles", bs: "Administratorska konzola: Uloge" },
  },
  "emails.view": {
    label: { tr: "E-posta şablonlarını gör", en: "View email templates", bs: "Pregled šablona e-pošte" },
    description: {
      tr: "Kulübün otomatik gönderdiği e-postaların şablonlarını önizler.",
      en: "Previews the templates of the emails the club sends automatically.",
      bs: "Pregleda šablone e-poruka koje klub automatski šalje.",
    },
    page: {
      tr: "Yönetici Konsolu: E-posta şablonları",
      en: "Admin console: Email templates",
      bs: "Administratorska konzola: Šabloni e-pošte",
    },
  },
  "audit.view": {
    label: { tr: "Denetim günlüğünü gör", en: "View audit log", bs: "Pregled zapisnika aktivnosti" },
    description: {
      tr: "Rol değişiklikleri ve yönetim işlemlerinin kayıtlarını okur.",
      en: "Reads the record of role changes and admin actions.",
      bs: "Čita evidenciju promjena uloga i administratorskih radnji.",
    },
    page: {
      tr: "Yönetici Konsolu: Denetim",
      en: "Admin console: Audit log",
      bs: "Administratorska konzola: Zapisnik aktivnosti",
    },
  },
  "applications.review": {
    label: { tr: "Başvuruları incele", en: "Review applications", bs: "Pregled prijava" },
    description: {
      tr: "Üyelik başvurularının toplandığı Google Form yanıtlarına ulaşır.",
      en: "Opens the Google Form responses where membership applications arrive.",
      bs: "Otvara odgovore iz Google Forme u koje stižu prijave za članstvo.",
    },
    page: {
      tr: "Yönetici Konsolu: Başvurular",
      en: "Admin console: Applications",
      bs: "Administratorska konzola: Prijave",
    },
  },
  "planning.manage": {
    label: { tr: "Planlamayı yönet", en: "Manage the plan", bs: "Upravljanje planom" },
    description: {
      tr: "Hakkımızda sayfasındaki dört haftalık aylık planı düzenler.",
      en: "Edits the four-week monthly plan on the About page.",
      bs: "Uređuje mjesečni plan od četiri sedmice na stranici O nama.",
    },
    page: { tr: "Yönetim: Planlama", en: "Management: Planning", bs: "Upravljanje: Planiranje" },
  },
  "projects.create": {
    label: { tr: "Proje oluştur", en: "Create projects", bs: "Kreiranje projekata" },
    description: {
      tr: "Yeni kulüp projesi açar ve projenin lideri olur.",
      en: "Opens new club projects and becomes their lead.",
      bs: "Otvara nove projekte kluba i postaje njihov voditelj.",
    },
    page: { tr: "Projeler", en: "Projects", bs: "Projekti" },
  },
  "projects.edit": {
    label: { tr: "Projeleri düzenle", en: "Edit projects", bs: "Uređivanje projekata" },
    description: {
      tr: "Proje bilgilerini ve üyelerini günceller.",
      en: "Updates project details and members.",
      bs: "Ažurira podatke o projektima i njihove članove.",
    },
    page: { tr: "Projeler", en: "Projects", bs: "Projekti" },
  },
  "projects.review_requests": {
    label: {
      tr: "Katılım isteklerini değerlendir",
      en: "Review join requests",
      bs: "Pregled zahtjeva za pridruživanje",
    },
    description: {
      tr: "Tüm projelere gelen katılım isteklerini onaylar ya da reddeder.",
      en: "Approves or rejects join requests for every project.",
      bs: "Odobrava ili odbija zahtjeve za pridruživanje svim projektima.",
    },
    page: {
      tr: "Projeler: Katılım istekleri",
      en: "Projects: Join requests",
      bs: "Projekti: Zahtjevi za pridruživanje",
    },
  },
  "tasks.assign": {
    label: { tr: "Görev ata", en: "Assign tasks", bs: "Dodjela zadataka" },
    description: {
      tr: "Görevleri başka üyelere atar.",
      en: "Assigns tasks to other members.",
      bs: "Dodjeljuje zadatke drugim članovima.",
    },
    page: { tr: "Görevler", en: "Tasks", bs: "Zadaci" },
  },
  "tasks.manage": {
    label: { tr: "Görevleri yönet", en: "Manage tasks", bs: "Upravljanje zadacima" },
    description: {
      tr: "Herkesin görevinin durumunu ve önceliğini değiştirir, görev siler.",
      en: "Changes the status and priority of anyone's task and deletes tasks.",
      bs: "Mijenja status i prioritet bilo čijeg zadatka i briše zadatke.",
    },
    page: { tr: "Görevler", en: "Tasks", bs: "Zadaci" },
  },
  "events.manage": {
    label: { tr: "Etkinlik oluştur", en: "Create events", bs: "Kreiranje događaja" },
    description: {
      tr: "Yeni etkinlik ve atölye ekler.",
      en: "Adds new events and workshops.",
      bs: "Dodaje nove događaje i radionice.",
    },
    page: { tr: "Etkinlikler", en: "Events", bs: "Događaji" },
  },
  "events.qr_host": {
    label: { tr: "QR yoklama yönet", en: "Run QR attendance", bs: "Vođenje QR evidencije prisustva" },
    description: {
      tr: "Canlı QR yoklama ekranını açar ve katılımcı listesini görür.",
      en: "Opens the live QR check-in screen and sees who attended.",
      bs: "Otvara ekran za QR prijavu uživo i vidi ko je prisustvovao.",
    },
    page: {
      tr: "Etkinlikler: Canlı yoklama ekranı",
      en: "Events: Live attendance screen",
      bs: "Događaji: Ekran prisustva uživo",
    },
  },
  "certificates.issue": {
    label: { tr: "Sertifika düzenle", en: "Issue certificates", bs: "Izdavanje certifikata" },
    description: {
      tr: "Katılımcılara sertifika verir.",
      en: "Issues certificates to attendees.",
      bs: "Izdaje certifikate učesnicima.",
    },
    page: { tr: "Etkinlikler, Sertifikalar", en: "Events, Certificates", bs: "Događaji, Certifikati" },
  },
  "hackathons.create": {
    label: { tr: "Hackathon ekle", en: "Add hackathons", bs: "Dodavanje hackathona" },
    description: {
      tr: "Hackathon ilanı ekler.",
      en: "Posts hackathon listings.",
      bs: "Objavljuje oglase za hackathone.",
    },
    page: { tr: "Hackathonlar", en: "Hackathons", bs: "Hackathoni" },
  },
  "blog.write": {
    label: { tr: "Blog yazısı yaz", en: "Write blog posts", bs: "Pisanje blog objava" },
    description: {
      tr: "Taslak blog yazısı oluşturur ve kendi taslaklarını düzenler.",
      en: "Creates draft posts and edits their own drafts.",
      bs: "Kreira nacrte objava i uređuje svoje nacrte.",
    },
    page: { tr: "Yönetici Konsolu: Blog", en: "Admin console: Blog", bs: "Administratorska konzola: Blog" },
  },
  "blog.publish": {
    label: { tr: "Blog yazısı yayınla", en: "Publish blog posts", bs: "Objavljivanje blog objava" },
    description: {
      tr: "Yazıları yayınlar ve tüm yazıları düzenler.",
      en: "Publishes posts and edits every post.",
      bs: "Objavljuje tekstove i uređuje sve objave.",
    },
    page: { tr: "Yönetici Konsolu: Blog", en: "Admin console: Blog", bs: "Administratorska konzola: Blog" },
  },
  "blog.moderate": {
    label: { tr: "Yorumları denetle", en: "Moderate comments", bs: "Moderiranje komentara" },
    description: {
      tr: "Yorumları işaretler, siler ve yazıları kaldırır.",
      en: "Flags and deletes comments and removes posts.",
      bs: "Označava i briše komentare te uklanja objave.",
    },
    page: {
      tr: "Yönetici Konsolu: Yorumlar",
      en: "Admin console: Comments",
      bs: "Administratorska konzola: Komentari",
    },
  },
};

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    key: "pages",
    label: {
      tr: "Sayfalar (Genel bakış ve Profilim her zaman açık)",
      en: "Pages (Overview and My profile are always open)",
      bs: "Stranice (Pregled i Moj profil su uvijek otvoreni)",
    },
    permissions: ["pages.tasks", "pages.projects", "pages.hackathons", "pages.events", "pages.certificates", "pages.messages"],
  },
  {
    key: "management",
    label: { tr: "Yönetim", en: "Management", bs: "Upravljanje" },
    permissions: ["roles.manage", "emails.view", "audit.view", "applications.review", "planning.manage"],
  },
  {
    key: "projects",
    label: { tr: "Projeler ve görevler", en: "Projects and tasks", bs: "Projekti i zadaci" },
    permissions: ["projects.create", "projects.edit", "projects.review_requests", "tasks.assign", "tasks.manage"],
  },
  {
    key: "events",
    label: { tr: "Etkinlikler ve hackathonlar", en: "Events and hackathons", bs: "Događaji i hackathoni" },
    permissions: ["events.manage", "events.qr_host", "certificates.issue", "hackathons.create"],
  },
  {
    key: "blog",
    label: { tr: "Blog", en: "Blog", bs: "Blog" },
    permissions: ["blog.write", "blog.publish", "blog.moderate"],
  },
];

/** Colour keys a custom role can use; the UI maps them to palette classes. */
export const CUSTOM_ROLE_COLORS = ["brand", "accent", "emerald", "rose", "slate"] as const;
export type CustomRoleColor = (typeof CUSTOM_ROLE_COLORS)[number];

export function isCustomRoleColor(value: unknown): value is CustomRoleColor {
  return typeof value === "string" && (CUSTOM_ROLE_COLORS as readonly string[]).includes(value);
}
