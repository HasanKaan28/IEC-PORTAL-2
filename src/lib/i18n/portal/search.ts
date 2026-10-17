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

/** Bosnian plural form for a count: 1 (and 21, 31...), 2-4 (and 22-24...), 5+ and 11-14. */
function bsPlural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

const bs: typeof tr = {
  label: "Pretraži portal",
  placeholder: "Traži projekte, zadatke, događaje ili članove",
  openSearch: "Otvori pretragu",
  closeSearch: "Zatvori",
  clear: "Očisti pretragu",
  shortcutHint: "Prečica",
  resultsLabel: "Rezultati pretrage",
  groups: {
    pages: "Stranice",
    projects: "Projekti",
    tasks: "Zadaci",
    events: "Događaji",
    hackathons: "Hackathoni",
    members: "Članovi",
  },
  typeToSearch: "Upiši najmanje 2 slova da pretražiš projekte, zadatke, događaje, hackathone i članove.",
  searching: "Pretraga...",
  noResults: (query: string) => `Nema rezultata za "${query}".`,
  resultCount: (count: number) => `${count} ${bsPlural(count, "rezultat", "rezultata", "rezultata")}`,
  keyboardHint: "Enter za otvaranje, Esc za zatvaranje",
  noProject: "Bez projekta",
  openCard: "Otvori profilnu karticu",
  errors: {
    invalidQuery: "Pretraga mora imati između 2 i 80 znakova.",
    rateLimited: "Prečesto pretražuješ. Pokušaj ponovo za nekoliko minuta.",
  },
};

export const portalSearchText = { tr, en, bs };
export type PortalSearchText = typeof tr;
