import type { Permission } from "./permissions";

type Bilingual = { tr: string; en: string };

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
    label: { tr: "Görevler sayfası", en: "Tasks page" },
    description: { tr: "Görev panosunu görür, kendi görevlerini açar ve günceller.", en: "Sees the task board, creates and updates their own tasks." },
    page: { tr: "Görevlerim", en: "My tasks" },
  },
  "pages.projects": {
    label: { tr: "Projeler sayfası", en: "Projects page" },
    description: { tr: "Kulüp projelerini görür ve projelere katılım isteği gönderir.", en: "Sees club projects and sends join requests." },
    page: { tr: "Projeler", en: "Projects" },
  },
  "pages.hackathons": {
    label: { tr: "Hackathonlar sayfası", en: "Hackathons page" },
    description: { tr: "Hackathon ilanlarını görür, takım kurar ve takımlara katılır.", en: "Sees hackathon listings, builds and joins teams." },
    page: { tr: "Hackathonlar", en: "Hackathons" },
  },
  "pages.events": {
    label: { tr: "Etkinlikler sayfası", en: "Events page" },
    description: { tr: "Etkinlik takvimini görür ve QR kodla yoklama verir.", en: "Sees the events calendar and checks in with the QR code." },
    page: { tr: "Etkinlikler", en: "Events" },
  },
  "pages.certificates": {
    label: { tr: "Sertifikalar sayfası", en: "Certificates page" },
    description: { tr: "Kendi sertifikalarını görür ve indirir.", en: "Sees and downloads their own certificates." },
    page: { tr: "Sertifikalarım", en: "My certificates" },
  },
  "pages.messages": {
    label: { tr: "Mesajlar sayfası", en: "Messages page" },
    description: { tr: "Diğer üyelerle birebir mesajlaşır.", en: "Messages other members one to one." },
    page: { tr: "Mesajlar", en: "Messages" },
  },
  "roles.manage": {
    label: { tr: "Rolleri yönet", en: "Manage roles" },
    description: {
      tr: "Üyelere kendinden alt rolleri ve izin verilen özel rolleri atar.",
      en: "Assigns lower built-in roles and permitted custom roles to members.",
    },
    page: { tr: "Yönetici Konsolu: Roller", en: "Admin console: Roles" },
  },
  "emails.view": {
    label: { tr: "E-posta şablonlarını gör", en: "View email templates" },
    description: {
      tr: "Kulübün otomatik gönderdiği e-postaların şablonlarını önizler.",
      en: "Previews the templates of the emails the club sends automatically.",
    },
    page: { tr: "Yönetici Konsolu: E-posta şablonları", en: "Admin console: Email templates" },
  },
  "audit.view": {
    label: { tr: "Denetim günlüğünü gör", en: "View audit log" },
    description: {
      tr: "Rol değişiklikleri ve yönetim işlemlerinin kayıtlarını okur.",
      en: "Reads the record of role changes and admin actions.",
    },
    page: { tr: "Yönetici Konsolu: Denetim", en: "Admin console: Audit log" },
  },
  "applications.review": {
    label: { tr: "Başvuruları incele", en: "Review applications" },
    description: {
      tr: "Üyelik başvurularının toplandığı Google Form yanıtlarına ulaşır.",
      en: "Opens the Google Form responses where membership applications arrive.",
    },
    page: { tr: "Yönetici Konsolu: Başvurular", en: "Admin console: Applications" },
  },
  "planning.manage": {
    label: { tr: "Planlamayı yönet", en: "Manage the plan" },
    description: {
      tr: "Hakkımızda sayfasındaki dört haftalık aylık planı düzenler.",
      en: "Edits the four-week monthly plan on the About page.",
    },
    page: { tr: "Yönetim: Planlama", en: "Management: Planning" },
  },
  "projects.create": {    label: { tr: "Proje oluştur", en: "Create projects" },
    description: { tr: "Yeni kulüp projesi açar ve projenin lideri olur.", en: "Opens new club projects and becomes their lead." },
    page: { tr: "Projeler", en: "Projects" },
  },
  "projects.edit": {
    label: { tr: "Projeleri düzenle", en: "Edit projects" },
    description: { tr: "Proje bilgilerini ve üyelerini günceller.", en: "Updates project details and members." },
    page: { tr: "Projeler", en: "Projects" },
  },
  "projects.review_requests": {
    label: { tr: "Katılım isteklerini değerlendir", en: "Review join requests" },
    description: {
      tr: "Tüm projelere gelen katılım isteklerini onaylar ya da reddeder.",
      en: "Approves or rejects join requests for every project.",
    },
    page: { tr: "Projeler: Katılım istekleri", en: "Projects: Join requests" },
  },
  "tasks.assign": {
    label: { tr: "Görev ata", en: "Assign tasks" },
    description: { tr: "Görevleri başka üyelere atar.", en: "Assigns tasks to other members." },
    page: { tr: "Görevler", en: "Tasks" },
  },
  "tasks.manage": {
    label: { tr: "Görevleri yönet", en: "Manage tasks" },
    description: {
      tr: "Herkesin görevinin durumunu ve önceliğini değiştirir, görev siler.",
      en: "Changes the status and priority of anyone's task and deletes tasks.",
    },
    page: { tr: "Görevler", en: "Tasks" },
  },
  "events.manage": {
    label: { tr: "Etkinlik oluştur", en: "Create events" },
    description: { tr: "Yeni etkinlik ve atölye ekler.", en: "Adds new events and workshops." },
    page: { tr: "Etkinlikler", en: "Events" },
  },
  "events.qr_host": {
    label: { tr: "QR yoklama yönet", en: "Run QR attendance" },
    description: {
      tr: "Canlı QR yoklama ekranını açar ve katılımcı listesini görür.",
      en: "Opens the live QR check-in screen and sees who attended.",
    },
    page: { tr: "Etkinlikler: Canlı yoklama ekranı", en: "Events: Live attendance screen" },
  },
  "certificates.issue": {
    label: { tr: "Sertifika düzenle", en: "Issue certificates" },
    description: { tr: "Katılımcılara sertifika verir.", en: "Issues certificates to attendees." },
    page: { tr: "Etkinlikler, Sertifikalar", en: "Events, Certificates" },
  },
  "hackathons.create": {
    label: { tr: "Hackathon ekle", en: "Add hackathons" },
    description: { tr: "Hackathon ilanı ekler.", en: "Posts hackathon listings." },
    page: { tr: "Hackathonlar", en: "Hackathons" },
  },
  "blog.write": {
    label: { tr: "Blog yazısı yaz", en: "Write blog posts" },
    description: { tr: "Taslak blog yazısı oluşturur ve kendi taslaklarını düzenler.", en: "Creates draft posts and edits their own drafts." },
    page: { tr: "Yönetici Konsolu: Blog", en: "Admin console: Blog" },
  },
  "blog.publish": {
    label: { tr: "Blog yazısı yayınla", en: "Publish blog posts" },
    description: { tr: "Yazıları yayınlar ve tüm yazıları düzenler.", en: "Publishes posts and edits every post." },
    page: { tr: "Yönetici Konsolu: Blog", en: "Admin console: Blog" },
  },
  "blog.moderate": {
    label: { tr: "Yorumları denetle", en: "Moderate comments" },
    description: { tr: "Yorumları işaretler, siler ve yazıları kaldırır.", en: "Flags and deletes comments and removes posts." },
    page: { tr: "Yönetici Konsolu: Yorumlar", en: "Admin console: Comments" },
  },
};

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    key: "pages",
    label: { tr: "Sayfalar (Genel bakış ve Profilim her zaman açık)", en: "Pages (Overview and My profile are always open)" },
    permissions: ["pages.tasks", "pages.projects", "pages.hackathons", "pages.events", "pages.certificates", "pages.messages"],
  },
  {
    key: "management",
    label: { tr: "Yönetim", en: "Management" },
    permissions: ["roles.manage", "emails.view", "audit.view", "applications.review", "planning.manage"],
  },
  {
    key: "projects",
    label: { tr: "Projeler ve görevler", en: "Projects and tasks" },
    permissions: ["projects.create", "projects.edit", "projects.review_requests", "tasks.assign", "tasks.manage"],
  },
  {
    key: "events",
    label: { tr: "Etkinlikler ve hackathonlar", en: "Events and hackathons" },
    permissions: ["events.manage", "events.qr_host", "certificates.issue", "hackathons.create"],
  },
  {
    key: "blog",
    label: { tr: "Blog", en: "Blog" },
    permissions: ["blog.write", "blog.publish", "blog.moderate"],
  },
];

/** Colour keys a custom role can use; the UI maps them to palette classes. */
export const CUSTOM_ROLE_COLORS = ["brand", "accent", "emerald", "rose", "slate"] as const;
export type CustomRoleColor = (typeof CUSTOM_ROLE_COLORS)[number];

export function isCustomRoleColor(value: unknown): value is CustomRoleColor {
  return typeof value === "string" && (CUSTOM_ROLE_COLORS as readonly string[]).includes(value);
}
