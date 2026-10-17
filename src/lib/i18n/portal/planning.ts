/** Portal planning page (Management > Planning) and the plan section of the About page. */
const tr = {
  page: {
    metaTitle: "Planlama",
    title: "Aylık plan",
    intro: "Hakkımızda sayfasında görünen bir aylık planı dört hafta halinde düzenle. Kaydettiğin anda sitede güncellenir.",
    viewOnSite: "Sitede gör",
    notSetUp:
      "Plan tablosu henüz veritabanında yok, şu an varsayılan plan gösteriliyor. Değişiklikleri kaydedebilmek için planlama migration'ını Supabase'de çalıştır.",
    startLabel: "Planın başladığı gün",
    startHint: "Her hafta yedi gün sürer. 1. hafta bu günle başlar, 4. hafta 28. günde biter.",
    weekLabel: (n: number) => `${n}. hafta`,
    titleTr: "Başlık (Türkçe)",
    titleEn: "Başlık (İngilizce, isteğe bağlı)",
    bodyTr: "Açıklama (Türkçe)",
    bodyEn: "Açıklama (İngilizce, isteğe bağlı)",
    englishSection: "İngilizce metin",
    englishHint: "İngilizce boş kalırsa İngilizce sayfada Türkçe metin görünür.",
    statusLabel: "Durum",
    statusOptions: {
      auto: "Otomatik (tarihe göre)",
      planned: "Planlandı",
      active: "Devam ediyor",
      done: "Tamamlandı",
    },
    autoNow: (label: string) => `Şu an: ${label}`,
    save: "Planı kaydet",
    saving: "Kaydediliyor...",
    saved: "Plan kaydedildi. Hakkımızda sayfası güncellendi.",
    lastUpdated: (when: string) => `Son güncelleme: ${when}`,
    reset: "Değişiklikleri geri al",
  },
  errors: {
    invalid: "Bilgileri kontrol et: her haftanın Türkçe başlığı olmalı ve metinler çok uzun olmamalı.",
    invalidDate: "Geçerli bir başlangıç tarihi seç.",
    notSetUp: "Plan tablosu bulunamadı. Önce planlama migration'ını Supabase'de çalıştır.",
    failed: "Plan kaydedilemedi. Lütfen tekrar dene.",
  },
  about: {
    title: "Bu ayın planı",
    subtitle: (month: string) => `${month} için dört haftalık çalışma planımız.`,
    week: (n: number) => `${n}. hafta`,
    statusDone: "Tamamlandı",
    statusActive: "Devam ediyor",
    statusPlanned: "Planlandı",
  },
};

const en: typeof tr = {
  page: {
    metaTitle: "Planning",
    title: "Monthly plan",
    intro: "Edit the one-month plan shown on the About page, week by week. Saving updates the site straight away.",
    viewOnSite: "View on site",
    notSetUp:
      "The plan table does not exist in the database yet, so the default plan is shown. Run the planning migration in Supabase to be able to save changes.",
    startLabel: "Plan start date",
    startHint: "Each week lasts seven days. Week 1 starts on this day and week 4 ends on day 28.",
    weekLabel: (n: number) => `Week ${n}`,
    titleTr: "Title (Turkish)",
    titleEn: "Title (English, optional)",
    bodyTr: "Description (Turkish)",
    bodyEn: "Description (English, optional)",
    englishSection: "English text",
    englishHint: "If English is left empty, the English page shows the Turkish text.",
    statusLabel: "Status",
    statusOptions: {
      auto: "Automatic (by date)",
      planned: "Planned",
      active: "In progress",
      done: "Done",
    },
    autoNow: (label: string) => `Right now: ${label}`,
    save: "Save plan",
    saving: "Saving...",
    saved: "Plan saved. The About page is up to date.",
    lastUpdated: (when: string) => `Last updated: ${when}`,
    reset: "Undo changes",
  },
  errors: {
    invalid: "Check the details: every week needs a Turkish title and the texts must not be too long.",
    invalidDate: "Choose a valid start date.",
    notSetUp: "The plan table was not found. Run the planning migration in Supabase first.",
    failed: "The plan could not be saved. Please try again.",
  },
  about: {
    title: "This month's plan",
    subtitle: (month: string) => `Our four-week plan for ${month}.`,
    week: (n: number) => `Week ${n}`,
    statusDone: "Done",
    statusActive: "In progress",
    statusPlanned: "Planned",
  },
};

export const planningText = { tr, en };
export type PlanningText = typeof tr;
