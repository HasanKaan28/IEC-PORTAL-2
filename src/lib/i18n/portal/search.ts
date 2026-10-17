/** Portal header search: field, result groups and states. */
const tr = {
  label: "Portalda ara",
  placeholder: "Proje, görev, etkinlik veya üye ara",
  openSearch: "Aramayı aç",
  closeSearch: "Kapat",
  clear: "Aramayı temizle",
  shortcutHint: "Kısayol",
  resultsLabel: "Arama sonuçları",
  groups: {
    pages: "Sayfalar",
    projects: "Projeler",
    tasks: "Görevler",
    events: "Etkinlikler",
    hackathons: "Hackathonlar",
    members: "Üyeler",
  },
  typeToSearch: "Proje, görev, etkinlik, hackathon ve üye aramak için en az 2 harf yaz.",
  searching: "Aranıyor...",
  noResults: (query: string) => `"${query}" için sonuç bulunamadı.`,
  resultCount: (count: number) => `${count} sonuç`,
  keyboardHint: "Açmak için Enter, kapatmak için Esc",
  noProject: "Projesiz",
  openCard: "Profil kartını aç",
  errors: {
    invalidQuery: "Arama 2 ile 80 karakter arasında olmalı.",
    rateLimited: "Çok sık arama yaptın. Birkaç dakika sonra tekrar dene.",
  },
};

const en: typeof tr = {
  label: "Search the portal",
  placeholder: "Search projects, tasks, events or members",
  openSearch: "Open search",
  closeSearch: "Close",
  clear: "Clear search",
  shortcutHint: "Shortcut",
  resultsLabel: "Search results",
  groups: {
    pages: "Pages",
    projects: "Projects",
    tasks: "Tasks",
    events: "Events",
    hackathons: "Hackathons",
    members: "Members",
  },
  typeToSearch: "Type at least 2 letters to search projects, tasks, events, hackathons and members.",
  searching: "Searching...",
  noResults: (query: string) => `No results for "${query}".`,
  resultCount: (count: number) => (count === 1 ? "1 result" : `${count} results`),
  keyboardHint: "Enter to open, Esc to close",
  noProject: "No project",
  openCard: "Open profile card",
  errors: {
    invalidQuery: "Search must be between 2 and 80 characters.",
    rateLimited: "You are searching too often. Try again in a few minutes.",
  },
};

export const portalSearchText = { tr, en };
export type PortalSearchText = typeof tr;
